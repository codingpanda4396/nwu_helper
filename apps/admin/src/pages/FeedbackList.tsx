import React, { useState } from "react";
import { Table, Card, Tag, Space, Select, Button, Modal, Input, message } from "antd";
import { SendOutlined } from "@ant-design/icons";
import { useAdminData, adminApi } from "../hooks/useAdmin";
import type { Dict } from "../hooks/useAdmin";

const typeLabels: Record<string, string> = {
  SUGGESTION: "建议",
  COMPLAINT: "投诉",
  COOPERATION: "合作",
  OTHER: "其他",
};

const statusColors: Record<string, string> = {
  PENDING: "orange",
  PROCESSING: "blue",
  RESOLVED: "green",
};

const statusLabels: Record<string, string> = {
  PENDING: "待处理",
  PROCESSING: "处理中",
  RESOLVED: "已解决",
};

export default function FeedbackList({ token }: { token: string }) {
  const [filterStatus, setFilterStatus] = useState<string | undefined>();
  const { data: feedbacks, loading, reload } = useAdminData<Dict[]>(
    token,
    `/api/admin/feedbacks${filterStatus ? `?status=${filterStatus}` : ""}`,
    [filterStatus]
  );
  const [replyModalOpen, setReplyModalOpen] = useState(false);
  const [replyTarget, setReplyTarget] = useState<Dict | null>(null);
  const [replyText, setReplyText] = useState("");

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await adminApi(token, `/api/admin/feedbacks/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      message.success("状态已更新");
      reload();
    } catch (err) {
      message.error(err instanceof Error ? err.message : "操作失败");
    }
  };

  const openReply = (record: Dict) => {
    setReplyTarget(record);
    setReplyText(record.reply || "");
    setReplyModalOpen(true);
  };

  const handleReply = async () => {
    if (!replyTarget) return;
    try {
      await adminApi(token, `/api/admin/feedbacks/${replyTarget.id}`, {
        method: "PATCH",
        body: JSON.stringify({ reply: replyText, status: "RESOLVED" }),
      });
      message.success("已回复");
      setReplyModalOpen(false);
      reload();
    } catch (err) {
      message.error(err instanceof Error ? err.message : "操作失败");
    }
  };

  const columns = [
    {
      title: "类型",
      dataIndex: "type",
      key: "type",
      width: 80,
      render: (type: string) => <Tag>{typeLabels[type] || type}</Tag>,
    },
    {
      title: "内容",
      dataIndex: "content",
      key: "content",
      ellipsis: true,
    },
    {
      title: "联系方式",
      dataIndex: "contact",
      key: "contact",
      width: 140,
      render: (v: string) => v || "-",
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (status: string) => (
        <Tag color={statusColors[status]}>{statusLabels[status] || status}</Tag>
      ),
    },
    {
      title: "回复",
      dataIndex: "reply",
      key: "reply",
      width: 160,
      ellipsis: true,
      render: (v: string) => v || <span style={{ color: "#ccc" }}>-</span>,
    },
    {
      title: "提交时间",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 140,
      render: (v: string) => new Date(v).toLocaleString(),
    },
    {
      title: "操作",
      key: "actions",
      width: 200,
      render: (_: any, record: Dict) => (
        <Space size="small">
          <Button size="small" icon={<SendOutlined />} onClick={() => openReply(record)}>
            回复
          </Button>
          <Select
            size="small"
            value={record.status}
            style={{ width: 90 }}
            onChange={(val) => handleStatusChange(record.id, val)}
            options={[
              { value: "PENDING", label: "待处理" },
              { value: "PROCESSING", label: "处理中" },
              { value: "RESOLVED", label: "已解决" },
            ]}
          />
        </Space>
      ),
    },
  ];

  return (
    <Card
      title="反馈管理"
      extra={
        <Select
          allowClear
          placeholder="筛选状态"
          style={{ width: 140 }}
          value={filterStatus}
          onChange={setFilterStatus}
          options={[
            { value: "PENDING", label: "待处理" },
            { value: "PROCESSING", label: "处理中" },
            { value: "RESOLVED", label: "已解决" },
          ]}
        />
      }
    >
      <Table
        dataSource={feedbacks || []}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 20 }}
        scroll={{ x: 900 }}
      />

      <Modal
        title="回复反馈"
        open={replyModalOpen}
        onOk={handleReply}
        onCancel={() => setReplyModalOpen(false)}
        destroyOnClose
      >
        {replyTarget && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ color: "#666", marginBottom: 8 }}>用户反馈：{replyTarget.content}</div>
          </div>
        )}
        <Input.TextArea
          rows={4}
          value={replyText}
          onChange={(e) => setReplyText(e.target.value)}
          placeholder="输入回复内容"
        />
      </Modal>
    </Card>
  );
}
