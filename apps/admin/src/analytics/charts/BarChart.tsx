import React from "react";
import ReactECharts from "echarts-for-react";

interface BarChartProps {
  data: {
    categories: string[];
    series: Array<{
      name: string;
      data: number[];
      color?: string;
    }>;
  };
  title?: string;
  height?: number;
  horizontal?: boolean;
  stacked?: boolean;
}

export const BarChart: React.FC<BarChartProps> = ({
  data,
  title,
  height = 400,
  horizontal = false,
  stacked = false,
}) => {
  const option = {
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "shadow",
      },
    },
    legend: {
      data: data.series.map((s) => s.name),
      bottom: 0,
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "10%",
      top: "5%",
      containLabel: true,
    },
    xAxis: horizontal
      ? { type: "value" }
      : {
          type: "category",
          data: data.categories,
        },
    yAxis: horizontal
      ? {
          type: "category",
          data: data.categories,
        }
      : { type: "value" },
    series: data.series.map((s) => ({
      name: s.name,
      type: "bar",
      stack: stacked ? "total" : undefined,
      data: s.data,
      itemStyle: { color: s.color },
    })),
  };

  return (
    <ReactECharts
      option={option}
      style={{ height: `${height}px`, width: "100%" }}
      opts={{ renderer: "canvas" }}
    />
  );
};
