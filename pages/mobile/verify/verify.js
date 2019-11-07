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
    isDisabled: false,
  },
  onLoad: function (options) {
    console.log(options);
    if(options.handle === 'unbind') {
      this.setData({
        isDisabled: true
      })
    }
    this.setData({
      handle: options.handle,
      mobile: wx.getStorageSync('mobile')
    })
  },
  submitForm: function () {
    if (this.data.handle === 'bind') {
      reqCheckSmsCode(this.data.mobile, this.data.smsCode).then(res => {
        if (res.data.code === 0) {
          wx.navigateTo({
            url: '../pwd/pwd?mobile=' + this.data.mobile + '&code=' + this.data.smsCode,
          })
        } else {
          wx.showToast({
            title: res.data.message,
            icon: 'none'
          })
        }
      })
    } else {
      const openid = wx.getStorageSync('openid');
      reqUnbind(openid, this.data.mobile, this.data.smsCode).then(res => {
        if (res.data.code === 0) {
          wx.removeStorageSync('mobile');
          wx.showToast({
            title: '解绑成功',
            icon: 'success',
            duration: 1500,
            success: res => {
              setTimeout(() => {
                wx.navigateBack({
                  delta: 2
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
  },
  inputMobile: function (e) {
    this.setData({
      mobile: e.detail.value
    })
    if (e.detail.value.length == 11) {
      this.setData({
        isSend: false
      })
      this.checkForm();
    }
  },
  inputSms: function (e) {
    this.setData({
      smsCode: e.detail.value
    })
    this.checkForm();
  },
  getSmsCode() {
    console.log('xxxx')
    reqSmsCode(this.data.mobile).then(res => {
      if(res.data.code === 0) {
        count_down(this, 60 * 1000);
        wx.showToast({
          title: '发送成功！',
        })
      }
    })
  },
  checkForm: function () {
    const that = this;
    if (that.data.mobile.length == 11 && that.data.smsCode.length == 4) {
      that.setData({
        checkedForm: true
      })
    } else {
      that.setData({
        checkedForm: false
      })
    }
  }
})
/* 毫秒级倒计时 */
function count_down(that, total_micro_second) {
  if (total_micro_second <= 0) {
    that.setData({
      smsText: "获取验证码",
      isSend: false
    });
    return;
  }
  // 渲染倒计时时钟
  that.setData({
    smsText: date_format(total_micro_second) + " s",
    isSend: true
  });
  setTimeout(function () {
    // 放在最后--
    total_micro_second -= 10;
    count_down(that, total_micro_second);
  }, 10)
}
// 时间格式化输出，如03:25:19 86。每10ms都会调用一次
function date_format(micro_second) {
  var second = Math.floor(micro_second / 1000);
  var hr = Math.floor(second / 3600);
  var min = fill_zero_prefix(Math.floor((second - hr * 3600) / 60));
  var sec = fill_zero_prefix((second - hr * 3600 - min * 60));
  return sec;
}
// 位数不足补零
function fill_zero_prefix(num) {
  return num < 10 ? "0" + num : num
}