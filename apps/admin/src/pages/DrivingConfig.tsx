import React, { useState, useEffect } from "react";
import { Form, Input, Switch, Card, Button, message, Spin, Space, Typography, Empty } from "antd";
import { SaveOutlined, PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import { adminApi, webImage } from "../hooks/useAdmin";
import FieldHint from "../components/FieldHint";
import { OssUploader } from "../OssUploader";
import type { Dict } from "../hooks/useAdmin";

const { Text } = Typography;

export default function DrivingConfig({ token }: { token: string }) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [promoImages, setPromoImages] = useState<string[]>([]);

  useEffect(() => {
    adminApi<Dict>(token, "/api/admin/driving-config")
      .then((data) => {
        form.setFieldsValue(data);
        setPromoImages(Array.isArray(data.promoImages) ? data.promoImages : []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);
      await adminApi(token, "/api/admin/driving-config", {
        method: "PATCH",
        body: JSON.stringify({ ...values, promoImages }),
      });
      message.success("保存成功");
    } catch (err) {
      if (err instanceof Error) {
        message.error(err.message);
      }
    } finally {
      setSaving(false);
    }
  };

  const addPromoImage = () => {
    setPromoImages([...promoImages, ""]);
  };

  const updatePromoImage = (index: number, url: string) => {
    const next = [...promoImages];
    next[index] = url;
    setPromoImages(next);
  };

  const removePromoImage = (index: number) => {
    setPromoImages(promoImages.filter((_, i) => i !== index));
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
      <Card title="驾校配置">
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <FieldHint
            name="title"
            label="页面标题"
            required
            tooltip="驾校宣传页的主标题"
            example="严选驾校"
          >
            <Input placeholder="请输入标题" />
          </FieldHint>

          <FieldHint
            name="description"
            label="页面描述"
            tooltip="驾校宣传页的描述文字"
            example="课少也能稳稳学车，就近练车、灵活约课、流程透明。"
          >
            <Input.TextArea placeholder="请输入描述" rows={3} />
          </FieldHint>

          <Form.Item label="宣传图" tooltip="驾校宣传图片，可添加多张，学生端按顺序展示">
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {promoImages.length === 0 && (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="暂无宣传图"
                  style={{ margin: "8px 0" }}
                />
              )}
              {promoImages.map((url, index) => (
                <div key={index} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <div style={{ flex: 1 }}>
                    <OssUploader
                      token={token}
                      value={url}
                      onChange={(newUrl) => updatePromoImage(index, newUrl)}
                      placeholder={`宣传图 ${index + 1}`}
                    />
                  </div>
                  <Button
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => removePromoImage(index)}
                  />
                </div>
              ))}
              <Button type="dashed" icon={<PlusOutlined />} onClick={addPromoImage} block>
                添加宣传图
              </Button>
            </div>
          </Form.Item>

          <FieldHint
            name="qrImageUrl"
            label="咨询二维码"
            tooltip="学生扫码咨询的二维码图片"
          >
            <OssUploader token={token} onChange={(url) => form.setFieldValue("qrImageUrl", url)} />
          </FieldHint>

          <FieldHint
            name="qrTitle"
            label="二维码标题"
            tooltip="二维码区域的标题文字"
            example="扫码咨询班型"
          >
            <Input placeholder="请输入标题" />
          </FieldHint>

          <FieldHint
            name="qrDescription"
            label="二维码说明"
            tooltip="二维码区域的描述文字"
            example="报名优惠、练车时间和接送安排，以西大圈微信咨询为准。"
          >
            <Input.TextArea placeholder="请输入说明" rows={3} />
          </FieldHint>

          <Form.Item
            name="isActive"
            label="启用状态"
            valuePropName="checked"
            tooltip="关闭后学生端驾校入口将不显示宣传内容"
          >
            <Switch />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={saving}>
              保存配置
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
