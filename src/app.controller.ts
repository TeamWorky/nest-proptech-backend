import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { readFileSync } from 'fs';
import { join } from 'path';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('openapi.json')
  getOpenApi(@Res() res: Response) {
    const openApiPath = join(__dirname, 'openapi.json');
    const openApiContent = readFileSync(openApiPath, 'utf-8');
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.parse(openApiContent));
  }
}

