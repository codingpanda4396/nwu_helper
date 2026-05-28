import React from "react";
import { Button, message } from "antd";
import { DownloadOutlined } from "@ant-design/icons";
import ExcelJS from "exceljs";

interface ExportColumn {
  title: string;
  dataIndex: string;
  width?: number;
}

interface ExportButtonProps {
  type: string;
  data: any[];
  columns: ExportColumn[];
  filename?: string;
  params?: Record<string, any>;
}

export const ExportButton: React.FC<ExportButtonProps> = ({
  type,
  data,
  columns,
  filename,
  params = {},
}) => {
  const handleExport = async () => {
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("数据");

      worksheet.addRow(columns.map((col) => col.title));

      data.forEach((row) => {
        worksheet.addRow(columns.map((col) => row[col.dataIndex]));
      });

      columns.forEach((col, index) => {
        worksheet.getColumn(index + 1).width = col.width || 15;
      });

      worksheet.getRow(1).font = { bold: true };

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename || `${type}_${new Date().toISOString().split("T")[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      message.success("导出成功");
    } catch (error) {
      message.error("导出失败");
    }
  };

  return (
    <Button icon={<DownloadOutlined />} onClick={handleExport}>
      导出Excel
    </Button>
  );
};
