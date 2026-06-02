import React, { useState, useEffect } from "react";
import { Card, Table, Button, Select, InputNumber, message, Tag, Typography, Spin } from "antd";
import { adminApi } from "../hooks/useAdmin";

const { Title } = Typography;

export default function MerchantPromotion({ token }: { token: string }) {
  const [slots, setSlots] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState<string>("");
  const [days, setDays] = useState<number>(7);
  const [imageUrl, setImageUrl] = useState("");
  const [title, setTitle] = useState("");
  const [ordering, setOrdering] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [s, o] = await Promise.all([
        adminApi<any[]>(token, "/api/promotion/slots"),
        adminApi<any[]>(token, "/api/promotion/orders")
      ]);
      setSlots(s || []);
      setOrders(o || []);
    } catch (e) {
      setSlots([]);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [token]);

  const selectedSlotData = slots.find((s) => s.id === selectedSlot);
  const amount = selectedSlotData ? selectedSlotData.pricePerDay * days : 0;

  const handleOrder = async () => {
    if (!selectedSlot) { message.error("请选择推广位"); return; }
    setOrdering(true);
    try {
      await adminApi(token, "/api/promotion/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slotId: selectedSlot, days, title, imageUrl })
      });
      message.success("下单成功，请线下转账后等待管理员确认开通");
      setSelectedSlot("");
      setDays(7);
      setImageUrl("");
      setTitle("");
      fetchData();
    } catch (e: any) {
      message.error(e.message || "下单失败");
    } finally {
      setOrdering(false);
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

  if (loading) return <Spin size="large" style={{ display: "block", margin: "100px auto" }} />;

  return (
    <div>
      <Title level={4}>购买推广位</Title>

      <Card title="选择推广位" style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", gap: 16, alignItems: "flex-end", flexWrap: "wrap" }}>
          <div>
            <div style={{ marginBottom: 4, fontSize: 12, color: "#666" }}>推广位</div>
            <Select
              style={{ width: 240 }}
              value={selectedSlot || undefined}
              onChange={setSelectedSlot}
              placeholder="请选择推广位"
              options={slots.map((s) => ({
                label: `${s.name} (${(s.pricePerDay / 100).toFixed(2)}元/天)`,
                value: s.id
              }))}
            />
          </div>
          <div>
            <div style={{ marginBottom: 4, fontSize: 12, color: "#666" }}>天数</div>
            <InputNumber min={1} max={365} value={days} onChange={(v) => setDays(v || 1)} />
          </div>
          <div>
            <div style={{ marginBottom: 4, fontSize: 12, color: "#666" }}>素材图片URL</div>
            <input
              style={{ height: 32, width: 240, border: "1px solid #d9d9d9", borderRadius: 6, padding: "0 11px" }}
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="图片URL（可选）"
            />
          </div>
          <div>
            <div style={{ marginBottom: 4, fontSize: 12, color: "#666" }}>应付金额</div>
            <strong style={{ fontSize: 20, color: "#10B981" }}>{(amount / 100).toFixed(2)} 元</strong>
          </div>
          <Button type="primary" loading={ordering} onClick={handleOrder}>
            确认下单
          </Button>
        </div>
      </Card>

      <Card title="我的推广订单">
        <Table
          dataSource={orders}
          rowKey="id"
          pagination={false}
          columns={[
            { title: "订单ID", dataIndex: "id", render: (id: string) => id.slice(0, 8) },
            { title: "天数", dataIndex: "days" },
            { title: "金额", dataIndex: "amount", render: (v: number) => `${(v / 100).toFixed(2)}元` },
            { title: "状态", dataIndex: "status", render: statusTag },
            {
              title: "时间",
              key: "time",
              render: (_: any, r: any) => {
                if (r.status === "ACTIVE") return `${r.startAt?.slice(0, 10) || ""} ~ ${r.endAt?.slice(0, 10) || ""}`;
                return r.createdAt?.slice(0, 10) || "";
              }
            }
          ]}
        />
      </Card>
    </div>
  );
}
