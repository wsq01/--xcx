// pages/setmeal/setmeal.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    mealList:[
      {
        tittle:'年服务费',
        src:'http://www.ccsc58.cc/leng/little/image/yearbill.png',
        path:'../account/yearbill/deviceList/deviceList'
      },
      {
        tittle:'流量套餐',
        src:'http://www.ccsc58.cc/leng/little/image/flowmeal.png',
        path:'../account/flowmeal/deviceList/deviceList'
      },
      {
        tittle:'短信套餐',
        src:'http://www.ccsc58.cc/leng/little/image/messagemeal.png',
        path:'../account/messagemeal/messagemeal'
      },
      {
        tittle:'语音套餐',
        src:'http://www.ccsc58.cc/leng/little/image/voicemeal.png',
        path:'../account/voicemeal/voicemeal'
      },
      {
        tittle:'缴费记录',
        src:'http://www.ccsc58.cc/leng/little/image/paybill.png',
        path:'../account/paybill/paybill'
      }
    ]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },
  bindchoose(event){
    let path=event.currentTarget.dataset.info.path
    wx.navigateTo({
      url: path
    })
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