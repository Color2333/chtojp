#!/usr/bin/env python
"""
数据库初始化脚本
用于创建数据库表结构
"""
import os
import sys

# 添加 app 目录到 Python 路径
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from app.core.database import init_db, DB_PATH

if __name__ == "__main__":
    print(f"正在初始化数据库: {DB_PATH}")
    init_db()
    print("数据库初始化完成!")
