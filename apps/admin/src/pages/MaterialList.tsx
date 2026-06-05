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

export default function MaterialList({ token }: { token: string }) {
  const [filterStatus, setFilterStatus] = useState<string | undefined>();
  const params = filterStatus ? `?status=${filterStatus}` : "";

  const { data: materials, loading, reload } = useAdminData<Dict[]>(
    token,
    `/api/admin/academic/materials${params}`,
    [filterStatus]
  );

  const [detailVisible, setDetailVisible] = useState(false);
  const [detailItem, setDetailItem] = useState<Dict | null>(null);

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await adminApi(token, `/api/admin/academic/materials/${id}/status`, {
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
      await adminApi(token, `/api/admin/academic/materials/${id}`, {
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
      title: "标题",
      dataIndex: "title",
      key: "title",
      ellipsis: true,
    },
    {
      title: "课程",
      dataIndex: "courseName",
      key: "courseName",
      width: 120,
    },
    {
      title: "教师",
      dataIndex: "teacherName",
      key: "teacherName",
      width: 100,
    },
    {
      title: "上传者",
      dataIndex: "userName",
      key: "userName",
      width: 100,
    },
    {
      title: "文件数",
      key: "fileCount",
      width: 70,
      render: (_: any, record: Dict) => (record.files || []).length,
    },
    {
      title: "浏览",
      dataIndex: "viewCount",
      key: "viewCount",
      width: 70,
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
      title: "上传时间",
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
      title="资料审核"
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
        dataSource={materials || []}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 20 }}
        scroll={{ x: 1100 }}
      />

      <Modal
        title="资料详情"
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={null}
        width={600}
      >
        {detailItem && (
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="标题">{detailItem.title}</Descriptions.Item>
            <Descriptions.Item label="课程">{detailItem.courseName}</Descriptions.Item>
            <Descriptions.Item label="教师">{detailItem.teacherName}</Descriptions.Item>
            <Descriptions.Item label="上传者">{detailItem.userName}</Descriptions.Item>
            <Descriptions.Item label="描述">{detailItem.description || "（无描述）"}</Descriptions.Item>
            <Descriptions.Item label="状态">
              <Tag color={statusColors[detailItem.status]}>
                {statusLabels[detailItem.status]}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="文件列表">
              {(detailItem.files || []).length === 0 ? (
                "无文件"
              ) : (
                <ul style={{ margin: 0, paddingLeft: 20 }}>
                  {(detailItem.files || []).map((f: Dict, i: number) => (
                    <li key={i}>
                      <a href={f.fileUrl} target="_blank" rel="noopener noreferrer">
                        {f.fileName}
                      </a>
                      {" "}
                      <span style={{ color: "#999", fontSize: 12 }}>
                        ({f.mimeType}, {(f.fileSize / 1024).toFixed(1)} KB)
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </Card>
  );
}
