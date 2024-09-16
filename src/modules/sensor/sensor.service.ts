import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { MqttService } from 'src/base/mqtt/mqtt.service';

@Injectable()
export class SensorService {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly mqttService: MqttService,
  ) {
    this.subscribeToEsp8266Data();
  }

  async getAllSensors(): Promise<any> {
    const sql = 'SELECT * FROM data_sensor';
    try {
      const rows = await this.dataSource.query(sql);
      console.log(rows);
      return rows;
    } catch (err) {
      throw new Error('Not found');
    }
  }

  async getPaginatedSensors(
    page: number,
    limit: number,
    sortBy?: string,
    order?: string,
    searchField?: string,
    searchValue?: string,
  ) {
    // Giả sử bạn có một mảng cảm biến để phân trang
    let sensors = await this.getAllSensors();
    if (searchField && searchValue) {
      sensors = sensors.filter((sensor) =>
        String(sensor[searchField])
          .toLowerCase()
          .includes(String(searchValue).toLowerCase()),
      );
    }

    // Sắp xếp nếu có tham số sortBy và order
    if (sortBy && order) {
      sensors.sort((a, b) => {
        if (order === 'asc') {
          return a[sortBy] > b[sortBy] ? 1 : -1;
        } else {
          return a[sortBy] < b[sortBy] ? 1 : -1;
        }
      });
    }

    // Tính toán vị trí bắt đầu và kết thúc của trang
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    // Lấy dữ liệu cảm biến cho trang hiện tại
    const paginatedSensors = sensors.slice(startIndex, endIndex);

    return {
      page,
      limit,
      total: sensors.length,
      data: paginatedSensors,
    };
  }
  private subscribeToEsp8266Data() {
    this.mqttService.subscribe(
      'esp8266_data',
      async (topic: string, payload: Buffer) => {
        const data = JSON.parse(payload.toString());
        console.log(`Received data from topic ${topic}:`, data);

        // Handle the received data (e.g., save to database or process it)
        await this.processReceivedData(data);
      },
    );
  }

  private async processReceivedData(data: any) {
    try {
      const temp = new Date().toISOString().slice(0, 19).replace('T', ' ');
      const sql = `
        INSERT INTO data_sensor (temperature, humidity, light, time_updated)
        VALUES (?, ?, ?, ?)
      `;
      await this.dataSource.query(sql, [
        Number(data.temperature),
        Number(data.humidity),
        Number(data.light),
        temp,
      ]);
      console.log('Data from ESP8266 inserted into database');
    } catch (err) {
      console.error('Failed to insert data into database', err);
    }
  }

  async getLatestRecord(): Promise<any> {
    const sql = `
      SELECT * FROM data_sensor
      ORDER BY time_updated DESC
      LIMIT 1
    `;
    try {
      const rows = await this.dataSource.query(sql);
      return rows[0];
    } catch (err) {
      console.error('Failed to fetch latest sensor data', err);
      throw new Error('Failed to fetch latest sensor data');
    }
  }
}
