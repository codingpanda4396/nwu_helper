const app = getApp();

Page({
  data: {
    post: null
  },

  onLoad() {
    const post = app.globalData.currentPost;
    if (!post) {
      wx.showToast({
        title: '信息不存在',
        icon: 'none'
      });
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
      return;
    }
    this.setData({ post: post });
  },

  getTypeClass(type) {
    const classMap = {
      '跑腿代办': 'tag-runerrand',
      '周边商家': 'tag-shop',
      '今日摊位': 'tag-stall',
      '二手闲置': 'tag-secondhand',
      '拼车拼单': 'tag-carpool',
      '其他': 'tag-other'
    };
    return classMap[type] || 'tag-other';
  }
});
