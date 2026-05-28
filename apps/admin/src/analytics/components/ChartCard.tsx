import React from "react";
import { Card, Spin } from "antd";

interface ChartCardProps {
  title: string;
  extra?: React.ReactNode;
  children: React.ReactNode;
  loading?: boolean;
  height?: number;
}

export const ChartCard: React.FC<ChartCardProps> = ({
  title,
  extra,
  children,
  loading = false,
  height = 400,
}) => {
  return (
    <Card
      title={title}
      extra={extra}
      style={{ height: "100%" }}
      styles={{
        body: {
          height: height,
          display: "flex",
          flexDirection: "column",
        },
      }}
    >
      <Spin spinning={loading} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ flex: 1, width: "100%" }}>{children}</div>
      </Spin>
    </Card>
  );
};
