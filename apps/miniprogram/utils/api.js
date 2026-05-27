const mock = require("../data/mock");

const API_BASE = "http://localhost:3000";

function request(path, options = {}) {
  return new Promise((resolve, reject) => {
    wx.request({
      url: `${API_BASE}${path}`,
      method: options.method || "GET",
      data: options.data || {},
      success(res) {
        const body = res.data || {};
        if (res.statusCode >= 200 && res.statusCode < 300 && body.success !== false) {
          resolve(body.data);
          return;
        }
        reject(new Error(body.message || "REQUEST_FAILED"));
      },
      fail: reject
    });
  });
}

async function withFallback(loader, fallback) {
  try {
    return await loader();
  } catch (error) {
    return typeof fallback === "function" ? fallback() : fallback;
  }
}

module.exports = {
  mock,
  getHome: () => withFallback(() => request("/api/public/home"), { banners: mock.banners, activities: mock.activities }),
  getFoodCategories: () => withFallback(() => request("/api/public/food/categories"), mock.foodCategories),
  getFoodMerchants: (categoryId) => withFallback(() => request(`/api/public/food/merchants?categoryId=${encodeURIComponent(categoryId || "all")}`), () => mock.merchants.filter((merchant) => merchant.category === "food" && (!categoryId || categoryId === "all" || merchant.foodCategory === categoryId))),
  getRandomFood: () => withFallback(() => request("/api/public/food/random"), () => {
    const list = mock.merchants.filter((merchant) => merchant.category === "food");
    return list[Math.floor(Math.random() * list.length)] || null;
  }),
  getServiceCategories: () => withFallback(() => request("/api/public/services/categories"), mock.services),
  getServiceMerchants: (serviceKey) => withFallback(() => request(`/api/public/services/merchants?serviceKey=${encodeURIComponent(serviceKey || "")}`), () => {
    const service = mock.services.find((item) => item.id === serviceKey) || mock.services[0];
    return mock.merchants.filter((merchant) => service && service.merchantIds.indexOf(merchant.id) >= 0);
  }),
  getCommunityTypes: () => withFallback(() => request("/api/public/community/types"), mock.communityTypes),
  getCommunityPosts: (type) => withFallback(() => request(`/api/public/community/posts?type=${encodeURIComponent(type || "全部")}`), () => type && type !== "全部" ? mock.communityPosts.filter((post) => post.type === type) : mock.communityPosts),
  getMerchant: (id) => withFallback(() => request(`/api/public/merchants/${id}`), () => {
    const merchant = mock.merchants.find((item) => item.id === id);
    return merchant ? { ...merchant, coupons: mock.coupons.filter((coupon) => merchant.couponIds.indexOf(coupon.id) >= 0) } : null;
  })
};
