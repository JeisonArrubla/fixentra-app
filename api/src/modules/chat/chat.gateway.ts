import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../shared/prisma.service';
import { ChatService } from './chat.service';

interface ChatConnection {
  socket: Socket;
  usuarioId: string;
}

@WebSocketGateway({ namespace: '/chat', cors: { origin: '*' } })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private usuariosConectados = new Map<string, Set<ChatConnection>>();

  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService,
    private chatService: ChatService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token =
        client.handshake.auth.token ||
        client.handshake.headers.authorization?.replace('Bearer ', '');

      if (!token) {
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token);
      const usuario = await this.prisma.usuario.findUnique({
        where: { id: payload.sub },
      });

      if (!usuario) {
        client.disconnect();
        return;
      }

      const conexion: ChatConnection = {
        socket: client,
        usuarioId: payload.sub,
      };

      if (!this.usuariosConectados.has(payload.sub)) {
        this.usuariosConectados.set(payload.sub, new Set());
      }
      this.usuariosConectados.get(payload.sub)!.add(conexion);

      client.data.usuarioId = payload.sub;

      client.join(`servicio:${client.data.servicioId}`);
    } catch {
      client.disconnect();
    }
  }

  async handleDisconnect(client: Socket) {
    const usuarioId = client.data.usuarioId;
    if (!usuarioId) return;

    const conexiones = this.usuariosConectados.get(usuarioId);
    if (!conexiones) return;

    for (const conn of conexiones) {
      if (conn.socket.id === client.id) {
        conexiones.delete(conn);
        break;
      }
    }

    if (conexiones.size === 0) {
      this.usuariosConectados.delete(usuarioId);
    }
  }

  @SubscribeMessage('subscribe:servicio')
  handleSubscribe(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { servicioId: string },
  ) {
    client.data.servicioId = data.servicioId;
    client.join(`servicio:${data.servicioId}`);
    return { status: 'subscribed', servicioId: data.servicioId };
  }

  @SubscribeMessage('chat:enviar')
  async handleMensaje(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { servicioId: string; contenido: string },
  ) {
    try {
      const usuarioId = client.data.usuarioId;
      if (!usuarioId) {
        return { status: 'error', message: 'No autenticado' };
      }

      const mensaje = await this.chatService.crearMensaje(
        data.servicioId,
        usuarioId,
        data.contenido,
      );

      this.server
        .to(`servicio:${data.servicioId}`)
        .emit('chat:recibir', mensaje);

      return { status: 'ok', mensaje };
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  }
}
