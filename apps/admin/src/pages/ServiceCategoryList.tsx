import React, { useState } from "react";
import { Table, Card, Button, Switch, message, Modal, Form, Input, InputNumber } from "antd";
import { PlusOutlined, EditOutlined } from "@ant-design/icons";
import { useAdminData, adminApi } from "../hooks/useAdmin";
import FieldHint from "../components/FieldHint";
import type { Dict } from "../hooks/useAdmin";

export default function ServiceCategoryList({ token }: { token: string }) {
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string>("");
  const [form] = Form.useForm();
  const { data: categories, loading, reload } = useAdminData<Dict[]>(
    token,
    "/api/admin/service-categories"
  );

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
        await adminApi(token, `/api/admin/service-categories/${editingId}`, {
          method: "PATCH",
          body: JSON.stringify(values),
        });
        message.success("分类已更新");
      } else {
        await adminApi(token, "/api/admin/service-categories", {
          method: "POST",
          body: JSON.stringify(values),
        });
        message.success("分类创建成功");
      }
      setModalVisible(false);
      reload();
    } catch (err) {
      if (err instanceof Error) {
        message.error(err.message);
      }
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      await adminApi(token, `/api/admin/service-categories/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ isActive }),
      });
      message.success(isActive ? "已启用" : "已禁用");
      reload();
    } catch (err) {
      message.error(err instanceof Error ? err.message : "操作失败");
    }
  };

  const columns = [
    {
      title: "分类名称",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "标识",
      dataIndex: "key",
      key: "key",
    },
    {
      title: "图标",
      dataIndex: "icon",
      key: "icon",
    },
    {
      title: "排序",
      dataIndex: "sortOrder",
      key: "sortOrder",
    },
    {
      title: "状态",
      dataIndex: "isActive",
      key: "isActive",
      render: (isActive: boolean, record: Dict) => (
        <Switch
          checked={isActive}
          onChange={(checked) => handleToggleActive(record.id, checked)}
        />
      ),
    },
    {
      title: "操作",
      key: "action",
      render: (_: any, record: Dict) => (
        <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
          编辑
        </Button>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          添加分类
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={categories || []}
        rowKey="id"
        loading={loading}
        pagination={false}
      />

      <Modal
        title={editingId ? "编辑分类" : "添加分类"}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
      >
        <Form form={form} layout="vertical">
          <FieldHint
            name="name"
            label="分类名称"
            required
            tooltip="驾校分类的名称"
            example="打印装订"
          >
            <Input placeholder="请输入分类名称" />
          </FieldHint>

          <FieldHint
            name="key"
            label="标识"
            required
            tooltip="分类的唯一标识，用于程序识别"
            example="print"
          >
            <Input placeholder="请输入标识" />
          </FieldHint>

          <FieldHint
            name="icon"
            label="图标文案"
            tooltip="显示在图标位置的文字或 emoji"
            example="🖨️"
          >
            <Input placeholder="请输入图标文案" />
          </FieldHint>

          <FieldHint
            name="sortOrder"
            label="排序权重"
            tooltip="数字越大越靠前"
            example="10"
          >
            <InputNumber placeholder="请输入排序权重" style={{ width: "100%" }} />
          </FieldHint>
        </Form>
      </Modal>
    </div>
  );
}
