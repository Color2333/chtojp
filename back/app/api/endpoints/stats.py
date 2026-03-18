"""
统计信息相关的API端点
"""

from fastapi import APIRouter, Depends, HTTPException
from typing import Dict, Any
import sqlite3

from app.core.database import get_db
from app.schemas.character import DatabaseStats
from app.services.dictionary import DictionaryService

# 创建路由
router = APIRouter(tags=["stats"])

@router.get("", response_model=DatabaseStats, summary="获取数据库统计信息")
async def get_stats(
    db: sqlite3.Connection = Depends(get_db)
) -> Dict[str, Any]:
    """
    获取数据库统计信息
    
    返回关于数据库中汉字的各种统计信息，包括:
    - 总汉字数
    - 各级别汉字数量
    - 字体一致/不一致数量
    - 各五十音分组汉字数量
    
    示例:
    - `/api/v1/stats` - 获取数据库统计信息
    """
    try:
        stats = DictionaryService.get_database_stats(db)
        return {
            "total_characters": stats.total_characters,
            "level_counts": stats.level_counts,
            "form_matches": stats.form_matches,
            "kana_groups": stats.kana_groups
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))