@echo off
REM ====================================
REM 日中汉字互查API - 开发环境启动脚本
REM ====================================

echo.
echo ====================================
REM 设置环境变量
set DB_PATH=./data/dictionary.db
set DEFAULT_DB_PATH=./data/dictionary.db
echo 数据库路径: %DB_PATH%
echo ====================================
echo.

REM 检查数据库是否存在
if not exist "data\dictionary.db" (
    echo 数据库不存在，正在初始化...
    python init_db.py
)
echo.

REM 启动服务
echo 启动后端服务...
python run.py --host 0.0.0.0 --port 8000 --reload
