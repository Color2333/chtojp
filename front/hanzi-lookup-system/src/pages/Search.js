// src/pages/Search.js
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import {
  Typography,
  Input,
  Radio,
  Button,
  Table,
  Card,
  Row,
  Col,
  Pagination,
  Space,
  Tag,
  Spin,
  Empty,
  message,
  List,
  Skeleton,
  Badge,
} from "antd";
import {
  SearchOutlined,
  LoadingOutlined,
  SyncOutlined,
  FilterOutlined,
} from "@ant-design/icons";
import api from "../services/api";

const { Title, Paragraph, Text } = Typography;
const { Search } = Input;

function SearchPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useState(new URLSearchParams(location.search));
  const [searchInput, setSearchInput] = useState(searchParams.get("q") || "");
  const [searchResults, setSearchResults] = useState([]);
  const [totalResults, setTotalResults] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [searchLang, setSearchLang] = useState(
    searchParams.get("lang") || "ja"
  );
  const [hotSearches, setHotSearches] = useState([]);

  useEffect(() => {
    const query = searchParams.get("q");
    if (query) {
      setSearchInput(query);
      handleSearch(query, searchLang);
    }
    fetchHotSearches();
  }, [location.search]);

  const fetchHotSearches = async () => {
    try {
      const data = await api.getHotSearches(6);
      setHotSearches(data);
    } catch (error) {
      console.error("Error fetching hot searches:", error);
    }
  };

  const handleSearch = async (value, lang = searchLang) => {
    if (!value.trim()) {
      message.warning("请输入搜索内容");
      return;
    }

    setLoading(true);
    setSearched(true);

    try {
      const offset = (currentPage - 1) * pageSize;
      await api.recordSearch(value.trim());

      const results = await api.searchCharacters(
        value.trim(),
        lang,
        pageSize,
        offset
      );
      setSearchResults(results.items);
      setTotalResults(results.total);

      const urlParams = new URLSearchParams();
      urlParams.set("q", value);
      urlParams.set("lang", lang);
      navigate(`/search?${urlParams.toString()}`);
    } catch (error) {
      console.error("Search error:", error);
      message.error("搜索出错，请稍后重试");
      setSearchResults([]);
      setTotalResults(0);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page, size) => {
    setCurrentPage(page);
    setPageSize(size);
    handleSearch(searchParams.get("q") || "", searchLang);
  };

  const handleLangChange = (e) => {
    const newLang = e.target.value;
    setSearchLang(newLang);
    const query = searchParams.get("q");
    if (query) {
      handleSearch(query, newLang);
    }
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
      title: "级别",
      dataIndex: "level",
      key: "level",
      width: 110,
      responsive: ["sm"],
      render: (level) => (
        level ? (
          <Tag color="blue" style={{ borderRadius: 12 }}>
            {level}
          </Tag>
        ) : (
          <Text type="secondary">未标记</Text>
        )
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
          <Button type="primary" size="small" icon={<SearchOutlined />}>
            详情
          </Button>
        </Link>
      ),
    },
  ];

  return (
    <div className="search-container">
      {/* 页面标题 */}
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ marginBottom: 8 }}>
          汉字搜索
        </Title>
        <Paragraph style={{ color: "var(--color-text-secondary)", marginBottom: 0 }}>
          输入汉字、读音（假名或拼音）进行搜索，查找日中汉字对应关系
        </Paragraph>
      </div>

      {/* 搜索区域 */}
      <Card
        className="hover-lift"
        style={{ marginBottom: 24 }}
        bodyStyle={{ padding: 24 }}
      >
        <Row gutter={16} align="middle">
          <Col flex="auto">
            <Search
              placeholder="输入搜索内容"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              enterButton={
                <Button
                  type="primary"
                  icon={loading ? <LoadingOutlined /> : <SearchOutlined />}
                  loading={loading}
                >
                  搜索
                </Button>
              }
              size="large"
              onSearch={(value) => handleSearch(value, searchLang)}
            />
          </Col>
          <Col>
            <Radio.Group
              value={searchLang}
              onChange={handleLangChange}
              buttonStyle="solid"
              size="large"
            >
              <Radio.Button value="ja">日语</Radio.Button>
              <Radio.Button value="cn">中文</Radio.Button>
            </Radio.Group>
          </Col>
        </Row>

        <div style={{ marginTop: 12 }}>
          <Text type="secondary" style={{ fontSize: 13 }}>
            可以搜索汉字（如「愛」、「爱」）或读音（如「あい」、「ai」）
          </Text>
        </div>

        {/* 热门搜索 */}
        {hotSearches.length > 0 && !searched && (
          <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--color-border-light)" }}>
            <Space wrap size={[8, 8]}>
              <Text type="secondary" style={{ fontSize: 13 }}>
                热门搜索：
              </Text>
              {hotSearches.map((item, index) => (
                <Tag
                  key={index}
                  className="hot-search-tag"
                  onClick={() => handleSearch(item.term, searchLang)}
                >
                  {item.term}
                </Tag>
              ))}
            </Space>
          </div>
        )}
      </Card>

      {/* 加载状态 */}
      {loading ? (
        <Card style={{ marginBottom: 24 }}>
          <Skeleton active paragraph={{ rows: 6 }} />
          <Skeleton active paragraph={{ rows: 6 }} />
          <Skeleton active paragraph={{ rows: 4 }} />
        </Card>
      ) : searched ? (
        <>
          {/* 搜索结果统计 */}
          {searchResults.length > 0 && (
            <div style={{ marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Space>
                <FilterOutlined style={{ color: "var(--color-primary)" }} />
                <Text>
                  找到 <Text strong style={{ color: "var(--color-primary)" }}>{totalResults}</Text> 个相关结果
                </Text>
              </Space>
              <Text type="secondary" style={{ fontSize: 13 }}>
                搜索词: <Badge count={searchParams.get("q")} style={{ backgroundColor: "var(--color-primary)" }} />
              </Text>
            </div>
          )}

          {/* 结果表格 */}
          {searchResults.length > 0 ? (
            <>
              <Table
                dataSource={searchResults}
                columns={columns}
                rowKey="id"
                pagination={false}
                scroll={{ x: 800 }}
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
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <span>
                  没有找到与 <Text strong style={{ color: "var(--color-primary)" }}>{searchParams.get("q")}</Text> 相关的结果
                </span>
              }
              style={{ padding: "60px 0" }}
            >
              <Button
                type="primary"
                icon={<SyncOutlined />}
                onClick={() => handleSearch(searchParams.get("q") || "", searchLang)}
              >
                重新搜索
              </Button>
            </Empty>
          )}
        </>
      ) : (
        /* 初始状态提示 */
        <Card style={{ textAlign: "center", padding: "60px 24px" }}>
          <SearchOutlined style={{ fontSize: 64, color: "var(--color-border-base)", marginBottom: 24 }} />
          <Title level={4} type="secondary">开始搜索</Title>
          <Paragraph type="secondary">
            在上方输入框中输入汉字或读音，点击搜索按钮开始查询
          </Paragraph>
        </Card>
      )}
    </div>
  );
}

export default SearchPage;
