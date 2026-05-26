Component({
  properties: {
    title: String,
    desc: String,
    image: {
      type: String,
      value: "/assets/images/qr-placeholder.jpg"
    }
  },
  methods: {
    onTap() {
      this.triggerEvent("action");
    }
  }
});
