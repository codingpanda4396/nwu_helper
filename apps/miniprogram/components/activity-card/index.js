Component({
  properties: {
    item: Object
  },
  methods: {
    onTap() {
      this.triggerEvent("open", { item: this.properties.item });
    }
  }
});
