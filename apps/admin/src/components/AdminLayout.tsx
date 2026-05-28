import React from "react";
import { Layout, Menu, Button, Typography, Avatar, Dropdown } from "antd";
import {
  DashboardOutlined,
  ShopOutlined,
  GiftOutlined,
  PictureOutlined,
  QrcodeOutlined,
  ToolOutlined,
  MessageOutlined,
  LogoutOutlined,
  UserOutlined,
  LineChartOutlined,
  BarChartOutlined,
  PieChartOutlined,
  FunnelPlotOutlined,
  TeamOutlined,
  RiseOutlined,
} from "@ant-design/icons";
import type { MenuProps } from "antd";
import { Outlet, useNavigate, useLocation } from "react-router-dom";

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

interface AdminLayoutProps {
  user: { name?: string; phone?: string } | null;
  onLogout: () => void;
}

const menuItems: MenuProps["items"] = [
  {
    key: "/admin/overview",
    icon: <DashboardOutlined />,
    label: "概览统计",
  },
  { type: "divider" },
  {
    key: "/admin/analytics",
    icon: <LineChartOutlined />,
    label: "数据分析",
    children: [
      {
        key: "/admin/analytics/overview",
        icon: <BarChartOutlined />,
        label: "数据概览",
      },
      {
        key: "/admin/analytics/user-growth",
        icon: <RiseOutlined />,
        label: "用户增长",
      },
      {
        key: "/admin/analytics/login-methods",
        icon: <PieChartOutlined />,
        label: "登录方式",
      },
      {
        key: "/admin/analytics/user-activity",
        icon: <TeamOutlined />,
        label: "用户活跃度",
      },
      {
        key: "/admin/analytics/user-retention",
        icon: <FunnelPlotOutlined />,
        label: "用户留存",
      },
      {
        key: "/admin/analytics/user-funnel",
        icon: <FunnelPlotOutlined />,
        label: "转化漏斗",
      },
    ],
  },
  { type: "divider" },
  {
    key: "/admin/community",
    icon: <MessageOutlined />,
    label: "论坛审核",
  },
  {
    key: "/admin/merchants",
    icon: <ShopOutlined />,
    label: "商家管理",
  },
  {
    key: "/admin/activities",
    icon: <GiftOutlined />,
    label: "活动发布",
  },
  {
    key: "/admin/banners",
    icon: <PictureOutlined />,
    label: "轮播图管理",
  },
  { type: "divider" },
  {
    key: "/admin/services",
    icon: <ToolOutlined />,
    label: "服务管理",
  },
  {
    key: "/admin/wechat-entry",
    icon: <QrcodeOutlined />,
    label: "西大圈入口",
  },
];

export default function AdminLayout({ user, onLogout }: AdminLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const selectedKey = location.pathname.startsWith("/admin/")
    ? location.pathname
    : "/admin/overview";

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider
        width={220}
        theme="light"
        style={{
          borderRight: "1px solid #f0f0f0",
          position: "fixed",
          height: "100vh",
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 100,
        }}
      >
        <div
          style={{
            padding: "16px 24px",
            borderBottom: "1px solid #f0f0f0",
          }}
        >
          <Text strong style={{ fontSize: 18 }}>
            西大圈后台
          </Text>
          <div style={{ marginTop: 4 }}>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {user?.name || user?.phone || "管理员"}
            </Text>
          </div>
        </div>
        <Menu
          mode="inline"
          selectedKeys={[selectedKey]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          style={{ borderRight: 0, padding: "8px 0" }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            padding: "16px 24px",
            borderTop: "1px solid #f0f0f0",
          }}
        >
          <Button
            type="text"
            icon={<LogoutOutlined />}
            onClick={onLogout}
            block
            style={{ textAlign: "left" }}
          >
            退出登录
          </Button>
        </div>
      </Sider>
      <Layout style={{ marginLeft: 220 }}>
        <Content style={{ padding: 24, minHeight: "100vh", background: "#f5f5f5" }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
