import React from "react";
import { Tag, Steps, Tooltip } from "antd";
import {
  ClockCircleOutlined,
  CheckCircleOutlined,
  EyeInvisibleOutlined,
  CloseCircleOutlined,
  QuestionCircleOutlined,
} from "@ant-design/icons";

interface StatusStep {
  key: string;
  label: string;
  color: string;
  description?: string;
  icon?: React.ReactNode;
}

interface StatusFlowProps {
  current: string;
  steps: StatusStep[];
  size?: "default" | "small";
}

const defaultIcons: Record<string, React.ReactNode> = {
  PENDING: <ClockCircleOutlined />,
  VISIBLE: <CheckCircleOutlined />,
  ACTIVE: <CheckCircleOutlined />,
  APPROVED: <CheckCircleOutlined />,
  HIDDEN: <EyeInvisibleOutlined />,
  REJECTED: <CloseCircleOutlined />,
  SUSPENDED: <CloseCircleOutlined />,
  DRAFT: <ClockCircleOutlined />,
  PAUSED: <EyeInvisibleOutlined />,
  ENDED: <CloseCircleOutlined />,
};

const colorMap: Record<string, string> = {
  PENDING: "warning",
  VISIBLE: "success",
  ACTIVE: "success",
  APPROVED: "success",
  HIDDEN: "default",
  REJECTED: "error",
  SUSPENDED: "error",
  DRAFT: "default",
  PAUSED: "default",
  ENDED: "default",
};

export function StatusTag({ status, steps }: { status: string; steps?: StatusStep[] }) {
  const step = steps?.find((s) => s.key === status);
  const label = step?.label || status;
  const color = step?.color || colorMap[status] || "default";
  const icon = step?.icon || defaultIcons[status];

  return (
    <Tag color={color} icon={icon}>
      {label}
    </Tag>
  );
}

export default function StatusFlow({ current, steps, size = "small" }: StatusFlowProps) {
  const currentIndex = steps.findIndex((s) => s.key === current);

  return (
    <div style={{ padding: "16px 0" }}>
      <Steps
        size={size}
        current={currentIndex >= 0 ? currentIndex : 0}
        items={steps.map((step) => ({
          title: step.label,
          description: step.description ? (
            <Tooltip title={step.description}>
              <QuestionCircleOutlined style={{ marginLeft: 4, color: "#999" }} />
            </Tooltip>
          ) : undefined,
          icon: step.icon || defaultIcons[step.key] || undefined,
        }))}
      />
    </div>
  );
}

export const communityStatusSteps: StatusStep[] = [
  { key: "PENDING", label: "待审核", color: "warning", description: "等待管理员审核" },
  { key: "VISIBLE", label: "已通过", color: "success", description: "帖子已公开展示" },
  { key: "HIDDEN", label: "已隐藏", color: "default", description: "帖子已隐藏不展示" },
  { key: "REJECTED", label: "已拒绝", color: "error", description: "帖子审核未通过" },
];

export const merchantStatusSteps: StatusStep[] = [
  { key: "PENDING", label: "待审核", color: "warning", description: "等待管理员审核" },
  { key: "APPROVED", label: "已上架", color: "success", description: "商家已上架展示" },
  { key: "REJECTED", label: "已拒绝", color: "error", description: "商家审核未通过" },
  { key: "SUSPENDED", label: "已下架", color: "default", description: "商家已暂停展示" },
];

export const activityStatusSteps: StatusStep[] = [
  { key: "DRAFT", label: "草稿", color: "default", description: "活动草稿未发布" },
  { key: "ACTIVE", label: "进行中", color: "success", description: "活动已发布进行中" },
  { key: "PAUSED", label: "已暂停", color: "warning", description: "活动已暂停展示" },
  { key: "ENDED", label: "已结束", color: "default", description: "活动已结束" },
];

// ── 学业服务 status steps ──

export const teacherStatusSteps: StatusStep[] = [
  { key: "PENDING", label: "待审核", color: "warning", description: "等待管理员审核" },
  { key: "APPROVED", label: "已通过", color: "success", description: "教师已上线" },
  { key: "REJECTED", label: "已拒绝", color: "error", description: "教师审核未通过" },
];

export const reviewStatusSteps: StatusStep[] = [
  { key: "PENDING", label: "待审核", color: "warning", description: "等待管理员审核" },
  { key: "APPROVED", label: "已通过", color: "success", description: "评价已公开" },
  { key: "REJECTED", label: "已拒绝", color: "error", description: "评价审核未通过" },
  { key: "HIDDEN", label: "已隐藏", color: "default", description: "评价已隐藏" },
];

export const materialStatusSteps: StatusStep[] = [
  { key: "PENDING", label: "待审核", color: "warning", description: "等待管理员审核" },
  { key: "APPROVED", label: "已通过", color: "success", description: "资料已公开" },
  { key: "REJECTED", label: "已拒绝", color: "error", description: "资料审核未通过" },
  { key: "HIDDEN", label: "已隐藏", color: "default", description: "资料已隐藏" },
];
