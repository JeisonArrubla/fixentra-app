import { Module } from '@nestjs/common';
import { CatalogosController } from './catalogos.controller';
import { CatalogosService } from './catalogos.service';
import { PrismaService } from '../../shared/prisma.service';

@Module({
  controllers: [CatalogosController],
  providers: [CatalogosService, PrismaService],
  exports: [CatalogosService],
})
export class CatalogosModule {}
