import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { BarChart3, ChevronLeft, Clock, Gift, Image, ListChecks, LogOut, MapPin, MessageSquareText, Shuffle, Sparkles, Store, Ticket, Utensils, Wrench } from "lucide-react";
import "./styles.css";

const API_BASE = import.meta.env.VITE_API_BASE ?? "";

type Section = "overview" | "benefits" | "banners" | "food" | "services" | "community" | "merchants" | "coupons";
type Dict = Record<string, any>;

const nav: { id: Section; label: string; Icon: React.ComponentType<{ size?: number }> }[] = [
  { id: "overview", label: "概览", Icon: BarChart3 },
  { id: "benefits", label: "校园福利发布", Icon: Ticket },
  { id: "banners", label: "轮播图修改", Icon: Image },
  { id: "food", label: "今天吃什么", Icon: Utensils },
  { id: "services", label: "服务发布", Icon: Wrench },
  { id: "community", label: "论坛功能", Icon: MessageSquareText },
  { id: "merchants", label: "基础商家", Icon: Store },
  { id: "coupons", label: "优惠券", Icon: ListChecks }
];

function authHeaders(token: string) {
  return { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
}

async function api<T>(token: string, path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers: { ...authHeaders(token), ...(options.headers || {}) } });
  const body = await res.json().catch(() => ({}));
  if (!res.ok || body.success === false) throw new Error(body.message || "请求失败");
  return body.data;
}

async function publicApi<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`);
  const body = await res.json().catch(() => ({}));
  if (!res.ok || body.success === false) throw new Error(body.message || "请求失败");
  return body.data;
}

function initialMerchantId() {
  const params = new URLSearchParams(window.location.search);
  const fromQuery = params.get("merchantId");
  if (fromQuery) return fromQuery;
  const match = window.location.hash.match(/merchant=([^&]+)/);
  return match ? decodeURIComponent(match[1]) : "";
}

function toDateTimeLocal(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}

function csv(value: unknown) {
  return Array.isArray(value) ? value.join(",") : value ?? "";
}

function parseCsv(value: string) {
  return value.split(",").map((item) => item.trim()).filter(Boolean);
}

function parseMenu(value: string) {
  return value.split("\n").map((line) => {
    const [name, price] = line.split(/[,:，]/).map((item) => item.trim());
    return name ? { name, price: Number(price || 0) } : null;
  }).filter(Boolean);
}

function menuText(value: unknown) {
  return Array.isArray(value) ? value.map((item) => `${item.name},${item.price}`).join("\n") : "";
}

function webImage(value?: string) {
  return value && /^(https?:|data:|\/api\/)/.test(value) ? value : "";
}

function StudentHome() {
  const [home, setHome] = useState<{ banners: Dict[]; activities: Dict[] }>({ banners: [], activities: [] });
  const [randomFood, setRandomFood] = useState<Dict | null>(null);
  const [selectedMerchantId, setSelectedMerchantId] = useState(initialMerchantId);
  const [merchant, setMerchant] = useState<Dict | null>(null);
  const [loadingMerchant, setLoadingMerchant] = useState(false);
  const [homeError, setHomeError] = useState("");

  useEffect(() => {
    publicApi<{ banners: Dict[]; activities: Dict[] }>("/api/public/home")
      .then((data) => setHome({ banners: data.banners || [], activities: data.activities || [] }))
      .catch(() => setHomeError("校园福利暂时加载失败，请稍后再试。"));
  }, []);

  useEffect(() => {
    if (!selectedMerchantId) {
      setMerchant(null);
      return;
    }
    setLoadingMerchant(true);
    publicApi<Dict>(`/api/public/merchants/${encodeURIComponent(selectedMerchantId)}`)
      .then(setMerchant)
      .catch(() => setMerchant(null))
      .finally(() => setLoadingMerchant(false));
  }, [selectedMerchantId]);

  async function chooseFood() {
    try {
      setRandomFood(await publicApi<Dict | null>("/api/public/food/random"));
    } catch {
      setRandomFood(null);
    }
  }

  function openMerchant(id?: string) {
    if (!id) return;
    setSelectedMerchantId(id);
    window.history.replaceState(null, "", `/student?merchantId=${encodeURIComponent(id)}`);
  }

  function closeMerchant() {
    setSelectedMerchantId("");
    window.history.replaceState(null, "", window.location.pathname === "/" ? "/" : "/student");
  }

  const leadImage = webImage(home.banners[0]?.image) || webImage(home.activities[0]?.image);

  if (selectedMerchantId) {
    return (
      <main className="student-page">
        <section className="student-shell">
          <button className="back-btn" onClick={closeMerchant}><ChevronLeft size={18} />返回</button>
          {loadingMerchant && <div className="empty-card">商家信息加载中...</div>}
          {!loadingMerchant && !merchant && <div className="empty-card">商家暂时不可查看。</div>}
          {merchant && <MerchantDetail merchant={merchant} />}
        </section>
      </main>
    );
  }

  return (
    <main className="student-page">
      <section className="student-shell">
        <div className="mobile-hero">
          <div>
            <span className="hero-kicker"><Sparkles size={15} />西大圈</span>
            <h1>发现西北大学周边好店与校园福利</h1>
            <p>优惠、拼饭、生活服务和今日推荐，先从这里逛起。</p>
          </div>
          {leadImage && <img src={leadImage} alt="校园福利" />}
        </div>

        <section className="student-section">
          <div className="section-title"><h2>今日校园福利</h2><span>优惠和周边好店</span></div>
          {homeError && <p className="muted-line">{homeError}</p>}
          <div className="activity-list">
            {home.activities.map((item) => (
              <button className={`activity-card ${webImage(item.image) ? "has-image" : ""}`} key={item.id} onClick={() => openMerchant(item.merchantId)}>
                {webImage(item.image) && <img src={webImage(item.image)} alt={item.title} />}
                <span><Gift size={14} />{item.discount || "校园福利"}</span>
                <strong>{item.title}</strong>
              </button>
            ))}
            {!home.activities.length && !homeError && <div className="empty-card">今天暂无上架福利。</div>}
          </div>
        </section>

        <section className="food-picker">
          <div>
            <span><Utensils size={16} />今天吃什么</span>
            <strong>{randomFood ? randomFood.name : "帮我选一家"}</strong>
            <p>{randomFood ? randomFood.recommendation || randomFood.discount || "这家今天值得试试。" : "选择困难时，让西大圈随机推荐一家。 "}</p>
          </div>
          <button onClick={chooseFood}><Shuffle size={18} />帮我选</button>
        </section>

        <section className="student-section">
          <div className="section-title"><h2>推荐入口</h2><span>从活动进入商家详情</span></div>
          <div className="banner-list">
            {home.banners.map((item) => (
              <button className={`banner-card ${webImage(item.image) ? "has-image" : ""}`} key={item.id} onClick={() => item.targetType === "activity" && openMerchant(home.activities.find((activity) => activity.id === item.targetId)?.merchantId)}>
                {webImage(item.image) && <img src={webImage(item.image)} alt={item.title} />}
                <strong>{item.title}</strong>
                <span>{item.subtitle || "校园生活服务"}</span>
              </button>
            ))}
            {!home.banners.length && <div className="empty-card">暂无轮播内容。</div>}
          </div>
        </section>
      </section>
    </main>
  );
}

function MerchantDetail({ merchant }: { merchant: Dict }) {
  const coupons = Array.isArray(merchant.coupons) ? merchant.coupons : [];
  return (
    <article className="merchant-detail">
      {webImage(merchant.image) && <img className="merchant-cover" src={webImage(merchant.image)} alt={merchant.name} />}
      <div className="merchant-head">
        <span>{merchant.foodCategory || merchant.serviceId || "校园商家"}</span>
        <h1>{merchant.name}</h1>
        <p>{merchant.recommendation || "西大圈推荐商家"}</p>
      </div>
      <div className="info-grid">
        <div><MapPin size={17} /><span>{merchant.address || "地址待补充"}</span></div>
        <div><Clock size={17} /><span>{merchant.businessHours || "营业时间待补充"}</span></div>
      </div>
      <section>
        <h2>优惠券</h2>
        <div className="coupon-list">
          {coupons.map((coupon: Dict) => <div className="coupon-card" key={coupon.id}><strong>{coupon.title}</strong><span>{coupon.description || "到店使用请咨询商家"}</span></div>)}
          {!coupons.length && <div className="empty-card">暂无可领取优惠券。</div>}
        </div>
      </section>
      {Array.isArray(merchant.highlights) && merchant.highlights.length > 0 && (
        <section>
          <h2>推荐理由</h2>
          <div className="tag-row">{merchant.highlights.map((item: string) => <span key={item}>{item}</span>)}</div>
        </section>
      )}
    </article>
  );
}

function Login({ onLogin }: { onLogin: (token: string, user: Dict) => void }) {
  const [account, setAccount] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ account, password })
      });
      const body = await res.json();
      if (!res.ok || body.success === false) throw new Error(body.message || "登录失败");
      if (body.data.user.role !== "ADMIN") throw new Error("当前账号不是平台管理员");
      localStorage.setItem("adminToken", body.data.token);
      localStorage.setItem("adminUser", JSON.stringify(body.data.user));
      onLogin(body.data.token, body.data.user);
    } catch (err) {
      setError(err instanceof Error ? err.message : "登录失败");
    }
  }

  return (
    <main className="login-page">
      <form className="login-card" onSubmit={submit}>
        <h1>西大圈平台后台</h1>
        <label>账号<input value={account} autoComplete="username" onChange={(e) => setAccount(e.target.value)} /></label>
        <label>密码<input type="password" value={password} autoComplete="current-password" onChange={(e) => setPassword(e.target.value)} /></label>
        {error && <p className="error">{error}</p>}
        <button className="primary">登录</button>
      </form>
    </main>
  );
}

function App() {
  const isAdmin = window.location.pathname === "/admin" || window.location.pathname.startsWith("/admin/");
  if (!isAdmin) return <StudentHome />;
  return <AdminApp />;
}

function AdminApp() {
  const [token, setToken] = useState(localStorage.getItem("adminToken") || "");
  const [user, setUser] = useState<Dict | null>(() => JSON.parse(localStorage.getItem("adminUser") || "null"));
  const [section, setSection] = useState<Section>("overview");

  if (!token) return <Login onLogin={(nextToken, nextUser) => { setToken(nextToken); setUser(nextUser); }} />;

  function logout() {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    setToken("");
    setUser(null);
  }

  return (
    <main className="admin-shell">
      <aside>
        <div className="brand">西大圈后台<span>{user?.name || "平台管理员"}</span></div>
        <nav>{nav.map(({ id, label, Icon }) => <button key={id} className={section === id ? "active" : ""} onClick={() => setSection(id)}><Icon size={18} />{label}</button>)}</nav>
        <button className="logout" onClick={logout}><LogOut size={18} />退出登录</button>
      </aside>
      <section className="workspace">
        {section === "overview" && <Overview token={token} />}
        {section === "benefits" && <Activities token={token} />}
        {section === "banners" && <Banners token={token} />}
        {section === "food" && <Food token={token} />}
        {section === "services" && <Services token={token} />}
        {section === "community" && <Community token={token} />}
        {section === "merchants" && <Merchants token={token} />}
        {section === "coupons" && <Coupons token={token} />}
      </section>
    </main>
  );
}

function useAdminData(token: string) {
  const [data, setData] = useState({ merchants: [] as Dict[], coupons: [] as Dict[], categories: [] as Dict[], serviceCategories: [] as Dict[] });
  async function load() {
    const [merchants, coupons, categories, serviceCategories] = await Promise.all([
      api<Dict>(token, "/api/admin/merchants?pageSize=100").then((res) => res.items),
      api<Dict[]>(token, "/api/admin/coupons"),
      api<Dict[]>(token, "/api/admin/categories"),
      api<Dict[]>(token, "/api/admin/service-categories")
    ]);
    setData({ merchants, coupons, categories, serviceCategories });
  }
  useEffect(() => { load().catch(console.error); }, [token]);
  return { ...data, reloadBase: load };
}

function Overview({ token }: { token: string }) {
  const [stats, setStats] = useState<Dict>({});
  useEffect(() => { api<Dict>(token, "/api/admin/dashboard/overview").then(setStats).catch(console.error); }, [token]);
  const cards = [
    ["商家数", stats.merchantCount], ["福利数", stats.activityCount], ["轮播数", stats.bannerCount], ["帖子数", stats.communityPostCount],
    ["今日曝光", stats.todayExposures], ["今日点击", stats.todayClicks], ["优惠券数", stats.couponCount], ["核销数", stats.redemptionCount]
  ];
  return <Page title="概览" hint="平台内容、福利和今日转化数据。"><div className="stats">{cards.map(([label, value]) => <div className="stat" key={label}><span>{label}</span><strong>{value ?? 0}</strong></div>)}</div></Page>;
}

function Activities({ token }: { token: string }) {
  const base = useAdminData(token);
  return <CrudPage token={token} title="校园福利发布" path="/api/admin/activities" defaults={{ type: "GENERAL", status: "DRAFT", pricingMode: "FREE", manualWeight: 0, sortOrder: 100, startAt: toDateTimeLocal(new Date().toISOString()), endAt: "2026-12-31T23:59" }} fields={[
    ["title", "标题"], ["subtitle", "副标题"], ["merchantId", "商家", "select", base.merchants], ["couponId", "绑定优惠券", "select", base.coupons], ["coverImage", "图片 URL"], ["type", "类型", "select", ["DAILY_DEAL", "FEMALE_SELECTED", "GROUP_DEAL", "NIGHT_FOOD", "GENERAL"]], ["startAt", "开始时间", "datetime-local"], ["endAt", "结束时间", "datetime-local"], ["manualWeight", "权重", "number"], ["sortOrder", "排序", "number"], ["status", "状态", "select", ["DRAFT", "ACTIVE", "PAUSED", "ENDED"]]
  ]} transform={(item) => ({ ...item, startAt: new Date(item.startAt).toISOString(), endAt: new Date(item.endAt).toISOString(), couponId: item.couponId || null })} columns={["title", "merchant.name", "coupon.title", "status", "manualWeight"]} />;
}

function Banners({ token }: { token: string }) {
  return <CrudPage token={token} title="轮播图修改" path="/api/admin/banners" defaults={{ targetType: "TAB", sortOrder: 100, isActive: true }} fields={[
    ["title", "标题"], ["subtitle", "副标题"], ["imageUrl", "图片 URL"], ["targetType", "跳转类型", "select", ["ACTIVITY", "SERVICE", "ABOUT", "TAB", "URL"]], ["targetId", "跳转目标"], ["url", "页面路径/URL"], ["sortOrder", "排序", "number"], ["isActive", "上架", "checkbox"]
  ]} columns={["title", "targetType", "targetId", "sortOrder", "isActive"]} />;
}

function Food({ token }: { token: string }) {
  const base = useAdminData(token);
  const food = base.merchants.filter((item) => item.category?.slug === "food" || item.foodCategory);
  return <CrudPage token={token} title="今天吃什么" path="/api/admin/merchants" sourceItems={food} defaults={{ status: "APPROVED", randomWeight: 10, isFoodRecommendation: true }} fields={[
    ["name", "商家名"], ["categoryId", "基础类目", "select", base.categories], ["foodCategory", "餐饮分类"], ["avgPrice", "人均", "number"], ["distanceText", "距离文案"], ["recommendation", "推荐语"], ["randomWeight", "随机权重", "number"], ["isFoodRecommendation", "参与随机推荐", "checkbox"], ["sortOrder", "排序", "number"], ["status", "状态", "select", ["PENDING", "APPROVED", "REJECTED", "SUSPENDED"]], ["address", "地址"], ["coverImageUrl", "图片 URL"], ["tags", "标签逗号分隔", "csv"], ["highlights", "亮点逗号分隔", "csv"], ["menu", "菜单，每行 名称,价格", "menu"], ["qrImageUrl", "二维码 URL"]
  ]} columns={["name", "foodCategory", "recommendation", "randomWeight", "isFoodRecommendation"]} transform={merchantTransform} onSaved={base.reloadBase} />;
}

function Services({ token }: { token: string }) {
  const base = useAdminData(token);
  const serviceMerchants = base.merchants.filter((item) => item.isServicePublished || item.serviceCategoryId);
  return <Page title="服务发布" hint="维护服务分类，并选择服务商家上架。"><ServiceCategories token={token} /><Crud token={token} title="服务商家" path="/api/admin/merchants" sourceItems={serviceMerchants} defaults={{ status: "APPROVED", isServicePublished: true }} fields={[
    ["name", "商家名"], ["categoryId", "基础类目", "select", base.categories], ["serviceCategoryId", "服务分类", "select", base.serviceCategories], ["avgPrice", "均价", "number"], ["distanceText", "距离文案"], ["recommendation", "推荐语"], ["isServicePublished", "服务上架", "checkbox"], ["sortOrder", "排序", "number"], ["status", "状态", "select", ["PENDING", "APPROVED", "REJECTED", "SUSPENDED"]], ["address", "地址"], ["coverImageUrl", "图片 URL"], ["tags", "标签逗号分隔", "csv"], ["highlights", "亮点逗号分隔", "csv"], ["menu", "菜单，每行 名称,价格", "menu"], ["qrImageUrl", "二维码 URL"]
  ]} columns={["name", "serviceCategory.name", "recommendation", "isServicePublished", "status"]} transform={merchantTransform} onSaved={base.reloadBase} /></Page>;
}

function ServiceCategories({ token }: { token: string }) {
  return <Crud token={token} title="服务分类" path="/api/admin/service-categories" defaults={{ sortOrder: 100, isActive: true }} fields={[["name", "名称"], ["key", "标识"], ["icon", "图标文案"], ["sortOrder", "排序", "number"], ["isActive", "启用", "checkbox"]]} columns={["name", "key", "icon", "sortOrder", "isActive"]} />;
}

function Community({ token }: { token: string }) {
  return <CrudPage token={token} title="论坛功能" path="/api/admin/community-posts" defaults={{ type: "校园墙", status: "VISIBLE", likeCount: 0, commentCount: 0, sortOrder: 100 }} fields={[
    ["type", "类型"], ["title", "标题"], ["summary", "内容摘要"], ["likeCount", "点赞数", "number"], ["commentCount", "评论数", "number"], ["status", "状态", "select", ["VISIBLE", "HIDDEN"]], ["sortOrder", "排序", "number"]
  ]} columns={["type", "title", "summary", "likeCount", "commentCount", "status"]} />;
}

function Merchants({ token }: { token: string }) {
  const base = useAdminData(token);
  return <CrudPage token={token} title="基础商家" path="/api/admin/merchants" listPath="/api/admin/merchants?pageSize=100" unwrap="items" defaults={{ status: "APPROVED", rating: 4.8, sortOrder: 100, platformBoost: 0, randomWeight: 0, isFoodRecommendation: false, isServicePublished: false }} fields={[
    ["name", "商家名"], ["summary", "摘要"], ["description", "描述"], ["categoryId", "基础类目", "select", base.categories], ["serviceCategoryId", "服务分类", "select", base.serviceCategories], ["address", "地址"], ["phone", "电话"], ["businessHours", "营业时间"], ["coverImageUrl", "图片 URL"], ["rating", "评分", "number"], ["avgPrice", "均价", "number"], ["distanceText", "距离文案"], ["sortOrder", "排序", "number"], ["platformBoost", "平台加权", "number"], ["status", "状态", "select", ["PENDING", "APPROVED", "REJECTED", "SUSPENDED"]]
  ]} columns={["name", "category.name", "serviceCategory.name", "status", "sortOrder", "platformBoost"]} transform={merchantTransform} onSaved={base.reloadBase} />;
}

function Coupons({ token }: { token: string }) {
  const base = useAdminData(token);
  return <CrudPage token={token} title="优惠券" path="/api/admin/coupons" defaults={{ totalStock: 100, remainingStock: 100, status: "ACTIVE", validTo: "2026-12-31T23:59" }} fields={[
    ["merchantId", "商家", "select", base.merchants], ["title", "标题"], ["description", "说明"], ["threshold", "门槛", "number"], ["discountValue", "优惠金额", "number"], ["totalStock", "总库存", "number"], ["remainingStock", "剩余库存", "number"], ["validTo", "有效期至", "datetime-local"], ["status", "状态", "select", ["ACTIVE", "PAUSED", "EXPIRED"]]
  ]} columns={["title", "merchant.name", "remainingStock", "validTo", "status"]} transform={(item) => ({ ...item, validTo: new Date(item.validTo).toISOString(), threshold: item.threshold || null, discountValue: item.discountValue || null })} />;
}

function merchantTransform(item: Dict) {
  return {
    ...item,
    serviceCategoryId: item.serviceCategoryId || null,
    avgPrice: item.avgPrice === "" ? null : item.avgPrice,
    tags: typeof item.tags === "string" ? parseCsv(item.tags) : item.tags,
    highlights: typeof item.highlights === "string" ? parseCsv(item.highlights) : item.highlights,
    menu: typeof item.menu === "string" ? parseMenu(item.menu) : item.menu
  };
}

function Page({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return <div><header className="page-head"><div><h1>{title}</h1>{hint && <p>{hint}</p>}</div></header>{children}</div>;
}

function CrudPage(props: React.ComponentProps<typeof Crud> & { hint?: string }) {
  return <Page title={props.title} hint={props.hint}><Crud {...props} /></Page>;
}

function Crud({ token, title, path, listPath, unwrap, sourceItems, defaults = {}, fields, columns, transform, onSaved }: {
  token: string; title: string; path: string; listPath?: string; unwrap?: string; sourceItems?: Dict[]; defaults?: Dict;
  fields: any[]; columns: string[]; transform?: (item: Dict) => Dict; onSaved?: () => void;
}) {
  const [items, setItems] = useState<Dict[]>(sourceItems || []);
  const [form, setForm] = useState<Dict>(defaults);
  const [editingId, setEditingId] = useState("");
  const [error, setError] = useState("");
  const effectiveItems = sourceItems || items;

  async function load() {
    if (sourceItems) return;
    const data = await api<any>(token, listPath || path);
    setItems(unwrap ? data[unwrap] : data);
  }

  useEffect(() => { load().catch(console.error); }, [token, path, Boolean(sourceItems)]);

  function edit(item: Dict) {
    setEditingId(item.id);
    setForm({ ...item, startAt: toDateTimeLocal(item.startAt), endAt: toDateTimeLocal(item.endAt), validTo: toDateTimeLocal(item.validTo), publishedAt: toDateTimeLocal(item.publishedAt), tags: csv(item.tags), highlights: csv(item.highlights), menu: menuText(item.menu) });
  }

  async function save(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    try {
      const payload = transform ? transform(form) : form;
      await api(token, editingId ? `${path}/${editingId}` : path, { method: editingId ? "PATCH" : "POST", body: JSON.stringify(payload) });
      setForm(defaults);
      setEditingId("");
      await load();
      onSaved?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "保存失败");
    }
  }

  return (
    <div className="crud-block">
      {title !== "服务分类" && <h2>{title}</h2>}
      <form className="editor" onSubmit={save}>
        {fields.map(([key, label, type, options]) => <Field key={key} name={key} label={label} type={type} options={options} value={form[key]} onChange={(value) => setForm((current) => ({ ...current, [key]: value }))} />)}
        {error && <p className="error">{error}</p>}
        <div className="actions"><button className="primary">{editingId ? "保存修改" : "新增"}</button>{editingId && <button type="button" onClick={() => { setEditingId(""); setForm(defaults); }}>取消</button>}</div>
      </form>
      <table><thead><tr>{columns.map((col) => <th key={col}>{col}</th>)}<th>操作</th></tr></thead><tbody>{effectiveItems.map((item) => <tr key={item.id}>{columns.map((col) => <td key={col}>{String(read(item, col) ?? "")}</td>)}<td><button onClick={() => edit(item)}>编辑</button></td></tr>)}</tbody></table>
    </div>
  );
}

function Field({ name, label, type = "text", value, options, onChange }: { name: string; label: string; type?: string; value: any; options?: any[]; onChange: (value: any) => void }) {
  const normalized = value ?? (type === "checkbox" ? false : "");
  if (type === "select") {
    return <label>{label}<select value={normalized} onChange={(e) => onChange(e.target.value)}><option value="">未选择</option>{(options || []).map((option) => typeof option === "string" ? <option key={option} value={option}>{option}</option> : <option key={option.id} value={option.id}>{option.name || option.title}</option>)}</select></label>;
  }
  if (type === "checkbox") {
    return <label className="check"><input type="checkbox" checked={Boolean(normalized)} onChange={(e) => onChange(e.target.checked)} />{label}</label>;
  }
  if (type === "menu") {
    return <label>{label}<textarea value={normalized} onChange={(e) => onChange(e.target.value)} /></label>;
  }
  return <label>{label}<input type={type === "csv" ? "text" : type} name={name} value={normalized} onChange={(e) => onChange(type === "number" ? Number(e.target.value) : e.target.value)} /></label>;
}

function read(item: Dict, path: string) {
  return path.split(".").reduce<any>((current, part) => current?.[part], item);
}

createRoot(document.getElementById("root")!).render(<App />);
