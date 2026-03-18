"""
API路由注册
将各端点导入并注册到主路由器
"""

from fastapi import APIRouter

from app.api.endpoints import search, characters, stats, admin, health
from app.core.config import settings

# 创建主路由
api_router = APIRouter(prefix=settings.API_V1_STR)

# 注册子路由
api_router.include_router(health.router, tags=["health"])
api_router.include_router(search.router, prefix="/search", tags=["search"])
api_router.include_router(characters.router, prefix="/characters", tags=["characters"])
api_router.include_router(stats.router, prefix="/stats", tags=["stats"])
api_router.include_router(admin.router, prefix="/admin", tags=["admin"])