import React, { useState } from "react";
import { Table, Card, Tag, Space, Select, Button, Modal, Form, Input, message, Popconfirm } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { useAdminData, adminApi } from "../hooks/useAdmin";
import type { Dict } from "../hooks/useAdmin";

const statusColors: Record<string, string> = {
  PENDING: "orange",
  APPROVED: "green",
  REJECTED: "red",
};

const statusLabels: Record<string, string> = {
  PENDING: "待审核",
  APPROVED: "已通过",
  REJECTED: "已拒绝",
};

export default function TeacherList({ token }: { token: string }) {
  const [filterStatus, setFilterStatus] = useState<string | undefined>();
  const [keyword, setKeyword] = useState("");
  const params = new URLSearchParams();
  if (filterStatus) params.set("status", filterStatus);
  if (keyword) params.set("keyword", keyword);

  const { data: teachers, loading, reload } = useAdminData<Dict[]>(
    token,
    `/api/admin/academic/teachers${params.toString() ? `?${params}` : ""}`,
    [filterStatus, keyword]
  );

  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string>("");
  const [form] = Form.useForm();

  const handleAdd = () => {
    setEditingId("");
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record: Dict) => {
    setEditingId(record.id);
    form.setFieldsValue(record);
    setModalVisible(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editingId) {
        await adminApi(token, `/api/admin/academic/teachers/${editingId}`, {
          method: "PATCH",
          body: JSON.stringify(values),
        });
        message.success("教师信息已更新");
      }
      setModalVisible(false);
      reload();
    } catch (err) {
      if (err instanceof Error) {
        message.error(err.message);
      }
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await adminApi(token, `/api/admin/academic/teachers/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      message.success("状态已更新");
      reload();
    } catch (err) {
      message.error(err instanceof Error ? err.message : "操作失败");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await adminApi(token, `/api/admin/academic/teachers/${id}`, {
        method: "DELETE",
      });
      message.success("已删除");
      reload();
    } catch (err) {
      message.error(err instanceof Error ? err.message : "操作失败");
    }
  };

  const columns = [
    {
      title: "姓名",
      dataIndex: "name",
      key: "name",
      width: 120,
    },
    {
      title: "学院",
      dataIndex: "college",
      key: "college",
      width: 120,
      render: (v: string) => v || "-",
    },
    {
      title: "系别",
      dataIndex: "department",
      key: "department",
      width: 100,
      render: (v: string) => v || "-",
    },
    {
      title: "评价数",
      dataIndex: "reviewCount",
      key: "reviewCount",
      width: 80,
    },
    {
      title: "给分",
      dataIndex: "avgGrading",
      key: "avgGrading",
      width: 70,
      render: (v: number) => v ? v.toFixed(1) : "-",
    },
    {
      title: "点名",
      dataIndex: "avgAttendance",
      key: "avgAttendance",
      width: 70,
      render: (v: number) => v ? v.toFixed(1) : "-",
    },
    {
      title: "难度",
      dataIndex: "avgDifficulty",
      key: "avgDifficulty",
      width: 70,
      render: (v: number) => v ? v.toFixed(1) : "-",
    },
    {
      title: "推荐",
      dataIndex: "avgRecommend",
      key: "avgRecommend",
      width: 70,
      render: (v: number) => v ? v.toFixed(1) : "-",
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (status: string) => (
        <Tag color={statusColors[status]}>{statusLabels[status] || status}</Tag>
      ),
    },
    {
      title: "操作",
      key: "actions",
      width: 260,
      render: (_: any, record: Dict) => (
        <Space size="small">
          <Select
            size="small"
            value={record.status}
            style={{ width: 90 }}
            onChange={(val) => handleStatusChange(record.id, val)}
            options={[
              { value: "PENDING", label: "待审核" },
              { value: "APPROVED", label: "通过" },
              { value: "REJECTED", label: "拒绝" },
            ]}
          />
          <Button size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Popconfirm title="确定删除该教师？关联数据也将删除" onConfirm={() => handleDelete(record.id)}>
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Card
      title="教师管理"
      extra={
        <Space>
          <Input.Search
            placeholder="搜索姓名/学院"
            allowClear
            style={{ width: 200 }}
            onSearch={setKeyword}
          />
          <Select
            allowClear
            placeholder="筛选状态"
            style={{ width: 120 }}
            value={filterStatus}
            onChange={setFilterStatus}
            options={[
              { value: "PENDING", label: "待审核" },
              { value: "APPROVED", label: "已通过" },
              { value: "REJECTED", label: "已拒绝" },
            ]}
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            添加教师
          </Button>
        </Space>
      }
    >
      <Table
        dataSource={teachers || []}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 20 }}
        scroll={{ x: 1100 }}
      />

      <Modal
        title="编辑教师信息"
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="姓名" rules={[{ required: true, message: "请输入姓名" }]}>
            <Input placeholder="请输入教师姓名" />
          </Form.Item>
          <Form.Item name="college" label="学院">
            <Input placeholder="请输入学院" />
          </Form.Item>
          <Form.Item name="department" label="系别">
            <Input placeholder="请输入系别" />
          </Form.Item>
          <Form.Item name="avatarUrl" label="头像 URL">
            <Input placeholder="请输入头像地址" />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}
