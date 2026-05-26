const { banners, quickEntries, activities, merchants } = require("../../data/mock");

Page({
  data: {
    banners,
    quickEntries,
    activities,
    recommendation: ""
  },
  onSearch() {
    wx.showToast({ title: "搜索功能即将开放", icon: "none" });
  },
  onBannerTap(event) {
    const item = event.detail.item;
    if (!item) return;
    if (item.targetType === "about") {
      wx.navigateTo({ url: "/pages/about/index" });
      return;
    }
    if (item.targetType === "tab" && item.url) {
      wx.switchTab({ url: item.url });
      return;
    }
    if (item.targetType === "activity") {
      const activity = activities.find((entry) => entry.id === item.targetId);
      if (activity) this.openMerchant(activity.merchantId);
    }
  },
  onEntryTap(event) {
    const item = event.detail.item;
    if (!item) return;
    if (item.filterId) wx.setStorageSync("serviceFilterId", item.filterId);
    if (item.type === "tab" && item.url) {
      wx.switchTab({ url: item.url });
      return;
    }
    wx.showToast({ title: "功能即将开放", icon: "none" });
  },
  onActivityOpen(event) {
    const item = event.detail.item;
    if (item && item.merchantId) this.openMerchant(item.merchantId);
  },
  openMerchant(id) {
    wx.navigateTo({ url: `/pages/merchant/detail?id=${id}` });
  },
  chooseFood() {
    const foodMerchants = merchants.filter((merchant) => merchant.category === "food");
    const next = foodMerchants[Math.floor(Math.random() * foodMerchants.length)];
    this.setData({
      recommendation: next ? `${next.name}：${next.recommendation}` : "今天先去南门转转。"
    });
  },
  openAbout() {
    wx.navigateTo({ url: "/pages/about/index" });
  },
  showFeedbackToast() {
    wx.showToast({ title: "已收到你的心意，反馈入口即将开放", icon: "none" });
  },
  showQrToast() {
    wx.showToast({ title: "请在真机预览中长按二维码", icon: "none" });
  }
});
