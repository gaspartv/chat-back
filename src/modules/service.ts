import {
  ConflictException,
  Injectable,
  NotFoundException
} from '@nestjs/common';
import { PrismaClient, User } from '@prisma/client';
import { compare, hash } from 'bcrypt';
import { randomUUID } from 'crypto';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class Services {
  constructor(private readonly prisma: PrismaClient) {}

  async toMeetSend(clientId: string, departmentId: string) {
    const treatment = await this.prisma.treatment.create({
      data: { isOpen: true, clientId, departmentId },
      include: { Message: true, Department: true, client: true }
    });

    return treatment;
  }

  async toMeetReceived(treatmentId: string, attendantId: string) {
    const treatment = await this.prisma.treatment.update({
      where: { id: treatmentId },
      data: { attendant: attendantId },
      include: { Message: true, Department: true, client: true }
    });

    return treatment;
  }

  async login(login: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { login },
      include: { Department: true, Treatment: { where: { isOpen: true } } }
    });

    if (!user) {
      throw new NotFoundException('Login or password incorrect.');
    }

    const verifyPassword = await compare(password, user.passwordHash);

    if (!verifyPassword) {
      throw new NotFoundException('Login or password incorrect.');
    }

    return user;
  }

  async createUser({ password, ...data }: CreateUserDto) {
    const userNameExists = await this.prisma.user.findUnique({
      where: { name: data.name }
    });

    if (userNameExists) {
      throw new ConflictException('Name already exists.');
    }

    const userLoginExists = await this.prisma.user.findUnique({
      where: { login: data.login }
    });

    if (userLoginExists) {
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

    const user = await this.prisma.user.create({
      data: {
        ...data,
        passwordHash: await hash(password, 7)
      }
    });

    await this.prisma.user.update({
      where: { id: user.id },
      data: { Department: { connect: { id: departmentFound.id } } }
    });

    return await this.prisma.user.findUnique({
      where: { id: user.id },
      include: { Department: true, Treatment: true }
    });
  }

  async findAllTreatmentOpen(departmentId: string, attendantId: string) {
    return await this.prisma.treatment.findMany({
      where: {
        isOpen: true,
        attendant: null,
        departmentId,
        clientId: { not: attendantId }
      },
      include: { Message: true, Department: true, client: true }
    });
  }

  async findAllTreatmentOpenToMeet(departmentId: string, attendantId: string) {
    const where = {
      isOpen: true,
      departmentId,
      OR: [{ attendant: attendantId }, { clientId: attendantId }]
    };
    return await this.prisma.treatment.findMany({
      where,
      include: { Message: true, Department: true, client: true }
    });
  }

  async closedTreatment(treatmentId: string) {
    return await this.prisma.treatment.update({
      where: { id: treatmentId },
      data: { isOpen: false },
      include: { Message: true, Department: true, client: true }
    });
  }

  async sendMessage(
    text: string,
    sendName: string,
    sendTo: string,
    treatmentId: string
  ) {
    const treatment = await this.prisma.treatment.findUnique({
      where: { id: treatmentId },
      include: { Message: true, Department: true, client: true }
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

  async findTreatment(id: string) {
    return await this.prisma.treatment.findUnique({
      where: { id },
      include: { Message: true, Department: true, client: true }
    });
  }
}
