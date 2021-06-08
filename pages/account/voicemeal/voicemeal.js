// pages/account/yearbill/pay/pay.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    list:[
      {tittle:'A套餐',price:9.5,desc:'说明：¥ 0.19/条 50条/年'},
      {tittle:'B套餐',price:19,desc:'说明：¥ 0.19/条 100条/年'},
      {tittle:'C套餐',price:38,desc:'说明：¥ 0.19/条 200条/年'},
      {tittle:'D套餐',price:95,desc:'说明：¥ 0.19/条 500条/年'}
    ],
    initIndex:0,
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

  bindchoose(event){
    console.log(event.currentTarget.dataset.index)
    let index=event.currentTarget.dataset.index
    let _total=this.data.list[index].price
    this.setData({
      total:_total,
      initIndex:index
    });

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