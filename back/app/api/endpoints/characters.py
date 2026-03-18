"""
汉字相关的API端点
"""

from fastapi import APIRouter, Depends, Path, Query, HTTPException
from typing import Dict, Any, List
import sqlite3

from app.core.database import get_db
from app.schemas.character import CharacterDetail, SearchResult
from app.services.dictionary import DictionaryService

# 创建路由
router = APIRouter()

@router.get("", response_model=SearchResult, summary="获取所有汉字")
async def get_all_characters(
    limit: int = Query(20, description="结果数量限制", ge=1, le=100),
    offset: int = Query(0, description="结果偏移量", ge=0),
    db: sqlite3.Connection = Depends(get_db)
) -> Dict[str, Any]:
    """
    获取所有汉字列表

    - **limit**: 结果数量限制 (1-100)
    - **offset**: 结果偏移量

    示例:
    - `/api/v1/characters` - 获取所有汉字
    """
    try:
        cursor = db.cursor()

        # 获取总数
        cursor.execute("SELECT COUNT(*) FROM character_view")
        total = cursor.fetchone()[0]

        # 获取数据
        cursor.execute('''
        SELECT * FROM character_view
        ORDER BY id
        LIMIT ? OFFSET ?
        ''', (limit, offset))

        # 转换结果
        items = []
        for row in cursor.fetchall():
            item = dict(row)
            # 将forms_match转换为布尔值
            if item['forms_match'] is not None:
                item['forms_match'] = bool(item['forms_match'])
            # 确保所有必需的字段都存在
            if not all(k in item for k in ['id', 'japanese_kanji', 'chinese_hanzi']):
                continue
            items.append(item)

        return {"total": total, "items": items}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/levels", response_model=List[str], summary="获取所有级别")
async def get_levels(
    db: sqlite3.Connection = Depends(get_db)
) -> List[str]:
    """
    获取所有汉字级别

    示例:
    - `/api/v1/characters/levels` - 获取所有级别
    """
    try:
        return DictionaryService.get_levels(db)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/random", response_model=CharacterDetail, summary="获取随机汉字")
async def get_random_character(
    db: sqlite3.Connection = Depends(get_db)
) -> Dict[str, Any]:
    """
    获取随机汉字

    示例:
    - `/api/v1/characters/random` - 获取随机汉字
    """
    try:
        character = DictionaryService.get_random_character(db)
        if not character:
            raise HTTPException(status_code=404, detail="数据库中没有汉字")
        return character
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{id}", response_model=CharacterDetail, summary="获取汉字详情")
async def get_character(
    id: str = Path(..., description="汉字ID"),
    db: sqlite3.Connection = Depends(get_db)
) -> Dict[str, Any]:
    """
    获取指定ID的汉字详情

    - **id**: 汉字ID

    示例:
    - `/api/v1/characters/0001` - 获取ID为0001的汉字
    """
    try:
        character = DictionaryService.get_character_by_id(db, id)
        if not character:
            raise HTTPException(status_code=404, detail=f"未找到ID为{id}的汉字")
        return character
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/level/{level}", response_model=SearchResult, summary="按级别获取汉字")
async def get_characters_by_level(
    level: str = Path(..., description="汉字级别"),
    limit: int = Query(20, description="结果数量限制", ge=1, le=100),
    offset: int = Query(0, description="结果偏移量", ge=0),
    db: sqlite3.Connection = Depends(get_db)
) -> Dict[str, Any]:
    """
    获取指定级别的汉字

    - **level**: 汉字级别
    - **limit**: 结果数量限制 (1-100)
    - **offset**: 结果偏移量

    示例:
    - `/api/v1/characters/level/一级汉字` - 获取一级汉字
    """
    try:
        total, results = DictionaryService.get_characters_by_level(db, level, limit, offset)
        return {"total": total, "items": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))