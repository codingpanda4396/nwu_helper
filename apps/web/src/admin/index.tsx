import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ConfigProvider } from "antd";
import zhCN from "antd/locale/zh_CN";
import { useAdmin } from "./hooks/useAdmin";
import AdminLayout from "./components/AdminLayout";
import Login from "./pages/Login";
import Overview from "./pages/Overview";
import CommunityList from "./pages/CommunityList";
import CommunityDetail from "./pages/CommunityDetail";
import MerchantList from "./pages/MerchantList";
import MerchantForm from "./pages/MerchantForm";
import ActivityList from "./pages/ActivityList";
import ActivityForm from "./pages/ActivityForm";
import BannerList from "./pages/BannerList";
import BannerForm from "./pages/BannerForm";
import ServiceManagement from "./pages/ServiceManagement";
import WechatEntry from "./pages/WechatEntry";
import FoodList from "./pages/FoodList";

export default function AdminApp() {
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
            path="/admin"
            element={<AdminLayout user={user} onLogout={logout} />}
          >
            <Route index element={<Navigate to="/admin/overview" replace />} />
            <Route path="overview" element={<Overview token={token} />} />
            <Route path="community" element={<CommunityList token={token} />} />
            <Route path="community/:id" element={<CommunityDetail token={token} />} />
            <Route path="merchants" element={<MerchantList token={token} />} />
            <Route path="merchants/create" element={<MerchantForm token={token} />} />
            <Route path="merchants/:id/edit" element={<MerchantForm token={token} />} />
            <Route path="activities" element={<ActivityList token={token} />} />
            <Route path="activities/create" element={<ActivityForm token={token} />} />
            <Route path="activities/:id/edit" element={<ActivityForm token={token} />} />
            <Route path="banners" element={<BannerList token={token} />} />
            <Route path="banners/create" element={<BannerForm token={token} />} />
            <Route path="banners/:id/edit" element={<BannerForm token={token} />} />
            <Route path="services" element={<ServiceManagement token={token} />} />
            <Route path="wechat-entry" element={<WechatEntry token={token} />} />
            <Route path="food" element={<FoodList token={token} />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  );
}
