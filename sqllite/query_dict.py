"""
日中汉字查询工具
--------------
提供多种查询方式的日中汉字字典工具

用法: python query_dict.py [命令] [参数]

命令:
  jp <关键词>   - 按日语汉字或读音查询
  cn <关键词>   - 按中文汉字或拼音查询
  id <编号>     - 按编号查询
  random        - 随机获取一个汉字
  level <级别>  - 按级别查询汉字
  stats         - 显示数据库统计信息
"""

import sqlite3
import argparse
import sys
import json
import os
import re
from tabulate import tabulate  # 安装: pip install tabulate
import colorama  # 安装: pip install colorama
from colorama import Fore, Style

# 初始化颜色支持
colorama.init(autoreset=True)

def connect_to_database(db_path):
    """连接到SQLite数据库"""
    if not os.path.exists(db_path):
        print(f"错误: 数据库文件不存在: {db_path}")
        print("请先运行导入脚本创建数据库。")
        sys.exit(1)
        
    try:
        conn = sqlite3.connect(db_path)
        conn.row_factory = sqlite3.Row  # 启用行工厂，返回类似字典的行
        return conn
    except sqlite3.Error as e:
        print(f"错误: 连接数据库时出错: {e}")
        sys.exit(1)

def create_view_if_not_exists(conn):
    """创建查询视图（如果不存在）"""
    cursor = conn.cursor()
    cursor.execute('''
    CREATE VIEW IF NOT EXISTS character_view AS
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
    conn.commit()

def search_by_japanese(conn, keyword, limit=20):
    """按日语汉字或读音搜索"""
    cursor = conn.cursor()
    
    # 分离假名和汉字进行更精确的搜索
    is_kana = re.match(r'^[ぁ-んァ-ン]+$', keyword)
    is_kanji = not is_kana
    
    if is_kana:
        # 如果是假名，主要搜索读音
        cursor.execute('''
        SELECT c.* FROM character_view c
        WHERE c.on_readings LIKE ? OR c.kun_readings LIKE ?
        ORDER BY 
            CASE 
                WHEN c.on_readings = ? OR c.kun_readings = ? THEN 1
                WHEN c.on_readings LIKE ? OR c.kun_readings LIKE ? THEN 2
                ELSE 3
            END,
            LENGTH(c.japanese_kanji),
            c.id
        LIMIT ?
        ''', (
            f'%{keyword}%', f'%{keyword}%',
            keyword, keyword,
            f'{keyword}%', f'{keyword}%',
            limit
        ))
    else:
        # 如果是汉字，优先搜索汉字字段
        cursor.execute('''
        SELECT c.* FROM character_view c
        WHERE c.japanese_kanji LIKE ? OR c.on_readings LIKE ? OR c.kun_readings LIKE ?
        ORDER BY 
            CASE 
                WHEN c.japanese_kanji = ? THEN 1
                WHEN c.japanese_kanji LIKE ? THEN 2
                WHEN c.on_readings LIKE ? OR c.kun_readings LIKE ? THEN 3
                ELSE 4
            END,
            LENGTH(c.japanese_kanji),
            c.id
        LIMIT ?
        ''', (
            f'%{keyword}%', f'%{keyword}%', f'%{keyword}%',
            keyword, f'{keyword}%', f'{keyword}%', f'{keyword}%',
            limit
        ))
    
    return [dict(row) for row in cursor.fetchall()]

def search_by_chinese(conn, keyword, limit=20):
    """按中文汉字或拼音搜索"""
    cursor = conn.cursor()
    
    # 检查是否是拼音
    is_pinyin = re.match(r'^[a-zA-Z\u0300-\u036Fü]+$', keyword)
    
    if is_pinyin:
        # 如果是拼音，主要搜索拼音字段
        cursor.execute('''
        SELECT c.* FROM character_view c
        WHERE c.chinese_readings LIKE ?
        ORDER BY 
            CASE 
                WHEN c.chinese_readings = ? THEN 1
                WHEN c.chinese_readings LIKE ? THEN 2
                ELSE 3
            END,
            LENGTH(c.chinese_hanzi),
            c.id
        LIMIT ?
        ''', (
            f'%{keyword}%',
            keyword,
            f'{keyword}%',
            limit
        ))
    else:
        # 如果是汉字，优先搜索汉字字段
        cursor.execute('''
        SELECT c.* FROM character_view c
        WHERE c.chinese_hanzi LIKE ? OR c.chinese_readings LIKE ?
        ORDER BY 
            CASE 
                WHEN c.chinese_hanzi = ? THEN 1
                WHEN c.chinese_hanzi LIKE ? THEN 2
                WHEN c.chinese_readings LIKE ? THEN 3
                ELSE 4
            END,
            LENGTH(c.chinese_hanzi),
            c.id
        LIMIT ?
        ''', (
            f'%{keyword}%', f'%{keyword}%',
            keyword, f'{keyword}%', f'{keyword}%',
            limit
        ))
    
    return [dict(row) for row in cursor.fetchall()]

def get_character_by_id(conn, char_id):
    """按ID获取汉字"""
    cursor = conn.cursor()
    
    cursor.execute('SELECT * FROM character_view WHERE id = ?', (char_id,))
    character = cursor.fetchone()
    
    if not character:
        return None
    
    return dict(character)

def get_random_character(conn):
    """获取随机汉字"""
    cursor = conn.cursor()
    
    cursor.execute('SELECT * FROM character_view ORDER BY RANDOM() LIMIT 1')
    character = cursor.fetchone()
    
    if not character:
        return None
        
    return dict(character)

def search_by_level(conn, level, limit=20):
    """按级别搜索汉字"""
    cursor = conn.cursor()
    
    cursor.execute('''
    SELECT * FROM character_view 
    WHERE level LIKE ? 
    ORDER BY id 
    LIMIT ?
    ''', (f'%{level}%', limit))
    
    return [dict(row) for row in cursor.fetchall()]

def get_database_stats(conn):
    """获取数据库统计信息"""
    cursor = conn.cursor()
    
    stats = {}
    
    # 总汉字数
    cursor.execute('SELECT COUNT(*) FROM characters')
    stats['total_characters'] = cursor.fetchone()[0]
    
    # 级别统计
    cursor.execute('''
    SELECT level, COUNT(*) as count 
    FROM characters 
    WHERE level IS NOT NULL 
    GROUP BY level 
    ORDER BY level
    ''')
    stats['level_counts'] = {row['level']: row['count'] for row in cursor.fetchall()}
    
    # 字体一致统计
    cursor.execute('''
    SELECT forms_match, COUNT(*) as count 
    FROM characters 
    WHERE forms_match IS NOT NULL 
    GROUP BY forms_match
    ''')
    match_stats = {row['forms_match']: row['count'] for row in cursor.fetchall()}
    stats['matching_forms'] = match_stats.get(1, 0)
    stats['different_forms'] = match_stats.get(0, 0)
    
    # 五十音统计
    cursor.execute('''
    SELECT kana_group, COUNT(*) as count 
    FROM characters 
    WHERE kana_group IS NOT NULL 
    GROUP BY kana_group 
    ORDER BY kana_group
    ''')
    stats['kana_group_counts'] = {row['kana_group']: row['count'] for row in cursor.fetchall()}
    
    return stats

def format_character_table(characters):
    """将汉字数据格式化为表格"""
    if not characters:
        return "未找到匹配的汉字。"
    
    # 准备表格数据
    table_data = []
    for char in characters:
        forms_match = "是" if char['forms_match'] == 1 else "否" if char['forms_match'] == 0 else "-"
        
        # 裁剪长文本
        on_readings = char['on_readings'] if char['on_readings'] else "-"
        kun_readings = char['kun_readings'] if char['kun_readings'] else "-"
        chinese_readings = char['chinese_readings'] if char['chinese_readings'] else "-"
        examples = char['examples'] if char['examples'] else "-"
        if examples and len(examples) > 30:
            examples = examples[:27] + "..."
        
        table_data.append([
            char['id'],
            char['japanese_kanji'],
            char['chinese_hanzi'],
            on_readings,
            kun_readings,
            chinese_readings,
            char['level'] if char['level'] else "-",
            forms_match
        ])
    
    # 生成表格
    headers = ["ID", "日语汉字", "中文汉字", "音读み", "训读み", "拼音", "级别", "字体一致"]
    return tabulate(table_data, headers=headers, tablefmt="grid")

def format_character_detail(character):
    """详细格式化单个汉字信息"""
    if not character:
        return "未找到汉字。"
    
    forms_match = "是" if character['forms_match'] == 1 else "否" if character['forms_match'] == 0 else "未知"
    
    result = []
    result.append(f"{Fore.CYAN}┌{'─' * 50}┐")
    result.append(f"{Fore.CYAN}│ {Fore.YELLOW}汉字详情{' ' * 41}│")
    result.append(f"{Fore.CYAN}├{'─' * 50}┤")
    result.append(f"{Fore.CYAN}│ {Fore.WHITE}ID: {Fore.GREEN}{character['id']}{' ' * (44 - len(character['id']))}│")
    result.append(f"{Fore.CYAN}│ {Fore.WHITE}五十音组: {Fore.GREEN}{character['kana_group'] or '无'}{' ' * (39 - len(character['kana_group'] or '无'))}│")
    
    # 日语和中文汉字
    jp_kanji = character['japanese_kanji']
    cn_kanji = character['chinese_hanzi']
    result.append(f"{Fore.CYAN}│ {Fore.WHITE}日语汉字: {Fore.MAGENTA}{jp_kanji}{' ' * (39 - len(jp_kanji))}│")
    result.append(f"{Fore.CYAN}│ {Fore.WHITE}中文汉字: {Fore.MAGENTA}{cn_kanji}{' ' * (39 - len(cn_kanji))}│")
    
    # 读音信息
    on_readings = character['on_readings'] or '无'
    kun_readings = character['kun_readings'] or '无'
    cn_readings = character['chinese_readings'] or '无'
    
    result.append(f"{Fore.CYAN}│ {Fore.WHITE}音读み: {Fore.YELLOW}{on_readings}{' ' * (41 - len(on_readings))}│")
    result.append(f"{Fore.CYAN}│ {Fore.WHITE}训读み: {Fore.YELLOW}{kun_readings}{' ' * (41 - len(kun_readings))}│")
    result.append(f"{Fore.CYAN}│ {Fore.WHITE}中文读音: {Fore.YELLOW}{cn_readings}{' ' * (39 - len(cn_readings))}│")
    
    # 其他信息
    level = character['level'] or '未知'
    result.append(f"{Fore.CYAN}│ {Fore.WHITE}级别: {Fore.GREEN}{level}{' ' * (43 - len(level))}│")
    result.append(f"{Fore.CYAN}│ {Fore.WHITE}字体一致: {Fore.GREEN}{forms_match}{' ' * (39 - len(forms_match))}│")
    
    # 用例
    examples = character['examples'] or '无'
    # 如果用例太长，分行显示
    if len(examples) > 46:
        result.append(f"{Fore.CYAN}│ {Fore.WHITE}用例:{' ' * 44}│")
        
        # 按照每行45个字符拆分
        for i in range(0, len(examples), 45):
            line = examples[i:i+45]
            result.append(f"{Fore.CYAN}│ {Fore.GREEN}{line}{' ' * (48 - len(line))}│")
    else:
        result.append(f"{Fore.CYAN}│ {Fore.WHITE}用例: {Fore.GREEN}{examples}{' ' * (43 - len(examples))}│")
    
    result.append(f"{Fore.CYAN}└{'─' * 50}┘")
    
    return "\n".join(result)

def format_stats(stats):
    """格式化数据库统计信息"""
    result = []
    result.append(f"{Fore.CYAN}┌{'─' * 50}┐")
    result.append(f"{Fore.CYAN}│ {Fore.YELLOW}数据库统计信息{' ' * 37}│")
    result.append(f"{Fore.CYAN}├{'─' * 50}┤")
    
    # 总汉字数
    result.append(f"{Fore.CYAN}│ {Fore.WHITE}总汉字数: {Fore.GREEN}{stats['total_characters']}{' ' * (39 - len(str(stats['total_characters'])))}│")
    
    # 字体统计
    match_count = stats['matching_forms']
    diff_count = stats['different_forms']
    result.append(f"{Fore.CYAN}│ {Fore.WHITE}字体一致: {Fore.GREEN}{match_count}{' ' * (39 - len(str(match_count)))}│")
    result.append(f"{Fore.CYAN}│ {Fore.WHITE}字体不同: {Fore.GREEN}{diff_count}{' ' * (39 - len(str(diff_count)))}│")
    
    # 级别统计
    result.append(f"{Fore.CYAN}│ {Fore.WHITE}级别分布:{' ' * 40}│")
    for level, count in stats['level_counts'].items():
        result.append(f"{Fore.CYAN}│   {Fore.GREEN}{level}: {count}{' ' * (44 - len(level) - len(str(count)))}│")
    
    # 五十音统计
    result.append(f"{Fore.CYAN}│ {Fore.WHITE}五十音分布:{' ' * 38}│")
    kana_stats = list(stats['kana_group_counts'].items())
    # 每行显示5个
    for i in range(0, len(kana_stats), 5):
        line = "  ".join([f"{k}: {v}" for k, v in kana_stats[i:i+5]])
        result.append(f"{Fore.CYAN}│   {Fore.GREEN}{line}{' ' * (46 - len(line))}│")
    
    result.append(f"{Fore.CYAN}└{'─' * 50}┘")
    
    return "\n".join(result)

def main():
    parser = argparse.ArgumentParser(description='日中汉字字典查询工具')
    parser.add_argument('--db', default='dictionary.db', help='SQLite数据库文件路径')
    parser.add_argument('--json', action='store_true', help='以JSON格式输出结果')
    
    subparsers = parser.add_subparsers(dest='command', help='查询命令')
    
    # 日语查询命令
    jp_parser = subparsers.add_parser('jp', help='按日语查询')
    jp_parser.add_argument('keyword', help='日语关键词')
    jp_parser.add_argument('--limit', type=int, default=20, help='结果数量限制')
    
    # 中文查询命令
    cn_parser = subparsers.add_parser('cn', help='按中文查询')
    cn_parser.add_argument('keyword', help='中文关键词')
    cn_parser.add_argument('--limit', type=int, default=20, help='结果数量限制')
    
    # ID查询命令
    id_parser = subparsers.add_parser('id', help='按ID查询')
    id_parser.add_argument('char_id', help='要查询的ID')
    
    # 随机汉字命令
    random_parser = subparsers.add_parser('random', help='随机获取汉字')
    
    # 级别查询命令
    level_parser = subparsers.add_parser('level', help='按级别查询')
    level_parser.add_argument('level', help='级别(例如:一级汉字)')
    level_parser.add_argument('--limit', type=int, default=20, help='结果数量限制')
    
    # 统计命令
    stats_parser = subparsers.add_parser('stats', help='显示数据库统计信息')
    
    args = parser.parse_args()
    
    # 如果没有命令，显示帮助信息
    if not args.command:
        parser.print_help()
        return 0
    
    # 连接数据库
    conn = connect_to_database(args.db)
    
    # 确保视图存在
    create_view_if_not_exists(conn)
    
    try:
        # 处理命令
        if args.command == 'jp':
            results = search_by_japanese(conn, args.keyword, args.limit)
            if args.json:
                print(json.dumps(results, ensure_ascii=False, indent=2))
            else:
                print(format_character_table(results))
                print(f"共找到 {len(results)} 个匹配项")
                
        elif args.command == 'cn':
            results = search_by_chinese(conn, args.keyword, args.limit)
            if args.json:
                print(json.dumps(results, ensure_ascii=False, indent=2))
            else:
                print(format_character_table(results))
                print(f"共找到 {len(results)} 个匹配项")
                
        elif args.command == 'id':
            character = get_character_by_id(conn, args.char_id)
            if args.json:
                print(json.dumps(character, ensure_ascii=False, indent=2))
            else:
                print(format_character_detail(character))
                
        elif args.command == 'random':
            character = get_random_character(conn)
            if args.json:
                print(json.dumps(character, ensure_ascii=False, indent=2))
            else:
                print(format_character_detail(character))
                
        elif args.command == 'level':
            results = search_by_level(conn, args.level, args.limit)
            if args.json:
                print(json.dumps(results, ensure_ascii=False, indent=2))
            else:
                print(format_character_table(results))
                print(f"共找到 {len(results)} 个{args.level}汉字")
                
        elif args.command == 'stats':
            stats = get_database_stats(conn)
            if args.json:
                print(json.dumps(stats, ensure_ascii=False, indent=2))
            else:
                print(format_stats(stats))
                
    finally:
        conn.close()
    
    return 0

if __name__ == "__main__":
    sys.exit(main())