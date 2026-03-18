import React, { useState, useEffect } from "react";
import {
  Typography,
  Card,
  Form,
  Input,
  Button,
  Select,
  Switch,
  Space,
  Table,
  Modal,
  message,
  Alert,
  InputNumber,
} from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, LogoutOutlined } from "@ant-design/icons";
import api from "../services/api";

const { Title } = Typography;
const { Option } = Select;

function Admin() {
  const [form] = Form.useForm();
  const [loginForm] = Form.useForm();

  // 认证状态
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // 汉字管理状态
  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [levels, setLevels] = useState([]);
  const [error, setError] = useState(null);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // 检查登录状态
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    setIsCheckingAuth(true);
    const loggedIn = api.isAdminLoggedIn();
    if (loggedIn) {
      try {
        await api.verifyAdminToken();
        setIsLoggedIn(true);
        // 加载数据
        fetchLevels();
        fetchCharacters(1, pageSize);
      } catch (error) {
        console.error("Token 验证失败:", error);
        setIsLoggedIn(false);
      }
    } else {
      setIsLoggedIn(false);
    }
    setIsCheckingAuth(false);
  };

  const handleLogin = async (values) => {
    setLoginLoading(true);
    try {
      await api.adminLogin(values.password);
      message.success("登录成功");
      setIsLoggedIn(true);
      // 加载数据
      fetchLevels();
      fetchCharacters(1, pageSize);
    } catch (error) {
      console.error("登录失败:", error);
      message.error(error.response?.data?.detail || "登录失败，请检查密码");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    api.adminLogout();
    setIsLoggedIn(false);
    setCharacters([]);
    setLevels([]);
    message.info("已退出登录");
  };

  const fetchLevels = async () => {
    try {
      const data = await api.getLevels();
      setLevels(data || []);
    } catch (error) {
      console.error("Error fetching levels:", error);
      message.error("获取级别列表失败");
    }
  };

  const fetchCharacters = async (page = 1, size = pageSize) => {
    try {
      setLoading(true);
      const data = await api.getCharacters(page, size);
      if (data && data.items) {
        setCharacters(
          data.items.map((item) => ({
            ...item,
            key: item.id,
          }))
        );
        setTotal(data.total);
        setCurrentPage(page);
        setPageSize(size);
      } else {
        setCharacters([]);
        setTotal(0);
      }
    } catch (error) {
      console.error("Error fetching characters:", error);
      message.error("获取汉字列表失败");
      if (error.response?.status === 401) {
        setIsLoggedIn(false);
        setError("认证失败，请重新登录");
      } else {
        setError(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values) => {
    try {
      if (editingId) {
        await api.updateCharacter(editingId, values);
        message.success("汉字更新成功");
      } else {
        await api.createCharacter(values);
        message.success("汉字添加成功");
      }
      setModalVisible(false);
      form.resetFields();
      fetchCharacters(currentPage, pageSize);
    } catch (error) {
      console.error("Error saving character:", error);
      if (error.response?.status === 401) {
        message.error("认证失败，请重新登录");
        setIsLoggedIn(false);
      } else {
        message.error(error.response?.data?.detail || "保存失败");
      }
    }
  };

  const handleEdit = (record) => {
    setEditingId(record.id);
    form.setFieldsValue({
      id: record.id,
      kana_group: record.kana_group,
      japanese_kanji: record.japanese_kanji,
      chinese_hanzi: record.chinese_hanzi,
      level: record.level,
      forms_match: record.forms_match,
      examples: record.examples,
      on_readings: record.on_readings?.split("、") || [],
      kun_readings: record.kun_readings?.split("、") || [],
      chinese_readings: record.chinese_readings?.split("、") || [],
    });
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    Modal.confirm({
      title: "确认删除",
      content: "删除后无法恢复，确定要删除这个汉字吗？",
      okText: "确定删除",
      okType: "danger",
      cancelText: "取消",
      onOk: async () => {
        try {
          await api.deleteCharacter(id);
          message.success("汉字删除成功");
          fetchCharacters(currentPage, pageSize);
        } catch (error) {
          console.error("Error deleting character:", error);
          if (error.response?.status === 401) {
            message.error("认证失败，请重新登录");
            setIsLoggedIn(false);
          } else {
            message.error("删除失败");
          }
        }
      },
    });
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "日语汉字",
      dataIndex: "japanese_kanji",
      key: "japanese_kanji",
    },
    {
      title: "中文汉字",
      dataIndex: "chinese_hanzi",
      key: "chinese_hanzi",
    },
    {
      title: "级别",
      dataIndex: "level",
      key: "level",
    },
    {
      title: "字体一致",
      dataIndex: "forms_match",
      key: "forms_match",
      render: (text) => (text ? "是" : "否"),
    },
    {
      title: "操作",
      key: "action",
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  // 登录页面
  if (isCheckingAuth) {
    return (
      <div style={{ padding: "24px", textAlign: "center" }}>
        <Typography.Text>验证登录状态...</Typography.Text>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div
        style={{
          padding: "24px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "400px",
        }}
      >
        <Card
          title="管理员登录"
          style={{ width: "100%", maxWidth: 400 }}
        >
          <Form form={loginForm} layout="vertical" onFinish={handleLogin}>
            <Form.Item
              name="password"
              label="管理员密码"
              rules={[{ required: true, message: "请输入管理员密码" }]}
            >
              <Input.Password
                placeholder="请输入管理员密码"
                size="large"
                onPressEnter={loginForm.submit}
              />
            </Form.Item>
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loginLoading}
                block
                size="large"
              >
                登录
              </Button>
            </Form.Item>
          </Form>
          <Alert
            message="提示"
            description="请输入后端配置的管理员密码进行登录"
            type="info"
            showIcon
          />
        </Card>
      </div>
    );
  }

  // 管理页面
  return (
    <div className="admin-container" style={{ padding: "24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <Title level={2} style={{ margin: 0 }}>汉字管理</Title>
        <Button
          icon={<LogoutOutlined />}
          onClick={handleLogout}
          danger
        >
          退出登录
        </Button>
      </div>

      {error && (
        <Alert
          message="错误"
          description={error}
          type="error"
          showIcon
          closable
          style={{ marginBottom: 16 }}
          onClose={() => setError(null)}
        />
      )}

      <Card
        title="汉字列表"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingId(null);
              form.resetFields();
              setModalVisible(true);
            }}
          >
            添加汉字
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={characters}
          rowKey="id"
          loading={loading}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: total,
            showSizeChanger: true,
            showTotal: (t) => `共 ${t} 条记录`,
            onChange: (page, size) => fetchCharacters(page, size),
          }}
        />
      </Card>

      <Modal
        title={editingId ? "编辑汉字" : "添加汉字"}
        open={modalVisible}
        onOk={form.submit}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        width={800}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="japanese_kanji"
            label="日语汉字"
            rules={[{ required: true, message: "请输入日语汉字" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="chinese_hanzi"
            label="中文汉字"
            rules={[{ required: true, message: "请输入中文汉字" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="level"
            label="级别"
            rules={[{ required: true, message: "请选择级别" }]}
          >
            <Select>
              {levels.map((level) => (
                <Option key={level} value={level}>
                  {level}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="forms_match"
            label="字体一致"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item name="on_readings" label="音读">
            <Select
              mode="tags"
              style={{ width: "100%" }}
              placeholder="输入音读，按回车添加"
            >
              {form.getFieldValue("on_readings")?.map((reading) => (
                <Option key={reading} value={reading}>
                  {reading}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="kun_readings" label="训读">
            <Select
              mode="tags"
              style={{ width: "100%" }}
              placeholder="输入训读，按回车添加"
            >
              {form.getFieldValue("kun_readings")?.map((reading) => (
                <Option key={reading} value={reading}>
                  {reading}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="chinese_readings" label="中文读音">
            <Select
              mode="tags"
              style={{ width: "100%" }}
              placeholder="输入中文读音，按回车添加"
            >
              {form.getFieldValue("chinese_readings")?.map((reading) => (
                <Option key={reading} value={reading}>
                  {reading}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="examples" label="用例">
            <Input.TextArea rows={4} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default Admin;
