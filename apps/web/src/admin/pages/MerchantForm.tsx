import React, { useState, useEffect } from "react";
import { Form, Input, Select, InputNumber, Switch, Card, message, Spin, Alert } from "antd";
import { useParams, useNavigate } from "react-router-dom";
import { adminApi, toDateTimeLocal } from "../hooks/useAdmin";
import StepForm from "../components/StepForm";
import FieldHint from "../components/FieldHint";
import { OssUploader } from "../../OssUploader";
import type { Dict } from "../hooks/useAdmin";

export default function MerchantForm({ token }: { token: string }) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = !!id;
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [categories, setCategories] = useState<Dict[]>([]);
  const [serviceCategories, setServiceCategories] = useState<Dict[]>([]);

  useEffect(() => {
    Promise.all([
      adminApi<Dict[]>(token, "/api/admin/categories"),
      adminApi<Dict[]>(token, "/api/admin/service-categories"),
    ]).then(([cats, svcCats]) => {
      setCategories(cats || []);
      setServiceCategories(svcCats || []);
    });
  }, [token]);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    adminApi<Dict>(token, `/api/admin/merchants/${id}`)
      .then((data) => {
        form.setFieldsValue(data);
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
        serviceCategoryId: values.serviceCategoryId || null,
      };

      if (isEdit) {
        await adminApi(token, `/api/admin/merchants/${id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
        message.success("商家信息已更新");
      } else {
        await adminApi(token, "/api/admin/merchants", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        message.success("商家创建成功");
      }
      navigate("/admin/merchants");
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
      description: "商家名称和分类",
      content: (
        <Form form={form} layout="vertical">
          <FieldHint
            name="name"
            label="商家名称"
            required
            tooltip="填写商家的正式名称"
            example="西北大学食堂、校园超市"
          >
            <Input placeholder="请输入商家名称" />
          </FieldHint>

          <FieldHint
            name="summary"
            label="商家简介"
            tooltip="简单描述商家的特色和主营业务"
            example="校园周边最受欢迎的烧烤店"
          >
            <Input.TextArea placeholder="请输入商家简介" rows={3} />
          </FieldHint>

          <FieldHint
            name="categoryId"
            label="商家分类"
            required
            tooltip="选择商家所属的分类，便于用户筛选"
          >
            <Select
              placeholder="请选择分类"
              options={categories.map((c) => ({ label: c.name, value: c.id }))}
            />
          </FieldHint>

          <FieldHint
            name="serviceCategoryId"
            label="服务分类"
            tooltip="如果这是服务类商家，请选择对应的服务分类"
          >
            <Select
              placeholder="请选择服务分类（可选）"
              allowClear
              options={serviceCategories.map((c) => ({ label: c.name, value: c.id }))}
            />
          </FieldHint>
        </Form>
      ),
    },
    {
      title: "联系方式",
      description: "地址、电话、营业时间",
      content: (
        <Form form={form} layout="vertical">
          <FieldHint
            name="address"
            label="商家地址"
            tooltip="填写详细的商家地址"
            example="西大北门美食街 18 号"
          >
            <Input placeholder="请输入地址" />
          </FieldHint>

          <FieldHint
            name="phone"
            label="联系电话"
            tooltip="商家的联系电话"
            example="13800000001"
          >
            <Input placeholder="请输入电话" />
          </FieldHint>

          <FieldHint
            name="businessHours"
            label="营业时间"
            tooltip="商家的营业时间"
            example="10:00-22:00"
          >
            <Input placeholder="请输入营业时间" />
          </FieldHint>
        </Form>
      ),
    },
    {
      title: "图片资料",
      description: "封面图和二维码",
      content: (
        <Form form={form} layout="vertical">
          <FieldHint
            name="coverImageUrl"
            label="封面图"
            tooltip="商家的封面图片，建议尺寸 750x400"
          >
            <OssUploader token={token} onChange={(url) => form.setFieldValue("coverImageUrl", url)} />
          </FieldHint>

          <FieldHint
            name="qrImageUrl"
            label="二维码"
            tooltip="商家的微信二维码，便于用户添加"
          >
            <OssUploader token={token} onChange={(url) => form.setFieldValue("qrImageUrl", url)} />
          </FieldHint>
        </Form>
      ),
    },
    {
      title: "上架设置",
      description: "状态和排序",
      content: (
        <Form form={form} layout="vertical">
          <FieldHint
            name="status"
            label="上架状态"
            required
            tooltip="选择商家的上架状态"
          >
            <Select
              options={[
                { label: "待审核", value: "PENDING" },
                { label: "已上架", value: "APPROVED" },
                { label: "已拒绝", value: "REJECTED" },
                { label: "已下架", value: "SUSPENDED" },
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
      <Card title={isEdit ? "编辑商家" : "添加商家"}>
        <StepForm
          steps={steps}
          onSubmit={handleSubmit}
          onCancel={() => navigate("/admin/merchants")}
          loading={submitting}
          submitText={isEdit ? "保存修改" : "创建商家"}
        />
      </Card>
    </div>
  );
}
