import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { BarChart3, CalendarDays, Car, ChevronLeft, ChevronRight, Clock, Coffee, Gift, Heart, Home, Image, Info, ListChecks, LogOut, MapPin, MessageCircle, MessageSquareText, Phone, Plus, QrCode, Send, Shuffle, Sparkles, Store, Utensils, Wrench } from "lucide-react";
import { OssUploader } from "./OssUploader";
import AdminApp from "./admin";
import "./styles.css";

const API_BASE = import.meta.env.VITE_API_BASE ?? "";

type Dict = Record<string, any>;

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
  { id: "mock-bbq", category: "food", name: "北门阿强烧烤", image: asset("merchant-food-001.jpg"), distance: "北门步行6分钟", address: "西大北门美食街 18 号", phone: "13800000001", businessHours: "17:00-02:00", recommendation: "宿舍夜宵局常选，烤串出餐快。", qrImageUrl: qrPlaceholder },
  { id: "mock-print", category: "service", serviceId: "print", name: "西门快印装订", image: asset("merchant-print-001.jpg"), distance: "西门步行4分钟", address: "西大西门商业街 6 号", phone: "13800000002", businessHours: "08:30-22:30", recommendation: "课程资料、论文装订和证件照一站处理。", qrImageUrl: qrPlaceholder },
  { id: "mock-driving", category: "service", serviceId: "rent", name: "校园优选驾校", image: asset("driving-school.jpg"), distance: "校车接送", address: "西大周边训练场", phone: "13800000003", businessHours: "09:00-20:00", recommendation: "适合课表不固定的同学，练车时间可沟通。", qrImageUrl: qrPlaceholder },
  { id: "mock-hair", category: "service", serviceId: "care", name: "南门轻护理发", image: asset("h5-wechat-promo.png"), distance: "南门步行8分钟", address: "南门生活广场 2 楼", phone: "13800000004", businessHours: "10:00-22:00", recommendation: "基础剪发和洗护评价稳定。", qrImageUrl: qrPlaceholder }
];

const mockPosts = [
  { id: "mock-post-1", type: "校园墙", title: "北门夜宵哪家适合四人局？", summary: "想找能坐下聊天、价格别太离谱的店。", content: "想找能坐下聊天、价格别太离谱的店，欢迎推荐。", authorNickname: "同学A", likeCount: 12, commentCount: 3, viewCount: 98, time: "今天" }
];

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
    publicApi<Dict[]>("/api/public/food/merchants")
      .then((data) => { setFoodMerchants(data || []); setFoodError(""); })
      .catch(() => { setFoodMerchants(mockMerchants.filter((item) => item.category === "food")); setFoodError("当前使用本地试点数据。"); });
  }, []);

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
          <button className="h5-back" onClick={closeMerchant}><ChevronLeft size={18} />返回</button>
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
        {activeTab === "food" && <FoodTab merchants={foodMerchants} error={foodError} onOpenMerchant={openMerchant} />}
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
          <p>{randomFood ? randomFood.recommendation || "这家今天值得试试。" : "选择困难时，随机抽一家校边美食；暂无可抽商家时会提示空态。"}</p>
        </div>
        <div className="h5-slot-actions">
          <button onClick={onChooseFood}><Shuffle size={18} />开抽</button>
          {randomFood && <button className="secondary" onClick={() => onOpenMerchant(randomFood.id)}><ChevronRight size={18} />进店</button>}
        </div>
      </section>
      {hasDrawnFood && !randomFood && <EmptyCard title="暂无可抽美食" text="后台上架美食商家后，这里会抽出真实商家。" />}

      <WechatBlock entry={wechatEntry} onWechat={onWechat} />
    </>
  );
}

function FoodTab({ merchants, error, onOpenMerchant }: {
  merchants: Dict[]; error: string; onOpenMerchant: (id?: string) => void;
}) {
  return (
    <>
      <PageHero icon={<Coffee size={18} />} title="今天吃什么" text="按分类找附近好吃的，距离一眼扫完。" />
      {error && <p className="muted-line">{error}</p>}
      <div className="h5-list">
        {merchants.map((merchant) => <MerchantCard key={merchant.id} merchant={merchant} onOpen={onOpenMerchant} />)}
        {!merchants.length && !error && <EmptyCard title="正在招募美食商家" text="你推荐的宝藏店，可以通过西大圈微信告诉我们。" />}
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
      {error && <p className="muted-line">{error}</p>}
      <div className="h5-list">
        {showMerchants && merchants.map((merchant) => <MerchantCard key={merchant.id} merchant={merchant} onOpen={onOpenMerchant} />)}
        {(!showMerchants || !merchants.length) && !error && <EmptyCard title={`${selectedConfig.title}还在调研中`} text="这个服务还在调研中，推荐你知道的靠谱店，西大圈优先补充。" />}
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
      <div><CalendarDays size={14} />{post.time}<MessageCircle size={14} />{post.commentCount ?? 0}</div>
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
      <button onClick={like} disabled={liking}>{"点赞"}{post.likeCount ?? 0}</button>
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
        ["找福利", "活动、团购和新品体验统一整理。"],
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
  const activities = Array.isArray(merchant.activities) ? merchant.activities : [];
  const cover = webImage(merchant.image) || asset("h5-hero-campus-life.png");
  const qr = webImage(merchant.qrImage || merchant.qrImageUrl) || qrPlaceholder;
  return (
    <article className="merchant-detail">
      <section className="merchant-cover-wrap">
        <img className="merchant-cover" src={cover} alt={merchant.name} />
        <div className="merchant-head">
          <span>{merchant.serviceId || "校园商家"}</span>
          <h1>{merchant.name}</h1>
          <p>{merchant.summary || merchant.recommendation || "西大圈推荐商家"}</p>
        </div>
      </section>
      {merchant.distance && (
        <div className="merchant-metrics">
          <div><MapPin size={15} />{merchant.distance || merchant.distanceText || "校边商圈"}</div>
        </div>
      )}
      {activities.length > 0 && (
        <section className="detail-block">
          <h2>进行中的活动</h2>
          <div className="h5-activity-list">
            {activities.map((activity: Dict) => (
              <div key={activity.id} className="activity-item">
                <strong>{activity.title}</strong>
                {activity.description && <p>{activity.description}</p>}
              </div>
            ))}
          </div>
        </section>
      )}
      <section className="detail-block">
        <h2>到店信息</h2>
        <div className="info-grid">
          <div><MapPin size={17} /><span>{merchant.address || "地址待补充"}</span></div>
          <div><Phone size={17} /><span>{merchant.phone || "电话待补充"}</span></div>
          <div><Clock size={17} /><span>{merchant.businessHours || "营业时间待补充"}</span></div>
        </div>
      </section>
      <section className="h5-qr-panel">
        <img src={qr} alt="商家二维码" />
        <div>
          <h2>扫码联系商家</h2>
          <p>添加微信咨询详情、预约服务。</p>
        </div>
      </section>
      <WechatBlock />
    </article>
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
  return (
    <button className={`h5-activity-card ${webImage(activity.image) ? "has-image" : ""}`} onClick={() => onOpen(activity.merchantId)}>
      {webImage(activity.image) && <img src={webImage(activity.image)} alt={activity.title} />}
      <div>
        <span><Gift size={14} />校园福利</span>
        <strong>{activity.title}</strong>
        {activity.description && <p>{activity.description}</p>}
        <em>去看看<ChevronRight size={14} /></em>
      </div>
    </button>
  );
}

function MerchantCard({ merchant, onOpen }: { merchant: Dict; onOpen: (id?: string) => void }) {
  return (
    <button className="h5-merchant-card" onClick={() => onOpen(merchant.id)}>
      <img src={webImage(merchant.image) || asset("banner-campus.jpg")} alt={merchant.name} />
      <div>
        <div className="merchant-card-head"><strong>{merchant.name}</strong></div>
        <p>{merchant.summary || merchant.recommendation || "西大圈推荐商家"}</p>
        <div className="merchant-card-meta"><span><MapPin size={13} />{merchant.distance || merchant.distanceText || "校边"}</span></div>
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
  return <section className="h5-info-band">{items.map(([title, text]) => <div key={title}><strong>{title}</strong><p>{text}</p></div>)}</section>;
}

function EmptyCard({ title, text }: { title: string; text: string }) {
  return <div className="empty-card"><strong>{title}</strong><span>{text}</span></div>;
}


function App() {
  const path = window.location.pathname;
  if (path === "/") return <EntryPage />;
  const isAdmin = path === "/admin" || path.startsWith("/admin/");
  if (!isAdmin) return <StudentHome />;
  return <AdminApp />;
}

export default App;

function EntryPage() {
  return (
    <main className="entry-page">
      <section className="entry-shell">
        <div className="entry-brand">
          <span><Sparkles size={16} />西大圈试点版</span>
          <h1>摸摸圈圈头，万事不用愁</h1>
          <p>学生浏览、平台管理从同一个地址进入。</p>
        </div>
        <div className="entry-grid">
          <a href="/student"><Utensils size={24} /><strong>学生端</strong><span>找美食服务，看校园活动</span></a>
          <a href="/admin"><BarChart3 size={24} /><strong>管理后台</strong><span>维护内容，管理商家</span></a>
        </div>
      </section>
    </main>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
