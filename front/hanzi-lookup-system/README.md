# 日中汉字对照查询系统 (Japanese-Chinese Character Lookup System)

这是一个基于 React 的前端应用，用于查询日语和中文汉字的对应关系，包含读音、级别和用例等信息。

## 功能特点

- 多维度搜索：支持通过日语汉字、中文汉字、假名读音、拼音等多种方式进行搜索
- 详细的汉字信息：提供汉字的字体对照、音读み、训读み、中文拼音、级别等详细信息
- 按级别浏览：支持按照汉字级别（如一级汉字、二级汉字等）浏览汉字列表
- 统计数据可视化：提供数据库汉字的统计信息和可视化图表，展示级别分布、字体一致性等信息

## 项目结构

```
src/
├── components/       # 通用组件
├── pages/            # 页面组件
│   ├── Home.js       # 首页
│   ├── Search.js     # 搜索页
│   ├── CharacterDetail.js  # 汉字详情页
│   ├── LevelBrowser.js     # 级别浏览页
│   ├── Stats.js      # 统计页
│   └── About.js      # 关于页
├── services/         # API服务
│   └── api.js        # API调用函数
├── App.js            # 应用主组件
├── App.css           # 全局样式
└── index.js          # 入口文件
```

## 安装与运行

### 前提条件

- 安装 [Node.js](https://nodejs.org/) (推荐 v14 或更高版本)
- 安装 [npm](https://www.npmjs.com/) 或 [Yarn](https://yarnpkg.com/)

### 安装步骤

1. 克隆项目到本地

```bash
git clone https://github.com/yourusername/hanzi-lookup-system.git
cd hanzi-lookup-system
```

2. 安装依赖

```bash
npm install
# 或者使用 Yarn
yarn install
```

3. 配置 API 地址

打开 `src/services/api.js` 文件，将 `API_BASE_URL` 修改为你的后端 API 地址：

```javascript
const API_BASE_URL = "http://your-backend-api.com"; // 修改为你的API地址
```

4. 启动开发服务器

```bash
npm start
# 或者使用 Yarn
yarn start
```

5. 构建生产版本

```bash
npm run build
# 或者使用 Yarn
yarn build
```

python import_data.py "data.xlsx" --db dictionary.db

## 技术栈

- [React](https://reactjs.org/) - 前端框架
- [React Router](https://reactrouter.com/) - 路由管理
- [Ant Design](https://ant.design/) - UI 组件库
- [Axios](https://axios-http.com/) - HTTP 客户端
- [Recharts](https://recharts.org/) - 图表库

## 后端 API

本项目需要配合后端 API 使用，API 文档请参考 `api.json` 文件或后端服务文档。

## 贡献指南

欢迎提交问题报告和改进建议！

## 许可证

本项目采用 MIT 许可证 - 详见 LICENSE 文件
