"""
应用主入口文件
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
import os

from app.api.routes import api_router
from app.core.config import settings
from app.core.database import init_db


# ==================== 应用生命周期管理 ====================

@asynccontextmanager
async def lifespan(app: FastAPI):
    """应用生命周期管理"""
    # 启动时执行
    print(f"API服务已启动 - 版本: {settings.VERSION}")
    print(f"速率限制: 每分钟 {settings.RATE_LIMIT_PER_MINUTE} 次")
    print(f"CORS允许来源: {', '.join(settings.CORS_ORIGINS)}")
    yield
    # 关闭时执行
    print("API服务已关闭")

# 初始化数据库
init_db()

# 创建速率限制器
limiter = Limiter(
    key_func=get_remote_address,
    default_limits=[f"{settings.RATE_LIMIT_PER_MINUTE}/minute"]
)

# 创建FastAPI应用
app = FastAPI(
    title=settings.PROJECT_NAME,
    description=settings.PROJECT_DESCRIPTION,
    version=settings.VERSION,
    lifespan=lifespan,
    # 关闭默认的/docs和/redoc路径
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json"
)

# 添加速率限制中间件
app.state.limiter = limiter
app.add_middleware(SlowAPIMiddleware)

# 添加CORS中间件
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 注册路由
app.include_router(api_router)


# ==================== 速率限制异常处理 ====================

from fastapi.responses import JSONResponse

@app.exception_handler(RateLimitExceeded)
async def rate_limit_exceeded_handler(request, exc):
    """处理速率限制异常"""
    return JSONResponse(
        status_code=429,
        content={
            "detail": "请求过于频繁，请稍后再试",
            "error": "rate_limit_exceeded"
        }
    )


# ==================== 应用端点 ====================

# 根路径
@app.get("/")
async def root():
    """API根路径，提供基本信息"""
    return {
        "name": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "docs": "/api/docs",
        "redoc": "/api/redoc"
    }


# ==================== 程序入口 ====================
if __name__ == "__main__":
    import uvicorn

    # 获取环境变量中的端口，如果没有则使用8000
    port = int(os.environ.get("PORT", 8000))

    # 启动服务
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=port,
        reload=True
    )
