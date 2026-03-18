"""
启动脚本
简化应用启动过程
"""

import uvicorn
import os
import argparse
import sqlite3
import sys

from app.core.database import update_db_path, DB_PATH, init_db

def main():
    """主函数"""
    parser = argparse.ArgumentParser(description="日中汉字互查API服务")
    parser.add_argument(
        "--host", 
        type=str, 
        default="localhost", 
        help="主机地址 (默认: 0.0.0.0)"
    )
    parser.add_argument(
        "--port", 
        type=int, 
        default=8000, 
        help="端口号 (默认: 8000)"
    )
    parser.add_argument(
        "--reload", 
        action="store_true", 
        help="启用热重载"
    )
    parser.add_argument(
        "--db", 
        type=str, 
        default=None, 
        help=f"数据库路径 (默认: {DB_PATH})"
    )
    
    args = parser.parse_args()
    
    # 如果指定了数据库路径，更新全局配置
    if args.db:
        update_db_path(args.db)
    
    # 确保数据库存在或创建新数据库
    init_db()
    
    # 检查数据库是否可连接
    try:
        conn = sqlite3.connect(DB_PATH)
        conn.close()
        print(f"已成功连接到数据库: {DB_PATH}")
    except sqlite3.Error as e:
        print(f"错误: 无法连接数据库: {e}")
        return 1
    
    print(f"启动日中汉字互查API服务...")
    print(f"访问地址: http://{args.host}:{args.port}")
    print(f"API文档: http://{args.host}:{args.port}/api/docs")
    
    # 启动服务
    uvicorn.run(
        "app.main:app", 
        host=args.host, 
        port=args.port, 
        reload=args.reload
    )
    
    return 0

if __name__ == "__main__":
    sys.exit(main())