import React, { useState } from "react";
import { Table, Card, Button, Tag, Space, Input, Select, message } from "antd";
import { PlusOutlined, SearchOutlined, EditOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useAdminData, adminApi, toDateTimeLocal } from "../hooks/useAdmin";
import { StatusTag, activityStatusSteps } from "../components/StatusFlow";
import type { Dict } from "../hooks/useAdmin";

const { Search } = Input;

export default function ActivityList({ token }: { token: string }) {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [searchText, setSearchText] = useState("");
  const { data: activities, loading, reload } = useAdminData<Dict[]>(
    token,
    "/api/admin/activities"
  );

  const filteredActivities = (activities || []).filter((activity) => {
    const matchStatus = !statusFilter || activity.status === statusFilter;
    const matchSearch = !searchText || activity.title?.includes(searchText);
    return matchStatus && matchSearch;
  });

  const columns = [
    {
      title: "活动标题",
      dataIndex: "title",
      key: "title",
      width: 200,
    },
    {
      title: "关联商家",
      dataIndex: ["merchant", "name"],
      key: "merchant",
      width: 150,
      render: (_: any, record: Dict) => record.merchant?.name || "-",
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (status: string) => (
        <StatusTag status={status} steps={activityStatusSteps} />
      ),
    },
    {
      title: "开始时间",
      dataIndex: "startAt",
      key: "startAt",
      width: 150,
      render: (v: string) => (v ? new Date(v).toLocaleString("zh-CN") : "-"),
    },
    {
      title: "结束时间",
      dataIndex: "endAt",
      key: "endAt",
      width: 150,
      render: (v: string) => (v ? new Date(v).toLocaleString("zh-CN") : "-"),
    },
    {
      title: "排序",
      dataIndex: "sortOrder",
      key: "sortOrder",
      width: 60,
    },
    {
      title: "操作",
      key: "action",
      width: 100,
      render: (_: any, record: Dict) => (
        <Button
          type="link"
          icon={<EditOutlined />}
          onClick={() => navigate(`/admin/activities/${record.id}/edit`)}
        >
          编辑
        </Button>
      ),
    },
  ];

  return (
    <div>
      <Card
        title="活动管理"
        extra={
          <Space>
            <Select
              placeholder="筛选状态"
              allowClear
              style={{ width: 120 }}
              value={statusFilter || undefined}
              onChange={(v) => setStatusFilter(v || "")}
              options={[
                { label: "草稿", value: "DRAFT" },
                { label: "进行中", value: "ACTIVE" },
                { label: "已暂停", value: "PAUSED" },
                { label: "已结束", value: "ENDED" },
              ]}
            />
            <Search
              placeholder="搜索活动标题"
              allowClear
              style={{ width: 200 }}
              onSearch={setSearchText}
            />
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate("/admin/activities/create")}
            >
              发布活动
            </Button>
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={filteredActivities}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 20 }}
        />
      </Card>
    </div>
  );
}
