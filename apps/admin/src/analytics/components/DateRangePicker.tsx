import React from "react";
import { DatePicker, Space } from "antd";
import dayjs, { Dayjs } from "dayjs";

const { RangePicker } = DatePicker;

interface DateRangePickerProps {
  value: [Dayjs, Dayjs];
  onChange: (dates: [Dayjs, Dayjs]) => void;
  presets?: Array<{
    label: string;
    value: [Dayjs, Dayjs];
  }>;
}

const defaultPresets = [
  {
    label: "今天",
    value: [dayjs().startOf("day"), dayjs().endOf("day")] as [Dayjs, Dayjs],
  },
  {
    label: "最近7天",
    value: [dayjs().subtract(6, "day").startOf("day"), dayjs().endOf("day")] as [Dayjs, Dayjs],
  },
  {
    label: "最近30天",
    value: [dayjs().subtract(29, "day").startOf("day"), dayjs().endOf("day")] as [Dayjs, Dayjs],
  },
  {
    label: "本月",
    value: [dayjs().startOf("month"), dayjs().endOf("month")] as [Dayjs, Dayjs],
  },
  {
    label: "上月",
    value: [
      dayjs().subtract(1, "month").startOf("month"),
      dayjs().subtract(1, "month").endOf("month"),
    ] as [Dayjs, Dayjs],
  },
];

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  value,
  onChange,
  presets = defaultPresets,
}) => {
  return (
    <Space>
      <RangePicker
        value={value}
        onChange={(dates) => {
          if (dates && dates[0] && dates[1]) {
            onChange([dates[0], dates[1]]);
          }
        }}
        presets={presets}
        allowClear={false}
        style={{ width: 300 }}
      />
    </Space>
  );
};
