import React, { useState, useEffect } from "react";
import { Row, Col, Card, Spin, Alert, Table, Tag } from "antd";
import dayjs, { Dayjs } from "dayjs";
import { adminApi } from "../../../hooks/useAdmin";
import { ChartCard, LineChart, BarChart, DateRangePicker, ExportButton } from "..";

interface UserRetentionProps {
  token: string;
}

interface RetentionData {
  cohorts: Array<{
    cohortDate: string;
    newUsers: number;
    retention: {
      day1: number;
      day7: number;
      day30: number;
    };
  }>;
  averageRetention: {
    day1: number;
    day7: number;
    day30: number;
  };
}

export const UserRetention: React.FC<UserRetentionProps> = ({ token }) => {
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs]>([
    dayjs().subtract(29, "day"),
    dayjs(),
  ]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<RetentionData | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const result = await adminApi<RetentionData>(
          token,
          `/api/admin/analytics/user-retention?startDate=${dateRange[0].toISOString()}&endDate=${dateRange[1].toISOString()}`
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

  const columns = [
    {
      title: "队列日期",
      dataIndex: "cohortDate",
      key: "cohortDate",
    },
    {
      title: "新增用户",
      dataIndex: "newUsers",
      key: "newUsers",
    },
    {
      title: "次日留存",
      dataIndex: ["retention", "day1"],
      key: "day1",
      render: (value: number) => (
        <Tag color={value >= 50 ? "green" : value >= 30 ? "orange" : "red"}>
          {value}%
        </Tag>
      ),
    },
    {
      title: "7日留存",
      dataIndex: ["retention", "day7"],
      key: "day7",
      render: (value: number) => (
        <Tag color={value >= 30 ? "green" : value >= 15 ? "orange" : "red"}>
          {value}%
        </Tag>
      ),
    },
    {
      title: "30日留存",
      dataIndex: ["retention", "day30"],
      key: "day30",
      render: (value: number) => (
        <Tag color={value >= 15 ? "green" : value >= 5 ? "orange" : "red"}>
          {value}%
        </Tag>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ margin: 0 }}>用户留存分析</h2>
        <DateRangePicker value={dateRange} onChange={setDateRange} />
      </div>

      <Spin spinning={loading}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={8}>
            <Card>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 14, color: "#666" }}>平均次日留存</div>
                <div style={{ fontSize: 32, fontWeight: "bold", color: "#1890ff" }}>
                  {data?.averageRetention?.day1 || 0}%
                </div>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 14, color: "#666" }}>平均7日留存</div>
                <div style={{ fontSize: 32, fontWeight: "bold", color: "#52c41a" }}>
                  {data?.averageRetention?.day7 || 0}%
                </div>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 14, color: "#666" }}>平均30日留存</div>
                <div style={{ fontSize: 32, fontWeight: "bold", color: "#faad14" }}>
                  {data?.averageRetention?.day30 || 0}%
                </div>
              </div>
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
          <Col xs={24}>
            <ChartCard
              title="留存率趋势"
              loading={loading}
              extra={
                data?.cohorts && (
                  <ExportButton
                    type="retention"
                    data={data.cohorts.map((item) => ({
                      队列日期: item.cohortDate,
                      新增用户: item.newUsers,
                      次日留存: `${item.retention.day1}%`,
                      "7日留存": `${item.retention.day7}%`,
                      "30日留存": `${item.retention.day30}%`,
                    }))}
                    columns={[
                      { title: "队列日期", dataIndex: "队列日期" },
                      { title: "新增用户", dataIndex: "新增用户" },
                      { title: "次日留存", dataIndex: "次日留存" },
                      { title: "7日留存", dataIndex: "7日留存" },
                      { title: "30日留存", dataIndex: "30日留存" },
                    ]}
                    filename="用户留存分析"
                  />
                )
              }
            >
              {data?.cohorts && (
                <LineChart
                  data={{
                    dates: data.cohorts.map((item) => item.cohortDate),
                    series: [
                      {
                        name: "次日留存",
                        data: data.cohorts.map((item) => item.retention.day1),
                        color: "#1890ff",
                      },
                      {
                        name: "7日留存",
                        data: data.cohorts.map((item) => item.retention.day7),
                        color: "#52c41a",
                      },
                      {
                        name: "30日留存",
                        data: data.cohorts.map((item) => item.retention.day30),
                        color: "#faad14",
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
            <Card title="留存队列明细">
              <Table
                columns={columns}
                dataSource={data?.cohorts || []}
                rowKey="cohortDate"
                pagination={false}
                size="small"
              />
            </Card>
          </Col>
        </Row>
      </Spin>
    </div>
  );
};
