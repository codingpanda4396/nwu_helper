import React, { useState, useEffect } from "react";
import { Card, Row, Col, Statistic, DatePicker, Spin, Empty, Typography } from "antd";
import { ShopOutlined, EyeOutlined, HeartOutlined, AimOutlined } from "@ant-design/icons";
import { LineChart, FunnelChart } from "../analytics/charts";
import { adminApi } from "../hooks/useAdmin";
import dayjs from "dayjs";

const { Title } = Typography;
const { RangePicker } = DatePicker;

export default function MerchantDashboard({ token }: { token: string }) {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [funnel, setFunnel] = useState<any>(null);
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs().subtract(30, "day"),
    dayjs()
  ]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const from = dateRange[0].format("YYYY-MM-DD");
      const to = dateRange[1].format("YYYY-MM-DD");
      const [statsData, funnelData] = await Promise.all([
        adminApi(token, `/api/merchant/stats?from=${from}&to=${to}`),
        adminApi(token, `/api/merchant/funnel?from=${from}&to=${to}`)
      ]);
      setStats(statsData);
      setFunnel(funnelData);
    } catch (e) {
      setStats(null);
      setFunnel(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [dateRange]);

  if (loading) return <Spin size="large" style={{ display: "block", margin: "100px auto" }} />;
  if (!stats && !funnel) return <Empty description="暂无数据" />;

  const summary = stats?.summary || {};

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <Title level={4} style={{ margin: 0 }}>数据看板</Title>
        <RangePicker
          value={dateRange}
          onChange={(dates) => {
            if (dates && dates[0] && dates[1]) {
              setDateRange([dates[0], dates[1]]);
            }
          }}
        />
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic title="曝光量" value={summary.views || 0} prefix={<EyeOutlined />} />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic title="收藏数" value={summary.favorites || 0} prefix={<HeartOutlined />} />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic title="点击/动作" value={summary.clicks || 0} prefix={<AimOutlined />} />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic title="店铺" value="--" prefix={<ShopOutlined />} />
          </Card>
        </Col>
      </Row>

      {stats?.series && stats.series.length > 0 && (
        <Card title="曝光趋势" style={{ marginBottom: 24 }}>
          <LineChart
            data={{
              dates: stats.series.map((s: any) => s.date),
              series: [
                { name: "曝光", data: stats.series.map((s: any) => s.views) },
                { name: "收藏", data: stats.series.map((s: any) => s.favorites) },
                { name: "点击", data: stats.series.map((s: any) => s.clicks) }
              ]
            }}
          />
        </Card>
      )}

      {funnel?.steps && (
        <Card title="转化漏斗" style={{ marginBottom: 24 }}>
          <FunnelChart data={funnel.steps.map((s: any) => ({ name: s.label, value: s.count }))} />
        </Card>
      )}
    </div>
  );
}
