import * as echarts from '../../../utils/echarts.min.js';
import { formatTime } from '../../../utils/util.js';

Page({
  data: {
    ec: { lazyLoad: true },
    swiperItemHeight: 0,
    currentItem: 0,
    active: ['active', ''],
    tabList: [
      {
        text: '曲线',
        active: true
      },
      {
        text: '数据'
      }
    ],
    isRequested: false,
    deviceDataList: {},
    startNo: 0,
    devid: '',
    multiSelectorList: [],
    deviceDataListLength: 1
  },
  onLoad(options) {
    wx.showLoading({
      title: '拼命加载中...',
    })
    this.ecComponent = this.selectComponent('#mychart-dom-bar');
    console.log(options)
    let { delay, endTime, needNum, heigh, low } = options;
    this.setData({
      delay,
      endTime,
      needNum,
      heigh,
      low,
      historyList: JSON.parse(wx.getStorageSync('historyList'))
    })
    this.initChart();
  },
  onReachBottom() {
    if(this.data.currentItem !== 1) { return }
    let [yArr, xArr, i, timeArr] = [[], [], 0, []];
    this.data.historyList.forEach((item, index) => {
      item.forEach((sItem, sIndex) => {
        if (sIndex === 0 || sIndex === item.length - 2 || sIndex === item.length - 1 || i >= this.data.needNum) {
          return;
        }
        let time = formatTime(new Date(parseInt(this.data.endTime) - this.data.delay * 1000 * 60 * (i + 1))).slice(0, -3).slice(11);
        let time1 = formatTime(new Date(parseInt(this.data.endTime) - this.data.delay * 1000 * 60 * (i + 1))).slice(0, -3);
        timeArr.unshift(time1);
        xArr.unshift(time);
        yArr.push(sItem / 10);
        i++;
      })
    })
    const bluetoothDeviceName = wx.getStorageSync('bluetoothDeviceName')
    let deviceDataList = xArr.map((item, index) => {
      return { shebeibianhao: bluetoothDeviceName, time: timeArr[index], temperature01: yArr[index] + '°C'}
    })
    this.setData({
      ['deviceDataList[' + this.data.deviceDataListLength + ']']: deviceDataList.slice(100 * (this.data.deviceDataListLength - 1), 100 * this.data.deviceDataListLength),
      deviceDataListLength: ++this.data.deviceDataListLength
    })

    this.setSwiperHeight('.tab-swiper2');
  },
  initChart() {
    const that = this;
    let [yArr, xArr, i, timeArr, upY] = [[], [], 0, [], []];
    this.data.historyList.forEach((item, index) => {
      item.forEach((sItem, sIndex) => {
        if (sIndex === 0 || sIndex === item.length - 2 || sIndex === item.length - 1 || i >= this.data.needNum) {
          return;
        }
        let time = formatTime(new Date(parseInt(this.data.endTime) - this.data.delay * 1000 * 60 * (i + 1))).slice(0, -3).slice(11);
        let time1 = formatTime(new Date(parseInt(this.data.endTime) - this.data.delay * 1000 * 60 * (i + 1))).slice(0, -3);
        timeArr.unshift(time1);
        xArr.unshift(time);
        yArr.push(sItem / 10);
        upY.push(sItem)
        i++;
      })
    })
    const bluetoothDeviceName = wx.getStorageSync('bluetoothDeviceName')
    let deviceDataList = xArr.map((item, index) => {
      return { shebeibianhao: bluetoothDeviceName, time: timeArr[index], temperature01: yArr[index] + '°C'}
    })

        that.setData({
          ['deviceDataList[' + this.data.deviceDataListLength + ']']: deviceDataList.slice(0, 100),
          deviceDataListLength: ++this.data.deviceDataListLength
        })

    let uploadData = xArr.map((item, index) => {
      return { shebeibianhao: bluetoothDeviceName, time: timeArr[index], temperature01: upY[index]}
    })
    wx.setStorageSync('uploadData', uploadData)
    this.setSwiperHeight('.tab-swiper1');
    this.initCharts(xArr, yArr, this.data.low, this.data.heigh);
    // that.setData({ deviceDataList: deviceDataList })


  },
  initCharts(xAxis, seriesData, low, heigh) {
    const that = this;
    this.ecComponent.init((canvas, width, height) => {
      // 获取组件的 canvas、width、height 后的回调函数
      // 在这里初始化图表
      const chart = echarts.init(canvas, null, {
        width: width,
        height: height
      });

      that.setOption(chart, xAxis, seriesData, low, heigh);
      // 将图表实例绑定到 this 上，可以在其他成员函数（如 dispose）中访问
      this.chart = chart;
      // 注意这里一定要返回 chart 实例，否则会影响事件处理等
      return chart;
    });
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
        lineStyle: {
          color: 'rgba(85, 190, 202, 1)',
          shadowColor: 'rgba(85, 190, 202, 1)',
          shadowOffsetY: 10
        },
        itemStyle: {
          borderColor: 'rgba(85, 190, 202, 1)'
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
  bindtabChange(e) {
    let active = ['', ''];
    active[e.currentTarget.dataset.id] = 'active'
    this.setData({
      currentItem: e.currentTarget.dataset.id,
      active: active
    })
    const mobile = wx.getStorageSync('mobile');
    const devid = this.data.devid;
  },
  swiperChange(e) {
    let active = ['', ''];
    active[e.detail.current] = 'active'
    this.setData({
      active: active,
      currentItem: e.detail.current
    })
    if (e.detail.current === 0) {
      // 获取图表
      // this.initChart();
      this.setSwiperHeight('.tab-swiper1');
    } else if (e.detail.current === 1) {
      // 数据
      this.setSwiperHeight('.tab-swiper2');
    }
  },
  setSwiperHeight(selector) {
    const query = wx.createSelectorQuery()
    query.select(selector).boundingClientRect((rect) => {
      this.setData({
        swiperItemHeight: rect.height + 50 + 'px'
      })
    }).exec()
  }
})