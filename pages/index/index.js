const app = getApp();
const { mockPosts } = require('../../data/mock');

Page({
  data: {
    categories: ['全部', '跑腿代办', '周边商家', '今日摊位', '二手闲置', '拼车拼单'],
    activeCategory: '全部',
    posts: [],
    filteredPosts: []
  },

  onLoad() {
    this.loadPosts();
  },

  onShow() {
    this.loadPosts();
  },

  async loadPosts() {
    let allPosts = [...mockPosts];

    if (app.globalData.cloudEnabled && wx.cloud) {
      try {
        const db = wx.cloud.database();
        const res = await db.collection('posts')
          .where({
            status: db.RegExp({
              regexp: '^(试运营|已展示)$',
              options: 'i'
            })
          })
          .orderBy('createdAt', 'desc')
          .limit(50)
          .get();

        if (res.data && res.data.length > 0) {
          const cloudPosts = res.data;
          const mergedMap = new Map();
          cloudPosts.forEach(p => mergedMap.set(p._id, p));
          mockPosts.forEach(p => {
            if (!mergedMap.has(p._id)) {
              mergedMap.set(p._id, p);
            }
          });
          allPosts = Array.from(mergedMap.values());
        }
      } catch (e) {
        console.warn('[Cloud] query failed, using mock only:', e);
      }
    }

    allPosts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    this.setData({
      posts: allPosts
    });
    this.filterPosts();
  },

  filterPosts() {
    const { activeCategory, posts } = this.data;
    let filtered = posts;

    if (activeCategory !== '全部') {
      filtered = posts.filter(p => p.type === activeCategory);
    }

    this.setData({
      filteredPosts: filtered
    });
  },

  onCategoryTap(e) {
    const category = e.currentTarget.dataset.category;
    this.setData({
      activeCategory: category
    });
    this.filterPosts();
  },

  onPostTap(e) {
    const post = e.currentTarget.dataset.post;
    app.globalData.currentPost = post;
    wx.navigateTo({
      url: '/pages/detail/detail'
    });
  },

  onPublishTap() {
    wx.switchTab({
      url: '/pages/publish/publish'
    });
  },

  onScrollToPosts() {
    wx.pageScrollTo({
      selector: '#posts-section',
      duration: 300
    });
  },

  getTypeClass(type) {
    const classMap = {
      '跑腿代办': 'runerrand',
      '周边商家': 'shop',
      '今日摊位': 'stall',
      '二手闲置': 'secondhand',
      '拼车拼单': 'carpool',
      '其他': 'other'
    };
    return classMap[type] || 'other';
  }
});
