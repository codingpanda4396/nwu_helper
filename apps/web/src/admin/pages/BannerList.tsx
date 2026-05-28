import React, { useState } from "react";
import { Table, Card, Button, Tag, Space, Switch, message, Popconfirm } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useAdminData, adminApi, webImage } from "../hooks/useAdmin";
import type { Dict } from "../hooks/useAdmin";

export default function BannerList({ token }: { token: string }) {
  const navigate = useNavigate();
  const { data: banners, loading, reload } = useAdminData<Dict[]>(
    token,
    "/api/admin/banners"
  );

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      await adminApi(token, `/api/admin/banners/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ isActive }),
      });
      message.success(isActive ? "已上架" : "已下架");
      reload();
    } catch (err) {
      message.error(err instanceof Error ? err.message : "操作失败");
    }
  };

  const columns = [
    {
      title: "图片",
      dataIndex: "imageUrl",
      key: "image",
      width: 100,
      render: (url: string) =>
        webImage(url) ? (
          <img src={webImage(url)} alt="" style={{ width: 80, height: 45, objectFit: "cover", borderRadius: 4 }} />
        ) : (
          "-"
        ),
    },
    {
      title: "标题",
      dataIndex: "title",
      key: "title",
      width: 150,
    },
    {
      title: "副标题",
      dataIndex: "subtitle",
      key: "subtitle",
      width: 150,
      ellipsis: true,
    },
    {
      title: "跳转类型",
      dataIndex: "targetType",
      key: "targetType",
      width: 100,
      render: (type: string) => {
        const map: Record<string, string> = {
          ACTIVITY: "活动",
          SERVICE: "服务",
          ABOUT: "关于",
          TAB: "页面",
          URL: "链接",
        };
        return <Tag>{map[type] || type}</Tag>;
      },
    },
    {
      title: "排序",
      dataIndex: "sortOrder",
      key: "sortOrder",
      width: 60,
    },
    {
      title: "状态",
      dataIndex: "isActive",
      key: "isActive",
      width: 80,
      render: (isActive: boolean, record: Dict) => (
        <Switch
          checked={isActive}
          onChange={(checked) => handleToggleActive(record.id, checked)}
        />
      ),
    },
    {
      title: "操作",
      key: "action",
      width: 100,
      render: (_: any, record: Dict) => (
        <Button
          type="link"
          icon={<EditOutlined />}
          onClick={() => navigate(`/admin/banners/${record.id}/edit`)}
        >
          编辑
        </Button>
      ),
    },
  ];

  return (
    <div>
      <Card
        title="轮播图管理"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate("/admin/banners/create")}
          >
            添加轮播图
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={banners || []}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>
    </div>
  );
}
