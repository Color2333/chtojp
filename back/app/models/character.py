"""
数据库模型定义
"""
from dataclasses import dataclass
from typing import Optional, List, Dict, Any
import sqlite3

@dataclass
class Character:
    """汉字对象模型"""
    id: str
    japanese_kanji: str
    chinese_hanzi: str
    kana_group: Optional[str] = None
    level: Optional[str] = None
    forms_match: Optional[bool] = None
    examples: Optional[str] = None
    
    @classmethod
    def from_row(cls, row: sqlite3.Row) -> 'Character':
        """从数据库行创建对象"""
        # 将forms_match从整数转换为布尔值
        forms_match = None
        if row['forms_match'] is not None:
            forms_match = bool(row['forms_match'])
            
        return cls(
            id=row['id'],
            japanese_kanji=row['japanese_kanji'],
            chinese_hanzi=row['chinese_hanzi'],
            kana_group=row['kana_group'],
            level=row['level'],
            forms_match=forms_match,
            examples=row['examples']
        )

@dataclass
class CharacterDetail(Character):
    """带有读音信息的详细汉字对象"""
    on_readings: Optional[str] = None
    kun_readings: Optional[str] = None
    chinese_readings: Optional[str] = None
    
    @classmethod
    def from_row(cls, row: sqlite3.Row) -> 'CharacterDetail':
        """从数据库行创建对象"""
        # 将forms_match从整数转换为布尔值
        forms_match = None
        if row['forms_match'] is not None:
            forms_match = bool(row['forms_match'])
            
        return cls(
            id=row['id'],
            japanese_kanji=row['japanese_kanji'],
            chinese_hanzi=row['chinese_hanzi'],
            kana_group=row['kana_group'],
            level=row['level'],
            forms_match=forms_match,
            examples=row['examples'],
            on_readings=row['on_readings'],
            kun_readings=row['kun_readings'],
            chinese_readings=row['chinese_readings']
        )

@dataclass
class JapaneseReading:
    """日语读音模型"""
    id: int
    character_id: str
    reading_type: str  # 'on' 或 'kun'
    reading_index: int
    reading_value: str

@dataclass
class ChineseReading:
    """中文读音模型"""
    id: int
    character_id: str
    reading_index: int
    reading_value: str

@dataclass
class DatabaseStats:
    """数据库统计信息"""
    total_characters: int
    level_counts: Dict[str, int]
    form_matches: Dict[str, int]
    kana_groups: Dict[str, int]