import { formatTime, multiSelectorList, setOption } from '../../../utils/util.js';
import * as datetimepickerUtil from '../../../utils/datetimepicker.js'
import { reqDiagram, reqDevParams, reqDevData, reqUnBindDev, reqJudgeBinded ,reqSetRemarks ,reqShowchart,reqSetParams,reqWarningList  } from '../../../service/service.js';
import * as echarts from '../../../utils/echarts.min.js'
var QQMapWX = require('../../../utils/qqmap-wx-jssdk')
var qqmapsdk = new QQMapWX({
  key: "TEMBZ-BB4K2-M7GUC-C6LM4-PZLEO-AWBOF" // 必填
})
var app = getApp();
Page({
  data: {
    TabCur: 0,
    tabList: ['详情', '位置', '数据', '参数','报警'],
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
        title: '参数设置',
        content: [
          { label: '采集间隔', value: 'caiji_jiange_minute', type: 'input', placeholder: '单位：分钟' },
          { label: '上传间隔', value: 'fasong_jiange_minute', type: 'input', placeholder: '单位：分钟' },
          { label: '设备排序', value: 'sort', type: 'input', placeholder: '请输入排序号' },
         
        ]
      },
      // {
      //   title: '推送设置',
      //   content: [
      //     { label: '短信推送报警', value: 'duanxingtuisong_baojing', type: 'switch', placeholder: '请输入' },
      //     { label: '短信推送报警手机号', value: 'duanxingtuisong', type: 'input', placeholder: '请输入' },
      //   ]
      // },   
    ],
    paramsListTHItem: [
      {
        title: '报警设置',
        content: [
          { label: '温度上限开关', value: 'baojingwendu_shangxian_baojing', type: 'switch', placeholder: '请输入' },
          { label: '温度上限阈值', value: 'baojingwendu_shangxian', type: 'digit', placeholder: '请输入' },
          { label: '温度下限开关', value: 'baojingwendu_xiaxian_baojing', type: 'switch', placeholder: '请输入' },        
          { label: '温度下限阈值', value: 'baojingwendu_xiaxian', type: 'digit', placeholder: '请输入' },
          { label: '湿度上限开关', value: 'chaogaoshidubaojing', type: 'switch', placeholder: '请输入' },
          { label: '湿度上限阈值', value: 'chaogaoshidubaojingfazhi', type: 'digit', placeholder: '请输入' },
          { label: '湿度下限开关', value: 'chaodishidubaojing', type: 'switch', placeholder: '请输入' },        
          { label: '湿度下限阈值', value: 'chaodishidubaojingfazhi', type: 'digit', placeholder: '请输入' },
          { label: '电量下限开关', value: 'dianliang_xiaxian_baojing', type: 'switch', placeholder: '请输入' },
          { label: '电量下限阈值', value: 'dianliang_xiaxian', type: 'input', placeholder: '请输入' },
          { label: '微信报警', value: 'weixintuisong_baojing', type: 'switch', placeholder: '请输入' },
          { label: '电话报警', value: 'is_open', type: 'switch', placeholder: '请输入' }
        ]
      },

    ],
    paramsListTTItem: [
      {
        title: '报警参数设置',
        content: [
          { label: '温度1上限开关', value: 'baojingwendu_shangxian_baojing', type: 'switch', placeholder: '请输入' },
          { label: '温度1上限阈值', value: 'baojingwendu_shangxian', type: 'digit', placeholder: '请输入' },
          { label: '温度1下限开关', value: 'baojingwendu_xiaxian_baojing', type: 'switch', placeholder: '请输入' },         
          { label: '温度1下限阈值', value: 'baojingwendu_xiaxian', type: 'digit', placeholder: '请输入' },
          { label: '温度2上限开关', value: 'baojingwendu_two_shangxian_baojing', type: 'switch', placeholder: '请输入' },
          { label: '温度2上限阈值', value: 'baojingwendu_two_shangxian', type: 'digit', placeholder: '请输入' },
          { label: '温度2下限开关', value: 'baojingwendu_two_xiaxian_baojing', type: 'switch', placeholder: '请输入' },
          { label: '温度2下限阈值', value: 'baojingwendu_two_xiaxian', type: 'digit', placeholder: '请输入' },  
          { label: '电量下限开关', value: 'dianliang_xiaxian_baojing', type: 'switch', placeholder: '请输入' },
          { label: '电量下限阈值', value: 'dianliang_xiaxian', type: 'input', placeholder: '请输入' },
          { label: '微信报警', value: 'weixintuisong_baojing', type: 'switch', placeholder: '请输入' },
          { label: '电话报警', value: 'is_open', type: 'switch', placeholder: '请输入' },
        ]
      }
    ],
    paramsListTPAItem: [
      {
        title: '报警设置',
        content: [
          { label: '微信报警', value: 'weixintuisong_baojing', type: 'switch', placeholder: '请输入' },
          { label: '电话报警', value: 'is_open', type: 'switch', placeholder: '请输入' }
        ]
      },

    ],
    paramsData: {},
    isRequested: false,
    deviceDataList: [],
    warnMessList:[],
    deviceParams: {},
    startNo: 0,
    startwarnNo: 0,
    devid: '',
    model_type:'',
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
    isTriggered: true,
    message:'暂无数据',
    modalChoose: null,
    dateTime1: '',
    dateTime2: '',
    dateTimeArray1: [],
    dateTimeArray2: [],
  },
  onLoad (options) {
    this.ecComponent = this.selectComponent('#mychart-dom-bar')
    const {devid, isMaster,model_type } = options
    console.log(options)
    this.setData({
      devid,
      isMaster,
      model_type,
      multiSelectorList: multiSelectorList()
    })
    if(model_type=="TPA"){
      let arr=this.data.tabList
      let arr2= arr.splice(3,2)
      console.log(arr)
      this.setData({
        tabList:arr2,
        TabCur:3
      })
    }
    const mobile = wx.getStorageSync('mobile')
    this.reqDevParams(mobile, devid)
    this.initChart(devid,1)
    this.reqDevData(mobile, devid)
    this.reqWarningList(mobile,devid,this.data.startwarnNo)
    
    // if(wx.getStorageSync('utype')=="b"){
    //   this.setData({
    //     isutypeb:false
    //   })
    // }
    this.initPicker()
  },
  initPicker() {
    const obj = datetimepickerUtil.dateTimePickerWithS(2010)
    this.setData({
      dateTime1: obj.dateTime1,
      dateTimeArray1: obj.dateTimeArray1,
      dateTime2: obj.dateTime2,
      dateTimeArray2: obj.dateTimeArray2
    })
  },
  bindwarnscrolltolower(){
    const mobile = wx.getStorageSync('mobile')
    console.log(2)
    let startwarn=this.data.startwarnNo
    startwarn=startwarn+20
    this.setData({
      startwarnNo: startwarn
    })
    this.reqWarningList(mobile,this.data.devid)
  },
  changeDateTime1(e) {
    this.setData({
      dateTime1: e.detail.value
    })
  },
  changeDateTimeColumn1(e) {
    var arr = this.data.dateTime1,
      dateArr = this.data.dateTimeArray1
    arr[e.detail.column] = e.detail.value
    dateArr[2] = datetimepickerUtil.getMonthDay(dateArr[0][arr[0]], dateArr[1][arr[1]])
    this.setData({
      dateTimeArray1: dateArr,
      dateTime1: arr
    })
  },
  changeDateTime2(e) {
    this.setData({
      dateTime2: e.detail.value
    })
  },
  changeDateTimeColumn2(e) {
    var arr = this.data.dateTime2
    var dateArr = this.data.dateTimeArray2
    arr[e.detail.column] = e.detail.value
    dateArr[2] = datetimepickerUtil.getMonthDay(dateArr[0][arr[0]], dateArr[1][arr[1]])
    this.setData({
      dateTimeArray2: dateArr,
      dateTime2: arr
    })
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
    let startTime='2010-08-26 00:00:00';
    const res = await reqDevData(mobile, this.data.devid, this.data.startNo,startTime, endTime)
    if (res.data.code === 10000 && res.data.resultCode != 'null') {
      let list = this.data.deviceDataList
      list = list.concat(res.data.resultCode)
      this.setData({ deviceDataList: list })
    } else if (res.data.code === 10000 && res.data.resultCode == 'null') {
      this.setData({ isLoad: true  })
    }
  },
  bindrefresherrefresh(){
    const devid = this.data.devid
    const mobile = wx.getStorageSync('mobile')
    const endTime = formatTime(new Date(), '-');
    this.setData({ startNo: 0,deviceDataList:[],isTriggered:false ,message:'更新中' })
    setTimeout(()=>{
      this.reqDevData(mobile, devid)
      },1500)

   
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
  async querytime(){
    this.setData({ deviceDataList: []})
     let startTime = formatDate(this.data.dateTimeArray1, this.data.dateTime1)
     let endTime = formatDate(this.data.dateTimeArray2, this.data.dateTime2)
     console.log(startTime,endTime)
     var mobile = wx.getStorageSync('mobile')
      const res = await reqDevData(mobile, this.data.devid, this.data.startNo,startTime, endTime)
      console.log(res)
      this.setData({ modalChoose: null })
    if (res.data.code === 10000 && res.data.resultCode != 'null') {
      let list = this.data.deviceDataList
      list = list.concat(res.data.resultCode)
      this.setData({ deviceDataList: list })
    } else if (res.data.code === 10000 && res.data.resultCode == 'null') {
      this.setData({ isLoad: false, deviceDataList: [], message: res.data.resultCode === 'null' ? '暂无数据' : '加载中'  })
 
    }else{
      this.setData({ deviceDataList: [] })
    }
  },
  async bindSaveParams() {
    if (this.data.paramsData.flow_type === '1' && this.data.paramsData.fasong_jiange_minute < 5) {
      wx.showToast({
        title: '上传间隔不能小于5分钟',
        icon: 'none'
      })
      return
    }
    if(this.data.paramsData.baojingwendu_shangxian_baojing == 1 && this.data.paramsData.baojingwendu_xiaxian_baojing == 1 && parseInt(this.data.paramsData.baojingwendu_shangxian) < parseInt(this.data.paramsData.baojingwendu_xiaxian)) {
      wx.showToast({
        title: '温度1下限不能高于上限',
        icon: 'none'
      })
      return
    }
    if(this.data.deviceParams.model_type === 'TH') {
      if(this.data.paramsData.chaogaoshidubaojing == 1 && this.data.paramsData.chaodishidubaojing == 1 && parseInt(this.data.paramsData.chaogaoshidubaojingfazhi) < parseInt(this.data.paramsData.chaodishidubaojingfazhi)) {
        wx.showToast({
          title: '湿度下限不能高于上限',
          icon: 'none'
        })
        return false;
      }

    } else if(this.data.deviceParams.model_type === 'TT') {
      if(this.data.paramsData.baojingwendu_shangxian_baojing == 1 && this.data.paramsData.baojingwendu_xiaxian_baojing == 1 && parseInt(this.data.paramsData.baojingwendu_two_shangxian) < parseInt(this.data.paramsData.baojingwendu_two_xiaxian)) {
        wx.showToast({
          title: '温度2下限不能高于上限',
          icon: 'none'
        })
        return false;
      }
    }
    const openid = wx.getStorageSync('openid')
    this.setData({
      'paramsData.openid': openid,
      'paramsData.devid': this.data.devid
    })
    let obj={}
    obj.openid=openid
    obj.devid=this.data.devid
    obj.yejianshangchuankaiguan=this.data.paramsData.yejianshangchuankaiguan
    obj.caiji_jiange_minute=this.data.paramsData.caiji_jiange_minute
    obj.fasong_jiange_minute=this.data.paramsData.fasong_jiange_minute
    obj.UserP=this.data.paramsData.UserP
    obj.GPS_Start=this.data.paramsData.GPS_Start
    if(this.data.deviceParams.model_type === 'TH'){
      obj.chaogaoshidubaojing=this.data.paramsData.chaogaoshidubaojing
      obj.chaogaoshidubaojingfazhi=this.data.paramsData.chaogaoshidubaojingfazhi
      obj.chaodishidubaojing=this.data.paramsData.chaodishidubaojing
      obj.chaodishidubaojingfazhi=this.data.paramsData.chaodishidubaojingfazhi
    }else{
      obj.baojingwendu_two_shangxian=this.data.paramsData.baojingwendu_two_shangxian
      obj.baojingwendu_two_shangxian_baojing=this.data.paramsData.baojingwendu_two_shangxian_baojing
      obj.baojingwendu_two_xiaxian=this.data.paramsData.baojingwendu_two_xiaxian
      obj.baojingwendu_two_xiaxian_baojing=this.data.paramsData.baojingwendu_two_xiaxian_baojing
    }
    obj.baojingwendu_shangxian_baojing=this.data.paramsData.baojingwendu_shangxian_baojing
		obj.baojingwendu_shangxian=this.data.paramsData.baojingwendu_shangxian
    obj.baojingwendu_xiaxian=this.data.paramsData.baojingwendu_xiaxian
    obj.baojingwendu_xiaxian_baojing=this.data.paramsData.baojingwendu_xiaxian_baojing
    obj.dianliang_xiaxian=this.data.paramsData.dianliang_xiaxian
    obj.dianliang_xiaxian_baojing=this.data.paramsData.dianliang_xiaxian_baojing
    obj.duanxingtuisong_baojing=this.data.paramsData.dianliang_xiaxian_baojing
    obj.weixintuisong_baojing=this.data.paramsData.weixintuisong_baojing
    obj.sort=this.data.paramsData.sort
    obj.is_open=this.data.paramsData.is_open
    obj.warn_time= ""
    let utype = wx.getStorageSync('utype')
    if(utype=='b'){
      obj.userType='tb'
    }
    const res = await reqSetParams(obj)
    if(res.data.code === 0) {
      wx.showToast({
        title: '设置成功!',
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
    let startTime='2010-08-26 00:00:00';
    const res = await reqDevData(mobile, devid, this.data.startNo,startTime, endTime)
    console.log(res)
    if (res.data.code === 10000) {
      this.setData({
        deviceDataList: res.data.resultCode === 'null' ? [] : res.data.resultCode,
        message: res.data.resultCode === 'null' ? '暂无数据' : '加载中'
      })
      if(res.data.resultCode[0]&&res.data.resultCode[0]!='n') {
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
      this.initForm(this.data.model_type)
    }
  },
  async reqWarningList(mobile,devid, startwarnNo) {
    const res = await reqWarningList(mobile, devid,this.data.startwarnNo)
    console.log(res)
    if (res.data.code === 10000&&res.data.message=='nodata') {
      this.setData({ warnMessList: [] })     
    }else if(res.data.code === 10000&&res.data.message=='success'){
      let list = this.data.warnMessList
      list = list.concat(res.data.resultCode)
      this.setData({ warnMessList: list })
    }else{
      
    }
  },
  initForm(type) {
    const paramsList = this.data.paramsList
    
    if(type === 'TH') {
      paramsList.splice(2, 0, ...this.data.paramsListTHItem)
    } else if(type === 'TT') {
      paramsList.splice(2, 0, ...this.data.paramsListTTItem)
    }else if(type === 'TPA') {
      paramsList.splice(0, 2, ...this.data.paramsListTPAItem)
      console.log(paramsList)
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
    let that=this 
    // 用户点击了确定 可以调用删除方法了
    wx.openBluetoothAdapter({
      success: res => {
        wx.navigateTo({
          url: '../../printer/printer?devid=' + that.data.devid+'&curtype='+1
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
  },

  //打开时间选择
  chooseShowModal() {
    this.setData({ modalChoose: 'bind' })
  },
  //关闭时间选择
  hideModal() {
    this.setData({ modalChoose: null })
  }
  
})
function formatDate(dateTimeArray, dateTime) {
  return dateTimeArray[0][dateTime[0]] + '/' + dateTimeArray[1][dateTime[1]] + '/' + dateTimeArray[2][dateTime[2]] + ' ' + dateTimeArray[3][dateTime[3]] + ':' + dateTimeArray[4][dateTime[4]] + ':00'
 
}