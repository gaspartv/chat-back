import { Logger } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer
} from '@nestjs/websockets';
import { PrismaClient } from '@prisma/client';
import { Server, Socket } from 'socket.io';

interface IPayload {
  id?: string;
  text?: string;
  sendName?: string;
  sendTo?: string;
  receivedName?: string;
  receivedTo?: string;
  treatmentId: string;
  departmentId?: string;
}

@WebSocketGateway()
export class AppGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(private readonly prisma: PrismaClient) {}

  @WebSocketServer() server: Server;
  private logger: Logger = new Logger('AppGateway');

  private rooms: Map<string, Set<Socket>> = new Map();

  @SubscribeMessage('msgToServer')
  handleMessage(client: Socket, payload: IPayload | null): void {
    console.log(payload);

    if (payload.departmentId) {
      this.server.emit(payload.departmentId, true);
    }

    if (payload.treatmentId) {
      this.server.emit(payload.treatmentId, payload);
    }
  }

  async afterInit(server: Server) {
    const departments = await this.prisma.department.findMany({
      include: { Company: true }
    });

    for await (const department of departments) {
      this.rooms.set(
        `${department.Company.name}/${department.name}`.toLowerCase(),
        new Set<Socket>()
      );
    }

    this.logger.log('Init');
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: any) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }
}
