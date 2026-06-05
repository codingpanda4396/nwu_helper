import React from "react";
import { Layout, Menu, Button, Typography, Avatar, Dropdown } from "antd";
import {
  DashboardOutlined,
  ShopOutlined,
  GiftOutlined,
  PictureOutlined,
  QrcodeOutlined,
  ToolOutlined,
  CarOutlined,
  MessageOutlined,
  LogoutOutlined,
  UserOutlined,
  LineChartOutlined,
  BarChartOutlined,
  PieChartOutlined,
  FunnelPlotOutlined,
  TeamOutlined,
  RiseOutlined,
  FundProjectionScreenOutlined,
  ProfileOutlined,
  IdcardOutlined,
  NotificationOutlined,
  StarOutlined,
  BookOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import type { MenuProps } from "antd";
import { Outlet, useNavigate, useLocation } from "react-router-dom";

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

interface AdminLayoutProps {
  user: { name?: string; phone?: string; role?: string } | null;
  onLogout: () => void;
}

const adminMenuItems: MenuProps["items"] = [
  {
    key: "/overview",
    icon: <DashboardOutlined />,
    label: "概览统计",
  },
  { type: "divider" },
  {
    key: "/analytics",
    icon: <LineChartOutlined />,
    label: "数据分析",
    children: [
      {
        key: "/analytics/overview",
        icon: <BarChartOutlined />,
        label: "数据概览",
      },
      {
        key: "/analytics/user-growth",
        icon: <RiseOutlined />,
        label: "用户增长",
      },
      {
        key: "/analytics/login-methods",
        icon: <PieChartOutlined />,
        label: "登录方式",
      },
      {
        key: "/analytics/user-activity",
        icon: <TeamOutlined />,
        label: "用户活跃度",
      },
      {
        key: "/analytics/user-retention",
        icon: <FunnelPlotOutlined />,
        label: "用户留存",
      },
      {
        key: "/analytics/user-funnel",
        icon: <FunnelPlotOutlined />,
        label: "转化漏斗",
      },
    ],
  },
  {
    key: "/attribution",
    icon: <FundProjectionScreenOutlined />,
    label: "归因分析",
  },
  { type: "divider" },
  {
    key: "/community",
    icon: <MessageOutlined />,
    label: "论坛审核",
  },
  {
    key: "/merchants",
    icon: <ShopOutlined />,
    label: "商家管理",
  },
  {
    key: "/activities",
    icon: <GiftOutlined />,
    label: "活动管理",
  },
  {
    key: "/feedbacks",
    icon: <MessageOutlined />,
    label: "反馈管理",
  },
  {
    key: "/banners",
    icon: <PictureOutlined />,
    label: "轮播图管理",
  },
  { type: "divider" },
  {
    key: "/services",
    icon: <ToolOutlined />,
    label: "生活服务分类",
  },
  {
    key: "/driving-config",
    icon: <CarOutlined />,
    label: "驾校配置",
  },
  {
    key: "/wechat-entry",
    icon: <QrcodeOutlined />,
    label: "西大圈入口",
  },
  {
    key: "/admin/promotion-orders",
    icon: <NotificationOutlined />,
    label: "推广订单",
  },
  { type: "divider" },
  {
    key: "/academic",
    icon: <BookOutlined />,
    label: "学业管理",
    children: [
      {
        key: "/academic/teachers",
        icon: <TeamOutlined />,
        label: "教师管理",
      },
      {
        key: "/academic/reviews",
        icon: <StarOutlined />,
        label: "评价审核",
      },
      {
        key: "/academic/courses",
        icon: <BookOutlined />,
        label: "课程管理",
      },
      {
        key: "/academic/materials",
        icon: <FileTextOutlined />,
        label: "资料审核",
      },
    ],
  },
];

const merchantMenuItems: MenuProps["items"] = [
  {
    key: "/merchant/dashboard",
    icon: <DashboardOutlined />,
    label: "数据看板",
  },
  {
    key: "/merchant/profile",
    icon: <IdcardOutlined />,
    label: "店铺信息",
  },
  {
    key: "/merchant/promotion",
    icon: <NotificationOutlined />,
    label: "推广",
  },
];

export default function AdminLayout({ user, onLogout }: AdminLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const selectedKey = location.pathname.startsWith("/")
    ? location.pathname
    : "/overview";

  const menuItems = user?.role === "MERCHANT" ? merchantMenuItems : adminMenuItems;

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
