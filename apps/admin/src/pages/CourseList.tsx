import React, { useState, useEffect } from "react";
import { Table, Card, Button, Modal, Form, Input, Select, message, Popconfirm, Space } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { useAdminData, adminApi } from "../hooks/useAdmin";
import type { Dict } from "../hooks/useAdmin";

export default function CourseList({ token }: { token: string }) {
  const [keyword, setKeyword] = useState("");
  const params = keyword ? `?keyword=${keyword}` : "";

  const { data: courses, loading, reload } = useAdminData<Dict[]>(
    token,
    `/api/admin/academic/courses${params}`,
    [keyword]
  );

  // Fetch approved teachers for the course form
  const { data: teachers } = useAdminData<Dict[]>(
    token,
    "/api/admin/academic/teachers?status=APPROVED"
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
        await adminApi(token, `/api/admin/academic/courses/${editingId}`, {
          method: "PATCH",
          body: JSON.stringify(values),
        });
        message.success("课程已更新");
      } else {
        await adminApi(token, "/api/admin/academic/courses", {
          method: "POST",
          body: JSON.stringify(values),
        });
        message.success("课程创建成功");
      }
      setModalVisible(false);
      reload();
    } catch (err) {
      if (err instanceof Error) {
        message.error(err.message);
      }
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await adminApi(token, `/api/admin/academic/courses/${id}`, {
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
      title: "课程名称",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "授课教师",
      dataIndex: "teacherName",
      key: "teacherName",
    },
    {
      title: "操作",
      key: "actions",
      width: 180,
      render: (_: any, record: Dict) => (
        <Space size="small">
          <Button size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Popconfirm title="确定删除该课程？关联资料也将删除" onConfirm={() => handleDelete(record.id)}>
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Card
      title="课程管理"
      extra={
        <Space>
          <Input.Search
            placeholder="搜索课程名"
            allowClear
            style={{ width: 200 }}
            onSearch={setKeyword}
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            添加课程
          </Button>
        </Space>
      }
    >
      <Table
        dataSource={courses || []}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 20 }}
      />

      <Modal
        title={editingId ? "编辑课程" : "添加课程"}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="课程名称" rules={[{ required: true, message: "请输入课程名称" }]}>
            <Input placeholder="例如：高等数学" />
          </Form.Item>
          <Form.Item name="teacherId" label="授课教师" rules={[{ required: true, message: "请选择授课教师" }]}>
            <Select
              placeholder="选择教师"
              showSearch
              filterOption={(input, option) =>
                (option?.label as string)?.toLowerCase().includes(input.toLowerCase())
              }
              options={(teachers || []).map((t: Dict) => ({
                value: t.id,
                label: `${t.name}${t.college ? ` (${t.college})` : ""}`,
              }))}
            />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}
