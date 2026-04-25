import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../shared/prisma.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';

const logger = new Logger('AuthService');

export interface TokenPayload {
  sub: string;
  correo: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface UsuarioPayload {
  id: string;
  correo: string;
  nombre: string;
  apellido: string;
  esCliente: boolean;
  esTecnico: boolean;
}

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(dto: RegisterDto): Promise<UsuarioPayload> {
    const existente = await this.prisma.usuario.findFirst({
      where: {
        OR: [{ correo: dto.correo }, { numDocumento: dto.numDocumento }],
      },
    });

    if (existente) {
      if (existente.correo === dto.correo) {
        throw new ConflictException('El correo ya está registrado');
      }
      throw new ConflictException('El número de documento ya está registrado');
    }

    const contrasenaHash = await bcrypt.hash(dto.contrasena, 12);

    const usuario = await this.prisma.usuario.create({
      data: {
        nombre: dto.nombre,
        apellido: dto.apellido,
        tipoDocumento: dto.tipoDocumento,
        numDocumento: dto.numDocumento,
        correo: dto.correo,
        celular: dto.celular,
        contrasena: contrasenaHash,
      },
    });

    let esCliente = false;
    let esTecnico = false;

    // Crear perfil de cliente si se indica
    if (dto.crearPerfilCliente) {
      await this.prisma.cliente.create({
        data: { id: usuario.id },
      });
      esCliente = true;
      logger.log(`Perfil de cliente creado para usuario: ${usuario.id}`);
    }

    // Crear perfil de técnico si se indica
    if (dto.crearPerfilTecnico) {
      await this.prisma.tecnico.create({
        data: {
          id: usuario.id,
          disponibilidad: dto.disponibilidadTecnico ?? true,
          radioCoberturaKm: 10,
        },
      });
      esTecnico = true;
      logger.log(`Perfil de técnico creado para usuario: ${usuario.id}`);
    }

    return {
      id: usuario.id,
      correo: usuario.correo,
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      esCliente,
      esTecnico,
    };
  }

  async validateUser(correo: string, contrasena: string): Promise<UsuarioPayload | null> {
    logger.log(`Validando usuario: ${correo}`);

    const usuario = await this.prisma.usuario.findUnique({
      where: { correo },
      include: {
        clientePerfil: true,
        tecnicoPerfil: true,
      },
    });

    if (!usuario) {
      logger.warn(`Usuario no encontrado: ${correo}`);
      return null;
    }

    logger.log(`Usuario encontrado: ${usuario.id}, hash: ${usuario.contrasena.substring(0, 20)}...`);
    logger.log(`Contraseña ingresada: ${contrasena}`);

    const esValida = await bcrypt.compare(contrasena, usuario.contrasena);
    if (!esValida) {
      logger.warn(`Contraseña inválida para usuario: ${correo}`);
      return null;
    }

    logger.log(`Login exitoso para usuario: ${usuario.id}`);

    return {
      id: usuario.id,
      correo: usuario.correo,
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      esCliente: !!usuario.clientePerfil,
      esTecnico: !!usuario.tecnicoPerfil,
    };
  }

  async login(user: UsuarioPayload): Promise<AuthTokens> {
    const payload: TokenPayload = { sub: user.id, correo: user.correo };
    return this.generateTokens(payload);
  }

  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    try {
      const payload = this.jwtService.verify<TokenPayload>(refreshToken, {
        secret: this.configService.get<string>('jwt.refreshSecret'),
      });
      return this.generateTokens(payload);
    } catch {
      throw new UnauthorizedException('Refresh token inválido o expirado');
    }
  }

private async generateTokens(payload: TokenPayload): Promise<AuthTokens> {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('jwt.secret') || process.env.JWT_SECRET || 'default-secret',
        expiresIn: '15m',
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('jwt.refreshSecret') || process.env.JWT_REFRESH_SECRET || 'default-refresh-secret',
        expiresIn: '7d',
      }),
    ]);

    return { accessToken, refreshToken };
  }

  async getProfile(usuarioId: string): Promise<UsuarioPayload> {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: usuarioId },
      include: {
        clientePerfil: true,
        tecnicoPerfil: true,
      },
    });

    if (!usuario) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    return {
      id: usuario.id,
      correo: usuario.correo,
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      esCliente: !!usuario.clientePerfil,
      esTecnico: !!usuario.tecnicoPerfil,
    };
  }
}