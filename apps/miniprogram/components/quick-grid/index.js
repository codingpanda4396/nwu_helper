Component({
  properties: {
    entries: {
      type: Array,
      value: []
    }
  },
  methods: {
    onTap(event) {
      this.triggerEvent("entryTap", { item: event.currentTarget.dataset.item });
    }
  }
});
