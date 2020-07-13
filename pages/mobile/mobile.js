Page({
  data: {
    mobile: ''
  },
  onLoad() {
    this.setData({ mobile: wx.getStorageSync('mobile') })
  },
  toVerify(e) {
    wx.navigateTo({
      url: './verify/verify?handle=' + e.currentTarget.dataset.name
    })
  }
})