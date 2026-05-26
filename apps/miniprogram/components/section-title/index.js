Component({
  properties: {
    title: String,
    hint: String,
    actionText: String
  },
  methods: {
    onAction() {
      this.triggerEvent("action");
    }
  }
});
