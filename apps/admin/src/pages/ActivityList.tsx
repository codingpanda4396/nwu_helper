import React, { useState } from "react";
import { Table, Card, Button, Tag, Space, Modal, Form, Input, InputNumber, Select, DatePicker, message, Popconfirm } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { useAdminData, adminApi, toDateTimeLocal, webImage } from "../hooks/useAdmin";
import type { Dict } from "../hooks/useAdmin";
import dayjs from "dayjs";

const statusColors: Record<string, string> = {
  DRAFT: "default",
  ACTIVE: "green",
  PAUSED: "orange",
  ENDED: "red",
};

const statusLabels: Record<string, string> = {
  DRAFT: "草稿",
  ACTIVE: "进行中",
  PAUSED: "已暂停",
  ENDED: "已结束",
};

export default function ActivityList({ token }: { token: string }) {
  const { data: activities, loading, reload } = useAdminData<Dict[]>(token, "/api/admin/activities");
  const { data: merchants } = useAdminData<Dict[]>(token, "/api/admin/merchants");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Dict | null>(null);
  const [form] = Form.useForm();

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({ status: "DRAFT", sortOrder: 100 });
    setModalOpen(true);
  };

  const openEdit = (record: Dict) => {
    setEditing(record);
    form.setFieldsValue({
      ...record,
      startAt: record.startAt ? dayjs(record.startAt) : undefined,
      endAt: record.endAt ? dayjs(record.endAt) : undefined,
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        ...values,
        startAt: values.startAt?.toISOString(),
        endAt: values.endAt?.toISOString(),
      };
      if (editing) {
        await adminApi(token, `/api/admin/activities/${editing.id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
        message.success("已更新");
      } else {
        await adminApi(token, "/api/admin/activities", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        message.success("已创建");
      }
      setModalOpen(false);
      reload();
    } catch (err) {
      message.error(err instanceof Error ? err.message : "操作失败");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await adminApi(token, `/api/admin/activities/${id}`, { method: "DELETE" });
      message.success("已删除");
      reload();
    } catch (err) {
      message.error(err instanceof Error ? err.message : "删除失败");
    }
  };

  const columns = [
    {
      title: "封面",
      dataIndex: "coverImage",
      key: "image",
      width: 80,
      render: (url: string) =>
        webImage(url) ? (
          <img src={webImage(url)} alt="" style={{ width: 60, height: 40, objectFit: "cover", borderRadius: 4 }} />
        ) : (
          "-"
        ),
    },
    { title: "标题", dataIndex: "title", key: "title", width: 200, ellipsis: true },
    {
      title: "关联商家",
      key: "merchant",
      width: 120,
      render: (_: any, record: Dict) => record.merchant?.name || "-",
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      width: 80,
      render: (status: string) => (
        <Tag color={statusColors[status]}>{statusLabels[status] || status}</Tag>
      ),
    },
    {
      title: "开始时间",
      dataIndex: "startAt",
      key: "startAt",
      width: 140,
      render: (v: string) => (v ? new Date(v).toLocaleDateString() : "-"),
    },
    {
      title: "结束时间",
      dataIndex: "endAt",
      key: "endAt",
      width: 140,
      render: (v: string) => (v ? new Date(v).toLocaleDateString() : "-"),
    },
    { title: "排序", dataIndex: "sortOrder", key: "sortOrder", width: 60 },
    {
      title: "操作",
      key: "actions",
      width: 140,
      render: (_: any, record: Dict) => (
        <Space size="small">
          <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(record)}>
            编辑
          </Button>
          <Popconfirm title="确定删除？" onConfirm={() => handleDelete(record.id)}>
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Card
      title="活动管理"
      extra={
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
          新增活动
        </Button>
      }
    >
      <Table
        dataSource={activities || []}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 20 }}
        scroll={{ x: 900 }}
      />

      <Modal
        title={editing ? "编辑活动" : "新增活动"}
        open={modalOpen}
        onOk={handleSave}
        onCancel={() => setModalOpen(false)}
        width={560}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item name="title" label="标题" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="merchantId" label="关联商家" rules={[{ required: true }]}>
            <Select
              showSearch
              optionFilterProp="label"
              options={(merchants || []).map((m: Dict) => ({ value: m.id, label: m.name }))}
            />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item name="coverImage" label="封面图 URL">
            <Input />
          </Form.Item>
          <Space>
            <Form.Item name="startAt" label="开始时间" rules={[{ required: true }]}>
              <DatePicker showTime />
            </Form.Item>
            <Form.Item name="endAt" label="结束时间" rules={[{ required: true }]}>
              <DatePicker showTime />
            </Form.Item>
          </Space>
          <Space>
            <Form.Item name="sortOrder" label="排序">
              <InputNumber min={0} />
            </Form.Item>
            <Form.Item name="status" label="状态">
              <Select
                options={[
                  { value: "DRAFT", label: "草稿" },
                  { value: "ACTIVE", label: "进行中" },
                  { value: "PAUSED", label: "已暂停" },
                  { value: "ENDED", label: "已结束" },
                ]}
              />
            </Form.Item>
          </Space>
        </Form>
      </Modal>
    </Card>
  );
}
