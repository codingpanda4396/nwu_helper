import React, { useState, useEffect } from "react";
import { Form, Input, InputNumber, Select, Switch, Card, Button, message, Spin } from "antd";
import { useParams, useNavigate } from "react-router-dom";
import { adminApi } from "../hooks/useAdmin";
import FieldHint from "../components/FieldHint";
import { OssUploader } from "../../OssUploader";
import type { Dict } from "../hooks/useAdmin";

export default function BannerForm({ token }: { token: string }) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = !!id;
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    adminApi<Dict>(token, `/api/admin/banners/${id}`)
      .then((data) => form.setFieldsValue(data))
      .catch((err) => message.error(err instanceof Error ? err.message : "加载失败"))
      .finally(() => setLoading(false));
  }, [token, id, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);

      if (isEdit) {
        await adminApi(token, `/api/admin/banners/${id}`, {
          method: "PATCH",
          body: JSON.stringify(values),
        });
        message.success("轮播图已更新");
      } else {
        await adminApi(token, "/api/admin/banners", {
          method: "POST",
          body: JSON.stringify(values),
        });
        message.success("轮播图创建成功");
      }
      navigate("/admin/banners");
    } catch (err) {
      if (err instanceof Error) {
        message.error(err.message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: 100 }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      <Card title={isEdit ? "编辑轮播图" : "添加轮播图"}>
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <FieldHint
            name="title"
            label="标题"
            required
            tooltip="轮播图的标题文字"
            example="校园美食节"
          >
            <Input placeholder="请输入标题" />
          </FieldHint>

          <FieldHint
            name="subtitle"
            label="副标题"
            tooltip="轮播图的副标题文字"
            example="限时优惠，不容错过"
          >
            <Input placeholder="请输入副标题" />
          </FieldHint>

          <FieldHint
            name="imageUrl"
            label="图片"
            required
            tooltip="轮播图的图片，建议尺寸 750x400"
          >
            <OssUploader token={token} onChange={(url) => form.setFieldValue("imageUrl", url)} />
          </FieldHint>

          <FieldHint
            name="targetType"
            label="跳转类型"
            required
            tooltip="点击轮播图后跳转到哪里"
          >
            <Select
              options={[
                { label: "跳转到活动", value: "ACTIVITY" },
                { label: "跳转到服务", value: "SERVICE" },
                { label: "跳转到关于页", value: "ABOUT" },
                { label: "跳转到指定页面", value: "TAB" },
                { label: "跳转到外部链接", value: "URL" },
              ]}
            />
          </FieldHint>

          <FieldHint
            name="targetId"
            label="跳转目标"
            tooltip="根据跳转类型填写对应的 ID 或页面名称"
            example="活动 ID 或页面名称（如 home、food）"
          >
            <Input placeholder="请输入跳转目标" />
          </FieldHint>

          <FieldHint
            name="url"
            label="页面路径/URL"
            tooltip="如果跳转类型是外部链接，请填写完整的 URL"
            example="https://example.com"
          >
            <Input placeholder="请输入 URL" />
          </FieldHint>

          <FieldHint
            name="sortOrder"
            label="排序权重"
            tooltip="数字越大越靠前显示"
            example="10"
          >
            <InputNumber placeholder="请输入排序权重" style={{ width: "100%" }} />
          </FieldHint>

          <Form.Item
            name="isActive"
            label="上架状态"
            valuePropName="checked"
            tooltip="开启后轮播图会在首页展示"
          >
            <Switch />
          </Form.Item>

          <div style={{ marginTop: 24 }}>
            <Button type="primary" htmlType="submit" loading={submitting}>
              {isEdit ? "保存修改" : "创建轮播图"}
            </Button>
            <Button
              style={{ marginLeft: 8 }}
              onClick={() => navigate("/admin/banners")}
            >
              取消
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
}
