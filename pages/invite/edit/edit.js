import { reqDeleteMember } from '../../../service/service.js';
Page({
  data: {
    member: {}
  },
  onLoad: function (options) {
    console.log(options)
    const member = JSON.parse(options.member);
    this.setData({
      member
    })
  },
  editItem() {
    wx.navigateTo({
      url: './edit/edit?member=' + JSON.stringify(this.data.member),
    })
  },
  async deleteItem() {
    const mobile = wx.getStorageSync('mobile');
    const res = await reqDeleteMember(mobile, this.data.member.phone);
    wx.showToast({
      title: '删除成功',
      success: () => {
        setTimeout(() => {
          wx.navigateBack({
            delta: 1
          })
        }, 2000)
      }
    })
  }
})