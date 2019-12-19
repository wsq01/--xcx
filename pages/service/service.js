Page({
  data: {
  },
  onLoad: function (options) {
  },
  makePhoneCall() {
    wx.makePhoneCall({
      phoneNumber: '010-83612390',
    })
  }
})