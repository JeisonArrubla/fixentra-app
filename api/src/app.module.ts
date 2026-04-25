import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { PrismaService } from './shared/prisma.service';
import { AuthModule } from './modules/auth/auth.module';
import { ClientesModule } from './modules/clientes/clientes.module';
import { TecnicosModule } from './modules/tecnicos/tecnicos.module';
import { SolicitudesModule } from './modules/solicitudes/solicitudes.module';
import { UploadModule } from './modules/upload/upload.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
    }),
    AuthModule,
    ClientesModule,
    TecnicosModule,
    SolicitudesModule,
    UploadModule,
  ],
  providers: [PrismaService],
})
export class AppModule {}