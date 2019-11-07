Page({
  data: {
    mobile: ''
  },
  onLoad: function (options) {
    this.setData({
      mobile: wx.getStorageSync('mobile')
    })
  },
  toVerify(e) {
    const name = e.currentTarget.dataset.name;
    wx.navigateTo({
      url: './verify/verify?handle=' + name,
    })
  }
})