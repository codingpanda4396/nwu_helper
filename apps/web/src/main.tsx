import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { BarChart3, Check, ClipboardCheck, Clock, Download, LogOut, Phone, Plus, RefreshCw, Search, Settings, Store, Ticket, Utensils } from "lucide-react";
import type { ApiResponse } from "@nwu-helper/shared";
import "./styles.css";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "";

type Category = { id: string; name: string; slug: string; sortOrder: number };
type Coupon = { id: string; title: string; description?: string; threshold?: string | null; discountValue?: string | null; totalStock: number; remainingStock: number; validTo: string; status: string };
type Merchant = {
  id: string;
  name: string;
  summary?: string;
  description?: string;
  address: string;
  phone?: string;
  businessHours?: string;
  coverImageUrl?: string;
  status: string;
  rating: string;
  sortOrder: number;
  platformBoost: number;
  category: Category;
  coupons: Coupon[];
};
type User = { id: string; name: string; phone?: string; role: "STUDENT" | "MERCHANT" | "ADMIN"; merchantId?: string };

function getToken() {
  return localStorage.getItem("token");
}

async function api<T>(path: string, options: RequestInit = {}) {
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");
  const token = getToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const payload = (await res.json()) as ApiResponse<T>;
  if (!payload.success) throw new Error(payload.error.message);
  return payload.data;
}

type Attribution = { source?: string; channel?: string; scene?: string; campaign?: string };

function getAttribution(): Attribution {
  const keys = ["source", "channel", "scene", "campaign"] as const;
  const params = new URLSearchParams(window.location.search);
  const stored = JSON.parse(sessionStorage.getItem("attribution") ?? "{}") as Attribution;
  const attribution: Attribution = { ...stored };
  let changed = false;
  for (const key of keys) {
    const value = params.get(key);
    if (value) {
      attribution[key] = value;
      changed = true;
    }
  }
  if (changed) sessionStorage.setItem("attribution", JSON.stringify(attribution));
  return attribution;
}

function pct(value: unknown) {
  return `${(Number(value ?? 0) * 100).toFixed(1)}%`;
}

function App() {
  const path = window.location.pathname;
  if (path.startsWith("/merchant")) return <MerchantPortal />;
  if (path.startsWith("/admin")) return <AdminPortal />;
  return <StudentApp />;
}

function StudentApp() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState("");
  const [keyword, setKeyword] = useState("");
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [selected, setSelected] = useState<Merchant | null>(null);
  const [claiming, setClaiming] = useState<string | null>(null);
  const sessionId = useMemo(() => localStorage.getItem("sessionId") ?? crypto.randomUUID(), []);
  const attribution = useMemo(() => getAttribution(), []);

  useEffect(() => {
    localStorage.setItem("sessionId", sessionId);
    api<Category[]>("/api/public/categories").then(setCategories);
  }, [sessionId]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (categoryId) params.set("categoryId", categoryId);
    if (keyword) params.set("keyword", keyword);
    api<{ items: Merchant[] }>(`/api/public/merchants?${params.toString()}`).then((data) => {
      setMerchants(data.items);
      data.items.forEach((merchant) => {
        void api("/api/public/exposures", { method: "POST", body: JSON.stringify({ merchantId: merchant.id, sessionId, source: "student-list", ...attribution }) });
      });
    });
  }, [attribution, categoryId, keyword, sessionId]);

  async function openMerchant(id: string) {
    await api("/api/public/clicks", { method: "POST", body: JSON.stringify({ merchantId: id, sessionId, target: "detail", ...attribution }) });
    setSelected(await api<Merchant>(`/api/public/merchants/${id}`));
  }

  async function claim(couponId: string) {
    const phone = window.prompt("输入手机号领取优惠券");
    if (!phone) return;
    const studentName = window.prompt("输入昵称", "西大学生") ?? "西大学生";
    setClaiming(couponId);
    try {
      const result = await api<any>(`/api/public/coupons/${couponId}/claim`, { method: "POST", body: JSON.stringify({ phone, studentName, sessionId, ...attribution }) });
      window.alert(`领取成功，核销码：${result.code}`);
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "领取失败");
    } finally {
      setClaiming(null);
    }
  }

  return (
    <main className="student-shell">
      <section className="student-hero">
        <div>
          <p className="eyebrow">西大圈</p>
          <h1>校门口吃喝玩乐优惠</h1>
          <p>找附近靠谱商家，领学生专属券，到店出示核销码即可使用。</p>
        </div>
      </section>
      <section className="student-content">
        <div className="searchbar"><Search size={18} /><input placeholder="搜索美食、打印、驾校" value={keyword} onChange={(event) => setKeyword(event.target.value)} /></div>
        <div className="category-tabs">
          <button className={!categoryId ? "active" : ""} onClick={() => setCategoryId("")}>全部</button>
          {categories.map((category) => <button key={category.id} className={categoryId === category.id ? "active" : ""} onClick={() => setCategoryId(category.id)}>{category.name}</button>)}
        </div>
        <div className="merchant-list">
          {merchants.map((merchant) => (
            <button className="merchant-row" key={merchant.id} onClick={() => openMerchant(merchant.id)}>
              <img src={merchant.coverImageUrl} alt="" />
              <span><strong>{merchant.name}</strong><small>{merchant.category.name} · {merchant.rating} 分 · {merchant.summary}</small><b>{merchant.coupons[0]?.title ?? "进店看看"}</b></span>
            </button>
          ))}
        </div>
      </section>
      {selected && <div className="drawer-backdrop" onClick={() => setSelected(null)}><section className="merchant-drawer" onClick={(event) => event.stopPropagation()}>
        <img src={selected.coverImageUrl} alt="" className="cover" />
        <div className="drawer-body">
          <h2>{selected.name}</h2>
          <p>{selected.description ?? selected.summary}</p>
          <p><Store size={16} />{selected.address}</p>
          <p><Clock size={16} />{selected.businessHours ?? "营业时间以门店为准"}</p>
          <p><Phone size={16} />{selected.phone ?? "暂无电话"}</p>
          <h3>可领取优惠</h3>
          {selected.coupons.map((coupon) => (
            <article className="coupon" key={coupon.id}>
              <span><strong>{coupon.title}</strong><small>{coupon.description}</small></span>
              <button className="primary" disabled={claiming === coupon.id || coupon.remainingStock <= 0 || coupon.status !== "ACTIVE"} onClick={() => claim(coupon.id)}>
                <Ticket size={16} />{coupon.remainingStock <= 0 ? "已领完" : "领取"}
              </button>
            </article>
          ))}
        </div>
      </section></div>}
    </main>
  );
}

function MerchantPortal() {
  return <Authed requiredRole="MERCHANT" title="商家后台" defaultPhone="18800000011" defaultPassword="merchant123456"><MerchantDashboard /></Authed>;
}

function AdminPortal() {
  return <Authed requiredRole="ADMIN" title="平台管理后台" defaultPhone="18800000000" defaultPassword="admin123456"><AdminDashboard /></Authed>;
}

function Authed({ children, requiredRole, title, defaultPhone, defaultPassword }: { children: React.ReactNode; requiredRole: User["role"]; title: string; defaultPhone: string; defaultPassword: string }) {
  const [user, setUser] = useState<User | null>(null);
  const [checked, setChecked] = useState(false);
  useEffect(() => {
    if (!getToken()) {
      setChecked(true);
      return;
    }
    api<User>("/api/users/me").then(setUser).finally(() => setChecked(true));
  }, []);
  if (!checked) return <main className="center-page">加载中...</main>;
  if (!user || user.role !== requiredRole) return <Login title={title} defaultPhone={defaultPhone} defaultPassword={defaultPassword} onLogin={setUser} />;
  return <>{children}</>;
}

function Login({ title, defaultPhone, defaultPassword, onLogin }: { title: string; defaultPhone: string; defaultPassword: string; onLogin: (user: User) => void }) {
  const [phone, setPhone] = useState(defaultPhone);
  const [password, setPassword] = useState(defaultPassword);
  const [error, setError] = useState("");
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    try {
      const data = await api<{ token: string; user: User }>("/api/auth/login", { method: "POST", body: JSON.stringify({ phone, password }) });
      localStorage.setItem("token", data.token);
      onLogin(data.user);
    } catch (err) {
      setError(err instanceof Error ? err.message : "登录失败");
    }
  }
  return <main className="center-page"><form className="login-panel" onSubmit={submit}><h1>{title}</h1><label>手机号<input value={phone} onChange={(e) => setPhone(e.target.value)} /></label><label>密码<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} /></label>{error && <p className="error">{error}</p>}<button className="primary">登录</button></form></main>;
}

function MerchantDashboard() {
  const [overview, setOverview] = useState<any>(null);
  const [claims, setClaims] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [sourceRows, setSourceRows] = useState<any[]>([]);
  const [couponRows, setCouponRows] = useState<any[]>([]);
  const [trendRows, setTrendRows] = useState<any[]>([]);
  const [code, setCode] = useState("");
  const [amount, setAmount] = useState("");
  const [preview, setPreview] = useState<any>(null);
  const [range, setRange] = useState("30d");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const analyticsQuery = () => {
    const params = new URLSearchParams();
    params.set("range", range);
    if (range === "custom") {
      if (startDate) params.set("startDate", startDate);
      if (endDate) params.set("endDate", endDate);
    }
    return params.toString();
  };
  const refresh = () => {
    const query = analyticsQuery();
    api("/api/merchant/overview").then(setOverview);
    api<any[]>("/api/merchant/claims").then(setClaims);
    api(`/api/merchant/analytics/summary?${query}`).then(setSummary);
    api<any[]>(`/api/merchant/analytics/by-source?${query}`).then(setSourceRows);
    api<any[]>(`/api/merchant/coupon-performance?${query}`).then(setCouponRows);
    api<any[]>(`/api/merchant/trends?${query}`).then(setTrendRows);
  };
  useEffect(() => {
    void refresh();
  }, [range, startDate, endDate]);
  async function lookupCode() {
    setPreview(await api(`/api/merchant/redeem/preview?code=${encodeURIComponent(code)}`));
  }
  async function redeem() {
    await api("/api/merchant/redeem", { method: "POST", body: JSON.stringify({ code, amount: amount ? Number(amount) : undefined }) });
    setCode("");
    setAmount("");
    setPreview(null);
    refresh();
  }
  return <Shell brand="西大圈商家" nav={<Logout />}>
    <Header title={overview?.merchant?.name ?? "商家后台"} action={<button className="icon-button" onClick={refresh}><RefreshCw size={18} /></button>} />
    <section className="work-panel"><div className="form-row two"><select value={range} onChange={(e) => setRange(e.target.value)}><option value="today">今日</option><option value="7d">近 7 天</option><option value="30d">近 30 天</option><option value="custom">自定义</option></select><input type="date" disabled={range !== "custom"} value={startDate} onChange={(e) => setStartDate(e.target.value)} /><input type="date" disabled={range !== "custom"} value={endDate} onChange={(e) => setEndDate(e.target.value)} /></div></section>
    <MetricGrid data={[["曝光", summary?.exposureCount ?? 0], ["点击", summary?.clickCount ?? 0], ["领取", summary?.claimCount ?? 0], ["核销", summary?.redemptionCount ?? 0], ["点击率", pct(summary?.clickRate)], ["核销率", pct(summary?.redemptionRate)], ["核销金额", `¥${overview?.stats.redemptionAmount ?? 0}`]]} />
    <section className="work-panel"><h2>核销优惠券</h2><div className="form-row two"><input placeholder="输入核销码" value={code} onChange={(e) => { setCode(e.target.value.toUpperCase()); setPreview(null); }} /><input placeholder="消费金额，可选" value={amount} onChange={(e) => setAmount(e.target.value)} /><button className="primary" disabled={!code} onClick={lookupCode}><Search size={16} />查询</button></div>
      {preview && <div className="preview-panel"><strong>{preview.couponTitle}</strong><span>手机号：{preview.maskedPhone ?? "-"}</span><span>领取：{formatCell(preview.claimedAt)}</span><span>有效期至：{formatCell(preview.validTo)}</span><span>状态：{preview.isRedeemed ? "已核销" : preview.isExpired ? "已过期" : "可核销"}</span><span>来源：{preview.source ?? "unknown"} / {preview.channel ?? "unknown"}</span><button className="primary" disabled={preview.isRedeemed || preview.isExpired} onClick={redeem}><ClipboardCheck size={16} />确认核销</button></div>}
    </section>
    <Table title="渠道转化" rows={sourceRows} columns={["source", "channel", "exposureCount", "clickCount", "claimCount", "redemptionCount", "clickRate", "redemptionRate"]} />
    <Table title="优惠券效果" rows={couponRows} columns={["couponTitle", "exposureCount", "clickCount", "claimCount", "redemptionCount", "clickRate", "redemptionRate"]} />
    <Table title="趋势" rows={trendRows} columns={["date", "exposureCount", "clickCount", "claimCount", "redemptionCount"]} />
    <Table title="领券记录" rows={claims} columns={["user.name", "user.phone", "coupon.title", "code", "status", "claimedAt"]} />
  </Shell>;
}

function AdminDashboard() {
  const [tab, setTab] = useState("overview");
  return <Shell brand="西大圈平台" nav={<><Nav id="overview" tab={tab} setTab={setTab} icon={<BarChart3 />} label="看板" /><Nav id="merchants" tab={tab} setTab={setTab} icon={<Store />} label="商家" /><Nav id="coupons" tab={tab} setTab={setTab} icon={<Ticket />} label="优惠券" /><Nav id="promotions" tab={tab} setTab={setTab} icon={<ClipboardCheck />} label="推广" /><Nav id="categories" tab={tab} setTab={setTab} icon={<Settings />} label="类目" /><Logout /></>}>
    {tab === "overview" && <AdminOverview />}
    {tab === "merchants" && <MerchantAdmin />}
    {tab === "coupons" && <CouponAdmin />}
    {tab === "promotions" && <PromotionAdmin />}
    {tab === "categories" && <CategoryAdmin />}
  </Shell>;
}

function AdminOverview() {
  const [data, setData] = useState<any>(null);
  const [rows, setRows] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [sourceRows, setSourceRows] = useState<any[]>([]);
  useEffect(() => {
    api("/api/admin/dashboard/overview").then(setData);
    api<any[]>("/api/admin/dashboard/merchants").then(setRows);
    api("/api/admin/analytics/summary").then(setSummary);
    api<any[]>("/api/admin/analytics/by-source").then(setSourceRows);
  }, []);
  async function exportCsv() {
    const token = getToken();
    const res = await fetch(`${API_BASE}/api/admin/analytics/export.csv`, { headers: token ? { Authorization: `Bearer ${token}` } : undefined });
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "analytics-export.csv";
    link.click();
    URL.revokeObjectURL(url);
  }
  return <><Header title="平台总览" action={<button className="primary" onClick={exportCsv}><Download size={16} />导出 CSV</button>} /><MetricGrid data={[["商家数", data?.merchantCount ?? 0], ["已上架", data?.approvedMerchantCount ?? 0], ["优惠券", data?.couponCount ?? 0], ["曝光", summary?.exposureCount ?? 0], ["点击", summary?.clickCount ?? 0], ["领取", summary?.claimCount ?? 0], ["核销", summary?.redemptionCount ?? 0], ["点击率", pct(summary?.clickRate)], ["核销率", pct(summary?.redemptionRate)]]} /><Table title="source/channel 转化" rows={sourceRows} columns={["source", "channel", "exposureCount", "clickCount", "claimCount", "redemptionCount", "clickRate", "redemptionRate"]} /><Table title="商家转化" rows={rows} columns={["name", "category", "status", "exposures", "clicks", "claims", "redemptions", "redemptionAmount"]} /></>;
}

function MerchantAdmin() {
  const [items, setItems] = useState<Merchant[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState({ name: "", categoryId: "", address: "", summary: "", phone: "", sortOrder: 100, platformBoost: 0 });
  const refresh = () => api<{ items: Merchant[] }>("/api/admin/merchants?pageSize=100").then((data) => setItems(data.items));
  useEffect(() => { refresh(); api<Category[]>("/api/admin/categories").then(setCategories); }, []);
  async function create() {
    await api("/api/admin/merchants", { method: "POST", body: JSON.stringify({ ...form, status: "APPROVED", rating: 4.8 }) });
    setForm({ name: "", categoryId: "", address: "", summary: "", phone: "", sortOrder: 100, platformBoost: 0 });
    refresh();
  }
  return <><Header title="商家管理" /><section className="work-panel"><div className="form-row"><input placeholder="店铺名" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /><select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}><option value="">类目</option>{categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select><input placeholder="地址" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /><input placeholder="一句话介绍" value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} /><button className="primary" onClick={create} disabled={!form.name || !form.categoryId || !form.address}><Plus size={16} />新增</button></div></section><Table title="商家列表" rows={items} columns={["name", "category.name", "status", "rating", "platformBoost", "sortOrder", "phone"]} /></>;
}

function CouponAdmin() {
  const [items, setItems] = useState<any[]>([]);
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [form, setForm] = useState({ merchantId: "", title: "", description: "", totalStock: 100, validTo: "2026-12-31" });
  const refresh = () => api<any[]>("/api/admin/coupons").then(setItems);
  useEffect(() => { refresh(); api<{ items: Merchant[] }>("/api/admin/merchants?pageSize=100").then((data) => setMerchants(data.items)); }, []);
  async function create() {
    await api("/api/admin/coupons", { method: "POST", body: JSON.stringify({ ...form, validTo: new Date(form.validTo).toISOString() }) });
    setForm({ merchantId: "", title: "", description: "", totalStock: 100, validTo: "2026-12-31" });
    refresh();
  }
  return <><Header title="优惠券管理" /><section className="work-panel"><div className="form-row"><select value={form.merchantId} onChange={(e) => setForm({ ...form, merchantId: e.target.value })}><option value="">商家</option>{merchants.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}</select><input placeholder="优惠标题" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /><input placeholder="说明" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /><input type="number" value={form.totalStock} onChange={(e) => setForm({ ...form, totalStock: Number(e.target.value) })} /><button className="primary" onClick={create} disabled={!form.merchantId || !form.title}><Plus size={16} />新增</button></div></section><Table title="优惠券列表" rows={items} columns={["merchant.name", "title", "status", "totalStock", "remainingStock", "validTo"]} /></>;
}

function PromotionAdmin() {
  const [items, setItems] = useState<any[]>([]);
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [form, setForm] = useState({ merchantId: "", couponId: "", name: "", boostWeight: 10, pricingMode: "MANUAL", startAt: "2026-05-19", endAt: "2026-06-18", budget: "" });
  const refresh = () => api<any[]>("/api/admin/promotions").then(setItems);
  useEffect(() => {
    refresh();
    api<{ items: Merchant[] }>("/api/admin/merchants?pageSize=100").then((data) => setMerchants(data.items));
    api<any[]>("/api/admin/coupons").then(setCoupons);
  }, []);
  async function create() {
    await api("/api/admin/promotions", { method: "POST", body: JSON.stringify({ ...form, source: "CAMPAIGN", startAt: new Date(form.startAt).toISOString(), endAt: new Date(form.endAt).toISOString(), budget: form.budget ? Number(form.budget) : undefined, couponId: form.couponId || undefined }) });
    setForm({ merchantId: "", couponId: "", name: "", boostWeight: 10, pricingMode: "MANUAL", startAt: "2026-05-19", endAt: "2026-06-18", budget: "" });
    refresh();
  }
  async function toggle(item: any) {
    await api(`/api/admin/promotions/${item.id}/status`, { method: "PATCH", body: JSON.stringify({ isActive: !item.isActive }) });
    refresh();
  }
  return <><Header title="推广活动" /><section className="work-panel"><div className="form-row"><select value={form.merchantId} onChange={(e) => setForm({ ...form, merchantId: e.target.value })}><option value="">商家</option>{merchants.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}</select><select value={form.couponId} onChange={(e) => setForm({ ...form, couponId: e.target.value })}><option value="">不限优惠券</option>{coupons.filter((c) => !form.merchantId || c.merchantId === form.merchantId).map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}</select><input placeholder="活动名" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /><input type="number" placeholder="权重" value={form.boostWeight} onChange={(e) => setForm({ ...form, boostWeight: Number(e.target.value) })} /><select value={form.pricingMode} onChange={(e) => setForm({ ...form, pricingMode: e.target.value })}><option value="MANUAL">MANUAL</option><option value="CPC">CPC</option><option value="CPA">CPA</option></select><input type="date" value={form.startAt} onChange={(e) => setForm({ ...form, startAt: e.target.value })} /><input type="date" value={form.endAt} onChange={(e) => setForm({ ...form, endAt: e.target.value })} /><input placeholder="预算，可选" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} /><button className="primary" onClick={create} disabled={!form.merchantId || !form.name}><Plus size={16} />新增</button></div></section><div className="table-wrap"><h2>活动列表</h2><table><thead><tr>{["商家", "优惠券", "活动", "模式", "权重", "开始", "结束", "状态", "操作"].map((col) => <th key={col}>{col}</th>)}</tr></thead><tbody>{items.map((item) => <tr key={item.id}><td>{item.merchant?.name}</td><td>{item.coupon?.title ?? "不限"}</td><td>{item.name}</td><td>{item.pricingMode}</td><td>{item.boostWeight}</td><td>{formatCell(item.startAt)}</td><td>{formatCell(item.endAt)}</td><td>{item.isActive ? "启用" : "停用"}</td><td><button className="icon-button" onClick={() => toggle(item)}>{item.isActive ? "停用" : "启用"}</button></td></tr>)}</tbody></table></div></>;
}

function CategoryAdmin() {
  const [items, setItems] = useState<Category[]>([]);
  const [form, setForm] = useState({ name: "", slug: "", sortOrder: 100 });
  const refresh = () => api<Category[]>("/api/admin/categories").then(setItems);
  useEffect(() => {
    void refresh();
  }, []);
  async function create() {
    await api("/api/admin/categories", { method: "POST", body: JSON.stringify(form) });
    setForm({ name: "", slug: "", sortOrder: 100 });
    refresh();
  }
  return <><Header title="类目管理" /><section className="work-panel"><div className="form-row two"><input placeholder="类目名" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /><input placeholder="slug" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} /><button className="primary" onClick={create} disabled={!form.name || !form.slug}><Plus size={16} />新增</button></div></section><Table title="类目列表" rows={items} columns={["name", "slug", "sortOrder", "isActive"]} /></>;
}

function Shell({ brand, nav, children }: { brand: string; nav: React.ReactNode; children: React.ReactNode }) {
  return <div className="app-shell"><aside><div className="brand"><Utensils size={22} />{brand}</div>{nav}</aside><main className="admin-main">{children}</main></div>;
}

function Nav({ id, tab, setTab, icon, label }: { id: string; tab: string; setTab: (tab: string) => void; icon: React.ReactNode; label: string }) {
  return <button className={`nav-button ${tab === id ? "active" : ""}`} onClick={() => setTab(id)}>{icon}{label}</button>;
}

function Logout() {
  return <button className="nav-button" onClick={() => { localStorage.removeItem("token"); location.reload(); }}><LogOut />退出</button>;
}

function Header({ title, action }: { title: string; action?: React.ReactNode }) {
  return <div className="header"><h1>{title}</h1>{action}</div>;
}

function MetricGrid({ data }: { data: Array<[string, React.ReactNode]> }) {
  return <div className="metric-grid">{data.map(([label, value]) => <article className="metric" key={label}><span>{label}</span><strong>{value}</strong></article>)}</div>;
}

function Table({ title, rows, columns }: { title: string; rows: any[]; columns: string[] }) {
  const get = (row: any, key: string) => key.split(".").reduce((acc, part) => acc?.[part], row);
  return <div className="table-wrap"><h2>{title}</h2><table><thead><tr>{columns.map((col) => <th key={col}>{col}</th>)}</tr></thead><tbody>{rows.map((row, index) => <tr key={row.id ?? index}>{columns.map((col) => <td key={col}>{formatCell(get(row, col))}</td>)}</tr>)}</tbody></table></div>;
}

function formatCell(value: unknown) {
  if (typeof value === "boolean") return value ? <Check size={16} /> : "";
  if (typeof value === "string" && value.includes("T")) return value.slice(0, 10);
  return String(value ?? "");
}

createRoot(document.getElementById("root")!).render(<App />);
