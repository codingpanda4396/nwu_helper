import React, { useState } from "react";
import { Table, Card, Button, Tag, Space, Input, Select, message, Popconfirm } from "antd";
import {
  PlusOutlined,
  SearchOutlined,
  EyeOutlined,
  CheckOutlined,
  CloseOutlined,
  EyeInvisibleOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useAdminData, adminApi, readField } from "../hooks/useAdmin";
import { StatusTag, communityStatusSteps } from "../components/StatusFlow";
import type { Dict } from "../hooks/useAdmin";

const { Search } = Input;

export default function CommunityList({ token }: { token: string }) {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [searchText, setSearchText] = useState("");
  const { data: posts, loading, reload } = useAdminData<Dict[]>(
    token,
    "/api/admin/community-posts"
  );

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await adminApi(token, `/api/admin/community-posts/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      message.success("状态更新成功");
      reload();
    } catch (err) {
      message.error(err instanceof Error ? err.message : "操作失败");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await adminApi(token, `/api/admin/community-posts/${id}`, {
        method: "DELETE",
      });
      message.success("删除成功");
      reload();
    } catch (err) {
      message.error(err instanceof Error ? err.message : "删除失败");
    }
  };

  const filteredPosts = (posts || []).filter((post) => {
    const matchStatus = !statusFilter || post.status === statusFilter;
    const matchSearch =
      !searchText ||
      post.title?.includes(searchText) ||
      post.authorNickname?.includes(searchText);
    return matchStatus && matchSearch;
  });

  const columns = [
    {
      title: "标题",
      dataIndex: "title",
      key: "title",
      ellipsis: true,
      width: 200,
    },
    {
      title: "作者",
      dataIndex: "authorNickname",
      key: "authorNickname",
      width: 100,
    },
    {
      title: "类型",
      dataIndex: "type",
      key: "type",
      width: 80,
      render: (type: string) => <Tag>{type}</Tag>,
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (status: string) => (
        <StatusTag status={status} steps={communityStatusSteps} />
      ),
    },
    {
      title: "点赞",
      dataIndex: "likeCount",
      key: "likeCount",
      width: 60,
    },
    {
      title: "浏览",
      dataIndex: "viewCount",
      key: "viewCount",
      width: 60,
    },
    {
      title: "操作",
      key: "action",
      width: 250,
      render: (_: any, record: Dict) => (
        <Space>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/admin/community/${record.id}`)}
          >
            详情
          </Button>
          {record.status === "PENDING" && (
            <>
              <Button
                type="link"
                icon={<CheckOutlined />}
                style={{ color: "#52c41a" }}
                onClick={() => handleStatusChange(record.id, "VISIBLE")}
              >
                通过
              </Button>
              <Button
                type="link"
                icon={<CloseOutlined />}
                danger
                onClick={() => handleStatusChange(record.id, "REJECTED")}
              >
                拒绝
              </Button>
            </>
          )}
          {record.status === "VISIBLE" && (
            <Button
              type="link"
              icon={<EyeInvisibleOutlined />}
              onClick={() => handleStatusChange(record.id, "HIDDEN")}
            >
              隐藏
            </Button>
          )}
          <Popconfirm
            title="确定删除此帖子？"
            description="删除后无法恢复"
            onConfirm={() => handleDelete(record.id)}
            okText="删除"
            cancelText="取消"
          >
            <Button type="link" icon={<DeleteOutlined />} danger>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card
        title="论坛帖子管理"
        extra={
          <Space>
            <Select
              placeholder="筛选状态"
              allowClear
              style={{ width: 120 }}
              value={statusFilter || undefined}
              onChange={(v) => setStatusFilter(v || "")}
              options={[
                { label: "待审核", value: "PENDING" },
                { label: "已通过", value: "VISIBLE" },
                { label: "已隐藏", value: "HIDDEN" },
                { label: "已拒绝", value: "REJECTED" },
              ]}
            />
            <Search
              placeholder="搜索标题或作者"
              allowClear
              style={{ width: 200 }}
              onSearch={setSearchText}
            />
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={filteredPosts}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 20 }}
        />
      </Card>
    </div>
  );
}
