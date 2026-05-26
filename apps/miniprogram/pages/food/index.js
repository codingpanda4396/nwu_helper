const { foodCategories, merchants } = require("../../data/mock");

Page({
  data: {
    categories: foodCategories,
    activeCategory: "all",
    list: []
  },
  onLoad() {
    this.filterList("all");
  },
  setCategory(event) {
    const id = event.currentTarget.dataset.id;
    this.setData({ activeCategory: id });
    this.filterList(id);
  },
  filterList(categoryId) {
    const list = merchants.filter((merchant) => {
      if (merchant.category !== "food") return false;
      return categoryId === "all" || merchant.foodCategory === categoryId;
    });
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
