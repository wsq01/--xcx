Page({
  data: {
    mobile: ''
  },
  onLoad() {
    this.setData({ mobile: wx.getStorageSync('mobile') })
  },
  toVerify(e) {
    wx.navigateTo({
      url: './verify/verify?handle=' + e.currentTarget.dataset.name
    })
  },
  onShareAppMessage: function () {
    return {
        title: '鲜盾管家',
        path: '/pages/index/index',
        // imageUrl: '../../images/qrcode-app.jpg',
　　　　success: function(res){
　　　　　　// 转发成功之后的回调
　　　　　　if(res.errMsg == 'shareAppMessage:ok'){
　　　　　　}
　　　　},
　　　　fail: function(){
　　　　　　// 转发失败之后的回调
　　　　　　if(res.errMsg == 'shareAppMessage:fail cancel'){
　　　　　　　　// 用户取消转发
　　　　　　}else if(res.errMsg == 'shareAppMessage:fail'){
　　　　　　　　// 转发失败，其中 detail message 为详细失败信息
　　　　　　}
　　　　},
       
    }
  },
})