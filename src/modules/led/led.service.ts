import { Injectable, Inject } from '@nestjs/common';
import { MqttService } from 'src/base/mqtt/mqtt.service';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { LocalStorage } from 'node-localstorage';

@Injectable()
export class LedService {
  private localStorage: LocalStorage;
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly mqttService: MqttService,
  ) {
    this.localStorage = new LocalStorage('./scractch');
  }

  async getAllLed(): Promise<any> {
    const sql = 'SELECT * FROM data_led;';
    try {
      const rows = await this.dataSource.query(sql);
      console.log(rows);
      return rows;
    } catch (err) {
      throw new Error('Not found');
    }
  }

  async getPaginatedSensors(page: number, limit: number) {
    // Giả sử bạn có một mảng cảm biến để phân trang
    let sensors = await this.getAllLed();

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

  listStatus(): string {
    return `{
      "led1": ${this.localStorage.getItem('led1_status')},
      "led2": ${this.localStorage.getItem('led2_status')},
      "led3": ${this.localStorage.getItem('led3_status')}
    }`;
  }

  async turnOn(id: number): Promise<string> {
    const time_updated = new Date()
      .toISOString()
      .slice(0, 19)
      .replace('T', ' ');
    const mqttPromise = new Promise<void>((resolve, reject) => {
      this.mqttService.subscribe('ledesp8266_data', (topic, payload) => {
        const message = payload.toString();
        const data = JSON.parse(message);
        if (data.led_id === id && data.status === 'ON') {
          resolve(); // Xử lý xong, resolve promise
        } else {
          reject(new Error('Invalid message received'));
        }
      });
    });
    this.mqttService.publish('led_state', `{led_id: ${id}, status: "ON"}`);
    console.log('Subscribed to ledesp8266_data');
    try {
      await mqttPromise;
      let name;
      if (id == 1) {
        name = 'Đèn';
      } else if (id == 2) {
        name = 'Quạt';
      } else {
        name = 'Điều hòa';
      }
      const sql = `INSERT INTO data_led (name, time_updated, status) VALUES ('${name}', '${time_updated}', 'ON');`;
      await this.dataSource.query(sql);
      console.log('turn on led');
      return 'turn on led';
    } catch (err) {
      console.error('Error executing SQL query:', err);
      throw new Error('Error turning on LED');
    }
  }

  async turnOff(id: number): Promise<string> {
    const time_updated = new Date()
      .toISOString()
      .slice(0, 19)
      .replace('T', ' ');
    const mqttPromise = new Promise<void>((resolve, reject) => {
      this.mqttService.subscribe('ledesp8266_data', (topic, payload) => {
        const message = payload.toString();
        const data = JSON.parse(message);
        if (data.led_id === id && data.status === 'OFF') {
          resolve(); // Xử lý xong, resolve promise
        } else {
          reject(new Error('Invalid message received'));
        }
      });
    });
    this.mqttService.publish('led_state', `{led_id: ${id}, status: "OFF"}`);

    try {
      await mqttPromise;
      let name;
      if (id == 1) {
        name = 'Đèn';
      } else if (id == 2) {
        name = 'Quạt';
      } else {
        name = 'Điều hòa';
      }
      const sql = `INSERT INTO data_led (name, time_updated, status) VALUES ('${name}', '${time_updated}', 'OFF');`;
      await this.dataSource.query(sql);
      console.log('turn off led');
      return 'turn off led';
    } catch (err) {
      console.error('Error executing SQL query:', err);
      throw new Error('Error turning on LED');
    }
  }
}
