"""
配置管理模块
"""
import os
from typing import Optional, Dict, Any
from pydantic import BaseModel
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    """应用配置"""
    
    # API配置
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "日中汉字互查API"
    PROJECT_DESCRIPTION: str = "提供日语和中文汉字查询服务的RESTful API"
    VERSION: str = "1.0.0"
    
    # 数据库配置
    # 默认数据库路径 - 可以被环境变量或命令行参数覆盖
    DEFAULT_DB_PATH: str = "/app/data/dictionary.db"
    
    # CORS设置
    CORS_ORIGINS: list = ["*"]
    
    # 分页默认值
    DEFAULT_LIMIT: int = 20
    MAX_LIMIT: int = 100
    
    class Config:
        env_file = ".env"
        case_sensitive = True

# 全局设置实例
settings = Settings()