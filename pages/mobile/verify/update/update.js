import { reqUpdateMobile } from '../../../../service/service.js';
Page({
  data: {
    mobileData: {
      title: '手机号',
      placeholder: '请输入新手机号'
    },
    smsData: {
      title: '验证码',
      placeholder: '请再次输入密码'
    },
    newMobile: '',
    mobile: '',
    smsCode: ''
  },
  onLoad: function (options) {
    this.setData({
      mobile: options.mobile
    })
  },
  inputPwd1(e) {
    this.setData({
      newMobile: e.detail.value
    })
  },
  submitForm() {
    reqUpdateMobile(this.data.mobile, this.data.newMobile).then(res => {
        if (res.data.code === 0) {
          wx.setStorageSync('mobile', this.data.newMobile);
          wx.showToast({
            title: '操作成功',
            icon: 'success',
            duration: 1500,
            success: res => {
              setTimeout(() => {
                wx.navigateBack({
                  delta: 4
                })
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
})