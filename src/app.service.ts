import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaClient, User } from '@prisma/client';
import { randomUUID } from 'crypto';

@Injectable()
export class AppServices {
  constructor(private readonly prisma: PrismaClient) {}

  private includeUser = {
    Department: true,
    Treatment: { where: { isOpen: true } }
  };

  private includeChat = { Message: true, Department: true, client: true };

  async login(login: string) {
    return await this.prisma.user.findUnique({
      where: { login },
      include: this.includeUser
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

    return await this.prisma.user.create({
      data: { ...data, Department: { connect: { id: departmentFound.id } } },
      include: this.includeUser
    });
  }

  async find_all_open_unattended_chats(
    departmentId: string,
    attendantId: string
  ) {
    return await this.prisma.treatment.findMany({
      where: {
        isOpen: true,
        attendant: null,
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
    return await this.prisma.treatment.findMany({
      where: {
        isOpen: true,
        departmentId,
        OR: [{ attendant: attendantId }, { clientId: attendantId }]
      },
      include: this.includeChat
    });
  }

  async send_message(
    text: string,
    sendName: string,
    sendTo: string,
    treatmentId: string
  ) {
    const treatment = await this.prisma.treatment.findUnique({
      where: { id: treatmentId },
      include: this.includeChat
    });

    const received =
      sendTo !== treatment.attendant ? treatment.attendant : treatment.clientId;

    let userReceived: User;

    if (received) {
      userReceived = await this.prisma.user.findUnique({
        where: { id: received }
      });
    }

    return await this.prisma.message.create({
      data: {
        treatmentId,
        text,
        sendTo,
        sendName,
        receivedTo: received || randomUUID(),
        receivedName: userReceived?.name || 'Anônimo'
      }
    });
  }

  async open_chat(clientId: string, departmentId: string) {
    return await this.prisma.treatment.create({
      data: { isOpen: true, clientId, departmentId },
      include: this.includeChat
    });
  }

  async find_one_chat(id: string) {
    return await this.prisma.treatment.findUnique({
      where: { id },
      include: this.includeChat
    });
  }

  async answer_chat(treatmentId: string, attendantId: string) {
    return await this.prisma.treatment.update({
      where: { id: treatmentId },
      data: { attendant: attendantId },
      include: this.includeChat
    });
  }

  async close_chat(treatmentId: string) {
    return await this.prisma.treatment.update({
      where: { id: treatmentId },
      data: { isOpen: false },
      include: this.includeChat
    });
  }
}
