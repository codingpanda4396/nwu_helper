import React, { useState } from "react";
import { Steps, Button, Card, Space, message } from "antd";
import { LeftOutlined, RightOutlined, CheckOutlined } from "@ant-design/icons";

interface StepConfig {
  title: string;
  description?: string;
  content: React.ReactNode;
}

interface StepFormProps {
  steps: StepConfig[];
  onSubmit: () => Promise<void>;
  onCancel?: () => void;
  loading?: boolean;
  submitText?: string;
}

export default function StepForm({
  steps,
  onSubmit,
  onCancel,
  loading = false,
  submitText = "提交",
}: StepFormProps) {
  const [current, setCurrent] = useState(0);

  const isLast = current === steps.length - 1;
  const isFirst = current === 0;

  const next = () => {
    setCurrent((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const prev = () => {
    setCurrent((prev) => Math.max(prev - 1, 0));
  };

  const handleSubmit = async () => {
    try {
      await onSubmit();
      message.success("提交成功");
    } catch (err) {
      message.error(err instanceof Error ? err.message : "提交失败");
    }
  };

  return (
    <div>
      <Steps
        current={current}
        items={steps.map((step) => ({
          title: step.title,
          description: step.description,
        }))}
        style={{ marginBottom: 24 }}
      />

      <Card style={{ marginBottom: 24, minHeight: 200 }}>
        {steps[current].content}
      </Card>

      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div>
          {onCancel && (
            <Button onClick={onCancel} disabled={loading}>
              取消
            </Button>
          )}
        </div>
        <Space>
          {!isFirst && (
            <Button onClick={prev} icon={<LeftOutlined />} disabled={loading}>
              上一步
            </Button>
          )}
          {isLast ? (
            <Button
              type="primary"
              onClick={handleSubmit}
              loading={loading}
              icon={<CheckOutlined />}
            >
              {submitText}
            </Button>
          ) : (
            <Button type="primary" onClick={next} icon={<RightOutlined />}>
              下一步
            </Button>
          )}
        </Space>
      </div>
    </div>
  );
}
