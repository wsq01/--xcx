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
  initChart() {
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
        yArr.push(sItem / 10)
        upY.push(sItem)
        i++
      })
    })
    const deviceDataList = []
    for(let i = 0; i < xArr.length; i++) {
      if(i > 1000) break
      deviceDataList.unshift({ time: timeArr[i], temperature01: yArr[i] + '°C'})
    }

    let uploadData = xArr.map((item, index) => {
      return { shebeibianhao: this.data.deviceName, time: timeArr[index], temperature01: upY[index] }
    })
    this.initCharts(xArr, yArr, this.data.options.low, this.data.options.heigh)
    this.setData({ deviceDataList, uploadData })
  },
  initCharts(xAxis, seriesData, low, heigh) {
    this.ecComponent.init((canvas, width, height) => {
      const chart = echarts.init(canvas, null, {
        width,
        height
      })

      this.setOption(chart, xAxis, seriesData, low, heigh)
      this.chart = chart
      return chart
    })
  },
  setOption(chart, xAxis, seriesData, low, heigh) {
    var option = {
      title: {
        text: '温度曲线'
      },
      tooltip: {
        trigger: 'axis',
        formatter: "温度: {c}°C \n时间:{b}"
      },
      grid: {
        bottom: 60,
        left: 40
      },
      xAxis: {
        data: xAxis
      },
      yAxis: {
        axisLabel: {
          formatter: '{value}°C'
        }
      },
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
      series: {
        name: '温度',
        type: 'line',
        smooth: true,
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [{
              offset: 0,
              color: '#1B4CEF' // 0% 处的颜色
            }, {
              offset: 1,
              color: '#fff' // 100% 处的颜色
            }],
            global: false // 缺省为 false
          }
        },
        lineStyle: {
          color: '#1B4CEF',
          shadowColor: '#1B4CEF',
          shadowOffsetY: 10
        },
        itemStyle: {
          borderColor: '#1B4CEF'
        },
        data: seriesData,
        markLine: {
          silent: true,
          data: [{
            yAxis: low
          }, {
            yAxis: heigh
          }]
        }
      }
    }
    chart.setOption(option);
    wx.hideLoading();
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
    let res = await reqUpload(this.data.deviceName, this.data.uploadData, startTime, endTime)
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