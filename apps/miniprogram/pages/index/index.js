const api = require("../../utils/api");

Page({
  data: {
    banners: [],
    activities: [],
    recommendation: ""
  },
  onLoad() {
    this.loadHome();
  },
  async loadHome() {
    const home = await api.getHome();
    this.setData({ banners: home.banners || [], activities: home.activities || [] });
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
      const activity = this.data.activities.find((entry) => entry.id === item.targetId);
      if (activity) this.openMerchant(activity.merchantId);
    }
  },
  onActivityOpen(event) {
    const item = event.detail.item;
    if (item && item.merchantId) this.openMerchant(item.merchantId);
  },
  openMerchant(id) {
    wx.navigateTo({ url: `/pages/merchant/detail?id=${id}` });
  },
  async chooseFood() {
    const next = await api.getRandomFood();
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
