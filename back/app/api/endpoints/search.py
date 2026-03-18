"""
搜索相关的API端点
"""

from fastapi import APIRouter, Depends, Query, HTTPException, Body
from typing import Dict, Any
import sqlite3
from pydantic import BaseModel

from app.core.database import get_db
from app.schemas.character import SearchResult, SearchParams
from app.services.dictionary import DictionaryService

# 创建路由
router = APIRouter()

# 定义请求体模型
class SearchRecord(BaseModel):
    search_term: str

@router.get("", response_model=SearchResult, summary="搜索汉字")
async def search_characters(
    q: str = Query(..., description="搜索关键词"),
    lang: str = Query(..., description="搜索语言 (ja: 日语, cn: 中文)"),
    limit: int = Query(20, description="结果数量限制", ge=1, le=100),
    offset: int = Query(0, description="结果偏移量", ge=0),
    db: sqlite3.Connection = Depends(get_db)
) -> Dict[str, Any]:
    """
    搜索汉字
    
    - **q**: 搜索关键词
    - **lang**: 搜索语言 (ja: 日语, cn: 中文)
    - **limit**: 结果数量限制 (1-100)
    - **offset**: 结果偏移量
    
    示例:
    - `/api/v1/search?q=愛&lang=ja` - 搜索日语汉字"愛"
    - `/api/v1/search?q=爱&lang=cn` - 搜索中文汉字"爱"
    - `/api/v1/search?q=アイ&lang=ja` - 搜索日语读音"アイ"
    - `/api/v1/search?q=ai&lang=cn` - 搜索中文拼音"ai"
    """
    if lang not in ["ja", "cn"]:
        raise HTTPException(status_code=400, detail="lang参数必须是'ja'或'cn'")
    
    try:
        if lang == "ja":
            total, results = DictionaryService.search_by_japanese(db, q, limit, offset)
        else:
            total, results = DictionaryService.search_by_chinese(db, q, limit, offset)
        
        return {"total": total, "items": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/hot")
async def get_hot_searches(
    limit: int = 10,
    db: sqlite3.Connection = Depends(get_db)
):
    """获取热门搜索词"""
    try:
        hot_searches = DictionaryService.get_hot_searches(db, limit)
        return hot_searches
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/record")
async def record_search(
    search_record: SearchRecord = Body(...),
    db: sqlite3.Connection = Depends(get_db)
):
    """记录搜索词"""
    try:
        DictionaryService.record_search(db, search_record.search_term)
        return {"message": "Search recorded successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))