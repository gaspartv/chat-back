import { Controller, Get, Patch, Post } from '@nestjs/common';
import { Chat, Message } from '@prisma/client';
import { AppServices } from './app.service';
import { User } from './interface';

@Controller('api')
export class AppControllers {
  constructor(private readonly service: AppServices) {}

  /// POSSÍVEL AUTENTICAR O USUÁRIO, NÃO DEVE RETORNAR O PASSWORD
  @Post('auth')
  async login(): Promise<User> {
    return await this.service.login();
  }

  /// Criar um novo usuário (Receber email notificando que o usuário foi criado)
  @Post('users')
  create_user(): Promise<User> {
    return this.service.create_user();
  }

  /// BUSCAR TODOS OS ATENDIMENTOS ABERTOS
  /// NO DEPARTAMENTO 'departmentId'
  /// QUE O CLIENTE NÃO SEJA O 'attendantId'
  /// QUE NÃO TENHA ATENDENTE
  @Get('chat/department/:departmentId/notAttendant/:attendantId')
  async find_all_open_unattended_chats(): Promise<Chat[]> {
    return await this.service.find_all_open_unattended_chats();
  }

  /// BUSCAR TODOS OS ATENDIMENTOS ABERTOS
  /// NO DEPARTAMENTO 'departmentId'
  /// QUE TENHA O ATENDENTE OU O CLIENTE COMO 'attendantId'
  @Get('chat/department/:departmentId/attendant/:attendantId')
  async find_all_open_chats_im_part_of(): Promise<Chat[]> {
    return await this.service.find_all_open_chats_im_part_of();
  }

  // CRIAR NOVA MENSAGEM E SETAR O SEND NAME E ID COM OS DADOS DE QUEM ESTA LOGADO
  @Post('message/send')
  async send_message(): Promise<Message> {
    return await this.service.send_message();
  }

  // DEVE CRIAR UM NOVO CHAT COM IsOpen = true e setar o clientId para o ID de quem está logado
  @Post('chat/open')
  async open_chat(): Promise<Chat> {
    return await this.service.open_chat();
  }

  // BUSCAR UM ATENDIMENTO POR ID
  @Get('chat/:id')
  async find_one_chat(): Promise<Chat> {
    return await this.service.find_one_chat();
  }

  // ACEITAR O ATENDIMENTO 'setar o attendantId para o ID de quem tá logado
  @Patch('chat/answer')
  async answer_chat(): Promise<Chat> {
    return await this.service.answer_chat();
  }

  // FINALIZAR O CHAT 'isOpen = false'
  @Patch('chat/close')
  async close_chat(): Promise<Chat> {
    return await this.service.close_chat();
  }
}
