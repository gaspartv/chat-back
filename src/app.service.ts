import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaClient, User } from '@prisma/client';
import { randomUUID } from 'crypto';

@Injectable()
export class AppServices {
  constructor(private readonly prisma: PrismaClient) {}

  private includeUser = {
    Departments: true,
    Chats: { where: { isOpen: true } }
  };

  private includeChat = { Messages: true, Department: true, Client: true };

  async login(login: string) {
    return await this.prisma.user.findUnique({
      where: { login },
      include: {
        Departments: true,
        Chats: { where: { isOpen: true } }
      }
    });
  }

  async create_user(data: { name: string; login: string }) {
    if (
      await this.prisma.user.findUnique({
        where: { name: data.name }
      })
    ) {
      throw new ConflictException('Name already exists.');
    }

    if (
      await this.prisma.user.findUnique({
        where: { login: data.login }
      })
    ) {
      throw new ConflictException('Login already exists.');
    }

    let companyFound = await this.prisma.company.findFirst();

    if (!companyFound) {
      companyFound = await this.prisma.company.create({
        data: { name: 'MIT' }
      });
    }

    let departmentFound = await this.prisma.department.findFirst();

    if (!departmentFound) {
      departmentFound = await this.prisma.department.create({
        data: {
          name: 'Financeiro',
          Company: { connect: { id: companyFound.id } }
        }
      });
    }

    const userCreate = await this.prisma.user.create({ data });

    return await this.prisma.user.update({
      where: { id: userCreate.id },
      data: { Departments: { connect: { id: departmentFound.id } } }
    });
  }

  async find_all_open_unattended_chats(
    departmentId: string,
    attendantId: string
  ) {
    return await this.prisma.chat.findMany({
      where: {
        isOpen: true,
        attendantId: null,
        departmentId,
        clientId: { not: attendantId }
      },
      include: this.includeChat
    });
  }

  async find_all_open_chats_im_part_of(
    departmentId: string,
    attendantId: string
  ) {
    return await this.prisma.chat.findMany({
      where: {
        isOpen: true,
        departmentId,
        OR: [{ attendantId }, { clientId: attendantId }]
      },
      include: this.includeChat
    });
  }

  async send_message(
    text: string,
    sendName: string,
    sendId: string,
    chatId: string
  ) {
    const treatment = await this.prisma.chat.findUnique({
      where: { id: chatId },
      include: this.includeChat
    });

    const received =
      sendId !== treatment.attendantId
        ? treatment.attendantId
        : treatment.clientId;

    let userReceived: User;

    if (received) {
      userReceived = await this.prisma.user.findUnique({
        where: { id: received }
      });
    }

    return await this.prisma.message.create({
      data: {
        chatId,
        text,
        sendId,
        sendName,
        receivedId: received || randomUUID(),
        receivedName: userReceived?.name || 'Anônimo'
      }
    });
  }

  async open_chat(clientId: string, departmentId: string) {
    return await this.prisma.chat.create({
      data: { isOpen: true, clientId, departmentId },
      include: this.includeChat
    });
  }

  async find_one_chat(id: string) {
    return await this.prisma.chat.findUnique({
      where: { id },
      include: this.includeChat
    });
  }

  async answer_chat(chatId: string, attendantId: string) {
    return await this.prisma.chat.update({
      where: { id: chatId },
      data: { attendantId },
      include: this.includeChat
    });
  }

  async close_chat(chatId: string) {
    return await this.prisma.chat.update({
      where: { id: chatId },
      data: { isOpen: false },
      include: this.includeChat
    });
  }
}
