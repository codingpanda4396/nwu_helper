import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ConfigProvider } from "antd";
import zhCN from "antd/locale/zh_CN";
import { useAdmin } from "./hooks/useAdmin";
import AdminLayout from "./components/AdminLayout";
import Login from "./pages/Login";
import Overview from "./pages/Overview";
import CommunityList from "./pages/CommunityList";
import CommunityDetail from "./pages/CommunityDetail";
import BannerList from "./pages/BannerList";
import BannerForm from "./pages/BannerForm";
import ServiceCategoryList from "./pages/ServiceCategoryList";
import WechatEntry from "./pages/WechatEntry";
import {
  AnalyticsOverview,
  UserGrowth,
  LoginMethods,
  UserActivity,
  UserRetention,
  UserFunnel,
} from "./analytics/pages";

function AdminApp() {
  const { token, user, login, logout, isAuthenticated } = useAdmin();

  if (!isAuthenticated) {
    return (
      <ConfigProvider locale={zhCN}>
        <Login onLogin={login} />
      </ConfigProvider>
    );
  }

  return (
    <ConfigProvider locale={zhCN}>
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={<AdminLayout user={user} onLogout={logout} />}
          >
            <Route index element={<Navigate to="/overview" replace />} />
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
            <Route path="banners" element={<BannerList token={token} />} />
            <Route path="banners/create" element={<BannerForm token={token} />} />
            <Route path="banners/:id/edit" element={<BannerForm token={token} />} />
            <Route path="services" element={<ServiceCategoryList token={token} />} />
            <Route path="wechat-entry" element={<WechatEntry token={token} />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  );
}

createRoot(document.getElementById("root")!).render(<AdminApp />);
