// App.js
import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useLocation,
} from "react-router-dom";
import { Layout, Menu, Divider, ConfigProvider } from "antd";
import zhCN from "antd/es/locale/zh_CN";
import "antd/dist/reset.css";
import "./App.css";

// Import pages
import Home from "./pages/Home";
import Search from "./pages/Search";
import CharacterDetail from "./pages/CharacterDetail";
import LevelBrowser from "./pages/LevelBrowser";
import Stats from "./pages/Stats";
import About from "./pages/About";
import Admin from "./pages/Admin";

const { Header, Content, Footer } = Layout;

// 创建一个新的导航组件
function Navigation() {
  const location = useLocation();

  return (
    <Menu
      theme="dark"
      mode="horizontal"
      selectedKeys={[location.pathname]}
      items={[
        { key: "/", label: <Link to="/">首页</Link> },
        { key: "/search", label: <Link to="/search">搜索</Link> },
        { key: "/levels", label: <Link to="/levels">级别浏览</Link> },
        { key: "/stats", label: <Link to="/stats">统计</Link> },
        { key: "/about", label: <Link to="/about">关于</Link> },
        { key: "/admin", label: <Link to="/admin">管理</Link> },
      ]}
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
            <div className="site-layout-content">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/search" element={<Search />} />
                <Route path="/character/:id" element={<CharacterDetail />} />
                <Route path="/levels" element={<LevelBrowser />} />
                <Route path="/level/:level" element={<LevelBrowser />} />
                <Route path="/stats" element={<Stats />} />
                <Route path="/about" element={<About />} />
                <Route path="/admin" element={<Admin />} />
              </Routes>
            </div>
          </Content>
          <Footer style={{ textAlign: "center" }}>
            日中汉字对照查询系统 ©{new Date().getFullYear()} Created with React
          </Footer>
        </Layout>
      </Router>
    </ConfigProvider>
  );
}

export default App;
