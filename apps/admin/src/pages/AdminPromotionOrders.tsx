import React, { useState, useEffect } from "react";
import { Card, Table, Button, Select, message, Tag, Typography, Spin } from "antd";
import { adminApi } from "../hooks/useAdmin";

const { Title } = Typography;

export default function AdminPromotionOrders({ token }: { token: string }) {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("");

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const q = statusFilter ? `?status=${statusFilter}` : "";
      const data = await adminApi<any[]>(token, `/api/admin/promotion/orders${q}`);
      setOrders(data || []);
    } catch (e) {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, [statusFilter]);

  const handleConfirm = async (id: string) => {
    try {
      await adminApi(token, `/api/admin/promotion/orders/${id}/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({})
      });
      message.success("已确认开通");
      fetchOrders();
    } catch (e: any) {
      message.error(e.message || "操作失败");
    }
  };

  const handleCancel = async (id: string) => {
    try {
      await adminApi(token, `/api/admin/promotion/orders/${id}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({})
      });
      message.success("已取消");
      fetchOrders();
    } catch (e: any) {
      message.error(e.message || "操作失败");
    }
  };

  const statusTag = (status: string) => {
    const map: Record<string, { color: string; text: string }> = {
      PENDING: { color: "orange", text: "待付款" },
      PAID: { color: "blue", text: "已付款" },
      ACTIVE: { color: "green", text: "投放中" },
      EXPIRED: { color: "default", text: "已过期" },
      CANCELLED: { color: "red", text: "已取消" }
    };
    const cfg = map[status] || { color: "default", text: status };
    return <Tag color={cfg.color}>{cfg.text}</Tag>;
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>推广订单管理</Title>
        <Select
          allowClear
          placeholder="按状态筛选"
          style={{ width: 160 }}
          value={statusFilter || undefined}
          onChange={(v) => setStatusFilter(v || "")}
          options={[
            { label: "待付款", value: "PENDING" },
            { label: "已付款", value: "PAID" },
            { label: "投放中", value: "ACTIVE" },
            { label: "已过期", value: "EXPIRED" },
            { label: "已取消", value: "CANCELLED" }
          ]}
        />
      </div>

      {loading ? (
        <Spin size="large" style={{ display: "block", margin: "100px auto" }} />
      ) : (
        <Table
          dataSource={orders}
          rowKey="id"
          pagination={{ pageSize: 20 }}
          columns={[
            { title: "订单ID", dataIndex: "id", render: (id: string) => id.slice(0, 8) },
            { title: "商家ID", dataIndex: "merchantId", render: (id: string) => id.slice(0, 8) },
            { title: "推广位ID", dataIndex: "slotId", render: (id: string) => id.slice(0, 8) },
            { title: "天数", dataIndex: "days" },
            { title: "金额", dataIndex: "amount", render: (v: number) => `${(v / 100).toFixed(2)}元` },
            { title: "状态", dataIndex: "status", render: statusTag },
            {
              title: "投放时间",
              key: "time",
              render: (_: any, r: any) => {
                if (r.startAt) return `${r.startAt.slice(0, 10)} ~ ${r.endAt?.slice(0, 10) || ""}`;
                return r.createdAt?.slice(0, 10) || "";
              }
            },
            {
              title: "操作",
              key: "actions",
              render: (_: any, r: any) => (
                <div style={{ display: "flex", gap: 8 }}>
                  {r.status === "PENDING" && (
                    <>
                      <Button size="small" type="primary" onClick={() => handleConfirm(r.id)}>确认开通</Button>
                      <Button size="small" danger onClick={() => handleCancel(r.id)}>取消</Button>
                    </>
                  )}
                </div>
              )
            }
          ]}
        />
      )}
    </div>
  );
}
