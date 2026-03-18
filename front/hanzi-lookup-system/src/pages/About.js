// src/pages/About.js
import React from "react";
import { Typography, Card, Divider, Timeline, Tag, Space, Button } from "antd";
import {
  GithubOutlined,
  MailOutlined,
  GlobalOutlined,
} from "@ant-design/icons";

const { Title, Paragraph, Text, Link } = Typography;

function About() {
  return (
    <div className="about-container">
      <Title level={2}>关于本系统</Title>

      <Card style={{ marginBottom: 24 }}>
        <Title level={3}>日中汉字对照查询系统</Title>
        <Paragraph>
          本系统旨在帮助中文和日语学习者查询汉字的对应关系和读音信息。系统收录了常用的日语汉字和中文汉字的对照，
          包括音读、训读和拼音等读音信息，以及汉字级别、字体一致性等参考数据。
        </Paragraph>

        <Paragraph>
          数据来源基于《日中汉字标准对照表》整理，由某大学某大创完成。
        </Paragraph>
      </Card>

      <Divider orientation="left">功能特点</Divider>

      <Card style={{ marginBottom: 24 }}>
        <ul className="feature-list">
          <li>
            <Title level={5}>多维度搜索</Title>
            <Paragraph>
              支持通过日语汉字、中文汉字、假名读音、拼音等多种方式进行搜索。
            </Paragraph>
          </li>

          <li>
            <Title level={5}>详细的汉字信息</Title>
            <Paragraph>
              提供汉字的字体对照、音读み、训读み、中文拼音、级别等详细信息。
            </Paragraph>
          </li>

          <li>
            <Title level={5}>按级别浏览</Title>
            <Paragraph>
              支持按照汉字级别（如一级汉字、二级汉字等）浏览汉字列表。
            </Paragraph>
          </li>

          <li>
            <Title level={5}>统计数据可视化</Title>
            <Paragraph>
              提供数据库汉字的统计信息和可视化图表，展示级别分布、字体一致性等信息。
            </Paragraph>
          </li>
        </ul>
      </Card>

      <Divider orientation="left">开发技术</Divider>

      <Card style={{ marginBottom: 24 }}>
        <Space direction="vertical" size="middle" style={{ width: "100%" }}>
          <div>
            <Title level={4}>前端技术</Title>
            <Space wrap>
              <Tag color="blue">React</Tag>
              <Tag color="blue">Ant Design</Tag>
              <Tag color="blue">Recharts</Tag>
              <Tag color="blue">Axios</Tag>
            </Space>
          </div>

          <div>
            <Title level={4}>后端技术</Title>
            <Space wrap>
              <Tag color="green">FastAPI</Tag>
              <Tag color="green">Python</Tag>
              <Tag color="green">SQLite</Tag>
              <Tag color="green">Uvicorn</Tag>
            </Space>
          </div>
        </Space>
      </Card>

      <Divider orientation="left">项目历程</Divider>

      <Card style={{ marginBottom: 24 }}>
        <Timeline>
          <Timeline.Item>项目规划与数据库设计</Timeline.Item>
          <Timeline.Item>数据收集与整理</Timeline.Item>
          <Timeline.Item>API接口开发</Timeline.Item>
          <Timeline.Item>前端界面开发</Timeline.Item>
          <Timeline.Item color="green">系统测试与上线</Timeline.Item>
        </Timeline>
      </Card>

      <Divider orientation="left">联系方式</Divider>

      <Card>
        <Space>
          <Button icon={<MailOutlined />}>发送邮件</Button>
          <Button icon={<GithubOutlined />}>GitHub</Button>
          <Button icon={<GlobalOutlined />}>项目网站</Button>
        </Space>
      </Card>
    </div>
  );
}

export default About;
