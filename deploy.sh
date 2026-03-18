#!/bin/bash

# 确保脚本在出错时退出
set -e

echo "Starting deployment..."

# 创建数据目录
echo "Creating data directory..."
mkdir -p data

# 复制数据库文件
echo "Checking database file..."
if [ -f "sqllite/dictionary.db" ]; then
    cp sqllite/dictionary.db data/
    echo "Database file copied successfully."
else
    echo "Error: dictionary.db not found in sqllite directory"
    exit 1
fi

# 检查并生成 .env 文件
echo "Checking .env file..."
if [ ! -f "back/.env" ]; then
    echo ".env not found, generating from .env.example..."
    if [ -f "back/.env.example" ]; then
        cp back/.env.example back/.env

        # 生成 SECRET_KEY
        echo "Generating SECRET_KEY..."
        SECRET_KEY=$(openssl rand -hex 32)
        # 在 Linux/Mac 上使用 sed 替换
        if sed --version 2>/dev/null | grep -q GNU; then
            sed -i "s/SECRET_KEY=.*/SECRET_KEY=$SECRET_KEY/" back/.env
        else
            # macOS sed 兼容写法
            sed -i '' "s/SECRET_KEY=.*/SECRET_KEY=$SECRET_KEY/" back/.env
        fi

        # 生成 ADMIN_PASSWORD_HASH（默认密码：admin123）
        echo "Generating ADMIN_PASSWORD_HASH (default password: admin123)..."
        PYTHON_CMD="python3"
        if ! command -v python3 &>/dev/null; then
            PYTHON_CMD="python"
        fi
        ADMIN_PASSWORD_HASH=$($PYTHON_CMD -c "from passlib.context import CryptContext; pwd_context = CryptContext(schemes=['bcrypt'], deprecated='auto'); print(pwd_context.hash('admin123'))" 2>/dev/null || echo '$2b$12$placeholder')
        if sed --version 2>/dev/null | grep -q GNU; then
            sed -i "s/ADMIN_PASSWORD_HASH=.*/ADMIN_PASSWORD_HASH=$ADMIN_PASSWORD_HASH/" back/.env
        else
            sed -i '' "s/ADMIN_PASSWORD_HASH=.*/ADMIN_PASSWORD_HASH=$ADMIN_PASSWORD_HASH/" back/.env
        fi

        echo "✓ .env file generated successfully!"
        echo "  - Default admin password: admin123"
        echo "  - Please change the password after first login"
    else
        echo "Error: back/.env.example not found"
        exit 1
    fi
else
    echo ".env file already exists, skipping generation."
fi

# 检查前端构建文件
echo "Checking frontend build files..."
if [ ! -d "front/hanzi-lookup-system/build" ]; then
    echo "Error: frontend build files not found in front/hanzi-lookup-system/build"
    echo "Please make sure you have uploaded the build files to the correct location."
    exit 1
fi

# 检查 nginx 配置文件
echo "Checking nginx configuration..."
if [ ! -f "front/hanzi-lookup-system/nginx.conf" ]; then
    echo "Error: nginx.conf not found in front/hanzi-lookup-system directory"
    exit 1
fi

# 停止并删除现有容器和卷
echo "Cleaning up existing containers and volumes..."
docker-compose down -v || true

# 创建必要的目录
echo "Creating necessary directories..."
mkdir -p front/hanzi-lookup-system/build

# 构建并启动容器
echo "Building and starting containers..."
docker-compose up -d --build

# 等待容器启动
echo "Waiting for containers to start..."
sleep 5

# 显示容器状态
echo "Container status:"
docker-compose ps

# 显示后端容器日志
echo "Backend container logs:"
docker-compose logs backend

# 检查服务是否正常运行
echo "Checking services..."
if curl -s http://localhost > /dev/null; then
    echo "✓ Frontend is running at http://localhost"
else
    echo "Warning: Frontend may not be accessible"
fi

if curl -s http://localhost/api/v1/health > /dev/null; then
    echo "✓ Backend API is running at http://localhost/api"
else
    echo "Warning: Backend API may not be accessible"
fi

echo "Deployment completed!"
echo "Frontend: http://localhost"
echo "Backend API: http://localhost/api"
