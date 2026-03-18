"""
数据库连接和会话管理
"""
import sqlite3
import os
from contextlib import contextmanager
from fastapi import HTTPException, Depends
from typing import Generator

from app.core.config import settings

# 获取数据库路径：优先使用环境变量，其次使用配置文件中的默认路径
DB_PATH = os.getenv("DB_PATH", settings.DEFAULT_DB_PATH)

def get_db() -> Generator[sqlite3.Connection, None, None]:
    """
    数据库连接依赖函数
    用于FastAPI的依赖注入系统
    """
    # 检查数据库文件是否存在
    if not os.path.exists(DB_PATH):
        raise HTTPException(
            status_code=500, 
            detail=f"数据库文件不存在: {DB_PATH}"
        )
    
    conn = None
    try:
        # 建立连接，允许跨线程使用
        conn = sqlite3.connect(DB_PATH, check_same_thread=False)
        # 使用Row工厂，返回类似字典的对象
        conn.row_factory = sqlite3.Row
        yield conn
    except sqlite3.Error as e:
        raise HTTPException(
            status_code=500,
            detail=f"数据库连接错误: {str(e)}"
        )
    finally:
        # 确保连接关闭
        if conn:
            conn.close()

def create_view_if_not_exists(conn):
    """
    创建用于查询的视图（如果不存在）
    方便连接多个表的查询
    """
    cursor = conn.cursor()
    try:
        # 先删除已存在的视图
        cursor.execute('DROP VIEW IF EXISTS character_view')
        
        # 创建新视图
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
            COALESCE((
                SELECT GROUP_CONCAT(reading_value, '、')
                FROM japanese_readings
                WHERE character_id = c.id AND reading_type = 'on'
            ), '') as on_readings,
            COALESCE((
                SELECT GROUP_CONCAT(reading_value, '、')
                FROM japanese_readings
                WHERE character_id = c.id AND reading_type = 'kun'
            ), '') as kun_readings,
            COALESCE((
                SELECT GROUP_CONCAT(reading_value, '、')
                FROM chinese_readings
                WHERE character_id = c.id
            ), '') as chinese_readings
        FROM 
            characters c
        ''')
        conn.commit()
    except sqlite3.Error as e:
        print(f"创建视图时出错: {str(e)}")
        print(f"错误类型: {type(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"创建视图失败: {str(e)}"
        )

def init_db():
    """
    数据库初始化函数
    创建视图（如果数据库已存在）或创建表和视图（新数据库）
    """
    if os.path.exists(DB_PATH):
        print(f"数据库已存在: {DB_PATH}")
        # 数据库已存在，确保视图已创建
        conn = sqlite3.connect(DB_PATH, check_same_thread=False)
        conn.row_factory = sqlite3.Row
        create_view_if_not_exists(conn)
        conn.close()
        return
    
    # 如果目录不存在，创建目录
    db_dir = os.path.dirname(DB_PATH)
    if db_dir:  # 目录不为空时才创建
        os.makedirs(db_dir, exist_ok=True)
    
    # 显示警告信息
    print(f"数据库文件不存在: {DB_PATH}")
    print("正在创建空数据库...")
    
    # 创建新的数据库
    conn = sqlite3.connect(DB_PATH)
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
    create_view_if_not_exists(conn)
    
    conn.commit()
    conn.close()
    
    print(f"空数据库已创建: {DB_PATH}")

# 允许在导入此模块时更新数据库路径
def update_db_path(new_path):
    """更新数据库路径"""
    global DB_PATH
    DB_PATH = new_path
    print(f"数据库路径已更新: {DB_PATH}")