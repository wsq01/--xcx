// pages/account/yearbill/pay/pay.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    list:[
      {tittle:'A',price:12,desc:'说明：设备上传间隔5分钟及以上'},
      {tittle:'B',price:24,desc:'说明：设备上传间隔1分钟及以上'}
    ],
    initIndex:1,
    total:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let _total=this.data.list[this.data.initIndex].price
    this.setData({
      total:_total
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