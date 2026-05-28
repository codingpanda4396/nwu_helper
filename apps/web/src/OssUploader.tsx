import React, { useRef, useState } from "react";

interface OssUploaderProps {
  token: string;
  value?: string;
  onChange: (url: string) => void;
  accept?: string;
  className?: string;
  placeholder?: string;
}

export function OssUploader({
  token,
  value,
  onChange,
  accept = "image/jpeg,image/png,image/gif,image/webp",
  className = "",
  placeholder = "点击或拖拽上传图片"
}: OssUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const uploadFile = async (file: File) => {
    if (!token) {
      setError("请先登录");
      return;
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setError("文件大小不能超过5MB");
      return;
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setError("仅支持 JPG、PNG、GIF、WebP 格式");
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload/image", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });

      const body = await res.json().catch(() => ({}));
      if (!res.ok || body.success === false) {
        throw new Error(body.error?.message || "上传失败");
      }

      onChange(body.data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "上传失败");
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) uploadFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleRemove = () => {
    onChange("");
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  return (
    <div className={`oss-uploader ${className}`}>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        style={{ display: "none" }}
      />

      {value ? (
        <div className="oss-uploader-preview">
          <img src={value} alt="uploaded" />
          <div className="oss-uploader-actions">
            <button
              type="button"
              className="oss-btn oss-btn-change"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
            >
              更换
            </button>
            <button
              type="button"
              className="oss-btn oss-btn-remove"
              onClick={handleRemove}
              disabled={uploading}
            >
              删除
            </button>
          </div>
        </div>
      ) : (
        <div
          className={`oss-uploader-dropzone ${dragOver ? "drag-over" : ""} ${uploading ? "uploading" : ""}`}
          onClick={() => !uploading && inputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          {uploading ? (
            <div className="oss-uploader-loading">
              <div className="oss-spinner" />
              <span>上传中...</span>
            </div>
          ) : (
            <div className="oss-uploader-placeholder">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
              </svg>
              <span>{placeholder}</span>
            </div>
          )}
        </div>
      )}

      {error && <div className="oss-uploader-error">{error}</div>}

      <style>{`
        .oss-uploader {
          width: 100%;
        }

        .oss-uploader-dropzone {
          border: 2px dashed var(--line);
          border-radius: 8px;
          padding: 32px 16px;
          text-align: center;
          cursor: pointer;
          transition: all 0.2s;
          background: var(--panel);
        }

        .oss-uploader-dropzone:hover {
          border-color: var(--green);
          background: #f0fdf4;
        }

        .oss-uploader-dropzone.drag-over {
          border-color: var(--green);
          background: #f0fdf4;
          transform: scale(1.01);
        }

        .oss-uploader-dropzone.uploading {
          cursor: not-allowed;
          opacity: 0.7;
        }

        .oss-uploader-placeholder {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          color: var(--muted);
        }

        .oss-uploader-placeholder svg {
          opacity: 0.5;
        }

        .oss-uploader-loading {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          color: var(--green);
        }

        .oss-spinner {
          width: 20px;
          height: 20px;
          border: 2px solid var(--line);
          border-top-color: var(--green);
          border-radius: 50%;
          animation: oss-spin 0.8s linear infinite;
        }

        @keyframes oss-spin {
          to { transform: rotate(360deg); }
        }

        .oss-uploader-preview {
          position: relative;
          border-radius: 8px;
          overflow: hidden;
          border: 1px solid var(--line);
        }

        .oss-uploader-preview img {
          width: 100%;
          height: 200px;
          object-fit: cover;
          display: block;
        }

        .oss-uploader-actions {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          display: flex;
          gap: 8px;
          padding: 12px;
          background: linear-gradient(transparent, rgba(0,0,0,0.6));
        }

        .oss-btn {
          flex: 1;
          padding: 8px 12px;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 600;
          border: none;
          cursor: pointer;
          transition: all 0.2s;
        }

        .oss-btn-change {
          background: var(--green);
          color: white;
        }

        .oss-btn-change:hover {
          background: var(--green-dark);
        }

        .oss-btn-remove {
          background: rgba(255,255,255,0.2);
          color: white;
          backdrop-filter: blur(4px);
        }

        .oss-btn-remove:hover {
          background: rgba(255,255,255,0.3);
        }

        .oss-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .oss-uploader-error {
          margin-top: 8px;
          color: #ef4444;
          font-size: 13px;
        }
      `}</style>
    </div>
  );
}
