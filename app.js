const CLOUD_ENV_ID = 'cloudbase-d5g2a492a1fe6d9ea';

App({
  globalData: {
    cloudEnabled: false,
    currentPost: null
  },

  onLaunch() {
    if (CLOUD_ENV_ID && wx.cloud) {
      try {
        wx.cloud.init({
          env: CLOUD_ENV_ID,
          traceUser: true
        });
        this.globalData.cloudEnabled = true;
        console.log('[Cloud] init success');
      } catch (e) {
        console.warn('[Cloud] init failed:', e);
      }
    }
  }
});
