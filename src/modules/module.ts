import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaClient } from '@prisma/client';
import { Controllers } from './controller';
import { Services } from './service';

@Module({
  controllers: [Controllers],
  providers: [JwtService, Services, PrismaClient]
})
export class Modules {}
