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
  name: string
  message: string
  department: string
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
  handleMessage(client: Socket, payload: IPayload): void {
    this.server.emit(payload.department, payload);
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
