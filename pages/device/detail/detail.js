import API from '../../../service/index.js';
import { getDateStr, formatTime, multiSelectorList, setOption } from '../../../utils/util.js';
import { reqDevCharts, reqSetParams, reqDevParams, reqDevData } from '../../../service/service.js';
import * as echarts from '../../../utils/echarts.min.js';

Page({
  data: {
    swiperItemHeight: 0,
    currentItem: 0,
    active: ['active', '', ''],
    tabList: [
      {
        text: '曲线',
        active: true
      },
      {
        text: '数据'
      },
      {
        text: '参数'
      }
    ],
    ec: {
      lazyLoad: true
    },
    paramsList: [
      { 
        title: '基本信息', 
        content: [
          { label: '设备编号', value: 'shebeibianhao', type: 'input', disabled: true },
          { label: '设备类型', value: 'device_name', type: 'input', disabled: true },
          { label: '设备昵称', value: 'beizhu', type: 'input', placeholder: '请输入' },
          { label: '激活日期', value: 'jihuoshijian', type: 'input', disabled: true },
          { label: '到期日期预警', value: 'daoqishijian', type: 'input', disabled: true }
        ]
      },
      {
        title: '指令信息',
        content: [
          { label: '正常采集间隔', value: 'caiji_jiange_minute', type: 'input', placeholder: '请输入' },
          { label: '正常上传间隔', value: 'fasong_jiange_minute', type: 'input', placeholder: '请输入' },
          { label: '超温采集间隔', value: 'chaowenchucunshijianjiange', type: 'input', placeholder: '请输入' },
          { label: '超温上传间隔', value: 'chaowenshangchuanshijianjiange', type: 'input', placeholder: '请输入' }
        ]
      },
      {
        title: '参数信息',
        content: [
          { label: '夜间数据', value: 'yejianshangchuankaiguan', type: 'switch' }
        ]
      }
    ],
    paramsData: {},
    isRequested: false,
    deviceDataList: [],
    startNo: 0,
    devid: '',
    multiSelectorList: [],
    choose_year: 2019,
    isShowDownload: false
  },
  onLoad: function (options) {
    wx.showLoading({
      title: '加载中...'
    })
    // 获取组件
    this.ecComponent = this.selectComponent('#mychart-dom-bar');
    const devid = options.devid;
    const isMaster = options.is_master;
    // 主副设备参数设置
    if (isMaster === "0") {
      console.log(this.data.paramsList)
      this.setData({
        'paramsList[0].content[3].disabled': true,
        'paramsList[1].content[0].disabled': true,
        'paramsList[1].content[1].disabled': true,
        'paramsList[1].content[2].disabled': true,
        'paramsList[1].content[3].disabled': true
      })
    }
    this.setData({
      devid: devid,
      multiSelectorList: multiSelectorList()
    })
    const mobile = wx.getStorageSync('mobile');
    const endTime = formatTime(new Date(), '-');
    // 获取图表
    this.initChart(mobile, devid);
    this.setSwiperHeight('.tab-swiper1');
    wx.hideLoading();
  },
  onReachBottom: function () {
    // 页面触底时执行
    if(this.data.currentItem !== 1) {
      return 
    }
    const devid = this.data.devid;
    const mobile = wx.getStorageSync('mobile');
    this.setData({
      startNo: this.data.startNo + 20
    })
    const endTime = formatTime(new Date(), '-');
    reqDevData(mobile, devid, this.data.startNo, endTime).then(res => {
      if (res.data.code === 10000 && res.data.resultCode != 'null') {
        let list = this.data.deviceDataList;
        list = list.concat(res.data.resultCode);
        this.setData({
          deviceDataList: list
        })
        this.setSwiperHeight('.tab-swiper2');
      } else if (res.data.code === 10000 && res.data.resultCode == 'null') {
        this.setData({
          isEnd: true
        })
      }
    })
  },
  initChart(mobile, devid, fromTime) {
    const endTime = formatTime(new Date(), '-');
    reqDevCharts(mobile, devid, endTime, fromTime).then(res => {
      if (res.data.code === 10000) {
        let xArr = [];
        let yArr1 = [];
        let yArr2 = [];
        const list = res.data.resultCode === 'null' ? [] : res.data.resultCode;
        if(list.length === 0) {
          this.setData({
            hasChartList: false
          })
          return
        } else {
          this.setData({
            hasChartList: true
          })
        }
        list.forEach((item) => {
          xArr.push(item.time.substr(0, 10));
          yArr1.push(item.temperature01);
          yArr2.push(item.humidity);
        })
        this.initCharts(xArr, yArr1, yArr2);
        this.setSwiperHeight('.tab-swiper1');
      }
    })
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
  bindInputChange(e) {
    console.log(e)
    this.setData({
      ['paramsData.'+ e.currentTarget.dataset.key]: e.detail.value
    })
  },
  bindSwitchChange(e) {
    let value = 0;
    if(e.detail.value) {
      value = 1;
    }
    this.setData({
      ['paramsData.' + e.currentTarget.dataset.key]: value
    })
  },
  bindSaveParams() {
    const openid = wx.getStorageSync('openid');
    this.setData({
      'paramsData.openid': openid,
      'paramsData.devid': this.data.devid
    })
    reqSetParams(this.data.paramsData).then(res => {
      if(res.data.code === 0) {
        wx.showToast({
          title: '修改成功!',
          icon: 'success',
          duration: 4000
        })
      } else {
        wx.showToast({
          title: res.data.message,
          icon: 'none'
        })
      }
    })
  },
  bindtabChange(e) {
    let active = ['', '', ''];
    active[e.currentTarget.dataset.id] = 'active'
    this.setData({
      currentItem: e.currentTarget.dataset.id,
      active: active
    })
    const mobile = wx.getStorageSync('mobile');
    const devid = this.data.devid;
    if(e.currentTarget.dataset.id === 0) {
      this.setData({
        isShowDownload: false
      })
      // 获取图表
      this.initChart(mobile, devid);
      this.setSwiperHeight('.tab-swiper1');
    } else if (e.currentTarget.dataset.id === 1) {
      this.setData({
        isShowDownload: true
      })
      // 数据
      const endTime = formatTime(new Date(), '-');
      reqDevData(mobile, devid, this.data.startNo, endTime).then(res => {
        if (res.data.code === 10000) {
          this.setData({
            deviceDataList: res.data.resultCode === 'null' ? [] : res.data.resultCode
          })
          this.setSwiperHeight('.tab-swiper2');
        }
      })
    } else if (e.currentTarget.dataset.id === 2) {
      this.setData({
        isShowDownload: false
      })
      // 获取参数
      reqDevParams(mobile, devid).then(res => {
        if (res.data.code === 10000) {
          this.setData({
            isRequested: true,
            paramsData: res.data.resultCode
          })
          this.setSwiperHeight('.tab-swiper3');
        }
      })
    }
  },
  swiperChange(e) {
    let active = ['', '', ''];
    active[e.detail.current] = 'active'
    this.setData({
      active: active
    })
    let selector = '.tab-swiper' + (e.detail.current + 1);
    this.setSwiperHeight(selector);
  },
  setSwiperHeight(selector) {
    const that = this;
    const query = wx.createSelectorQuery();
    query.select(selector).boundingClientRect(function (rect) {
      that.setData({
        swiperItemHeight: rect.height + 50 + 'px'
      })
    }).exec()
  },
  changeChart(event) {
    let val = Number(event.currentTarget.dataset.id);
    const devid = wx.getStorageSync('devid');
    const mobile = wx.getStorageSync('mobile');
    if (val == 1) {
      // 点击  今天
      const fromTime = getDateStr(new Date(), -1);
      // 获取图表
      this.initChart(mobile, devid,fromTime);
    } else if (val == 2) {
      // 点击一周
      const fromTime = getDateStr(new Date(), -7);
      // 获取图表
      this.initChart(mobile, devid, fromTime);
    } else {
      // 点击 一个月
      const fromTime = getDateStr(new Date(), -30);
      // 获取图表
      this.initChart(mobile, devid, fromTime);
    }
  },
  bindDownload() {
    wx.showModal({
      content: '下载PDF文件需跳转至（中集智冷科技）公众号',
      showCancel: false
    })
  }
})