import { Injectable, Inject } from '@nestjs/common';
import { StorageProvider } from './interfaces/storage-provider.interface';
import { PrismaService } from '../../shared/prisma.service';

@Injectable()
export class UploadService {
  constructor(
    @Inject('STORAGE_PROVIDER') private storageProvider: StorageProvider,
    private prisma: PrismaService,
  ) {}

  async uploadImage(
    file: Express.Multer.File,
    entityType: 'servicio',
    entityId?: string,
  ): Promise<{ url: string }> {
    const url = await this.storageProvider.upload(file);
    
    if (entityId && entityType === 'servicio') {
      await this.prisma.imagen.create({
        data: {
          url,
          servicioId: entityId,
        },
      });
    }
    
    return { url };
  }

  async uploadImages(
    files: Express.Multer.File[],
    entityType: 'servicio',
    entityId?: string,
  ): Promise<{ urls: string[] }> {
    const urls: string[] = [];
    
    for (const file of files) {
      const url = await this.storageProvider.upload(file);
      urls.push(url);
      
      if (entityId && entityType === 'servicio') {
        await this.prisma.imagen.create({
          data: {
            url,
            servicioId: entityId,
          },
        });
      }
    }
    
    return { urls };
  }

  async deleteImage(url: string): Promise<void> {
    await this.storageProvider.delete(url);
  }
}