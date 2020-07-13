Page({
  data: {
    isShowAccount: false
  },
  makePhoneCall() {
    wx.makePhoneCall({
      phoneNumber: '010-83612390',
    })
  },
  bindLoad() {
    this.setData({ isShowAccount: true })
  }
})