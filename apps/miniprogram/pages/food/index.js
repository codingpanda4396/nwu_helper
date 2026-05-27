const api = require("../../utils/api");

Page({
  data: {
    categories: [],
    activeCategory: "all",
    list: []
  },
  async onLoad() {
    const categories = await api.getFoodCategories();
    this.setData({ categories });
    this.filterList("all");
  },
  setCategory(event) {
    const id = event.currentTarget.dataset.id;
    this.setData({ activeCategory: id });
    this.filterList(id);
  },
  async filterList(categoryId) {
    const list = await api.getFoodMerchants(categoryId);
    this.setData({ list });
  },
  openMerchant(event) {
    const item = event.detail.item;
    if (item) wx.navigateTo({ url: `/pages/merchant/detail?id=${item.id}` });
  },
  recommendMerchant() {
    wx.showToast({ title: "推荐入口即将开放", icon: "none" });
  }
});
