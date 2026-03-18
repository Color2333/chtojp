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
} from "antd";
import {
  SearchOutlined,
  LoadingOutlined,
  SyncOutlined,
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
      const data = await api.getHotSearches(5);
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
      // Calculate offset
      const offset = (currentPage - 1) * pageSize;

      // 记录搜索词
      await api.recordSearch(value.trim());

      const results = await api.searchCharacters(
        value.trim(),
        lang,
        pageSize,
        offset
      );
      setSearchResults(results.items);
      setTotalResults(results.total);

      // Update URL without reloading
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
    // Re-run search with new pagination
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
      title: "级别",
      dataIndex: "level",
      key: "level",
      render: (level) => level || "未标记",
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
    <div className="search-container">
      <Title level={2}>汉字搜索</Title>
      <Paragraph>
        输入汉字、读音（假名或拼音）进行搜索，查找日中汉字对应关系。
      </Paragraph>

      <Card style={{ marginBottom: 24 }}>
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

        <div style={{ marginTop: 8 }}>
          <Text type="secondary">
            可以搜索汉字（如「愛」、「爱」）或读音（如「あい」、「ai」）
          </Text>
        </div>
      </Card>

      {loading ? (
        <Card style={{ marginBottom: 24 }}>
          <Skeleton active paragraph={{ rows: 5 }} />
          <Skeleton active paragraph={{ rows: 5 }} />
          <Skeleton active paragraph={{ rows: 3 }} />
        </Card>
      ) : searched ? (
        searchResults.length > 0 ? (
          <>
            <div style={{ marginBottom: 16 }}>
              <Text>找到相关结果 {totalResults} 个</Text>
            </div>

            <Table
              dataSource={searchResults}
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
          <Empty
            description={
              <span>
                没有找到与 <Text strong>{searchParams.get("q")}</Text>{" "}
                相关的结果
              </span>
            }
          >
            <Button
              icon={<SyncOutlined />}
              onClick={() =>
                handleSearch(searchParams.get("q") || "", searchLang)
              }
            >
              重试
            </Button>
          </Empty>
        )
      ) : null}

      {/* 热门搜索 */}
      {hotSearches.length > 0 && (
        <div style={{ marginTop: 4, marginBottom: 8 }}>
          <Text type="secondary" style={{ marginRight: 8 }}>
            热门搜索：
          </Text>
          <Space wrap size={[4, 8]}>
            {hotSearches.map((item, index) => (
              <Button
                key={index}
                type="link"
                size="small"
                style={{ padding: "0 4px" }}
                onClick={() => handleSearch(item.term, searchLang)}
              >
                {item.term}
              </Button>
            ))}
          </Space>
        </div>
      )}
    </div>
  );
}

export default SearchPage;
