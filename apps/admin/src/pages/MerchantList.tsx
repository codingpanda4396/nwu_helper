import React, { useState } from "react";
import { Table, Card, Button, Tag, Space, Modal, Form, Input, InputNumber, Select, message, Popconfirm, Switch } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { useAdminData, adminApi, webImage } from "../hooks/useAdmin";
import type { Dict } from "../hooks/useAdmin";

const statusColors: Record<string, string> = {
  APPROVED: "green",
  PENDING: "orange",
  REJECTED: "red",
  SUSPENDED: "default",
};

const statusLabels: Record<string, string> = {
  APPROVED: "已上线",
  PENDING: "待审核",
  REJECTED: "已拒绝",
  SUSPENDED: "已下架",
};

export default function MerchantList({ token }: { token: string }) {
  const { data: merchants, loading, reload } = useAdminData<Dict[]>(token, "/api/admin/merchants");
  const { data: categories } = useAdminData<Dict[]>(token, "/api/admin/categories");
  const { data: serviceCategories } = useAdminData<Dict[]>(token, "/api/admin/service-categories");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Dict | null>(null);
  const [form] = Form.useForm();

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({ status: "PENDING", sortOrder: 100 });
    setModalOpen(true);
  };

  const openEdit = (record: Dict) => {
    setEditing(record);
    form.setFieldsValue({
      ...record,
      tags: record.tags || [],
      serviceCategoryId: record.serviceCategoryId || undefined,
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      if (editing) {
        await adminApi(token, `/api/admin/merchants/${editing.id}`, {
          method: "PATCH",
          body: JSON.stringify(values),
        });
        message.success("已更新");
      } else {
        await adminApi(token, "/api/admin/merchants", {
          method: "POST",
          body: JSON.stringify(values),
        });
        message.success("已创建");
      }
      setModalOpen(false);
      reload();
    } catch (err) {
      message.error(err instanceof Error ? err.message : "操作失败");
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await adminApi(token, `/api/admin/merchants/${id}/status`, {
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
      await adminApi(token, `/api/admin/merchants/${id}`, { method: "DELETE" });
      message.success("已删除");
      reload();
    } catch (err) {
      message.error(err instanceof Error ? err.message : "删除失败");
    }
  };

  const columns = [
    {
      title: "封面",
      dataIndex: "coverImageUrl",
      key: "image",
      width: 80,
      render: (url: string) =>
        webImage(url) ? (
          <img src={webImage(url)} alt="" style={{ width: 60, height: 60, objectFit: "cover", borderRadius: 4 }} />
        ) : (
          "-"
        ),
    },
    { title: "名称", dataIndex: "name", key: "name", width: 140 },
    {
      title: "分类",
      dataIndex: ["category", "name"],
      key: "category",
      width: 80,
    },
    { title: "地址", dataIndex: "address", key: "address", ellipsis: true },
    { title: "电话", dataIndex: "phone", key: "phone", width: 120 },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (status: string) => (
        <Tag color={statusColors[status]}>{statusLabels[status] || status}</Tag>
      ),
    },
    { title: "排序", dataIndex: "sortOrder", key: "sortOrder", width: 60 },
    {
      title: "操作",
      key: "actions",
      width: 200,
      render: (_: any, record: Dict) => (
        <Space size="small">
          <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(record)}>
            编辑
          </Button>
          <Select
            size="small"
            value={record.status}
            style={{ width: 90 }}
            onChange={(val) => handleStatusChange(record.id, val)}
            options={[
              { value: "APPROVED", label: "上线" },
              { value: "PENDING", label: "待审" },
              { value: "REJECTED", label: "拒绝" },
              { value: "SUSPENDED", label: "下架" },
            ]}
          />
          <Popconfirm title="确定删除？" onConfirm={() => handleDelete(record.id)}>
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Card
      title="商家管理"
      extra={
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
          新增商家
        </Button>
      }
    >
      <Table
        dataSource={merchants || []}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 20 }}
        scroll={{ x: 900 }}
      />

      <Modal
        title={editing ? "编辑商家" : "新增商家"}
        open={modalOpen}
        onOk={handleSave}
        onCancel={() => setModalOpen(false)}
        width={640}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="名称" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="categoryId" label="分类" rules={[{ required: true }]}>
            <Select
              options={(categories || []).map((c: Dict) => ({ value: c.id, label: c.name }))}
            />
          </Form.Item>
          <Form.Item name="serviceCategoryId" label="服务分类">
            <Select
              allowClear
              options={(serviceCategories || []).map((c: Dict) => ({ value: c.id, label: c.name }))}
            />
          </Form.Item>
          <Form.Item name="summary" label="简介">
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item name="address" label="地址" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="phone" label="电话">
            <Input />
          </Form.Item>
          <Form.Item name="businessHours" label="营业时间">
            <Input placeholder="如 10:00-22:00" />
          </Form.Item>
          <Form.Item name="coverImageUrl" label="封面图 URL">
            <Input />
          </Form.Item>
          <Form.Item name="qrImageUrl" label="二维码图片 URL">
            <Input />
          </Form.Item>
          <Form.Item name="avgPrice" label="人均价格">
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>
          <Space>
            <Form.Item name="latitude" label="纬度">
              <InputNumber style={{ width: 140 }} step={0.0001} />
            </Form.Item>
            <Form.Item name="longitude" label="经度">
              <InputNumber style={{ width: 140 }} step={0.0001} />
            </Form.Item>
          </Space>
          <Form.Item name="tags" label="标签">
            <Select mode="tags" placeholder="输入后回车" />
          </Form.Item>
          <Space>
            <Form.Item name="sortOrder" label="排序">
              <InputNumber min={0} />
            </Form.Item>
            <Form.Item name="status" label="状态">
              <Select
                options={[
                  { value: "PENDING", label: "待审核" },
                  { value: "APPROVED", label: "已上线" },
                  { value: "REJECTED", label: "已拒绝" },
                  { value: "SUSPENDED", label: "已下架" },
                ]}
              />
            </Form.Item>
          </Space>
        </Form>
      </Modal>
    </Card>
  );
}
