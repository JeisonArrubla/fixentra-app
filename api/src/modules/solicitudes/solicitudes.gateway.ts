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

interface TecnicoConnection {
  socket: Socket;
  tecnicoId: string;
}

@WebSocketGateway({ namespace: '/solicitudes', cors: true })
export class SolicitudesGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private tecnicosConectados = new Map<string, Set<TecnicoConnection>>();

  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService,
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
        include: { tecnicoPerfil: true },
      });

      if (!usuario?.tecnicoPerfil) {
        client.disconnect();
        return;
      }

      const conexion: TecnicoConnection = {
        socket: client,
        tecnicoId: payload.sub,
      };

      if (!this.tecnicosConectados.has(payload.sub)) {
        this.tecnicosConectados.set(payload.sub, new Set());
      }
      this.tecnicosConectados.get(payload.sub)!.add(conexion);

      client.data.tecnicoId = payload.sub;
    } catch {
      client.disconnect();
    }
  }

  async handleDisconnect(client: Socket) {
    const tecnicoId = client.data.tecnicoId;
    if (!tecnicoId) return;

    const conexiones = this.tecnicosConectados.get(tecnicoId);
    if (!conexiones) return;

    for (const conn of conexiones) {
      if (conn.socket.id === client.id) {
        conexiones.delete(conn);
        break;
      }
    }

    if (conexiones.size === 0) {
      this.tecnicosConectados.delete(tecnicoId);
    }
  }

  @SubscribeMessage('subscribe:solicitudes')
  handleSubscribe(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { latitud: number; longitud: number; radioKm?: number },
  ) {
    client.join(`tecnico:${client.data.tecnicoId}`);
    return { status: 'subscribed' };
  }

  async notificarTecnicosElegibles(
    solicitudId: string,
    latitud: number,
    longitud: number,
    radioKm: number = 10,
  ) {
    const tecnicos = await this.prisma.tecnico.findMany({
      where: {
        disponibilidad: true,
        latitud: { not: null },
        longitud: { not: null },
      },
    });

    for (const tecnico of tecnicos) {
      if (!tecnico.latitud || !tecnico.longitud) continue;

      const distancia = this.haversine(
        latitud,
        longitud,
        tecnico.latitud,
        tecnico.longitud,
      );

      if (distancia <= (tecnico.radioCoberturaKm || radioKm)) {
        const conexiones = this.tecnicosConectados.get(tecnico.id);
        if (conexiones) {
          for (const conn of conexiones) {
            conn.socket.emit('solicitud:nueva', {
              solicitudId,
              latitud,
              longitud,
            });
          }
        }
      }
    }
  }

  async notificarAsignacion(solicitudId: string, tecnicoId: string) {
    const conexiones = this.tecnicosConectados.get(tecnicoId);
    if (conexiones) {
      for (const conn of conexiones) {
        conn.socket.emit('solicitud:asignada', {
          solicitudId,
        });
      }
    }
  }

  private haversine(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
}