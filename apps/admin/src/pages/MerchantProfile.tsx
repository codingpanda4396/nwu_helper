import React, { useState, useEffect } from "react";
import { Card, Form, Input, Button, message, Spin, Tag } from "antd";
import { adminApi } from "../hooks/useAdmin";

const { TextArea } = Input;

export default function MerchantProfile({ token }: { token: string }) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [merchant, setMerchant] = useState<any>(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await adminApi(token, "/api/merchant/me");
        setMerchant(data);
        form.setFieldsValue(data);
      } catch (e) {
        setMerchant(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  const handleSubmit = async (values: any) => {
    setSaving(true);
    try {
      await adminApi(token, "/api/merchant/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          summary: values.summary,
          phone: values.phone,
          businessHours: values.businessHours,
          coverImageUrl: values.coverImageUrl,
          tags: values.tags ? values.tags.split(",").map((t: string) => t.trim()).filter(Boolean) : []
        })
      });
      message.success("已提交，等待管理员复审");
    } catch (e: any) {
      message.error(e.message || "保存失败");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Spin size="large" style={{ display: "block", margin: "100px auto" }} />;
  if (!merchant) return <Card><p>尚未关联店铺，请联系管理员绑定</p></Card>;

  return (
    <div>
      <Card title="店铺信息" extra={
        <Tag color={merchant.status === "APPROVED" ? "green" : "orange"}>
          {merchant.status === "APPROVED" ? "已审核" : merchant.status === "PENDING" ? "待审核" : merchant.status}
        </Tag>
      }>
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item label="店铺名称">
            <Input value={merchant.name} disabled />
          </Form.Item>
          <Form.Item label="地址">
            <Input value={merchant.address} disabled />
          </Form.Item>
          <Form.Item label="分类">
            <Input value={merchant.category || ""} disabled />
          </Form.Item>
          <Form.Item name="phone" label="联系电话">
            <Input placeholder="请输入联系电话" />
          </Form.Item>
          <Form.Item name="businessHours" label="营业时间">
            <Input placeholder="例如: 09:00-22:00" />
          </Form.Item>
          <Form.Item name="summary" label="简介">
            <TextArea rows={3} maxLength={500} placeholder="请输入店铺简介" />
          </Form.Item>
          <Form.Item name="coverImageUrl" label="封面图链接">
            <Input placeholder="请输入图片URL" />
          </Form.Item>
          <Form.Item name="tags" label="标签（逗号分隔）">
            <Input placeholder="例如: 学生优惠, 外卖" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={saving}>
              保存修改
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
