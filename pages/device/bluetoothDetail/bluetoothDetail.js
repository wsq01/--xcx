import { reqDevCharts, reqUserDataInfoList } from '../../../service/service'
import { formatTime } from '../../../utils/util'
import * as echarts from '../../../utils/echarts.min.js'
import * as datetimepickerUtil from '../../../utils/datetimepicker.js'

Page({
  data: {
    TabCur: 0,
    tabList: ['图表', '数据'],
    deviceDataList: [],
    isShowLoadMore: false,
    isLoad: false,
    ec: { lazyLoad: true },
    dateTime1: '',
    dateTime2: '',
    dateTimeArray1: [],
    dateTimeArray2: [],
    modalName: null,
    mobile: '',
    form: {
      page: 1,
      interval: 1
    },
    startTime: '',
    endTime: '',
    isHideCanvas: false,
    dataType: 0
  },
  onLoad(options) {
    const { devid, startTime, endTime } = options
    let _startTime=startTime.replace(/-/g,'/')
    let _endTime=endTime.replace(/-/g,'/')
    //console.log(_startTime,_endTime)
    this.setData({
      startTime,
      endTime,
      mobile: wx.getStorageSync('mobile'),
      'form.shebeibianhao': devid,
      'form.startTime': _startTime,
      'form.endTime': _endTime
    })
    this.reqUserDataInfoList()
    this.ecComponent = this.selectComponent('#mychart-dom-bar')
    this.initChart()
  },
  bindInput(e) {
    this.setData({ 'form.interval': e.detail.value})
  },
  async reqUserDataInfoList() {
    const res = await reqUserDataInfoList(this.data.form)
    if(res.data.code === 0) {
      if(res.data.data.data.length === 0) {
        this.setData({ isLoad: true })
        return
      }
      this.setData({
        dataType: res.data.data.equipment_type,
        deviceDataList: this.data.deviceDataList.concat(...res.data.data.data)
      })
    }
  },
  bindSubmit() {
    if(this.data.form.interval > 30 || this.data.form.interval < 1) {
      wx.showToast({
        title: '间隔在1~30分钟之间',
        icon: 'none'
      })
      return
    }
    const startTime = formatDate(this.data.dateTimeArray1, this.data.dateTime1)
    const endTime = formatDate(this.data.dateTimeArray2, this.data.dateTime2)
    const start = new Date(startTime).getTime()
    const end = new Date(endTime).getTime()
    // console.log("startTime",startTime)
    // console.log("endTime",endTime)
    // console.log("start",start)
    // console.log("end",end)
    if(start > end) {
      wx.showToast({
        title: '开始时间不得小于结束时间',
        icon: 'none'
      })
      return
    }
    if(start < new Date(this.data.startTime).getTime() || end > new Date(this.data.endTime).getTime()) {
      wx.showToast({
        title: '时间超出范围',
        icon: 'none'
      })
      return
    }
    this.setData({
      'form.startTime': startTime,
      'form.endTime': endTime
    })
    this.reset()
    this.reqUserDataInfoList()
    this.initChart()
    this.hideModal()
  },
  reset() {
    this.setData({
      'form.page': 1,
      isShowLoadMore: false,
      isLoad: false,
      deviceDataList: []
    })
  },
  async bindscrolltolower() {
    this.setData({ isShowLoadMore: true, 'form.page': ++this.data.form.page })
    if(this.data.form.page >= 150) {
      this.setData({ isLoad: true, isShowLoadMore: false })
      wx.showModal({
        content: '查看更多数据，请前往后台系统',
        showCancel: false
      })
      return
    }
    this.reqUserDataInfoList()
  },
  bindScreen() {
    this.setData({ modalName: 'screen', isHideCanvas: true })
    this.initDateTimePicker()
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
  bindExeport() {
    let _url='http://www.ccsc58.com/tcpdf/pdf/pdf_out.php?s='+this.data.form.shebeibianhao+'&t1='+this.data.startTime+'&t2='+this.data.endTime
    wx.setClipboardData({
      data: _url,
      success: res => {
        this.setData({
          modalName: 'download'
        })
      }
    })
    // var that = this;
    // wx.downloadFile({
    //   url: _url,
    //   success: function (res) {
    //     var filePath = res.tempFilePath
    //     wx.openDocument({
    //       filePath: filePath,
    //       fileType: that.data.type,
    //       success: function (res) {
    //         console.log("打开文档成功")
    //         console.log(res);
    //       },
    //       fail: function (res) {
    //         console.log("fail");
    //         console.log(res)
    //       },
    //       complete: function (res) {
    //         wx.hideLoading()
    //       }
    //     })
    //   }
    // })
  },
  async initChart() {
    const obj = { limit: 10000 }
    Object.assign(obj, this.data.form)
    const res = await reqUserDataInfoList(obj)
    if(res.data.code === 0) {
      const xArr = [], yArr1 = [], yArr2 = []
      res.data.data.data.forEach((item) => {
        xArr.push(item.time.substr(5, 5) + '\n' + item.time.substr(11, 5))
        yArr1.push(parseFloat(Number(item.temperature01)))
        if(res.data.data.equipment_type === 3) {
          yArr2.push(parseFloat(Number(item.temperature02)))
        } else if(res.data.data.equipment_type === 2) {
          yArr2.push(parseFloat(Number(item.humidity)))
        }
      })
      this.initCharts(xArr.reverse(), yArr1.reverse(), yArr2.reverse())
    }
  },
  initCharts(xData, yArr1, yArr2) {
    this.ecComponent.init((canvas, width, height) => {
      const chart = echarts.init(canvas, null, {
        width,
        height
      })
      this.setOption(chart, xData, yArr1, yArr2)
     
      this.chart = chart
      return chart
    })
  },
  setOption(chart, xAxis, yArr1, yArr2) {
    const title = { text: this.data.dataType === 1 ? '温度曲线' : this.data.dataType === 3 ? '双温曲线' : '温湿曲线' }
    const tooltip = {
      trigger: 'axis',
      formatter: this.data.dataType === 1 ? "温度: {c}°C \n时间:{b}" : this.data.dataType === 3 ? "温度1: {c0}°C 温度2：{c1}°C \n时间:{b}" : "温度: {c0}°C 湿度：{c1}%RH \n时间:{b}"
    }
    const yAxis = {
      axisLabel: {
        formatter: this.data.dataType === 3 ? '{value}°C' : '{value}'
      }
    }
    const legend = {
      data: []
    }
    if (this.data.dataType === '1') {
      legend.data.push('温度1')
      legend.data.push('温度2')
    } else if (this.data.dataType === '2') {
      legend.data.push('温度')
      legend.data.push('湿度')
    } else {
      legend.data.push('温度')
    }
    var option = {
      title,
      tooltip,
      legend,
      grid: {
        bottom: 80,
        left: 40
      },
      xAxis: {
        data: xAxis
      },
      yAxis,
      // dataZoom: [{
      //   startValue: xAxis[0]
      // }, {
      //   type: 'inside',
      //   moveOnMouseMove: false,
      //   preventDefaultMouseMove: false
      // }],
      series: [{
        name: this.data.dataType === 1 ? '温度' : '温度1',
        type: 'line',
        smooth: true,
        lineStyle: {
          color: '#e46161',
          shadowColor: '#e46161',
          shadowOffsetY: 10
        },
        itemStyle: {
          borderColor: '#e46161'
        },
        data: yArr1,
        markLine: {
          silent: true
        }
      }, {
        name: this.data.dataType === 3 ? '温度2' : '湿度',
        type: 'line',
        smooth: true,
        lineStyle: {
          color: '#42A6FF',
          shadowColor: '#42A6FF',
          shadowOffsetY: 10
        },
        itemStyle: {
          borderColor: '#42A6FF'
        },
        data: yArr2,
        markLine: {
          silent: true
        }
      }]
    }
    chart.setOption(option)
  },
  initDateTimePicker() {
    const startTime = datetimepickerUtil.getMyDateArry(this.data.form.startTime)
    const endTime = datetimepickerUtil.getMyDateArry(this.data.form.endTime)
    const obj = datetimepickerUtil.dateTimePicker(null, null, startTime, endTime)
    // console.log("startTime",startTime)
    // console.log("endTime",endTime)
    // console.log("obj",obj)
    this.setData({
      dateTime1: obj.dateTime1,
      dateTimeArray1: obj.dateTimeArray1,
      dateTime2: obj.dateTime2,
      dateTimeArray2: obj.dateTimeArray2
    })
  },
  changeDateTime1(e) {
    this.setData({
      dateTime1: e.detail.value
    })
  },
  changeDateTimeColumn1(e) {
    var arr = this.data.dateTime1, dateArr = this.data.dateTimeArray1
    arr[e.detail.column] = e.detail.value
    dateArr[2] = datetimepickerUtil.getMonthDay(dateArr[0][arr[0]], dateArr[1][arr[1]])
    this.setData({
      dateTimeArray1: dateArr,
      dateTime1: arr
    });
  },
  changeDateTime2(e) {
    this.setData({
      dateTime2: e.detail.value
    })
  },
  changeDateTimeColumn2(e) {
    var arr = this.data.dateTime2, dateArr = this.data.dateTimeArray2
    arr[e.detail.column] = e.detail.value
    dateArr[2] = datetimepickerUtil.getMonthDay(dateArr[0][arr[0]], dateArr[1][arr[1]])
    this.setData({
      dateTimeArray2: dateArr,
      dateTime2: arr
    })
  },
  hideModal() {
    this.setData({ modalName: null, isHideCanvas: false })
  },
  stopTouchMove() {
    return false
  }
})

function formatDate(dateTimeArray, dateTime) {
  return dateTimeArray[0][dateTime[0]] + '/' + dateTimeArray[1][dateTime[1]] + '/' + dateTimeArray[2][dateTime[2]] + ' ' + dateTimeArray[3][dateTime[3]] + ':' + dateTimeArray[4][dateTime[4]] + ':00'
 
}