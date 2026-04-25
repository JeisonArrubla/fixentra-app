import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';
import { TipoDocumento } from '@prisma/client';

export function IsDocumentoValido(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const documento = value as string;
          const tipoDocumento = (args.object as any).tipoDocumento as TipoDocumento;

          if (!documento || !tipoDocumento) {
            return false;
          }

          switch (tipoDocumento) {
            case 'CC':
              return /^\d{6,10}$/.test(documento);
            case 'CE':
              return /^[A-Z0-9]{6,10}$/i.test(documento);
            case 'PASAPORTE':
              return /^[A-Z0-9]{6,9}$/i.test(documento);
            case 'NIT':
              return /^\d{9,10}$/.test(documento);
            default:
              return false;
          }
        },
        defaultMessage(args: ValidationArguments) {
          return `El número de documento no es válido para el tipo ${(args.object as any).tipoDocumento}`;
        },
      },
    });
  };
}