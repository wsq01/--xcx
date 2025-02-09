import * as echarts from '../../../utils/echarts.min.js';
import {
  formatTime
} from '../../../utils/util.js';

Page({
  data: {
    ec: {
      lazyLoad: true
    },
    tableList: [[],[]],
    active: ['active', ''],
    swiperItemHeight: 0,
    isRequested: false,
    currentItem: 0,
    listsTitle: ['时间', '温度'],
  },
  onLoad: function (options) {
    wx.showLoading({ title: '拼命加载中...' })
    this.ecComponent = this.selectComponent('#mychart-dom-bar')
    let {
      delay,
      starttime,
      neednum,
      heightemp,
      lowtemp
    } = options
    this.setData({
      delay,
      starttime,
      neednum: parseInt(neednum),
      heightemp,
      lowtemp
    })
    let historyList = wx.getStorageSync('historyList')
    historyList = JSON.parse(historyList)
    this.initChart(historyList, delay, starttime, parseInt(heightemp), parseInt(lowtemp));
  },
  initTable(tempList) {

  },
  initChart(historyList, delay, startTime, heightemp, lowtemp) {
    let yArr = []
    let xArr = []
    let tableList = [[], []]
    var i = 0
    historyList.forEach((item, index) => {
      item.forEach((sItem, sIndex) => {
        if (sIndex === 0 || sIndex === item.length - 1 || sIndex === item.length -2 || i >= this.data.neednum) {
          return
        }
        let time = formatTime(new Date(parseInt(startTime) + delay * 1000 * 60 * (i + 1))).slice(0, -3).slice(5)
        xArr.push(time)
        yArr.push(sItem / 10)
        i++
        if(sItem > heightemp) {
          tableList[0].push({time: time, value: sItem / 10})
        }
        if(sItem < lowtemp) {
          tableList[1].push({ time: time, value: sItem / 10 })
        }
      })
    })
    this.setData({
      tableList: tableList,
      isRequested: true
    })
    this.setSwiperHeight('.tab-swiper1')
    this.initCharts(xArr, yArr, heightemp, lowtemp)
  },
  initCharts(xAxis, seriesData, heightemp, lowtemp) {
    this.ecComponent.init((canvas, width, height) => {
      const chart = echarts.init(canvas, null, {
        width: width,
        height: height
      });

      this.setOption(chart, xAxis, seriesData, heightemp, lowtemp)

      this.chart = chart

      return chart
    });
  },
  setOption(chart, xAxis, seriesData, heightemp, lowtemp) {
    var option = {
      title: {
        text: '温度曲线'
      },
      tooltip: {
        trigger: 'axis',
        formatter: "温度: {c}°C \n时间:{b}"
      },
      grid: {
        bottom: 100
      },
      xAxis: {
        data: xAxis,
        axisLabel: {
          rotate: -30
        }
      },
      yAxis: {
        axisLabel: {
          formatter: '{value}°C'
        },
        splitLine: {
          show: false
        }
      },
      dataZoom: [{
        show: true,
        realtime: true,
        startValue: xAxis[0],
      }],
      // dataZoom: [{
      //   startValue: xAxis[0]
      // }, {
      //   type: 'slider'
      // }],
      // visualMap: {
      //   top: 10,
      //   right: 10,
      //   pieces: [{
      //     gt: lowtemp,
      //     lte: heightemp,
      //     color: '#999'
      //   }],
      //   outOfRange: {
      //     color: '#cc0033'
      //   }
      // },
      series: {
        name: '温度',
        type: 'line',
        data: seriesData,
        markLine: {
          silent: true,
          data: [{
            yAxis: lowtemp
          }, {
            yAxis: heightemp
          }]
        }
      }
    }
    wx.hideLoading()
    chart.setOption(option)
  },
  setSwiperHeight(selector) {
    const query = wx.createSelectorQuery()
    query.select(selector).boundingClientRect((rect) => {
      this.setData({
        swiperItemHeight: rect.height + 50 + 'px'
      })
    }).exec()
  },
  swiperChange: function (e) {
    let active = ['', ''];
    active[e.detail.current] = 'active'
    this.setData({ active })
    let selector = '.tab-swiper' + (e.detail.current + 1)
    this.setSwiperHeight(selector)
  },
  tabChange(e) {
    let active = ['', '']
    active[e.currentTarget.dataset.id] = 'active'
    this.setData({
      currentItem: e.currentTarget.dataset.id,
      active: active
    })
  }
})