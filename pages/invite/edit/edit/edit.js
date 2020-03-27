
import { reqEditMember } from '../../../../service/service.js';

Page({
  data: {
    member: {}
  },
  onLoad: function (options) {
    const member = JSON.parse(options.member)
    this.setData({
      member
    })
  },
  bindInput(e) {
    this.setData({
      'member.relation_name': e.detail.value
    })
  },
  async editItem() {
    const mobile = wx.getStorageSync('mobile');
    const res = reqEditMember(mobile, this.data.member.phone, this.data.member.relation_name);
    wx.showToast({
      title: '修改成功',
      success: () => {
        setTimeout(() => {
          wx.navigateBack({
            delta: 2
          })
        }, 2000)
      }
    })
  }
})