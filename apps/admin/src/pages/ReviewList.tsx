import React, { useState } from "react";
import { Table, Card, Tag, Space, Select, Button, Modal, message, Popconfirm, Descriptions } from "antd";
import { EyeOutlined, DeleteOutlined } from "@ant-design/icons";
import { useAdminData, adminApi } from "../hooks/useAdmin";
import type { Dict } from "../hooks/useAdmin";

const statusColors: Record<string, string> = {
  PENDING: "orange",
  APPROVED: "green",
  REJECTED: "red",
  HIDDEN: "default",
};

const statusLabels: Record<string, string> = {
  PENDING: "待审核",
  APPROVED: "已通过",
  REJECTED: "已拒绝",
  HIDDEN: "已隐藏",
};

const dimLabels: Record<string, string> = {
  grading: "给分好坏",
  attendance: "点名频率",
  difficulty: "课程难度",
  recommend: "推荐指数",
  examFocus: "考试重点",
};

export default function ReviewList({ token }: { token: string }) {
  const [filterStatus, setFilterStatus] = useState<string | undefined>();
  const params = filterStatus ? `?status=${filterStatus}` : "";

  const { data: reviews, loading, reload } = useAdminData<Dict[]>(
    token,
    `/api/admin/academic/reviews${params}`,
    [filterStatus]
  );

  const [detailVisible, setDetailVisible] = useState(false);
  const [detailItem, setDetailItem] = useState<Dict | null>(null);

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await adminApi(token, `/api/admin/academic/reviews/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      message.success("状态已更新");
      reload();
    } catch (err) {
      message.error(err instanceof Error ? err.message : "操作失败");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await adminApi(token, `/api/admin/academic/reviews/${id}`, {
        method: "DELETE",
      });
      message.success("已删除");
      reload();
    } catch (err) {
      message.error(err instanceof Error ? err.message : "操作失败");
    }
  };

  const showDetail = (record: Dict) => {
    setDetailItem(record);
    setDetailVisible(true);
  };

  const columns = [
    {
      title: "教师",
      dataIndex: "teacherName",
      key: "teacherName",
      width: 100,
    },
    {
      title: "课程",
      dataIndex: "courseName",
      key: "courseName",
      width: 120,
      ellipsis: true,
    },
    {
      title: "给分",
      dataIndex: "grading",
      key: "grading",
      width: 60,
    },
    {
      title: "点名",
      dataIndex: "attendance",
      key: "attendance",
      width: 60,
    },
    {
      title: "难度",
      dataIndex: "difficulty",
      key: "difficulty",
      width: 60,
    },
    {
      title: "推荐",
      dataIndex: "recommend",
      key: "recommend",
      width: 60,
    },
    {
      title: "重点",
      dataIndex: "examFocus",
      key: "examFocus",
      width: 60,
    },
    {
      title: "评价内容",
      dataIndex: "comment",
      key: "comment",
      width: 200,
      ellipsis: true,
      render: (v: string) => v || <span style={{ color: "#ccc" }}>-</span>,
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      width: 90,
      render: (status: string) => (
        <Tag color={statusColors[status]}>{statusLabels[status] || status}</Tag>
      ),
    },
    {
      title: "时间",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 140,
      render: (v: string) => new Date(v).toLocaleString(),
    },
    {
      title: "操作",
      key: "actions",
      width: 220,
      render: (_: any, record: Dict) => (
        <Space size="small">
          <Select
            size="small"
            value={record.status}
            style={{ width: 90 }}
            onChange={(val) => handleStatusChange(record.id, val)}
            options={[
              { value: "PENDING", label: "待审核" },
              { value: "APPROVED", label: "通过" },
              { value: "REJECTED", label: "拒绝" },
              { value: "HIDDEN", label: "隐藏" },
            ]}
          />
          <Button size="small" icon={<EyeOutlined />} onClick={() => showDetail(record)} />
          <Popconfirm title="确定删除？" onConfirm={() => handleDelete(record.id)}>
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Card
      title="评价审核"
      extra={
        <Select
          allowClear
          placeholder="筛选状态"
          style={{ width: 120 }}
          value={filterStatus}
          onChange={setFilterStatus}
          options={[
            { value: "PENDING", label: "待审核" },
            { value: "APPROVED", label: "已通过" },
            { value: "REJECTED", label: "已拒绝" },
            { value: "HIDDEN", label: "已隐藏" },
          ]}
        />
      }
    >
      <Table
        dataSource={reviews || []}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 20 }}
        scroll={{ x: 1300 }}
      />

      <Modal
        title="评价详情"
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={null}
        width={560}
      >
        {detailItem && (
          <Descriptions column={2} bordered size="small">
            <Descriptions.Item label="教师">{detailItem.teacherName}</Descriptions.Item>
            <Descriptions.Item label="课程">{detailItem.courseName}</Descriptions.Item>
            {["grading", "attendance", "difficulty", "recommend", "examFocus"].map((dim) => (
              <Descriptions.Item key={dim} label={dimLabels[dim]}>
                {"⭐".repeat(detailItem[dim])}
              </Descriptions.Item>
            ))}
            <Descriptions.Item label="评价内容" span={2}>
              {detailItem.comment || "（无文字评价）"}
            </Descriptions.Item>
            <Descriptions.Item label="状态">
              <Tag color={statusColors[detailItem.status]}>
                {statusLabels[detailItem.status]}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="时间">
              {new Date(detailItem.createdAt).toLocaleString()}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </Card>
  );
}
