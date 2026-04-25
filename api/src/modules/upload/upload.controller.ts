import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  Body,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UploadService } from './upload.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('upload')
@Controller('upload')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UploadController {
  constructor(private uploadService: UploadService) {}

  @Post('image')
  @ApiOperation({ summary: 'Subir una imagen' })
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(
    @UploadedFile() file: Express.Multer.File,
    @Body('entityType') entityType: string,
    @Body('entityId') entityId?: string,
  ) {
    return this.uploadService.uploadImage(file, entityType as 'solicitud', entityId);
  }

  @Post('images')
  @ApiOperation({ summary: 'Subir múltiples imágenes (máx 2)' })
  @UseInterceptors(FilesInterceptor('files', 2))
  async uploadImages(
    @UploadedFiles() files: Express.Multer.File[],
    @Body('entityType') entityType: string,
    @Body('entityId') entityId?: string,
  ) {
    return this.uploadService.uploadImages(files, entityType as 'solicitud', entityId);
  }
}