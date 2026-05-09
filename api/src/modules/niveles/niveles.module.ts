import { Module } from '@nestjs/common';
import { NivelesService } from './niveles.service';
import { PrismaService } from '../../shared/prisma.service';

@Module({
  providers: [NivelesService, PrismaService],
  exports: [NivelesService],
})
export class NivelesModule {}
