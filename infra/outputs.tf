output "ec2_public_ip" {
  description = "IP pública del servidor (accede aquí para ver la app)"
  value       = aws_eip.main.public_ip
}

output "ec2_ssh" {
  description = "Comando SSH para conectarse al servidor"
  value       = "ssh ubuntu@${aws_eip.main.public_ip}"
}

output "rds_endpoint" {
  description = "Endpoint de la base de datos PostgreSQL"
  value       = aws_db_instance.main.endpoint
}

output "s3_bucket_name" {
  description = "Nombre del bucket S3 para imágenes"
  value       = aws_s3_bucket.images.id
}
