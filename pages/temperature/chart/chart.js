import * as echarts from '../../../utils/echarts.min.js'
import { formatTime } from '../../../utils/util.js'
import { reqUpload } from '../../../service/service'

Page({
  data: {
    TabCur: 0,
    ec: { lazyLoad: true },
    tabList: ['曲线', '数据'],
    deviceDataList: {},
    isShowLoadMore: false,
    isLoad: true,
    deviceName: '',
    uploadData: [],
    options: {}
  },
  onLoad(options) {
    this.ecComponent = this.selectComponent('#mychart-dom-bar')
    wx.showLoading({ title: '拼命加载中...' })
    this.setData({
      options,
      deviceName: wx.getStorageSync('bluetoothDeviceName'),
      historyList: JSON.parse(wx.getStorageSync('historyList'))
    })
    this.initChart()
  },
  bindscrolltolower() {
    if(this.data.deviceDataList.length >= 3000) {
      wx.showModal({
        content: '查看更多数据请缩小时间范围',
        showCancel: false
      })
    }
  },
  initTHChart() {
    let [yArr1, xArr, i, timeArr, upY1, yArr2, upY2] = [[], [], 0, [], [], [], []]
    this.data.historyList.forEach(item => {
      for(let j = 0; j < item.length; j++) {
        if(j === 0 || j === 1 || j === 2 || j === item.length - 3 || j === item.length - 2 || j === item.length - 1 || i >= this.data.options.needNum) {
          continue
        }
        let time = formatTime(new Date(parseInt(this.data.options.endTime) - 1000 * 60 * (i + 1))).slice(0, -3).slice(11)
        let time1 = formatTime(new Date(parseInt(this.data.options.endTime) - 1000 * 60 * (i + 1))).slice(0, -3)
        timeArr.unshift(time1)
        xArr.unshift(time)
        yArr1.push((item[j] / 10).toFixed(1))
        yArr2.push((item[j + 1] / 10).toFixed(1))
        upY1.push(item[j])
        upY2.push(item[j + 1])
        i++
        j++
      }
    })
    const deviceDataList = []
    for(let i = 0; i < xArr.length; i++) {
      deviceDataList.unshift({ time: timeArr[i], temperature01: yArr1[i] + '°C', humidity: yArr2[i] + '%RH'})
    }
    if (this.data.options.needNum > 1000) {
      deviceDataList.length = 1000
    }
    let uploadData = xArr.map((item, index) => {
      return { shebeibianhao: this.data.deviceName, time: timeArr[index], temperature01: upY1[index], humidity: upY2[index] }
    })
    this.initCharts(xArr, yArr1, yArr2, this.data.options.low, this.data.options.heigh)
    this.setData({ uploadData, deviceDataList })
  },
  initTTChart() {
    let [yArr1, xArr, i, timeArr, upY1, yArr2, upY2] = [[], [], 0, [], [], [], []]
    this.data.historyList.forEach(item => {
      for(let j = 0; j < item.length; j++) {
        if(j === 0 || j === 1 || j === 2 || j === item.length - 3 || j === item.length - 2 || j === item.length - 1 || i >= this.data.options.needNum) {
          continue
        }
        let time = formatTime(new Date(parseInt(this.data.options.endTime) - 1000 * 60 * (i + 1))).slice(0, -3).slice(11)
        let time1 = formatTime(new Date(parseInt(this.data.options.endTime) - 1000 * 60 * (i + 1))).slice(0, -3)
        timeArr.unshift(time1)
        xArr.unshift(time)
        yArr1.push((item[j] / 10).toFixed())
        yArr2.push((item[j + 1] / 10).toFixed())
        upY1.push(item[j])
        upY2.push(item[j + 1])
        i++
        j++
      }
    })
    const deviceDataList = []
    for(let i = 0; i < xArr.length; i++) {
      deviceDataList.unshift({ time: timeArr[i], temperature01: yArr1[i] + '°C', temperature02: yArr2[i] + '°C'})
    }
    if (this.data.options.needNum > 1000) {
      deviceDataList.length = 1000
    }
    let uploadData = xArr.map((item, index) => {
      return { shebeibianhao: this.data.deviceName, time: timeArr[index], temperature01: upY1[index], temperature02: upY2[index] }
    })
    this.initCharts(xArr, yArr1, yArr2, this.data.options.low, this.data.options.heigh)
    this.setData({ uploadData, deviceDataList })
  },
  initTChart() {
    let [yArr, xArr, i, timeArr, upY] = [[], [], 0, [], []]
    this.data.historyList.forEach((item, index) => {
      item.forEach((sItem, sIndex) => {
        if (sIndex === 0 || sIndex === 1 || sIndex === 2 || sIndex === item.length - 3 || sIndex === item.length - 2 || sIndex === item.length - 1 || i >= this.data.options.needNum) {
          return
        }
        let time = formatTime(new Date(parseInt(this.data.options.endTime) - 1000 * 60 * (i + 1))).slice(0, -3).slice(11)
        let time1 = formatTime(new Date(parseInt(this.data.options.endTime) - 1000 * 60 * (i + 1))).slice(0, -3)
        timeArr.unshift(time1)
        xArr.unshift(time)
        yArr.push((sItem / 10).toFixed())
        upY.push(sItem)
        i++
      })
    })
    const deviceDataList = []
    for(let i = 0; i < xArr.length; i++) {
      deviceDataList.unshift({ time: timeArr[i], temperature01: yArr[i] + '°C'})
    }
    if (this.data.options.needNum > 1000) {
      deviceDataList.length = 1000
    }
    let uploadData = xArr.map((item, index) => {
      return { shebeibianhao: this.data.deviceName, time: timeArr[index], temperature01: upY[index] }
    })
    this.initCharts(xArr, yArr, [], this.data.options.low, this.data.options.heigh)
    this.setData({ uploadData, deviceDataList })
  },
  initChart() {
    if(this.data.options.type === '0') {
      this.initTChart()
    } else if(this.data.options.type === '1') {
      this.initTTChart()
    }else if(this.data.options.type === '2') {
      this.initTHChart()
    }
  },
  initCharts(xAxis, y1, y2, low, heigh) {
    this.ecComponent.init((canvas, width, height) => {
      const chart = echarts.init(canvas, null, {
        width,
        height
      })

      this.setOption(chart, xAxis, y1, y2, low, heigh)
      this.chart = chart
      return chart
    })
  },
  setOption(chart, xAxis, y1, y2, low, heigh) {
    const title = { text: this.data.options.type === '0' ? '温度曲线' : this.data.options.type === '1' ? '双温曲线' : '温湿曲线' }
    const tooltip = {
      trigger: 'axis',
      formatter: this.data.options.type === '0' ? "温度: {c}°C \n时间:{b}" : this.data.options.type === '1' ? "温度1: {c0}°C 温度2：{c1}°C \n时间:{b}" : "温度: {c0}°C 湿度：{c1}%RH \n时间:{b}"
    }
    const yAxis = {
      axisLabel: {
        formatter: this.data.options.type === '1' ? '{value}°C' : '{value}'
      }
    }
    const legend = {
      data: []
    }
    if (this.data.options.type === '1') {
      legend.data.push('温度1')
      legend.data.push('温度2')
    } else if (this.data.options.type === '2') {
      legend.data.push('温度')
      legend.data.push('湿度')
    } else {
      legend.data.push('温度')
    }
    var option = {
      title,
      tooltip,
      legend: {
        data: []
      },
      grid: {
        bottom: 60,
        left: 40
      },
      xAxis: {
        data: xAxis
      },
      yAxis,
      dataZoom: [{
        startValue: xAxis[0]
      }, {
        type: 'inside'
      }],
      visualMap: {
        top: 20,
        right: 20,
        pieces: [{
          lte: parseFloat(heigh),
          gt: parseFloat(low),
          color: '#7e0023'
        }],
        outOfRange: {
          color: '#999'
        }
      },
      series: [{
        name: this.data.options.type === '1' ? '温度1' : '温度',
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
        data: y1,
        markLine: {
          silent: true,
          data: [{
            yAxis: low
          }, {
            yAxis: heigh
          }]
        }
      }, {
        name: this.data.options.type === '0' ? '温度' : this.data.options.type === '1' ? '温度2' : '湿度',
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
        data: y2,
        markLine: {
          silent: true,
          data: [{
            yAxis: low
          }, {
            yAxis: heigh
          }]
        }
      }]
    }
    chart.setOption(option)
    wx.hideLoading()
  },
  tabSelect(e) {
    this.setData({
      TabCur: e.currentTarget.dataset.id
    })
  },
  swiperChange(e) {
    this.setData({ TabCur: e.detail.current })
  },
  getLocation() {
    return new Promise((resolve, reject) => {
      wx.getLocation({
        type: 'wgs84',
        success: res => {
          const latitude = res.latitude
          const longitude = res.longitude
          // const result = wx.getStorageSync('uploadData') || []
          const result = this.data.uploadData
          result.forEach(item => {
            item.jingdu = longitude
            item.weidu = latitude
          })
          this.setData({ uploadData: result })
          resolve(true)
        },
        fail(error) {
          console.log(error)
          wx.hideLoading()
          wx.openSetting({
            success(res) {
              if (res.authSetting["scope.userLocation"] == true) {
                resolve(false)
              } else {
                this.modal('uploadFail', '')
                resolve(false)
              }
            }
          })
        }
      })
    })
  },
  async upload() {
    wx.showLoading({ title: '上传中...' })
    let uploadData = await this.getLocation()
    if(uploadData === false) {
      this.modal('getLocationFail')
      return
    }
    const startTime = formatTime(new Date(parseInt(this.data.options.startTime)))
    const endTime = formatTime(new Date(parseInt(this.data.options.endTime)))
    const type = this.data.options.type === '0' ? 1 : this.data.options.type === '1' ? 3 : 2
    let res = await reqUpload(this.data.deviceName, this.data.uploadData, startTime, endTime, type)
    wx.hideLoading()
    if(res.data.code === 0) {
      this.modal('uploadSuccess')
    } else {
      this.modal('uploadFail', res.data.message)
    }
  },
  modal(type, msg) {
    switch(type) {
      case 'uploadSuccess':
        wx.showToast({ title: '上传成功！' })
        break
      case 'uploadFail':
        wx.showToast({
          icon: 'none',
          title: '上传失败！' + msg
        })
        break
      case 'getLocationFail':
        wx.showToast({
          title: '位置信息获取失败',
          icon: 'none'
        })
        break
    }
  },
  stopTouchMove() {
    return false
  }
})