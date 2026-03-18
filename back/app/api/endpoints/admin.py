"""
管理后台API端点
"""

from fastapi import APIRouter, Depends, HTTPException, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Dict, Any, List
import sqlite3
from pydantic import BaseModel

from app.core.database import get_db
from app.schemas.character import CharacterDetail
from app.services.dictionary import DictionaryService

# 创建路由
router = APIRouter(tags=["admin"])

# 安全配置
security = HTTPBearer()

# 简单的管理员验证
ADMIN_TOKEN = "admin123"  # 在实际应用中应该使用更安全的方式存储

async def verify_admin(credentials: HTTPAuthorizationCredentials = Security(security)):
    if credentials.credentials != ADMIN_TOKEN:
        raise HTTPException(
            status_code=401,
            detail="无效的管理员令牌"
        )
    return credentials.credentials

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