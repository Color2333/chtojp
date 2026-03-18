// src/pages/CharacterDetail.js
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  Typography,
  Space,
  Button,
  Divider,
  Tag,
  Row,
  Col,
  Spin,
  Alert,
  Descriptions,
  Badge,
} from "antd";
import {
  ArrowLeftOutlined,
  SwapOutlined,
  SoundOutlined,
  BookOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import api from "../services/api";

const { Title, Text } = Typography;

function CharacterDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [character, setCharacter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCharacter();
  }, [id]);

  const fetchCharacter = async () => {
    try {
      setLoading(true);
      const data = await api.getCharacterById(id);
      setCharacter(data);
    } catch (error) {
      console.error("Error fetching character:", error);
      setError(error.response?.data?.detail || "获取汉字信息失败");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: 80 }}>
        <Spin size="large" />
        <div style={{ marginTop: 16, color: "var(--color-text-tertiary)" }}>
          加载中...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        message="加载失败"
        description={error}
        type="error"
        showIcon
        style={{ margin: 24 }}
      />
    );
  }

  if (!character) {
    return (
      <Alert
        message="未找到该汉字"
        type="warning"
        showIcon
        style={{ margin: 24 }}
      />
    );
  }

  return (
    <div className="character-detail-container">
      {/* 返回按钮 */}
      <Button
        type="text"
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate(-1)}
        style={{ marginBottom: 16, paddingLeft: 0 }}
      >
        返回
      </Button>

      {/* 主要内容卡片 */}
      <Card className="hover-lift">
        {/* 汉字展示区域 */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <Row gutter={[16, 16]} justify="center" align="middle">
            {/* 日语汉字 */}
            <Col xs={24} sm={10}>
              <div
                className="kanji-card hover-lift"
                style={{
                  padding: "24px 16px",
                  background: "linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)",
                  border: "2px solid rgba(59, 130, 246, 0.2)",
                }}
              >
                <div
                  className="kanji-display-large"
                  style={{
                    fontSize: "clamp(64px, 15vw, 120px)",
                  }}
                >
                  {character.japanese_kanji}
                </div>
                <div style={{ marginTop: 16, color: "var(--color-text-secondary)", fontWeight: 500 }}>
                  日语汉字
                </div>
              </div>
            </Col>

            {/* 交换图标 */}
            <Col xs={24} sm={4} style={{ textAlign: "center" }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontSize: 16,
                }}
              >
                <SwapOutlined />
              </div>
            </Col>

            {/* 中文汉字 */}
            <Col xs={24} sm={10}>
              <div
                className="kanji-card hover-lift"
                style={{
                  padding: "24px 16px",
                  background: "linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(6, 182, 212, 0.1) 100%)",
                  border: "2px solid rgba(16, 185, 129, 0.2)",
                }}
              >
                <div
                  className="kanji-display-large"
                  style={{
                    fontSize: "clamp(64px, 15vw, 120px)",
                  }}
                >
                  {character.chinese_hanzi}
                </div>
                <div style={{ marginTop: 16, color: "var(--color-text-secondary)", fontWeight: 500 }}>
                  中文汉字
                </div>
              </div>
            </Col>
          </Row>

          {/* 状态标签 */}
          <div style={{ marginTop: 32 }}>
            <Space size="middle" wrap>
              <Badge
                color={character.forms_match ? "#10b981" : "#f59e0b"}
                text={
                  <Tag
                    color={character.forms_match ? "success" : "warning"}
                    style={{
                      fontSize: 15,
                      padding: "6px 16px",
                      borderRadius: 20,
                      fontWeight: 500,
                    }}
                  >
                    字体{character.forms_match ? "一致" : "不一致"}
                  </Tag>
                }
              />
              {character.level && (
                <Badge
                  color="#3b82f6"
                  text={
                    <Tag
                      color="blue"
                      style={{
                        fontSize: 15,
                        padding: "6px 16px",
                        borderRadius: 20,
                        fontWeight: 500,
                      }}
                    >
                      {character.level}
                    </Tag>
                  }
                />
              )}
            </Space>
          </div>
        </div>

        <Divider style={{ margin: "32px 0" }} />

        {/* 读音信息 */}
        <Card
          type="inner"
          title={
            <Space>
              <SoundOutlined style={{ color: "var(--color-primary)" }} />
              <span>读音信息</span>
            </Space>
          }
          style={{ marginBottom: 24 }}
          headStyle={{ borderBottom: "1px solid var(--color-border-light)" }}
        >
          <Row gutter={[24, 24]}>
            <Col xs={24} md={8}>
              <div>
                <Text type="secondary" style={{ fontSize: 14, marginBottom: 8, display: "block" }}>
                  音读み (ON)
                </Text>
                <Space wrap>
                  {character.on_readings?.split("、").map((reading, index) => (
                    <Tag
                      key={index}
                      style={{
                        fontSize: 15,
                        padding: "6px 14px",
                        borderRadius: 16,
                        background: "linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(139, 92, 246, 0.15) 100%)",
                        border: "1px solid rgba(59, 130, 246, 0.3)",
                        color: "var(--color-primary)",
                        fontWeight: 500,
                      }}
                    >
                      {reading}
                    </Tag>
                  ))}
                </Space>
              </div>
            </Col>

            <Col xs={24} md={8}>
              <div>
                <Text type="secondary" style={{ fontSize: 14, marginBottom: 8, display: "block" }}>
                  训读み (KUN)
                </Text>
                <Space wrap>
                  {character.kun_readings?.split("、").map((reading, index) => (
                    <Tag
                      key={index}
                      style={{
                        fontSize: 15,
                        padding: "6px 14px",
                        borderRadius: 16,
                        background: "linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(6, 182, 212, 0.15) 100%)",
                        border: "1px solid rgba(16, 185, 129, 0.3)",
                        color: "#10b981",
                        fontWeight: 500,
                      }}
                    >
                      {reading}
                    </Tag>
                  ))}
                </Space>
              </div>
            </Col>

            <Col xs={24} md={8}>
              <div>
                <Text type="secondary" style={{ fontSize: 14, marginBottom: 8, display: "block" }}>
                  中文读音 (PINYIN)
                </Text>
                <Space wrap>
                  {character.chinese_readings?.split("、").map((reading, index) => (
                    <Tag
                      key={index}
                      style={{
                        fontSize: 15,
                        padding: "6px 14px",
                        borderRadius: 16,
                        background: "linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(239, 68, 68, 0.15) 100%)",
                        border: "1px solid rgba(245, 158, 11, 0.3)",
                        color: "#f59e0b",
                        fontWeight: 500,
                      }}
                    >
                      {reading}
                    </Tag>
                  ))}
                </Space>
              </div>
            </Col>
          </Row>

          {character.kana_group && (
            <>
              <Divider style={{ margin: "16px 0" }} />
              <div>
                <Text type="secondary" style={{ fontSize: 14, marginBottom: 8, display: "block" }}>
                  五十音分组
                </Text>
                <Tag
                  style={{
                    fontSize: 15,
                    padding: "6px 16px",
                    borderRadius: 16,
                    background: "var(--color-bg-spotlight)",
                    fontWeight: 500,
                  }}
                >
                  {character.kana_group}
                </Tag>
              </div>
            </>
          )}
        </Card>

        {/* 用例 */}
        {character.examples && (
          <Card
            type="inner"
            title={
              <Space>
                <BookOutlined style={{ color: "var(--color-secondary)" }} />
                <span>用例</span>
              </Space>
            }
            headStyle={{ borderBottom: "1px solid var(--color-border-light)" }}
          >
            <Text
              style={{
                fontSize: 16,
                lineHeight: 2,
                color: "var(--color-text-secondary)",
                whiteSpace: "pre-line",
              }}
            >
              {character.examples}
            </Text>
          </Card>
        )}
      </Card>

      {/* 详细信息表格 */}
      <Card
        className="hover-lift"
        style={{ marginTop: 24 }}
        title={
          <Space>
            <InfoCircleOutlined style={{ color: "var(--color-info)" }} />
            <span>详细信息</span>
          </Space>
        }
      >
        <Descriptions
          column={{ xs: 1, sm: 2, md: 3 }}
          size="middle"
          items={[
            {
              label: "字体匹配",
              children: character.forms_match ? (
                <Tag color="success">一致</Tag>
              ) : (
                <Tag color="warning">不一致</Tag>
              ),
            },
            {
              label: "级别",
              children: character.level || (
                <Text type="secondary">未标记</Text>
              ),
            },
            {
              label: "五十音",
              children: character.kana_group || (
                <Text type="secondary">—</Text>
              ),
            },
            {
              label: "音读み数",
              children: character.on_readings?.split("、").length || 0,
            },
            {
              label: "训读み数",
              children: character.kun_readings?.split("、").length || 0,
            },
            {
              label: "中文读音数",
              children: character.chinese_readings?.split("、").length || 0,
            },
          ]}
        />
      </Card>
    </div>
  );
}

export default CharacterDetail;
