import { reqBindDev } from '../../service/service.js';
Page({
  data: {
    menuList: [
      {
        icon: '',
        text: '扫码添加设备',
        tap: 'scanCode'
      },
      {
        icon: '',
        text: '设备号添加设备',
        tap: 'bindDev'
      }
    ]
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
        console.log(res)
        let code = '';
        if(res.path.includes('bluetooth')) {
          code = decodeURIComponent(res.path).split('=')[2]
        } else {
          code = res.path.match(/\?id=(.*)/)[1];
        }
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