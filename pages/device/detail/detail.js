import API from '../../../service/index.js';
import { getDateStr, formatTime, multiSelectorList, setOption } from '../../../utils/util.js';
import { reqDevCharts, reqSetParams } from '../../../service/service.js';
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
      // {
      //   title: '告警信息',
      //   content: [
      //     { label: '超高温度告警', value: 'baojingwendu_shangxian', type: 'input', placeholder: '请输入' },
      //     { label: '超低温度告警', value: 'baojingwendu_xiaxian', type: 'input', placeholder: '请输入' },
      //     { label: '超高湿度告警', value: 'chaogaoshidubaojing', type: 'input', placeholder: '请输入' },
      //     { label: '超低湿度告警', value: 'chaodishidubaojing', type: 'input', placeholder: '请输入' },
      //   ]
      // },
      {
        title: '参数信息',
        content: [
          // { label: '电量下线预警', value: 'dianliang_xiaxian_baojing', type: 'switch' },
          { label: '夜间上传开关', value: 'yejianshangchuankaiguan', type: 'switch' }
        ]
      },
      // {
      //   title: '定时推送信息',
      //   content: [
      //     { label: '时间', value: 'dingshifasong', type: 'picker' }
      //   ]
      // }
    ],
    paramsData: {},
    isRequested: false,
    deviceDataList: [],
    startNo: 0,
    devid: '',
    multiSelectorList: [],
    choose_year: 2019
  },
  onLoad: function (options) {
    // 获取组件
    this.ecComponent = this.selectComponent('#mychart-dom-bar');
    const devid = options.devid;
    const isMaster = options.is_master;
    if(isMaster === "0") {
      this.setData({
        [paramsList[0].content[3].disabled]: true,
        [paramsList[1].content[0].disabled]: true,
        [paramsList[1].content[1].disabled]: true,
        [paramsList[1].content[2].disabled]: true,
        [paramsList[1].content[3].disabled]: true
      })
    }
    this.setData({
      devid: devid,
      multiSelectorList: multiSelectorList()
    })
    const mobile = wx.getStorageSync('mobile');
    const endTime = formatTime(new Date(), '-');
    // 获取图表
    reqDevCharts(mobile, devid, endTime).then(res => {
      if(res.data.code === 10000) {
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
        this.setSwiperHeight('.tab-swiper1');
      }
    })
  },
  onReachBottom: function () {
    // 页面触底时执行
    if(this.data.currentItem !== 1) {
      return 
    }
    const devid = wx.getStorageSync('devid');
    const mobile = wx.getStorageSync('mobile');
    this.setData({
      startNo: this.data.startNo + 20
    })
    this.reqDevData(mobile, devid, this.data.startNo).then(res => {
      if (res.data.code === 10000) {
        let list = this.data.deviceDataList;
        list = list.concat(res.data.resultCode);
        this.setData({
          deviceDataList: list
        })
        this.setSwiperHeight('.tab-swiper2');
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
  reqDevParams(mobile, devid) {
    return new Promise((resolve, reject) => {
      wx.request({
        url: API.reqDevParams,
        data: {
          admin_permit: 'zjly8888',
          UserP: 'W',
          admin_pass: '123456',
          admin_user: mobile,
          SheBeiBianHao: devid
        },
        method: 'post',
        success: res => {
          console.log(res);
          resolve(res);
        }
      })
    })
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
      // 获取图表
      const endTime = formatTime(new Date(), '-');
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
          this.setSwiperHeight('.tab-swiper1');
        }
      })
    } else if (e.currentTarget.dataset.id === 1) {
      // 数据
      this.reqDevData(mobile, devid, this.data.startNo).then(res => {
        if (res.data.code === 10000) {
          this.setData({
            deviceDataList: res.data.resultCode === 'null' ? [] : res.data.resultCode
          })
          this.setSwiperHeight('.tab-swiper2');
        }
      })
    } else if (e.currentTarget.dataset.id === 2) {
      // 获取参数
      this.reqDevParams(mobile, devid).then(res => {
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
    console.log(e)
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
          this.setSwiperHeight('.tab-swiper1');
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
          this.setSwiperHeight('.tab-swiper1');
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
          this.setSwiperHeight('.tab-swiper1');
        }
      })
    }
  },
  reqDevData(mobile, devid, startNo) {
    const endTime = formatTime(new Date(), '-');
    return new Promise((resolve, reject) => {
      wx.request({
        url: API.reqDevData,
        method: 'post',
        data: {
          admin_permit: 'zjly8888',
          UserP: 'W',
          admin_user: mobile,
          admin_pass: '123456',
          StartTime: '2000-08-26 00:00:00',
          StartNo: startNo,
          Length: 20,
          EndTime: endTime,
          SheBeiBianHao: devid
        },
        success: res => {
          resolve(res);
        }
      })
    })
  },
  addFormItem() {
    let obj = [];
    if (this.data.paramsData.dingshifasong) {
      obj = [].concat(this.data.paramsData.dingshifasong);
    }
    obj.push(formatTime(new Date()));
    this.setData({
      'paramsData.dingshifasong': obj
    })
    this.setSwiperHeight('.tab-swiper3');
  },
  deleteFormItem(e) {
    let obj = this.data.paramsData.dingshifasong;
    obj.splice(e.currentTarget.dataset.index, 1);
    this.setData({
      'paramsData.dingshifasong': obj
    })
  },
  //获取时间日期
  bindMultiPickerChange: function (e) {
    // console.log('picker发送选择改变，携带值为', e.detail.value)
    // this.setData({
    //   multiIndex: e.detail.value
    // })
    const index = e.detail.value;
    const year = this.data.multiSelectorList[0][index[0]];
    const month = this.data.multiSelectorList[1][index[1]];
    const day = this.data.multiSelectorList[2][index[2]];
    const hour = this.data.multiSelectorList[3][index[3]];
    const minute = this.data.multiSelectorList[4][index[4]];
    const second = this.data.multiSelectorList[5][index[5]];
    // console.log(`${year}-${month}-${day}-${hour}-${minute}`);
    this.setData({
      ['paramsData.dingshifasong['+e.currentTarget.dataset.index+']']: year + '-' + month + '-' + day + ' ' + hour + ':' + minute + ':'+ second
    })
    // console.log(this.data.time);
  },
  //监听picker的滚动事件
  bindMultiPickerColumnChange: function (e) {
    //获取年份
    if (e.detail.column == 0) {
      this.setData({
        choose_year: this.data.multiSelectorList[e.detail.column][e.detail.value]
      })
    }
    if (e.detail.column == 1) {
      let num = parseInt(this.data.multiSelectorList[e.detail.column][e.detail.value]);
      let temp = [];
      if (num == 1 || num == 3 || num == 5 || num == 7 || num == 8 || num == 10 || num == 12) { //判断31天的月份
        for (let i = 1; i <= 31; i++) {
          if (i < 10) {
            i = "0" + i;
          }
          temp.push("" + i);
        }
        this.setData({
          ['multiSelectorList[2]']: temp
        });
      } else if (num == 4 || num == 6 || num == 9 || num == 11) { //判断30天的月份
        for (let i = 1; i <= 30; i++) {
          if (i < 10) {
            i = "0" + i;
          }
          temp.push("" + i);
        }
        this.setData({
          ['multiSelectorList[2]']: temp
        });
      } else if (num == 2) { //判断2月份天数
        let year = parseInt(this.data.choose_year);
        if (((year % 400 == 0) || (year % 100 != 0)) && (year % 4 == 0)) {
          for (let i = 1; i <= 29; i++) {
            if (i < 10) {
              i = "0" + i;
            }
            temp.push("" + i);
          }
          this.setData({
            ['multiSelectorList[2]']: temp
          });
        } else {
          for (let i = 1; i <= 28; i++) {
            if (i < 10) {
              i = "0" + i;
            }
            temp.push("" + i);
          }
          this.setData({
            ['multiSelectorList[2]']: temp
          });
        }
      }
    }
    var data = {
      multiSelectorList: this.data.multiSelectorList,
      // multiIndex: this.data.multiIndex
    };
    // data.multiIndex[e.detail.column] = e.detail.value;
    this.setData(data);
  }
})