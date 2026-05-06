import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { CrearMensajeDto } from './dto/chat.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private chatService: ChatService) {}

  @Get(':servicioId/mensajes')
  async obtenerMensajes(
    @Param('servicioId') servicioId: string,
    @Request() req,
  ) {
    return this.chatService.obtenerMensajes(servicioId, req.user.id);
  }

  @Post(':servicioId/mensajes')
  async crearMensaje(
    @Param('servicioId') servicioId: string,
    @Body() dto: CrearMensajeDto,
    @Request() req,
  ) {
    return this.chatService.crearMensaje(
      servicioId,
      req.user.id,
      dto.contenido,
    );
  }

  @Post(':servicioId/mensajes/leidos')
  async marcarComoLeidos(
    @Param('servicioId') servicioId: string,
    @Request() req,
  ) {
    await this.chatService.marcarComoLeidos(servicioId, req.user.id);
    return { status: 'ok' };
  }
}
