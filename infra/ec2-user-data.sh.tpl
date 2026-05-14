#!/bin/bash
set -euo pipefail

exec > >(tee /var/log/user-data.log | logger -t user-data) 2>&1

echo "=== Iniciando bootstrap de ${project_name} ==="

# --- Actualizar sistema ---
apt-get update -y
apt-get upgrade -y

# --- Instalar dependencias ---
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt-get install -y nodejs git nginx

npm install -g pm2

# --- Clonar repositorio ---
cd /home/ubuntu
git clone -b ${github_branch} ${github_repo_url} ${project_name}
cd ${project_name}

# --- Escribir .env ---
cat > api/.env << EOF
DATABASE_URL="postgresql://${db_user}:${db_password}@${db_host}:${db_port}/${db_name}?schema=public"
JWT_SECRET="$(openssl rand -hex 32)"
JWT_REFRESH_SECRET="$(openssl rand -hex 32)"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"
PORT=3000
NODE_ENV="production"
FRONTEND_URL="${frontend_url}"

AWS_REGION="${aws_region}"
S3_BUCKET="${s3_bucket_name}"

NIVEL_ORO_UMBRAL=4.2
NIVEL_ORO_TIEMPO_ESPERA=0
NIVEL_PLATA_UMBRAL=3.5
NIVEL_PLATA_TIEMPO_ESPERA=10
NIVEL_BRONCE_UMBRAL=2.8
NIVEL_BRONCE_TIEMPO_ESPERA=30
NIVEL_MADERA_UMBRAL=1.0
NIVEL_MADERA_TIEMPO_ESPERA=60
EOF

# --- Configurar Nginx ---
cat > /etc/nginx/sites-available/${project_name} << 'NGINX'
server {
    listen 80;
    server_name _;

    root /home/ubuntu/PROJECT_PLACEHOLDER/web/dist;
    index index.html;

    gzip on;
    gzip_types text/css application/javascript image/svg+xml;
    gzip_min_length 256;

    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /uploads {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /socket.io {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }

    location /chat {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}
NGINX

sed -i "s/PROJECT_PLACEHOLDER/${project_name}/g" /etc/nginx/sites-available/${project_name}

ln -sf /etc/nginx/sites-available/${project_name} /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl restart nginx

# --- Instalar dependencias del backend ---
cd /home/ubuntu/${project_name}/api
npm install
npx prisma generate
npx prisma db push

# --- Instalar dependencias del frontend y build ---
cd /home/ubuntu/${project_name}/web
npm install
npm run build

# --- Compilar backend ---
cd /home/ubuntu/${project_name}/api
npm run build

# --- Iniciar backend con PM2 ---
cd /home/ubuntu/${project_name}
pm2 start api/dist/main.js --name "${project_name}-api"
pm2 save
env PATH=$PATH:/usr/bin pm2 startup systemd -u ubuntu --hp /home/ubuntu

echo "=== Bootstrap completado ==="
echo "Frontend sirviendo en: ${frontend_url}"
