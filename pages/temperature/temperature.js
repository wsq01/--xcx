
Page({
  data: {
    id: '',
    isOpenBluetooth: false
  },
  async onLoad(options) {
    console.log(options);
    let res = await this.initBluetooth();
    this.monitorTheBlue()
    console.log(res)
    if (res) {
      if (options.scene) {
        this.setData({
          id: decodeURIComponent(options.scene).split('=')[1]
        })
        wx.navigateTo({
          url: './data/data?id=' + this.data.id,
        })
      } else if (options.from == 'index') {
        this.setData({
          id: options.devid
        })
        wx.navigateTo({
          url: './data/data?id=' + this.data.id,
        })
      } else {
        wx.showModal({
          content: '二维码无效',
          showCancel: false
        })
      }
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
    return new Promise((resolve, reject) => {
      wx.openBluetoothAdapter({
        success: (res) => {
          resolve(true)
          that.setData({
            isOpenBluetooth: true
          })
        },
        fail: (res) => {
          resolve(false)
          wx.showModal({
            content: '请开启蓝牙',
            showCancel: false
          })
        }
      })
    })
  },
  monitorTheBlue() {
    wx.onBluetoothAdapterStateChange((res) => {
      if (res.available) {
        this.setData({
          isOpenBluetooth: true
        })
      } else {
        this.setData({
          isOpenBluetooth: false
        })
        wx.showToast({
          title: '蓝牙已关闭',
          icon: 'none',
          duration: 3000,
        })
      }
    })
  }
})