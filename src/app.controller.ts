import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { AppServices } from './app.service';

@Controller('api')
export class AppControllers {
  constructor(private readonly service: AppServices) {}

  @Post('auth')
  async login(@Body() dto: { login: string }) {
    return await this.service.login(dto.login);
  }

  @Post('users')
  create_user(@Body() dto: { name: string; login: string }) {
    return this.service.create_user(dto);
  }

  /// BUSCAR TODOS OS ATENDIMENTOS ABERTOS
  /// NO DEPARTAMENTO 'departmentId'
  /// QUE O CLIENTE NÃO SEJA O 'attendantId'
  /// QUE NÃO TENHA ATENDENTE
  @Get('chat/department/:departmentId/notAttendant/:attendantId')
  async find_all_open_unattended_chats(
    @Param('departmentId') departmentId: string,
    @Param('attendantId') attendantId: string
  ) {
    return await this.service.find_all_open_unattended_chats(
      departmentId,
      attendantId
    );
  }

  /// BUSCAR TODOS OS ATENDIMENTOS ABERTOS
  /// NO DEPARTAMENTO 'departmentId'
  /// QUE TENHA O ATENDENTE OU O CLIENTE COMO 'attendantId'
  @Get('chat/department/:departmentId/attendant/:attendantId')
  async find_all_open_chats_im_part_of(
    @Param('departmentId') departmentId: string,
    @Param('attendantId') attendantId: string
  ) {
    return await this.service.find_all_open_chats_im_part_of(
      departmentId,
      attendantId
    );
  }

  // ENVIAR MENSAGEM
  @Post('message/send')
  async send_message(
    @Body()
    dto: {
      text: string;
      sendName: string;
      sendTo: string;
      treatmentId: string;
    }
  ) {
    return await this.service.send_message(
      dto.text,
      dto.sendName,
      dto.sendTo,
      dto.treatmentId
    );
  }

  // ABRIR UM ATENDIMENTO
  @Post('chat/open')
  async open_chat(@Body() dto: { clientId: string; departmentId: string }) {
    return await this.service.open_chat(dto.clientId, dto.departmentId);
  }

  // BUSCAR UM ATENDIMENTO
  @Get('chat/:id')
  async find_one_chat(@Param('id') id: string) {
    return await this.service.find_one_chat(id);
  }

  // ACEITAR O ATENDIMENTO
  @Patch('chat/answer')
  async answer_chat(@Body() dto: { treatmentId: string; attendantId: string }) {
    return await this.service.answer_chat(dto.treatmentId, dto.attendantId);
  }

  // FINALIZAR O ATENDIMENTO
  @Patch('chat/close')
  async close_chat(@Body() dto: { treatmentId: string }) {
    return await this.service.close_chat(dto.treatmentId);
  }
}
