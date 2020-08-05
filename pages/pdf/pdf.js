// pages/pdf/pdf.js
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },
  preview: function () {
    var that = this;
    console.log("简历预览")
     
//这里的value是先在data里面初始化，然后我根据用户切换单选框，获取的简历文件的主键id
    console.log(this.data.value)
    var id = that.data.value;
 
    if (id == "") {
      wx.showModal({
        title: '',
        content: '请选择一份简历',
        showCancel: false,
        confirmColor: "#FFB100"
      })
    } else {

          //下载简历
          wx.downloadFile({
            url: 'https://www.ccsc58.cc/upanPDF/PDF_OUT/100001263586_103109.pdf',
            success: function (res) {
              var filePath = res.tempFilePath
              console.log(filePath)
 
              //预览简历
              wx.openDocument({
                filePath: filePath,
                fileType: that.data.type,
                success: function (res) {
                  console.log("打开文档成功")
                  console.log(res);
                },
                fail: function (res) {
                  console.log("fail");
                  console.log(res)
                },
                complete: function (res) {
                  console.log("complete");
                  console.log(res)
                }
              })
            },
   
          })
        }
      
    
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

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