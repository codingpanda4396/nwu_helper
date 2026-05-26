Component({
  properties: {
    banners: {
      type: Array,
      value: []
    }
  },
  methods: {
    onTap(event) {
      this.triggerEvent("bannerTap", { item: event.currentTarget.dataset.item });
    }
  }
});
