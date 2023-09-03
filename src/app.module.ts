import { Module } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { AppControllers } from './app.controller';
import { AppGateway } from './app.gateway';
import { AppServices } from './app.service';

@Module({
  controllers: [AppControllers],
  providers: [AppGateway, PrismaClient, AppServices]
})
export class AppModule {}
