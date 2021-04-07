import { reqSendCodeLogin, reqRegister, reqUnbind, reqCheckSmsCode,reqLogin } from '../../service/service.js';
var md5 = require('../../utils/md5.js');

Page({
  data: {
    mobileData: {
      title: '手机号',
      placeholder: '请输入账号'
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
    checkedRadio:1,
    password:''
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
      const openid = wx.getStorageSync('openid')
      let type=this.data.checkedRadio==1?'c':'b'
      let psw= md5.md5(this.data.password).toLowerCase();
      console.log(psw,1)
      let _password=''
      if(type=='c'){
        _password= md5.md5(psw).toLowerCase()
        console.log(_password,2)
      }else{
        _password=psw.toLowerCase()
      }
      const res = await reqLogin(this.data.mobile, _password,openid,type)
      console.log(res);
       if (res.data.code === 0) {
        wx.setStorageSync('mobile', this.data.mobile)
        if(type=='c'){
          wx.setStorageSync('utype', "c")
          wx.redirectTo({
            url: '../index/index'
          })
        }else{
          wx.setStorageSync('utype', "b")
          wx.redirectTo({
            url: '../index/index_B'
          })
        }
        
       
      }  else {
        wx.showToast({
          title: res.data.message,
          icon: 'none'
        })
      }
     
  },
  gozhuce(){
    wx.redirectTo({
      url: '../mobile/verify/verify?handle=bind&type=register'
    })
  },
  goforget(){
    wx.redirectTo({
      url: '../mobile/verify/verify?handle=reset'
    })
  },
  changeChart(event) {
    let val = Number(event.currentTarget.dataset.id)
    console.log(val)
    // const devid = this.data.devid
     this.setData({ checkedRadio: val })
    // this.newGetDate(devid, val)
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
  inputpsd: function (e) {
    this.setData({ password: e.detail.value })
  },
  async getSmsCode() {
    const res = await reqSendCodeLogin(this.data.mobile)
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

 


 
  
