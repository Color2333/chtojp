"""
API测试
使用pytest和TestClient测试API端点
"""

import pytest
from fastapi.testclient import TestClient
import os
import sqlite3

from app.main import app
from app.core.config import settings
from app.core.database import get_db

# 创建测试客户端
client = TestClient(app)

# 使用测试数据库
TEST_DB_PATH = os.environ.get("TEST_DB_PATH", "test_dictionary.db")

# 测试数据
TEST_DATA = [
    {"id": "0001", "japanese_kanji": "愛", "chinese_hanzi": "爱", "kana_group": "ア", 
     "level": "一级汉字", "forms_match": 0, "examples": "愛情，愛読，恋愛"},
    {"id": "0002", "japanese_kanji": "哀", "chinese_hanzi": "哀", "kana_group": "ア", 
     "level": "一级汉字", "forms_match": 1, "examples": "哀愁，哀願，悲哀"},
    {"id": "0003", "japanese_kanji": "挨", "chinese_hanzi": "挨", "kana_group": "ア", 
     "level": "一级汉字", "forms_match": 1, "examples": "挨拶"},
]

# 日语读音测试数据
JP_READING_DATA = [
    {"character_id": "0001", "reading_type": "on", "reading_index": 1, "reading_value": "アイ"},
    {"character_id": "0002", "reading_type": "on", "reading_index": 1, "reading_value": "アイ"},
    {"character_id": "0002", "reading_type": "kun", "reading_index": 1, "reading_value": "あわれ"},
    {"character_id": "0002", "reading_type": "kun", "reading_index": 2, "reading_value": "あわれむ"},
    {"character_id": "0003", "reading_type": "on", "reading_index": 1, "reading_value": "アイ"},
]

# 中文读音测试数据
CN_READING_DATA = [
    {"character_id": "0001", "reading_index": 1, "reading_value": "ài"},
    {"character_id": "0002", "reading_index": 1, "reading_value": "āi"},
    {"character_id": "0003", "reading_index": 1, "reading_value": "āi"},
    {"character_id": "0003", "reading_index": 2, "reading_value": "ái"},
]

# 覆盖数据库依赖
def override_get_db():
    """获取测试数据库连接"""
    if os.path.exists(TEST_DB_PATH):
        os.unlink(TEST_DB_PATH)
    
    # 创建测试数据库
    conn = sqlite3.connect(TEST_DB_PATH)
    cursor = conn.cursor()
    
    # 创建表结构
    cursor.execute('''
    CREATE TABLE characters (
        id TEXT PRIMARY KEY,
        kana_group TEXT,
        japanese_kanji TEXT NOT NULL,
        chinese_hanzi TEXT NOT NULL,
        level TEXT,
        forms_match BOOLEAN,
        examples TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    ''')
    
    cursor.execute('''
    CREATE TABLE japanese_readings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        character_id TEXT NOT NULL,
        reading_type TEXT NOT NULL,
        reading_index INTEGER NOT NULL,
        reading_value TEXT NOT NULL,
        FOREIGN KEY (character_id) REFERENCES characters(id)
    )
    ''')
    
    cursor.execute('''
    CREATE TABLE chinese_readings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        character_id TEXT NOT NULL,
        reading_index INTEGER NOT NULL,
        reading_value TEXT NOT NULL,
        FOREIGN KEY (character_id) REFERENCES characters(id)
    )
    ''')
    
    # 创建索引
    cursor.execute('CREATE INDEX idx_japanese_kanji ON characters(japanese_kanji)')
    cursor.execute('CREATE INDEX idx_chinese_hanzi ON characters(chinese_hanzi)')
    
    # 创建视图
    cursor.execute('''
    CREATE VIEW character_view AS
    SELECT 
        c.id,
        c.kana_group,
        c.japanese_kanji,
        c.chinese_hanzi,
        c.level,
        c.forms_match,
        c.examples,
        group_concat(DISTINCT CASE 
            WHEN jr.reading_type = 'on' THEN jr.reading_value 
            ELSE NULL 
        END, '、') AS on_readings,
        group_concat(DISTINCT CASE 
            WHEN jr.reading_type = 'kun' THEN jr.reading_value 
            ELSE NULL 
        END, '、') AS kun_readings,
        group_concat(DISTINCT cr.reading_value, '、') AS chinese_readings
    FROM 
        characters c
    LEFT JOIN 
        japanese_readings jr ON c.id = jr.character_id
    LEFT JOIN 
        chinese_readings cr ON c.id = cr.character_id
    GROUP BY 
        c.id
    ''')
    
    # 插入测试数据
    for character in TEST_DATA:
        cursor.execute('''
        INSERT INTO characters 
        (id, kana_group, japanese_kanji, chinese_hanzi, level, forms_match, examples)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (
            character["id"], 
            character["kana_group"], 
            character["japanese_kanji"], 
            character["chinese_hanzi"], 
            character["level"], 
            character["forms_match"], 
            character["examples"]
        ))
    
    # 插入日语读音数据
    for reading in JP_READING_DATA:
        cursor.execute('''
        INSERT INTO japanese_readings 
        (character_id, reading_type, reading_index, reading_value)
        VALUES (?, ?, ?, ?)
        ''', (
            reading["character_id"], 
            reading["reading_type"], 
            reading["reading_index"], 
            reading["reading_value"]
        ))
    
    # 插入中文读音数据
    for reading in CN_READING_DATA:
        cursor.execute('''
        INSERT INTO chinese_readings 
        (character_id, reading_index, reading_value)
        VALUES (?, ?, ?)
        ''', (
            reading["character_id"], 
            reading["reading_index"], 
            reading["reading_value"]
        ))
    
    conn.commit()
    
    try:
        yield conn
    finally:
        conn.close()
        if os.path.exists(TEST_DB_PATH):
            os.unlink(TEST_DB_PATH)

# 使用测试数据库
app.dependency_overrides[get_db] = override_get_db

def test_read_main():
    """测试根路径"""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "name" in data
    assert "version" in data

def test_search_by_japanese():
    """测试日语搜索"""
    response = client.get(f"{settings.API_V1_STR}/search?q=愛&lang=ja")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 1
    assert len(data["items"]) == 1
    assert data["items"][0]["id"] == "0001"
    assert data["items"][0]["japanese_kanji"] == "愛"

def test_search_by_chinese():
    """测试中文搜索"""
    response = client.get(f"{settings.API_V1_STR}/search?q=爱&lang=cn")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 1
    assert len(data["items"]) == 1
    assert data["items"][0]["id"] == "0001"
    assert data["items"][0]["chinese_hanzi"] == "爱"

def test_search_by_reading():
    """测试读音搜索"""
    # 日语读音
    response = client.get(f"{settings.API_V1_STR}/search?q=アイ&lang=ja")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 3
    
    # 中文拼音
    response = client.get(f"{settings.API_V1_STR}/search?q=ai&lang=cn")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] > 0

def test_get_character_by_id():
    """测试按ID获取汉字"""
    response = client.get(f"{settings.API_V1_STR}/characters/0001")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == "0001"
    assert data["japanese_kanji"] == "愛"
    assert data["chinese_hanzi"] == "爱"
    assert data["on_readings"] == "アイ"
    assert data["chinese_readings"] == "ài"

def test_get_nonexistent_character():
    """测试获取不存在的汉字"""
    response = client.get(f"{settings.API_V1_STR}/characters/9999")
    assert response.status_code == 404

def test_get_random_character():
    """测试获取随机汉字"""
    response = client.get(f"{settings.API_V1_STR}/characters/random")
    assert response.status_code == 200
    data = response.json()
    assert "id" in data
    assert "japanese_kanji" in data
    assert "chinese_hanzi" in data

def test_get_levels():
    """测试获取所有级别"""
    response = client.get(f"{settings.API_V1_STR}/characters/levels")
    assert response.status_code == 200
    data = response.json()
    assert "一级汉字" in data

def test_get_characters_by_level():
    """测试按级别获取汉字"""
    response = client.get(f"{settings.API_V1_STR}/characters/level/一级汉字")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 3
    assert len(data["items"]) == 3

def test_get_stats():
    """测试获取统计信息"""
    response = client.get(f"{settings.API_V1_STR}/stats")
    assert response.status_code == 200
    data = response.json()
    assert data["total_characters"] == 3
    assert "level_counts" in data
    assert "form_matches" in data
    assert "kana_groups" in data