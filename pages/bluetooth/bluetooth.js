Page({
  data: {
    id: '',
    isOpenBluetooth: false
  },
  onLoad: function (options) {
    console.log(options);
    if (options.scene) {
      this.setData({
        id: decodeURIComponent(options.scene).split('=')[1]
      })
      wx.navigateTo({
        url: './data/data?id=' + this.data.id,
      })
    } else {
      this.initBluetooth();
    }
  },
  bindScanCode() {
    if (this.data.isOpenBluetooth) {
      // wx.navigateTo({
      //   url: './data/data?id=777002',
      // })
      
      wx.scanCode({
        success(res) {
          console.log(res)
          wx.navigateTo({
            url: './data/data?id=' + res.path.split('=')[2],
          })
        }
      })
    } else {
      this.initBluetooth();
    }
  },
  initBluetooth() {
    const that = this;
    wx.openBluetoothAdapter({ // 初始化蓝牙模块
      success: function (res) {
        that.setData({
          isOpenBluetooth: true
        })
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