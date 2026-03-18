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
} from "antd";
import {
  SearchOutlined,
  BookOutlined,
  ArrowRightOutlined,
} from "@ant-design/icons";
import api from "../services/api";

const { Title, Paragraph, Text } = Typography;
const { Search } = Input;

function Home() {
  const [randomCharacter, setRandomCharacter] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hotSearches, setHotSearches] = useState([]);

  useEffect(() => {
    fetchRandomCharacter();
    fetchHotSearches();
  }, []);

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
      const data = await api.getHotSearches(5);
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
    // 记录搜索词
    api.recordSearch(keyword);

    // 更完整的中日文判断逻辑
    let lang = "ja";
    // 包含中文简化独有字 → 中文
    const simplifiedOnly = /[场务观态镜欢寻仅杂尽丰临举旧叶号严争交产亩义乡乐习书买乱争亘亚产享价众优会体余佣侠侣侧侨俭俄俩俭偿储兴兽养兼冒卤单卖卫却卷厅厉压厌厚原厩去县参叁又双变叙叠台号叹吹呜呜厦嘱骗审肃肩肾肿胀胁胜胶胶脑脏脐脸腊腌腊腻腾臢腿裤褒膛酱裹释里重量链针铁锋错锦锅锤锻锈门问闷闸闹闺闽阁闽阅队阶际陆陈降际隆隐饥验骤骸高高鬼魅鸟鸡鸭鹅鹾鹾麦黄黑默黩黥黩齐齿龙龟龠]/;
    // 包含日语汉字独有字 → 日语
    const japaneseOnly = /[亜哀圧圦唖闇_iface_valuetype_va_list安德];
    // 包含假名 → 日语
    const hasKana = /[ぁ-んァ-ヶ]/;
    // 纯拉丁字母 → 中文拼音
    const isPinyin = /^[a-zA-ZüÜ]+$/;

    if (isPinyin.test(keyword)) {
      lang = "cn";
    } else if (hasKana.test(keyword)) {
      lang = "ja";
    } else if (simplifiedOnly.test(keyword)) {
      lang = "cn";
    } else {
      // 默认跳转到搜索页让用户选择
      lang = "ja";
    }

    window.location.href = `/search?q=${encodeURIComponent(
      keyword
    )}&lang=${lang}`;
  };

  return (
    <div className="home-container">
      <div
        className="hero-section"
        style={{ textAlign: "center", marginBottom: 40 }}
      >
        <Title>日中汉字对照查询系统</Title>
        <Paragraph style={{ fontSize: 18 }}>
          轻松查询日语汉字与中文汉字对应关系，包含读音、级别和用例
        </Paragraph>

        <div style={{ maxWidth: 600, margin: "40px auto" }}>
          <Search
            placeholder="输入汉字、读音进行搜索"
            allowClear
            enterButton={
              <>
                <SearchOutlined /> 搜索
              </>
            }
            size="large"
            onSearch={handleSearch}
          />
          <div
            style={{
              marginTop: 10,
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <Text type="secondary">例如：愛（日语）、爱（中文）、あい（假名）、ai（拼音）</Text>
            <Link to="/search">
              <Text type="secondary">
                高级搜索 <ArrowRightOutlined />
              </Text>
            </Link>
          </div>

          {/* 热门搜索 */}
          {hotSearches.length > 0 && (
            <div style={{ marginTop: 8, textAlign: "left" }}>
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
                    onClick={() => handleSearch(item.term)}
                  >
                    {item.term}
                  </Button>
                ))}
              </Space>
            </div>
          )}
        </div>
      </div>

      <Divider />

      <Row gutter={[24, 24]}>
        <Col xs={24} md={12}>
          <Card
            title="随机汉字"
            extra={
              <Button type="link" onClick={fetchRandomCharacter}>
                换一个
              </Button>
            }
          >
            {loading ? (
              <div style={{ textAlign: "center", padding: 20 }}>
                <Spin />
              </div>
            ) : randomCharacter ? (
              <div className="random-character">
                <Row align="middle" justify="center" gutter={24}>
                  <Col>
                    <Link to={`/character/${randomCharacter.id}`}>
                      <Card
                        hoverable
                        style={{
                          width: 100,
                          height: 120,
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        <div style={{ fontSize: 48, fontWeight: "bold" }}>
                          {randomCharacter.japanese_kanji}
                        </div>
                      </Card>
                    </Link>
                    <div style={{ textAlign: "center", marginTop: 8 }}>
                      日语
                    </div>
                  </Col>
                  <Col>
                    <Link to={`/character/${randomCharacter.id}`}>
                      <Card
                        hoverable
                        style={{
                          width: 100,
                          height: 120,
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        <div style={{ fontSize: 48, fontWeight: "bold" }}>
                          {randomCharacter.chinese_hanzi}
                        </div>
                      </Card>
                    </Link>
                    <div style={{ textAlign: "center", marginTop: 8 }}>
                      中文
                    </div>
                  </Col>
                </Row>
                <div style={{ marginTop: 16 }}>
                  <p>
                    <strong>级别:</strong> {randomCharacter.level || "未分级"}
                  </p>
                  <p>
                    <strong>音读み:</strong>{" "}
                    {randomCharacter.on_readings || "N/A"}
                  </p>
                  <p>
                    <strong>训读み:</strong>{" "}
                    {randomCharacter.kun_readings || "N/A"}
                  </p>
                  <p>
                    <strong>中文拼音:</strong>{" "}
                    {randomCharacter.chinese_readings || "N/A"}
                  </p>
                  <Button type="primary">
                    <Link to={`/character/${randomCharacter.id}`}>
                      详细信息
                    </Link>
                  </Button>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: 20 }}>
                无法加载随机汉字
              </div>
            )}
          </Card>
        </Col>

        <Col xs={24} md={12}>
          <Card title="快速导航">
            <div className="quick-links">
              <Space direction="vertical" style={{ width: "100%" }}>
                <Button
                  type="primary"
                  icon={<SearchOutlined />}
                  size="large"
                  block
                >
                  <Link to="/search" style={{ color: "white" }}>
                    汉字搜索
                  </Link>
                </Button>
                <Button icon={<BookOutlined />} size="large" block>
                  <Link to="/levels">按级别浏览</Link>
                </Button>
                <Link to="/stats">
                  <Button size="large" block>
                    数据库统计
                  </Button>
                </Link>
              </Space>

              <Divider />

              <Title level={4}>常用级别</Title>
              <Space wrap>
                <Link to="/level/一级汉字">
                  <Button>一级汉字</Button>
                </Link>
                <Link to="/level/二级汉字">
                  <Button>二级汉字</Button>
                </Link>
                <Link to="/level/三级汉字">
                  <Button>三级汉字</Button>
                </Link>
                <Link to="/level/四级汉字">
                  <Button>四级汉字</Button>
                </Link>
              </Space>
            </div>
          </Card>
        </Col>
      </Row>

      <Divider />

      <div
        className="about-section"
        style={{ marginTop: 40, marginBottom: 30 }}
      >
        <Title level={3}>关于本系统</Title>
        <Paragraph>
          本系统收录了常用日中汉字的对应关系，便于学习日语的中国学生和学习中文的日本学生查询。
          汉字数据基于《日中汉字标准对照表》整理。
        </Paragraph>
        <Paragraph>
          <Link to="/about">
            了解更多 <ArrowRightOutlined />
          </Link>
        </Paragraph>
      </div>
    </div>
  );
}

export default Home;
