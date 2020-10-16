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