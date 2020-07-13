import { reqOpenid } from '../../service/service'
Page({
  data: {
    id: '',
    isOpenBluetooth: false,
    options: ''
  },
  async onLoad(options) {
    console.log(options)
    this.setData({ options })
    this.getOpenId()
    this.judgeIsLogin(options)
    // this.toPage(options)
  },
  judgeIsLogin(options) {
    const mobile = wx.getStorageSync('mobile')
    if (!mobile) {
      wx.showModal({
        content: '账号未登录，请前往登录',
        showCancel: false,
        success(res) {
          if (res.confirm) {
            wx.navigateTo({
              url: '../mobile/verify/verify?handle=bind',
            })
          }
        }
      })
    } else {
      this.toPage(options)
    }
  },
  async toPage(options) {
    let res = await this.initBluetooth()
    this.monitorTheBlue()
    if (res) {
      if (options.scene) {
        this.setData({
          id: decodeURIComponent(options.scene).split('=')[1]
        })
        wx.showModal({
          content: '确定连接设备' + this.data.id + '吗？',
          success: res => {
            if(res.confirm) {
              this.turnToPage()
            }
          }
        })
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
  async getOpenId() {
    const res = await reqOpenid()
    wx.setStorageSync('openid', JSON.parse(res.data.data).openid)
  },
  bindScanCode() {
    const mobile = wx.getStorageSync('mobile')
    if (!mobile) {
      wx.showModal({
        content: '账号未登录，请前往登录',
        showCancel: false,
        success: res => {
          if (res.confirm) {
            wx.navigateTo({
              url: '../mobile/verify/verify?handle=bind'
            })
          }
        }
      })
    } else {
      if (this.data.isOpenBluetooth) {
        wx.scanCode({
          success: res => {
            console.log(res)
            let id = decodeURIComponent(res.path).split('=')[2];
            this.setData({ id })
            wx.showModal({
              content: '确定连接设备' + this.data.id + '吗？',
              success: res => {
                if(res.confirm) {
                  this.turnToPage()
                }
              }
            })
          }
        })
      } else {
        this.initBluetooth()
      }
      
    }
  },
  initBluetooth() {
    return new Promise((resolve, reject) => {
      wx.openBluetoothAdapter({
        success: res => {
          resolve(true)
          this.setData({
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
    if(this.data.id.length === 6) {
      url = './data/data?id=' + this.data.id
    } else {
      url = '../temperature/data/data?id=' + this.data.id
    }
    wx.navigateTo({ url })
  }
})