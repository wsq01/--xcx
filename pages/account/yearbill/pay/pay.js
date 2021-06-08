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
    initIndex:0,
    show:false,//控制下拉列表的显示隐藏，false隐藏、true显示
    selectData:['1','2','3','4','5','6'],//下拉列表的数据
    index:0,//选择的下拉列表下标
    total:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let _total=this.data.list[this.data.initIndex].price*this.data.selectData[this.data.index]
    this.setData({
      total:_total
    })
  },
  selectTap(){
    this.setData({
     show: !this.data.show
    });
  },
  optionTap(e){
    let Index=e.currentTarget.dataset.index;//获取点击的下拉列表的下标
    let _total=this.data.list[this.data.initIndex].price*this.data.selectData[Index]
    this.setData({
     total:_total,
     index:Index,
     show:!this.data.show
    });
  },
  bindchoose(event){
    console.log(event.currentTarget.dataset.info)
    let index='' 
    if(this.data.list[0].tittle==event.currentTarget.dataset.info.tittle){
      index=0
    }else{
      index=1
    }
    let _total=this.data.list[index].price*this.data.selectData[this.data.index]
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