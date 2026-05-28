import React, { useState, useEffect } from "react";
import {
  Card,
  Button,
  Descriptions,
  Tag,
  Space,
  message,
  Spin,
  Alert,
  Typography,
  Divider,
} from "antd";
import {
  ArrowLeftOutlined,
  CheckOutlined,
  CloseOutlined,
  EyeInvisibleOutlined,
  UserOutlined,
  ClockCircleOutlined,
  LikeOutlined,
  EyeOutlined,
  MessageOutlined,
} from "@ant-design/icons";
import { useParams, useNavigate } from "react-router-dom";
import { adminApi } from "../hooks/useAdmin";
import StatusFlow, { StatusTag, communityStatusSteps } from "../components/StatusFlow";
import type { Dict } from "../hooks/useAdmin";

const { Title, Text, Paragraph } = Typography;

export default function CommunityDetail({ token }: { token: string }) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<Dict | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    adminApi<Dict>(token, `/api/admin/community-posts/${id}`)
      .then(setPost)
      .catch((err) => setError(err instanceof Error ? err.message : "加载失败"))
      .finally(() => setLoading(false));
  }, [token, id]);

  const handleStatusChange = async (status: string) => {
    if (!id) return;
    try {
      await adminApi(token, `/api/admin/community-posts/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      message.success("状态更新成功");
      setPost((prev) => (prev ? { ...prev, status } : null));
    } catch (err) {
      message.error(err instanceof Error ? err.message : "操作失败");
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: 100 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return <Alert type="error" message="加载失败" description={error} showIcon />;
  }

  if (!post) {
    return <Alert type="warning" message="帖子不存在" showIcon />;
  }

  return (
    <div>
      <Button
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate("/admin/community")}
        style={{ marginBottom: 16 }}
      >
        返回列表
      </Button>

      <Card title="帖子详情" style={{ marginBottom: 16 }}>
        <StatusFlow current={post.status} steps={communityStatusSteps} />

        <Divider />

        <Descriptions column={2} bordered>
          <Descriptions.Item label="标题" span={2}>
            {post.title}
          </Descriptions.Item>
          <Descriptions.Item label="作者">
            <Space>
              <UserOutlined />
              {post.authorNickname || "匿名同学"}
            </Space>
          </Descriptions.Item>
          <Descriptions.Item label="类型">
            <Tag>{post.type}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="当前状态">
            <StatusTag status={post.status} steps={communityStatusSteps} />
          </Descriptions.Item>
          <Descriptions.Item label="来源">{post.source || "学生投稿"}</Descriptions.Item>
          <Descriptions.Item label="联系方式" span={2}>
            {post.contact || "未填写"}
          </Descriptions.Item>
        </Descriptions>

        <Divider>帖子内容</Divider>

        <Card type="inner">
          <Paragraph style={{ whiteSpace: "pre-wrap", minHeight: 100 }}>
            {post.content || post.summary || "无内容"}
          </Paragraph>
        </Card>

        <Divider>统计数据</Divider>

        <Space size="large">
          <Space>
            <LikeOutlined />
            <Text>{post.likeCount ?? 0} 点赞</Text>
          </Space>
          <Space>
            <MessageOutlined />
            <Text>{post.commentCount ?? 0} 评论</Text>
          </Space>
          <Space>
            <EyeOutlined />
            <Text>{post.viewCount ?? 0} 浏览</Text>
          </Space>
        </Space>
      </Card>

      <Card title="审核操作">
        <Space size="middle">
          {post.status === "PENDING" && (
            <>
              <Button
                type="primary"
                icon={<CheckOutlined />}
                onClick={() => handleStatusChange("VISIBLE")}
              >
                通过并公开
              </Button>
              <Button
                danger
                icon={<CloseOutlined />}
                onClick={() => handleStatusChange("REJECTED")}
              >
                拒绝
              </Button>
            </>
          )}
          {post.status === "VISIBLE" && (
            <Button
              icon={<EyeInvisibleOutlined />}
              onClick={() => handleStatusChange("HIDDEN")}
            >
              隐藏帖子
            </Button>
          )}
          {post.status === "HIDDEN" && (
            <Button
              type="primary"
              icon={<CheckOutlined />}
              onClick={() => handleStatusChange("VISIBLE")}
            >
              恢复显示
            </Button>
          )}
          {post.status === "REJECTED" && (
            <Button
              type="primary"
              icon={<CheckOutlined />}
              onClick={() => handleStatusChange("VISIBLE")}
            >
              重新通过
            </Button>
          )}
        </Space>
      </Card>
    </div>
  );
}
