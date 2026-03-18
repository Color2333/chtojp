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
} from "antd";
import { ArrowLeftOutlined, SwapOutlined } from "@ant-design/icons";
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
      <div style={{ textAlign: "center", padding: "50px" }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return <Alert message="错误" description={error} type="error" showIcon />;
  }

  if (!character) {
    return <Alert message="未找到该汉字" type="warning" showIcon />;
  }

  return (
    <div>
      <Button
        type="link"
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate(-1)}
        style={{ marginBottom: 16 }}
      >
        返回
      </Button>

      <Card>
        <Row gutter={[24, 24]}>
          <Col xs={24} md={12}>
            <Card bordered={false} style={{ height: "100%" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  flexDirection: "column",
                }}
              >
                <div className="character-display" style={{ marginBottom: 24 }}>
                  <Row gutter={16} justify="center">
                    <Col>
                      <Card
                        style={{
                          minWidth: 150,
                          width: "auto",
                          height: 180,
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          border: "3px solid #1890ff",
                          padding: "0 24px",
                        }}
                      >
                        <div
                          style={{
                            fontSize: 100,
                            fontWeight: "bold",
                            whiteSpace: "nowrap",
                            textAlign: "center",
                            lineHeight: 1.2,
                          }}
                        >
                          {character.japanese_kanji}
                        </div>
                        <div style={{ marginTop: 8, textAlign: "center" }}>
                          日语汉字
                        </div>
                      </Card>
                    </Col>
                    <Col>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          height: "100%",
                        }}
                      >
                        <SwapOutlined style={{ fontSize: 24 }} />
                      </div>
                    </Col>
                    <Col>
                      <Card
                        style={{
                          minWidth: 150,
                          width: "auto",
                          height: 180,
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          border: "3px solid #52c41a",
                          padding: "0 24px",
                        }}
                      >
                        <div
                          style={{
                            fontSize: 100,
                            fontWeight: "bold",
                            whiteSpace: "nowrap",
                            textAlign: "center",
                            lineHeight: 1.2,
                          }}
                        >
                          {character.chinese_hanzi}
                        </div>
                        <div style={{ marginTop: 8, textAlign: "center" }}>
                          中文汉字
                        </div>
                      </Card>
                    </Col>
                  </Row>
                </div>

                <div style={{ textAlign: "center", marginBottom: 16 }}>
                  <Tag
                    color={character.forms_match ? "green" : "orange"}
                    style={{ fontSize: 16, padding: "4px 12px" }}
                  >
                    字体{character.forms_match ? "一致" : "不一致"}
                  </Tag>
                </div>

                {character.level && (
                  <div style={{ textAlign: "center", marginBottom: 16 }}>
                    <Tag
                      color="blue"
                      style={{ fontSize: 16, padding: "4px 12px" }}
                    >
                      {character.level}
                    </Tag>
                  </div>
                )}
              </div>
            </Card>
          </Col>

          <Col xs={24} md={12}>
            <Card title="读音信息" bordered={false}>
              <Space
                direction="vertical"
                size="middle"
                style={{ width: "100%" }}
              >
                <div>
                  <Text type="secondary" style={{ fontSize: "16px" }}>
                    音读み：
                  </Text>
                  <Space wrap>
                    {character.on_readings
                      ?.split("、")
                      .map((reading, index) => (
                        <Tag
                          key={index}
                          color="blue"
                          style={{ fontSize: "16px", padding: "4px 12px" }}
                        >
                          {reading}
                        </Tag>
                      ))}
                  </Space>
                </div>
                <div>
                  <Text type="secondary" style={{ fontSize: "16px" }}>
                    训读み：
                  </Text>
                  <Space wrap>
                    {character.kun_readings
                      ?.split("、")
                      .map((reading, index) => (
                        <Tag
                          key={index}
                          color="green"
                          style={{ fontSize: "16px", padding: "4px 12px" }}
                        >
                          {reading}
                        </Tag>
                      ))}
                  </Space>
                </div>
                <div>
                  <Text type="secondary" style={{ fontSize: "16px" }}>
                    中文读音：
                  </Text>
                  <Space wrap>
                    {character.chinese_readings
                      ?.split("、")
                      .map((reading, index) => (
                        <Tag
                          key={index}
                          color="orange"
                          style={{ fontSize: "16px", padding: "4px 12px" }}
                        >
                          {reading}
                        </Tag>
                      ))}
                  </Space>
                </div>
                {character.kana_group && (
                  <div>
                    <Text type="secondary" style={{ fontSize: "16px" }}>
                      五十音分组：
                    </Text>
                    <Tag style={{ fontSize: "16px", padding: "4px 12px" }}>
                      {character.kana_group}
                    </Tag>
                  </div>
                )}
              </Space>
            </Card>
          </Col>
        </Row>

        {character.examples && (
          <Card title="用例" style={{ marginTop: 24 }}>
            <Text style={{ fontSize: "16px", lineHeight: "1.8" }}>
              {character.examples}
            </Text>
          </Card>
        )}
      </Card>
    </div>
  );
}

export default CharacterDetail;
