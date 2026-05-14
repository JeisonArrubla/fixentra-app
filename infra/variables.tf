variable "aws_region" {
  description = "Región de AWS"
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Nombre del proyecto (para etiquetar recursos)"
  type        = string
  default     = "fixentra"
}

variable "db_password" {
  description = "Contraseña maestra de PostgreSQL"
  type        = string
  sensitive   = true
}

variable "db_name" {
  description = "Nombre de la base de datos"
  type        = string
  default     = "fixentra"
}

variable "db_user" {
  description = "Usuario de la base de datos"
  type        = string
  default     = "postgres"
}

variable "ssh_key_name" {
  description = "Nombre del key pair de EC2 en AWS (debe existir en la región)"
  type        = string
}

variable "github_repo_url" {
  description = "URL del repositorio GitHub (formato HTTPS)"
  type        = string
  default     = "https://github.com/JeisonArrubla/fixentra-app.git"
}

variable "github_branch" {
  description = "Rama del repositorio a desplegar"
  type        = string
  default     = "develop"
}

variable "ec2_instance_type" {
  description = "Tipo de instancia EC2"
  type        = string
  default     = "t3.micro"
}

variable "rds_instance_class" {
  description = "Clase de instancia RDS"
  type        = string
  default     = "db.t3.micro"
}
