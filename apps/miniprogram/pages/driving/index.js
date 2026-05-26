const { drivingSchool } = require("../../data/mock");

Page({
  data: {
    drivingSchool
  },
  consult() {
    wx.showToast({ title: "请长按二维码咨询驾校", icon: "none" });
  }
});
