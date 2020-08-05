import { formatTime, multiSelectorList, setOption } from '../../../utils/util.js';

import { reqDiagram, reqDevParams, reqDevData, reqUnBindDev, reqJudgeBinded ,reqSetRemarks ,reqShowchart } from '../../../service/service.js';
import * as echarts from '../../../utils/echarts.min.js'
var QQMapWX = require('../../../utils/qqmap-wx-jssdk')
var qqmapsdk = new QQMapWX({
  key: "TEMBZ-BB4K2-M7GUC-C6LM4-PZLEO-AWBOF" // 必填
})

Page({
  data: {
    TabCur: 0,
    tabList: ['详情', '位置', '数据', '参数'],
    ec: { lazyLoad: true },
    lastYear: '2020',
    checkedRadio: 1,
    paramsList: [
      { 
        title: '基本信息', 
        content: [
          { label: '设备类型', value: 'device_name', type: 'input', disabled: true },
          { label: '设备编号', value: 'shebeibianhao', type: 'input', disabled: true },
          { label: '到期日期', value: 'daoqishijian', type: 'input', disabled: true }
        ]
      },
      {
        title: '基本参数设置',
        content: [
          { label: '采集间隔', value: 'caiji_jiange_minute', type: 'input', placeholder: '单位：分钟' },
          { label: '上传间隔', value: 'fasong_jiange_minute', type: 'input', placeholder: '单位：分钟' },
          // { label: '超温储存时间间隔', value: 'chaowenchucunshijianjiange', type: 'input', placeholder: '单位：分钟' },
          // { label: '超温上传时间间隔', value: 'chaowenshangchuanshijianjiange', type: 'input', placeholder: '单位：分钟' },
          // { label: '夜间上传开关', value: 'yejianshangchuankaiguan', type: 'switch', placeholder: '请输入' },
          // { label: '飞行模式开关', value: 'feixingmoshikaiqi', type: 'switch', placeholder: '请输入' }
        ]
      },
      // {
      //   title: '电量设置',
      //   content: [
      //     { label: '电量下限报警开关', value: 'dianliang_xiaxian_baojing', type: 'switch', placeholder: '请输入' },
      //     { label: '电量下限', value: 'dianliang_xiaxian', type: 'input', placeholder: '请输入' }
      //   ]
      // },
      // {
      //   title: '推送设置',
      //   content: [
      //     { label: '微信推送报警', value: 'weixintuisong_baojing', type: 'switch', placeholder: '请输入' },
      //     { label: '短信推送报警', value: 'duanxingtuisong_baojing', type: 'switch', placeholder: '请输入' },
      //     { label: '短信推送报警手机号', value: 'duanxingtuisong', type: 'input', placeholder: '请输入' },
      //   ]
      // },
      // {
      //   title: '定时推送时间',
      //   content: [
      //     { value: 'dingshifasong', type: 'mulitPicker' }
      //   ]
      // }
      
    ],
    paramsListTHItem: [
      // {
      //   title: '温度设置',
      //   content: [
      //     { label: '温度报警上限开关', value: 'baojingwendu_shangxian_baojing', type: 'switch', placeholder: '请输入' },
      //     { label: '温度报警下限开关', value: 'baojingwendu_xiaxian_baojing', type: 'switch', placeholder: '请输入' },
      //     { label: '温度报警上限', value: 'baojingwendu_shangxian', type: 'digit', placeholder: '请输入' },
      //     { label: '温度报警下限', value: 'baojingwendu_xiaxian', type: 'digit', placeholder: '请输入' },
      //   ]
      // },
      // {
      //   title: '湿度设置',
      //   content: [
      //     { label: '湿度超低报警', value: 'chaodishidubaojing', type: 'switch', placeholder: '请输入' },
      //     { label: '湿度超高报警', value: 'chaogaoshidubaojing', type: 'switch', placeholder: '请输入' },
      //     { label: '湿度超低报警阈值', value: 'chaodishidubaojingfazhi', type: 'digit', placeholder: '请输入' },
      //     { label: '湿度超高报警阈值', value: 'chaogaoshidubaojingfazhi', type: 'digit', placeholder: '请输入' }
      //   ]
      // }
    ],
    paramsListTTItem: [
      // {
      //   title: '温度设置',
      //   content: [
      //     { label: '温度1报警上限开关', value: 'baojingwendu_shangxian_baojing', type: 'switch', placeholder: '请输入' },
      //     { label: '温度1报警下限开关', value: 'baojingwendu_xiaxian_baojing', type: 'switch', placeholder: '请输入' },
      //     { label: '温度1报警上限', value: 'baojingwendu_shangxian', type: 'digit', placeholder: '请输入' },
      //     { label: '温度1报警下限', value: 'baojingwendu_xiaxian', type: 'digit', placeholder: '请输入' },
      //     { label: '温度2报警下限开关', value: 'baojingwendu_two_xiaxian_baojing', type: 'switch', placeholder: '请输入' },
      //     { label: '温度2报警上限开关', value: 'baojingwendu_two_shangxian_baojing', type: 'switch', placeholder: '请输入' },
      //     { label: '温度2报警下限', value: 'baojingwendu_two_xiaxian', type: 'digit', placeholder: '请输入' },
      //     { label: '温度2报警上限', value: 'baojingwendu_two_shangxian', type: 'digit', placeholder: '请输入' }
      //   ]
      // }
    ],
    paramsData: {},
    isRequested: false,
    deviceDataList: [],
    deviceParams: {},
    startNo: 0,
    devid: '',
    multiSelectorList: [],
    latitude: 24.4795100000,
    longitude: 118.0894800000,
    markers: [{
      id: 0,
      latitude: '',
      longitude: '',
      callout: {
        content: "",
        padding: 10,
        display: 'ALWAYS',
        textAlign: 'center',
        borderRadius: 10,
        borderColor: '#ff0000',
        borderWidth: 2,
        anchorY: -23
      }
    }],
    isMaster: "0",
    isShowLoadMore: false,
    isLoad: false,
    isutypeb:true,
    
  },
  onLoad (options) {
    this.ecComponent = this.selectComponent('#mychart-dom-bar')
    const {devid, isMaster } = options
    this.setData({
      devid,
      isMaster,
      multiSelectorList: multiSelectorList()
    })
    const mobile = wx.getStorageSync('mobile')
    this.reqDevParams(mobile, devid)
    this.initChart(devid,1)
    this.reqDevData(mobile, devid)
    if(wx.getStorageSync('utype')=="b"){
      this.setData({
        isutypeb:false
      })
    }
  },
  async bindscrolltolower() {
    this.setData({ isShowLoadMore: true })
    const mobile = wx.getStorageSync('mobile')
    if(this.data.startNo >= 1000) {
      this.setData({ isLoad: true })
      wx.showModal({
        content: '查看更多数据，请前往后台系统',
        showCancel: false
      })
      return
    }
    this.setData({
      startNo: this.data.startNo + 20
    })
    const endTime = formatTime(new Date(), '-');
    const res = await reqDevData(mobile, this.data.devid, this.data.startNo, endTime)
    if (res.data.code === 10000 && res.data.resultCode != 'null') {
      let list = this.data.deviceDataList
      list = list.concat(res.data.resultCode)
      this.setData({ deviceDataList: list })
    } else if (res.data.code === 10000 && res.data.resultCode == 'null') {
      this.setData({ isLoad: true })
    }
  },
  async initChart(devid,num) {
    const endTime = formatTime(new Date(), '-')
   // const res = await reqDevCharts(mobile, devid, endTime, fromTime)
   const res = await reqShowchart(devid,num)
    if (res.data.code === 0) {
      let xArr = [], yArr1 = [], yArr2 = []
      const list = res.data.data.data === 'null' ? [] : res.data.data.data
      if(res.data.data.model_type=='TH'){
        list.forEach((item) => {
          xArr.push(item.time.substr(5, 11));
          yArr1.push(parseFloat(Number(item.temperature01).toFixed(2)))
          yArr2.push(parseFloat(Number(item.humidity).toFixed(2)));
        })
        this.initCharts(xArr.reverse(), yArr1.reverse(), yArr2.reverse(),"TH");
      }else if(res.data.data.model_type=='TT'){
        list.forEach((item) => {
          xArr.push(item.time.substr(5, 11));
          yArr1.push(parseFloat(Number(item.temperature01).toFixed(2)))
          yArr2.push(parseFloat(Number(item.temperature02).toFixed(2)));
        })
        this.initCharts(xArr.reverse(), yArr1.reverse(), yArr2.reverse(), "TT");
      }
    }
  },
  initCharts(xData, seriesData1, seriesData2, type) {
    this.ecComponent.init((canvas, width, height) => {
      const chart = echarts.init(canvas, null, {
        width,
        height
      })
      if(type=='TT') {
        setOption(chart, xData, seriesData1, seriesData2,'TT', ['温度1','温度2'])
      } else if(type=='TH') {
        setOption(chart, xData, seriesData1, seriesData2, 'TH',['温度','湿度'])
      }
     
      this.chart = chart
      return chart
    })
  },
  initMap(hisdata) {
    var latitude1 = "markers[" + 0 + "].latitude"
    var longitude1 = "markers[" + 0 + "].longitude"
    var content = "markers[" + 0 + "].callout.content"
    qqmapsdk.reverseGeocoder({
      location: {
        latitude: hisdata.weidu,
        longitude: hisdata.jingdu
      },
      success:(res) => {
        let tempinfo = ''
        if (res.model_type == "TT") {
          tempinfo = res.result.address + '\n' + '温度1:' + hisdata.temperature01 + '℃ / 温度2:' + hisdata.temperature02 + '℃' + '\n' + '时间' + hisdata.time
        } else {
          tempinfo = res.result.address + '\n' + '温度:' + hisdata.temperature01 + '℃ / 湿度:' + hisdata.humidity + '%RH' + '\n' + '时间' + hisdata.time
        }
        this.setData({
          latitude: hisdata.weidu,
          longitude: hisdata.jingdu,
          [latitude1]: hisdata.weidu,
          [longitude1]: hisdata.jingdu,
          [content]: tempinfo
        })
      }

    })
  },
  bindInputChange(e) {
    this.setData({
      ['paramsData.'+ e.currentTarget.dataset.key]: e.detail.value
    })
  },
  bindSwitchChange(e) {
    let value = Number(e.detail.value).toString()
    this.setData({
      ['paramsData.' + e.currentTarget.dataset.key]: value
    })
  },
  async bindSaveParams() {
    if (this.data.paramsData.flow_type === '1' && this.data.paramsData.fasong_jiange_minute < 5) {
      wx.showToast({
        title: '上传间隔不能小于5分钟',
        icon: 'none'
      })
      return
    }
    if(this.data.deviceParams.model_type === 'TH') {
      if((this.data.paramsData.baojingwendu_shangxian < this.data.paramsData.baojingwendu_xiaxian) || (this.data.paramsData.chaodishidubaojingfazhi > this.data.paramsData.chaogaoshidubaojingfazhi)) {
        wx.showToast({
          title: '下限不得高于上限',
          icon: 'none'
        })
        return
      }
    } else if(this.data.deviceParams.model_type === 'TT') {
      if((this.data.paramsData.baojingwendu_shangxian < this.data.paramsData.baojingwendu_xiaxian) || (this.data.paramsData.baojingwendu_two_xiaxian > this.data.paramsData.baojingwendu_two_shangxian)) {
        wx.showToast({
          title: '下限不得高于上限',
          icon: 'none'
        })
        return
      }
    }
    const openid = wx.getStorageSync('openid')
    this.setData({
      'paramsData.openid': openid,
      'paramsData.devid': this.data.devid
    })
    const res = await reqSetRemarks(this.data.paramsData)
    if(res.data.code === 0) {
      wx.showToast({
        title: '修改成功!',
        icon: 'success',
        duration: 2000
      })
    } else {
      wx.showToast({
        title: res.data.message,
        icon: 'none'
      })
    }
  },
  tabSelect(e) {
    this.setData({
      TabCur: e.currentTarget.dataset.id
    })
  },
  swiperChange(e) {
    this.setData({
      TabCur: e.detail.current
    })
  },
  async reqDevData(mobile, devid) {
    const endTime = formatTime(new Date(), '-')
    const res = await reqDevData(mobile, devid, this.data.startNo, endTime)
    console.log(res)
    if (res.data.code === 10000) {
      this.setData({
        deviceDataList: res.data.resultCode === 'null' ? [] : res.data.resultCode
      })
      if(res.data.resultCode[0]) {
        const lastYear = res.data.resultCode[0].time.slice(0, 4)
        this.setData({ lastYear })
      }
      this.initMap(res.data.resultCode[0] || {})
    }
  },
  async reqDevParams(mobile, devid) {
    const res = await reqDevParams(mobile, devid)
    if (res.data.code === 10000) {
      res.data.resultCode.daoqishijian = res.data.resultCode.daoqishijian.slice(0, 10)
      this.setData({
        paramsData: res.data.resultCode,
        deviceParams: res.data.resultCode
      })
      this.initForm(res.data.resultCode.model_type)
    }
  },
  initForm(type) {
    const paramsList = this.data.paramsList
    if(type === 'TH') {
      paramsList.splice(2, 0, ...this.data.paramsListTHItem)
    } else if(type === 'TT') {
      paramsList.splice(2, 0, ...this.data.paramsListTTItem)
    }
    this.setData({ paramsList })
  },
  bindUnBind() {
    wx.showModal({
      content: '确定要解绑 ' + this.data.devid + ' 设备吗？',
      success: res => {
        if(res.confirm) {
          this.unBind()
        }
      }
    })
  },
  async unBind() {
    const mobile = wx.getStorageSync('mobile')
    let res
    if(this.data.isMaster === '1' || this.data.isMaster === '2') {
      res = await reqUnBindDev(mobile, this.data.devid)
    } else {
      res = await reqJudgeBinded(mobile, this.data.devid)
    }
    if (res.data.code === 0) {
      wx.showToast({
        title: '解绑成功',
        success: () => {
          wx.redirectTo({
            url: '../../index/index',
          })
        }
      })
    } else {
      wx.showToast({
        title: res.data.message,
        icon: 'none',
        duration: 2000
      })
    }
  },
  async newGetDate(shebeibianhao,curveType) {
    const res = await reqDiagram({
      shebeibianhao,
      curveType
    })
    console.log(res)
    if (res.data.code === 0) {
      let xArr = [], yArr1 = [], yArr2 = []
      const list = res.data.data.data
      if(res.data.data.model_type=='TH'){
        list.forEach((item) => {
          xArr.push(item.time.substr(5, 11))
          yArr1.push(item.temperature01)
          yArr2.push(item.humidity)
        })
        this.initCharts(xArr.reverse(), yArr1.reverse(), yArr2.reverse(),"TH");
      }else if(res.data.data.model_type=='TT'){
        list.forEach((item) => {
          xArr.push(item.time.substr(5, 11));
          yArr1.push(item.temperature01)
          yArr2.push(item.temperature02)
        })
        this.initCharts(xArr.reverse(), yArr1.reverse(), yArr2.reverse(), "TT");
      }
    }
  },
  changeChart(event) {
    let val = Number(event.currentTarget.dataset.id)
    const devid = this.data.devid
    this.setData({ checkedRadio: val })
    this.newGetDate(devid, val)
  },
  bindPrinter() {
    wx.openBluetoothAdapter({
      success: res => {
        wx.navigateTo({
          url: '../../printer/printer?devid=' + this.data.devid
        })
      },
      fail(err) {
        wx.showToast({
          title: '请开启蓝牙',
          icon: 'none'
        })
      }
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
  },
  deleteFormItem(e) {
    let obj = this.data.paramsData.dingshifasong;
    obj.splice(e.currentTarget.dataset.index, 1);
    this.setData({
      'paramsData.dingshifasong': obj
    })
  },
  stopTouchMove() {
    return false
  }
})