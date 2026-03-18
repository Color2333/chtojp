// App.js
import React, { useState, useEffect, Suspense, lazy } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useLocation,
} from "react-router-dom";
import { Layout, Menu, Divider, ConfigProvider, Spin, BackTop } from "antd";
import zhCN from "antd/es/locale/zh_CN";
import "antd/dist/reset.css";
import "./App.css";

// 懒加载页面组件
const Home = lazy(() => import("./pages/Home"));
const Search = lazy(() => import("./pages/Search"));
const CharacterDetail = lazy(() => import("./pages/CharacterDetail"));
const LevelBrowser = lazy(() => import("./pages/LevelBrowser"));
const Stats = lazy(() => import("./pages/Stats"));
const About = lazy(() => import("./pages/About"));
const Admin = lazy(() => import("./pages/Admin"));
const NotFound = lazy(() => import("./pages/NotFound"));

const { Header, Content, Footer } = Layout;

// 错误边界组件
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("页面渲染出错:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ textAlign: "center", padding: "50px" }}>
          <h2>页面加载失败</h2>
          <p style={{ color: "#999" }}>{this.state.error?.message}</p>
          <a href="/" style={{ color: "#1890ff" }}>返回首页</a>
        </div>
      );
    }
    return this.props.children;
  }
}

// 加载占位
const PageLoader = () => (
  <div style={{ textAlign: "center", padding: "100px 0" }}>
    <Spin size="large" />
  </div>
);

// 创建一个新的导航组件
function Navigation() {
  const location = useLocation();

  // 移动端隐藏部分菜单项，简化导航
  const isMobile = window.innerWidth < 768;

  const items = [
    { key: "/", label: <Link to="/">首页</Link> },
    { key: "/search", label: <Link to="/search">搜索</Link> },
    { key: "/levels", label: <Link to="/levels">级别</Link> },
  ];

  if (!isMobile) {
    items.push(
      { key: "/stats", label: <Link to="/stats">统计</Link> },
      { key: "/about", label: <Link to="/about">关于</Link> },
      { key: "/admin", label: <Link to="/admin">管理</Link> },
    );
  }

  return (
    <Menu
      theme="dark"
      mode="horizontal"
      selectedKeys={[location.pathname]}
      items={items}
    />
  );
}

function App() {
  return (
    <ConfigProvider locale={zhCN}>
      <Router>
        <Layout className="layout" style={{ minHeight: "100vh" }}>
          <Header>
            <div className="logo">日中汉字对照查询系统</div>
            <Navigation />
          </Header>
          <Content style={{ padding: "0 50px", marginTop: 20 }}>
            <div className="site-layout-content" style={{ maxWidth: 1200, margin: "0 auto" }}>
              <ErrorBoundary>
                <Suspense fallback={<PageLoader />}>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/search" element={<Search />} />
                    <Route path="/character/:id" element={<CharacterDetail />} />
                    <Route path="/levels" element={<LevelBrowser />} />
                    <Route path="/level/:level" element={<LevelBrowser />} />
                    <Route path="/stats" element={<Stats />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/admin" element={<Admin />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
              </ErrorBoundary>
            </div>
          </Content>
          <Footer style={{ textAlign: "center" }}>
            日中汉字对照查询系统 ©{new Date().getFullYear()} Created with React
          </Footer>
          <BackTop style={{ right: 24, bottom: 24 }} />
        </Layout>
      </Router>
    </ConfigProvider>
  );
}

export default App;
