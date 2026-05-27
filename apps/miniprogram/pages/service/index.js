const api = require("../../utils/api");

Page({
  data: {
    services: [],
    activeServiceId: "printing",
    list: []
  },
  async onLoad() {
    const services = await api.getServiceCategories();
    this.setData({ services });
  },
  async onShow() {
    if (!this.data.services.length) {
      const services = await api.getServiceCategories();
      this.setData({ services });
    }
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
  async selectServiceById(id) {
    const service = this.data.services.find((item) => item.key === id || item.id === id) || this.data.services[0];
    if (!service) return;
    const key = service.key || service.id;
    const list = await api.getServiceMerchants(key);
    this.setData({ activeServiceId: key, list });
  },
  openMerchant(event) {
    const item = event.detail.item;
    if (item) wx.navigateTo({ url: `/pages/merchant/detail?id=${item.id}` });
  },
  recommendMerchant() {
    wx.showToast({ title: "商家推荐入口即将开放", icon: "none" });
  }
});
