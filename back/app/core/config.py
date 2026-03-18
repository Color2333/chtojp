"""
配置管理模块
"""
import os
import json
from typing import Optional, Dict, Any, List
from datetime import timedelta
from pydantic import BaseModel, field_validator, ConfigDict
from pydantic_settings import BaseSettings, SettingsConfigDict

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

    # CORS设置 - 从环境变量读取 JSON 数组
    CORS_ORIGINS: List[str] = ["https://jp.jjhh.xyz", "http://localhost:3000"]

    @field_validator('CORS_ORIGINS', mode='before')
    @classmethod
    def parse_cors_origins(cls, v):
        """解析 CORS_ORIGINS，支持 JSON 数组字符串或逗号分隔字符串"""
        if isinstance(v, str):
            try:
                return json.loads(v)
            except json.JSONDecodeError:
                return [origin.strip() for origin in v.split(",")]
        return v

    # 分页默认值
    DEFAULT_LIMIT: int = 20
    MAX_LIMIT: int = 100

    # JWT 认证配置
    SECRET_KEY: str = "your-secret-key-here-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24小时
    ADMIN_PASSWORD_HASH: str = ""  # 管理员密码的 bcrypt 哈希

    # 速率限制配置
    RATE_LIMIT_PER_MINUTE: int = 60

    @property
    def access_token_expires(self) -> timedelta:
        """返回访问令牌过期时间"""
        return timedelta(minutes=self.ACCESS_TOKEN_EXPIRE_MINUTES)

    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=True,
        env_ignore_empty=True
    )

# 全局设置实例
settings = Settings()