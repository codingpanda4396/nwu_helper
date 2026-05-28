import React, { useState } from "react";
import { Table, Card, Button, Tag, Space, Input, Select, message } from "antd";
import { PlusOutlined, SearchOutlined, EditOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useAdminData, adminApi } from "../hooks/useAdmin";
import { StatusTag, merchantStatusSteps } from "../components/StatusFlow";
import type { Dict } from "../hooks/useAdmin";

const { Search } = Input;

export default function ServiceMerchantList({ token }: { token: string }) {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [searchText, setSearchText] = useState("");
  const { data: merchants, loading } = useAdminData<Dict[]>(token, "/api/admin/merchants");
  const { data: serviceCategories } = useAdminData<Dict[]>(
    token,
    "/api/admin/service-categories"
  );

  const serviceMerchants = (merchants || []).filter((m) => m.serviceCategoryId);

  const filteredMerchants = serviceMerchants.filter((merchant) => {
    const matchStatus = !statusFilter || merchant.status === statusFilter;
    const matchSearch = !searchText || merchant.name?.includes(searchText);
    return matchStatus && matchSearch;
  });

  const columns = [
    {
      title: "商家名称",
      dataIndex: "name",
      key: "name",
      width: 150,
    },
    {
      title: "服务分类",
      dataIndex: ["serviceCategory", "name"],
      key: "serviceCategory",
      width: 100,
      render: (_: any, record: Dict) => record.serviceCategory?.name || "-",
    },
    {
      title: "简介",
      dataIndex: "summary",
      key: "summary",
      ellipsis: true,
      width: 200,
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (status: string) => (
        <StatusTag status={status} steps={merchantStatusSteps} />
      ),
    },
    {
      title: "操作",
      key: "action",
      width: 100,
      render: (_: any, record: Dict) => (
        <Button
          type="link"
          icon={<EditOutlined />}
          onClick={() => navigate(`/admin/merchants/${record.id}/edit`)}
        >
          编辑
        </Button>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Space>
          <Select
            placeholder="筛选状态"
            allowClear
            style={{ width: 120 }}
            value={statusFilter || undefined}
            onChange={(v) => setStatusFilter(v || "")}
            options={[
              { label: "待审核", value: "PENDING" },
              { label: "已上架", value: "APPROVED" },
              { label: "已拒绝", value: "REJECTED" },
              { label: "已下架", value: "SUSPENDED" },
            ]}
          />
          <Search
            placeholder="搜索商家名称"
            allowClear
            style={{ width: 200 }}
            onSearch={setSearchText}
          />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate("/admin/merchants/create")}
          >
            添加商家
          </Button>
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={filteredMerchants}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 20 }}
      />
    </div>
  );
}
