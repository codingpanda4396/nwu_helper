import React, { useState, useEffect } from "react";
import { Row, Col, Card, Spin, Alert } from "antd";
import dayjs, { Dayjs } from "dayjs";
import { adminApi } from "../../hooks/useAdmin";
import { ChartCard, PieChart, BarChart, LineChart, DateRangePicker, ExportButton } from "..";

interface LoginMethodsProps {
  token: string;
}

interface LoginMethodsData {
  distribution: Array<{
    method: string;
    count: number;
    percentage: number;
  }>;
  trend: Array<{
    date: string;
    password: number;
    wechat: number;
    sms: number;
  }>;
}

const methodLabels: Record<string, string> = {
  password: "密码登录",
  wechat: "微信登录",
  sms: "短信登录",
};

const methodColors: Record<string, string> = {
  password: "#1890ff",
  wechat: "#52c41a",
  sms: "#faad14",
};

export const LoginMethods: React.FC<LoginMethodsProps> = ({ token }) => {
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs]>([
    dayjs().subtract(29, "day"),
    dayjs(),
  ]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<LoginMethodsData | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const result = await adminApi<LoginMethodsData>(
          token,
          `/api/admin/analytics/login-methods?startDate=${dateRange[0].toISOString()}&endDate=${dateRange[1].toISOString()}`
        );

        setData(result);
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

  return (
    <div>
      <div style={{ marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ margin: 0 }}>登录方式分析</h2>
        <DateRangePicker value={dateRange} onChange={setDateRange} />
      </div>

      <Spin spinning={loading}>
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={8}>
            <ChartCard title="登录方式分布" loading={loading}>
              {data?.distribution && (
                <PieChart
                  data={data.distribution.map((item) => ({
                    name: methodLabels[item.method] || item.method,
                    value: item.count,
                    color: methodColors[item.method],
                  }))}
                  height={400}
                />
              )}
            </ChartCard>
          </Col>
          <Col xs={24} lg={16}>
            <ChartCard
              title="登录方式趋势"
              loading={loading}
              extra={
                data?.distribution && (
                  <ExportButton
                    type="login-methods"
                    data={data.distribution.map((item) => ({
                      登录方式: methodLabels[item.method] || item.method,
                      登录次数: item.count,
                      占比: `${item.percentage}%`,
                    }))}
                    columns={[
                      { title: "登录方式", dataIndex: "登录方式" },
                      { title: "登录次数", dataIndex: "登录次数" },
                      { title: "占比", dataIndex: "占比" },
                    ]}
                    filename="登录方式分布"
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
                        name: "密码登录",
                        data: data.trend.map((item) => item.password),
                        color: methodColors.password,
                      },
                      {
                        name: "微信登录",
                        data: data.trend.map((item) => item.wechat),
                        color: methodColors.wechat,
                      },
                      {
                        name: "短信登录",
                        data: data.trend.map((item) => item.sms),
                        color: methodColors.sms,
                      },
                    ],
                  }}
                  height={400}
                />
              )}
            </ChartCard>
          </Col>
        </Row>

        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
          <Col xs={24}>
            <ChartCard title="登录方式对比" loading={loading}>
              {data?.trend && (
                <BarChart
                  data={{
                    categories: data.trend.map((item) => item.date),
                    series: [
                      {
                        name: "密码登录",
                        data: data.trend.map((item) => item.password),
                        color: methodColors.password,
                      },
                      {
                        name: "微信登录",
                        data: data.trend.map((item) => item.wechat),
                        color: methodColors.wechat,
                      },
                      {
                        name: "短信登录",
                        data: data.trend.map((item) => item.sms),
                        color: methodColors.sms,
                      },
                    ],
                  }}
                  height={300}
                  stacked
                />
              )}
            </ChartCard>
          </Col>
        </Row>
      </Spin>
    </div>
  );
};
