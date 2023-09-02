import {
  ConflictException,
  Injectable,
  NotFoundException
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { compare, hash } from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class Services {
  constructor(private readonly prisma: PrismaClient) {}

  async toMeetSend(clientId: string) {
    const treatment = await this.prisma.treatment.create({
      data: { isOpen: true, clientId }
    });

    return treatment;
  }

  async toMeetReceived(treatmentId: string, attendantId: string) {
    const treatment = await this.prisma.treatment.update({
      where: { id: treatmentId },
      data: { attendant: attendantId }
    });

    return treatment;
  }

  async login(login: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { login },
      include: { Department: true, Treatment: true }
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

  async findAllTreatmentOpen() {
    return await this.prisma.treatment.findMany({
      where: { isOpen: true, attendant: null },
      include: { Message: true, Department: true, client: true }
    });
  }

  async findAllTreatmentOpenToMeet() {
    return await this.prisma.treatment.findMany({
      where: { isOpen: true, attendant: { not: null } },
      include: { Message: true, Department: true, client: true }
    });
  }

  async closedTreatment(treatmentId: string) {
    return await this.prisma.treatment.update({
      where: { id: treatmentId },
      data: { isOpen: false }
    });
  }
}
