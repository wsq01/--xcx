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
        let url = ''
        if(this.data.id.length === 6) {
          url: './data/data?id=' + this.data.id
        } else {
          url = '../temperature/data/data?id=' + this.data.id
        }
        wx.navigateTo({
          url: url,
        })
      } else if (options.from == 'index') {
        this.setData({
          id: options.devid
        })
        let url = ''
        if(this.data.id.length === 6) {
          url: './data/data?id=' + this.data.id
        } else {
          url = '../temperature/data/data?id=' + this.data.id
        }
        wx.navigateTo({
          url: url,
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
          let id = decodeURIComponent(res.path).split('=')[2];
          let url = ''
          // if(id.length === 6) {
          //   url: './data/data?id='
          // } else {
          //   url = '../temperature/data/data?id='
          // }
          if (id === '700072') {
            url: './data/data?id=700073'
          } else {
            url = '../temperature/data/data?id=1000002'
          }
          wx.navigateTo({
            url: url
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