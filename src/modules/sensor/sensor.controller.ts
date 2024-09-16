import { Controller, Get, Post, Query, Res } from '@nestjs/common';
import { SensorService } from './sensor.service';
import { Response } from 'express';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('sensor')
@Controller('sensor')
export class SensorController {
  constructor(private readonly sensorService: SensorService) {}

  @Get('all')
  async getAll(@Res() res: Response) {
    try {
      const result = await this.sensorService.getAllSensors();
      res.send(result);
    } catch (err) {
      res.status(404).send('Not found');
    }
  }

  @Get('paginated')
  async getPaginated(
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('sortBy') sortBy: string,
    @Query('order') order: string,
    @Query('searchField') searchField: string,
    @Query('searchValue') searchValue: string,
    @Res() res: Response
  ) {
    try {
      const result = await this.sensorService.getPaginatedSensors(page, limit, sortBy, order, searchField, searchValue);
      res.send(result);
    } catch (err) {
      res.status(400).send('Bad Request');
    }
  }

}
