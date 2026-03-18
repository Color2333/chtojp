# 第一阶段：安装依赖
FROM node:18-slim as deps
WORKDIR /app
COPY package*.json ./
RUN npm install --production --no-optional --no-audit --no-fund --no-package-lock

# 第二阶段：构建应用
FROM node:18-slim as builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# 设置 Node.js 内存限制和构建参数
ENV NODE_OPTIONS="--max-old-space-size=1024"
ENV GENERATE_SOURCEMAP=false
ENV INLINE_RUNTIME_CHUNK=false
ENV NODE_ENV=production
ENV CI=true
ENV REACT_APP_API_BASE_URL=http://localhost/api
ENV BROWSER=none
ENV DISABLE_ESLINT_PLUGIN=true
ENV FAST_REFRESH=false

# 构建应用
RUN npm run build -- --max_old_space_size=1024

# 第三阶段：生产环境
FROM nginx:alpine
WORKDIR /usr/share/nginx/html

# 复制构建产物
COPY --from=builder /app/build .

# 复制 Nginx 配置
COPY nginx.conf /etc/nginx/nginx.conf

# 暴露端口
EXPOSE 80

# 启动 Nginx
CMD ["nginx", "-g", "daemon off;"] 