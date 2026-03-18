"""
日中汉字对照表导入脚本 - 自定义版
--------------------------------
用途: 将特定格式的Excel文件导入到SQLite数据库
"""

import os
import sys
import sqlite3
import pandas as pd
import argparse

def create_database_schema(conn):
    """创建数据库表结构"""
    cursor = conn.cursor()
    
    # 创建汉字表
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS characters (
        id TEXT PRIMARY KEY,
        japanese_kanji TEXT NOT NULL,
        chinese_hanzi TEXT NOT NULL,
        level TEXT,
        kana_group TEXT,
        forms_match BOOLEAN DEFAULT 1,
        examples TEXT
    )
    """)
    
    # 创建日语读音表
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS japanese_readings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        character_id TEXT NOT NULL,
        reading TEXT NOT NULL,
        reading_type TEXT NOT NULL,
        FOREIGN KEY (character_id) REFERENCES characters(id)
    )
    """)
    
    # 创建中文读音表
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS chinese_readings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        character_id TEXT NOT NULL,
        reading TEXT NOT NULL,
        FOREIGN KEY (character_id) REFERENCES characters(id)
    )
    """)
    
    # 创建热门搜索表
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS hot_searches (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        search_term TEXT NOT NULL,
        search_count INTEGER DEFAULT 1,
        last_searched TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(search_term)
    )
    """)
    
    # 创建索引
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_characters_level ON characters(level)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_japanese_readings_character_id ON japanese_readings(character_id)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_chinese_readings_character_id ON chinese_readings(character_id)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_hot_searches_count ON hot_searches(search_count)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_hot_searches_last_searched ON hot_searches(last_searched)")
    
    conn.commit()

def create_test_data(conn):
    """根据示例数据创建测试数据"""
    cursor = conn.cursor()
    
    # 示例数据
    sample_data = [
        ("0001", "ア", "亜（亞）", "亚", "一级汉字", 0, "亜流，亜麻，亜熱帯", 
         [("on", 1, "ア")], 
         [("yà", 1)]),
        
        ("0002", "ア", "哀", "哀", "一级汉字", 1, "哀愁，哀願，悲哀", 
         [("on", 1, "アイ"), ("kun", 1, "あわれ"), ("kun", 2, "あわれむ")], 
         [("āi", 1)]),
        
        ("0003", "ア", "挨", "挨", "一级汉字", 1, "挨拶", 
         [("on", 1, "アイ")], 
         [("āi", 1), ("ái", 2)]),
         
        ("0004", "ア", "愛", "爱", "一级汉字", 0, "愛情，愛読，恋愛", 
         [("on", 1, "アイ")], 
         [("ài", 1)]),
         
        ("0005", "ア", "曖", "暧", "二级汉字", 0, "曖昧", 
         [("on", 1, "アイ")], 
         [("ài", 1)]),
         
        ("0006", "ア", "悪（惡）", "恶", "一级汉字", 0, "悪事，悪意，悪い", 
         [("on", 1, "アク"), ("on", 2, "オ"), ("kun", 1, "わるい")], 
         [("è", 1), ("wù", 2)])
    ]
    
    # 插入数据
    for (char_id, kana_group, jp_kanji, cn_hanzi, level, forms_match, examples, jp_readings, cn_readings) in sample_data:
        cursor.execute('''
        INSERT INTO characters 
        (id, kana_group, japanese_kanji, chinese_hanzi, level, forms_match, examples)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (char_id, kana_group, jp_kanji, cn_hanzi, level, forms_match, examples))
        
        # 插入日语读音
        for (reading_type, reading_index, reading_value) in jp_readings:
            cursor.execute('''
            INSERT INTO japanese_readings 
            (character_id, reading_type, reading_index, reading_value)
            VALUES (?, ?, ?, ?)
            ''', (char_id, reading_type, reading_index, reading_value))
        
        # 插入中文读音
        for (reading_value, reading_index) in cn_readings:
            cursor.execute('''
            INSERT INTO chinese_readings 
            (character_id, reading_index, reading_value)
            VALUES (?, ?, ?)
            ''', (char_id, reading_index, reading_value))
    
    conn.commit()
    print("已创建测试数据")

def import_excel_data(excel_file, conn, has_header=True):
    """从Excel导入数据到SQLite"""
    try:
        # 读取Excel文件
        print(f"读取Excel文件: {excel_file}")
        
        # 根据是否有标题行设置参数
        header_row = 0 if has_header else None
        names = ["番号", "五十音", "漢字", 
                 "音読み①", "音読み②", "音読み③", "音読み④", 
                 "訓読み①", "訓読み②", "訓読み③", "訓読み④", "訓読み⑤", 
                 "訓読み⑥", "訓読み⑦", "訓読み⑧", "訓読み⑨", "訓読み⑩", 
                 "用例", "级别", "汉字", "读音①", "读音②", "读音③", "字体是否一致"]
        
        if has_header:
            df = pd.read_excel(excel_file)
        else:
            df = pd.read_excel(excel_file, header=None, names=names)
        
        # 显示列名
        print(f"Excel列名: {', '.join(df.columns.tolist())}")
        print(f"发现{len(df)}条记录")
        
        # 打印前几行的数据以便检查
        print("\n前3行数据:")
        print(df.head(3).to_string())
        
        # 确认是否继续
        confirm = input("\n是否继续导入? (y/n): ")
        if confirm.lower() != 'y':
            return False
        
        # 处理数据
        cursor = conn.cursor()
        
        # 定义列名
        id_col = "番号"
        kana_group_col = "五十音"
        jp_kanji_col = "漢字"
        cn_hanzi_col = "汉字"
        level_col = "级别"
        forms_match_col = "字体是否一致"
        examples_col = "用例"
        
        # 日语读音列
        on_reading_cols = ["音読み①", "音読み②", "音読み③", "音読み④"]
        kun_reading_cols = ["訓読み①", "訓読み②", "訓読み③", "訓読み④", "訓読み⑤", 
                           "訓読み⑥", "訓読み⑦", "訓読み⑧", "訓読み⑨", "訓読み⑩"]
        
        # 中文读音列
        cn_reading_cols = ["读音①", "读音②", "读音③"]
        
        # 导入每行数据
        count = 0
        for _, row in df.iterrows():
            # 获取基本数据
            char_id = str(row[id_col]) if pd.notna(row[id_col]) else None
            kana_group = row[kana_group_col] if pd.notna(row[kana_group_col]) else None
            jp_kanji = row[jp_kanji_col] if pd.notna(row[jp_kanji_col]) else None
            cn_hanzi = row[cn_hanzi_col] if pd.notna(row[cn_hanzi_col]) else None
            level = row[level_col] if pd.notna(row[level_col]) else None
            examples = row[examples_col] if pd.notna(row[examples_col]) else None
            
            # 如果没有日语或中文汉字，跳过该行
            if jp_kanji is None or cn_hanzi is None:
                continue
                
            # 字体是否一致
            forms_match = None
            if pd.notna(row[forms_match_col]):
                forms_match = 1 if row[forms_match_col] == '是' else 0
            
            # 插入characters表
            cursor.execute('''
            INSERT OR REPLACE INTO characters 
            (id, kana_group, japanese_kanji, chinese_hanzi, level, forms_match, examples)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            ''', (char_id, kana_group, jp_kanji, cn_hanzi, level, forms_match, examples))
            
            # 处理日语音读み
            for i, col in enumerate(on_reading_cols):
                if col in df.columns and pd.notna(row[col]) and row[col] not in ['-', '']:
                    cursor.execute('''
                    INSERT INTO japanese_readings (character_id, reading_type, reading_index, reading_value)
                    VALUES (?, ?, ?, ?)
                    ''', (char_id, 'on', i+1, row[col]))
            
            # 处理日语训读み
            for i, col in enumerate(kun_reading_cols):
                if col in df.columns and pd.notna(row[col]) and row[col] not in ['-', '—', '']:
                    cursor.execute('''
                    INSERT INTO japanese_readings (character_id, reading_type, reading_index, reading_value)
                    VALUES (?, ?, ?, ?)
                    ''', (char_id, 'kun', i+1, row[col]))
            
            # 处理中文读音
            for i, col in enumerate(cn_reading_cols):
                if col in df.columns and pd.notna(row[col]) and row[col] not in ['-', '']:
                    cursor.execute('''
                    INSERT INTO chinese_readings (character_id, reading_index, reading_value)
                    VALUES (?, ?, ?)
                    ''', (char_id, i+1, row[col]))
            
            count += 1
            if count % 100 == 0:
                print(f"已处理 {count} 行...")
        
        # 提交事务
        conn.commit()
        print(f"成功导入 {count} 条记录到数据库")
        return True
        
    except Exception as e:
        print(f"导入数据时出错: {e}")
        import traceback
        traceback.print_exc()
        return False

def main():
    parser = argparse.ArgumentParser(description='从Excel导入日中汉字数据到SQLite')
    parser.add_argument('excel_file', help='Excel文件路径')
    parser.add_argument('--db', default='dictionary.db', help='SQLite数据库文件路径 (默认: dictionary.db)')
    parser.add_argument('--no-header', action='store_true', help='Excel文件没有标题行')
    parser.add_argument('--test-data', action='store_true', help='创建测试数据而不是导入Excel')
    
    args = parser.parse_args()
    
    # 连接到SQLite数据库
    conn = sqlite3.connect(args.db)
    
    # 创建数据库结构
    create_database_schema(conn)
    
    # 根据参数选择操作
    if args.test_data:
        create_test_data(conn)
    else:
        # 检查Excel文件是否存在
        if not os.path.exists(args.excel_file):
            print(f"错误: Excel文件不存在: {args.excel_file}")
            conn.close()
            return 1
            
        # 导入数据
        has_header = not args.no_header
        success = import_excel_data(args.excel_file, conn, has_header)
        
        if not success:
            conn.close()
            return 1
    
    # 关闭连接
    conn.close()
    print(f"数据库文件: {args.db}")
    return 0

if __name__ == "__main__":
    sys.exit(main())