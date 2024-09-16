import { Module } from '@nestjs/common';
import { SensorController } from './sensor.controller';
import { SensorService } from './sensor.service';
import { MqttService } from 'src/base/mqtt/mqtt.service';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
    imports: [TypeOrmModule.forFeature([])],
    controllers: [SensorController],
    providers: [SensorService, MqttService],
})
export class SensorModule {}