import { reqSmsCode, reqRegister, reqUnbind, reqCheckSmsCode } from '../../../service/service.js';

Page({
  data: {
    mobileData: {
      title: '手机号',
      placeholder: '请输入手机号'
    },
    smsData: {
      title: '验证码',
      placeholder: '请输入验证码'
    },
    smsText: '获取验证码',
    isSend: false,
    checkedForm: false,
    mobile: '',
    smsCode: '',
    handle: 'bind',
    isDisabled: false
  },
  onLoad(options) {
    if(options.handle === 'unbind') {
      this.setData({ isDisabled: true })
    }
    this.setData({
      handle: options.handle,
      mobile: wx.getStorageSync('mobile')
    })
  },
  async submitForm() {
    if (this.data.handle === 'bind') {
      const openid = wx.getStorageSync('openid')
      const res = await reqCheckSmsCode(this.data.mobile, this.data.smsCode,openid)
      if (res.data.code === 0&&res.data.data.length==0) {
        wx.navigateTo({
          url: '../pwd/pwd?mobile=' + this.data.mobile + '&code=' + this.data.smsCode
        })
      }if (res.data.code === 0&&res.data.data.type=='b') {
        wx.setStorageSync('mobile', this.data.mobile)
        wx.setStorageSync('utype', "b")
        wx.navigateTo({
          url: '../../index/index'
        })
      }  else {
        wx.showToast({
          title: res.data.message,
          icon: 'none'
        })
      }
    } else {
      wx.navigateTo({
        url: './update/update?mobile=' + this.data.mobile
      })
    }
  },
  inputMobile(e) {
    this.setData({ mobile: e.detail.value })
    if (e.detail.value.length == 11) {
      this.setData({ isSend: false })
      this.checkForm()
    }
  },
  inputSms: function (e) {
    this.setData({ smsCode: e.detail.value })
    this.checkForm()
  },
  async getSmsCode() {
    const res = await reqSmsCode(this.data.mobile)
    if(res.data.code === 0) {
      count_down(this, 60 * 1000)
      wx.showToast({ title: '发送成功！' })
    }
  },
  checkForm() {
    if (this.data.mobile.length == 11 && this.data.smsCode.length == 4) {
      this.setData({ checkedForm: true })
    } else {
      this.setData({ checkedForm: false })
    }
  }
})
function count_down(that, total_micro_second) {
  if (total_micro_second <= 0) {
    that.setData({
      smsText: "获取验证码",
      isSend: false
    })
    return
  }
  that.setData({
    smsText: date_format(total_micro_second) + " s",
    isSend: true
  })
  setTimeout(function () {
    total_micro_second -= 10
    count_down(that, total_micro_second)
  }, 10)
}
// 时间格式化输出，如03:25:19 86。每10ms都会调用一次
function date_format(micro_second) {
  var second = Math.floor(micro_second / 1000);
  var hr = Math.floor(second / 3600);
  var min = fill_zero_prefix(Math.floor((second - hr * 3600) / 60));
  var sec = fill_zero_prefix((second - hr * 3600 - min * 60));
  return sec
}
function fill_zero_prefix(num) {
  return num < 10 ? "0" + num : num
}