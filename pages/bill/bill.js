import { reqBillList } from '../../service/service.js'

Page({
  data: {
    list: [],
    isReqSuccess: true
  },
  async onLoad() {
    const mobile = wx.getStorageSync('mobile')
    const res = await reqBillList(mobile)
    if(res.data.code === 0) {
      this.setData({
        isReqSuccess: true,
        list: res.data.data.content
      })
    }
  },
  toPay() {
    wx.showModal({
      content: '请前往（中集智冷科技）公众号，并登录云平台缴费',
      showCancel: false
    })
  }
})