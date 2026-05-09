const app = getApp();

Page({
  data: {
    typeIndex: 0,
    types: ['跑腿代办', '周边商家', '今日摊位', '二手闲置', '拼车拼单', '其他'],
    title: '',
    description: '',
    location: '',
    time: '',
    price: '',
    contact: '',
    allowPublicContact: true,
    remark: '',
    submitting: false
  },

  onLoad() {
  },

  onTypeChange(e) {
    this.setData({
      typeIndex: e.detail.value
    });
  },

  onTitleInput(e) {
    this.setData({ title: e.detail.value });
  },

  onDescriptionInput(e) {
    this.setData({ description: e.detail.value });
  },

  onLocationInput(e) {
    this.setData({ location: e.detail.value });
  },

  onTimeInput(e) {
    this.setData({ time: e.detail.value });
  },

  onPriceInput(e) {
    this.setData({ price: e.detail.value });
  },

  onContactInput(e) {
    this.setData({ contact: e.detail.value });
  },

  onAllowPublicChange(e) {
    this.setData({ allowPublicContact: e.detail.value });
  },

  onRemarkInput(e) {
    this.setData({ remark: e.detail.value });
  },

  validateForm() {
    const { title, description, contact } = this.data;

    if (!title.trim()) {
      wx.showToast({ title: '请输入标题', icon: 'none' });
      return false;
    }

    if (!description.trim()) {
      wx.showToast({ title: '请输入具体内容', icon: 'none' });
      return false;
    }

    if (!contact.trim()) {
      wx.showToast({ title: '请输入联系方式', icon: 'none' });
      return false;
    }

    return true;
  },

  async onSubmit() {
    if (this.data.submitting) return;
    if (!this.validateForm()) return;

    this.setData({ submitting: true });

    const formData = {
      type: this.data.types[this.data.typeIndex],
      title: this.data.title.trim(),
      description: this.data.description.trim(),
      location: this.data.location.trim(),
      time: this.data.time.trim(),
      price: this.data.price.trim(),
      contact: this.data.contact.trim(),
      allowPublicContact: this.data.allowPublicContact,
      remark: this.data.remark.trim(),
      status: '待审核',
      createdAt: new Date()
    };

    let cloudSuccess = false;

    if (app.globalData.cloudEnabled && wx.cloud) {
      try {
        const db = wx.cloud.database();
        await db.collection('posts').add({
          data: {
            ...formData,
            createdAt: db.serverDate()
          }
        });
        cloudSuccess = true;
        console.log('[Cloud] post added successfully');
      } catch (e) {
        console.warn('[Cloud] add post failed:', e);
      }
    }

    if (!cloudSuccess) {
      console.log('[Fallback] Form data:', formData);
    }

    this.setData({ submitting: false });

    wx.showModal({
      title: '提交成功',
      content: '您的信息已提交，审核通过后将自动展示。请耐心等待。',
      showCancel: false,
      confirmText: '我知道了',
      success: () => {
        this.resetForm();
        wx.switchTab({
          url: '/pages/index/index'
        });
      }
    });
  },

  resetForm() {
    this.setData({
      typeIndex: 0,
      title: '',
      description: '',
      location: '',
      time: '',
      price: '',
      contact: '',
      allowPublicContact: true,
      remark: ''
    });
  }
});
