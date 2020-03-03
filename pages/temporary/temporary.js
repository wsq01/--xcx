import { reqBindDev } from '../../service/service.js';
Page({
  data: {

  },
  onLoad: function (options) {

  },
  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        selected: 1
      })
    }
  },
  scanCode() {
    const that = this;
    wx.scanCode({
      success: res => {
        const code = res.path.match(/\?id=(.*)/)[1];
        wx.setStorageSync('devid', code);
        wx.showModal({
          title: '提示',
          content: '确认绑定设备：' + code + '吗？',
          success(res) {
            if(res.confirm) {
              that.setData({
                inputDevId: code
              })
              that.addDev();
            }
          }
        })
      },
      fail: res => {
        wx.showToast({
          title: '未识别，扫描失败！',
          icon: 'none'
        })
      }
    })
  },
  bindDev() {
    this.setData({
      isShowModal: true
    })
  },
  inputDev(e) {
    this.setData({
      inputDevId: e.detail.value
    })
  },
  addDev() {
    const mobile = wx.getStorageSync('mobile');
    const openid = wx.getStorageSync('openid');
    reqBindDev(mobile, this.data.inputDevId).then(res => {
      if (res.data.code === 0) {
        wx.showToast({
          title: '添加成功',
          icon: 'none'
        })
        this.setData({
          isShowModal: false,
          isReqSuccess: true
        })
        // reqDevList(openid).then(res => {
        //   if (res.data.code === 0) {
        //     this.setData({
        //       isShowModal: false,
        //       isReqSuccess: true,
        //       devList: res.data.data.data
        //     });
        //   }
        // });
      } else {
        wx.showToast({
          title: res.data.message,
          icon: 'none'
        })
      }
    })
  },
  bindCloseModal() {
    this.setData({
      isShowModal: false
    })
  }
})