import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { ArrowUpRight, BarChart3, Check, ClipboardCheck, Clock, Copy, Download, Edit3, LogOut, MapPin, Package, Phone, Plus, RefreshCw, Save, Search, Settings, ShieldCheck, Sparkles, Star, Store, Ticket, Users, Utensils } from "lucide-react";
import type { ActivityPricingMode, ActivityStatus, ActivityType, ApiResponse } from "@nwu-helper/shared";
import "./styles.css";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "";

type Category = { id: string; name: string; slug: string; sortOrder: number };
type Coupon = { id: string; merchantId?: string; title: string; description?: string; threshold?: string | number | null; discountValue?: string | number | null; totalStock: number; remainingStock: number; validFrom?: string; validTo: string; status: string };
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
type User = { id: string; name: string; username?: string; phone?: string; role: "STUDENT" | "MERCHANT" | "ADMIN"; merchantId?: string };
type Activity = {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  type: ActivityType;
  merchantId: string;
  couponId?: string | null;
  coverImage?: string;
  startAt: string;
  endAt: string;
  manualWeight: number;
  sortOrder: number;
  pricingMode: ActivityPricingMode;
  status: ActivityStatus;
  merchant: Merchant;
  coupon?: Coupon | null;
};
type HomeActivities = { dailyDeals: Activity[]; femaleSelected: Activity[]; groupDeals: Activity[]; general: Activity[] };
type ShareLink = { id: string; token: string; url: string; source?: string; channel?: string; scene?: string; campaign?: string; referrerId?: string };

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

type Attribution = { source?: string; channel?: string; scene?: string; campaign?: string; activityId?: string; shareLinkId?: string; referrerId?: string };

function getAttribution(): Attribution {
  const keys = ["source", "channel", "scene", "campaign", "activityId", "shareLinkId", "referrerId"] as const;
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
  const [homeActivities, setHomeActivities] = useState<HomeActivities>({ dailyDeals: [], femaleSelected: [], groupDeals: [], general: [] });
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [claiming, setClaiming] = useState<string | null>(null);
  const [claimForm, setClaimForm] = useState({ phone: "", studentName: "" });
  const [claimResult, setClaimResult] = useState<any>(null);
  const [shareLink, setShareLink] = useState("");
  const sessionId = useMemo(() => localStorage.getItem("sessionId") ?? crypto.randomUUID(), []);
  const [attribution, setAttribution] = useState<Attribution>(() => getAttribution());

  useEffect(() => {
    localStorage.setItem("sessionId", sessionId);
    api<Category[]>("/api/public/categories").then(setCategories);
    api<HomeActivities>("/api/public/activities/home").then((data) => {
      setHomeActivities(data);
      [...data.dailyDeals, ...data.femaleSelected, ...data.groupDeals, ...data.general].forEach((activity) => {
        void api(`/api/public/activities/${activity.id}/exposures`, { method: "POST", body: JSON.stringify({ sessionId, source: "student-home", activityId: activity.id, ...attribution }) });
      });
    });
  }, [attribution, sessionId]);

  useEffect(() => {
    const shareMatch = window.location.pathname.match(/^\/share\/([^/]+)/);
    if (!shareMatch) return;
    api<{ shareLink: ShareLink & { activityId?: string; targetId: string }; targetPath: string }>(`/api/public/share/${shareMatch[1]}/open`, { method: "POST", body: JSON.stringify({ sessionId, ...attribution }) }).then((data) => {
      const nextAttribution = { ...attribution, shareLinkId: data.shareLink.id, referrerId: data.shareLink.referrerId, source: data.shareLink.source ?? attribution.source, channel: data.shareLink.channel ?? attribution.channel, scene: data.shareLink.scene ?? attribution.scene, campaign: data.shareLink.campaign ?? attribution.campaign, activityId: data.shareLink.activityId ?? data.shareLink.targetId };
      sessionStorage.setItem("attribution", JSON.stringify(nextAttribution));
      setAttribution(nextAttribution);
      window.history.replaceState(null, "", data.targetPath);
      void openActivity(data.shareLink.targetId, nextAttribution);
    }).catch((error) => window.alert(error instanceof Error ? error.message : "分享链接无效"));
  }, []);

  useEffect(() => {
    const activityMatch = window.location.pathname.match(/^\/activities\/([^/]+)/);
    if (activityMatch) void openActivity(activityMatch[1], attribution);
  }, []);

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

  async function openMerchant(id: string, extra: Attribution = attribution) {
    await api("/api/public/clicks", { method: "POST", body: JSON.stringify({ merchantId: id, sessionId, target: "detail", ...extra }) });
    setClaimResult(null);
    setSelectedActivity(null);
    setShareLink("");
    setSelected(await api<Merchant>(`/api/public/merchants/${id}`));
  }

  async function openActivity(id: string, extra: Attribution = attribution) {
    await api(`/api/public/activities/${id}/clicks`, { method: "POST", body: JSON.stringify({ sessionId, target: "activity-detail", activityId: id, ...extra }) });
    setClaimResult(null);
    setSelected(null);
    setShareLink("");
    const activity = await api<Activity>(`/api/public/activities/${id}`);
    setSelectedActivity(activity);
    window.history.replaceState(null, "", `/activities/${id}`);
  }

  async function claim(couponId: string) {
    if (!claimForm.phone.trim()) {
      window.alert("请填写手机号");
      return;
    }
    setClaiming(couponId);
    try {
      const activityContext = selectedActivity ? { activityId: selectedActivity.id } : {};
      const result = await api<any>(`/api/public/coupons/${couponId}/claim`, { method: "POST", body: JSON.stringify({ phone: claimForm.phone.trim(), studentName: claimForm.studentName.trim() || "西大学生", sessionId, ...attribution, ...activityContext }) });
      setClaimResult(result);
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "领取失败");
    } finally {
      setClaiming(null);
    }
  }

  async function shareActivity(activity: Activity) {
    const result = await api<ShareLink>(`/api/public/activities/${activity.id}/share-links`, { method: "POST", body: JSON.stringify({ source: "share", channel: "student", scene: "activity-detail", campaign: activity.type, referrerId: claimForm.phone.trim() || undefined, sessionId }) });
    const url = `${window.location.origin}${result.url}`;
    setShareLink(url);
    await navigator.clipboard?.writeText(url).catch(() => undefined);
  }

  function closeDrawers() {
    setSelected(null);
    setSelectedActivity(null);
    setClaimResult(null);
    setShareLink("");
    if (window.location.pathname.startsWith("/activities/")) window.history.replaceState(null, "", "/");
  }

  const activeCoupon = selectedActivity?.coupon ?? selectedActivity?.merchant.coupons?.[0];

  return (
    <main className="student-shell">
      <section className="student-hero">
        <div>
          <p className="eyebrow">西大圈</p>
          <h1>今天值得去的校门口优惠</h1>
          <p>精选西北大学周边活动，领券后到店出示核销码。少一点选择成本，多一点确定性。</p>
        </div>
      </section>
      <section className="student-content">
        <ActivitySection title="今日爆品" hint="高价值活动优先看" icon={<Sparkles size={18} />} items={homeActivities.dailyDeals} onOpen={openActivity} />
        <ActivitySection title="女生精选" hint="环境、口碑和体验更友好" icon={<Star size={18} />} items={homeActivities.femaleSelected} onOpen={openActivity} />
        <ActivitySection title="宿舍拼团" hint="先组团领券，暂不接支付" icon={<Users size={18} />} items={homeActivities.groupDeals} onOpen={openActivity} />
        <div className="searchbar"><Search size={18} /><input placeholder="搜索美食、打印、驾校" value={keyword} onChange={(event) => setKeyword(event.target.value)} /></div>
        <div className="category-tabs">
          <button className={!categoryId ? "active" : ""} onClick={() => setCategoryId("")}>全部</button>
          {categories.map((category) => <button key={category.id} className={categoryId === category.id ? "active" : ""} onClick={() => setCategoryId(category.id)}>{category.name}</button>)}
        </div>
        <div className="merchant-list">
          {merchants.map((merchant) => (
            <button className="merchant-row" key={merchant.id} onClick={() => openMerchant(merchant.id)}>
              <img src={merchant.coverImageUrl} alt="" />
              <span>
                <strong>{merchant.name}</strong>
                <small><Star size={14} />{merchant.rating} 分 · {merchant.category.name} · 距西大长安校区约 1.2km</small>
                <small><MapPin size={14} />{merchant.address}</small>
                <b>{merchant.coupons[0]?.title ?? "进店看看"} · {merchant.coupons[0] ? `剩余 ${merchant.coupons[0].remainingStock} 张` : "到店咨询"}</b>
              </span>
            </button>
          ))}
        </div>
      </section>
      {selectedActivity && <div className="drawer-backdrop" onClick={closeDrawers}><section className="merchant-drawer activity-drawer" onClick={(event) => event.stopPropagation()}>
        <img src={selectedActivity.coverImage || selectedActivity.merchant.coverImageUrl} alt="" className="cover" />
        <div className="drawer-body">
          <div className="drawer-title-row"><span className="pill">{activityTypeLabel(selectedActivity.type)}</span><button className="icon-button" onClick={() => shareActivity(selectedActivity)}><Copy size={16} /></button></div>
          <h2>{selectedActivity.title}</h2>
          <p className="lead">{selectedActivity.subtitle}</p>
          <div className="trust-strip"><span><Store size={16} />{selectedActivity.merchant.name}</span><span><Star size={16} />{selectedActivity.merchant.rating} 分</span><span><Clock size={16} />至 {formatCell(selectedActivity.endAt)}</span></div>
          <p>{selectedActivity.description}</p>
          <p><MapPin size={16} />{selectedActivity.merchant.address}</p>
          <div className="claim-form">
            <input placeholder="手机号，用于领取和核销" value={claimForm.phone} onChange={(event) => setClaimForm({ ...claimForm, phone: event.target.value })} />
            <input placeholder="昵称，可选" value={claimForm.studentName} onChange={(event) => setClaimForm({ ...claimForm, studentName: event.target.value })} />
          </div>
          {claimResult && <div className="success-code"><span>领取成功</span><strong>{claimResult.code}</strong><small>到店向商家出示该核销码使用优惠。</small></div>}
          {shareLink && <div className="share-box"><span>分享链接已生成</span><small>{shareLink}</small></div>}
          {activeCoupon ? <article className="coupon">
            <span><strong>{activeCoupon.title}</strong><small>{activeCoupon.description}</small><small>有效期至 {formatCell(activeCoupon.validTo)} · 剩余 {activeCoupon.remainingStock}/{activeCoupon.totalStock} 张</small></span>
            <button className="primary" disabled={claiming === activeCoupon.id || activeCoupon.remainingStock <= 0 || activeCoupon.status !== "ACTIVE"} onClick={() => claim(activeCoupon.id)}>
              <Ticket size={16} />{activeCoupon.remainingStock <= 0 ? "已领完" : "领取"}
            </button>
          </article> : <p>当前活动暂无可领取优惠券。</p>}
        </div>
      </section></div>}
      {selected && <div className="drawer-backdrop" onClick={closeDrawers}><section className="merchant-drawer" onClick={(event) => event.stopPropagation()}>
        <img src={selected.coverImageUrl} alt="" className="cover" />
        <div className="drawer-body">
          <h2>{selected.name}</h2>
          <div className="trust-strip"><span><ShieldCheck size={16} />平台审核商家</span><span><Star size={16} />{selected.rating} 分</span><span><Package size={16} />到店出示核销码</span></div>
          <p>{selected.description ?? selected.summary}</p>
          <p><Store size={16} />{selected.category.name} · {selected.summary}</p>
          <p><MapPin size={16} />{selected.address}</p>
          <p><Clock size={16} />{selected.businessHours ?? "营业时间以门店为准"}</p>
          <p><Phone size={16} />{selected.phone ?? "暂无电话"}</p>
          <div className="claim-form">
            <input placeholder="手机号，用于领取和核销" value={claimForm.phone} onChange={(event) => setClaimForm({ ...claimForm, phone: event.target.value })} />
            <input placeholder="昵称，可选" value={claimForm.studentName} onChange={(event) => setClaimForm({ ...claimForm, studentName: event.target.value })} />
          </div>
          {claimResult && <div className="success-code"><span>领取成功</span><strong>{claimResult.code}</strong><small>到店向商家出示该核销码使用优惠。</small></div>}
          <h3>可领取优惠</h3>
          {selected.coupons.map((coupon) => (
            <article className="coupon" key={coupon.id}>
              <span><strong>{coupon.title}</strong><small>{coupon.description}</small><small>有效期至 {formatCell(coupon.validTo)} · 剩余 {coupon.remainingStock}/{coupon.totalStock} 张</small></span>
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

function ActivitySection({ title, hint, icon, items, onOpen }: { title: string; hint: string; icon: React.ReactNode; items: Activity[]; onOpen: (id: string) => void }) {
  if (!items.length) return null;
  return <section className="activity-section">
    <div className="section-heading"><span>{icon}<strong>{title}</strong></span><small>{hint}</small></div>
    <div className="activity-rail">
      {items.map((activity) => (
        <button className="activity-card" key={activity.id} onClick={() => onOpen(activity.id)}>
          <img src={activity.coverImage || activity.merchant.coverImageUrl} alt="" />
          <span className="pill">{activityTypeLabel(activity.type)}</span>
          <strong>{activity.title}</strong>
          <small>{activity.subtitle ?? activity.merchant.summary}</small>
          <b>{activity.coupon?.title ?? activity.merchant.name}<ArrowUpRight size={15} /></b>
        </button>
      ))}
    </div>
  </section>;
}

function MerchantPortal() {
  return <Authed requiredRole="MERCHANT" title="商家后台" defaultAccount="panda" defaultPassword="123456" accountLabel="用户名"><MerchantDashboard /></Authed>;
}

function AdminPortal() {
  return <Authed requiredRole="ADMIN" title="平台管理后台" defaultAccount="18800000000" defaultPassword="admin123456" accountLabel="手机号"><AdminDashboard /></Authed>;
}

function Authed({ children, requiredRole, title, defaultAccount, defaultPassword, accountLabel }: { children: React.ReactNode; requiredRole: User["role"]; title: string; defaultAccount: string; defaultPassword: string; accountLabel: string }) {
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
  if (!user || user.role !== requiredRole) return <Login title={title} requiredRole={requiredRole} defaultAccount={defaultAccount} defaultPassword={defaultPassword} accountLabel={accountLabel} onLogin={setUser} />;
  return <>{children}</>;
}

function Login({ title, requiredRole, defaultAccount, defaultPassword, accountLabel, onLogin }: { title: string; requiredRole: User["role"]; defaultAccount: string; defaultPassword: string; accountLabel: string; onLogin: (user: User) => void }) {
  const [account, setAccount] = useState(defaultAccount);
  const [password, setPassword] = useState(defaultPassword);
  const [error, setError] = useState("");
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    try {
      const data = await api<{ token: string; user: User }>("/api/auth/login", { method: "POST", body: JSON.stringify({ account, password }) });
      localStorage.setItem("token", data.token);
      if (data.user.role !== requiredRole) {
        location.href = data.user.role === "MERCHANT" ? "/merchant" : data.user.role === "ADMIN" ? "/admin" : "/";
        return;
      }
      onLogin(data.user);
    } catch (err) {
      setError(err instanceof Error ? err.message : "登录失败");
    }
  }
  return <main className="center-page"><form className="login-panel" onSubmit={submit}><h1>{title}</h1><label>{accountLabel}<input value={account} onChange={(e) => setAccount(e.target.value)} /></label><label>密码<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} /></label>{error && <p className="error">{error}</p>}<button className="primary">登录</button></form></main>;
}

function MerchantDashboard() {
  const [tab, setTab] = useState("workbench");
  const [overview, setOverview] = useState<any>(null);
  const [claims, setClaims] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [sourceRows, setSourceRows] = useState<any[]>([]);
  const [couponRows, setCouponRows] = useState<any[]>([]);
  const [activityRows, setActivityRows] = useState<any[]>([]);
  const [trendRows, setTrendRows] = useState<any[]>([]);
  const [code, setCode] = useState("");
  const [amount, setAmount] = useState("");
  const [preview, setPreview] = useState<any>(null);
  const [redeeming, setRedeeming] = useState(false);
  const [range, setRange] = useState("30d");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [profileForm, setProfileForm] = useState({ name: "", summary: "", description: "", address: "", phone: "", businessHours: "", coverImageUrl: "" });
  const [couponForm, setCouponForm] = useState({ id: "", title: "", description: "", threshold: "", discountValue: "", totalStock: 100, remainingStock: 100, validTo: "2026-12-31", status: "ACTIVE" });
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
    api<any>("/api/merchant/overview").then((data) => {
      setOverview(data);
      if (data.merchant) setProfileForm({
        name: data.merchant.name ?? "",
        summary: data.merchant.summary ?? "",
        description: data.merchant.description ?? "",
        address: data.merchant.address ?? "",
        phone: data.merchant.phone ?? "",
        businessHours: data.merchant.businessHours ?? "",
        coverImageUrl: data.merchant.coverImageUrl ?? ""
      });
    });
    api<any[]>("/api/merchant/claims").then(setClaims);
    api(`/api/merchant/analytics/summary?${query}`).then(setSummary);
    api<any[]>(`/api/merchant/analytics/by-source?${query}`).then(setSourceRows);
    api<any[]>(`/api/merchant/coupon-performance?${query}`).then(setCouponRows);
    api<any[]>(`/api/merchant/reports/activities?${query}`).then(setActivityRows);
    api<any[]>(`/api/merchant/trends?${query}`).then(setTrendRows);
  };
  useEffect(() => {
    void refresh();
  }, [range, startDate, endDate]);
  async function lookupCode() {
    setPreview(await api(`/api/merchant/redeem/preview?code=${encodeURIComponent(code)}`));
  }
  async function redeem() {
    setRedeeming(true);
    try {
      await api("/api/merchant/redeem", { method: "POST", body: JSON.stringify({ code, amount: amount ? Number(amount) : undefined }) });
      setCode("");
      setAmount("");
      setPreview(null);
      refresh();
    } finally {
      setRedeeming(false);
    }
  }
  async function saveProfile() {
    await api("/api/merchant/profile", { method: "PATCH", body: JSON.stringify(profileForm) });
    refresh();
  }
  function editCoupon(coupon: Coupon) {
    setTab("coupons");
    setCouponForm({
      id: coupon.id,
      title: coupon.title,
      description: coupon.description ?? "",
      threshold: coupon.threshold ? String(coupon.threshold) : "",
      discountValue: coupon.discountValue ? String(coupon.discountValue) : "",
      totalStock: coupon.totalStock,
      remainingStock: coupon.remainingStock,
      validTo: coupon.validTo.slice(0, 10),
      status: coupon.status
    });
  }
  async function saveCoupon() {
    const payload = {
      title: couponForm.title,
      description: couponForm.description,
      threshold: couponForm.threshold ? Number(couponForm.threshold) : null,
      discountValue: couponForm.discountValue ? Number(couponForm.discountValue) : null,
      totalStock: Number(couponForm.totalStock),
      remainingStock: Number(couponForm.remainingStock),
      validTo: new Date(couponForm.validTo).toISOString(),
      status: couponForm.status
    };
    const path = couponForm.id ? `/api/merchant/coupons/${couponForm.id}` : "/api/merchant/coupons";
    await api(path, { method: couponForm.id ? "PATCH" : "POST", body: JSON.stringify(payload) });
    setCouponForm({ id: "", title: "", description: "", threshold: "", discountValue: "", totalStock: 100, remainingStock: 100, validTo: "2026-12-31", status: "ACTIVE" });
    refresh();
  }
  const todayClaims = claims.filter((item) => String(item.claimedAt).slice(0, 10) === new Date().toISOString().slice(0, 10));
  return <Shell brand="西大圈商家" nav={<><Nav id="workbench" tab={tab} setTab={setTab} icon={<BarChart3 />} label="工作台" /><Nav id="redeem" tab={tab} setTab={setTab} icon={<ClipboardCheck />} label="核销" /><Nav id="profile" tab={tab} setTab={setTab} icon={<Store />} label="店铺" /><Nav id="coupons" tab={tab} setTab={setTab} icon={<Ticket />} label="券管理" /><Nav id="records" tab={tab} setTab={setTab} icon={<Package />} label="记录" /><Logout /></>}>
    <Header title={overview?.merchant?.name ?? "商家后台"} action={<button className="icon-button" onClick={refresh}><RefreshCw size={18} /></button>} />
    {tab === "workbench" && <>
      <section className="work-panel"><div className="form-row two"><select value={range} onChange={(e) => setRange(e.target.value)}><option value="today">今日</option><option value="7d">近 7 天</option><option value="30d">近 30 天</option><option value="custom">自定义</option></select><input type="date" disabled={range !== "custom"} value={startDate} onChange={(e) => setStartDate(e.target.value)} /><input type="date" disabled={range !== "custom"} value={endDate} onChange={(e) => setEndDate(e.target.value)} /></div></section>
      <MetricGrid data={[["今日待核销", todayClaims.filter((item) => item.status === "CLAIMED").length], ["优惠券库存", overview?.coupons?.reduce((sum: number, item: Coupon) => sum + item.remainingStock, 0) ?? 0], ["领取", summary?.claimCount ?? 0], ["核销", summary?.redemptionCount ?? 0], ["点击率", pct(summary?.clickRate)], ["核销率", pct(summary?.redemptionRate)], ["核销金额", `¥${overview?.stats.redemptionAmount ?? 0}`]]} />
      <Table title="活动效果" rows={activityRows} columns={["title", "type", "exposureCount", "clickCount", "claimCount", "redemptionCount", "clickRate", "redemptionRate"]} />
      <Table title="渠道转化" rows={sourceRows} columns={["source", "channel", "exposureCount", "clickCount", "claimCount", "redemptionCount", "clickRate", "redemptionRate"]} />
      <Table title="最近领券记录" rows={claims.slice(0, 8)} columns={["user.name", "user.phone", "coupon.title", "code", "status", "claimedAt"]} />
    </>}
    {tab === "redeem" && <section className="work-panel redeem-panel"><h2>核销优惠券</h2><div className="redeem-row"><input placeholder="输入学生出示的核销码" value={code} onChange={(e) => { setCode(e.target.value.toUpperCase()); setPreview(null); }} /><input placeholder="消费金额，可选" value={amount} onChange={(e) => setAmount(e.target.value)} /><button className="primary" disabled={!code} onClick={lookupCode}><Search size={16} />查询</button></div>
      {preview && <div className={`preview-panel ${preview.isRedeemed || preview.isExpired ? "blocked" : "ready"}`}><strong>{preview.couponTitle}</strong><span>手机号：{preview.maskedPhone ?? "-"}</span><span>领取时间：{formatCell(preview.claimedAt)}</span><span>有效期至：{formatCell(preview.validTo)}</span><span>状态：{preview.isRedeemed ? "已核销" : preview.isExpired ? "已过期" : "可核销"}</span><span>渠道：{preview.source ?? "未标记"} / {preview.channel ?? "未标记"}</span><button className="primary" disabled={preview.isRedeemed || preview.isExpired || redeeming} onClick={redeem}><ClipboardCheck size={16} />确认核销</button></div>}
    </section>}
    {tab === "profile" && <section className="work-panel"><h2>店铺资料</h2><div className="edit-grid"><label>店铺名称<input value={profileForm.name} onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })} /></label><label>一句话介绍<input value={profileForm.summary} onChange={(e) => setProfileForm({ ...profileForm, summary: e.target.value })} /></label><label>门店地址<input value={profileForm.address} onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })} /></label><label>联系电话<input value={profileForm.phone} onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })} /></label><label>营业时间<input value={profileForm.businessHours} onChange={(e) => setProfileForm({ ...profileForm, businessHours: e.target.value })} /></label><label>封面图 URL<input value={profileForm.coverImageUrl} onChange={(e) => setProfileForm({ ...profileForm, coverImageUrl: e.target.value })} /></label><label className="span-2">详细介绍<textarea value={profileForm.description} onChange={(e) => setProfileForm({ ...profileForm, description: e.target.value })} /></label></div><button className="primary" onClick={saveProfile}><Save size={16} />保存店铺资料</button></section>}
    {tab === "coupons" && <><section className="work-panel"><h2>{couponForm.id ? "修改优惠券" : "新建优惠券"}</h2><div className="edit-grid"><label>优惠标题<input value={couponForm.title} onChange={(e) => setCouponForm({ ...couponForm, title: e.target.value })} /></label><label>总库存<input type="number" value={couponForm.totalStock} onChange={(e) => setCouponForm({ ...couponForm, totalStock: Number(e.target.value) })} /></label><label>剩余库存<input type="number" value={couponForm.remainingStock} onChange={(e) => setCouponForm({ ...couponForm, remainingStock: Number(e.target.value) })} /></label><label>门槛金额<input value={couponForm.threshold} onChange={(e) => setCouponForm({ ...couponForm, threshold: e.target.value })} /></label><label>优惠金额<input value={couponForm.discountValue} onChange={(e) => setCouponForm({ ...couponForm, discountValue: e.target.value })} /></label><label>有效期至<input type="date" value={couponForm.validTo} onChange={(e) => setCouponForm({ ...couponForm, validTo: e.target.value })} /></label><label>状态<select value={couponForm.status} onChange={(e) => setCouponForm({ ...couponForm, status: e.target.value })}><option value="ACTIVE">上架</option><option value="PAUSED">暂停</option><option value="EXPIRED">过期</option></select></label><label className="span-2">使用说明<textarea value={couponForm.description} onChange={(e) => setCouponForm({ ...couponForm, description: e.target.value })} /></label></div><div className="button-row"><button className="primary" disabled={!couponForm.title || !couponForm.validTo} onClick={saveCoupon}><Save size={16} />保存优惠券</button><button className="icon-button wide" onClick={() => setCouponForm({ id: "", title: "", description: "", threshold: "", discountValue: "", totalStock: 100, remainingStock: 100, validTo: "2026-12-31", status: "ACTIVE" })}><Plus size={16} />新建</button></div></section><div className="coupon-grid">{overview?.coupons?.map((coupon: Coupon) => <article className="coupon-card" key={coupon.id}><strong>{coupon.title}</strong><span>{coupon.description}</span><small>库存 {coupon.remainingStock}/{coupon.totalStock} · 有效期至 {formatCell(coupon.validTo)} · {formatStatus(coupon.status)}</small><button className="icon-button wide" onClick={() => editCoupon(coupon)}><Edit3 size={16} />编辑</button></article>)}</div></>}
    {tab === "records" && <><Table title="领券记录" rows={claims} columns={["user.name", "user.phone", "coupon.title", "code", "status", "claimedAt"]} /><Table title="活动效果" rows={activityRows} columns={["title", "type", "status", "couponTitle", "exposureCount", "clickCount", "claimCount", "redemptionCount", "redemptionRate"]} /><Table title="优惠券效果" rows={couponRows} columns={["couponTitle", "exposureCount", "clickCount", "claimCount", "redemptionCount", "clickRate", "redemptionRate"]} /><Table title="趋势" rows={trendRows} columns={["date", "exposureCount", "clickCount", "claimCount", "redemptionCount"]} /></>}
  </Shell>;
}

function AdminDashboard() {
  const [tab, setTab] = useState("overview");
  return <Shell brand="西大圈平台" nav={<><Nav id="overview" tab={tab} setTab={setTab} icon={<BarChart3 />} label="看板" /><Nav id="activities" tab={tab} setTab={setTab} icon={<Sparkles />} label="活动" /><Nav id="merchants" tab={tab} setTab={setTab} icon={<Store />} label="商家" /><Nav id="coupons" tab={tab} setTab={setTab} icon={<Ticket />} label="优惠券" /><Nav id="promotions" tab={tab} setTab={setTab} icon={<ClipboardCheck />} label="推广" /><Nav id="categories" tab={tab} setTab={setTab} icon={<Settings />} label="类目" /><Logout /></>}>
    {tab === "overview" && <AdminOverview />}
    {tab === "activities" && <ActivityAdmin />}
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
  return <><Header title="平台总览" action={<button className="primary" onClick={exportCsv}><Download size={16} />导出 CSV</button>} /><MetricGrid data={[["商家数", data?.merchantCount ?? 0], ["已上架", data?.approvedMerchantCount ?? 0], ["优惠券", data?.couponCount ?? 0], ["曝光", summary?.exposureCount ?? 0], ["点击", summary?.clickCount ?? 0], ["领取", summary?.claimCount ?? 0], ["核销", summary?.redemptionCount ?? 0], ["点击率", pct(summary?.clickRate)], ["核销率", pct(summary?.redemptionRate)]]} /><Table title="渠道转化" rows={sourceRows} columns={["source", "channel", "exposureCount", "clickCount", "claimCount", "redemptionCount", "clickRate", "redemptionRate"]} /><Table title="商家转化" rows={rows} columns={["name", "category", "status", "exposures", "clicks", "claims", "redemptions", "redemptionAmount"]} /></>;
}

function ActivityAdmin() {
  const [items, setItems] = useState<any[]>([]);
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [form, setForm] = useState({ title: "", subtitle: "", description: "", type: "DAILY_DEAL", merchantId: "", couponId: "", coverImage: "", startAt: "2026-05-20", endAt: "2026-12-31", manualWeight: 50, sortOrder: 100, pricingMode: "FREE", status: "ACTIVE" });
  const refresh = () => api<any[]>("/api/admin/activities").then(setItems);
  useEffect(() => {
    refresh();
    api<{ items: Merchant[] }>("/api/admin/merchants?pageSize=100").then((data) => setMerchants(data.items));
    api<any[]>("/api/admin/coupons").then(setCoupons);
  }, []);
  async function create() {
    await api("/api/admin/activities", { method: "POST", body: JSON.stringify({ ...form, startAt: new Date(form.startAt).toISOString(), endAt: new Date(form.endAt).toISOString(), manualWeight: Number(form.manualWeight), sortOrder: Number(form.sortOrder), couponId: form.couponId || undefined, coverImage: form.coverImage || undefined }) });
    setForm({ title: "", subtitle: "", description: "", type: "DAILY_DEAL", merchantId: "", couponId: "", coverImage: "", startAt: "2026-05-20", endAt: "2026-12-31", manualWeight: 50, sortOrder: 100, pricingMode: "FREE", status: "ACTIVE" });
    refresh();
  }
  async function toggle(item: any) {
    await api(`/api/admin/activities/${item.id}/status`, { method: "PATCH", body: JSON.stringify({ status: item.status === "ACTIVE" ? "PAUSED" : "ACTIVE" }) });
    refresh();
  }
  return <><Header title="活动管理" /><section className="work-panel"><div className="edit-grid">
    <label>活动标题<input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></label>
    <label>副标题<input value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} /></label>
    <label>商家<select value={form.merchantId} onChange={(e) => setForm({ ...form, merchantId: e.target.value, couponId: "" })}><option value="">选择商家</option>{merchants.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}</select></label>
    <label>绑定优惠券<select value={form.couponId} onChange={(e) => setForm({ ...form, couponId: e.target.value })}><option value="">不绑定</option>{coupons.filter((c) => !form.merchantId || c.merchantId === form.merchantId).map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}</select></label>
    <label>类型<select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}><option value="DAILY_DEAL">今日爆品</option><option value="FEMALE_SELECTED">女生精选</option><option value="GROUP_DEAL">宿舍拼团</option><option value="NIGHT_FOOD">夜宵活动</option><option value="GENERAL">推荐</option></select></label>
    <label>状态<select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}><option value="ACTIVE">上架</option><option value="DRAFT">草稿</option><option value="PAUSED">暂停</option><option value="ENDED">结束</option></select></label>
    <label>权重<input type="number" value={form.manualWeight} onChange={(e) => setForm({ ...form, manualWeight: Number(e.target.value) })} /></label>
    <label>排序<input type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })} /></label>
    <label>开始日期<input type="date" value={form.startAt} onChange={(e) => setForm({ ...form, startAt: e.target.value })} /></label>
    <label>结束日期<input type="date" value={form.endAt} onChange={(e) => setForm({ ...form, endAt: e.target.value })} /></label>
    <label className="span-2">封面图 URL<input value={form.coverImage} onChange={(e) => setForm({ ...form, coverImage: e.target.value })} /></label>
    <label className="span-2">活动说明<textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></label>
  </div><button className="primary" onClick={create} disabled={!form.title || !form.merchantId}><Plus size={16} />新建活动</button></section>
  <div className="table-wrap"><h2>活动列表</h2><table><thead><tr>{["标题", "类型", "商家", "优惠券", "状态", "权重", "排序", "结束", "操作"].map((col) => <th key={col}>{col}</th>)}</tr></thead><tbody>{items.map((item) => <tr key={item.id}><td>{item.title}</td><td>{activityTypeLabel(item.type)}</td><td>{item.merchant?.name}</td><td>{item.coupon?.title ?? "-"}</td><td>{formatStatus(item.status)}</td><td>{item.manualWeight}</td><td>{item.sortOrder}</td><td>{formatCell(item.endAt)}</td><td><button className="icon-button wide" onClick={() => toggle(item)}>{item.status === "ACTIVE" ? "暂停" : "上架"}</button></td></tr>)}</tbody></table></div></>;
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
  return <div className="table-wrap"><h2>{title}</h2><table><thead><tr>{columns.map((col) => <th key={col}>{columnLabel(col)}</th>)}</tr></thead><tbody>{rows.map((row, index) => <tr key={row.id ?? index}>{columns.map((col) => <td key={col}>{col.endsWith("Rate") ? pct(get(row, col)) : formatCell(get(row, col))}</td>)}</tr>)}</tbody></table></div>;
}

function formatCell(value: unknown) {
  if (typeof value === "boolean") return value ? <Check size={16} /> : "";
  if (typeof value === "string" && value.includes("T")) return value.slice(0, 10);
  if (typeof value === "string" && ["ACTIVE", "PAUSED", "EXPIRED", "CLAIMED", "USED"].includes(value)) return formatStatus(value);
  return String(value ?? "");
}

function formatStatus(value: string) {
  return ({ ACTIVE: "上架", PAUSED: "暂停", EXPIRED: "过期", CLAIMED: "待核销", USED: "已核销", PENDING: "待审核", APPROVED: "已上架", REJECTED: "已驳回", SUSPENDED: "已停用", DRAFT: "草稿", ENDED: "已结束" } as Record<string, string>)[value] ?? value;
}

function activityTypeLabel(value: string) {
  return ({ DAILY_DEAL: "今日爆品", FEMALE_SELECTED: "女生精选", GROUP_DEAL: "宿舍拼团", NIGHT_FOOD: "夜宵活动", GENERAL: "推荐" } as Record<string, string>)[value] ?? value;
}

function columnLabel(key: string) {
  return ({
    source: "来源",
    channel: "渠道",
    exposureCount: "曝光",
    clickCount: "点击",
    claimCount: "领取",
    redemptionCount: "核销",
    clickRate: "点击率",
    redemptionRate: "核销率",
    couponTitle: "优惠券",
    date: "日期",
    "user.name": "用户",
    "user.phone": "手机号",
    "coupon.title": "优惠券",
    code: "核销码",
    status: "状态",
    claimedAt: "领取时间",
    name: "名称",
    category: "类目",
    "category.name": "类目",
    merchant: "商家",
    "merchant.name": "商家",
    rating: "评分",
    platformBoost: "排序权重",
    sortOrder: "排序",
    phone: "电话",
    title: "标题",
    totalStock: "总库存",
    remainingStock: "剩余库存",
    validTo: "有效期至",
    exposures: "曝光",
    clicks: "点击",
    claims: "领取",
    redemptions: "核销",
    redemptionAmount: "核销金额",
    slug: "标识",
    isActive: "启用",
    type: "类型",
    activityId: "活动",
    merchantName: "商家"
  } as Record<string, string>)[key] ?? key;
}

createRoot(document.getElementById("root")!).render(<App />);
