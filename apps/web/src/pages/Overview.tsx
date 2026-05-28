import React from "react";
import { Card, Row, Col, Statistic, Spin, Alert } from "antd";
import {
  ShopOutlined,
  GiftOutlined,
  PictureOutlined,
  MessageOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import { useAdminData } from "../hooks/useAdmin";

interface OverviewStats {
  merchantCount: number;
  activityCount: number;
  bannerCount: number;
  communityPostCount: number;
  pendingCommunityPostCount: number;
}

export default function Overview({ token }: { token: string }) {
  const { data: stats, loading, error } = useAdminData<OverviewStats>(
    token,
    "/api/admin/dashboard/overview"
  );

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: 100 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return <Alert type="error" message="加载失败" description={error} showIcon />;
  }

  const cards = [
    {
      title: "商家总数",
      value: stats?.merchantCount ?? 0,
      icon: <ShopOutlined style={{ fontSize: 24, color: "#1890ff" }} />,
      color: "#e6f7ff",
    },
    {
      title: "活动数量",
      value: stats?.activityCount ?? 0,
      icon: <GiftOutlined style={{ fontSize: 24, color: "#52c41a" }} />,
      color: "#f6ffed",
    },
    {
      title: "轮播图数量",
      value: stats?.bannerCount ?? 0,
      icon: <PictureOutlined style={{ fontSize: 24, color: "#722ed1" }} />,
      color: "#f9f0ff",
    },
    {
      title: "帖子总数",
      value: stats?.communityPostCount ?? 0,
      icon: <MessageOutlined style={{ fontSize: 24, color: "#13c2c2" }} />,
      color: "#e6fffb",
    },
    {
      title: "待审帖子",
      value: stats?.pendingCommunityPostCount ?? 0,
      icon: <ClockCircleOutlined style={{ fontSize: 24, color: "#faad14" }} />,
      color: "#fffbe6",
    },
  ];

  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>概览统计</h2>
      <Row gutter={[16, 16]}>
        {cards.map((card) => (
          <Col xs={24} sm={12} lg={8} xl={4} key={card.title}>
            <Card>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 8,
                    background: card.color,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {card.icon}
                </div>
                <Statistic title={card.title} value={card.value} />
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
}
