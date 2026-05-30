import React, { useMemo, useState } from "react";
import { Button, Card, Col, DatePicker, Form, Input, Modal, Row, Select, Space, Statistic, Table, Tabs, message } from "antd";
import { DownloadOutlined, PlusOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { adminApi, useAdminData } from "../hooks/useAdmin";
import type { Dict } from "../hooks/useAdmin";

const { RangePicker } = DatePicker;

const actionLabels: Record<string, string> = {
  merchant_impression: "曝光",
  activity_impression: "活动曝光",
  merchant_click: "商家点击",
  merchant_view: "详情访问",
  phone_click: "电话点击",
  navigation_click: "导航点击",
  wechat_qr_view: "微信二维码",
  activity_click: "活动点击",
  community_merchant_click: "社区导流",
};

function buildQuery(values: Dict) {
  const params = new URLSearchParams();
  if (values.dates?.[0]) params.set("startDate", values.dates[0].startOf("day").toISOString());
  if (values.dates?.[1]) params.set("endDate", values.dates[1].endOf("day").toISOString());
  if (values.merchantId) params.set("merchantId", values.merchantId);
  if (values.channelId) params.set("channelId", values.channelId);
  if (values.source) params.set("source", values.source);
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export default function AttributionAnalysis({ token }: { token: string }) {
  const [filters, setFilters] = useState<Dict>({
    dates: [dayjs().subtract(30, "day"), dayjs()],
  });
  const [channelOpen, setChannelOpen] = useState(false);
  const [channelForm] = Form.useForm();
  const query = useMemo(() => buildQuery(filters), [filters]);

  const { data: overview, loading: overviewLoading, reload: reloadOverview } = useAdminData<Dict>(token, `/api/admin/attribution/overview${query}`, [query]);
  const { data: merchantRows, loading: merchantLoading, reload: reloadMerchants } = useAdminData<Dict[]>(token, `/api/admin/attribution/merchants${query}`, [query]);
  const { data: channelRows, loading: channelLoading, reload: reloadChannels } = useAdminData<Dict[]>(token, `/api/admin/attribution/channels${query}`, [query]);
  const { data: merchants } = useAdminData<Dict[]>(token, "/api/admin/merchants");
  const { data: channels, reload: reloadChannelOptions } = useAdminData<Dict[]>(token, "/api/admin/attribution/channel-options");

  const actionColumns = [
    { title: "PV", dataIndex: "totalPv", key: "totalPv", width: 80, sorter: (a: Dict, b: Dict) => (a.totalPv || 0) - (b.totalPv || 0) },
    { title: "UV", dataIndex: "totalUv", key: "totalUv", width: 80, sorter: (a: Dict, b: Dict) => (a.totalUv || 0) - (b.totalUv || 0) },
    ...Object.entries(actionLabels).map(([key, label]) => ({
      title: label,
      dataIndex: key,
      key,
      width: 100,
      render: (value: number) => value || 0,
    })),
  ];

  const reloadAll = () => {
    reloadOverview();
    reloadMerchants();
    reloadChannels();
  };

  const createChannel = async () => {
    try {
      const values = await channelForm.validateFields();
      await adminApi(token, "/api/admin/attribution/channel-options", {
        method: "POST",
        body: JSON.stringify(values),
      });
      message.success("渠道已创建");
      setChannelOpen(false);
      channelForm.resetFields();
      reloadChannelOptions();
    } catch (err) {
      message.error(err instanceof Error ? err.message : "操作失败");
    }
  };

  const exportCsv = async () => {
    const res = await fetch(`${import.meta.env.VITE_API_BASE ?? ""}/api/admin/attribution/export${query}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      message.error("导出失败");
      return;
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "attribution-export.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Space direction="vertical" size={16} style={{ width: "100%" }}>
      <Card>
        <Space wrap>
          <RangePicker value={filters.dates} onChange={(dates) => setFilters({ ...filters, dates })} />
          <Select
            allowClear
            showSearch
            placeholder="商家"
            style={{ width: 220 }}
            optionFilterProp="label"
            value={filters.merchantId}
            onChange={(merchantId) => setFilters({ ...filters, merchantId })}
            options={(merchants || []).map((m: Dict) => ({ value: m.id, label: m.name }))}
          />
          <Select
            allowClear
            showSearch
            placeholder="渠道"
            style={{ width: 240 }}
            optionFilterProp="label"
            value={filters.channelId}
            onChange={(channelId) => setFilters({ ...filters, channelId })}
            options={(channels || []).map((c: Dict) => ({ value: c.key, label: `${c.name} (${c.key})` }))}
          />
          <Input
            allowClear
            placeholder="source"
            style={{ width: 180 }}
            value={filters.source}
            onChange={(event) => setFilters({ ...filters, source: event.target.value })}
          />
          <Button onClick={reloadAll}>刷新</Button>
          <Button icon={<PlusOutlined />} onClick={() => setChannelOpen(true)}>新增渠道</Button>
          <Button icon={<DownloadOutlined />} onClick={exportCsv}>导出 CSV</Button>
        </Space>
      </Card>

      <Row gutter={16}>
        <Col span={6}><Card loading={overviewLoading}><Statistic title="总 PV" value={overview?.totalPv || 0} /></Card></Col>
        <Col span={6}><Card loading={overviewLoading}><Statistic title="总 UV" value={overview?.totalUv || 0} /></Card></Col>
        <Col span={6}><Card loading={overviewLoading}><Statistic title="电话点击" value={overview?.funnel?.find((x: Dict) => x.action === "phone_click")?.pv || 0} /></Card></Col>
        <Col span={6}><Card loading={overviewLoading}><Statistic title="微信二维码" value={overview?.funnel?.find((x: Dict) => x.action === "wechat_qr_view")?.pv || 0} /></Card></Col>
      </Row>

      <Tabs
        items={[
          {
            key: "funnel",
            label: "导流漏斗",
            children: (
              <Card>
                <Table
                  rowKey="action"
                  loading={overviewLoading}
                  dataSource={overview?.funnel || []}
                  pagination={false}
                  columns={[
                    { title: "行为", dataIndex: "action", render: (v: string) => actionLabels[v] || v },
                    { title: "PV", dataIndex: "pv" },
                    { title: "UV", dataIndex: "uv" },
                  ]}
                />
              </Card>
            ),
          },
          {
            key: "merchant",
            label: "商家维度",
            children: (
              <Card>
                <Table
                  rowKey="merchantId"
                  loading={merchantLoading}
                  dataSource={merchantRows || []}
                  columns={[{ title: "商家", dataIndex: "merchantName", key: "merchantName", fixed: "left", width: 180 }, ...actionColumns]}
                  scroll={{ x: 1200 }}
                />
              </Card>
            ),
          },
          {
            key: "channel",
            label: "渠道维度",
            children: (
              <Card>
                <Table
                  rowKey={(row) => row.channelId || row.source || "direct"}
                  loading={channelLoading}
                  dataSource={channelRows || []}
                  columns={[
                    { title: "渠道", dataIndex: "channelName", key: "channelName", fixed: "left", width: 180 },
                    { title: "source", dataIndex: "source", key: "source", width: 160 },
                    ...actionColumns,
                  ]}
                  scroll={{ x: 1300 }}
                />
              </Card>
            ),
          },
        ]}
      />

      <Modal title="新增归因渠道" open={channelOpen} onOk={createChannel} onCancel={() => setChannelOpen(false)} destroyOnClose>
        <Form form={channelForm} layout="vertical" initialValues={{ isActive: true }}>
          <Form.Item name="key" label="渠道标识" rules={[{ required: true }]}>
            <Input placeholder="campus_group_a" />
          </Form.Item>
          <Form.Item name="name" label="渠道名称" rules={[{ required: true }]}>
            <Input placeholder="校园群 A" />
          </Form.Item>
          <Form.Item name="source" label="来源">
            <Input placeholder="wechat_group / xiaohongshu / poster" />
          </Form.Item>
          <Form.Item name="campaign" label="活动期">
            <Input placeholder="2026-summer" />
          </Form.Item>
          <Form.Item name="description" label="备注">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
}
