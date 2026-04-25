import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';

const logger = new Logger('LocalStrategy');

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
  constructor(private authService: AuthService) {
    super({ usernameField: 'correo', passwordField: 'contrasena' });
    logger.log('LocalStrategy construida');
  }

  async validate(correo: string, contrasena: string) {
    logger.log(`LocalStrategy.validate - correo: "${correo}", contrasena: "${contrasena}"`);
    try {
      const usuario = await this.authService.validateUser(correo, contrasena);
      if (!usuario) {
        logger.warn(`LocalStrategy.validate - credenciales inválidas para: ${correo}`);
        throw new UnauthorizedException('Credenciales inválidas');
      }
      logger.log(`LocalStrategy.validate - OK, usuario: ${usuario.id}`);
      return usuario;
    } catch (error) {
      logger.error(`LocalStrategy.validate - error: ${error.message}`);
      throw error;
    }
  }
}