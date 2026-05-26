const { merchants, coupons } = require("../../data/mock");

Page({
  data: {
    merchant: null,
    merchantCoupons: []
  },
  onLoad(options) {
    const merchant = merchants.find((item) => item.id === options.id);
    if (!merchant) {
      wx.showToast({ title: "商家不存在", icon: "none" });
      this.setData({ merchant: null, merchantCoupons: [] });
      return;
    }
    this.setData({
      merchant,
      merchantCoupons: coupons.filter((coupon) => merchant.couponIds.indexOf(coupon.id) >= 0)
    });
  },
  copyAddress() {
    const address = this.data.merchant && this.data.merchant.address;
    if (!address) return;
    wx.setClipboardData({
      data: address,
      success: () => wx.showToast({ title: "地址已复制", icon: "success" })
    });
  },
  openMap() {
    wx.showToast({ title: "导航能力将在接入坐标后开放", icon: "none" });
  },
  joinGroup() {
    wx.showToast({ title: "请长按二维码加群咨询", icon: "none" });
  },
  claimCoupon() {
    wx.showToast({ title: "领券功能即将开放", icon: "none" });
  },
  goHome() {
    wx.switchTab({ url: "/pages/index/index" });
  }
});
