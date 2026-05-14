terraform {
  required_version = ">= 1.5"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.6"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

data "aws_availability_zones" "available" {
  state = "available"
}

resource "random_id" "suffix" {
  byte_length = 4
}

locals {
  az_count = min(2, length(data.aws_availability_zones.available.names))
}

# --- VPC ---

resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = { Name = "${var.project_name}-vpc" }
}

resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id

  tags = { Name = "${var.project_name}-igw" }
}

resource "aws_subnet" "public" {
  count                   = local.az_count
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.${count.index + 1}.0/24"
  availability_zone       = data.aws_availability_zones.available.names[count.index]
  map_public_ip_on_launch = true

  tags = { Name = "${var.project_name}-public-${count.index + 1}" }
}

resource "aws_route_table" "main" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main.id
  }

  tags = { Name = "${var.project_name}-rt" }
}

resource "aws_route_table_association" "main" {
  count          = local.az_count
  subnet_id      = aws_subnet.public[count.index].id
  route_table_id = aws_route_table.main.id
}

# --- Security Groups ---

resource "aws_security_group" "ec2" {
  name        = "${var.project_name}-ec2-sg"
  description = "Acceso a EC2: SSH y HTTP"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "SSH"
  }

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "HTTP"
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = { Name = "${var.project_name}-ec2-sg" }
}

resource "aws_security_group" "rds" {
  name        = "${var.project_name}-rds-sg"
  description = "Acceso a RDS solo desde EC2"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.ec2.id]
    description     = "PostgreSQL desde EC2"
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = { Name = "${var.project_name}-rds-sg" }
}

# --- S3 (imágenes) ---

resource "aws_s3_bucket" "images" {
  bucket = "${var.project_name}-images-${random_id.suffix.hex}"

  tags = { Name = "${var.project_name}-images" }
}

resource "aws_s3_bucket_public_access_block" "images" {
  bucket                  = aws_s3_bucket.images.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_versioning" "images" {
  bucket = aws_s3_bucket.images.id
  versioning_configuration {
    status = "Disabled"
  }
}

# --- IAM para EC2 (acceso a S3) ---

resource "aws_iam_role" "ec2" {
  name = "${var.project_name}-ec2-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ec2.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_policy" "s3_images" {
  name        = "${var.project_name}-s3-images"
  description = "Permite leer y escribir en el bucket de imágenes"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:PutObject",
          "s3:DeleteObject",
          "s3:ListBucket",
        ]
        Resource = [
          aws_s3_bucket.images.arn,
          "${aws_s3_bucket.images.arn}/*",
        ]
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "s3_images" {
  role       = aws_iam_role.ec2.name
  policy_arn = aws_iam_policy.s3_images.arn
}

resource "aws_iam_instance_profile" "ec2" {
  name = "${var.project_name}-ec2-profile"
  role = aws_iam_role.ec2.name
}

# --- RDS (PostgreSQL) ---

resource "aws_db_subnet_group" "main" {
  name       = "${var.project_name}-db-subnets"
  subnet_ids = aws_subnet.public[*].id

  tags = { Name = "${var.project_name}-db-subnets" }
}

resource "aws_db_instance" "main" {
  identifier             = "${var.project_name}-db"
  engine                 = "postgres"
  engine_version         = "16"
  instance_class         = var.rds_instance_class
  allocated_storage      = 20
  storage_type           = "gp3"
  db_name                = var.db_name
  username               = var.db_user
  password               = var.db_password
  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [aws_security_group.rds.id]
  publicly_accessible    = false
  skip_final_snapshot    = true

  tags = { Name = "${var.project_name}-db" }
}

# --- EC2 ---

data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"] # Canonical

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd-gp3/ubuntu-noble-24.04-amd64-server-*"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

resource "aws_eip" "main" {
  domain = "vpc"

  tags = { Name = "${var.project_name}-eip" }
}

resource "aws_instance" "main" {
  ami                    = data.aws_ami.ubuntu.id
  instance_type          = var.ec2_instance_type
  subnet_id              = aws_subnet.public[0].id
  vpc_security_group_ids = [aws_security_group.ec2.id]
  key_name               = var.ssh_key_name
  iam_instance_profile   = aws_iam_instance_profile.ec2.name

  user_data = templatefile("${path.module}/ec2-user-data.sh.tpl", {
    project_name               = var.project_name
    db_host                    = aws_db_instance.main.address
    db_port                    = aws_db_instance.main.port
    db_name                    = aws_db_instance.main.db_name
    db_user                    = aws_db_instance.main.username
    db_password                = var.db_password
    github_repo_url            = var.github_repo_url
    github_branch              = var.github_branch
    s3_bucket_name             = aws_s3_bucket.images.id
    aws_region                 = var.aws_region
    frontend_url               = "http://${aws_eip.main.public_ip}"
    jwt_expires_in             = var.jwt_expires_in
    jwt_refresh_expires_in     = var.jwt_refresh_expires_in
    nivel_oro_umbral           = var.nivel_oro_umbral
    nivel_oro_tiempo_espera    = var.nivel_oro_tiempo_espera
    nivel_plata_umbral         = var.nivel_plata_umbral
    nivel_plata_tiempo_espera  = var.nivel_plata_tiempo_espera
    nivel_bronce_umbral        = var.nivel_bronce_umbral
    nivel_bronce_tiempo_espera = var.nivel_bronce_tiempo_espera
    nivel_madera_umbral        = var.nivel_madera_umbral
    nivel_madera_tiempo_espera = var.nivel_madera_tiempo_espera
  })

  root_block_device {
    volume_size = 30
    volume_type = "gp3"
  }

  tags = { Name = "${var.project_name}-ec2" }
}

resource "aws_eip_association" "main" {
  instance_id   = aws_instance.main.id
  allocation_id = aws_eip.main.id
}
