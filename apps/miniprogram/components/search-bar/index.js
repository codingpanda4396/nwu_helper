Component({
  properties: {
    placeholder: {
      type: String,
      value: "搜索美食、打印、驾校"
    }
  },
  methods: {
    onFocus() {
      this.triggerEvent("search");
    },
    onInput(event) {
      this.triggerEvent("input", { value: event.detail.value });
    }
  }
});
