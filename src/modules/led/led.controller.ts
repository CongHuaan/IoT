import { Controller, Get, Post, Param, ParseIntPipe, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { LedService } from './led.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('led')
@Controller('led')
export class LedController {
  constructor(private readonly ledService: LedService) {}

  @Get('paginated')
  async getPaginated(
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Res() res: Response
  ) {
    try {
      const result = await this.ledService.getPaginatedSensors(page, limit);
      res.send(result);
    } catch (err) {
      res.status(400).send('Bad Request');
    }
  }


  @Post('turn-on/:id')
  async turnOn(@Param('id', ParseIntPipe) id: number) {
    return await this.ledService.turnOn(id);
  }

  @Post('turn-off/:id')
  async turnOff(@Param('id', ParseIntPipe) id: number) {
    return await this.ledService.turnOff(id);
  }
}
