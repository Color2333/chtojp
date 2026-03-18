// src/pages/About.js
import React from "react";
import { Typography, Card, Divider, Space, Button, Tag, Row, Col } from "antd";
import {
  GithubOutlined,
  MailOutlined,
  GlobalOutlined,
  CodeOutlined,
  DatabaseOutlined,
  RocketOutlined,
  HeartOutlined,
  SearchOutlined,
  FileTextOutlined,
  BookOutlined,
  BarChartOutlined,
} from "@ant-design/icons";
import { Link } from "react-router-dom";

const { Title, Paragraph, Text } = Typography;

function About() {
  const features = [
    {
      icon: <SearchOutlined style={{ fontSize: 24, color: "#3b82f6" }} />,
      title: "多维度搜索",
      description: "支持通过日语汉字、中文汉字、假名读音、拼音等多种方式进行搜索。",
    },
    {
      icon: <FileTextOutlined style={{ fontSize: 24, color: "#8b5cf6" }} />,
      title: "详细的汉字信息",
      description: "提供汉字的字体对照、音读み、训读み、中文拼音、级别等详细信息。",
    },
    {
      icon: <BookOutlined style={{ fontSize: 24, color: "#10b981" }} />,
      title: "按级别浏览",
      description: "支持按照汉字级别（如一级汉字、二级汉字等）浏览汉字列表。",
    },
    {
      icon: <BarChartOutlined style={{ fontSize: 24, color: "#f59e0b" }} />,
      title: "统计数据可视化",
      description: "提供数据库汉字的统计信息和可视化图表，展示级别分布、字体一致性等信息。",
    },
  ];

  const techStack = {
    frontend: [
      { name: "React", color: "#61dafb" },
      { name: "Ant Design", color: "#3b82f6" },
      { name: "Recharts", color: "#f59e0b" },
      { name: "Axios", color: "#8b5cf6" },
    ],
    backend: [
      { name: "FastAPI", color: "#10b981" },
      { name: "Python", color: "#ef4444" },
      { name: "SQLite", color: "#06b6d4" },
      { name: "Uvicorn", color: "#3b82f6" },
    ],
  };

  const timeline = [
    { title: "项目规划与数据库设计", status: "完成" },
    { title: "数据收集与整理", status: "完成" },
    { title: "API接口开发", status: "完成" },
    { title: "前端界面开发", status: "完成" },
    { title: "系统测试与上线", status: "完成" },
  ];

  return (
    <div className="about-container">
      {/* 页面标题 */}
      <div style={{ marginBottom: 32 }}>
        <Title level={2} style={{ marginBottom: 8 }}>
          关于本系统
        </Title>
        <Paragraph style={{ color: "var(--color-text-secondary)", marginBottom: 0 }}>
          日中汉字对照查询系统 - 帮助您更好地学习日语和中文
        </Paragraph>
      </div>

      {/* 项目介绍 */}
      <Card className="hover-lift" style={{ marginBottom: 24 }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <Title level={3}>
            <span
              style={{
                background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              日中汉字对照查询系统
            </span>
          </Title>
        </div>
        <Paragraph style={{ fontSize: 16, lineHeight: 1.8, color: "var(--color-text-secondary)" }}>
          本系统旨在帮助中文和日语学习者查询汉字的对应关系和读音信息。系统收录了常用的日语汉字和中文汉字的对照，
          包括音读、训读和拼音等读音信息，以及汉字级别、字体一致性等参考数据。
        </Paragraph>
        <Paragraph style={{ fontSize: 16, lineHeight: 1.8, color: "var(--color-text-secondary)" }}>
          数据来源基于《日中汉字标准对照表》整理，采用现代化的技术栈构建，提供简洁、高效的查询体验。
        </Paragraph>
      </Card>

      {/* 功能特点 */}
      <Divider orientation="left" style={{ margin: "32px 0 24px" }}>
        功能特点
      </Divider>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {features.map((feature, index) => (
          <Col xs={24} sm={12} md={12} key={index}>
            <Card
              className="hover-lift"
              bodyStyle={{ padding: "20px 24px" }}
            >
              <Space direction="vertical" size="small">
                <Space>
                  {feature.icon}
                  <Text strong style={{ fontSize: 16 }}>
                    {feature.title}
                  </Text>
                </Space>
                <Text type="secondary" style={{ fontSize: 14 }}>
                  {feature.description}
                </Text>
              </Space>
            </Card>
          </Col>
        ))}
      </Row>

      {/* 技术栈 */}
      <Divider orientation="left" style={{ margin: "32px 0 24px" }}>
        开发技术
      </Divider>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} md={12}>
          <Card
            className="hover-lift"
            title={
              <Space>
                <CodeOutlined style={{ color: "#3b82f6" }} />
                <span>前端技术</span>
              </Space>
            }
          >
            <Space wrap size={[8, 8]}>
              {techStack.frontend.map((tech, index) => (
                <Tag
                  key={index}
                  style={{
                    padding: "4px 12px",
                    borderRadius: 16,
                    fontSize: 13,
                    border: `1px solid ${tech.color}30`,
                    color: tech.color,
                    background: `${tech.color}10`,
                  }}
                >
                  {tech.name}
                </Tag>
              ))}
            </Space>
          </Card>
        </Col>

        <Col xs={24} md={12}>
          <Card
            className="hover-lift"
            title={
              <Space>
                <DatabaseOutlined style={{ color: "#10b981" }} />
                <span>后端技术</span>
              </Space>
            }
          >
            <Space wrap size={[8, 8]}>
              {techStack.backend.map((tech, index) => (
                <Tag
                  key={index}
                  style={{
                    padding: "4px 12px",
                    borderRadius: 16,
                    fontSize: 13,
                    border: `1px solid ${tech.color}30`,
                    color: tech.color,
                    background: `${tech.color}10`,
                  }}
                >
                  {tech.name}
                </Tag>
              ))}
            </Space>
          </Card>
        </Col>
      </Row>

      {/* 项目历程 */}
      <Divider orientation="left" style={{ margin: "32px 0 24px" }}>
        项目历程
      </Divider>

      <Card className="hover-lift" style={{ marginBottom: 24 }}>
        <Space direction="vertical" style={{ width: "100%" }} size="middle">
          {timeline.map((item, index) => (
            <div
              key={index}
              style={{
                display: "flex",
                alignItems: "center",
                padding: "12px 16px",
                background: index === timeline.length - 1
                  ? "linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(6, 182, 212, 0.1) 100%)"
                  : "var(--color-bg-spotlight)",
                borderRadius: 8,
                border: index === timeline.length - 1
                  ? "1px solid rgba(16, 185, 129, 0.3)"
                  : "1px solid var(--color-border-light)",
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  background: index === timeline.length - 1
                    ? "linear-gradient(135deg, #10b981 0%, #06b6d4 100%)"
                    : "var(--color-border-base)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 12,
                  color: index === timeline.length - 1 ? "white" : "var(--color-text-secondary)",
                  fontWeight: 600,
                  fontSize: 14,
                }}
              >
                {index + 1}
              </div>
              <div style={{ flex: 1 }}>
                <Text strong>{item.title}</Text>
              </div>
              <Tag
                color={index === timeline.length - 1 ? "success" : "default"}
                style={{ borderRadius: 12 }}
              >
                {item.status}
              </Tag>
            </div>
          ))}
        </Space>
      </Card>

      {/* 底部链接 */}
      <Card className="hover-lift">
        <div style={{ textAlign: "center" }}>
          <Space direction="vertical" size="middle">
            <div>
              <Text type="secondary" style={{ fontSize: 14 }}>
                感谢使用本系统
              </Text>
            </div>
            <Space wrap>
              <Link to="/">
                <Button type="primary" icon={<RocketOutlined />}>
                  返回首页
                </Button>
              </Link>
              <Link to="/stats">
                <Button icon={<BarChartOutlined />}>
                  查看统计
                </Button>
              </Link>
              <Link to="/search">
                <Button icon={<SearchOutlined />}>
                  开始搜索
                </Button>
              </Link>
            </Space>
            <div>
              <Text type="secondary" style={{ fontSize: 13 }}>
                <HeartOutlined style={{ color: "#ef4444" }} /> Made with love for learners
              </Text>
            </div>
          </Space>
        </div>
      </Card>

      {/* GitHub 和项目信息 */}
      <Card className="hover-lift github-card" style={{ marginTop: 24 }}>
        <div style={{ textAlign: "center" }}>
          <Space direction="vertical" size="middle" style={{ width: "100%" }}>
            <div>
              <Title level={4} style={{ marginBottom: 8 }}>
                <GithubOutlined style={{ marginRight: 8 }} />
                开源项目
              </Title>
              <Paragraph type="secondary" style={{ fontSize: 14 }}>
                本系统完全开源，欢迎贡献代码和提出建议
              </Paragraph>
            </div>
            <a
              href="https://github.com/Color2333/chtojp"
              target="_blank"
              rel="noopener noreferrer"
              style={{ textDecoration: "none" }}
            >
              <Button
                type="primary"
                size="large"
                icon={<GithubOutlined />}
                className="github-button"
                style={{
                  background: "#24292e",
                  borderColor: "#24292e",
                  height: 44,
                  fontSize: 16,
                  fontWeight: 600,
                }}
              >
                访问 GitHub 仓库
              </Button>
            </a>
            <div style={{ marginTop: 16 }}>
              <Space split={<Divider type="vertical" />}>
                <Text type="secondary" style={{ fontSize: 13 }}>
                  <span style={{ fontWeight: 500, color: "var(--color-text-primary)" }}>
                    作者：
                  </span>
                  Color2333
                </Text>
                <Text type="secondary" style={{ fontSize: 13 }}>
                  <span style={{ fontWeight: 500, color: "var(--color-text-primary)" }}>
                    许可证：
                  </span>
                  MIT License
                </Text>
                <Text type="secondary" style={{ fontSize: 13 }}>
                  <span style={{ fontWeight: 500, color: "var(--color-text-primary)" }}>
                    版本：
                  </span>
                  v1.0.0
                </Text>
              </Space>
            </div>
          </Space>
        </div>
      </Card>
    </div>
  );
}

export default About;
