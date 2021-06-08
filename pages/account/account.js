// pages/account/account.js
import { reqUserInfo , reqUpdateUserInfo  } from '../../service/service.js';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const mobile = wx.getStorageSync('mobile')
    this.reqUserInfo(mobile)
  },
  
  async reqUserInfo(mobile) {
    const res = await reqUserInfo(mobile)
    console.log(res)
    if (res.data.code === 0) {
      this.setData({
        userInfo: res.data.data,
      })
    }
  },
  bindrealname(e){
    this.setData({
      'userInfo.admin_real_name':e.detail.value
    })
  },
  bindmobile(e) {
    this.setData({
      'userInfo.admin_mobile':e.detail.value
    })
  },
  bindpsd(e) {
    this.setData({
      'userInfo.old_password':e.detail.value
    })
  },
  bindnewpsd(e) {
    this.setData({
      'userInfo.new_password':e.detail.value
    })
  },
  bindcompany(e) {
    this.setData({
      'userInfo.admin_company':e.detail.value
    })
  },
  bindmail(e) {
    this.setData({
      'userInfo.admin_mailbox':e.detail.value
    })
  },
  bindaddress(e) {
    this.setData({
      'userInfo.admin_company_address':e.detail.value
    })
  },
  bindcompanytel(e) {
    this.setData({
      'userInfo.admin_company_tel':e.detail.value
    })
  },
  async bindSaveParams(){
    let obj=this.data.userInfo
    console.log(this.data.userInfo.new_password)
    if(this.data.userInfo.old_password==undefined&&this.data.userInfo.new_password!=undefined){     
        wx.showToast({
          title: '请输入原始密码',
          icon: 'none'
        })
        return false
    }
    let res =await reqUpdateUserInfo(obj)
    if(res.data.code==0){
      wx.showToast({
        title: '设置成功!',
        icon: 'success'
      })
    }else{
      wx.showToast({
        title: res.data.message,
        icon: 'none'
      })
    }
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})