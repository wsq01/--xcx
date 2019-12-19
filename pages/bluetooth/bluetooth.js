Page({
  data: {
  },
  onLoad: function (options) {
    console.log(options)
    this.initBluetooth();
  },
  bindScanCode() {
    // wx.navigateTo({
    //   url: './data/data',
    // })
    this.initBluetooth();
  },
  initBluetooth() {
    const that = this;
    wx.openBluetoothAdapter({ // 初始化蓝牙模块
      success: function (res) {
        wx.navigateTo({
          url: './data/data',
        })
      // wx.scanCode({
      //   success(res) {
      //     console.log(res)
      //     wx.navigateTo({
      //       url: res.path
      //     })
      //   }
      // })
      },
      fail: function (res) {
        console.log(res)
        wx.showModal({
          content: '请开启蓝牙',
          showCancel: false
        })
      }
    })
  },
})