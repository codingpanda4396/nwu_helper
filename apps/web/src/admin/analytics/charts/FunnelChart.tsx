import React from "react";
import ReactECharts from "echarts-for-react";

interface FunnelChartProps {
  data: Array<{
    name: string;
    value: number;
    rate?: number;
  }>;
  title?: string;
  height?: number;
}

export const FunnelChart: React.FC<FunnelChartProps> = ({
  data,
  title,
  height = 400,
}) => {
  const option = {
    tooltip: {
      trigger: "item",
      formatter: "{a} <br/>{b}: {c} ({d}%)",
    },
    legend: {
      bottom: 0,
    },
    series: [
      {
        name: title || "转化漏斗",
        type: "funnel",
        left: "10%",
        top: 20,
        bottom: 40,
        width: "80%",
        min: 0,
        max: 100,
        minSize: "0%",
        maxSize: "100%",
        sort: "descending",
        gap: 2,
        label: {
          show: true,
          position: "inside",
          formatter: (params: any) => {
            const item = data[params.dataIndex];
            return `${params.name}\n${params.value}${item?.rate ? ` (${(item.rate * 100).toFixed(1)}%)` : ""}`;
          },
        },
        labelLine: {
          length: 10,
          lineStyle: {
            width: 1,
            type: "solid",
          },
        },
        itemStyle: {
          borderColor: "#fff",
          borderWidth: 1,
        },
        emphasis: {
          label: {
            fontSize: 14,
          },
        },
        data: data.map((item, index) => ({
          name: item.name,
          value: item.value,
          itemStyle: {
            color: [
              "#1890ff",
              "#52c41a",
              "#faad14",
              "#f5222d",
              "#722ed1",
              "#13c2c2",
            ][index % 6],
          },
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
