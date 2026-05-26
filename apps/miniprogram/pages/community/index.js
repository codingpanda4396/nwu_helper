const { communityTypes, communityPosts } = require("../../data/mock");

Page({
  data: {
    types: communityTypes,
    activeType: "全部",
    list: communityPosts
  },
  setType(event) {
    const type = event.currentTarget.dataset.type;
    const list = type === "全部" ? communityPosts : communityPosts.filter((post) => post.type === type);
    this.setData({ activeType: type, list });
  },
  publish() {
    wx.showToast({ title: "发布功能即将开放", icon: "none" });
  },
  openPost() {
    wx.showToast({ title: "帖子详情即将开放", icon: "none" });
  }
});
