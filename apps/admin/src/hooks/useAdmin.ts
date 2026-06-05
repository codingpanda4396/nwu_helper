import { useState, useEffect, useCallback } from "react";

const API_BASE = import.meta.env.VITE_API_BASE ?? "";

type Dict = Record<string, any>;

function authHeaders(token: string) {
  return { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
}

export async function adminApi<T>(token: string, path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { ...authHeaders(token), ...(options.headers || {}) },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok || body.success === false) throw new Error(body.message || "请求失败");
  return body.data;
}

const DEFAULT_TOKEN = "default-admin-mock-token";
const DEFAULT_USER: Dict = { id: "admin-default", name: "平台管理员", phone: "18800000000", role: "ADMIN" };

export function useAdmin() {
  const [token, setToken] = useState(localStorage.getItem("adminToken") || DEFAULT_TOKEN);
  const [user, setUser] = useState<Dict | null>(() => {
    try {
      const saved = localStorage.getItem("adminUser");
      return saved ? JSON.parse(saved) : { ...DEFAULT_USER };
    } catch {
      return { ...DEFAULT_USER };
    }
  });

  const logout = useCallback(() => {
    // 重置为默认用户而非清空
    localStorage.setItem("adminToken", DEFAULT_TOKEN);
    localStorage.setItem("adminUser", JSON.stringify(DEFAULT_USER));
    setToken(DEFAULT_TOKEN);
    setUser({ ...DEFAULT_USER });
  }, []);

  const login = useCallback((newToken: string, newUser: Dict) => {
    localStorage.setItem("adminToken", newToken || DEFAULT_TOKEN);
    localStorage.setItem("adminUser", JSON.stringify(newUser || DEFAULT_USER));
    setToken(newToken || DEFAULT_TOKEN);
    setUser(newUser || DEFAULT_USER);
  }, []);

  // 登录功能已移除，始终已认证
  return { token, user, login, logout, isAuthenticated: true };
}

export function useAdminData<T>(token: string, path: string, deps: any[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  const reload = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const result = await adminApi<T>(token, path);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "加载失败");
    } finally {
      setLoading(false);
    }
  }, [token, path]);

  useEffect(() => {
    reload();
  }, [reload, ...deps]);

  return { data, loading, error, reload, setData };
}

export function toDateTimeLocal(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}

export function webImage(value?: string) {
  return value && /^(https?:|data:|\/api\/|\/assets\/)/.test(value) ? value : "";
}

export function readField(item: Dict, path: string) {
  return path.split(".").reduce<any>((current, part) => current?.[part], item);
}

export type { Dict };
