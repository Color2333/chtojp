// src/pages/Stats.js
import React, { useState, useEffect, useLayoutEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Typography,
  Card,
  Row,
  Col,
  Spin,
  Statistic,
  Divider,
  Button,
  message,
  Progress,
  Space,
} from "antd";
import {
  BarChartOutlined,
  PieChartOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  QuestionCircleOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import {
  PieChart,
  Pie as RechartsPie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Sector,
} from "recharts";
import api from "../services/api";

const { Title, Paragraph } = Typography;

// 现代化配色方案
const COLORS = [
  "#3b82f6", // 蓝色
  "#10b981", // 绿色
  "#f59e0b", // 橙色
  "#ef4444", // 红色
  "#8b5cf6", // 紫色
  "#06b6d4", // 青色
  "#ec4899", // 粉色
];

function Stats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [containerWidth, setContainerWidth] = useState(0);
  const chartContainerRef = useRef(null);

  useEffect(() => {
    fetchStats();
  }, []);

  useLayoutEffect(() => {
    const updateWidth = () => {
      if (chartContainerRef.current) {
        setContainerWidth(chartContainerRef.current.offsetWidth);
      }
    };

    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await api.getStats();
      setStats(data);
    } catch (error) {
      console.error("Error fetching stats:", error);
      message.error("获取统计数据失败");
    } finally {
      setLoading(false);
    }
  };

  const prepareLevelChartData = (levelCounts) => {
    if (!levelCounts || typeof levelCounts !== "object") return [];
    return Object.entries(levelCounts).map(([level, count], index) => ({
      name: level || "未知",
      value: count || 0,
      fill: COLORS[index % COLORS.length],
    }));
  };

  const prepareMatchChartData = (formMatches) => {
    if (!formMatches || typeof formMatches !== "object") return [];

    const data = [];
    if (formMatches["一致"]) {
      data.push({
        name: "字体一致",
        value: formMatches["一致"],
        fill: "#10b981",
      });
    }
    if (formMatches["不一致"]) {
      data.push({
        name: "字体不一致",
        value: formMatches["不一致"],
        fill: "#f59e0b",
      });
    }
    if (formMatches["未知"]) {
      data.push({
        name: "未标记",
        value: formMatches["未知"],
        fill: "#94a3b8",
      });
    }
    return data;
  };

  const prepareKanaGroupData = (kanaGroups) => {
    if (!kanaGroups || typeof kanaGroups !== "object") return [];
    const sortedGroups = Object.entries(kanaGroups)
      .filter(([group, count]) => group && count)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    return sortedGroups.map(([group, count], index) => ({
      name: group || "未分组",
      count: count || 0,
      fill: COLORS[index % COLORS.length],
    }));
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: 80 }}>
        <Spin size="large" />
        <p style={{ marginTop: 16, color: "var(--color-text-tertiary)" }}>
          加载数据库统计信息中...
        </p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div style={{ textAlign: "center", padding: 50 }}>
        <Title level={4}>无法加载统计数据</Title>
        <Button type="primary" onClick={fetchStats}>
          重试
        </Button>
      </div>
    );
  }

  const levelData = prepareLevelChartData(stats.level_counts || {});
  const matchData = prepareMatchChartData(stats.form_matches || {});
  const kanaGroupData = prepareKanaGroupData(stats.kana_groups || {});

  const totalCharacters = stats.total_characters || 0;
  const matchPercentage =
    matchData.length > 0
      ? Math.round(
          ((matchData.find((item) => item.name === "字体一致")?.value || 0) /
            totalCharacters) *
            100
        )
      : 0;

  const renderChart = (chartKey, ChartComponent, chartData, chartProps) => {
    if (!chartData || chartData.length === 0) {
      return (
        <div style={{ textAlign: "center", padding: "40px" }}>
          <p style={{ color: "var(--color-text-tertiary)" }}>暂无数据</p>
        </div>
      );
    }

    return (
      <div style={{ width: "100%", height: 300 }}>
        <ResponsiveContainer width="100%" height="100%">
          <ChartComponent {...chartProps} />
        </ResponsiveContainer>
      </div>
    );
  };

  return (
    <div className="stats-container" ref={chartContainerRef}>
      {/* 页面标题 */}
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ marginBottom: 8 }}>
          数据库统计
        </Title>
        <Paragraph style={{ color: "var(--color-text-secondary)", marginBottom: 0 }}>
          展示数据库中汉字的各项统计信息，包括总量、级别分布、字体一致性等
        </Paragraph>
      </div>

      {/* 统计卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <Card className="hover-lift">
            <Statistic
              title={
                <span style={{ color: "var(--color-text-secondary)" }}>
                  总汉字数
                </span>
              }
              value={stats?.total_characters || 0}
              prefix={<FileTextOutlined style={{ color: "#3b82f6" }} />}
              valueStyle={{
                color: "#3b82f6",
                fontWeight: 700,
                fontSize: 32,
              }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={8}>
          <Card className="hover-lift">
            <div style={{ textAlign: "center" }}>
              <Progress
                type="dashboard"
                percent={matchPercentage}
                format={(percent) => (
                  <span style={{ fontSize: 24, fontWeight: 700, color: "#10b981" }}>
                    {percent}%
                  </span>
                )}
                strokeColor={{
                  "0%": "#10b981",
                  "100%": "#06b6d4",
                }}
                trailColor="var(--color-border-light)"
                size={120}
              />
              <div style={{ marginTop: 16, color: "var(--color-text-secondary)" }}>
                字体一致率
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={8}>
          <Card className="hover-lift">
            <Row justify="space-around" align="middle">
              <Col span={11}>
                <Statistic
                  title={
                    <Space size={4}>
                      <CheckCircleOutlined style={{ color: "#10b981" }} />
                      <span style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>
                        一致
                      </span>
                    </Space>
                  }
                  value={
                    matchData.find((item) => item.name === "字体一致")?.value || 0
                  }
                  valueStyle={{ color: "#10b981", fontWeight: 600 }}
                />
              </Col>
              <Col span={11}>
                <Statistic
                  title={
                    <Space size={4}>
                      <CloseCircleOutlined style={{ color: "#f59e0b" }} />
                      <span style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>
                        不一致
                      </span>
                    </Space>
                  }
                  value={
                    matchData.find((item) => item.name === "字体不一致")?.value || 0
                  }
                  valueStyle={{ color: "#f59e0b", fontWeight: 600 }}
                />
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      {/* 级别分布 */}
      <Divider orientation="left" style={{ margin: "32px 0 24px" }}>
        级别分布
      </Divider>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={12}>
          <Card
            className="hover-lift"
            title={
              <Space>
                <BarChartOutlined style={{ color: "#3b82f6" }} />
                <span>各级别汉字数量</span>
              </Space>
            }
          >
            {renderChart("level", BarChart, levelData, {
              data: levelData,
              margin: { top: 20, right: 30, left: 20, bottom: 5 },
              children: [
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-light)" key="grid" />,
                <XAxis dataKey="name" key="x" style={{ fontSize: 12 }} />,
                <YAxis key="y" style={{ fontSize: 12 }} />,
                <Tooltip key="tooltip" />,
                <Bar dataKey="value" name="汉字数量" key="bar" radius={[4, 4, 0, 0]}>
                  {levelData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>,
              ],
            })}
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card
            className="hover-lift"
            title={
              <Space>
                <PieChartOutlined style={{ color: "#8b5cf6" }} />
                <span>字体一致性分布</span>
              </Space>
            }
          >
            {renderChart("match", PieChart, matchData, {
              children: [
                <RechartsPie
                  key="pie"
                  data={matchData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {matchData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </RechartsPie>,
                <Tooltip
                  key="tooltip"
                  formatter={(value) => [`${value} 个`, "数量"]}
                />,
              ],
            })}
          </Card>
        </Col>
      </Row>

      {/* 五十音分组 */}
      <Divider orientation="left" style={{ margin: "32px 0 24px" }}>
        五十音分组
      </Divider>

      <Card
        className="hover-lift"
        title={
          <Space>
            <BarChartOutlined style={{ color: "#06b6d4" }} />
            <span>各五十音分组汉字数量 (Top 10)</span>
          </Space>
        }
      >
        {renderChart("kana", BarChart, kanaGroupData, {
          data: kanaGroupData,
          layout: "vertical",
          margin: { top: 20, right: 30, left: 60, bottom: 5 },
          children: [
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-light)" key="grid" />,
            <XAxis type="number" key="x" style={{ fontSize: 12 }} />,
            <YAxis dataKey="name" type="category" key="y" style={{ fontSize: 12 }} width={50} />,
            <Tooltip key="tooltip" />,
            <Bar dataKey="count" name="汉字数量" key="bar" radius={[0, 4, 4, 0]}>
              {kanaGroupData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Bar>,
          ],
        })}
      </Card>

      {/* 操作按钮 */}
      <div style={{ marginTop: 32, textAlign: "center" }}>
        <Button
          type="primary"
          icon={<ReloadOutlined />}
          onClick={fetchStats}
          size="large"
        >
          刷新统计数据
        </Button>
      </div>
    </div>
  );
}

export default Stats;
