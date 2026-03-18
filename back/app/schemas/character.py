"""
API数据结构定义

使用Pydantic模型来定义API的请求和响应数据结构，
这些模型用于数据验证、序列化和OpenAPI文档生成。
"""

from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, ConfigDict


class CharacterBase(BaseModel):
    """汉字基本信息"""
    id: str = Field(..., description="汉字ID")
    japanese_kanji: str = Field(..., description="日语汉字")
    chinese_hanzi: str = Field(..., description="中文汉字")
    kana_group: Optional[str] = Field(None, description="五十音分组")
    level: Optional[str] = Field(None, description="级别")
    forms_match: Optional[bool] = Field(None, description="字体是否一致")
    examples: Optional[str] = Field(None, description="用例")


class CharacterDetail(CharacterBase):
    """汉字详细信息（包含读音）"""
    on_readings: Optional[str] = Field(None, description="音读み")
    kun_readings: Optional[str] = Field(None, description="训读み")
    chinese_readings: Optional[str] = Field(None, description="中文读音")
    
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "id": "0001",
                "japanese_kanji": "愛",
                "chinese_hanzi": "爱",
                "kana_group": "ア",
                "level": "一级汉字",
                "forms_match": False,
                "examples": "愛情，愛読，恋愛",
                "on_readings": "アイ",
                "kun_readings": None,
                "chinese_readings": "ài"
            }
        }
    )


class SearchParams(BaseModel):
    """搜索参数"""
    q: str = Field(..., description="搜索关键词")
    lang: str = Field(..., description="搜索语言 (ja: 日语, cn: 中文)")
    limit: Optional[int] = Field(20, description="结果数量限制", ge=1, le=100)
    offset: Optional[int] = Field(0, description="结果偏移量", ge=0)
    
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "q": "愛",
                "lang": "ja",
                "limit": 20,
                "offset": 0
            }
        }
    )


class PaginationParams(BaseModel):
    """分页参数"""
    limit: Optional[int] = Field(20, description="结果数量限制", ge=1, le=100)
    offset: Optional[int] = Field(0, description="结果偏移量", ge=0)


class SearchResult(BaseModel):
    """搜索结果"""
    total: int = Field(..., description="总结果数")
    items: List[CharacterDetail] = Field(..., description="汉字列表")
    
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "total": 5,
                "items": [
                    {
                        "id": "0001",
                        "japanese_kanji": "愛",
                        "chinese_hanzi": "爱",
                        "kana_group": "ア",
                        "level": "一级汉字",
                        "forms_match": False,
                        "examples": "愛情，愛読，恋愛",
                        "on_readings": "アイ",
                        "kun_readings": None,
                        "chinese_readings": "ài"
                    }
                ]
            }
        }
    )


class DatabaseStats(BaseModel):
    """数据库统计信息"""
    total_characters: int = Field(..., description="总汉字数")
    level_counts: Dict[str, int] = Field(..., description="级别统计")
    form_matches: Dict[str, int] = Field(..., description="字体一致统计")
    kana_groups: Dict[str, int] = Field(..., description="五十音分组统计")
    
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "total_characters": 2139,
                "level_counts": {
                    "一级汉字": 1006,
                    "二级汉字": 983,
                    "三级汉字": 150
                },
                "form_matches": {
                    "一致": 1528,
                    "不一致": 611
                },
                "kana_groups": {
                    "ア": 120,
                    "イ": 85,
                    "ウ": 95,
                    "エ": 40,
                    "オ": 100
                }
            }
        }
    )