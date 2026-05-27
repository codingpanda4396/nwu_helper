const api = require("../../utils/api");

Page({
  data: {
    types: [],
    activeType: "全部",
    list: [],
    showForm: false,
    selectedPost: null,
    form: {
      type: "校园墙",
      title: "",
      content: "",
      authorNickname: "",
      contact: ""
    }
  },
  async onLoad() {
    await this.loadList("全部");
  },
  async onShow() {
    const id = wx.getStorageSync("pendingCommunityPostId");
    if (id) {
      wx.removeStorageSync("pendingCommunityPostId");
      await this.openPostById(id);
    }
  },
  async loadList(type) {
    const [types, list] = await Promise.all([api.getCommunityTypes(), api.getCommunityPosts("全部")]);
    this.setData({ types, activeType: type, list: type && type !== "全部" ? await api.getCommunityPosts(type) : list });
  },
  async setType(event) {
    const type = event.currentTarget.dataset.type;
    const list = await api.getCommunityPosts(type);
    this.setData({ activeType: type, list });
  },
  publish() {
    this.setData({ showForm: !this.data.showForm, selectedPost: null });
  },
  updateForm(event) {
    const field = event.currentTarget.dataset.field;
    this.setData({ [`form.${field}`]: event.detail.value });
  },
  async submitPost() {
    try {
      await api.submitCommunityPost(this.data.form);
      wx.showToast({ title: "已提交审核", icon: "success" });
      this.setData({
        showForm: false,
        form: { type: "校园墙", title: "", content: "", authorNickname: "", contact: "" }
      });
    } catch (error) {
      wx.showToast({ title: "请补全投稿信息", icon: "none" });
    }
  },
  async openPost(event) {
    const item = event.detail.item;
    if (item && item.id) await this.openPostById(item.id);
  },
  async openPostById(id) {
    const post = await api.getCommunityPost(id);
    if (!post) {
      wx.showToast({ title: "帖子暂时不可查看", icon: "none" });
      return;
    }
    this.setData({ selectedPost: post, showForm: false });
  },
  closePost() {
    this.setData({ selectedPost: null });
  },
  async likePost() {
    if (!this.data.selectedPost) return;
    const result = await api.likeCommunityPost(this.data.selectedPost.id);
    this.setData({
      "selectedPost.likeCount": result.likeCount,
      list: this.data.list.map((post) => post.id === this.data.selectedPost.id ? { ...post, likeCount: result.likeCount } : post)
    });
  }
});
