Component({
  properties: {
    coupon: Object
  },
  methods: {
    onTap() {
      this.triggerEvent("claim", { item: this.properties.coupon });
    }
  }
});
