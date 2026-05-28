import React, { useState } from "react";
import { Tabs, Card } from "antd";
import ServiceCategoryList from "./ServiceCategoryList";
import ServiceMerchantList from "./ServiceMerchantList";

export default function ServiceManagement({ token }: { token: string }) {
  const [activeTab, setActiveTab] = useState("categories");

  return (
    <div>
      <Card title="服务管理">
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: "categories",
              label: "服务分类",
              children: <ServiceCategoryList token={token} />,
            },
            {
              key: "merchants",
              label: "服务商家",
              children: <ServiceMerchantList token={token} />,
            },
          ]}
        />
      </Card>
    </div>
  );
}
