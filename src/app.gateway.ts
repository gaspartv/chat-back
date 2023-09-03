import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway(8081, { cors: { origin: 'http://localhost:3000' } })
export class AppGateway {
  @WebSocketServer() server: Server;

  @SubscribeMessage('msgToServer')
  handleMessage(client: Socket, payload: any | null): void {
    if (payload.departmentId) {
      this.server.emit(payload.departmentId, true);
    }

    if (payload.chatId) {
      this.server.emit(payload.chatId, payload);
    }
  }
}
