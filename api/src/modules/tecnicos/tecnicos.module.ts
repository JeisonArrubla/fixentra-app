import { Module } from '@nestjs/common';
import { TecnicosController } from './tecnicos.controller';
import { TecnicosService } from './tecnicos.service';
import { PrismaService } from '../../shared/prisma.service';
import { NivelesModule } from '../niveles/niveles.module';

@Module({
  imports: [NivelesModule],
  controllers: [TecnicosController],
  providers: [TecnicosService, PrismaService],
  exports: [TecnicosService],
})
export class TecnicosModule {}