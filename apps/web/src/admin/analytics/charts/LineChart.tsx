import React from "react";
import ReactECharts from "echarts-for-react";

interface LineChartProps {
  data: {
    dates: string[];
    series: Array<{
      name: string;
      data: number[];
      color?: string;
    }>;
  };
  title?: string;
  height?: number;
  smooth?: boolean;
  areaStyle?: boolean;
}

export const LineChart: React.FC<LineChartProps> = ({
  data,
  title,
  height = 400,
  smooth = true,
  areaStyle = false,
}) => {
  const option = {
    tooltip: {
      trigger: "axis",
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
    xAxis: {
      type: "category",
      boundaryGap: false,
      data: data.dates,
    },
    yAxis: {
      type: "value",
    },
    series: data.series.map((s) => ({
      name: s.name,
      type: "line",
      smooth,
      data: s.data,
      itemStyle: { color: s.color },
      areaStyle: areaStyle ? {} : undefined,
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
