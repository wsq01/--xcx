Page({
  data: {
    id: '',
    isOpenBluetooth: false
  },
  async onLoad(options) {
    console.log(options);
    let res = await this.initBluetooth();
    this.monitorTheBlue()
    if (res) {
      if (options.scene) {
        this.setData({
          id: decodeURIComponent(options.scene).split('=')[1]
        })
        this.turnToPage()
      } else if (options.from == 'index') {
        this.setData({
          id: options.devid
        })
        this.turnToPage()
      } else {
        wx.showModal({
          content: '二维码无效',
          showCancel: false
        })
      }
    }
  },
  bindScanCode() {
    const that = this
    if (this.data.isOpenBluetooth) {

      wx.scanCode({
        success(res) {
          console.log(res)
          let id = decodeURIComponent(res.path).split('=')[2];
          that.setData({
            id
          })
          that.turnToPage()
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
  },
  turnToPage() {
    let url = ''
    if(this.data.id === '700073') {
      url = './data/data?id=' + this.data.id
    } else {
      url = '../temperature/data/data?id=' + '1000002'
    }
    wx.navigateTo({
      url
    })
  }
})