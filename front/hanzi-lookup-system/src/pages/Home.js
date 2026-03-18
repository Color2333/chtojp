// src/pages/Home.js
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Typography,
  Card,
  Row,
  Col,
  Input,
  Button,
  Space,
  Divider,
  Spin,
  message,
  Tag,
} from "antd";
import {
  SearchOutlined,
  BookOutlined,
  ArrowRightOutlined,
  ThunderboltOutlined,
  DatabaseOutlined,
  BarChartOutlined,
} from "@ant-design/icons";
import api from "../services/api";

const { Title, Paragraph, Text } = Typography;
const { Search } = Input;

function Home() {
  const [randomCharacter, setRandomCharacter] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hotSearches, setHotSearches] = useState([]);
  const [searchHistory, setSearchHistory] = useState([]);

  useEffect(() => {
    fetchRandomCharacter();
    fetchHotSearches();
    loadSearchHistory();
  }, []);

  // 从 localStorage 加载搜索历史
  const loadSearchHistory = () => {
    try {
      const history = JSON.parse(localStorage.getItem("searchHistory") || "[]");
      setSearchHistory(history.slice(0, 5)); // 只显示最近5条
    } catch (error) {
      console.error("Error loading search history:", error);
    }
  };

  // 保存搜索历史到 localStorage
  const saveSearchHistory = (term) => {
    try {
      const history = JSON.parse(localStorage.getItem("searchHistory") || "[]");
      // 移除重复项并添加到开头
      const filtered = history.filter((item) => item !== term);
      filtered.unshift(term);
      // 保留最近10条
      const newHistory = filtered.slice(0, 10);
      localStorage.setItem("searchHistory", JSON.stringify(newHistory));
      setSearchHistory(newHistory.slice(0, 5));
    } catch (error) {
      console.error("Error saving search history:", error);
    }
  };

  const fetchRandomCharacter = async () => {
    try {
      setLoading(true);
      const data = await api.getRandomCharacter();
      setRandomCharacter(data);
    } catch (error) {
      console.error("Error fetching random character:", error);
      message.error("获取随机汉字失败");
    } finally {
      setLoading(false);
    }
  };

  const fetchHotSearches = async () => {
    try {
      const data = await api.getHotSearches(6);
      setHotSearches(data);
    } catch (error) {
      console.error("Error fetching hot searches:", error);
    }
  };

  const handleSearch = (value) => {
    if (!value.trim()) {
      message.warning("请输入搜索内容");
      return;
    }
    const keyword = value.trim();
    api.recordSearch(keyword);
    saveSearchHistory(keyword); // 保存到搜索历史

    let lang = "ja";
    const simplifiedOnly = /[场务观态镜欢寻仅杂尽丰临举旧叶号严争交产亩义乡乐习书买乱争亘亚产享价众优会体余佣侠侣侧侨俭俄俩俭偿储兴兽养兼冒卤单卖卫却卷厅厉压厌厚原厩去县参叁又双变叙叠台号叹吹呜呜厦嘱骗审肃肩肾肿胀胁胜胶胶脑脏脐脸腊腌腊腻腾臢腿裤褒膛酱裹释里重量链针铁锋错锦锅锤锻锈门问闷闸闹闺闽阁闽阅队阶际陆陈降际隆隐饥验骤骸高高鬼魅鸟鸡鸭鹅鹾鹾麦黄黑默黩黥黩齐齿龙龟龠]/;
    const japaneseOnly = /[亜哀圧圦唖闇]/;
    const hasKana = /[ぁ-んァ-ヶ]/;
    const isPinyin = /^[a-zA-ZüÜ]+$/;

    if (isPinyin.test(keyword)) {
      lang = "cn";
    } else if (hasKana.test(keyword)) {
      lang = "ja";
    } else if (simplifiedOnly.test(keyword)) {
      lang = "cn";
    } else {
      lang = "ja";
    }

    window.location.href = `/search?q=${encodeURIComponent(keyword)}&lang=${lang}`;
  };

  return (
    <div className="home-container">
      {/* Hero 区域 - 现代化设计 */}
      <div className="hero-section animate-fade-in-up">
        <div className="hero-gradient">
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <Title
              level={1}
              className="gradient-text"
              style={{
                fontWeight: 700,
                marginBottom: 16,
              }}
            >
              日中汉字对照查询系统
            </Title>
            <Paragraph
              style={{
                fontSize: 16,
                color: "var(--color-text-secondary)",
                maxWidth: 600,
                margin: "0 auto 24px",
              }}
            >
              轻松查询日语汉字与中文汉字对应关系，包含读音、级别和用例
            </Paragraph>
          </div>

          {/* 现代化搜索框 */}
          <div className="search-container-modern">
            <Search
              placeholder="输入汉字、读音进行搜索"
              allowClear
              enterButton={
                <span className="search-button-content">
                  <SearchOutlined /> 搜索
                </span>
              }
              size="large"
              onSearch={handleSearch}
              className="home-search-input"
            />
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 8,
                marginTop: 12,
              }}
            >
              <Text type="secondary" style={{ fontSize: 13 }}>
                💡 例如：愛（日语）、爱（中文）、あい（假名）、ai（拼音）
              </Text>
              <Link to="/search">
                <Text
                  type="secondary"
                  style={{ fontSize: 13, display: "flex", alignItems: "center" }}
                >
                  高级搜索 <ArrowRightOutlined />
                </Text>
              </Link>
            </div>

            {/* 搜索历史 */}
            {searchHistory.length > 0 && (
              <div className="search-history-section" style={{ marginTop: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <Text type="secondary" style={{ fontSize: 13 }}>
                    🕐 搜索历史
                  </Text>
                  <Text
                    type="secondary"
                    style={{ fontSize: 12, cursor: "pointer" }}
                    onClick={() => {
                      localStorage.removeItem("searchHistory");
                      setSearchHistory([]);
                    }}
                  >
                    清空
                  </Text>
                </div>
                <Space wrap size={[8, 8]}>
                  {searchHistory.map((term, index) => (
                    <Tag
                      key={index}
                      className="search-history-tag"
                      onClick={() => handleSearch(term)}
                    >
                      {term}
                    </Tag>
                  ))}
                </Space>
              </div>
            )}

            {/* 热门搜索 - 现代化标签 */}
            {hotSearches.length > 0 && (
              <div style={{ marginTop: searchHistory.length > 0 ? 16 : 16 }}>
                <Text type="secondary" style={{ marginRight: 12, fontSize: 13 }}>
                  🔥 热门搜索
                </Text>
                <Space wrap size={[8, 8]}>
                  {hotSearches.map((item, index) => (
                    <Tag
                      key={index}
                      className="hot-search-tag animate-fade-in-up"
                      style={{ animationDelay: `${index * 50}ms` }}
                      onClick={() => handleSearch(item.term)}
                    >
                      {item.term}
                    </Tag>
                  ))}
                </Space>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 快捷导航 - 现代化卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {[
          {
            icon: <SearchOutlined style={{ color: "#3b82f6" }} />,
            title: "汉字搜索",
            desc: "快速查找汉字对应关系",
            link: "/search",
            color: "#3b82f6",
          },
          {
            icon: <BookOutlined style={{ color: "#8b5cf6" }} />,
            title: "按级别浏览",
            desc: "按 JLPT 级别查看汉字",
            link: "/levels",
            color: "#8b5cf6",
          },
          {
            icon: <DatabaseOutlined style={{ color: "#10b981" }} />,
            title: "数据库统计",
            desc: "查看系统数据统计",
            link: "/stats",
            color: "#10b981",
          },
          {
            icon: <BarChartOutlined style={{ color: "#f59e0b" }} />,
            title: "常用级别",
            desc: "快速访问常用级别",
            link: "/levels",
            color: "#f59e0b",
          },
        ].map((item, index) => (
          <Col xs={12} sm={12} md={6} key={index}>
            <Link to={item.link}>
              <Card
                className="quick-nav-card hover-lift"
                style={{
                  height: "100%",
                  borderColor: `${item.color}20`,
                }}
                bodyStyle={{ padding: 20 }}
              >
                <div className="icon">{item.icon}</div>
                <div style={{ fontWeight: 600, marginBottom: 4, color: "var(--color-text-primary)" }}>
                  {item.title}
                </div>
                <div style={{ fontSize: 12, color: "var(--color-text-tertiary)" }}>
                  {item.desc}
                </div>
              </Card>
            </Link>
          </Col>
        ))}
      </Row>

      <Divider style={{ margin: "24px 0" }} />

      <Row gutter={[24, 24]}>
        {/* 随机汉字卡片 */}
        <Col xs={24} md={12}>
          <Card
            className="hover-lift"
            title={
              <Space>
                <ThunderboltOutlined style={{ color: "#f59e0b" }} />
                <span>随机汉字</span>
              </Space>
            }
            extra={
              <Button
                type="text"
                onClick={fetchRandomCharacter}
                loading={loading}
                style={{ color: "var(--color-primary)" }}
              >
                换一个
              </Button>
            }
          >
            {loading ? (
              <div style={{ textAlign: "center", padding: 40 }}>
                <Spin size="large" />
              </div>
            ) : randomCharacter ? (
              <div className="random-character">
                <Row align="middle" justify="center" gutter={[16, 16]}>
                  <Col xs={24} sm={10}>
                    <Link to={`/character/${randomCharacter.id}`}>
                      <div
                        className="kanji-card hover-lift"
                        style={{
                          width: "100%",
                          maxWidth: 140,
                          height: 140,
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "center",
                          alignItems: "center",
                          margin: "0 auto",
                        }}
                      >
                        <div
                          style={{
                            fontSize: 48,
                            fontWeight: 700,
                            background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            backgroundClip: "text",
                          }}
                        >
                          {randomCharacter.japanese_kanji}
                        </div>
                        <div style={{ marginTop: 8, fontSize: 12, color: "var(--color-text-tertiary)" }}>
                          日语
                        </div>
                      </div>
                    </Link>
                  </Col>
                  <Col xs={24} sm={4} style={{ textAlign: "center" }}>
                    <div
                      style={{
                        fontSize: 24,
                        color: "var(--color-text-quaternary)",
                      }}
                    >
                      ↔
                    </div>
                  </Col>
                  <Col xs={24} sm={10}>
                    <Link to={`/character/${randomCharacter.id}`}>
                      <div
                        className="kanji-card hover-lift"
                        style={{
                          width: "100%",
                          maxWidth: 140,
                          height: 140,
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "center",
                          alignItems: "center",
                          margin: "0 auto",
                        }}
                      >
                        <div
                          style={{
                            fontSize: 48,
                            fontWeight: 700,
                            background: "linear-gradient(135deg, #10b981 0%, #06b6d4 100%)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            backgroundClip: "text",
                          }}
                        >
                          {randomCharacter.chinese_hanzi}
                        </div>
                        <div style={{ marginTop: 8, fontSize: 12, color: "var(--color-text-tertiary)" }}>
                          中文
                        </div>
                      </div>
                    </Link>
                  </Col>
                </Row>
                <div style={{ marginTop: 20 }}>
                  <Space direction="vertical" style={{ width: "100%" }} size="small">
                    <div>
                      <Text type="secondary">级别：</Text>
                      <Tag color="blue" style={{ marginLeft: 8 }}>
                        {randomCharacter.level || "未分级"}
                      </Tag>
                    </div>
                    <div>
                      <Text type="secondary">音读み：</Text>
                      <Text strong>{randomCharacter.on_readings || "N/A"}</Text>
                    </div>
                    <div>
                      <Text type="secondary">训读み：</Text>
                      <Text strong>{randomCharacter.kun_readings || "N/A"}</Text>
                    </div>
                    <div>
                      <Text type="secondary">中文拼音：</Text>
                      <Text strong>{randomCharacter.chinese_readings || "N/A"}</Text>
                    </div>
                    <div style={{ marginTop: 12 }}>
                      <Link to={`/character/${randomCharacter.id}`}>
                        <Button
                          type="primary"
                          block
                          icon={<ArrowRightOutlined />}
                        >
                          查看详情
                        </Button>
                      </Link>
                    </div>
                  </Space>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: 40, color: "var(--color-text-tertiary)" }}>
                无法加载随机汉字
              </div>
            )}
          </Card>
        </Col>

        {/* 常用级别 */}
        <Col xs={24} md={12}>
          <Card
            className="hover-lift"
            title={
              <Space>
                <BookOutlined style={{ color: "#8b5cf6" }} />
                <span>常用级别</span>
              </Space>
            }
          >
            <Space direction="vertical" style={{ width: "100%" }} size="middle">
              {[
                { name: "一级汉字", color: "#ef4444", count: "~1000" },
                { name: "二级汉字", color: "#f59e0b", count: "~1000" },
                { name: "三级汉字", color: "#10b981", count: "~300" },
                { name: "四级汉字", color: "#3b82f6", count: "~100" },
              ].map((level, index) => (
                <Link to={`/level/${level.name}`} key={index}>
                  <Card
                    size="small"
                    className="hover-lift"
                    style={{
                      borderColor: `${level.color}30`,
                      borderLeft: `3px solid ${level.color}`,
                    }}
                    bodyStyle={{ padding: "12px 16px" }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <Space>
                        <div
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            background: level.color,
                          }}
                        />
                        <Text strong style={{ color: "var(--color-text-primary)" }}>
                          {level.name}
                        </Text>
                      </Space>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {level.count}
                      </Text>
                    </div>
                  </Card>
                </Link>
              ))}
            </Space>
          </Card>
        </Col>
      </Row>

      <Divider style={{ margin: "24px 0" }} />

      {/* 关于区域 */}
      <div
        className="about-section animate-fade-in-up"
        style={{ textAlign: "center", padding: "24px 0" }}
      >
        <Title level={3}>关于本系统</Title>
        <Paragraph style={{ maxWidth: 600, margin: "0 auto 16px", color: "var(--color-text-secondary)" }}>
          本系统收录了常用日中汉字的对应关系，便于学习日语的中国学生和学习中文的日本学生查询。
          汉字数据基于《日中汉字标准对照表》整理。
        </Paragraph>
        <Link to="/about">
          <Button type="default" icon={<ArrowRightOutlined />}>
            了解更多
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default Home;
