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
import "./styles/modern-theme.css";
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

// 主题配置 - 现代化配色
const lightTheme = {
  algorithm: antdTheme.defaultAlgorithm,
  token: {
    colorPrimary: "#3b82f6",
    colorSuccess: "#10b981",
    colorWarning: "#f59e0b",
    colorError: "#ef4444",
    colorInfo: "#06b6d4",
    borderRadius: 8,
    borderRadiusLG: 12,
    borderRadiusSM: 6,
    fontSize: 14,
    fontSizeHeading1: 32,
    fontSizeHeading2: 28,
    fontSizeHeading3: 24,
    fontSizeHeading4: 20,
    fontSizeHeading5: 16,
  },
  components: {
    Layout: {
      headerBg: "#0f172a",
      headerHeight: 64,
    },
    Menu: {
      itemBg: "transparent",
      itemSelectedBg: "rgba(59, 130, 246, 0.15)",
      itemSelectedColor: "#60a5fa",
      itemHoverBg: "rgba(255, 255, 255, 0.08)",
    },
    Card: {
      colorBgContainer: "#ffffff",
      colorBorderSecondary: "#e2e8f0",
    },
    Button: {
      controlHeight: 40,
      controlHeightLG: 48,
      borderRadius: 8,
    },
    Input: {
      borderRadius: 8,
      controlHeight: 40,
      controlHeightLG: 48,
      colorBgContainer: "#ffffff",
      colorBorder: "#e2e8f0",
    },
    Table: {
      colorBgContainer: "#ffffff",
      headerColor: "#475569",
      headerSplitColor: "#e2e8f0",
    },
  },
};

const darkTheme = {
  algorithm: antdTheme.darkAlgorithm,
  token: {
    colorPrimary: "#60a5fa",
    colorSuccess: "#34d399",
    colorWarning: "#fbbf24",
    colorError: "#f87171",
    colorInfo: "#22d3ee",
    borderRadius: 8,
    borderRadiusLG: 12,
    borderRadiusSM: 6,
    fontSize: 14,
    fontSizeHeading1: 32,
    fontSizeHeading2: 28,
    fontSizeHeading3: 24,
    fontSizeHeading4: 20,
    fontSizeHeading5: 16,
  },
  components: {
    Layout: {
      headerBg: "#0a0a0a",
      headerHeight: 64,
    },
    Menu: {
      itemBg: "transparent",
      itemSelectedBg: "rgba(96, 165, 250, 0.15)",
      itemSelectedColor: "#60a5fa",
      itemHoverBg: "rgba(255, 255, 255, 0.06)",
    },
    Card: {
      colorBgContainer: "#1a1a1a",
      colorBorderSecondary: "#262626",
    },
    Button: {
      controlHeight: 40,
      controlHeightLG: 48,
      borderRadius: 8,
    },
    Input: {
      borderRadius: 8,
      controlHeight: 40,
      controlHeightLG: 48,
      colorBgContainer: "#1a1a1a",
      colorBorder: "#262626",
    },
    Table: {
      colorBgContainer: "#1a1a1a",
      headerColor: "#cbd5e1",
      headerSplitColor: "#262626",
    },
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

  const menuLinkStyle = {
    color: isDark ? "#cbd5e1" : "#475569",
    transition: "color 0.2s",
  };

  const items = [
    { key: "/", label: <Link to="/" style={menuLinkStyle}>首页</Link> },
    { key: "/search", label: <Link to="/search" style={menuLinkStyle}>搜索</Link> },
    { key: "/levels", label: <Link to="/levels" style={menuLinkStyle}>级别</Link> },
  ];

  if (!isMobile) {
    items.push(
      { key: "/stats", label: <Link to="/stats" style={menuLinkStyle}>统计</Link> },
      { key: "/about", label: <Link to="/about" style={menuLinkStyle}>关于</Link> },
      { key: "/admin", label: <Link to="/admin" style={menuLinkStyle}>管理</Link> },
    );
  }

  return (
    <div style={{ display: "flex", alignItems: "center", width: "100%" }}>
      <Menu
        mode="horizontal"
        selectedKeys={[location.pathname]}
        items={items}
        style={{
          flex: 1,
          minWidth: 0,
          borderBottom: "none",
          background: "transparent",
        }}
        // 覆盖 Menu 默认样式，确保文字颜色正确
        className="header-navigation-menu"
      />
      <Button
        type="text"
        icon={isDark ? <SunOutlined /> : <MoonOutlined />}
        onClick={toggleTheme}
        className="theme-toggle-btn"
        style={{
          color: isDark ? "#f1f5f9" : "#475569",
          fontSize: 18,
          padding: "8px 12px",
          borderRadius: 8,
          transition: "all 0.2s",
        }}
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

  // 同步主题到 document.documentElement 的 data-theme 属性
  // 这是 CSS 变量深色模式生效的关键
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
  }, [isDark]);

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
            background: isDark ? "#0a0a0a" : "#f8fafc",
          }}
        >
          <Header
            style={{
              display: "flex",
              alignItems: "center",
              padding: "0 32px",
              background: isDark ? "#0a0a0a" : "#ffffff",
              borderBottom: isDark ? "1px solid #262626" : "1px solid #e2e8f0",
              boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.05)",
            }}
          >
            <div
              className="logo"
              style={{
                fontWeight: 700,
                fontSize: 18,
                background: isDark
                  ? "linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%)"
                  : "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              日中汉字对照查询系统
            </div>
            <Navigation isDark={isDark} toggleTheme={toggleTheme} />
          </Header>
          <Content
            style={{
              padding: "0 24px",
              marginTop: 24,
              marginBottom: 24,
              position: "relative",
            }}
          >
            <div
              className="site-layout-content"
              style={{
                maxWidth: 1200,
                margin: "0 auto",
                background: isDark ? "#1a1a1a" : "#ffffff",
                borderRadius: 16,
                boxShadow: isDark
                  ? "0 4px 6px -1px rgb(0 0 0 / 0.4)"
                  : "0 4px 6px -1px rgb(0 0 0 / 0.05)",
                border: isDark ? "1px solid #262626" : "1px solid #e2e8f0",
                overflow: "hidden",
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
              background: isDark ? "#0a0a0a" : "#ffffff",
              borderTop: isDark ? "1px solid #262626" : "1px solid #e2e8f0",
              color: isDark ? "#64748b" : "#94a3b8",
              padding: "20px 24px",
            }}
          >
            <span style={{ color: isDark ? "#94a3b8" : "#475569" }}>
              日中汉字对照查询系统 ©{new Date().getFullYear()}
            </span>
            {" · "}
            <span style={{ color: isDark ? "#60a5fa" : "#3b82f6" }}>
              Built with React + Ant Design
            </span>
          </Footer>
          <BackTop
            style={{
              right: 24,
              bottom: 24,
              background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
              border: "none",
              borderRadius: 8,
            }}
          />
        </Layout>
      </Router>
    </ConfigProvider>
  );
}

export default App;
