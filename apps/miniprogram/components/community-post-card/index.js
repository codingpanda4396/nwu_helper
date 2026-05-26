Component({
  properties: {
    post: Object
  },
  methods: {
    onTap() {
      this.triggerEvent("open", { item: this.properties.post });
    }
  }
});
