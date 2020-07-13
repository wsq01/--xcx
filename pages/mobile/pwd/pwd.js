import { reqRegister } from '../../../service/service.js'
Page({
  data: {
    mobileData: {
      placeholder: '请输入密码，30位以内'
    },
    pwd1: '',
    pwd2: '',
    mobile: '',
    smsCode: ''
  },
  onLoad: function (options) {
    this.setData({
      mobile: options.mobile,
      smsCode: options.code
    })
  },
  inputVal(e) {
    this.setData({
      [e.currentTarget.dataset.key]: e.detail.value
    })
  },
  submitForm() {
    if(this.data.pwd1 !== this.data.pwd2) {
      wx.showToast({
        title: '两次密码不一致！',
        icon: 'none'
      })
    } else {
      const openid = wx.getStorageSync('openid')
      reqRegister(openid, this.data.mobile, this.data.smsCode, this.data.pwd1).then(res => {
        if (res.data.code === 0) {
          wx.setStorageSync('mobile', this.data.mobile)
          wx.showToast({
            title: '绑定成功',
            icon: 'success',
            duration: 1500,
            success: res => {
              setTimeout(() => {
                wx.navigateBack({ delta: 3 })
              }, 1500)
            }
          })
        } else {
          wx.showToast({
            title: res.data.message,
            icon: 'none'
          })
        }
      })
    }
  }
})