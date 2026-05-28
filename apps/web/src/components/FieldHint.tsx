import React from "react";
import { Form, Tooltip, Input, InputNumber, Select, Checkbox, Upload, DatePicker } from "antd";
import { QuestionCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { OssUploader } from "../OssUploader";

interface FieldHintProps {
  label: string;
  required?: boolean;
  tooltip?: string;
  example?: string;
  children: React.ReactNode;
  name?: string;
  valuePropName?: string;
}

export default function FieldHint({
  label,
  required,
  tooltip,
  example,
  children,
  name,
  valuePropName,
}: FieldHintProps) {
  const labelContent = (
    <span>
      {label}
      {tooltip && (
        <Tooltip title={tooltip}>
          <QuestionCircleOutlined style={{ marginLeft: 4, color: "#999" }} />
        </Tooltip>
      )}
    </span>
  );

  return (
    <Form.Item
      name={name}
      label={labelContent}
      rules={required ? [{ required: true, message: `请填写${label}` }] : undefined}
      extra={example ? <span style={{ color: "#999" }}>例如：{example}</span> : undefined}
      valuePropName={valuePropName}
    >
      {children}
    </Form.Item>
  );
}

interface FormFieldProps {
  name: string;
  label: string;
  type?: string;
  tooltip?: string;
  example?: string;
  required?: boolean;
  options?: any[];
  placeholder?: string;
  token?: string;
  onChange?: (url: string) => void;
}

export function FormField({
  name,
  label,
  type = "text",
  tooltip,
  example,
  required,
  options,
  placeholder,
  token,
  onChange,
}: FormFieldProps) {
  const renderField = () => {
    switch (type) {
      case "select":
        return (
          <Select
            placeholder={placeholder || `请选择${label}`}
            allowClear
            options={(options || []).map((opt) =>
              typeof opt === "string"
                ? { label: opt, value: opt }
                : { label: opt.name || opt.title, value: opt.id }
            )}
          />
        );

      case "textarea":
        return (
          <Input.TextArea
            placeholder={placeholder || `请输入${label}`}
            rows={4}
          />
        );

      case "number":
        return (
          <InputNumber
            placeholder={placeholder || `请输入${label}`}
            style={{ width: "100%" }}
          />
        );

      case "checkbox":
        return <Checkbox>{label}</Checkbox>;

      case "image":
        return <OssUploader token={token || ""} onChange={onChange || (() => {})} />;

      case "datetime-local":
        return (
          <DatePicker
            showTime
            format="YYYY-MM-DD HH:mm"
            placeholder={placeholder || `请选择${label}`}
            style={{ width: "100%" }}
          />
        );

      default:
        return (
          <Input
            placeholder={placeholder || `请输入${label}`}
          />
        );
    }
  };

  return (
    <FieldHint
      name={name}
      label={label}
      required={required}
      tooltip={tooltip}
      example={example}
    >
      {renderField()}
    </FieldHint>
  );
}
