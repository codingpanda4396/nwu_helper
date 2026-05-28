import React, { useState, useEffect } from "react";
import { Form, Input, Select, InputNumber, DatePicker, Card, message, Spin } from "antd";
import { useParams, useNavigate } from "react-router-dom";
import { adminApi } from "../hooks/useAdmin";
import StepForm from "../components/StepForm";
import FieldHint from "../components/FieldHint";
import { OssUploader } from "../../OssUploader";
import type { Dict } from "../hooks/useAdmin";
import dayjs from "dayjs";

export default function ActivityForm({ token }: { token: string }) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = !!id;
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [merchants, setMerchants] = useState<Dict[]>([]);

  useEffect(() => {
    adminApi<Dict[]>(token, "/api/admin/merchants")
      .then((data) => setMerchants(data || []))
      .catch(console.error);
  }, [token]);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    adminApi<Dict>(token, `/api/admin/activities/${id}`)
      .then((data) => {
        form.setFieldsValue({
          ...data,
          startAt: data.startAt ? dayjs(data.startAt) : undefined,
          endAt: data.endAt ? dayjs(data.endAt) : undefined,
        });
      })
      .catch((err) => message.error(err instanceof Error ? err.message : "加载失败"))
      .finally(() => setLoading(false));
  }, [token, id, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);
      const payload = {
        ...values,
        startAt: values.startAt?.toISOString(),
        endAt: values.endAt?.toISOString(),
      };

      if (isEdit) {
        await adminApi(token, `/api/admin/activities/${id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
        message.success("活动已更新");
      } else {
        await adminApi(token, "/api/admin/activities", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        message.success("活动创建成功");
      }
      navigate("/admin/activities");
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

  const steps = [
    {
      title: "基本信息",
      description: "活动标题和关联商家",
      content: (
        <Form form={form} layout="vertical">
          <FieldHint
            name="title"
            label="活动标题"
            required
            tooltip="填写活动的标题"
            example="开学季优惠活动"
          >
            <Input placeholder="请输入活动标题" />
          </FieldHint>

          <FieldHint
            name="description"
            label="活动描述"
            tooltip="详细说明活动内容和优惠信息"
            example="新生凭学生证享受8折优惠"
          >
            <Input.TextArea placeholder="请输入活动描述" rows={4} />
          </FieldHint>

          <FieldHint
            name="merchantId"
            label="关联商家"
            required
            tooltip="选择举办活动的商家"
          >
            <Select
              placeholder="请选择商家"
              showSearch
              optionFilterProp="label"
              options={merchants.map((m) => ({ label: m.name, value: m.id }))}
            />
          </FieldHint>
        </Form>
      ),
    },
    {
      title: "活动图片",
      description: "上传封面图",
      content: (
        <Form form={form} layout="vertical">
          <FieldHint
            name="coverImage"
            label="封面图"
            required
            tooltip="活动的封面图片，建议尺寸 750x400，支持 JPG/PNG"
          >
            <OssUploader token={token} onChange={(url) => form.setFieldValue("coverImage", url)} />
          </FieldHint>
        </Form>
      ),
    },
    {
      title: "时间设置",
      description: "开始和结束时间",
      content: (
        <Form form={form} layout="vertical">
          <FieldHint
            name="startAt"
            label="开始时间"
            required
            tooltip="活动开始展示的时间"
          >
            <DatePicker
              showTime
              format="YYYY-MM-DD HH:mm"
              placeholder="请选择开始时间"
              style={{ width: "100%" }}
            />
          </FieldHint>

          <FieldHint
            name="endAt"
            label="结束时间"
            required
            tooltip="活动结束下架的时间"
          >
            <DatePicker
              showTime
              format="YYYY-MM-DD HH:mm"
              placeholder="请选择结束时间"
              style={{ width: "100%" }}
            />
          </FieldHint>
        </Form>
      ),
    },
    {
      title: "发布设置",
      description: "状态和排序",
      content: (
        <Form form={form} layout="vertical">
          <FieldHint
            name="status"
            label="活动状态"
            required
            tooltip="选择活动的发布状态"
          >
            <Select
              options={[
                { label: "草稿", value: "DRAFT" },
                { label: "进行中", value: "ACTIVE" },
                { label: "已暂停", value: "PAUSED" },
                { label: "已结束", value: "ENDED" },
              ]}
            />
          </FieldHint>

          <FieldHint
            name="sortOrder"
            label="排序权重"
            tooltip="数字越大越靠前显示，建议使用 10、20、30 这样的间隔"
            example="10"
          >
            <InputNumber placeholder="请输入排序权重" style={{ width: "100%" }} />
          </FieldHint>
        </Form>
      ),
    },
  ];

  return (
    <div>
      <Card title={isEdit ? "编辑活动" : "发布活动"}>
        <StepForm
          steps={steps}
          onSubmit={handleSubmit}
          onCancel={() => navigate("/admin/activities")}
          loading={submitting}
          submitText={isEdit ? "保存修改" : "发布活动"}
        />
      </Card>
    </div>
  );
}
