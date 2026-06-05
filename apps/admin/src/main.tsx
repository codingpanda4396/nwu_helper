import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ConfigProvider, theme } from "antd";
import zhCN from "antd/locale/zh_CN";
import { useAdmin } from "./hooks/useAdmin";
import AdminLayout from "./components/AdminLayout";
import Overview from "./pages/Overview";
import CommunityList from "./pages/CommunityList";
import CommunityDetail from "./pages/CommunityDetail";
import BannerList from "./pages/BannerList";
import BannerForm from "./pages/BannerForm";
import ServiceCategoryList from "./pages/ServiceCategoryList";
import DrivingConfig from "./pages/DrivingConfig";
import WechatEntry from "./pages/WechatEntry";
import MerchantList from "./pages/MerchantList";
import ActivityList from "./pages/ActivityList";
import FeedbackList from "./pages/FeedbackList";
import AttributionAnalysis from "./pages/AttributionAnalysis";
import {
  AnalyticsOverview,
  UserGrowth,
  LoginMethods,
  UserActivity,
  UserRetention,
  UserFunnel,
} from "./analytics/pages";
import MerchantDashboard from "./pages/MerchantDashboard";
import MerchantProfile from "./pages/MerchantProfile";
import MerchantPromotion from "./pages/MerchantPromotion";
import AdminPromotionOrders from "./pages/AdminPromotionOrders";
import TeacherList from "./pages/TeacherList";
import ReviewList from "./pages/ReviewList";
import CourseList from "./pages/CourseList";
import MaterialList from "./pages/MaterialList";

// 品牌主题配置
const brandTheme = {
  algorithm: theme.defaultAlgorithm,
  token: {
    // 品牌主色
    colorPrimary: "#10B981",
    colorPrimaryBg: "#ECFDF5",
    colorPrimaryBgHover: "#D1FAE5",
    colorPrimaryBorder: "#A7F3D0",
    colorPrimaryBorderHover: "#6EE7B7",
    colorPrimaryHover: "#34D399",
    colorPrimaryActive: "#059669",
    colorPrimaryTextHover: "#34D399",
    colorPrimaryText: "#10B981",
    colorPrimaryTextActive: "#059669",

    // 成功色
    colorSuccess: "#10B981",

    // 警告色
    colorWarning: "#F59E0B",

    // 错误色
    colorError: "#EF4444",

    // 信息色
    colorInfo: "#10B981",

    // 文字颜色
    colorText: "#1F2937",
    colorTextSecondary: "#6B7280",
    colorTextTertiary: "#9CA3AF",
    colorTextQuaternary: "#D1D5DB",

    // 背景色
    colorBgContainer: "#ffffff",
    colorBgElevated: "#ffffff",
    colorBgLayout: "#F9FAFB",
    colorBgSpotlight: "#F3F4F6",

    // 边框
    colorBorder: "#E5E7EB",
    colorBorderSecondary: "#F3F4F6",

    // 圆角
    borderRadius: 8,
    borderRadiusLG: 12,
    borderRadiusSM: 6,
    borderRadiusXS: 4,

    // 字体
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    fontSize: 14,
    fontSizeHeading1: 28,
    fontSizeHeading2: 24,
    fontSizeHeading3: 20,
    fontSizeHeading4: 16,
    fontSizeHeading5: 14,

    // 间距
    marginXS: 8,
    marginSM: 12,
    margin: 16,
    marginMD: 20,
    marginLG: 24,
    marginXL: 32,

    paddingXS: 8,
    paddingSM: 12,
    padding: 16,
    paddingMD: 20,
    paddingLG: 24,

    // 阴影
    boxShadow:
      "0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 1px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px 0 rgba(0, 0, 0, 0.02)",
    boxShadowSecondary:
      "0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 9px 28px 8px rgba(0, 0, 0, 0.05)",

    // 动画
    motionDurationSlow: "0.3s",
    motionDurationMid: "0.2s",
    motionDurationFast: "0.1s",
  },
  components: {
    // 菜单主题
    Menu: {
      itemSelectedBg: "#ECFDF5",
      itemSelectedColor: "#059669",
      itemHoverBg: "#F0FDF4",
      itemHoverColor: "#10B981",
      itemActiveBg: "#D1FAE5",
      subMenuItemBg: "transparent",
      iconSize: 16,
      collapsedIconSize: 20,
    },

    // 按钮主题
    Button: {
      primaryShadow: "0 2px 0 rgba(16, 185, 129, 0.1)",
      defaultShadow: "0 2px 0 rgba(0, 0, 0, 0.02)",
      primaryColor: "#ffffff",
    },

    // 卡片主题
    Card: {
      headerBg: "transparent",
      boxShadowTertiary:
        "0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 1px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px 0 rgba(0, 0, 0, 0.02)",
    },

    // 表格主题
    Table: {
      headerBg: "#F9FAFB",
      headerColor: "#6B7280",
      headerSortActiveBg: "#F3F4F6",
      rowHoverBg: "#F0FDF4",
      borderColor: "#F3F4F6",
    },

    // 输入框主题
    Input: {
      activeBorderColor: "#10B981",
      hoverBorderColor: "#6EE7B7",
      activeShadow: "0 0 0 2px rgba(16, 185, 129, 0.1)",
    },

    // 选择器主题
    Select: {
      optionSelectedBg: "#ECFDF5",
      optionSelectedColor: "#059669",
      optionActiveBg: "#F0FDF4",
    },

    // 标签页主题
    Tabs: {
      inkBarColor: "#10B981",
      itemSelectedColor: "#10B981",
      itemHoverColor: "#34D399",
      itemActiveColor: "#059669",
    },

    // 标签主题
    Tag: {
      defaultBg: "#ECFDF5",
      defaultColor: "#10B981",
    },

    // 进度条主题
    Progress: {
      defaultColor: "#10B981",
    },

    // 开关主题
    Switch: {
      colorPrimary: "#10B981",
      colorPrimaryHover: "#34D399",
    },

    // 复选框主题
    Checkbox: {
      colorPrimary: "#10B981",
      colorPrimaryHover: "#34D399",
    },

    // 单选框主题
    Radio: {
      colorPrimary: "#10B981",
      colorPrimaryHover: "#34D399",
    },

    // 日期选择器主题
    DatePicker: {
      activeBorderColor: "#10B981",
      hoverBorderColor: "#6EE7B7",
      activeShadow: "0 0 0 2px rgba(16, 185, 129, 0.1)",
    },

    // 消息主题
    Message: {
      contentBg: "#ffffff",
    },

    // 通知主题
    Notification: {
      paddingLG: 24,
    },

    // 布局主题
    Layout: {
      headerBg: "#ffffff",
      siderBg: "#ffffff",
      bodyBg: "#F9FAFB",
      headerHeight: 64,
      headerPadding: "0 24px",
    },

    // 分页主题
    Pagination: {
      colorPrimary: "#10B981",
      itemActiveBg: "#ECFDF5",
    },

    // 气泡确认框主题
    Popconfirm: {
      colorPrimary: "#10B981",
    },

    // 模态框主题
    Modal: {
      titleFontSize: 18,
      titleLineHeight: 1.4,
    },

    // 抽屉主题
    Drawer: {
      colorPrimary: "#10B981",
    },
  },
};

function AdminApp() {
  const { token, user, logout } = useAdmin();

  return (
    <ConfigProvider locale={zhCN} theme={brandTheme}>
      <BrowserRouter basename="/admin">
        <Routes>
          <Route
            path="/"
            element={<AdminLayout user={user} onLogout={logout} />}
          >
            <Route index element={<Navigate to={user?.role === "MERCHANT" ? "/merchant/dashboard" : "/overview"} replace />} />
            <Route path="overview" element={<Overview token={token} />} />
            <Route path="analytics">
              <Route index element={<Navigate to="overview" replace />} />
              <Route path="overview" element={<AnalyticsOverview token={token} />} />
              <Route path="user-growth" element={<UserGrowth token={token} />} />
              <Route path="login-methods" element={<LoginMethods token={token} />} />
              <Route path="user-activity" element={<UserActivity token={token} />} />
              <Route path="user-retention" element={<UserRetention token={token} />} />
              <Route path="user-funnel" element={<UserFunnel token={token} />} />
            </Route>
            <Route path="community" element={<CommunityList token={token} />} />
            <Route path="community/:id" element={<CommunityDetail token={token} />} />
            <Route path="merchants" element={<MerchantList token={token} />} />
            <Route path="activities" element={<ActivityList token={token} />} />
            <Route path="attribution" element={<AttributionAnalysis token={token} />} />
            <Route path="banners" element={<BannerList token={token} />} />
            <Route path="banners/create" element={<BannerForm token={token} />} />
            <Route path="banners/:id/edit" element={<BannerForm token={token} />} />
            <Route path="services" element={<ServiceCategoryList token={token} />} />
            <Route path="driving-config" element={<DrivingConfig token={token} />} />
            <Route path="feedbacks" element={<FeedbackList token={token} />} />
            <Route path="wechat-entry" element={<WechatEntry token={token} />} />
            <Route path="merchant">
              <Route path="dashboard" element={<MerchantDashboard token={token} />} />
              <Route path="profile" element={<MerchantProfile token={token} />} />
              <Route path="promotion" element={<MerchantPromotion token={token} />} />
            </Route>
            <Route path="admin/promotion-orders" element={<AdminPromotionOrders token={token} />} />
            <Route path="academic">
              <Route path="teachers" element={<TeacherList token={token} />} />
              <Route path="reviews" element={<ReviewList token={token} />} />
              <Route path="courses" element={<CourseList token={token} />} />
              <Route path="materials" element={<MaterialList token={token} />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  );
}

createRoot(document.getElementById("root")!).render(<AdminApp />);
