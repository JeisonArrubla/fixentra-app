import { Module, Global } from '@nestjs/common';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';
import { LocalStorageProvider } from './providers/local-storage.provider';
import { PrismaService } from '../../shared/prisma.service';

@Global()
@Module({
  controllers: [UploadController],
  providers: [
    {
      provide: 'STORAGE_PROVIDER',
      useClass: LocalStorageProvider,
    },
    UploadService,
    PrismaService,
  ],
  exports: [UploadService],
})
export class UploadModule {}