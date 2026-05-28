import React from "react";
import { Card, Statistic } from "antd";

interface StatCardProps {
  title: string;
  value: number;
  suffix?: string;
  prefix?: string;
  trend?: {
    value: number;
    isUp: boolean;
  };
  icon?: React.ReactNode;
  color: string;
  loading?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  suffix,
  prefix,
  trend,
  icon,
  color,
  loading = false,
}) => {
  return (
    <Card loading={loading} style={{ height: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <Statistic
            title={title}
            value={value}
            suffix={suffix}
            prefix={prefix}
            valueStyle={{ color }}
          />
          {trend && (
            <div
              style={{
                marginTop: 8,
                fontSize: 14,
                color: trend.isUp ? "#3f8600" : "#cf1322",
              }}
            >
              {trend.isUp ? "↑" : "↓"} {Math.abs(trend.value)}%
            </div>
          )}
        </div>
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: "50%",
            background: `${color}1a`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 24,
            color,
          }}
        >
          {icon}
        </div>
      </div>
    </Card>
  );
};
