import React, { useState, useEffect } from "react";
import { Row, Col, Card, Spin, Alert } from "antd";
import {
  UserOutlined,
  TeamOutlined,
  RiseOutlined,
  LineChartOutlined,
} from "@ant-design/icons";
import dayjs, { Dayjs } from "dayjs";
import { adminApi } from "../../../hooks/useAdmin";
import { StatCard, ChartCard, LineChart, PieChart, DateRangePicker, ExportButton } from "..";

interface AnalyticsOverviewProps {
  token: string;
}

interface OverviewData {
  userGrowth: {
    summary: {
      totalUsers: number;
      newUsers: number;
      growthRate: number;
      activeUsers: number;
    };
    trend: Array<{
      date: string;
      newUsers: number;
    }>;
  };
  loginMethods: {
    distribution: Array<{
      method: string;
      count: number;
      percentage: number;
    }>;
  };
  userActivity: {
    current: {
      dau: number;
      wau: number;
      mau: number;
    };
  };
}

export const AnalyticsOverview: React.FC<AnalyticsOverviewProps> = ({ token }) => {
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs]>([
    dayjs().subtract(29, "day"),
    dayjs(),
  ]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<OverviewData | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [userGrowth, loginMethods, userActivity] = await Promise.all([
          adminApi<any>(token, `/api/admin/analytics/user-growth?startDate=${dateRange[0].toISOString()}&endDate=${dateRange[1].toISOString()}`),
          adminApi<any>(token, `/api/admin/analytics/login-methods?startDate=${dateRange[0].toISOString()}&endDate=${dateRange[1].toISOString()}`),
          adminApi<any>(token, `/api/admin/analytics/user-activity?startDate=${dateRange[0].toISOString()}&endDate=${dateRange[1].toISOString()}`),
        ]);

        setData({ userGrowth, loginMethods, userActivity });
      } catch (err: any) {
        setError(err.message || "加载数据失败");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, dateRange]);

  if (error) {
    return <Alert type="error" message="错误" description={error} showIcon />;
  }

  const loginMethodColors = ["#1890ff", "#52c41a", "#faad14", "#f5222d"];

  return (
    <div>
      <div style={{ marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ margin: 0 }}>数据概览</h2>
        <DateRangePicker value={dateRange} onChange={setDateRange} />
      </div>

      <Spin spinning={loading}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={6}>
            <StatCard
              title="总用户数"
              value={data?.userGrowth?.summary?.totalUsers || 0}
              icon={<TeamOutlined />}
              color="#1890ff"
              loading={loading}
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <StatCard
              title="新增用户"
              value={data?.userGrowth?.summary?.newUsers || 0}
              icon={<UserOutlined />}
              color="#52c41a"
              trend={
                data?.userGrowth?.summary?.growthRate
                  ? { value: data.userGrowth.summary.growthRate, isUp: data.userGrowth.summary.growthRate > 0 }
                  : undefined
              }
              loading={loading}
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <StatCard
              title="日活跃用户"
              value={data?.userActivity?.current?.dau || 0}
              icon={<RiseOutlined />}
              color="#faad14"
              loading={loading}
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <StatCard
              title="月活跃用户"
              value={data?.userActivity?.current?.mau || 0}
              icon={<LineChartOutlined />}
              color="#722ed1"
              loading={loading}
            />
          </Col>
        </Row>

        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
          <Col xs={24} lg={16}>
            <ChartCard title="用户增长趋势" loading={loading}>
              {data?.userGrowth?.trend && (
                <LineChart
                  data={{
                    dates: data.userGrowth.trend.map((item) => item.date),
                    series: [
                      {
                        name: "新增用户",
                        data: data.userGrowth.trend.map((item) => item.newUsers),
                        color: "#1890ff",
                      },
                    ],
                  }}
                  height={350}
                  areaStyle
                />
              )}
            </ChartCard>
          </Col>
          <Col xs={24} lg={8}>
            <ChartCard title="登录方式分布" loading={loading}>
              {data?.loginMethods?.distribution && (
                <PieChart
                  data={data.loginMethods.distribution.map((item, index) => ({
                    name: item.method === "password" ? "密码登录" : item.method === "wechat" ? "微信登录" : "短信登录",
                    value: item.count,
                    color: loginMethodColors[index],
                  }))}
                  height={350}
                />
              )}
            </ChartCard>
          </Col>
        </Row>

        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
          <Col xs={24}>
            <Card
              title="数据导出"
              extra={
                data && (
                  <ExportButton
                    type="overview"
                    data={[
                      {
                        指标: "总用户数",
                        数值: data.userGrowth?.summary?.totalUsers || 0,
                      },
                      {
                        指标: "新增用户",
                        数值: data.userGrowth?.summary?.newUsers || 0,
                      },
                      {
                        指标: "日活跃用户",
                        数值: data.userActivity?.current?.dau || 0,
                      },
                      {
                        指标: "月活跃用户",
                        数值: data.userActivity?.current?.mau || 0,
                      },
                    ]}
                    columns={[
                      { title: "指标", dataIndex: "指标" },
                      { title: "数值", dataIndex: "数值" },
                    ]}
                    filename="数据概览"
                  />
                )
              }
            >
              <p>点击右上角按钮导出当前概览数据为Excel文件</p>
            </Card>
          </Col>
        </Row>
      </Spin>
    </div>
  );
};
