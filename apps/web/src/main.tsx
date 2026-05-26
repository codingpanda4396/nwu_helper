import React, { useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { ChevronRight, Clipboard, Compass, Heart, Home, MapPin, MessageCircle, Search, Send, Share2, ShoppingBag, Star, Store, Ticket, Utensils, Wrench } from "lucide-react";
import "./styles.css";

type Tab = "home" | "food" | "driving" | "service" | "community";
type Merchant = {
  id: string;
  category: "food" | "service";
  foodCategory?: string;
  serviceId?: string;
  name: string;
  image: string;
  rating: number;
  avgPrice: number;
  distance: string;
  address: string;
  businessHours: string;
  tags: string[];
  discount: string;
  recommendation: string;
  highlights: string[];
  menu: { name: string; price: number }[];
  couponIds: string[];
  qrImage: string;
};

const asset = (name: string) => `/assets/images/${name}`;

const banners = [
  { id: "banner-activity", title: "商家活动", subtitle: "今日校园福利", image: asset("banner-activity.jpg"), target: "food" as Tab },
  { id: "banner-wechat", title: "加入西大圈", subtitle: "优惠、拼饭、校园服务都在这里", image: asset("banner-wechat.jpg"), target: "about" },
  { id: "banner-campus", title: "校园生活服务", subtitle: "打印、驾校、租房、跑腿一站看", image: asset("banner-campus.jpg"), target: "service" as Tab }
];

const quickEntries = [
  { id: "food", title: "美食", icon: Utensils, target: "food" as Tab },
  { id: "driving", title: "驾校", icon: Compass, target: "driving" as Tab },
  { id: "printing", title: "打印", icon: Clipboard, target: "service" as Tab, serviceId: "printing" },
  { id: "ktv", title: "KTV", icon: MessageCircle, target: "service" as Tab, serviceId: "ktv" },
  { id: "rent", title: "租房", icon: Home, target: "service" as Tab, serviceId: "rent" },
  { id: "errand", title: "跑腿", icon: Send, target: "service" as Tab, serviceId: "errand" },
  { id: "job", title: "兼职", icon: ShoppingBag, target: "service" as Tab, serviceId: "job" },
  { id: "more", title: "更多", icon: Wrench, target: "service" as Tab }
];

const foodCategories = [
  { id: "all", name: "全部" },
  { id: "bbq", name: "烧烤" },
  { id: "hotpot", name: "火锅" },
  { id: "milk-tea", name: "奶茶" },
  { id: "snack", name: "小吃" },
  { id: "night", name: "夜宵" },
  { id: "fast-food", name: "快餐" }
];

const merchants: Merchant[] = [
  {
    id: "merchant-food-001",
    category: "food",
    foodCategory: "fast-food",
    name: "饭点小馆",
    image: asset("merchant-food-001.jpg"),
    rating: 4.8,
    avgPrice: 25,
    distance: "距西大长安校区约 1.2km",
    address: "西北大学长安校区南门外学府大街 18 号",
    businessHours: "10:30-22:00",
    tags: ["热炒", "简餐", "学生优惠"],
    discount: "满30减8",
    recommendation: "适合下课后和舍友一起吃顿热饭。",
    highlights: ["出餐快", "近南门", "学生套餐"],
    menu: [{ name: "招牌盖饭", price: 18 }, { name: "双人热炒套餐", price: 58 }],
    couponIds: ["coupon-food-001"],
    qrImage: asset("qr-placeholder.jpg")
  },
  {
    id: "merchant-food-002",
    category: "food",
    foodCategory: "bbq",
    name: "晚风烧烤",
    image: asset("merchant-food-002.jpg"),
    rating: 4.7,
    avgPrice: 34,
    distance: "距西大长安校区约 1.5km",
    address: "西北大学长安校区南门夜市街 6 号",
    businessHours: "17:00-01:00",
    tags: ["烧烤", "夜宵", "可拼桌"],
    discount: "双人套餐68",
    recommendation: "适合晚课后拼一桌，烤串和主食都够稳。",
    highlights: ["夜宵友好", "套餐划算", "离校近"],
    menu: [{ name: "双人烤串套餐", price: 68 }, { name: "烤苕皮", price: 8 }],
    couponIds: ["coupon-food-002"],
    qrImage: asset("qr-placeholder.jpg")
  },
  {
    id: "merchant-food-003",
    category: "food",
    foodCategory: "milk-tea",
    name: "青柠茶铺",
    image: asset("merchant-food-003.jpg"),
    rating: 4.6,
    avgPrice: 14,
    distance: "距西大长安校区约 900m",
    address: "学府大街学生公寓对面 3 号",
    businessHours: "09:30-23:00",
    tags: ["奶茶", "果茶", "外带"],
    discount: "第二杯半价",
    recommendation: "复习前带一杯，清爽不腻。",
    highlights: ["出杯快", "低糖可选", "学生折扣"],
    menu: [{ name: "青柠冰茶", price: 12 }, { name: "厚乳茉莉", price: 16 }],
    couponIds: ["coupon-food-003"],
    qrImage: asset("qr-placeholder.jpg")
  },
  {
    id: "merchant-print-001",
    category: "service",
    serviceId: "printing",
    name: "南门快印",
    image: asset("merchant-print-001.jpg"),
    rating: 4.9,
    avgPrice: 8,
    distance: "距西大长安校区约 600m",
    address: "长安校区南门外便利店二楼",
    businessHours: "08:30-22:30",
    tags: ["打印", "装订", "证件照"],
    discount: "论文装订9折",
    recommendation: "课程材料、社团海报和论文装订都能处理。",
    highlights: ["营业时间长", "支持微信传文件", "可开票"],
    menu: [{ name: "黑白打印", price: 0.2 }, { name: "普通装订", price: 5 }],
    couponIds: ["coupon-print-001"],
    qrImage: asset("qr-placeholder.jpg")
  },
  {
    id: "merchant-service-ktv",
    category: "service",
    serviceId: "ktv",
    name: "星点量贩 KTV",
    image: asset("merchant-service-ktv.jpg"),
    rating: 4.5,
    avgPrice: 39,
    distance: "距西大长安校区约 2.1km",
    address: "韦曲南商圈 4 楼",
    businessHours: "12:00-02:00",
    tags: ["KTV", "团建", "生日"],
    discount: "学生包段优惠",
    recommendation: "社团聚会和宿舍生日局都比较方便。",
    highlights: ["包段价", "可预约", "近地铁"],
    menu: [{ name: "下午场小包", price: 88 }, { name: "夜场中包", price: 168 }],
    couponIds: ["coupon-ktv-001"],
    qrImage: asset("qr-placeholder.jpg")
  }
];

const activities = [
  { id: "activity-food-001", merchantId: "merchant-food-001", title: "饭点小馆满 30 减 8", tags: ["今日福利", "南门"], discount: "满30减8", image: asset("merchant-food-001.jpg"), cta: "去看看" },
  { id: "activity-food-002", merchantId: "merchant-food-002", title: "晚风烧烤双人套餐", tags: ["夜宵", "学生价"], discount: "双人 68", image: asset("merchant-food-002.jpg"), cta: "约一顿" }
];

const coupons = [
  { id: "coupon-food-001", merchantId: "merchant-food-001", title: "满 30 减 8 元", description: "堂食出示使用，不与其他活动同享。", validTo: "2026-12-31", stockText: "限量 300 张" },
  { id: "coupon-food-002", merchantId: "merchant-food-002", title: "双人套餐 68 元", description: "含烤串、主食和饮品，到店前建议咨询。", validTo: "2026-12-31", stockText: "限量 120 份" },
  { id: "coupon-food-003", merchantId: "merchant-food-003", title: "第二杯半价", description: "指定饮品参与，外带可用。", validTo: "2026-12-31", stockText: "每日 50 份" },
  { id: "coupon-print-001", merchantId: "merchant-print-001", title: "论文装订 9 折", description: "毕业季提前预约更稳。", validTo: "2026-12-31", stockText: "长期有效" },
  { id: "coupon-ktv-001", merchantId: "merchant-service-ktv", title: "学生包段优惠", description: "凭学生证或西大圈咨询入口确认。", validTo: "2026-12-31", stockText: "需预约" }
];

const services = [
  { id: "printing", name: "打印", icon: "打印", merchantIds: ["merchant-print-001"] },
  { id: "ktv", name: "KTV", icon: "欢唱", merchantIds: ["merchant-service-ktv"] },
  { id: "rent", name: "租房", icon: "租住", merchantIds: [] },
  { id: "errand", name: "跑腿", icon: "代办", merchantIds: [] },
  { id: "fitness", name: "健身", icon: "健身", merchantIds: [] },
  { id: "photo", name: "摄影", icon: "拍摄", merchantIds: [] },
  { id: "repair", name: "维修", icon: "维修", merchantIds: [] },
  { id: "job", name: "兼职", icon: "兼职", merchantIds: [] }
];

const communityTypes = ["全部", "校园墙", "求助", "拼饭", "二手", "吐槽", "校园信息"];
const communityPosts = [
  { id: "post-001", type: "校园墙", title: "今天南门有什么好吃的推荐？", summary: "想找一家适合两个人吃饭的小店，预算人均 30 左右。", time: "10 分钟前", likeCount: 12, commentCount: 4 },
  { id: "post-002", type: "拼饭", title: "晚上有人一起吃烧烤吗", summary: "晚课后从长安校区南门出发，想拼晚风烧烤双人套餐。", time: "28 分钟前", likeCount: 8, commentCount: 6 },
  { id: "post-003", type: "校园信息", title: "南门快印今晚到 22:30", summary: "需要打印课程材料的同学可以微信先传文件。", time: "1 小时前", likeCount: 18, commentCount: 2 },
  { id: "post-004", type: "二手", title: "出一个八成新台灯", summary: "亮度可调，长安校区自取。", time: "2 小时前", likeCount: 5, commentCount: 3 }
];

function App() {
  const [tab, setTab] = useState<Tab>("home");
  const [foodCategory, setFoodCategory] = useState("all");
  const [serviceId, setServiceId] = useState("printing");
  const [communityType, setCommunityType] = useState("全部");
  const [detail, setDetail] = useState<Merchant | null>(null);
  const [toast, setToast] = useState("");
  const [recommendation, setRecommendation] = useState("");
  const [aboutOpen, setAboutOpen] = useState(false);

  function notify(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 1800);
  }

  function switchTab(next: Tab) {
    setDetail(null);
    setAboutOpen(false);
    setTab(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function openMerchant(merchant: Merchant) {
    setDetail(merchant);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function selectQuick(entry: (typeof quickEntries)[number]) {
    if (entry.serviceId) setServiceId(entry.serviceId);
    switchTab(entry.target);
  }

  const foodList = useMemo(() => merchants.filter((merchant) => merchant.category === "food" && (foodCategory === "all" || merchant.foodCategory === foodCategory)), [foodCategory]);
  const activeService = services.find((service) => service.id === serviceId) ?? services[0];
  const serviceList = merchants.filter((merchant) => activeService.merchantIds.includes(merchant.id));
  const postList = communityType === "全部" ? communityPosts : communityPosts.filter((post) => post.type === communityType);

  if (detail) return <Shell tab={tab} onTab={switchTab} toast={toast}><MerchantDetail merchant={detail} onBack={() => setDetail(null)} onToast={notify} /></Shell>;
  if (aboutOpen) return <Shell tab={tab} onTab={switchTab} toast={toast}><About onToast={notify} /></Shell>;

  return (
    <Shell tab={tab} onTab={switchTab} toast={toast}>
      {tab === "home" && <HomePage onTab={switchTab} onQuick={selectQuick} onMerchant={openMerchant} onAbout={() => setAboutOpen(true)} onToast={notify} recommendation={recommendation} onRecommend={() => {
        const food = merchants.filter((merchant) => merchant.category === "food");
        const next = food[Math.floor(Math.random() * food.length)];
        setRecommendation(`${next.name}：${next.recommendation}`);
      }} />}
      {tab === "food" && <FoodPage active={foodCategory} list={foodList} onActive={setFoodCategory} onMerchant={openMerchant} onToast={notify} />}
      {tab === "driving" && <DrivingPage onToast={notify} />}
      {tab === "service" && <ServicePage active={serviceId} list={serviceList} onActive={setServiceId} onMerchant={openMerchant} onToast={notify} />}
      {tab === "community" && <CommunityPage active={communityType} list={postList} onActive={setCommunityType} onToast={notify} />}
    </Shell>
  );
}

function Shell({ children, tab, onTab, toast }: { children: React.ReactNode; tab: Tab; onTab: (tab: Tab) => void; toast: string }) {
  const tabs = [
    { id: "home" as Tab, text: "首页", Icon: Home },
    { id: "food" as Tab, text: "美食", Icon: Utensils },
    { id: "driving" as Tab, text: "驾校", Icon: Compass },
    { id: "service" as Tab, text: "服务", Icon: Store },
    { id: "community" as Tab, text: "讨论区", Icon: MessageCircle }
  ];

  return (
    <main className="app-shell">
      {children}
      <nav className="tabbar">
        {tabs.map(({ id, text, Icon }) => <button key={id} className={tab === id ? "active" : ""} onClick={() => onTab(id)}><Icon size={20} /><span>{text}</span></button>)}
      </nav>
      {toast && <div className="toast">{toast}</div>}
    </main>
  );
}

function HomePage({ onTab, onQuick, onMerchant, onAbout, onToast, recommendation, onRecommend }: {
  onTab: (tab: Tab) => void;
  onQuick: (entry: (typeof quickEntries)[number]) => void;
  onMerchant: (merchant: Merchant) => void;
  onAbout: () => void;
  onToast: (message: string) => void;
  recommendation: string;
  onRecommend: () => void;
}) {
  return (
    <section className="page home-page">
      <header className="home-hero">
        <div>
          <strong>西大圈</strong>
          <p>发现西北大学周边好店与校园生活服务</p>
        </div>
        <button className="search" onClick={() => onToast("搜索功能即将开放")}><Search size={18} />搜索美食、打印、驾校</button>
      </header>

      <div className="banner-rail">
        {banners.map((banner) => <button key={banner.id} className="banner-card" onClick={() => banner.target === "about" ? onAbout() : onTab(banner.target as Tab)}>
          <img src={banner.image} alt="" />
          <span><b>{banner.title}</b><small>{banner.subtitle}</small></span>
        </button>)}
      </div>

      <div className="quick-grid">
        {quickEntries.map((entry) => {
          const Icon = entry.icon;
          return <button key={entry.id} onClick={() => onQuick(entry)}><Icon size={22} /><span>{entry.title}</span></button>;
        })}
      </div>

      <SectionTitle title="今日校园福利" hint="优惠、套餐和周边好店" />
      <div className="activity-list">
        {activities.map((activity) => {
          const merchant = merchants.find((item) => item.id === activity.merchantId);
          return <button key={activity.id} className="activity-card" onClick={() => merchant && onMerchant(merchant)}>
            <img src={activity.image} alt="" />
            <span>{activity.tags.map((tag) => <em key={tag}>{tag}</em>)}</span>
            <strong>{activity.title}</strong>
            <b>{activity.discount}<ChevronRight size={16} /></b>
          </button>;
        })}
      </div>

      <SectionTitle title="今天吃什么" hint="选择困难时交给西大圈" />
      <div className="chooser panel">
        <p>{recommendation || "点击按钮，随机推荐一家适合今天的店。"}</p>
        <button onClick={onRecommend}>帮我选</button>
      </div>

      <SectionTitle title="西大圈入口" action="了解更多" onAction={onAbout} />
      <QrBlock title="加入西大圈" desc="发现更多校园福利、拼饭信息和周边服务。" onToast={onToast} />
      <div className="feedback-actions">
        <button onClick={() => onToast("商家推荐入口即将开放")}>我要推荐商家</button>
        <button onClick={() => onToast("反馈入口即将开放")}>我要反馈</button>
      </div>
    </section>
  );
}

function FoodPage({ active, list, onActive, onMerchant, onToast }: { active: string; list: Merchant[]; onActive: (id: string) => void; onMerchant: (merchant: Merchant) => void; onToast: (message: string) => void }) {
  return <section className="page"><CategoryTabs items={foodCategories} active={active} onActive={onActive} />{list.length ? <MerchantList list={list} onMerchant={onMerchant} /> : <Empty title="这个分类还在招募商家" action="推荐商家" onAction={() => onToast("推荐入口即将开放")} />}</section>;
}

function DrivingPage({ onToast }: { onToast: (message: string) => void }) {
  const steps = ["扫码咨询", "确认班型", "提交资料", "安排练车", "考试拿证"];
  return <section className="page">
    <img className="wide-image" src={asset("driving-school.jpg")} alt="" />
    <div className="panel intro-panel"><em>西大圈合作推荐</em><h1>西大圈合作驾校</h1><p>面向西北大学学生的周边驾校咨询入口，主打近学校、接送方便和学生优惠。</p></div>
    <SectionTitle title="环境展示" />
    <img className="wide-image compact" src={asset("driving-yard.jpg")} alt="" />
    <SectionTitle title="服务优势" />
    <div className="feature-grid">{["近学校", "接送方便", "学车周期短", "学生优惠"].map((item) => <div className="panel feature" key={item}>{item}</div>)}</div>
    <SectionTitle title="报名流程" />
    <div className="panel steps">{steps.map((step, index) => <div key={step}><span>{index + 1}</span>{step}</div>)}</div>
    <SectionTitle title="咨询报名" />
    <QrBlock title="驾校咨询二维码" desc="扫码咨询班型、价格、接送和练车安排。" onToast={onToast} />
  </section>;
}

function ServicePage({ active, list, onActive, onMerchant, onToast }: { active: string; list: Merchant[]; onActive: (id: string) => void; onMerchant: (merchant: Merchant) => void; onToast: (message: string) => void }) {
  return <section className="page">
    <div className="service-grid">{services.map((service) => <button key={service.id} className={active === service.id ? "active" : ""} onClick={() => onActive(service.id)}><b>{service.icon}</b><span>{service.name}</span></button>)}</div>
    <SectionTitle title="推荐商家" hint="首版先展示已合作服务" />
    {list.length ? <MerchantList list={list} onMerchant={onMerchant} /> : <Empty title="这个服务正在招募商家" action="推荐商家" onAction={() => onToast("商家推荐入口即将开放")} />}
  </section>;
}

function CommunityPage({ active, list, onActive, onToast }: { active: string; list: typeof communityPosts; onActive: (type: string) => void; onToast: (message: string) => void }) {
  return <section className="page">
    <div className="community-head panel"><span><h1>西小北北</h1><p>校园墙、求助、拼饭、二手和校园信息</p></span><button onClick={() => onToast("发布功能即将开放")}>发布</button></div>
    <CategoryTabs items={communityTypes.map((name) => ({ id: name, name }))} active={active} onActive={onActive} />
    <div className="notice">发言内容需遵守校园社区规范</div>
    <div className="post-list">{list.map((post) => <button key={post.id} className="post-card panel" onClick={() => onToast("帖子详情即将开放")}><span><em>{post.type}</em><small>{post.time}</small></span><strong>{post.title}</strong><p>{post.summary}</p><footer>赞 {post.likeCount} · 评论 {post.commentCount}</footer></button>)}</div>
  </section>;
}

function MerchantDetail({ merchant, onBack, onToast }: { merchant: Merchant; onBack: () => void; onToast: (message: string) => void }) {
  const merchantCoupons = coupons.filter((coupon) => merchant.couponIds.includes(coupon.id));
  return <section className="detail-page">
    <img className="detail-cover" src={merchant.image} alt="" />
    <div className="page detail-body">
      <button className="back-btn" onClick={onBack}>返回</button>
      <div className="panel merchant-head"><h1>{merchant.name}</h1><p><Star size={16} /> {merchant.rating} · 人均 ¥{merchant.avgPrice} · {merchant.distance}</p><div>{merchant.tags.map((tag) => <em key={tag}>{tag}</em>)}</div><strong>{merchant.discount}</strong></div>
      <div className="panel info-list"><p><b>地址</b>{merchant.address}</p><p><b>营业</b>{merchant.businessHours}</p><div><button onClick={() => navigator.clipboard?.writeText(merchant.address).then(() => onToast("地址已复制")).catch(() => onToast("请手动复制地址"))}>复制地址</button><button onClick={() => onToast("导航能力将在接入坐标后开放")}>导航</button><button onClick={() => onToast("请长按二维码加群咨询")}>加群咨询</button></div></div>
      <SectionTitle title="商家亮点" />
      <div className="feature-grid">{merchant.highlights.map((item) => <div className="panel feature" key={item}>{item}</div>)}</div>
      <SectionTitle title="推荐菜单" />
      <div className="panel menu-list">{merchant.menu.map((item) => <p key={item.name}><span>{item.name}</span><b>¥{item.price}</b></p>)}</div>
      <SectionTitle title="优惠券 / 套餐" />
      {merchantCoupons.map((coupon) => <div className="coupon panel" key={coupon.id}><span><strong>{coupon.title}</strong><small>{coupon.description}</small><small>{coupon.stockText} · 有效期至 {coupon.validTo}</small></span><button onClick={() => onToast("领券功能即将开放")}>领取</button></div>)}
      <SectionTitle title="位置与咨询" />
      <div className="map-placeholder panel"><MapPin size={22} />地图位置将在接入经纬度后展示</div>
      <QrBlock title="微信福利群" desc="进群咨询活动细节，后续支持真实二维码。" onToast={onToast} />
      <div className="panel promo">更多西大周边优惠，关注西大圈。</div>
    </div>
  </section>;
}

function About({ onToast }: { onToast: (message: string) => void }) {
  return <section className="page">
    <div className="panel about-card"><h1>西大圈</h1><h2>帮你发现西北大学周边好店与校园生活服务。</h2><p>西大圈面向西北大学学生，整理校园周边美食、驾校、打印、租房、跑腿、兼职等生活信息。首版为本地 MVP，后续将逐步接入真实商家、优惠券、讨论区和反馈表单。</p></div>
    <QrBlock title="官方微信" desc="关注西大圈，获取校园福利和周边服务信息。" onToast={onToast} />
    <div className="feedback-actions"><button onClick={() => onToast("抖音入口即将开放")}>抖音入口</button><button onClick={() => onToast("小红书入口即将开放")}>小红书入口</button></div>
    <div className="feedback-actions"><button onClick={() => onToast("商家合作入口即将开放")}>商家合作</button><button onClick={() => onToast("学生反馈入口即将开放")}>学生反馈</button></div>
  </section>;
}

function MerchantList({ list, onMerchant }: { list: Merchant[]; onMerchant: (merchant: Merchant) => void }) {
  return <div className="merchant-list">{list.map((merchant) => <button className="merchant-card panel" key={merchant.id} onClick={() => onMerchant(merchant)}><img src={merchant.image} alt="" /><span><strong>{merchant.name}<small>★ {merchant.rating}</small></strong><p>人均 ¥{merchant.avgPrice} · {merchant.distance}</p><em>{merchant.discount}</em><p>{merchant.recommendation}</p></span></button>)}</div>;
}

function CategoryTabs({ items, active, onActive }: { items: { id: string; name: string }[]; active: string; onActive: (id: string) => void }) {
  return <div className="category-tabs">{items.map((item) => <button key={item.id} className={active === item.id ? "active" : ""} onClick={() => onActive(item.id)}>{item.name}</button>)}</div>;
}

function SectionTitle({ title, hint, action, onAction }: { title: string; hint?: string; action?: string; onAction?: () => void }) {
  return <div className="section-title"><span><h2>{title}</h2>{hint && <p>{hint}</p>}</span>{action && <button onClick={onAction}>{action}</button>}</div>;
}

function QrBlock({ title, desc, onToast }: { title: string; desc: string; onToast: (message: string) => void }) {
  return <div className="qr-block panel"><img src={asset("qr-placeholder.jpg")} alt="" /><span><strong>{title}</strong><p>{desc}</p><button onClick={() => onToast("请在手机上长按二维码")}>扫码咨询</button></span></div>;
}

function Empty({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  return <div className="empty panel"><b>暂无内容</b><p>{title}</p>{action && <button onClick={onAction}>{action}</button>}</div>;
}

createRoot(document.getElementById("root")!).render(<App />);
