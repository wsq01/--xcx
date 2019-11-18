import { reqBillList } from '../../service/service.js';

Page({
  data: {
    list: [],
    isReqSuccess: false
  },
  onLoad: function (options) {
    const mobile = wx.getStorageSync('mobile');
    reqBillList(mobile).then(res => {
      if(res.data.code === 0) {
        this.setData({
          isReqSuccess: true,
          list: res.data.data.content
        })
      }
    })
  },
  toPay() {
    wx.showModal({
      title: '',
      content: '请前往（中集智冷科技）公众号进行缴费',
      showCancel: false
    })
  },  
})