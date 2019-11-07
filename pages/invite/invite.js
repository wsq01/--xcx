import { getMemberList } from '../../service/service.js';
Page({
  data: {

  },
  onShow() {
    const mobile = wx.getStorageSync('mobile');
    getMemberList(mobile).then(res => {
      if (res.data.code === 0) {
        this.setData({
          memberList: res.data.data.content
        })
      }
    })
  },
  onLoad: function (options) {
  },
  toAdd() {
    wx.navigateTo({
      url: './add/add',
    })
  },
  toEdit(e) {
    wx.navigateTo({
      url: './edit/edit?member=' + JSON.stringify(e.currentTarget.dataset.member),
    })
  },
})