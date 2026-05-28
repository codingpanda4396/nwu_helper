import React, { useState, useEffect } from "react";
import { Row, Col, Card, Spin, Alert, Select, Space } from "antd";
import dayjs, { Dayjs } from "dayjs";
import { adminApi } from "../../hooks/useAdmin";
import { StatCard, ChartCard, LineChart, DateRangePicker, ExportButton } from "..";

interface UserActivityProps {
  token: string;
}

interface UserActivityData {
  current: {
    dau: number;
    wau: number;
    mau: number;
  };
  trend: Array<{
    date: string;
    dau: number;
  }>;
}

export const UserActivity: React.FC<UserActivityProps> = ({ token }) => {
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs]>([
    dayjs().subtract(29, "day"),
    dayjs(),
  ]);
  const [metric, setMetric] = useState<"dau" | "wau" | "mau">("dau");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<UserActivityData | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const result = await adminApi<UserActivityData>(
          token,
          `/api/admin/analytics/user-activity?startDate=${dateRange[0].toISOString()}&endDate=${dateRange[1].toISOString()}&metric=${metric}`
        );

        setData(result);
      } catch (err: any) {
        setError(err.message || "加载数据失败");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, dateRange, metric]);

  if (error) {
    return <Alert type="error" message="错误" description={error} showIcon />;
  }

  return (
    <div>
      <div style={{ marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ margin: 0 }}>用户活跃度分析</h2>
        <Space>
          <Select
            value={metric}
            onChange={setMetric}
            options={[
              { label: "日活跃(DAU)", value: "dau" },
              { label: "周活跃(WAU)", value: "wau" },
              { label: "月活跃(MAU)", value: "mau" },
            ]}
            style={{ width: 150 }}
          />
          <DateRangePicker value={dateRange} onChange={setDateRange} />
        </Space>
      </div>

      <Spin spinning={loading}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={8}>
            <StatCard
              title="日活跃用户(DAU)"
              value={data?.current?.dau || 0}
              color="#1890ff"
              loading={loading}
            />
          </Col>
          <Col xs={24} sm={8}>
            <StatCard
              title="周活跃用户(WAU)"
              value={data?.current?.wau || 0}
              color="#52c41a"
              loading={loading}
            />
          </Col>
          <Col xs={24} sm={8}>
            <StatCard
              title="月活跃用户(MAU)"
              value={data?.current?.mau || 0}
              color="#faad14"
              loading={loading}
            />
          </Col>
        </Row>

        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
          <Col xs={24}>
            <ChartCard
              title={`${metric === "dau" ? "日" : metric === "wau" ? "周" : "月"}活跃用户趋势`}
              loading={loading}
              extra={
                data?.trend && (
                  <ExportButton
                    type="user-activity"
                    data={data.trend.map((item) => ({
                      日期: item.date,
                      活跃用户: item.dau,
                    }))}
                    columns={[
                      { title: "日期", dataIndex: "日期" },
                      { title: "活跃用户", dataIndex: "活跃用户" },
                    ]}
                    filename="用户活跃度"
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
                        name: "活跃用户",
                        data: data.trend.map((item) => item.dau),
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
            <Card title="活跃度指标说明">
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={8}>
                  <Card type="inner" title="DAU (日活跃用户)">
                    <p>当日登录或使用应用的独立用户数</p>
                    <p style={{ color: "#1890ff", fontSize: 24, fontWeight: "bold" }}>
                      {data?.current?.dau || 0}
                    </p>
                  </Card>
                </Col>
                <Col xs={24} sm={8}>
                  <Card type="inner" title="WAU (周活跃用户)">
                    <p>过去7天内登录或使用应用的独立用户数</p>
                    <p style={{ color: "#52c41a", fontSize: 24, fontWeight: "bold" }}>
                      {data?.current?.wau || 0}
                    </p>
                  </Card>
                </Col>
                <Col xs={24} sm={8}>
                  <Card type="inner" title="MAU (月活跃用户)">
                    <p>过去30天内登录或使用应用的独立用户数</p>
                    <p style={{ color: "#faad14", fontSize: 24, fontWeight: "bold" }}>
                      {data?.current?.mau || 0}
                    </p>
                  </Card>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>
      </Spin>
    </div>
  );
};
