import { Controller, Get, Post, Param, ParseIntPipe, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { LedService } from './led.service';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';

@ApiTags('led')
@Controller('led')
export class LedController {
  constructor(private readonly ledService: LedService) {}

  @Get('paginated')
  @ApiOperation({ summary: 'Phân trang' })
  @ApiQuery({ name: 'page', required: true, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: true, description: 'Number of items per page' })
  @ApiResponse({ status: 200, description: 'Successful response' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
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

  @Get('status')
  @ApiOperation({ summary: 'Lấy status của thiết bị' })
  @ApiResponse({ status: 200, description: 'Successful response' })
  listStatus() {
    return this.ledService.listStatus();
  }

  @Post('turn-on/:id')
  @ApiOperation({ summary: 'Bật thiết bị' })
  @ApiParam({ name: 'id', required: true, description: 'ID of the LED to turn on' })
  @ApiResponse({ status: 200, description: 'Successful response' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  async turnOn(@Param('id', ParseIntPipe) id: number) {
    return await this.ledService.turnOn(id);
  }

  @Post('turn-off/:id')
  @ApiOperation({ summary: 'Tắt thiết bị' })
  @ApiParam({ name: 'id', required: true, description: 'ID of the LED to turn off' })
  @ApiResponse({ status: 200, description: 'Successful response' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  async turnOff(@Param('id', ParseIntPipe) id: number) {
    return await this.ledService.turnOff(id);
  }
}