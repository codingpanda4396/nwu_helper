Component({
  properties: {
    title: {
      type: String,
      value: "暂无内容"
    },
    desc: {
      type: String,
      value: "换个分类看看，或把你推荐的商家告诉我们。"
    },
    actionText: String
  },
  methods: {
    onAction() {
      this.triggerEvent("action");
    }
  }
});
