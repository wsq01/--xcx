import { getMemberList } from '../../service/service.js'
Page({
  async onShow() {
    const mobile = wx.getStorageSync('mobile')
    const res = await getMemberList(mobile)
    if (res.data.code === 0) {
      this.setData({
        memberList: res.data.data.content
      })
    }
  },
  toAdd() {
    wx.navigateTo({ url: './add/add' })
  },
  toEdit(e) {
    wx.navigateTo({
      url: './edit/edit?member=' + JSON.stringify(e.currentTarget.dataset.member),
    })
  }
})