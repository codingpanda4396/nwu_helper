import React from "react";
import ReactECharts from "echarts-for-react";

interface PieChartProps {
  data: Array<{
    name: string;
    value: number;
    color?: string;
  }>;
  title?: string;
  height?: number;
  radius?: [string, string];
  showLabel?: boolean;
}

export const PieChart: React.FC<PieChartProps> = ({
  data,
  title,
  height = 400,
  radius = ["40%", "70%"],
  showLabel = true,
}) => {
  const option = {
    tooltip: {
      trigger: "item",
      formatter: "{a} <br/>{b}: {c} ({d}%)",
    },
    legend: {
      orient: "vertical",
      left: "left",
      bottom: 0,
    },
    series: [
      {
        name: title || "",
        type: "pie",
        radius,
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: "#fff",
          borderWidth: 2,
        },
        label: {
          show: showLabel,
          position: "center",
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 16,
            fontWeight: "bold",
          },
        },
        labelLine: {
          show: false,
        },
        data: data.map((item) => ({
          ...item,
          itemStyle: item.color ? { color: item.color } : undefined,
        })),
      },
    ],
  };

  return (
    <ReactECharts
      option={option}
      style={{ height: `${height}px`, width: "100%" }}
      opts={{ renderer: "canvas" }}
    />
  );
};
