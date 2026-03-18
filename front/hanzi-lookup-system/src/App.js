// App.js
import React, { useState, useEffect, Suspense, lazy } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useLocation,
} from "react-router-dom";
import { Layout, Menu, ConfigProvider, Spin, BackTop, Button, theme as antdTheme } from "antd";
import zhCN from "antd/es/locale/zh_CN";
import { SunOutlined, MoonOutlined } from "@ant-design/icons";
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

// 主题配置
const lightTheme = {
  algorithm: antdTheme.defaultAlgorithm,
  token: {
    colorPrimary: "#1890ff",
    borderRadius: 6,
  },
};

const darkTheme = {
  algorithm: antdTheme.darkAlgorithm,
  token: {
    colorPrimary: "#177ddc",
    borderRadius: 6,
  },
};

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

// 导航组件
function Navigation({ isDark, toggleTheme }) {
  const location = useLocation();
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
    <div style={{ display: "flex", alignItems: "center", width: "100%" }}>
      <Menu
        theme="dark"
        mode="horizontal"
        selectedKeys={[location.pathname]}
        items={items}
        style={{ flex: 1, minWidth: 0, borderBottom: "none" }}
      />
      <Button
        type="text"
        icon={isDark ? <SunOutlined /> : <MoonOutlined />}
        onClick={toggleTheme}
        style={{ color: "#fff", fontSize: 16 }}
        title={isDark ? "切换到亮色模式" : "切换到暗色模式"}
      />
    </div>
  );
}

function App() {
  // 从 localStorage 读取主题偏好，默认跟从系统
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem("theme");
    if (saved) return saved === "dark";
    return window.matchMedia?.("(prefers-color-scheme: dark)").matches || false;
  });

  const toggleTheme = () => {
    setIsDark((prev) => {
      const next = !prev;
      localStorage.setItem("theme", next ? "dark" : "light");
      return next;
    });
  };

  // 监听系统主题变化
  useEffect(() => {
    const handler = (e) => {
      // 仅当用户没有手动设置过主题时才跟随系统
      if (!localStorage.getItem("theme")) {
        setIsDark(e.matches);
      }
    };
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const currentTheme = isDark ? darkTheme : lightTheme;

  return (
    <ConfigProvider locale={zhCN} theme={currentTheme}>
      <Router>
        <Layout
          className="layout"
          style={{
            minHeight: "100vh",
            background: isDark ? "#141414" : undefined,
          }}
        >
          <Header style={{ display: "flex", alignItems: "center", padding: "0 24px" }}>
            <div className="logo">日中汉字对照查询系统</div>
            <Navigation isDark={isDark} toggleTheme={toggleTheme} />
          </Header>
          <Content style={{ padding: "0 50px", marginTop: 20 }}>
            <div
              className="site-layout-content"
              style={{
                maxWidth: 1200,
                margin: "0 auto",
                background: isDark ? "#1f1f1f" : "#fff",
                borderRadius: 8,
              }}
            >
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
          <Footer
            style={{
              textAlign: "center",
              background: isDark ? "#141414" : undefined,
              color: isDark ? "#666" : undefined,
            }}
          >
            日中汉字对照查询系统 ©{new Date().getFullYear()} Created with React
          </Footer>
          <BackTop style={{ right: 24, bottom: 24 }} />
        </Layout>
      </Router>
    </ConfigProvider>
  );
}

export default App;
