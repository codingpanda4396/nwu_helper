const { services, merchants } = require("../../data/mock");

Page({
  data: {
    services,
    activeServiceId: "printing",
    list: []
  },
  onShow() {
    const stored = wx.getStorageSync("serviceFilterId");
    if (stored) {
      wx.removeStorageSync("serviceFilterId");
      this.selectServiceById(stored);
      return;
    }
    this.selectServiceById(this.data.activeServiceId);
  },
  selectService(event) {
    this.selectServiceById(event.currentTarget.dataset.id);
  },
  selectServiceById(id) {
    const service = services.find((item) => item.id === id) || services[0];
    const list = merchants.filter((merchant) => service.merchantIds.indexOf(merchant.id) >= 0);
    this.setData({ activeServiceId: service.id, list });
  },
  openMerchant(event) {
    const item = event.detail.item;
    if (item) wx.navigateTo({ url: `/pages/merchant/detail?id=${item.id}` });
  },
  recommendMerchant() {
    wx.showToast({ title: "商家推荐入口即将开放", icon: "none" });
  }
});
