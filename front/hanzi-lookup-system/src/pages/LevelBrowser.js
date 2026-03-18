// src/pages/LevelBrowser.js
import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  Typography,
  Card,
  Select,
  Table,
  Tag,
  Button,
  Row,
  Col,
  Spin,
  Empty,
  message,
  Pagination,
  Badge,
  Space,
} from "antd";
import { BookOutlined, ArrowLeftOutlined, FolderOutlined } from "@ant-design/icons";
import api from "../services/api";

const { Title, Paragraph, Text } = Typography;
const { Option } = Select;

function LevelBrowser() {
  const { level } = useParams();
  const navigate = useNavigate();

  const [levels, setLevels] = useState([]);
  const [characters, setCharacters] = useState([]);
  const [selectedLevel, setSelectedLevel] = useState(level || null);
  const [loading, setLoading] = useState(false);
  const [loadingLevels, setLoadingLevels] = useState(true);
  const [totalResults, setTotalResults] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  useEffect(() => {
    fetchLevels();
  }, []);

  useEffect(() => {
    if (level) {
      setSelectedLevel(level);
      fetchCharactersByLevel(level);
    }
  }, [level]);

  const fetchLevels = async () => {
    try {
      setLoadingLevels(true);
      const data = await api.getLevels();
      setLevels(data);
    } catch (error) {
      console.error("Error fetching levels:", error);
      message.error("获取级别列表失败");
    } finally {
      setLoadingLevels(false);
    }
  };

  const fetchCharactersByLevel = async (lvl, page = 1, size = pageSize) => {
    if (!lvl) return;

    try {
      setLoading(true);
      const offset = (page - 1) * size;
      const data = await api.getCharactersByLevel(lvl, size, offset);
      setCharacters(data.items);
      setTotalResults(data.total);
      setCurrentPage(page);
      setPageSize(size);
    } catch (error) {
      console.error("Error fetching characters by level:", error);
      message.error("获取汉字列表失败");
    } finally {
      setLoading(false);
    }
  };

  const handleLevelChange = (value) => {
    setSelectedLevel(value);
    navigate(`/level/${encodeURIComponent(value)}`);
    fetchCharactersByLevel(value, 1, pageSize);
  };

  const handlePageChange = (page, size) => {
    fetchCharactersByLevel(selectedLevel, page, size);
  };

  const columns = [
    {
      title: "日语汉字",
      dataIndex: "japanese_kanji",
      key: "japanese_kanji",
      width: 100,
      render: (text, record) => (
        <Link to={`/character/${record.id}`}>
          <span
            style={{
              fontSize: "24px",
              fontWeight: 700,
              background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            {text}
          </span>
        </Link>
      ),
    },
    {
      title: "中文汉字",
      dataIndex: "chinese_hanzi",
      key: "chinese_hanzi",
      width: 100,
      render: (text, record) => (
        <Link to={`/character/${record.id}`}>
          <span
            style={{
              fontSize: "24px",
              fontWeight: 700,
              background: "linear-gradient(135deg, #10b981 0%, #06b6d4 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            {text}
          </span>
        </Link>
      ),
    },
    {
      title: "字体",
      dataIndex: "forms_match",
      key: "forms_match",
      width: 90,
      responsive: ["md"],
      render: (match) =>
        match === true ? (
          <Tag color="success" style={{ borderRadius: 12 }}>
            一致
          </Tag>
        ) : match === false ? (
          <Tag color="warning" style={{ borderRadius: 12 }}>
            不一致
          </Tag>
        ) : (
          <Tag style={{ borderRadius: 12 }}>未知</Tag>
        ),
    },
    {
      title: "音读み",
      dataIndex: "on_readings",
      key: "on_readings",
      width: 120,
      ellipsis: { showTitle: false },
      responsive: ["lg"],
      render: (readings) => readings || "—",
    },
    {
      title: "训读み",
      dataIndex: "kun_readings",
      key: "kun_readings",
      width: 120,
      ellipsis: { showTitle: false },
      responsive: ["lg"],
      render: (readings) => readings || "—",
    },
    {
      title: "中文拼音",
      dataIndex: "chinese_readings",
      key: "chinese_readings",
      width: 120,
      ellipsis: { showTitle: false },
      responsive: ["md"],
      render: (readings) => readings || "—",
    },
    {
      title: "操作",
      key: "action",
      width: 85,
      fixed: "right",
      render: (_, record) => (
        <Link to={`/character/${record.id}`}>
          <Button type="primary" size="small">
            详情
          </Button>
        </Link>
      ),
    },
  ];

  // 快速级别选择
  const quickLevels = [
    { name: "一级汉字", color: "#ef4444" },
    { name: "二级汉字", color: "#f59e0b" },
    { name: "三级汉字", color: "#10b981" },
    { name: "四级汉字", color: "#3b82f6" },
  ];

  return (
    <div className="level-browser-container">
      {/* 返回按钮 */}
      <div style={{ marginBottom: 16 }}>
        <Link to="/">
          <Button icon={<ArrowLeftOutlined />}>返回首页</Button>
        </Link>
      </div>

      {/* 页面标题 */}
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ marginBottom: 8 }}>
          按级别浏览汉字
        </Title>
        <Paragraph style={{ color: "var(--color-text-secondary)", marginBottom: 0 }}>
          选择级别查看对应的汉字列表。级别通常按照日本汉字能力考试（JLPT）或中小学教育阶段划分。
        </Paragraph>
      </div>

      {/* 级别选择卡片 */}
      <Card className="hover-lift" style={{ marginBottom: 24 }}>
        <Row gutter={16} align="middle">
          <Col xs={24} md={12}>
            <div style={{ display: "flex", alignItems: "center" }}>
              <FolderOutlined style={{ marginRight: 12, fontSize: 20, color: "var(--color-primary)" }} />
              <span style={{ marginRight: 16, fontWeight: 500 }}>选择级别:</span>
              <Select
                style={{ width: 220 }}
                value={selectedLevel}
                onChange={handleLevelChange}
                placeholder="请选择级别"
                loading={loadingLevels}
                size="large"
              >
                {levels.map((lvl) => (
                  <Option key={lvl} value={lvl}>
                    {lvl}
                  </Option>
                ))}
              </Select>
            </div>
          </Col>
          <Col xs={24} md={12} style={{ marginTop: 16 }} className="level-browser-margin-top">
            {/* 快速级别选择 */}
            <Space wrap>
              <Text type="secondary" style={{ fontSize: 13 }}>快速选择:</Text>
              {quickLevels.map((lvl) => (
                <Link to={`/level/${lvl.name}`} key={lvl.name}>
                  <Tag
                    style={{
                      borderRadius: 16,
                      padding: "4px 12px",
                      cursor: "pointer",
                      borderLeft: `3px solid ${lvl.color}`,
                    }}
                  >
                    {lvl.name}
                  </Tag>
                </Link>
              ))}
            </Space>
          </Col>
        </Row>
      </Card>

      {/* 结果区域 */}
      {selectedLevel ? (
        loading ? (
          <Card>
            <div style={{ textAlign: "center", padding: 60 }}>
              <Spin size="large" />
              <p style={{ marginTop: 16, color: "var(--color-text-tertiary)" }}>
                加载{selectedLevel}汉字中...
              </p>
            </div>
          </Card>
        ) : characters.length > 0 ? (
          <>
            {/* 结果统计 */}
            <div style={{ marginBottom: 16 }}>
              <Space>
                <Badge count={totalResults} style={{ backgroundColor: "var(--color-primary)" }} />
                <Text>
                  <Text strong style={{ color: "var(--color-primary)" }}>{selectedLevel}</Text> 汉字列表
                </Text>
              </Space>
            </div>

            <Table
              dataSource={characters}
              columns={columns}
              rowKey="id"
              pagination={false}
              scroll={{ x: 750 }}
              size="middle"
            />

            {/* 分页 */}
            {totalResults > pageSize && (
              <div style={{ textAlign: "right", marginTop: 24 }}>
                <Pagination
                  current={currentPage}
                  pageSize={pageSize}
                  total={totalResults}
                  onChange={handlePageChange}
                  showSizeChanger
                  showQuickJumper
                  showTotal={(total) => `共 ${total} 条结果`}
                  pageSizeOptions={[10, 20, 50, 100]}
                />
              </div>
            )}
          </>
        ) : (
          <Card>
            <Empty
              description={`没有找到${selectedLevel}的汉字`}
              style={{ padding: "60px 0" }}
            />
          </Card>
        )
      ) : (
        <Card>
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="请先选择一个级别"
            style={{ padding: "60px 0" }}
          />
        </Card>
      )}
    </div>
  );
}

export default LevelBrowser;
