import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { SolicitudesController } from './solicitudes.controller';
import { SolicitudesService } from './solicitudes.service';
import { SolicitudesGateway } from './solicitudes.gateway';
import { PrismaService } from '../../shared/prisma.service';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '15m' },
    }),
  ],
  controllers: [SolicitudesController],
  providers: [SolicitudesService, SolicitudesGateway, PrismaService],
  exports: [SolicitudesService, SolicitudesGateway],
})
export class SolicitudesModule {}