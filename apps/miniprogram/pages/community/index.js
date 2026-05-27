const api = require("../../utils/api");

Page({
  data: {
    types: [],
    activeType: "全部",
    list: []
  },
  async onLoad() {
    const [types, list] = await Promise.all([api.getCommunityTypes(), api.getCommunityPosts("全部")]);
    this.setData({ types, list });
  },
  async setType(event) {
    const type = event.currentTarget.dataset.type;
    const list = await api.getCommunityPosts(type);
    this.setData({ activeType: type, list });
  },
  publish() {
    wx.showToast({ title: "发布功能即将开放", icon: "none" });
  },
  openPost() {
    wx.showToast({ title: "帖子详情即将开放", icon: "none" });
  }
});
