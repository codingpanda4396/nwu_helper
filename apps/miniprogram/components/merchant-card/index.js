Component({
  properties: {
    merchant: Object
  },
  methods: {
    onTap() {
      this.triggerEvent("open", { item: this.properties.merchant });
    }
  }
});
