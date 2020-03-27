import { reqVerifyRegister } from '../../service/service.js';
const app = getApp()

Page({
  data: {
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    menuList: [
      {
        icon: '../../images/icon-invite@2x.png',
        text: '邀请家人',
        tap: 'invite'
      },
      {
        icon: '../../images/icon-bill@2x.png',
        text: '待缴账单',
        tap: 'bill'
      },
      {
        icon: '../../images/icon-mobile@2x.png',
        text: '账户设置',
        tap: 'mobile'
      },
      {
        icon: '../../images/icon-issue@2x.png',
        text: '常见问题',
        tap: 'issue'
      },
      {
        icon: '../../images/icon-service@2x.png',
        text: '联系客服',
        tap: 'service'
      }
    ],
    isHasAcess: false
  },
  async onLoad(options) {
    const openid = wx.getStorageSync('openid');
    this.setUserInfo();
    const res = await reqVerifyRegister(openid);
    if (res.data.code === 0 && res.data.data) {
      if (res.data.data.phone) {
        wx.setStorageSync('mobile', res.data.data.phone);
        this.setData({
          isHasAcess: true
        })
      } else {
        wx.removeStorageSync('mobile');
      }
    }
  },
  onShow: function () {
    const mobile = wx.getStorageSync('mobile');
    if(!mobile) {
      this.setData({
        isHasAcess: false
      })
    } else {
      this.setData({
        isHasAcess: true
      })
    } 
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        selected: 2
      })
    }
  },
  setUserInfo() {
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    } else if (this.data.canIUse) {
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        }
      })
    }
  },
  getUserInfo: function (e) {
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  }
})