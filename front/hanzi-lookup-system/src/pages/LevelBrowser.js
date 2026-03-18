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
} from "antd";
import { BookOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import api from "../services/api";

const { Title, Paragraph } = Typography;
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
      render: (text, record) => (
        <Link to={`/character/${record.id}`}>
          <span style={{ fontSize: "24px", fontWeight: "bold" }}>{text}</span>
        </Link>
      ),
    },
    {
      title: "中文汉字",
      dataIndex: "chinese_hanzi",
      key: "chinese_hanzi",
      render: (text, record) => (
        <Link to={`/character/${record.id}`}>
          <span style={{ fontSize: "24px", fontWeight: "bold" }}>{text}</span>
        </Link>
      ),
    },
    {
      title: "字体",
      dataIndex: "forms_match",
      key: "forms_match",
      render: (match) =>
        match === true ? (
          <Tag color="green">一致</Tag>
        ) : match === false ? (
          <Tag color="orange">不一致</Tag>
        ) : (
          <Tag color="default">未知</Tag>
        ),
    },
    {
      title: "音读み",
      dataIndex: "on_readings",
      key: "on_readings",
      render: (readings) => readings || "N/A",
    },
    {
      title: "训读み",
      dataIndex: "kun_readings",
      key: "kun_readings",
      render: (readings) => readings || "N/A",
    },
    {
      title: "中文拼音",
      dataIndex: "chinese_readings",
      key: "chinese_readings",
      render: (readings) => readings || "N/A",
    },
    {
      title: "操作",
      key: "action",
      render: (_, record) => (
        <Link to={`/character/${record.id}`}>
          <Button type="primary" size="small">
            详情
          </Button>
        </Link>
      ),
    },
  ];

  return (
    <div className="level-browser-container">
      <div style={{ marginBottom: 16 }}>
        <Link to="/">
          <Button icon={<ArrowLeftOutlined />}>返回首页</Button>
        </Link>
      </div>

      <Title level={2}>按级别浏览汉字</Title>
      <Paragraph>
        选择级别查看对应的汉字列表。级别通常按照日本汉字能力考试（JLPT）或中小学教育阶段划分。
      </Paragraph>

      <Card style={{ marginBottom: 24 }}>
        <Row gutter={16} align="middle">
          <Col span={24}>
            <div style={{ display: "flex", alignItems: "center" }}>
              <BookOutlined style={{ marginRight: 8, fontSize: 18 }} />
              <span style={{ marginRight: 16 }}>选择级别:</span>
              <Select
                style={{ width: 200 }}
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
        </Row>
      </Card>

      {selectedLevel ? (
        loading ? (
          <div style={{ textAlign: "center", padding: 50 }}>
            <Spin size="large" />
            <p style={{ marginTop: 16 }}>加载{selectedLevel}汉字中...</p>
          </div>
        ) : characters.length > 0 ? (
          <>
            <div style={{ marginBottom: 16 }}>
              <Title level={4}>
                {selectedLevel}（共 {totalResults} 个）
              </Title>
            </div>

            <Table
              dataSource={characters}
              columns={columns}
              rowKey="id"
              pagination={false}
              bordered
              scroll={{ x: true }}
            />

            {totalResults > pageSize && (
              <div style={{ textAlign: "right", marginTop: 16 }}>
                <Pagination
                  current={currentPage}
                  pageSize={pageSize}
                  total={totalResults}
                  onChange={handlePageChange}
                  showSizeChanger
                  showQuickJumper
                  showTotal={(total) => `共 ${total} 条结果`}
                />
              </div>
            )}
          </>
        ) : (
          <Empty description={`没有找到${selectedLevel}的汉字`} />
        )
      ) : (
        <Card>
          <Empty description="请先选择一个级别" />
        </Card>
      )}
    </div>
  );
}

export default LevelBrowser;
