import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
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

  @Get('treatments/department/:departmentId/not/:attendantId')
  async findAllTreatmentOpen(
    @Param('departmentId') departmentId: string,
    @Param('attendantId') attendantId: string
  ) {
    return await this.service.findAllTreatmentOpen(departmentId, attendantId);
  }

  @Get('treatments/department/:departmentId/attendant/:attendantId')
  async findAllTreatmentOpenToMeet(
    @Param('departmentId') departmentId: string,
    @Param('attendantId') attendantId: string
  ) {
    return await this.service.findAllTreatmentOpenToMeet(
      departmentId,
      attendantId
    );
  }

  @Post('toMeet')
  async toMeetSend(@Body() dto: { clientId: string; departmentId: string }) {
    return await this.service.toMeetSend(dto.clientId, dto.departmentId);
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

  @Post('sendMessage')
  async sendMessage(
    @Body()
    dto: {
      text: string;
      sendName: string;
      sendTo: string;
      treatmentId: string;
    }
  ) {
    return await this.service.sendMessage(
      dto.text,
      dto.sendName,
      dto.sendTo,
      dto.treatmentId
    );
  }

  @Get('treatments/:id')
  async findTreatment(@Param('id') id: string) {
    return await this.service.findTreatment(id);
  }
}
