Page({
  data: {
    mobile: wx.getStorageSync('mobile') || ''
  },
  toVerify(e) {
    wx.navigateTo({
      url: './verify/verify?handle=' + e.currentTarget.dataset.name
    })
  }
})