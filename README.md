# 日中汉字对照查询系统 (Japanese-Chinese Character Lookup System)

一个基于前后端分离架构的日中汉字对照查询系统，支持多维度搜索、级别浏览和统计可视化。

## 功能特性

- 多维度搜索：支持日语汉字、中文汉字、假名读音、中文拼音搜索
- 汉字详情：音读み、训读み、中文拼音、级别、字体对照、用例
- 级别浏览：按汉字级别（一级汉字、二级汉字等）分类浏览
- 统计可视化：级别分布、字体一致性、五十音分组统计图表
- 管理后台：支持汉字的增删改查
- 热门搜索：记录和展示热门搜索词
- Docker 部署：一键容器化部署

## 技术栈

**后端**
- Python 3.11+
- FastAPI
- SQLite3
- Uvicorn
- Docker

**前端**
- React 18
- Ant Design 5
- React Router 6
- Axios
- Recharts

## 项目结构

```
chtojp/
├── back/                    # 后端服务
│   ├── app/
│   │   ├── api/             # API 路由
│   │   │   └── endpoints/   # 端点定义
│   │   ├── core/            # 配置与数据库
│   │   ├── models/          # 数据模型
│   │   ├── schemas/         # Pydantic 模型
│   │   ├── services/        # 业务逻辑
│   │   └── main.py          # 入口
│   ├── tests/               # 测试
│   └── Dockerfile
├── front/
│   └── hanzi-lookup-system/ # React 前端
│       └── src/
│           ├── pages/       # 页面组件
│           ├── services/    # API 服务
│           └── App.js       # 主组件
├── sqllite/                 # 数据导入工具
│   ├── data.xlsx            # 汉字数据源
│   ├── import_data.py       # 数据导入脚本
│   └── query_dict.py        # 数据查询脚本
├── docker-compose.yml       # Docker 编排
├── nginx.conf               # Nginx 配置
└── deploy.sh                # 部署脚本
```

## 快速开始

### 环境要求

- Python 3.11+
- Node.js 16+
- Docker & Docker Compose（用于容器部署）

### 本地开发

**后端**

```bash
cd back
pip install -r requirements.txt
# 导入数据
cd ../sqllite
python import_data.py data.xlsx --db ../back/data/dictionary.db
cd ../back
python -m uvicorn app.main:app --reload --port 8000
```

**前端**

```bash
cd front/hanzi-lookup-system
npm install
npm start
```

### Docker 部署

```bash
# 构建并启动
docker-compose up -d --build

# 查看日志
docker-compose logs -f
```

## API 文档

启动后端服务后访问：
- Swagger UI: `http://localhost/api/docs`
- ReDoc: `http://localhost/api/redoc`

### 主要接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/v1/search | 搜索汉字 |
| GET | /api/v1/characters | 获取所有汉字 |
| GET | /api/v1/characters/{id} | 获取汉字详情 |
| GET | /api/v1/characters/random | 获取随机汉字 |
| GET | /api/v1/characters/levels | 获取所有级别 |
| GET | /api/v1/characters/level/{level} | 按级别获取汉字 |
| GET | /api/v1/stats | 获取统计信息 |
| GET | /api/v1/search/hot | 获取热门搜索 |
| POST | /api/v1/search/record | 记录搜索词 |
| POST | /api/v1/admin/characters | 添加汉字（需认证） |
| PUT | /api/v1/admin/characters/{id} | 更新汉字（需认证） |
| DELETE | /api/v1/admin/characters/{id} | 删除汉字（需认证） |

## 数据库

使用 SQLite，包含三张表：
- `characters`：汉字基本信息
- `japanese_readings`：日语读音（音读み/训读み）
- `chinese_readings`：中文读音
- `hot_searches`：热门搜索记录

数据来源于 `sqllite/data.xlsx`，通过 `import_data.py` 导入。

## License

MIT
