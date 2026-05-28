import React, { useState, useEffect } from "react";
import { Row, Col, Card, Spin, Alert, Select, Space } from "antd";
import dayjs, { Dayjs } from "dayjs";
import { adminApi } from "../../../hooks/useAdmin";
import { StatCard, ChartCard, LineChart, BarChart, DateRangePicker, ExportButton } from "..";

interface UserGrowthProps {
  token: string;
}

interface UserGrowthData {
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
}

export const UserGrowth: React.FC<UserGrowthProps> = ({ token }) => {
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs]>([
    dayjs().subtract(29, "day"),
    dayjs(),
  ]);
  const [granularity, setGranularity] = useState<"day" | "week" | "month">("day");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<UserGrowthData | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const result = await adminApi<UserGrowthData>(
          token,
          `/api/admin/analytics/user-growth?startDate=${dateRange[0].toISOString()}&endDate=${dateRange[1].toISOString()}&granularity=${granularity}`
        );

        setData(result);
      } catch (err: any) {
        setError(err.message || "加载数据失败");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, dateRange, granularity]);

  if (error) {
    return <Alert type="error" message="错误" description={error} showIcon />;
  }

  return (
    <div>
      <div style={{ marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ margin: 0 }}>用户增长分析</h2>
        <Space>
          <Select
            value={granularity}
            onChange={setGranularity}
            options={[
              { label: "按日", value: "day" },
              { label: "按周", value: "week" },
              { label: "按月", value: "month" },
            ]}
            style={{ width: 100 }}
          />
          <DateRangePicker value={dateRange} onChange={setDateRange} />
        </Space>
      </div>

      <Spin spinning={loading}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={6}>
            <StatCard
              title="总用户数"
              value={data?.summary?.totalUsers || 0}
              color="#1890ff"
              loading={loading}
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <StatCard
              title="新增用户"
              value={data?.summary?.newUsers || 0}
              color="#52c41a"
              trend={
                data?.summary?.growthRate
                  ? { value: data.summary.growthRate, isUp: data.summary.growthRate > 0 }
                  : undefined
              }
              loading={loading}
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <StatCard
              title="增长率"
              value={data?.summary?.growthRate || 0}
              suffix="%"
              color="#faad14"
              loading={loading}
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <StatCard
              title="活跃用户"
              value={data?.summary?.activeUsers || 0}
              color="#722ed1"
              loading={loading}
            />
          </Col>
        </Row>

        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
          <Col xs={24}>
            <ChartCard
              title="用户增长趋势"
              loading={loading}
              extra={
                data?.trend && (
                  <ExportButton
                    type="user-growth"
                    data={data.trend.map((item) => ({
                      日期: item.date,
                      新增用户: item.newUsers,
                    }))}
                    columns={[
                      { title: "日期", dataIndex: "日期" },
                      { title: "新增用户", dataIndex: "新增用户" },
                    ]}
                    filename="用户增长趋势"
                  />
                )
              }
            >
              {data?.trend && (
                <LineChart
                  data={{
                    dates: data.trend.map((item) => item.date),
                    series: [
                      {
                        name: "新增用户",
                        data: data.trend.map((item) => item.newUsers),
                        color: "#1890ff",
                      },
                    ],
                  }}
                  height={400}
                  areaStyle
                />
              )}
            </ChartCard>
          </Col>
        </Row>

        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
          <Col xs={24}>
            <ChartCard title="新增用户分布" loading={loading}>
              {data?.trend && (
                <BarChart
                  data={{
                    categories: data.trend.map((item) => item.date),
                    series: [
                      {
                        name: "新增用户",
                        data: data.trend.map((item) => item.newUsers),
                        color: "#1890ff",
                      },
                    ],
                  }}
                  height={300}
                />
              )}
            </ChartCard>
          </Col>
        </Row>
      </Spin>
    </div>
  );
};
