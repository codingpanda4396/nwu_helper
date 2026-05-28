import React, { useState, useEffect } from "react";
import { Row, Col, Card, Spin, Alert, Select, Space, Table, Progress } from "antd";
import dayjs, { Dayjs } from "dayjs";
import { adminApi } from "../../../hooks/useAdmin";
import { ChartCard, FunnelChart, BarChart, DateRangePicker, ExportButton } from "..";

interface UserFunnelProps {
  token: string;
}

interface FunnelData {
  funnel: {
    id: string;
    name: string;
    steps: Array<{
      name: string;
      count: number;
      rate: number;
    }>;
  };
}

export const UserFunnel: React.FC<UserFunnelProps> = ({ token }) => {
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs]>([
    dayjs().subtract(29, "day"),
    dayjs(),
  ]);
  const [funnelId, setFunnelId] = useState<"merchant_conversion" | "activity_conversion">("merchant_conversion");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<FunnelData | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const result = await adminApi<FunnelData>(
          token,
          `/api/admin/analytics/user-funnel?startDate=${dateRange[0].toISOString()}&endDate=${dateRange[1].toISOString()}&funnelId=${funnelId}`
        );

        setData(result);
      } catch (err: any) {
        setError(err.message || "加载数据失败");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, dateRange, funnelId]);

  if (error) {
    return <Alert type="error" message="错误" description={error} showIcon />;
  }

  const columns = [
    {
      title: "步骤",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "用户数",
      dataIndex: "count",
      key: "count",
      sorter: (a: any, b: any) => a.count - b.count,
    },
    {
      title: "转化率",
      dataIndex: "rate",
      key: "rate",
      render: (value: number) => (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Progress
            percent={value * 100}
            size="small"
            style={{ width: 100, margin: 0 }}
            strokeColor={value >= 0.5 ? "#52c41a" : value >= 0.2 ? "#faad14" : "#f5222d"}
          />
          <span>{(value * 100).toFixed(1)}%</span>
        </div>
      ),
    },
    {
      title: "流失用户",
      key: "loss",
      render: (_: any, record: any, index: number) => {
        if (index === 0) return "-";
        const prevCount = data?.funnel?.steps[index - 1]?.count || 0;
        const loss = prevCount - record.count;
        return (
          <span style={{ color: "#f5222d" }}>
            {loss > 0 ? `-${loss}` : "0"}
          </span>
        );
      },
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ margin: 0 }}>用户转化漏斗</h2>
        <Space>
          <Select
            value={funnelId}
            onChange={setFunnelId}
            options={[
              { label: "商家转化漏斗", value: "merchant_conversion" },
              { label: "活动转化漏斗", value: "activity_conversion" },
            ]}
            style={{ width: 150 }}
          />
          <DateRangePicker value={dateRange} onChange={setDateRange} />
        </Space>
      </div>

      <Spin spinning={loading}>
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}>
            <ChartCard title={data?.funnel?.name || "转化漏斗"} loading={loading}>
              {data?.funnel?.steps && (
                <FunnelChart
                  data={data.funnel.steps.map((step) => ({
                    name: step.name,
                    value: step.count,
                    rate: step.rate,
                  }))}
                  height={400}
                />
              )}
            </ChartCard>
          </Col>
          <Col xs={24} lg={12}>
            <ChartCard title="各步骤用户数" loading={loading}>
              {data?.funnel?.steps && (
                <BarChart
                  data={{
                    categories: data.funnel.steps.map((step) => step.name),
                    series: [
                      {
                        name: "用户数",
                        data: data.funnel.steps.map((step) => step.count),
                        color: "#1890ff",
                      },
                    ],
                  }}
                  height={400}
                  horizontal
                />
              )}
            </ChartCard>
          </Col>
        </Row>

        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
          <Col xs={24}>
            <Card
              title="漏斗步骤明细"
              extra={
                data?.funnel?.steps && (
                  <ExportButton
                    type="funnel"
                    data={data.funnel.steps.map((step) => ({
                      步骤: step.name,
                      用户数: step.count,
                      转化率: `${(step.rate * 100).toFixed(1)}%`,
                    }))}
                    columns={[
                      { title: "步骤", dataIndex: "步骤" },
                      { title: "用户数", dataIndex: "用户数" },
                      { title: "转化率", dataIndex: "转化率" },
                    ]}
                    filename="转化漏斗"
                  />
                )
              }
            >
              <Table
                columns={columns}
                dataSource={data?.funnel?.steps || []}
                rowKey="name"
                pagination={false}
                size="small"
              />
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
          <Col xs={24}>
            <Card title="转化率分析">
              <p><strong>整体转化率：</strong>{data?.funnel?.steps?.length ? ((data.funnel.steps[data.funnel.steps.length - 1]?.rate || 0) * 100).toFixed(1) : 0}%</p>
              <p><strong>最大流失环节：</strong>
                {data?.funnel?.steps?.length ? (() => {
                  let maxLoss = 0;
                  let maxLossStep = data.funnel.steps[0]?.name || "";
                  for (let i = 1; i < data.funnel.steps.length; i++) {
                    const loss = data.funnel.steps[i - 1].rate - data.funnel.steps[i].rate;
                    if (loss > maxLoss) {
                      maxLoss = loss;
                      maxLossStep = data.funnel.steps[i].name;
                    }
                  }
                  return maxLossStep;
                })() : "无数据"}
              </p>
              <p><strong>建议：</strong>重点关注最大流失环节，优化用户体验以提高转化率。</p>
            </Card>
          </Col>
        </Row>
      </Spin>
    </div>
  );
};
