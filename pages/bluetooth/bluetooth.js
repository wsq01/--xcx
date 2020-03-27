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
    } else if(options.from == 'index') {
      this.setData({
        id: options.devid
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
      //   url: './data/data?id=1000001',
      // })
      
      wx.scanCode({
        success(res) {
          console.log(res)
          wx.navigateTo({
            url: './data/data?id=' + decodeURIComponent(res.path).split('=')[2],
          })
        }
      })
    } else {
      this.initBluetooth();
    }
  },
  initBluetooth() {
    const that = this;
    wx.openBluetoothAdapter({
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
  }
})