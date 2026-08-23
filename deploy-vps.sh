#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

echo "============================================="
echo "🚀 NAWATIX VPS SETUP SCRIPT (Ubuntu)"
echo "============================================="

# 1. Update system
echo "Updating packages..."
# sudo apt update && sudo apt upgrade -y

# 2. Install Node.js v20
echo "Installing Node.js v20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# 3. Install PostgreSQL & Nginx & Certbot
echo "Installing PostgreSQL, Nginx, and Certbot..."
sudo apt install -y postgresql postgresql-contrib nginx certbot python3-certbot-nginx

# 4. Configure PostgreSQL
echo "Configuring PostgreSQL Database..."
sudo -u postgres psql -c "CREATE DATABASE athletix;" || true
sudo -u postgres psql -c "CREATE USER athletix_user WITH PASSWORD 'NawatixDbSecr3t!2026';" || true
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE athletix TO athletix_user;" || true
sudo -u postgres psql -c "ALTER DATABASE athletix OWNER TO athletix_user;" || true

# 5. Install PM2
echo "Installing PM2..."
sudo npm install -g pm2

# 6. Clone Repository
echo "Cloning Repository..."
cd ~
if [ -d "nawatix-platform" ]; then
  echo "Repository exists. Pulling latest changes..."
  cd nawatix-platform
  git pull origin master
else
  git clone https://github.com/arvinky/nawatix-platform.git
  cd nawatix-platform
fi

# 7. Setup Backend
echo "Setting up Backend..."
cd backend

# Create .env
cat <<EOF > .env
DATABASE_URL="postgresql://athletix_user:NawatixDbSecr3t!2026@localhost:5432/athletix?schema=public"
JWT_SECRET="KUNCI_RAHASIA_JWT_NAWATIX_123"
FRONTEND_URL="https://nawatix.com"
PORT=10000
EOF

# Install dependencies and build
npm install
npx prisma generate
npx prisma db push
npm run build

# 8. Start with PM2
echo "Starting Backend with PM2..."
pm2 stop nawatix-api || true
pm2 delete nawatix-api || true
pm2 start dist/src/main.js --name nawatix-api
pm2 save
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u $USER --hp $HOME || true

# 9. Setup Frontend
echo "Setting up Frontend..."
cd ~/nawatix-platform/frontend
npm install
npm run build

echo "Copying Frontend build to /var/www/nawatix..."
sudo mkdir -p /var/www/nawatix
sudo cp -r dist/* /var/www/nawatix/
sudo chown -R www-data:www-data /var/www/nawatix

# 10. Configure Nginx
echo "Configuring Nginx Reverse Proxy & Static Server..."
sudo tee /etc/nginx/sites-available/nawatix <<EOF
# Backend API (api.nawatix.com)
server {
    listen 80;
    server_name api.nawatix.com;

    location / {
        proxy_pass http://localhost:10000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \\\$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \\\$host;
        proxy_cache_bypass \\\$http_upgrade;
        proxy_set_header X-Real-IP \\\$remote_addr;
        proxy_set_header X-Forwarded-For \\\$proxy_add_x_forwarded_for;
    }
}

# Frontend Web (nawatix.com & www.nawatix.com)
server {
    listen 80;
    server_name nawatix.com www.nawatix.com;
    root /var/www/nawatix;
    index index.html;

    location / {
        try_files \\\$uri \\\$uri/ /index.html;
    }
}
EOF

sudo ln -sf /etc/nginx/sites-available/nawatix /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
# Also remove old api-only config if it exists
sudo rm -f /etc/nginx/sites-enabled/nawatix-api
sudo nginx -t
sudo systemctl restart nginx

# 11. Setup SSL (Let's Encrypt)
echo "Setting up SSL Certificates..."
sudo certbot --nginx -d api.nawatix.com -d nawatix.com -d www.nawatix.com --non-interactive --agree-tos -m admin@nawatix.com || echo "Certbot failed, but Nginx is running. You may need to run certbot manually."

echo "============================================="
echo "✅ NAWATIX DEPLOYMENT COMPLETED!"
echo "Your frontend is live at https://nawatix.com"
echo "Your backend is live at https://api.nawatix.com"
echo "============================================="
