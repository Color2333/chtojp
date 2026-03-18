#!/bin/bash
set -e

echo "Setting up backend environment..."

# 安装 Python 和 pip
echo "Installing Python and pip..."
if ! command -v python3 &> /dev/null; then
    yum install -y python3 python3-pip
fi

# 进入后端目录
cd back

# 创建虚拟环境
echo "Creating virtual environment..."
python3 -m venv venv

# 激活虚拟环境
echo "Activating virtual environment..."
source venv/bin/activate

# 升级 pip
echo "Upgrading pip..."
pip install --upgrade pip

# 安装依赖
echo "Installing dependencies..."
pip install -r requirements.txt

# 初始化数据库
echo "Initializing database..."
python -c "from app.core.database import init_db; init_db()"

# 退出虚拟环境
deactivate

echo "Backend environment setup completed!" 