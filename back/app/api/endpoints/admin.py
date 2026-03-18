"""
管理后台API端点
提供管理员登录和汉字管理功能
"""

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Dict, Any, List
from pydantic import BaseModel
import sqlite3

from app.core.database import get_db
from app.core.auth import admin_auth, verify_admin, get_current_admin
from app.core.config import settings
from app.schemas.character import CharacterDetail
from app.services.dictionary import DictionaryService

# 创建路由
router = APIRouter(tags=["admin"])

# 安全配置
security = HTTPBearer()


# ==================== 请求/响应模型 ====================

class AdminLoginRequest(BaseModel):
    """管理员登录请求"""
    password: str


class AdminLoginResponse(BaseModel):
    """管理员登录响应"""
    access_token: str
    token_type: str = "bearer"
    expires_in: int  # 过期时间（秒）


class CharacterCreate(BaseModel):
    """创建汉字的请求模型"""
    id: str
    kana_group: str | None = None
    japanese_kanji: str
    chinese_hanzi: str
    level: str | None = None
    forms_match: bool | None = None
    examples: str | None = None
    on_readings: List[str] | None = None
    kun_readings: List[str] | None = None
    chinese_readings: List[str] | None = None


# ==================== 认证端点 ====================

@router.post("/login", response_model=AdminLoginResponse, summary="管理员登录")
async def admin_login(request: AdminLoginRequest) -> Dict[str, Any]:
    """
    管理员登录接口

    - **password**: 管理员密码

    返回 JWT 访问令牌
    """
    # 验证环境变量中是否配置了密码哈希
    if not settings.ADMIN_PASSWORD_HASH:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="服务器未配置管理员密码"
        )

    # 验证密码
    if not admin_auth.verify_password(request.password, settings.ADMIN_PASSWORD_HASH):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="密码错误",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # 创建访问令牌
    access_token = admin_auth.create_access_token(
        data={"sub": "admin"},
        expires_delta=settings.access_token_expires
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "expires_in": settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
    }


@router.get("/verify", summary="验证管理员令牌")
async def verify_token(current_admin: dict = Depends(get_current_admin)) -> Dict[str, Any]:
    """
    验证当前 JWT 令牌是否有效

    返回当前管理员信息
    """
    return {
        "valid": True,
        "admin": current_admin
    }


# ==================== 汉字管理端点 ====================

@router.post("/characters", response_model=CharacterDetail, summary="添加新汉字")
async def create_character(
    character: CharacterCreate,
    db: sqlite3.Connection = Depends(get_db),
    _: str = Depends(verify_admin)
) -> Dict[str, Any]:
    """
    添加新汉字

    - **character**: 汉字信息
    """
    try:
        return DictionaryService.create_character(db, character)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/characters/{id}", response_model=CharacterDetail, summary="更新汉字")
async def update_character(
    id: str,
    character: CharacterCreate,
    db: sqlite3.Connection = Depends(get_db),
    _: str = Depends(verify_admin)
) -> Dict[str, Any]:
    """
    更新汉字信息

    - **id**: 汉字ID
    - **character**: 更新后的汉字信息
    """
    try:
        return DictionaryService.update_character(db, id, character)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/characters/{id}", summary="删除汉字")
async def delete_character(
    id: str,
    db: sqlite3.Connection = Depends(get_db),
    _: str = Depends(verify_admin)
) -> Dict[str, Any]:
    """
    删除汉字

    - **id**: 汉字ID
    """
    try:
        DictionaryService.delete_character(db, id)
        return {"message": "汉字已删除"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
