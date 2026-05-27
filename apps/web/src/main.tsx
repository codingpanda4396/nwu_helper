import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { BarChart3, BadgePercent, CalendarDays, Car, ChevronLeft, ChevronRight, Clock, Coffee, Gift, Heart, Home, Image, Info, ListChecks, LogOut, MapPin, MessageCircle, MessageSquareText, Phone, Plus, QrCode, Send, ShieldCheck, Shuffle, Sparkles, Star, Store, Ticket, ThumbsUp, Utensils, Wrench } from "lucide-react";
import "./styles.css";

const API_BASE = import.meta.env.VITE_API_BASE ?? "";

type Section = "overview" | "benefits" | "banners" | "wechat" | "food" | "services" | "community" | "merchants" | "coupons";
type Dict = Record<string, any>;

const nav: { id: Section; label: string; Icon: React.ComponentType<{ size?: number }> }[] = [
  { id: "overview", label: "概览", Icon: BarChart3 },
  { id: "benefits", label: "校园福利发布", Icon: Ticket },
  { id: "banners", label: "轮播图修改", Icon: Image },
  { id: "wechat", label: "西大圈入口", Icon: QrCode },
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

async function publicWrite<T>(path: string, body: Dict): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const payload = await res.json().catch(() => ({}));
  if (!res.ok || payload.success === false) throw new Error(payload.message || "请求失败");
  return payload.data;
}

function initialMerchantId() {
  const params = new URLSearchParams(window.location.search);
  const fromQuery = params.get("merchantId");
  if (fromQuery) return fromQuery;
  const match = window.location.hash.match(/merchant=([^&]+)/);
  return match ? decodeURIComponent(match[1]) : "";
}

function initialPostId() {
  const params = new URLSearchParams(window.location.search);
  const fromQuery = params.get("postId");
  if (fromQuery) return fromQuery;
  const match = window.location.hash.match(/post=([^&]+)/);
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
  return value && /^(https?:|data:|\/api\/|\/assets\/)/.test(value) ? value : "";
}

type H5Tab = "home" | "food" | "driving" | "services" | "community" | "about";

const asset = (name: string) => `/assets/images/${name}`;
const qrPlaceholder = asset("qr-placeholder.jpg");
const h5Tabs: { id: H5Tab; label: string; Icon: React.ComponentType<{ size?: number }> }[] = [
  { id: "home", label: "首页", Icon: Home },
  { id: "food", label: "美食", Icon: Utensils },
  { id: "driving", label: "驾校", Icon: Car },
  { id: "services", label: "生活服务", Icon: Wrench },
  { id: "community", label: "讨论区", Icon: MessageCircle },
  { id: "about", label: "关于", Icon: Info }
];

const mockMerchants: Dict[] = [
  { id: "mock-bbq", category: "food", foodCategory: "烧烤夜宵", name: "北门阿强烧烤", image: asset("merchant-food-001.jpg"), rating: 4.8, avgPrice: 42, distance: "北门步行6分钟", address: "西大北门美食街 18 号", phone: "13800000001", businessHours: "17:00-02:00", tags: ["夜宵", "学生套餐", "可拼桌"], discount: "满50减8", recommendation: "宿舍夜宵局常选，烤串出餐快。", highlights: ["离校近", "套餐清楚", "适合多人"], menu: [{ name: "双人烤串套餐", price: 68 }, { name: "烤鱼拼盘", price: 88 }], qrImageUrl: qrPlaceholder, coupons: [{ id: "mock-coupon-bbq", title: "满50减8", description: "到店消费满50元可用，每桌限用一张。" }] },
  { id: "mock-print", category: "service", serviceId: "print", name: "西门快印装订", image: asset("merchant-print-001.jpg"), rating: 4.7, avgPrice: 12, distance: "西门步行4分钟", address: "西大西门商业街 6 号", phone: "13800000002", businessHours: "08:30-22:30", tags: ["论文装订", "资料打印", "证件照"], discount: "打印满10减2", recommendation: "课程资料、论文装订和证件照一站处理。", highlights: ["营业晚", "可装订", "价格透明"], menu: [{ name: "黑白打印", price: 0.15 }, { name: "论文胶装", price: 8 }], qrImageUrl: qrPlaceholder, coupons: [{ id: "mock-coupon-print", title: "打印满10减2", description: "资料打印满10元立减2元。" }] },
  { id: "mock-driving", category: "service", serviceId: "rent", name: "校园优选驾校", image: asset("driving-school.jpg"), rating: 4.9, avgPrice: 2680, distance: "校车接送", address: "西大周边训练场", phone: "13800000003", businessHours: "09:00-20:00", tags: ["接送练车", "学生班", "流程透明"], discount: "报名减100", recommendation: "适合课表不固定的同学，练车时间可沟通。", highlights: ["接送方便", "班型清楚", "微信跟进"], menu: [{ name: "学生基础班", price: 2680 }], qrImageUrl: qrPlaceholder, coupons: [{ id: "mock-coupon-driving", title: "报名减100", description: "通过西大圈咨询报名可享。" }] },
  { id: "mock-hair", category: "service", serviceId: "care", name: "南门轻护理发", image: asset("h5-wechat-promo.png"), rating: 4.6, avgPrice: 39, distance: "南门步行8分钟", address: "南门生活广场 2 楼", phone: "13800000004", businessHours: "10:00-22:00", tags: ["理发", "洗护", "学生价"], discount: "洗剪吹减10", recommendation: "基础剪发和洗护评价稳定。", highlights: ["学生价", "可预约", "反馈快"], menu: [{ name: "洗剪吹", price: 39 }], qrImageUrl: qrPlaceholder, coupons: [{ id: "mock-coupon-hair", title: "洗剪吹减10", description: "首次到店洗剪吹可用。" }] }
];

const mockPosts = [
  { id: "mock-post-1", type: "校园墙", title: "北门夜宵哪家适合四人局？", summary: "想找能坐下聊天、价格别太离谱的店。", content: "想找能坐下聊天、价格别太离谱的店，欢迎推荐。", authorNickname: "同学A", likeCount: 12, commentCount: 3, viewCount: 98, time: "今天" }
];

function getSessionId() {
  const key = "nwuSessionId";
  const current = localStorage.getItem(key);
  if (current) return current;
  const next = `h5-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  localStorage.setItem(key, next);
  return next;
}

function attribution(scene: string) {
  const params = new URLSearchParams(window.location.search);
  return {
    sessionId: getSessionId(),
    source: "h5",
    channel: params.get("channel") || "direct",
    scene,
    campaign: params.get("campaign") || undefined
  };
}

function firePublicLog(kind: "exposures" | "clicks", merchantId?: string, scene = "home", extra: Dict = {}) {
  if (!merchantId || merchantId.startsWith("mock-")) return;
  publicWrite(`/api/public/${kind}`, { merchantId, ...attribution(scene), ...extra }).catch(() => undefined);
}

function StudentHome() {
  const [activeTab, setActiveTab] = useState<H5Tab>(() => {
    const hash = window.location.hash.replace("#", "");
    return h5Tabs.some((item) => item.id === hash) ? hash as H5Tab : "home";
  });
  const [home, setHome] = useState<{ banners: Dict[]; activities: Dict[]; wechatEntry: Dict | null }>({ banners: [], activities: [], wechatEntry: null });
  const [randomFood, setRandomFood] = useState<Dict | null>(null);
  const [hasDrawnFood, setHasDrawnFood] = useState(false);
  const [selectedMerchantId, setSelectedMerchantId] = useState(initialMerchantId);
  const [merchant, setMerchant] = useState<Dict | null>(null);
  const [selectedPostId, setSelectedPostId] = useState(initialPostId);
  const [postDetail, setPostDetail] = useState<Dict | null>(null);
  const [loadingPost, setLoadingPost] = useState(false);
  const [loadingMerchant, setLoadingMerchant] = useState(false);
  const [homeError, setHomeError] = useState("");
  const [foodCategories, setFoodCategories] = useState<Dict[]>([{ id: "all", name: "全部" }]);
  const [foodCategory, setFoodCategory] = useState("all");
  const [foodMerchants, setFoodMerchants] = useState<Dict[]>([]);
  const [foodError, setFoodError] = useState("");
  const [serviceCategories, setServiceCategories] = useState<Dict[]>([]);
  const [serviceKey, setServiceKey] = useState("");
  const [serviceMerchants, setServiceMerchants] = useState<Dict[]>([]);
  const [serviceError, setServiceError] = useState("");
  const [communityTypes, setCommunityTypes] = useState<string[]>(["全部"]);
  const [communityType, setCommunityType] = useState("全部");
  const [communityPosts, setCommunityPosts] = useState<Dict[]>([]);
  const [communityError, setCommunityError] = useState("");
  const [toast, setToast] = useState("");

  useEffect(() => {
    publicApi<{ banners: Dict[]; activities: Dict[]; wechatEntry: Dict | null }>("/api/public/home")
      .then((data) => {
        setHome({ banners: data.banners || [], activities: data.activities || [], wechatEntry: data.wechatEntry || null });
        setHomeError("");
      })
      .catch(() => setHomeError("首页内容暂时加载失败，请稍后再试。"));
  }, []);

  useEffect(() => {
    publicApi<Dict[]>("/api/public/food/categories")
      .then((data) => setFoodCategories(data.length ? data : [{ id: "all", name: "全部" }]))
      .catch(() => setFoodCategories([{ id: "all", name: "全部" }, { id: "烧烤夜宵", name: "烧烤夜宵" }]));
  }, []);

  useEffect(() => {
    publicApi<Dict[]>(`/api/public/food/merchants?categoryId=${encodeURIComponent(foodCategory)}`)
      .then((data) => { setFoodMerchants(data || []); setFoodError(""); })
      .catch(() => { setFoodMerchants(mockMerchants.filter((item) => item.category === "food")); setFoodError("当前使用本地试点数据。"); });
  }, [foodCategory]);

  useEffect(() => {
    publicApi<Dict[]>("/api/public/services/categories")
      .then((data) => {
        setServiceCategories(data || []);
        if (!serviceKey && data?.[0]?.key) setServiceKey(data[0].key);
      })
      .catch(() => {
        setServiceCategories([{ id: "mock-print-cat", key: "print", name: "打印装订" }, { id: "mock-care-cat", key: "care", name: "洗护理发" }, { id: "mock-rent-cat", key: "rent", name: "租房驾校" }]);
        if (!serviceKey) setServiceKey("print");
      });
  }, []);

  useEffect(() => {
    if (!serviceKey) return;
    publicApi<Dict[]>(`/api/public/services/merchants?serviceKey=${encodeURIComponent(serviceKey)}`)
      .then((data) => { setServiceMerchants(data || []); setServiceError(""); })
      .catch(() => { setServiceMerchants(mockMerchants.filter((item) => item.serviceId === serviceKey)); setServiceError("当前使用本地试点数据。"); });
  }, [serviceKey]);

  useEffect(() => {
    publicApi<string[]>("/api/public/community/types")
      .then((data) => setCommunityTypes(data.length ? data : ["全部"]))
      .catch(() => setCommunityTypes(["全部", "校园墙", "拼饭"]));
  }, []);

  useEffect(() => {
    publicApi<Dict[]>(`/api/public/community/posts?type=${encodeURIComponent(communityType)}`)
      .then((data) => { setCommunityPosts(data || []); setCommunityError(""); })
      .catch(() => { setCommunityPosts(mockPosts); setCommunityError("当前使用本地试点数据。"); });
  }, [communityType]);

  useEffect(() => {
    if (!selectedMerchantId) {
      setMerchant(null);
      return;
    }
    setLoadingMerchant(true);
    const mock = mockMerchants.find((item) => item.id === selectedMerchantId);
    if (mock) {
      setMerchant(mock);
      setLoadingMerchant(false);
      return;
    }
    publicApi<Dict>(`/api/public/merchants/${encodeURIComponent(selectedMerchantId)}`)
      .then(setMerchant)
      .catch(() => setMerchant(null))
      .finally(() => setLoadingMerchant(false));
  }, [selectedMerchantId]);

  useEffect(() => {
    if (!selectedPostId) {
      setPostDetail(null);
      return;
    }
    setLoadingPost(true);
    const mock = mockPosts.find((item) => item.id === selectedPostId);
    if (mock) {
      setPostDetail(mock);
      setLoadingPost(false);
      return;
    }
    publicApi<Dict>(`/api/public/community/posts/${encodeURIComponent(selectedPostId)}`)
      .then(setPostDetail)
      .catch(() => setPostDetail(null))
      .finally(() => setLoadingPost(false));
  }, [selectedPostId]);

  async function chooseFood() {
    setHasDrawnFood(true);
    try {
      setRandomFood(await publicApi<Dict | null>("/api/public/food/random"));
    } catch {
      setRandomFood(null);
    }
  }

  function switchTab(id: H5Tab) {
    setActiveTab(id);
    setSelectedMerchantId("");
    setSelectedPostId("");
    window.history.replaceState(null, "", id === "home" ? (window.location.pathname === "/" ? "/" : "/student") : `${window.location.pathname === "/" ? "/" : "/student"}#${id}`);
  }

  function openMerchant(id?: string) {
    if (!id) return;
    firePublicLog("clicks", id, activeTab === "services" ? "service-list" : activeTab === "food" ? "food-list" : "home", { target: "merchant-detail" });
    setSelectedMerchantId(id);
    window.history.replaceState(null, "", `/student?merchantId=${encodeURIComponent(id)}`);
  }

  function openPost(id?: string) {
    if (!id) return;
    setSelectedPostId(id);
    window.history.replaceState(null, "", `/student?postId=${encodeURIComponent(id)}`);
  }

  function closeMerchant() {
    setSelectedMerchantId("");
    window.history.replaceState(null, "", window.location.pathname === "/" ? "/" : "/student");
  }

  function closePost() {
    setSelectedPostId("");
    window.history.replaceState(null, "", window.location.pathname === "/" ? "/" : "/student#community");
  }

  async function likePost(id: string) {
    const key = "nwuSessionId";
    const sessionId = localStorage.getItem(key) || `h5-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    localStorage.setItem(key, sessionId);
    const result = await publicWrite<{ likeCount: number }>(`/api/public/community/posts/${encodeURIComponent(id)}/like`, { sessionId });
    setPostDetail((current) => current && current.id === id ? { ...current, likeCount: result.likeCount } : current);
    setCommunityPosts((items) => items.map((item) => item.id === id ? { ...item, likeCount: result.likeCount } : item));
  }

  function showWechatToast() {
    setToast("请添加西大圈微信，活动报名、反馈合作和发帖入口都会优先开放。");
    window.setTimeout(() => setToast(""), 2600);
  }

  const fallbackHero = asset("h5-hero-campus-life.png");
  const heroBanners = [
    ...home.banners.map((item) => ({ ...item, image: webImage(item.image) })),
    { id: "brand-hero", title: "摸摸圈圈头，万事不用愁", subtitle: "西大圈校园生活入口", image: fallbackHero, targetType: "about" }
  ].filter((item) => item.image);

  if (selectedMerchantId) {
    return (
      <main className="student-page">
        <section className="h5-shell">
          <button className="h5-back" onClick={closeMerchant}><ChevronLeft size={18} />返回美食</button>
          {loadingMerchant && <div className="empty-card">商家信息加载中...</div>}
          {!loadingMerchant && !merchant && <div className="empty-card">商家暂时不可查看。</div>}
          {merchant && <MerchantDetail merchant={merchant} />}
        </section>
        <TabBar active={activeTab} onChange={switchTab} />
      </main>
    );
  }

  if (selectedPostId) {
    return (
      <main className="student-page">
        <section className="h5-shell">
          <button className="h5-back" onClick={closePost}><ChevronLeft size={18} />返回讨论区</button>
          {loadingPost && <div className="empty-card">帖子加载中...</div>}
          {!loadingPost && !postDetail && <div className="empty-card">帖子暂时不可查看。</div>}
          {postDetail && <PostDetail post={postDetail} onLike={likePost} />}
        </section>
        <TabBar active="community" onChange={switchTab} />
      </main>
    );
  }

  return (
    <main className="student-page">
      <section className="h5-shell">
        {activeTab === "home" && <HomeTab banners={heroBanners} activities={home.activities} wechatEntry={home.wechatEntry} homeError={homeError} randomFood={randomFood} hasDrawnFood={hasDrawnFood} onChooseFood={chooseFood} onOpenMerchant={openMerchant} onTab={switchTab} onWechat={showWechatToast} />}
        {activeTab === "food" && <FoodTab categories={foodCategories} activeCategory={foodCategory} merchants={foodMerchants} error={foodError} onCategory={setFoodCategory} onOpenMerchant={openMerchant} />}
        {activeTab === "driving" && <DrivingTab onWechat={showWechatToast} />}
        {activeTab === "services" && <ServicesTab categories={serviceCategories} activeKey={serviceKey} merchants={serviceMerchants} error={serviceError} onCategory={setServiceKey} onOpenMerchant={openMerchant} />}
        {activeTab === "community" && <CommunityTab types={communityTypes} activeType={communityType} posts={communityPosts} error={communityError} onType={setCommunityType} onOpenPost={openPost} onSubmitted={() => {
          publicApi<string[]>("/api/public/community/types").then((data) => setCommunityTypes(data.length ? data : ["全部"])).catch(() => undefined);
          publicApi<Dict[]>(`/api/public/community/posts?type=${encodeURIComponent(communityType)}`).then((data) => setCommunityPosts(data || [])).catch(() => undefined);
        }} />}
        {activeTab === "about" && <AboutTab onWechat={showWechatToast} />}
      </section>
      <TabBar active={activeTab} onChange={switchTab} />
      {toast && <div className="h5-toast">{toast}</div>}
    </main>
  );
}

function TabBar({ active, onChange }: { active: H5Tab; onChange: (id: H5Tab) => void }) {
  return (
    <div className="h5-tabbar">
      {h5Tabs.map(({ id, label, Icon }) => (
        <button key={id} className={active === id ? "active" : ""} onClick={() => onChange(id)}>
          <Icon size={20} />
          <span>{label}</span>
        </button>
      ))}
    </div>
  );
}

function HomeTab({ banners, activities, wechatEntry, homeError, randomFood, hasDrawnFood, onChooseFood, onOpenMerchant, onTab, onWechat }: {
  banners: Dict[]; activities: Dict[]; wechatEntry: Dict | null; homeError: string; randomFood: Dict | null; hasDrawnFood: boolean;
  onChooseFood: () => void; onOpenMerchant: (id?: string) => void; onTab: (id: H5Tab) => void; onWechat: () => void;
}) {
  function handleBanner(item: Dict) {
    if (item.targetType === "activity") onOpenMerchant(activities.find((activity) => activity.id === item.targetId)?.merchantId);
    if (item.targetType === "tab" && item.targetId && h5Tabs.some((tab) => tab.id === item.targetId)) onTab(item.targetId as H5Tab);
    if (item.targetType === "service") onTab("services");
    if (item.targetType === "about") onTab("about");
    if (item.targetType === "url" && item.url) window.location.href = item.url;
  }

  return (
    <>
      <section className="h5-hero">
        <div className="h5-carousel">
          {banners.slice(0, 4).map((item) => (
            <button key={item.id} className="h5-slide" onClick={() => handleBanner(item)}>
              <img src={item.image} alt={item.title || "西大圈校园生活"} />
              <div className="h5-slide-copy">
                <span><Sparkles size={14} />西大圈</span>
                <h1>{item.title || "摸摸圈圈头，万事不用愁"}</h1>
                <p>{item.subtitle || "校园吃喝玩乐和生活服务，一个入口就够。"}</p>
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className="h5-section">
        <SectionTitle title="今日活动" desc="校园福利和周边好店" />
        {homeError && <p className="muted-line">{homeError}</p>}
        <div className="h5-activity-list">
          {activities.map((item) => <ActivityCard key={item.id} activity={item} onOpen={onOpenMerchant} />)}
          {!activities.length && !homeError && <EmptyCard title="今天暂无上架活动" text="先加入西大圈微信，第一时间接收新福利。" />}
        </div>
      </section>

      <section className="h5-slot">
        <div>
          <span><Utensils size={16} />抽签吃饭</span>
          <strong>{randomFood ? randomFood.name : "今天交给西大圈"}</strong>
          <p>{randomFood ? randomFood.recommendation || randomFood.discount || "这家今天值得试试。" : "选择困难时，随机抽一家校边美食；暂无可抽商家时会提示空态。"}</p>
        </div>
        <div className="h5-slot-actions">
          <button onClick={onChooseFood}><Shuffle size={18} />开抽</button>
          {randomFood && <button className="secondary" onClick={() => onOpenMerchant(randomFood.id)}><ChevronRight size={18} />进店</button>}
        </div>
      </section>
      {hasDrawnFood && !randomFood && <EmptyCard title="暂无可抽美食" text="后台上架美食商家并开启随机推荐后，这里会抽出真实商家。" />}

      <WechatBlock entry={wechatEntry} onWechat={onWechat} />
    </>
  );
}

function useExposureLog(merchantId?: string, scene = "home", activityId?: string) {
  const ref = useRef<HTMLButtonElement | null>(null);
  useEffect(() => {
    const node = ref.current;
    if (!node || !merchantId) return;
    const key = `nwuExposure:${scene}:${merchantId}:${activityId || ""}`;
    if (sessionStorage.getItem(key)) return;
    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      sessionStorage.setItem(key, "1");
      firePublicLog("exposures", merchantId, scene, activityId ? { activityId } : {});
      observer.disconnect();
    }, { threshold: 0.45 });
    observer.observe(node);
    return () => observer.disconnect();
  }, [merchantId, scene, activityId]);
  return ref;
}

function FoodTab({ categories, activeCategory, merchants, error, onCategory, onOpenMerchant }: {
  categories: Dict[]; activeCategory: string; merchants: Dict[]; error: string;
  onCategory: (id: string) => void; onOpenMerchant: (id?: string) => void;
}) {
  return (
    <>
      <PageHero icon={<Coffee size={18} />} title="今天吃什么" text="按分类找附近好吃的，优惠、人均和距离一眼扫完。" />
      <ChipRow items={categories.map((item) => ({ id: item.id, label: item.name }))} active={activeCategory} onChange={onCategory} />
      {error && <p className="muted-line">{error}</p>}
      <div className="h5-list">
        {merchants.map((merchant) => <MerchantCard key={merchant.id} merchant={merchant} onOpen={onOpenMerchant} />)}
        {!merchants.length && !error && <EmptyCard title="这个分类正在招募" text="你推荐的宝藏店，可以通过西大圈微信告诉我们。" />}
      </div>
    </>
  );
}

function DrivingTab({ onWechat }: { onWechat: () => void }) {
  return (
    <>
      <section className="h5-driving">
        <img src={asset("h5-driving-promo.png")} alt="校园驾校" />
        <div>
          <span><Car size={15} />西大圈严选驾校</span>
          <h1>课少也能稳稳学车</h1>
          <p>就近练车、灵活约课、流程透明，适合西大学生从报名到拿证一路跟进。</p>
        </div>
      </section>
      <InfoBand items={[
        ["练车环境", "标准场地、路线清晰，训练节奏适合学生时间。"],
        ["模式优点", "小班沟通、预约灵活、费用明细提前确认。"],
        ["报名流程", "微信咨询、确认班型、提交资料、安排体检与练车。"]
      ]} />
      <section className="h5-qr-panel">
        <img src={qrPlaceholder} alt="咨询二维码占位图" />
        <div>
          <h2>扫码咨询班型</h2>
          <p>报名优惠、练车时间和接送安排，以西大圈微信咨询为准。</p>
          <button onClick={onWechat}><Phone size={17} />联系西大圈</button>
        </div>
      </section>
    </>
  );
}

function ServicesTab({ categories, activeKey, merchants, error, onCategory, onOpenMerchant }: {
  categories: Dict[]; activeKey: string; merchants: Dict[]; error: string;
  onCategory: (key: string) => void; onOpenMerchant: (id?: string) => void;
}) {
  const entries = [
    { id: "print", title: "打印装订", scene: "论文装订/课程资料", aliases: ["print", "printing", "copy", "binding", "打印", "打印复印", "打印装订"] },
    { id: "care", title: "洗护理发", scene: "洗衣洗头/理发", aliases: ["laundry", "wash", "hair", "barber", "洗护", "洗衣", "理发", "洗护理发"] },
    { id: "play", title: "休闲娱乐", scene: "台球棋牌/KTV", aliases: ["ktv", "entertainment", "billiards", "chess", "娱乐", "休闲", "休闲娱乐", "台球", "棋牌"] },
    { id: "girls", title: "女生精选", scene: "美甲护肤/形象管理", aliases: ["beauty", "nail", "skin", "makeup", "photo", "女生", "女生精选", "美甲", "护肤", "证件照"] },
    { id: "rent", title: "租房驾校", scene: "短租合租/报名练车", aliases: ["rent", "house", "driving", "driver", "car", "租房", "驾校", "租房驾校"] },
    { id: "work", title: "兼职考证", scene: "靠谱兼职/证书考试", aliases: ["job", "parttime", "part-time", "certificate", "exam", "兼职", "考证", "兼职考证"] }
  ];
  const normalize = (value?: string) => (value || "").toLowerCase().replace(/\s|_|-/g, "");
  const categoryFor = (entry: typeof entries[number]) => categories.find((category) => {
    const key = normalize(category.key);
    const name = normalize(category.name);
    return entry.aliases.some((alias) => {
      const normalizedAlias = normalize(alias);
      return key === normalizedAlias || name === normalizedAlias || key.includes(normalizedAlias) || name.includes(normalizedAlias);
    });
  });
  const initialEntry = entries.find((entry) => categoryFor(entry)?.key === activeKey)?.id || entries[0].id;
  const [selectedEntry, setSelectedEntry] = useState(initialEntry);
  const selectedConfig = entries.find((entry) => entry.id === selectedEntry) || entries[0];
  const matchedCategory = categoryFor(selectedConfig);
  const showMerchants = Boolean(matchedCategory?.key && matchedCategory.key === activeKey);

  useEffect(() => {
    const matchedEntry = entries.find((entry) => categoryFor(entry)?.key === activeKey);
    if (matchedEntry) setSelectedEntry(matchedEntry.id);
  }, [activeKey, categories]);

  function chooseEntry(entry: typeof entries[number]) {
    setSelectedEntry(entry.id);
    const category = categoryFor(entry);
    if (category?.key) onCategory(category.key);
  }

  return (
    <>
      <PageHero icon={<Wrench size={18} />} title="生活服务" text="打印洗护娱乐租房，先看学生常用和可信推荐。" />
      <section className="service-entry-grid" aria-label="生活服务入口">
        {entries.map((entry) => {
          const category = categoryFor(entry);
          const isActive = selectedEntry === entry.id;
          return (
            <button key={entry.id} className={isActive ? "active" : ""} onClick={() => chooseEntry(entry)}>
              <strong>{entry.title}</strong>
              <span>{entry.scene}</span>
              {!category && <em>调研中</em>}
            </button>
          );
        })}
      </section>
      <section className="service-trust-row" aria-label="可信筛选">
        <span><ShieldCheck size={14} />西大学生常用</span>
        <span><MapPin size={14} />距离/价格清楚</span>
        <span><MessageCircle size={14} />可反馈纠错</span>
      </section>
      {error && <p className="muted-line">{error}</p>}
      <div className="h5-list">
        {showMerchants && merchants.map((merchant) => <MerchantCard key={merchant.id} merchant={merchant} onOpen={onOpenMerchant} />)}
        {(!showMerchants || !merchants.length) && !error && <EmptyCard title={`${selectedConfig.title}还在调研中`} text="这个服务还在调研中，推荐你知道的靠谱店，西大圈优先补充，也可以通过微信反馈纠错。" />}
      </div>
    </>
  );
}

function CommunityTab({ types, activeType, posts, error, onType, onOpenPost, onSubmitted }: {
  types: string[]; activeType: string; posts: Dict[]; error: string; onType: (type: string) => void; onOpenPost: (id?: string) => void; onSubmitted: () => void;
}) {
  const [showForm, setShowForm] = useState(false);
  return (
    <>
      <PageHero icon={<MessageCircle size={18} />} title="校园讨论区" text="发布后进入后台审核，通过后公开展示。" action={<button onClick={() => setShowForm((value) => !value)}><Plus size={16} />发布</button>} />
      {showForm && <PostSubmitForm onDone={() => { setShowForm(false); onSubmitted(); }} />}
      <ChipRow items={types.map((type) => ({ id: type, label: type }))} active={activeType} onChange={onType} />
      {error && <p className="muted-line">{error}</p>}
      <div className="h5-post-list">
        {posts.map((post) => <PostCard key={post.id} post={post} onOpen={onOpenPost} />)}
        {!posts.length && !error && <EmptyCard title="还没有内容" text="可以发布校园墙、拼饭、二手和信息投稿，审核后展示。" />}
      </div>
    </>
  );
}

function PostSubmitForm({ onDone }: { onDone: () => void }) {
  const [form, setForm] = useState({ type: "校园墙", title: "", content: "", authorNickname: "", contact: "" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setMessage("");
    try {
      await publicWrite("/api/public/community/posts", form);
      setMessage("投稿成功，审核后展示。");
      setForm({ type: "校园墙", title: "", content: "", authorNickname: "", contact: "" });
      window.setTimeout(onDone, 900);
    } catch (err) {
      setError(err instanceof Error ? err.message : "投稿失败");
    }
  }

  return (
    <form className="h5-post-form" onSubmit={submit}>
      <div className="post-form-grid">
        <label>类型<input value={form.type} onChange={(e) => setForm((current) => ({ ...current, type: e.target.value }))} /></label>
        <label>昵称<input value={form.authorNickname} onChange={(e) => setForm((current) => ({ ...current, authorNickname: e.target.value }))} /></label>
      </div>
      <label>标题<input value={form.title} maxLength={80} onChange={(e) => setForm((current) => ({ ...current, title: e.target.value }))} /></label>
      <label>正文<textarea value={form.content} maxLength={2000} onChange={(e) => setForm((current) => ({ ...current, content: e.target.value }))} /></label>
      <label>联系方式<input value={form.contact} placeholder="微信或手机号，仅后台可见" onChange={(e) => setForm((current) => ({ ...current, contact: e.target.value }))} /></label>
      {message && <p className="success">{message}</p>}
      {error && <p className="error">{error}</p>}
      <button className="primary"><Send size={16} />提交审核</button>
    </form>
  );
}

function PostCard({ post, onOpen }: { post: Dict; onOpen: (id?: string) => void }) {
  return (
    <button className="h5-post" onClick={() => onOpen(post.id)}>
      <span>{post.type}</span>
      <h2>{post.title}</h2>
      <p>{post.summary}</p>
      <div><CalendarDays size={14} />{post.time}<ThumbsUp size={14} />{post.likeCount ?? 0}<MessageCircle size={14} />{post.commentCount ?? 0}</div>
    </button>
  );
}

function PostDetail({ post, onLike }: { post: Dict; onLike: (id: string) => Promise<void> }) {
  const [liking, setLiking] = useState(false);
  async function like() {
    setLiking(true);
    try {
      await onLike(post.id);
    } finally {
      setLiking(false);
    }
  }
  return (
    <article className="post-detail">
      <span>{post.type}</span>
      <h1>{post.title}</h1>
      <div className="post-detail-meta"><CalendarDays size={14} />{post.time}<span>{post.authorNickname || "匿名同学"}</span><span>{post.viewCount ?? 0} 浏览</span></div>
      <p>{post.content || post.summary}</p>
      <button onClick={like} disabled={liking}><ThumbsUp size={16} />{post.likeCount ?? 0}</button>
    </article>
  );
}

function AboutTab({ onWechat }: { onWechat: () => void }) {
  return (
    <>
      <section className="h5-about-hero">
        <img src={asset("h5-wechat-promo.png")} alt="西大圈微信社区" />
        <div>
          <span><Heart size={15} />西大圈</span>
          <h1>摸摸圈圈头，万事不用愁</h1>
          <p>我们把西大周边的吃喝玩乐、活动福利、驾校服务和生活刚需整理到一个手机入口里。</p>
        </div>
      </section>
      <InfoBand items={[
        ["找福利", "活动、优惠券、团购和新品体验统一整理。"],
        ["找服务", "校园周边商家先筛选，再持续补充真实信息。"],
        ["找反馈", "好店推荐、商家合作、问题反馈都从微信入口开始。"]
      ]} />
      <section className="h5-qr-panel">
        <img src={qrPlaceholder} alt="西大圈微信二维码占位图" />
        <div>
          <h2>加入西大圈微信</h2>
          <p>合作、反馈、活动报名和讨论区发布入口，优先在微信处理。</p>
          <button onClick={onWechat}><Send size={17} />添加微信</button>
        </div>
      </section>
    </>
  );
}

function MerchantDetail({ merchant }: { merchant: Dict }) {
  const coupons = Array.isArray(merchant.coupons) ? merchant.coupons : [];
  const menu = Array.isArray(merchant.menu) ? merchant.menu : [];
  const cover = webImage(merchant.image) || asset("h5-hero-campus-life.png");
  const qr = webImage(merchant.qrImage || merchant.qrImageUrl) || qrPlaceholder;
  const claimStorageKey = `nwuLastClaim:${merchant.id}`;
  const [claimResult, setClaimResult] = useState<Dict | null>(() => JSON.parse(localStorage.getItem(claimStorageKey) || "null"));
  return (
    <article className="merchant-detail">
      <section className="merchant-cover-wrap">
        <img className="merchant-cover" src={cover} alt={merchant.name} />
        <div className="merchant-head">
          <span>{merchant.foodCategory || merchant.serviceId || "校园商家"}</span>
          <h1>{merchant.name}</h1>
          <p>{merchant.recommendation || "西大圈推荐商家"}</p>
        </div>
      </section>
      <div className="merchant-metrics">
        <div><Star size={15} />{merchant.rating ? `${merchant.rating} 分` : "口碑推荐"}</div>
        <div><BadgePercent size={15} />{merchant.discount || "到店咨询优惠"}</div>
        <div><MapPin size={15} />{merchant.distance || merchant.distanceText || "校边商圈"}</div>
      </div>
      <section className="detail-block">
        <h2>菜单推荐</h2>
        <div className="menu-list">
          {menu.map((item: Dict, index: number) => <div key={`${item.name}-${index}`}><span>{item.name}</span><strong>{item.price ? `¥${item.price}` : "到店咨询"}</strong></div>)}
          {!menu.length && <EmptyCard title="菜单待补充" text="可以先看优惠和推荐理由。" />}
        </div>
      </section>
      <section className="detail-block">
        <h2>到店信息</h2>
        <div className="info-grid">
          <div><MapPin size={17} /><span>{merchant.address || "地址待补充"}</span></div>
          <div><Phone size={17} /><span>{merchant.phone || "电话待补充"}</span></div>
          <div><Clock size={17} /><span>{merchant.businessHours || "营业时间待补充"}</span></div>
        </div>
      </section>
      <section className="detail-block">
        <h2>优惠券</h2>
        {claimResult && <ClaimSuccess result={claimResult} merchant={merchant} />}
        <div className="coupon-list">
          {coupons.map((coupon: Dict) => <CouponClaimCard key={coupon.id} coupon={coupon} merchant={merchant} onClaimed={(result) => {
            localStorage.setItem(claimStorageKey, JSON.stringify(result));
            setClaimResult(result);
          }} />)}
          {!coupons.length && <EmptyCard title="暂无可领取优惠券" text="进群咨询可能有隐藏福利。" />}
        </div>
      </section>
      {Array.isArray(merchant.highlights) && merchant.highlights.length > 0 && (
        <section className="detail-block">
          <h2>推荐理由</h2>
          <div className="tag-row">{merchant.highlights.map((item: string) => <span key={item}>{item}</span>)}</div>
        </section>
      )}
      <section className="h5-qr-panel">
        <img src={qr} alt="商家群二维码占位图" />
        <div>
          <h2>进群问福利</h2>
          <p>二维码暂用占位图，真实商家群后续由后台素材替换。</p>
        </div>
      </section>
      <WechatBlock />
    </article>
  );
}

function CouponClaimCard({ coupon, merchant, onClaimed }: { coupon: Dict; merchant: Dict; onClaimed: (result: Dict) => void }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ studentName: "", phone: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (coupon.id?.startsWith("mock-")) {
        onClaimed({ code: `MOCK${Math.floor(100000 + Math.random() * 900000)}`, coupon, merchant, user: { name: form.studentName || "西大学生", phone: form.phone }, claimedAt: new Date().toISOString() });
      } else {
        const result = await publicWrite<Dict>(`/api/public/coupons/${encodeURIComponent(coupon.id)}/claim`, { ...form, ...attribution("coupon-claim") });
        onClaimed(result);
      }
      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "领取失败");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="coupon-card">
      <strong>{coupon.title}</strong>
      <span>{coupon.description || "到店使用请咨询商家"}</span>
      <button className="claim-open" onClick={() => setOpen((value) => !value)}><Ticket size={16} />领取</button>
      {open && (
        <form className="claim-form" onSubmit={submit}>
          <label>昵称<input value={form.studentName} required onChange={(event) => setForm((current) => ({ ...current, studentName: event.target.value }))} /></label>
          <label>手机号<input value={form.phone} required onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))} /></label>
          {error && <p className="error">{error}</p>}
          <button className="primary" disabled={loading}>{loading ? "领取中..." : "确认领取"}</button>
        </form>
      )}
    </div>
  );
}

function ClaimSuccess({ result, merchant }: { result: Dict; merchant: Dict }) {
  return (
    <section className="claim-success">
      <span><ShieldCheck size={15} />领取成功</span>
      <strong>{result.code}</strong>
      <p>到店出示核销码，由商家在核销端确认使用。请在有效期内使用，同一手机号同券限领一次。</p>
      <div>
        <small>{merchant.address || "地址待补充"}</small>
        <small>{merchant.phone || "电话待补充"}</small>
        <small>{merchant.businessHours || "营业时间待补充"}</small>
      </div>
    </section>
  );
}

function SectionTitle({ title, desc }: { title: string; desc?: string }) {
  return <div className="section-title"><h2>{title}</h2>{desc && <span>{desc}</span>}</div>;
}

function PageHero({ icon, title, text, action }: { icon: React.ReactNode; title: string; text: string; action?: React.ReactNode }) {
  return <section className="h5-page-hero"><div><span>{icon}西大圈</span><h1>{title}</h1><p>{text}</p></div>{action}</section>;
}

function ChipRow({ items, active, onChange }: { items: { id: string; label: string }[]; active: string; onChange: (id: string) => void }) {
  return <div className="h5-chip-row">{items.map((item) => <button key={item.id} className={active === item.id ? "active" : ""} onClick={() => onChange(item.id)}>{item.label}</button>)}</div>;
}

function ActivityCard({ activity, onOpen }: { activity: Dict; onOpen: (id?: string) => void }) {
  const ref = useExposureLog(activity.merchantId, "home", activity.id);
  return (
    <button ref={ref} className={`h5-activity-card ${webImage(activity.image) ? "has-image" : ""}`} onClick={() => onOpen(activity.merchantId)}>
      {webImage(activity.image) && <img src={webImage(activity.image)} alt={activity.title} />}
      <div>
        <span><Gift size={14} />{activity.discount || "校园福利"}</span>
        <strong>{activity.title}</strong>
        <em>{activity.cta || "去看看"}<ChevronRight size={14} /></em>
      </div>
    </button>
  );
}

function MerchantCard({ merchant, onOpen }: { merchant: Dict; onOpen: (id?: string) => void }) {
  const scene = merchant.category === "service" ? "service-list" : "food-list";
  const ref = useExposureLog(merchant.id, scene);
  return (
    <button ref={ref} className="h5-merchant-card" onClick={() => onOpen(merchant.id)}>
      <img src={webImage(merchant.image) || asset("banner-campus.jpg")} alt={merchant.name} />
      <div>
        <div className="merchant-card-head"><strong>{merchant.name}</strong><span>{merchant.avgPrice ? `¥${merchant.avgPrice}/人` : "价格待补"}</span></div>
        <p>{merchant.recommendation || "西大圈推荐商家"}</p>
        <div className="merchant-card-meta"><span><BadgePercent size={13} />{merchant.discount || "到店咨询优惠"}</span><span>{merchant.distance || merchant.distanceText || "校边"}</span></div>
        {Array.isArray(merchant.tags) && <div className="mini-tags">{merchant.tags.slice(0, 3).map((tag: string) => <span key={tag}>{tag}</span>)}</div>}
      </div>
    </button>
  );
}

function WechatBlock({ entry, onWechat }: { entry?: Dict | null; onWechat?: () => void }) {
  if (entry === null) return null;
  const title = entry?.title || "加入西大圈微信";
  const description = entry?.description || "领活动、问优惠、推荐好店、反馈问题，都从这里开始。";
  const buttonText = entry?.buttonText || "添加微信";
  const image = webImage(entry?.imageUrl) || asset("h5-wechat-promo.png");
  return (
    <section className="h5-wechat">
      <img src={image} alt={title} />
      <div>
        <span><QrCode size={15} />微信入口</span>
        <h2>{title}</h2>
        <p>{description}</p>
        {onWechat && <button onClick={onWechat}><Send size={16} />{buttonText}</button>}
      </div>
    </section>
  );
}

function InfoBand({ items }: { items: string[][] }) {
  return <section className="h5-info-band">{items.map(([title, text]) => <div key={title}><ShieldCheck size={18} /><strong>{title}</strong><p>{text}</p></div>)}</section>;
}

function EmptyCard({ title, text }: { title: string; text: string }) {
  return <div className="empty-card"><strong>{title}</strong><span>{text}</span></div>;
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
  const path = window.location.pathname;
  if (path === "/") return <EntryPage />;
  if (path === "/merchant" || path.startsWith("/merchant/")) return <MerchantApp />;
  const isAdmin = path === "/admin" || path.startsWith("/admin/");
  if (!isAdmin) return <StudentHome />;
  return <AdminApp />;
}

function EntryPage() {
  return (
    <main className="entry-page">
      <section className="entry-shell">
        <div className="entry-brand">
          <span><Sparkles size={16} />西大圈试点版</span>
          <h1>摸摸圈圈头，万事不用愁</h1>
          <p>学生领券、商家核销、平台看板从同一个地址进入。</p>
        </div>
        <div className="entry-grid">
          <a href="/student"><Utensils size={24} /><strong>学生端</strong><span>找美食服务，领周边优惠</span></a>
          <a href="/merchant"><Store size={24} /><strong>商家核销端</strong><span>核销优惠券，查看今日数据</span></a>
          <a href="/admin"><BarChart3 size={24} /><strong>管理后台</strong><span>维护内容，查看试点转化</span></a>
        </div>
      </section>
    </main>
  );
}

function MerchantApp() {
  const [token, setToken] = useState(localStorage.getItem("merchantToken") || "");
  const [user, setUser] = useState<Dict | null>(() => JSON.parse(localStorage.getItem("merchantUser") || "null"));
  if (!token) return <MerchantLogin onLogin={(nextToken, nextUser) => { setToken(nextToken); setUser(nextUser); }} />;
  return <MerchantConsole token={token} user={user} onLogout={() => {
    localStorage.removeItem("merchantToken");
    localStorage.removeItem("merchantUser");
    setToken("");
    setUser(null);
  }} />;
}

function MerchantLogin({ onLogin }: { onLogin: (token: string, user: Dict) => void }) {
  const [account, setAccount] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ account, password }) });
      const body = await res.json();
      if (!res.ok || body.success === false) throw new Error(body.message || "登录失败");
      if (body.data.user.role !== "MERCHANT" && body.data.user.role !== "ADMIN") throw new Error("当前账号不是商家账号");
      localStorage.setItem("merchantToken", body.data.token);
      localStorage.setItem("merchantUser", JSON.stringify(body.data.user));
      onLogin(body.data.token, body.data.user);
    } catch (err) {
      setError(err instanceof Error ? err.message : "登录失败");
    }
  }

  return (
    <main className="merchant-page">
      <form className="merchant-login" onSubmit={submit}>
        <h1>商家核销端</h1>
        <label>账号<input value={account} autoComplete="username" onChange={(event) => setAccount(event.target.value)} /></label>
        <label>密码<input type="password" value={password} autoComplete="current-password" onChange={(event) => setPassword(event.target.value)} /></label>
        {error && <p className="error">{error}</p>}
        <button className="primary">登录</button>
      </form>
    </main>
  );
}

function MerchantConsole({ token, user, onLogout }: { token: string; user: Dict | null; onLogout: () => void }) {
  const [overview, setOverview] = useState<Dict>({});
  const [summary, setSummary] = useState<Dict>({});
  const [code, setCode] = useState("");
  const [preview, setPreview] = useState<Dict | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function load() {
    const [nextOverview, nextSummary] = await Promise.all([
      api<Dict>(token, "/api/merchant/overview"),
      api<Dict>(token, "/api/merchant/analytics/summary?range=today")
    ]);
    setOverview(nextOverview);
    setSummary(nextSummary);
  }

  useEffect(() => { load().catch((err) => setError(err instanceof Error ? err.message : "数据加载失败")); }, [token]);

  async function previewCode(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setMessage("");
    setPreview(null);
    try {
      setPreview(await api<Dict>(token, `/api/merchant/redeem/preview?code=${encodeURIComponent(code.trim())}`));
    } catch (err) {
      setError(err instanceof Error ? err.message : "核销码不可用");
    }
  }

  async function redeem() {
    setError("");
    setMessage("");
    try {
      await api<Dict>(token, "/api/merchant/redeem", { method: "POST", body: JSON.stringify({ code: code.trim() }) });
      setMessage("核销成功");
      setPreview(null);
      setCode("");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "核销失败");
    }
  }

  const cards = [
    ["今日核销", summary.redemptionCount], ["今日领取", summary.claimCount], ["今日曝光", summary.exposureCount], ["今日点击", summary.clickCount]
  ];

  return (
    <main className="merchant-page">
      <section className="merchant-console">
        <header>
          <div><span>{user?.name || "商家账号"}</span><h1>{overview.merchant?.name || "商家核销台"}</h1></div>
          <button onClick={onLogout}><LogOut size={16} />退出</button>
        </header>
        <div className="merchant-stat-grid">{cards.map(([label, value]) => <div key={label}><span>{label}</span><strong>{value ?? 0}</strong></div>)}</div>
        <form className="redeem-panel" onSubmit={previewCode}>
          <label>核销码<input value={code} placeholder="输入学生出示的核销码" onChange={(event) => setCode(event.target.value.toUpperCase())} /></label>
          <button className="primary">预览</button>
        </form>
        {preview && (
          <section className="redeem-preview">
            <span><Ticket size={15} />待核销优惠券</span>
            <h2>{preview.couponTitle || preview.coupon?.title || preview.userCoupon?.coupon?.title || "优惠券"}</h2>
            <p>核销码 {preview.code || code} · {preview.maskedPhone || preview.user?.phone || preview.student?.phone || "手机号未返回"}</p>
            <button className="primary" onClick={redeem}>确认核销</button>
          </section>
        )}
        {message && <p className="success">{message}</p>}
        {error && <p className="error">{error}</p>}
      </section>
    </main>
  );
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
        {section === "wechat" && <WechatEntryAdmin token={token} />}
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
    ["今日曝光", stats.todayExposures], ["今日点击", stats.todayClicks], ["今日领券", stats.todayClaims], ["今日核销", stats.todayRedemptions],
    ["商家数", stats.merchantCount], ["优惠券数", stats.couponCount], ["待审帖子", stats.pendingCommunityPostCount], ["可见帖子", stats.visibleCommunityPostCount]
  ];
  return (
    <Page title="概览" hint="平台内容、福利和今日转化数据。">
      <div className="stats">{cards.map(([label, value]) => <div className="stat" key={label}><span>{label}</span><strong>{value ?? 0}</strong></div>)}</div>
      <div className="rank-grid">
        <RankList title="TOP 商家" items={stats.topMerchants || []} valueKey="score" />
        <RankList title="TOP 优惠券" items={stats.topCoupons || []} valueKey="claimCount" />
        <RankList title="TOP 渠道" items={stats.topChannels || []} valueKey="exposureCount" />
      </div>
    </Page>
  );
}

function RankList({ title, items, valueKey }: { title: string; items: Dict[]; valueKey: string }) {
  return (
    <section className="rank-list">
      <h2>{title}</h2>
      {items.slice(0, 5).map((item, index) => <div key={`${title}-${index}`}><span>{item.name || item.title || item.channel || "未命名"}</span><strong>{item[valueKey] ?? 0}</strong></div>)}
      {!items.length && <p>暂无数据</p>}
    </section>
  );
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

function WechatEntryAdmin({ token }: { token: string }) {
  const defaults = { title: "加入西大圈微信", description: "领活动、问优惠、推荐好店、反馈问题，都从这里开始。", buttonText: "添加微信", imageUrl: "/assets/images/h5-wechat-promo.png", isActive: true };
  const [form, setForm] = useState<Dict>(defaults);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    api<Dict>(token, "/api/admin/wechat-entry")
      .then((data) => setForm({ ...defaults, ...data }))
      .catch((err) => setError(err instanceof Error ? err.message : "加载失败"));
  }, [token]);

  async function save(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setMessage("");
    try {
      const payload = { ...form, imageUrl: form.imageUrl || null };
      const data = await api<Dict>(token, "/api/admin/wechat-entry", { method: "PATCH", body: JSON.stringify(payload) });
      setForm({ ...defaults, ...data });
      setMessage("已保存，H5 首页会读取最新入口配置。");
    } catch (err) {
      setError(err instanceof Error ? err.message : "保存失败");
    }
  }

  return (
    <Page title="西大圈入口" hint="维护 H5 首页底部微信入口。图片和二维码使用 URL，不做本地上传。">
      <div className="crud-block">
        <form className="editor" onSubmit={save}>
          <Field name="title" label="标题" value={form.title} onChange={(value) => setForm((current) => ({ ...current, title: value }))} />
          <Field name="description" label="说明" type="textarea" value={form.description} onChange={(value) => setForm((current) => ({ ...current, description: value }))} />
          <Field name="buttonText" label="按钮文案" value={form.buttonText} onChange={(value) => setForm((current) => ({ ...current, buttonText: value }))} />
          <Field name="imageUrl" label="二维码/宣传图 URL" value={form.imageUrl} onChange={(value) => setForm((current) => ({ ...current, imageUrl: value }))} />
          <Field name="isActive" label="启用" type="checkbox" value={form.isActive} onChange={(value) => setForm((current) => ({ ...current, isActive: value }))} />
          {message && <p className="success">{message}</p>}
          {error && <p className="error">{error}</p>}
          <div className="actions"><button className="primary">保存入口</button></div>
        </form>
        <section className="wechat-preview">
          <WechatBlock entry={form} />
        </section>
      </div>
    </Page>
  );
}

function Food({ token }: { token: string }) {
  const base = useAdminData(token);
  const food = base.merchants.filter((item) => item.category?.slug === "food" || item.foodCategory);
  return <CrudPage token={token} title="美食运营工作台" hint="只维护美食商家，上架状态会实时影响前台列表、随机推荐和首页精选。" path="/api/admin/merchants" sourceItems={food} defaults={{ status: "APPROVED", randomWeight: 10, isFoodRecommendation: true }} fields={[
    ["name", "商家名"], ["categoryId", "基础类目", "select", base.categories], ["foodCategory", "餐饮分类"], ["avgPrice", "人均", "number"], ["distanceText", "距离文案"], ["recommendation", "推荐语"], ["tags", "标签逗号分隔", "csv"], ["highlights", "亮点逗号分隔", "csv"], ["menu", "菜单，每行 名称,价格", "menu"], ["coverImageUrl", "封面图 URL"], ["qrImageUrl", "群二维码 URL"], ["randomWeight", "随机权重", "number"], ["sortOrder", "排序", "number"], ["platformBoost", "首页加权", "number"], ["isFoodRecommendation", "参与随机推荐", "checkbox"], ["status", "上架状态", "select", ["PENDING", "APPROVED", "REJECTED", "SUSPENDED"]], ["address", "地址"]
  ]} columns={["name", "foodCategory", "recommendation", "platformBoost", "sortOrder", "randomWeight", "isFoodRecommendation", "status"]} transform={merchantTransform} onSaved={base.reloadBase} />;
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
  return <CrudPage token={token} title="论坛审核台" hint="学生投稿默认待审，联系方式仅后台查看；通过后前台列表和首页热帖才会展示。" path="/api/admin/community-posts" defaults={{ type: "校园墙", status: "VISIBLE", likeCount: 0, commentCount: 0, viewCount: 0, sortOrder: 100, source: "admin" }} fields={[
    ["type", "类型"], ["title", "标题"], ["summary", "内容摘要"], ["content", "正文", "textarea"], ["authorNickname", "昵称"], ["contact", "联系方式"], ["source", "来源"], ["likeCount", "点赞数", "number"], ["commentCount", "评论数", "number"], ["viewCount", "浏览数", "number"], ["status", "审核状态", "select", ["PENDING", "VISIBLE", "HIDDEN", "REJECTED"]], ["sortOrder", "排序", "number"]
  ]} columns={["status", "type", "title", "authorNickname", "contact", "likeCount", "viewCount", "sortOrder"]} transform={(item) => ({ ...item, content: item.content || item.summary })} />;
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
  if (type === "menu" || type === "textarea") {
    return <label>{label}<textarea value={normalized} onChange={(e) => onChange(e.target.value)} /></label>;
  }
  return <label>{label}<input type={type === "csv" ? "text" : type} name={name} value={normalized} onChange={(e) => onChange(type === "number" ? Number(e.target.value) : e.target.value)} /></label>;
}

function read(item: Dict, path: string) {
  return path.split(".").reduce<any>((current, part) => current?.[part], item);
}

createRoot(document.getElementById("root")!).render(<App />);
