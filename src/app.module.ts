import { Module } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { AppGateway } from './app.gateway';
import { Modules } from './modules/module';

@Module({
  imports: [Modules],
  controllers: [],
  providers: [AppGateway, PrismaClient]
})
export class AppModule {}
