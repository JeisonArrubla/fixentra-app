# Infraestructura AWS con Terraform

## Requisitos

- [Terraform](https://developer.hashicorp.com/terraform/downloads) >= 1.5
- [AWS CLI](https://aws.amazon.com/cli/) configurado con credenciales
- Key pair de EC2 creado en la región de AWS

## Configurar AWS CLI

```bash
aws configure
# Ingresa: Access Key ID, Secret Access Key, región (ej: us-east-1), formato (json)
```

## Crear Key Pair de EC2

```bash
aws ec2 create-key-pair --key-name fixentra --query 'KeyMaterial' --output text > fixentra.pem
chmod 400 fixentra.pem
```

Anota el nombre `fixentra` como valor de `ssh_key_name`.

## Variables Requeridas

Crea un archivo `terraform.tfvars`:

```hcl
db_password   = "tu-contraseña-segura-para-postgres"
ssh_key_name  = "fixentra"
```

Variables opcionales (con valores por defecto):

| Variable | Default | Descripción |
|----------|---------|-------------|
| `aws_region` | `us-east-1` | Región de AWS |
| `project_name` | `fixentra` | Prefijo para nombrar recursos |
| `db_name` | `fixentra` | Nombre de la base de datos |
| `db_user` | `postgres` | Usuario de PostgreSQL |
| `github_repo_url` | `https://github.com/JeisonArrubla/fixentra-app.git` | Repositorio a desplegar |
| `github_branch` | `main` | Rama a desplegar |
| `ec2_instance_type` | `t3.micro` | Tipo de instancia EC2 |
| `rds_instance_class` | `db.t3.micro` | Clase de RDS |
| `jwt_expires_in` | `15m` | Expiración del token JWT |
| `jwt_refresh_expires_in` | `7d` | Expiración del refresh token |
| `nivel_oro_umbral` | `4.2` | Umbral mínimo para nivel Oro |
| `nivel_oro_tiempo_espera` | `0` | Minutos de espera para Oro |
| `nivel_plata_umbral` | `3.5` | Umbral mínimo para nivel Plata |
| `nivel_plata_tiempo_espera` | `10` | Minutos de espera para Plata |
| `nivel_bronce_umbral` | `2.8` | Umbral mínimo para nivel Bronce |
| `nivel_bronce_tiempo_espera` | `30` | Minutos de espera para Bronce |
| `nivel_madera_umbral` | `1.0` | Umbral mínimo para nivel Madera |
| `nivel_madera_tiempo_espera` | `60` | Minutos de espera para Madera |

## Desplegar

```bash
cd infra

terraform init
terraform plan    # revisa los recursos que se van a crear
terraform apply   # crea todo (tarda ~5-10 minutos)
```

## Conectarse al servidor

```bash
ssh -i fixentra.pem ubuntu@$(terraform output -raw ec2_public_ip)
```

## Acceder a la app

Abre en el navegador: `http://$(terraform output -raw ec2_public_ip)`

## Destruir infraestructura

Cuando ya no la necesites:

```bash
terraform destroy
```

Esto elimina todos los recursos (EC2, RDS, S3, VPC). Los datos de la base de datos se perderán.

## Notas

- El bucket S3 está creado pero el backend actualmente guarda imágenes en disco local.
  Para usar S3, hay que implementar un `S3StorageProvider` en `api/src/modules/upload/providers/`.
- El estado de Terraform se guarda localmente (`terraform.tfstate`).
  Para un equipo, configura un backend remoto (S3 + DynamoDB).
- Sin dominio: la app se accede vía IP pública. Para SSL/HTTPS más adelante,
  asigna un dominio y usa Certbot (Let's Encrypt) o un ALB con ACM.

## Lecciones aprendidas

### Los builds deben ejecutarse como `ubuntu`, no como `root`
El script de bootstrap (`ec2-user-data.sh.tpl`) se ejecuta como root. Si `npm run build`
corre como root, los archivos `dist/` y `tsconfig.tsbuildinfo` quedan con propietario
`root`, lo que impide re-compilar después sin `sudo`.  
**Solución**: el `chown -R ubuntu:ubuntu` debe ejecutarse **después** de los builds,
no antes.

### Ruta de salida de NestJS
NestJS con `include: ["src/**/*"]` en `tsconfig.json` compila `src/main.ts` a
`dist/src/main.js`, no `dist/main.js`.  
**Solución**: PM2 debe apuntar a `api/dist/src/main.js`.

### `dist/` previo con permisos incorrectos bloquea el build
Si un deploy anterior dejó `dist/` con permisos de root, el siguiente build falla
con `EACCES: permission denied, rmdir`.  
**Solución**: agregar `rm -rf api/dist web/dist` antes de compilar en el script
de bootstrap.
