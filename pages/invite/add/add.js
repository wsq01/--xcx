import API from '../../../service/index.js';

Page({
  data: {
    mobile: '',
    name: ''
  },
  bindInputName(e) {
    this.setData({
      name: e.detail.value
    })
  },
  bindInputMobile(e) {
    this.setData({
      mobile: e.detail.value
    })
  },
  async submit() {
    const mainName = wx.getStorageSync('mobile');
    const res = this.reqAddMember(mainName, this.data.mobile, this.data.name);
    if(res.data.code === 0) {
      wx.showToast({
        title: '添加成功',
        success: () => {
          setTimeout(() => {
            wx.navigateBack({
              delta: 1
            })
          }, 1500)
        }
      })
    } else {
      wx.showToast({
        title: res.data.message,
        icon: 'none',
        duration: 1500
      })
    }
  },
  reqAddMember(mainname, aftername, nickname) {
    return new Promise((resolve, reject) => {
      wx.request({
        url: API.reqAddMember,
        data: {
          mainname,
          aftername,
          nickname
        },
        success: res => {
          resolve(res);
        }
      })
    })
  }
})