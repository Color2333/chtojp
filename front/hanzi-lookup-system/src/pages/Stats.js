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
} from "antd";
import {
  BarChartOutlined,
  PieChartOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  QuestionCircleOutlined,
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

// Custom colors for charts
const COLORS = [
  "#1890ff",
  "#52c41a",
  "#faad14",
  "#f5222d",
  "#722ed1",
  "#13c2c2",
  "#eb2f96",
];

function Stats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chartSizes, setChartSizes] = useState({});
  const chartRefs = {
    level: useRef(null),
    match: useRef(null),
    kana: useRef(null),
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useLayoutEffect(() => {
    const updateSizes = () => {
      const newSizes = {};
      Object.entries(chartRefs).forEach(([key, ref]) => {
        if (ref.current) {
          newSizes[key] = {
            width: ref.current.offsetWidth,
            height: 300,
          };
        }
      });
      setChartSizes(newSizes);
    };

    updateSizes();
    window.addEventListener("resize", updateSizes);
    return () => window.removeEventListener("resize", updateSizes);
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await api.getStats();
      console.log("Stats data:", data);
      setStats(data);
    } catch (error) {
      console.error("Error fetching stats:", error);
      message.error("获取统计数据失败");
    } finally {
      setLoading(false);
    }
  };

  // Prepare chart data from stats
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
        fill: "#52c41a",
      });
    }

    if (formMatches["不一致"]) {
      data.push({
        name: "字体不一致",
        value: formMatches["不一致"],
        fill: "#faad14",
      });
    }

    if (formMatches["未知"]) {
      data.push({
        name: "未标记",
        value: formMatches["未知"],
        fill: "#d9d9d9",
      });
    }

    return data;
  };

  const prepareKanaGroupData = (kanaGroups) => {
    if (!kanaGroups || typeof kanaGroups !== "object") return [];

    // Only include top groups for cleaner visualization
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
      <div style={{ textAlign: "center", padding: 100 }}>
        <Spin size="large" />
        <p style={{ marginTop: 16 }}>加载数据库统计信息中...</p>
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

  // Calculate percentages for form matches
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
        <div style={{ textAlign: "center", padding: "20px" }}>
          <p>暂无数据</p>
        </div>
      );
    }

    const size = chartSizes[chartKey];
    if (!size || size.width === 0) {
      return <div style={{ height: "300px" }} />;
    }

    return (
      <div ref={chartRefs[chartKey]} style={{ width: "100%", height: "300px" }}>
        <ResponsiveContainer width={size.width} height={size.height}>
          <ChartComponent {...chartProps} />
        </ResponsiveContainer>
      </div>
    );
  };

  return (
    <div className="stats-container" style={{ padding: "24px" }}>
      <Title level={2}>数据库统计</Title>
      <Paragraph>
        该页面展示数据库中汉字的各项统计信息，包括总量、级别分布、字体一致性等。
      </Paragraph>

      <Row gutter={[24, 24]}>
        <Col xs={24} md={8}>
          <Card>
            <Statistic
              title="数据库总汉字数"
              value={stats?.total_characters || 0}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>

        <Col xs={24} md={8}>
          <Card>
            <div style={{ textAlign: "center" }}>
              <Progress
                type="dashboard"
                percent={matchPercentage}
                format={(percent) => `${percent}%`}
                strokeColor="#52c41a"
              />
              <div style={{ marginTop: 16 }}>字体一致率</div>
            </div>
          </Card>
        </Col>

        <Col xs={24} md={8}>
          <Card>
            <Row justify="space-between">
              <Col span={12}>
                <Statistic
                  title={
                    <span>
                      <CheckCircleOutlined style={{ color: "#52c41a" }} />{" "}
                      字体一致
                    </span>
                  }
                  value={
                    matchData.find((item) => item.name === "字体一致")?.value ||
                    0
                  }
                  valueStyle={{ color: "#52c41a" }}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title={
                    <span>
                      <CloseCircleOutlined style={{ color: "#faad14" }} />{" "}
                      字体不一致
                    </span>
                  }
                  value={
                    matchData.find((item) => item.name === "字体不一致")
                      ?.value || 0
                  }
                  valueStyle={{ color: "#faad14" }}
                />
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      <Divider orientation="left">级别分布</Divider>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={12}>
          <Card
            title={
              <>
                <BarChartOutlined /> 各级别汉字数量
              </>
            }
          >
            {renderChart("level", BarChart, levelData, {
              data: levelData,
              margin: { top: 20, right: 30, left: 20, bottom: 5 },
              children: [
                <CartesianGrid strokeDasharray="3 3" key="grid" />,
                <XAxis dataKey="name" key="x" />,
                <YAxis key="y" />,
                <Tooltip key="tooltip" />,
                <Legend key="legend" />,
                <Bar dataKey="value" name="汉字数量" key="bar">
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
            title={
              <>
                <PieChartOutlined /> 字体一致性分布
              </>
            }
          >
            {renderChart("match", PieChart, matchData, {
              children: [
                <RechartsPie
                  key="pie"
                  data={matchData}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
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
                  formatter={(value) => [`${value} 个汉字`, "数量"]}
                />,
                <Legend key="legend" />,
              ],
            })}
          </Card>
        </Col>
      </Row>

      <Divider orientation="left">五十音分组</Divider>

      <Card title="各五十音分组汉字数量 (Top 10)">
        {renderChart("kana", BarChart, kanaGroupData, {
          data: kanaGroupData,
          layout: "vertical",
          margin: { top: 20, right: 30, left: 40, bottom: 5 },
          children: [
            <CartesianGrid strokeDasharray="3 3" key="grid" />,
            <XAxis type="number" key="x" />,
            <YAxis dataKey="name" type="category" key="y" />,
            <Tooltip key="tooltip" />,
            <Legend key="legend" />,
            <Bar dataKey="count" name="汉字数量" key="bar">
              {kanaGroupData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Bar>,
          ],
        })}
      </Card>

      <div style={{ marginTop: 24, textAlign: "center" }}>
        <Button type="primary" onClick={fetchStats}>
          刷新统计数据
        </Button>
      </div>
    </div>
  );
}

export default Stats;
