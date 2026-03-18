FROM python:3.10-slim

WORKDIR /app

# 1. 设置环境变量
ENV PYTHONUNBUFFERED=1 \
    PIP_DEFAULT_TIMEOUT=100 \
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    PIP_NO_CACHE_DIR=1 \
    PYTHONPATH=/app \
    DATABASE_URL="sqlite:///app/data/dictionary.db"

# 2. 配置 APT 源并安装依赖
RUN set -ex; \
    # 删除所有现有源
    rm -f /etc/apt/sources.list /etc/apt/sources.list.d/* && \
    # 配置阿里云源
    echo "deb http://mirrors.aliyun.com/debian/ bookworm main non-free contrib" > /etc/apt/sources.list && \
    echo "deb http://mirrors.aliyun.com/debian-security bookworm-security main non-free contrib" >> /etc/apt/sources.list && \
    echo "deb http://mirrors.aliyun.com/debian/ bookworm-updates main non-free contrib" >> /etc/apt/sources.list && \
    # 更新并安装必要的包
    apt-get update && \
    apt-get install -y --no-install-recommends \
    ca-certificates \
    curl \
    gnupg \
    sqlite3 \
    && \
    # 清理
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# 3. 配置 pip 源并安装依赖
COPY requirements.txt .
RUN set -ex; \
    # 配置多个镜像源
    pip config set global.index-url https://pypi.tuna.tsinghua.edu.cn/simple && \
    pip config set global.trusted-host pypi.tuna.tsinghua.edu.cn && \
    # 安装依赖，添加重试机制
    for i in $(seq 1 3); do \
    pip install --no-cache-dir -r requirements.txt && break || \
    echo "Attempt $i failed, retrying..." && \
    sleep 5; \
    done && \
    # 验证安装
    python -c "import fastapi; import uvicorn; import sqlalchemy; import pydantic_settings" && \
    # 确保 uvicorn 可执行文件存在
    which uvicorn

# 4. 复制代码并设置权限
COPY . .
RUN useradd -m appuser && \
    mkdir -p /app/data && \
    chown -R appuser:appuser /app && \
    chmod -R 755 /app/data

USER appuser

EXPOSE 8000
CMD ["/usr/local/bin/uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"] 