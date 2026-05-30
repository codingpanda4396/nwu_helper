import React from "react";
import { Card } from "antd";
import ServiceCategoryList from "./ServiceCategoryList";

export default function ServiceManagement({ token }: { token: string }) {
  return (
    <div>
      <Card title="驾校分类管理">
        <ServiceCategoryList token={token} />
      </Card>
    </div>
  );
}
