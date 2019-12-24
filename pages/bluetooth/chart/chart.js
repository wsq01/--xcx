import * as echarts from '../../../utils/echarts.min.js';
import { formatTime } from '../../../utils/util.js';

Page({
  data: {
    ec: {
      lazyLoad: true
    }
  },
  onLoad: function (options) {
    wx.showLoading({
      title: '拼命加载中...',
    })
    this.ecComponent = this.selectComponent('#mychart-dom-bar');
    console.log(options)
    let { delay, starttime, neednum } = options;
    let historyList = wx.getStorageSync('historyList');
    // const xArr = this.initX(parseInt(starttime), parseInt(neednum), parseInt(delay));
    // console.log(xArr)
    historyList = JSON.parse(historyList);
    console.log(historyList);
    this.initChart(historyList, delay, starttime);
  },
  // initX(startTime, needNum, delay) {
  //   var result = [];
  //   for(let i = 0; i < needNum; i++) {
  //     result.push(formatTime(new Date(startTime + delay * 1000 * 60 * (i + 1))));
  //   }
  //   return result;
  // },
  initChart(historyList, delay, startTime) {
      let yArr = [];
      let xArr = [];
      var i = 0;
      historyList.forEach((item, index) => {
        item.forEach((sItem, sIndex) => {
          if(sIndex === 0 || sIndex === 1 || sIndex === item.length-1) {
            return;
          }
          console.log(startTime + delay * 1000 * 60 * (i + 1))
          xArr.push(formatTime(new Date(parseInt(startTime) + delay * 1000 * 60 * (i + 1))));
          yArr.push(sItem / 10);
          i++;
        })
      })
      console.log(xArr);
      console.log(yArr);
      this.initCharts(xArr, yArr);
      wx.hideLoading();
  },
  initCharts(xAxis, seriesData) {
    const that = this;
    this.ecComponent.init((canvas, width, height) => {
      // 获取组件的 canvas、width、height 后的回调函数
      // 在这里初始化图表
      const chart = echarts.init(canvas, null, {
        width: width,
        height: height
      });
      
      that.setOption(chart, xAxis, seriesData);

      // 将图表实例绑定到 this 上，可以在其他成员函数（如 dispose）中访问
      this.chart = chart;

      // 注意这里一定要返回 chart 实例，否则会影响事件处理等
      return chart;
    });
  }, 
  setOption(chart, xAxis, seriesData) {
    var option = {
      title: {
        text: ''
      },
      tooltip: {
        trigger: 'axis'
      },
      xAxis: {
        data: xAxis
      },
      yAxis: {
        splitLine: {
          show: false
        }
      },
      dataZoom: [{
        startValue: xAxis[0]
      }, {
        type: 'inside'
      }],
      visualMap: {
        top: 10,
        right: 10,
        pieces: [{
          gt: 0,
          lte: 10,
          color: '#096'
        }, {
          gt: 30,
          color: '#7e0023'
        }],
        outOfRange: {
          color: '#999'
        }
      },
      series: {
        name: '温度',
        type: 'line',
        data: seriesData,
        markLine: {
          silent: true,
          data: [{
            yAxis: 10
          }, {
            yAxis: 30
          }]
        }
      }
    }
    chart.setOption(option);
  }
})