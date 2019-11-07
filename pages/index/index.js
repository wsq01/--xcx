import { reqDevList, reqLookDev, reqOpenid, reqDevCharts } from '../../service/service.js';
import { getDateStr, formatTime, setOption } from '../../utils/util.js';
import * as echarts from '../../utils/echarts.min.js';
//获取应用实例
const app = getApp()

Page({
  data: {
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    indexData: {},
    isReqSuccess: false,
    showview: true,
    shareData: {},
    devList: [],
    isHasDev: false,
    advice: '秋季舒适温度为15℃-20℃，湿度为30%RH-60%RH！',
    ec: {
      lazyLoad: true
    },
    
  },
  onShow: function () {
    const devid = wx.getStorageSync('devid');
    const openid = wx.getStorageSync('openid');
    if(!devid && openid) {
      this.setData({
        isHasDev: false
      })
    }
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        selected: 0
      })
    }
  },
  onLoad: function(options) {
    wx.showLoading({
      title: '加载中...'
    });
    this.setUserInfo();
    const launchOptions = wx.getLaunchOptionsSync();
    if (launchOptions.query.id) {
      wx.setStorageSync('devid', launchOptions.query.id);
    }
    const devid = wx.getStorageSync('devid');
    reqOpenid().then(res => {
      const data = JSON.parse(res.data.data);
      wx.setStorageSync('openid', data.openid);
      return reqDevList(data.openid);
    }).then(res => {
      if(devid) {
        this.setData({
          isHasDev: true
        })
        return devid;
      }
      if (res.data.code === 0 && res.data.data && res.data.data.data[0].shebeibianhao) {
        this.setData({
          isHasDev: true
        })
        wx.setStorageSync('devid', res.data.data.data[0].shebeibianhao);
        return res.data.data.data[0].shebeibianhao;
      }
      return false;
    }).then(res => {
      wx.hideLoading();
      this.setData({
        isReqSuccess: true
      })
      if(res) {
        reqLookDev(res).then(data => {
          this.setData({
            indexData: data.data.data
          })
        })
      }
      setTimeout(() => {
        const devid = wx.getStorageSync('devid');
        // 获取图表
        const mobile = wx.getStorageSync('mobile');
        if (mobile && devid) {
          const endTime = formatTime(new Date(), '-');
          this.ecComponent = this.selectComponent('#mychart-dom-bar');
          reqDevCharts(mobile, devid, endTime).then(res => {
            if (res.data.code === 10000) {
              let xArr = [];
              let yArr1 = [];
              let yArr2 = [];
              const list = res.data.resultCode === 'null' ? [] : res.data.resultCode;
              list.forEach((item) => {
                xArr.push(item.time.substr(0, 10));
                yArr1.push(item.temperature01);
                yArr2.push(item.humidity);
              })
              this.initCharts(xArr, yArr1, yArr2);
            }
          })

        }
      })
    })
  },
  chooseImg() {
    return new Promise((resolve, reject) => {
      wx.chooseImage({
        count: 1,
        sizeType: ['original', 'compressed'],
        sourceType: ['album', 'camera'],
        success: res => {
          wx.setStorageSync('shareImg', res.tempFilePaths);
          resolve();
        }
      })
    })
  },
  share() {
    this.chooseImg().then(() => {
      this.setData({
        shareData: {
          nickname: '鲜盾管家',
          isShowShareModal: true,
          title: '安全智能化，轻松就到达——保障您的安全，是我们智冷人不变的追求。'
        }
      })
    });
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
    this.share();
  },
  changeChart(event) {
    let val = Number(event.currentTarget.dataset.id);
    const devid = wx.getStorageSync('devid');
    const mobile = wx.getStorageSync('mobile');
    if (val == 1) {
      // 点击  今天
      const fromTime = getDateStr(new Date(), -1);
      const endTime = formatTime(new Date(), '-');
      // 获取图表
      reqDevCharts(mobile, devid, endTime, fromTime).then(res => {
        if (res.data.code === 10000) {
          let xArr = [];
          let yArr1 = [];
          let yArr2 = [];
          const list = res.data.resultCode === 'null' ? [] : res.data.resultCode;
          list.forEach((item) => {
            xArr.push(item.time.substr(0, 10));
            yArr1.push(item.temperature01);
            yArr2.push(item.humidity);
          })
          this.initCharts(xArr, yArr1, yArr2);
        }
      })
    } else if (val == 2) {
      // 点击一周
      const fromTime = getDateStr(new Date(), -7);
      const endTime = formatTime(new Date(), '-');
      // 获取图表
      reqDevCharts(mobile, devid, endTime, fromTime).then(res => {
        if (res.data.code === 10000) {
          let xArr = [];
          let yArr1 = [];
          let yArr2 = [];
          const list = res.data.resultCode === 'null' ? [] : res.data.resultCode;
          list.forEach((item) => {
            xArr.push(item.time.substr(0, 10));
            yArr1.push(item.temperature01);
            yArr2.push(item.humidity);
          })
          this.initCharts(xArr, yArr1, yArr2);
        }
      })
    } else {
      // 点击 一个月
      let fromTime = getDateStr(new Date(), -30);
      const endTime = formatTime(new Date(), '-');
      // 获取图表
      reqDevCharts(mobile, devid, endTime, fromTime).then(res => {
        if (res.data.code === 10000) {
          let xArr = [];
          let yArr1 = [];
          let yArr2 = [];
          const list = res.data.resultCode === 'null' ? [] : res.data.resultCode;
          list.forEach((item) => {
            xArr.push(item.time.substr(0, 10));
            yArr1.push(item.temperature01);
            yArr2.push(item.humidity);
          })
          this.initCharts(xArr, yArr1, yArr2);
        }
      })
    }
  },
  initCharts: function (xData, seriesData1, seriesData2) {
    this.ecComponent.init((canvas, width, height) => {
      // 获取组件的 canvas、width、height 后的回调函数
      // 在这里初始化图表
      const chart = echarts.init(canvas, null, {
        width: width,
        height: height
      });
      setOption(chart, xData, seriesData1, seriesData2, ['温度', '湿度']);

      // 将图表实例绑定到 this 上，可以在其他成员函数（如 dispose）中访问
      this.chart = chart;

      // 注意这里一定要返回 chart 实例，否则会影响事件处理等
      return chart;
    });
  },
})