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
  default     = "main"
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

# --- JWT ---

variable "jwt_expires_in" {
  description = "Tiempo de expiración del token JWT"
  type        = string
  default     = "15m"
}

variable "jwt_refresh_expires_in" {
  description = "Tiempo de expiración del refresh token JWT"
  type        = string
  default     = "7d"
}

# --- Niveles técnicos ---

variable "nivel_oro_umbral" {
  description = "Umbral de calificación para nivel Oro"
  type        = number
  default     = 4.2
}

variable "nivel_oro_tiempo_espera" {
  description = "Minutos de espera para técnicos nivel Oro"
  type        = number
  default     = 0
}

variable "nivel_plata_umbral" {
  description = "Umbral de calificación para nivel Plata"
  type        = number
  default     = 3.5
}

variable "nivel_plata_tiempo_espera" {
  description = "Minutos de espera para técnicos nivel Plata"
  type        = number
  default     = 10
}

variable "nivel_bronce_umbral" {
  description = "Umbral de calificación para nivel Bronce"
  type        = number
  default     = 2.8
}

variable "nivel_bronce_tiempo_espera" {
  description = "Minutos de espera para técnicos nivel Bronce"
  type        = number
  default     = 30
}

variable "nivel_madera_umbral" {
  description = "Umbral de calificación para nivel Madera"
  type        = number
  default     = 1.0
}

variable "nivel_madera_tiempo_espera" {
  description = "Minutos de espera para técnicos nivel Madera"
  type        = number
  default     = 60
}
