import { reqBindDev } from '../../service/service.js'
Page({
  data: {
    modalName: null,
    deviceId: ''
  },
  scanCode() {
    wx.scanCode({
      success: res => {
        const code = res.path.includes('bluetooth') ? decodeURIComponent(res.path).split('=')[2] : res.path.match(/\?id=(.*)/)[1]
        wx.showModal({
          content: '确认绑定设备：' + code + '吗？',
          success: res => {
            if(res.confirm) {
              this.setData({ deviceId: code })
              this.addDev()
            }
          }
        })
      },
      fail: res => {
        wx.showToast({
          title: '未识别，扫描失败！',
          icon: 'none'
        })
      }
    })
  },
  bindShowModal() {
    this.setData({ modalName: 'bind' })
  },
  bindInput(e) {
    this.setData({ deviceId: e.detail.value })
  },
  async addDev() {
    const mobile = wx.getStorageSync('mobile')
    const res = await reqBindDev(mobile, this.data.deviceId)
    if (res.data.code === 0) {
      wx.showToast({ title: '添加成功!' })
      this.hideModal()
    } else {
      wx.showToast({
        title: res.data.message,
        icon: 'none'
      })
    }
  },
  hideModal() {
    this.setData({ modalName: null })
  }
})