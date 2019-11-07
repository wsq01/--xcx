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
    wx.navigateTo({
      url: '../webview/webview'
    })
    // wx.showModal({
    //   title: '',
    //   content: '暂未实现该功能，敬请期待！',
    //   showCancel: false
    // })
  },  
})