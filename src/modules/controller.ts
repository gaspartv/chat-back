import { Body, Controller, Get, Patch, Post } from '@nestjs/common';
import { AuthDto } from './dto/auth.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { Services } from './service';

@Controller('chat')
export class Controllers {
  constructor(private readonly service: Services) {}

  @Post('users')
  createUser(@Body() dto: CreateUserDto) {
    return this.service.createUser(dto);
  }

  @Post('auth')
  async login(@Body() dto: AuthDto) {
    return await this.service.login(dto.login, dto.password);
  }

  @Get('treatments')
  async findAllTreatmentOpen() {
    return await this.service.findAllTreatmentOpen();
  }

  @Get('treatments/my')
  async findAllTreatmentOpenToMeet() {
    return await this.service.findAllTreatmentOpenToMeet();
  }

  @Post('toMeet')
  async toMeetSend(@Body() dto: { clientId: string }) {
    return await this.service.toMeetSend(dto.clientId);
  }

  @Post('toMeetReceived')
  async toMeetReceived(
    @Body() dto: { treatmentId: string; attendantId: string }
  ) {
    return await this.service.toMeetReceived(dto.treatmentId, dto.attendantId);
  }

  @Patch('closed')
  async closedTreatment(@Body() dto: { treatmentId: string }) {
    return await this.service.closedTreatment(dto.treatmentId);
  }
}
