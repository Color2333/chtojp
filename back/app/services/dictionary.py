"""
词典服务模块
提供汉字查询和处理的业务逻辑
"""

import sqlite3
from typing import List, Dict, Optional, Tuple, Any
import re

from app.models.character import CharacterDetail, DatabaseStats

def _escape_like(keyword: str) -> str:
    """转义 LIKE 查询中的特殊字符 % 和 _"""
    return keyword.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_")

class DictionaryService:
    """提供词典相关的业务逻辑"""

    @staticmethod
    def search_by_japanese(
        conn: sqlite3.Connection,
        keyword: str,
        limit: int = 20,
        offset: int = 0
    ) -> Tuple[int, List[Dict[str, Any]]]:
        """
        按日语搜索汉字

        Args:
            conn: 数据库连接
            keyword: 搜索关键词
            limit: 返回结果数量
            offset: 结果偏移量

        Returns:
            total: 总匹配结果数
            results: 汉字列表
        """
        cursor = conn.cursor()

        # 检查是否为假名搜索
        is_kana = bool(re.match(r'^[ぁ-んァ-ン]+$', keyword))

        # 获取总数
        if is_kana:
            cursor.execute('''
            SELECT COUNT(*) FROM character_view
            WHERE on_readings LIKE ? OR kun_readings LIKE ?
            ''', (f'%{_escape_like(keyword)}%' ESCAPE '\\', f'%{_escape_like(keyword)}%' ESCAPE '\\'))
        else:
            cursor.execute('''
            SELECT COUNT(*) FROM character_view
            WHERE japanese_kanji LIKE ? OR on_readings LIKE ? OR kun_readings LIKE ?
            ''', (f'%{_escape_like(keyword)}%' ESCAPE '\\', f'%{_escape_like(keyword)}%' ESCAPE '\\', f'%{_escape_like(keyword)}%' ESCAPE '\\'))

        total = cursor.fetchone()[0]

        # 获取数据
        if is_kana:
            cursor.execute('''
            SELECT * FROM character_view
            WHERE on_readings LIKE ? OR kun_readings LIKE ?
            ORDER BY
                CASE
                    WHEN on_readings = ? OR kun_readings = ? THEN 1
                    WHEN on_readings LIKE ? OR kun_readings LIKE ? THEN 2
                    ELSE 3
                END,
                LENGTH(japanese_kanji),
                id
            LIMIT ? OFFSET ?
            ''', (
                f'%{_escape_like(keyword)}%' ESCAPE '\\', f'%{_escape_like(keyword)}%' ESCAPE '\\',
                keyword, keyword,
                f'{_escape_like(keyword)}%' ESCAPE '\\', f'{_escape_like(keyword)}%' ESCAPE '\\',
                limit, offset
            ))
        else:
            cursor.execute('''
            SELECT * FROM character_view
            WHERE japanese_kanji LIKE ? OR on_readings LIKE ? OR kun_readings LIKE ?
            ORDER BY
                CASE
                    WHEN japanese_kanji = ? THEN 1
                    WHEN japanese_kanji LIKE ? THEN 2
                    WHEN on_readings LIKE ? OR kun_readings LIKE ? THEN 3
                    ELSE 4
                END,
                LENGTH(japanese_kanji),
                id
            LIMIT ? OFFSET ?
            ''', (
                f'%{_escape_like(keyword)}%' ESCAPE '\\', f'%{_escape_like(keyword)}%' ESCAPE '\\', f'%{_escape_like(keyword)}%' ESCAPE '\\',
                keyword, f'{_escape_like(keyword)}%' ESCAPE '\\', f'{_escape_like(keyword)}%' ESCAPE '\\', f'{_escape_like(keyword)}%' ESCAPE '\\',
                limit, offset
            ))

        # 转换结果
        results = []
        for row in cursor.fetchall():
            item = dict(row)
            # 将forms_match转换为布尔值
            if item['forms_match'] is not None:
                item['forms_match'] = bool(item['forms_match'])
            results.append(item)

        return total, results

    @staticmethod
    def search_by_chinese(
        conn: sqlite3.Connection,
        keyword: str,
        limit: int = 20,
        offset: int = 0
    ) -> Tuple[int, List[Dict[str, Any]]]:
        """
        按中文搜索汉字

        Args:
            conn: 数据库连接
            keyword: 搜索关键词
            limit: 返回结果数量
            offset: 结果偏移量

        Returns:
            total: 总匹配结果数
            results: 汉字列表
        """
        cursor = conn.cursor()

        # 检查是否是拼音
        is_pinyin = bool(re.match(r'^[a-zA-Z\u0300-\u036Fü]+$', keyword))

        # 获取总数
        if is_pinyin:
            cursor.execute('''
            SELECT COUNT(*) FROM character_view
            WHERE chinese_readings LIKE ?
            ''', (f'%{_escape_like(keyword)}%' ESCAPE '\\',))
        else:
            cursor.execute('''
            SELECT COUNT(*) FROM character_view
            WHERE chinese_hanzi LIKE ? OR chinese_readings LIKE ?
            ''', (f'%{_escape_like(keyword)}%' ESCAPE '\\', f'%{_escape_like(keyword)}%' ESCAPE '\\'))

        total = cursor.fetchone()[0]

        # 获取数据
        if is_pinyin:
            cursor.execute('''
            SELECT * FROM character_view
            WHERE chinese_readings LIKE ?
            ORDER BY
                CASE
                    WHEN chinese_readings = ? THEN 1
                    WHEN chinese_readings LIKE ? THEN 2
                    ELSE 3
                END,
                LENGTH(chinese_hanzi),
                id
            LIMIT ? OFFSET ?
            ''', (
                f'%{_escape_like(keyword)}%' ESCAPE '\\',
                keyword, f'{_escape_like(keyword)}%' ESCAPE '\\',
                limit, offset
            ))
        else:
            cursor.execute('''
            SELECT * FROM character_view
            WHERE chinese_hanzi LIKE ? OR chinese_readings LIKE ?
            ORDER BY
                CASE
                    WHEN chinese_hanzi = ? THEN 1
                    WHEN chinese_hanzi LIKE ? THEN 2
                    WHEN chinese_readings LIKE ? THEN 3
                    ELSE 4
                END,
                LENGTH(chinese_hanzi),
                id
            LIMIT ? OFFSET ?
            ''', (
                f'%{_escape_like(keyword)}%' ESCAPE '\\', f'%{_escape_like(keyword)}%' ESCAPE '\\',
                keyword, f'{_escape_like(keyword)}%' ESCAPE '\\', f'{_escape_like(keyword)}%' ESCAPE '\\',
                limit, offset
            ))

        # 转换结果
        results = []
        for row in cursor.fetchall():
            item = dict(row)
            # 将forms_match转换为布尔值
            if item['forms_match'] is not None:
                item['forms_match'] = bool(item['forms_match'])
            results.append(item)

        return total, results

    @staticmethod
    def get_character_by_id(
        conn: sqlite3.Connection,
        char_id: str
    ) -> Optional[Dict[str, Any]]:
        """
        按ID获取汉字详情

        Args:
            conn: 数据库连接
            char_id: 汉字ID

        Returns:
            character: 汉字详情或None
        """
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM character_view WHERE id = ?", (char_id,))

        row = cursor.fetchone()
        if not row:
            return None

        character = dict(row)

        # 将forms_match转换为布尔值
        if character['forms_match'] is not None:
            character['forms_match'] = bool(character['forms_match'])

        return character

    @staticmethod
    def get_random_character(
        conn: sqlite3.Connection
    ) -> Optional[Dict[str, Any]]:
        """
        获取随机汉字

        Args:
            conn: 数据库连接

        Returns:
            character: 随机汉字或None
        """
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM character_view ORDER BY RANDOM() LIMIT 1")

        row = cursor.fetchone()
        if not row:
            return None

        character = dict(row)

        # 将forms_match转换为布尔值
        if character['forms_match'] is not None:
            character['forms_match'] = bool(character['forms_match'])

        return character

    @staticmethod
    def get_levels(conn: sqlite3.Connection) -> List[str]:
        """
        获取所有汉字级别

        Args:
            conn: 数据库连接

        Returns:
            levels: 级别列表
        """
        cursor = conn.cursor()
        cursor.execute('''
        SELECT DISTINCT level
        FROM characters
        WHERE level IS NOT NULL
        ORDER BY level
        ''')
        return [row[0] for row in cursor.fetchall()]

    @staticmethod
    def get_characters_by_level(
        conn: sqlite3.Connection,
        level: str,
        limit: int = 20,
        offset: int = 0
    ) -> Tuple[int, List[Dict[str, Any]]]:
        """
        按级别获取汉字

        Args:
            conn: 数据库连接
            level: 级别
            limit: 返回结果数量
            offset: 结果偏移量

        Returns:
            total: 总匹配结果数
            results: 汉字列表
        """
        cursor = conn.cursor()

        # 获取总数
        cursor.execute("SELECT COUNT(*) FROM character_view WHERE level = ?", (level,))
        total = cursor.fetchone()[0]

        # 获取数据
        cursor.execute('''
        SELECT * FROM character_view
        WHERE level = ?
        ORDER BY id
        LIMIT ? OFFSET ?
        ''', (level, limit, offset))

        # 转换结果
        results = []
        for row in cursor.fetchall():
            item = dict(row)
            # 将forms_match转换为布尔值
            if item['forms_match'] is not None:
                item['forms_match'] = bool(item['forms_match'])
            results.append(item)

        return total, results

    @staticmethod
    def get_database_stats(conn: sqlite3.Connection) -> DatabaseStats:
        """
        获取数据库统计信息

        Args:
            conn: 数据库连接

        Returns:
            stats: 数据库统计信息
        """
        cursor = conn.cursor()

        # 总汉字数
        cursor.execute("SELECT COUNT(*) FROM characters")
        total_characters = cursor.fetchone()[0]

        # 级别统计
        cursor.execute('''
        SELECT level, COUNT(*) as count
        FROM characters
        WHERE level IS NOT NULL
        GROUP BY level
        ORDER BY level
        ''')
        level_counts = {row[0]: row[1] for row in cursor.fetchall()}

        # 字体一致统计
        cursor.execute('''
        SELECT
            CASE
                WHEN forms_match = 1 THEN "一致"
                WHEN forms_match = 0 THEN "不一致"
                ELSE "未知"
            END as match_status,
            COUNT(*) as count
        FROM characters
        GROUP BY match_status
        ''')
        form_matches = {row[0]: row[1] for row in cursor.fetchall()}

        # 五十音统计
        cursor.execute('''
        SELECT kana_group, COUNT(*) as count
        FROM characters
        WHERE kana_group IS NOT NULL
        GROUP BY kana_group
        ORDER BY kana_group
        ''')
        kana_groups = {row[0]: row[1] for row in cursor.fetchall()}

        return DatabaseStats(
            total_characters=total_characters,
            level_counts=level_counts,
            form_matches=form_matches,
            kana_groups=kana_groups
        )

    @staticmethod
    def create_character(
        conn: sqlite3.Connection,
        character: Any
    ) -> Dict[str, Any]:
        """
        创建新汉字
        
        Args:
            conn: 数据库连接
            character: 汉字信息（支持 dict 或 object）
            
        Returns:
            character: 创建的汉字信息
        """
        cursor = conn.cursor()

        # 兼容 dict 和 object 两种传入方式
        char_id = character['id'] if isinstance(character, dict) else character.id
        kana_group = character['kana_group'] if isinstance(character, dict) else character.kana_group
        japanese_kanji = character['japanese_kanji'] if isinstance(character, dict) else character.japanese_kanji
        chinese_hanzi = character['chinese_hanzi'] if isinstance(character, dict) else character.chinese_hanzi
        level = character['level'] if isinstance(character, dict) else character.level
        forms_match = character['forms_match'] if isinstance(character, dict) else character.forms_match
        examples = character['examples'] if isinstance(character, dict) else character.examples
        on_readings = character.get('on_readings') if isinstance(character, dict) else character.on_readings
        kun_readings = character.get('kun_readings') if isinstance(character, dict) else character.kun_readings
        chinese_readings = character.get('chinese_readings') if isinstance(character, dict) else character.chinese_readings

        # 检查ID是否已存在
        cursor.execute("SELECT id FROM characters WHERE id = ?", (char_id,))
        if cursor.fetchone():
            raise ValueError(f"ID {char_id} 已存在")
        
        # 插入基本信息
        cursor.execute('''
        INSERT INTO characters (
            id, kana_group, japanese_kanji, chinese_hanzi,
            level, forms_match, examples
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (
            char_id, kana_group, japanese_kanji, chinese_hanzi,
            level, forms_match, examples
        ))
        
        # 插入读音信息
        if on_readings:
            for i, reading in enumerate(on_readings):
                cursor.execute('''
                INSERT INTO japanese_readings (
                    character_id, reading_type, reading_index, reading_value
                ) VALUES (?, 'on', ?, ?)
                ''', (char_id, i, reading))
        
        if kun_readings:
            for i, reading in enumerate(kun_readings):
                cursor.execute('''
                INSERT INTO japanese_readings (
                    character_id, reading_type, reading_index, reading_value
                ) VALUES (?, 'kun', ?, ?)
                ''', (char_id, i, reading))
        
        if chinese_readings:
            for i, reading in enumerate(chinese_readings):
                cursor.execute('''
                INSERT INTO chinese_readings (
                    character_id, reading_index, reading_value
                ) VALUES (?, ?, ?)
                ''', (char_id, i, reading))
        
        conn.commit()
        
        return DictionaryService.get_character_by_id(conn, char_id)

    @staticmethod
    def update_character(
        conn: sqlite3.Connection,
        char_id: str,
        character: Any
    ) -> Dict[str, Any]:
        """
        更新汉字信息

        Args:
            conn: 数据库连接
            char_id: 汉字ID
            character: 更新后的汉字信息（支持 dict 或 object）

        Returns:
            character: 更新后的汉字信息
        """
        cursor = conn.cursor()

        # 检查汉字是否存在
        cursor.execute("SELECT id FROM characters WHERE id = ?", (char_id,))
        if not cursor.fetchone():
            raise ValueError(f"未找到ID为 {char_id} 的汉字")

        # 兼容 dict 和 object 两种传入方式
        kana_group = character['kana_group'] if isinstance(character, dict) else character.kana_group
        japanese_kanji = character['japanese_kanji'] if isinstance(character, dict) else character.japanese_kanji
        chinese_hanzi = character['chinese_hanzi'] if isinstance(character, dict) else character.chinese_hanzi
        level = character['level'] if isinstance(character, dict) else character.level
        forms_match = character['forms_match'] if isinstance(character, dict) else character.forms_match
        examples = character['examples'] if isinstance(character, dict) else character.examples
        on_readings = character.get('on_readings') if isinstance(character, dict) else character.on_readings
        kun_readings = character.get('kun_readings') if isinstance(character, dict) else character.kun_readings
        chinese_readings = character.get('chinese_readings') if isinstance(character, dict) else character.chinese_readings

        # 更新基本信息
        cursor.execute('''
        UPDATE characters SET
            kana_group = ?,
            japanese_kanji = ?,
            chinese_hanzi = ?,
            level = ?,
            forms_match = ?,
            examples = ?
        WHERE id = ?
        ''', (
            kana_group, japanese_kanji, chinese_hanzi,
            level, forms_match, examples,
            char_id
        ))

        # 删除旧的读音信息
        cursor.execute("DELETE FROM japanese_readings WHERE character_id = ?", (char_id,))
        cursor.execute("DELETE FROM chinese_readings WHERE character_id = ?", (char_id,))

        # 插入新的读音信息
        if on_readings:
            for i, reading in enumerate(on_readings):
                cursor.execute('''
                INSERT INTO japanese_readings (
                    character_id, reading_type, reading_index, reading_value
                ) VALUES (?, 'on', ?, ?)
                ''', (char_id, i, reading))

        if kun_readings:
            for i, reading in enumerate(kun_readings):
                cursor.execute('''
                INSERT INTO japanese_readings (
                    character_id, reading_type, reading_index, reading_value
                ) VALUES (?, 'kun', ?, ?)
                ''', (char_id, i, reading))

        if chinese_readings:
            for i, reading in enumerate(chinese_readings):
                cursor.execute('''
                INSERT INTO chinese_readings (
                    character_id, reading_index, reading_value
                ) VALUES (?, ?, ?)
                ''', (char_id, i, reading))

        conn.commit()

        # 返回更新后的汉字信息
        return DictionaryService.get_character_by_id(conn, char_id)

    @staticmethod
    def delete_character(
        conn: sqlite3.Connection,
        char_id: str
    ) -> None:
        """
        删除汉字

        Args:
            conn: 数据库连接
            char_id: 汉字ID
        """
        cursor = conn.cursor()

        # 检查汉字是否存在
        cursor.execute("SELECT id FROM characters WHERE id = ?", (char_id,))
        if not cursor.fetchone():
            raise ValueError(f"未找到ID为 {char_id} 的汉字")

        # 删除相关数据
        cursor.execute("DELETE FROM japanese_readings WHERE character_id = ?", (char_id,))
        cursor.execute("DELETE FROM chinese_readings WHERE character_id = ?", (char_id,))
        cursor.execute("DELETE FROM characters WHERE id = ?", (char_id,))

        conn.commit()

    @staticmethod
    def get_hot_searches(conn: sqlite3.Connection, limit: int = 10) -> List[Dict[str, Any]]:
        """获取热门搜索词"""
        cursor = conn.cursor()
        cursor.execute("""
            SELECT search_term as term, search_count as count
            FROM hot_searches
            ORDER BY search_count DESC, last_searched DESC
            LIMIT ?
        """, (limit,))

        return [dict(row) for row in cursor.fetchall()]

    @staticmethod
    def record_search(conn: sqlite3.Connection, search_term: str) -> None:
        """记录搜索词"""
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO hot_searches (search_term, search_count, last_searched)
            VALUES (?, 1, CURRENT_TIMESTAMP)
            ON CONFLICT(search_term) DO UPDATE SET
                search_count = search_count + 1,
                last_searched = CURRENT_TIMESTAMP
        """, (search_term,))
        conn.commit()