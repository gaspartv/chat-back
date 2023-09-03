import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer
} from '@nestjs/websockets';
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

@WebSocketGateway(8081, { cors: { origin: 'http://localhost:3000' } })
export class AppGateway {
  @WebSocketServer() server: Server;

  @SubscribeMessage('msgToServer')
  handleMessage(client: Socket, payload: IPayload | null): void {
    if (payload.departmentId) {
      this.server.emit(payload.departmentId, true);
    }

    if (payload.treatmentId) {
      this.server.emit(payload.treatmentId, payload);
    }
  }
}
