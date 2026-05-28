import React, { useState, useEffect } from "react";
import { Form, Input, Switch, Card, Button, message, Spin, Row, Col, Typography } from "antd";
import { SaveOutlined } from "@ant-design/icons";
import { adminApi, webImage } from "../hooks/useAdmin";
import FieldHint from "../components/FieldHint";
import { OssUploader } from "../OssUploader";
import type { Dict } from "../hooks/useAdmin";

const { Title, Text } = Typography;

export default function WechatEntry({ token }: { token: string }) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    adminApi<Dict>(token, "/api/admin/wechat-entry")
      .then((data) => form.setFieldsValue(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);
      await adminApi(token, "/api/admin/wechat-entry", {
        method: "PATCH",
        body: JSON.stringify(values),
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

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: 100 }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      <Card title="西大圈入口配置">
        <Row gutter={24}>
          <Col xs={24} lg={14}>
            <Form form={form} layout="vertical" onFinish={handleSubmit}>
              <FieldHint
                name="title"
                label="标题"
                required
                tooltip="微信入口的标题文字"
                example="加入西大圈微信"
              >
                <Input placeholder="请输入标题" />
              </FieldHint>

              <FieldHint
                name="description"
                label="说明"
                tooltip="微信入口的描述文字"
                example="领活动、问优惠、推荐好店、反馈问题，都从这里开始。"
              >
                <Input.TextArea placeholder="请输入说明" rows={3} />
              </FieldHint>

              <FieldHint
                name="buttonText"
                label="按钮文案"
                tooltip="按钮上显示的文字"
                example="添加微信"
              >
                <Input placeholder="请输入按钮文案" />
              </FieldHint>

              <FieldHint
                name="imageUrl"
                label="二维码/宣传图"
                tooltip="微信二维码或宣传图片"
              >
                <OssUploader token={token} onChange={(url) => form.setFieldValue("imageUrl", url)} />
              </FieldHint>

              <Form.Item
                name="isActive"
                label="启用状态"
                valuePropName="checked"
                tooltip="关闭后微信入口将不显示"
              >
                <Switch />
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={saving}>
                  保存配置
                </Button>
              </Form.Item>
            </Form>
          </Col>

          <Col xs={24} lg={10}>
            <Card title="预览" type="inner">
              <Form.Item noStyle shouldUpdate>
                {({ getFieldValue }) => {
                  const title = getFieldValue("title") || "加入西大圈微信";
                  const description = getFieldValue("description") || "领活动、问优惠、推荐好店、反馈问题，都从这里开始。";
                  const buttonText = getFieldValue("buttonText") || "添加微信";
                  const imageUrl = getFieldValue("imageUrl");
                  const isActive = getFieldValue("isActive");

                  return (
                    <div
                      style={{
                        padding: 16,
                        background: "#f5f5f5",
                        borderRadius: 8,
                        opacity: isActive ? 1 : 0.5,
                      }}
                    >
                      <div style={{ textAlign: "center", marginBottom: 16 }}>
                        {webImage(imageUrl) ? (
                          <img
                            src={webImage(imageUrl)}
                            alt="预览"
                            style={{ maxWidth: "100%", maxHeight: 200, borderRadius: 8 }}
                          />
                        ) : (
                          <div
                            style={{
                              width: "100%",
                              height: 200,
                              background: "#e8e8e8",
                              borderRadius: 8,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <Text type="secondary">暂无图片</Text>
                          </div>
                        )}
                      </div>
                      <Title level={4} style={{ textAlign: "center", marginBottom: 8 }}>
                        {title}
                      </Title>
                      <Text style={{ display: "block", textAlign: "center", marginBottom: 16 }}>
                        {description}
                      </Text>
                      <div style={{ textAlign: "center" }}>
                        <Button type="primary">{buttonText}</Button>
                      </div>
                    </div>
                  );
                }}
              </Form.Item>
            </Card>
          </Col>
        </Row>
      </Card>
    </div>
  );
}
