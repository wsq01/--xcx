import {
  reqBindDev,
  reqOpenid,
  reqUpload
} from '../../../service/service.js';
import * as echarts from '../../../utils/echarts.min.js';
import {
  string2buffer,
  ab2hex,
  formatTime,
  transformCode,
  generateCode2,
  generateCode3
} from '../../../utils/util.js';
import * as bluetoothUtil from '../../../utils/bluetooth1.js'

Page({
  data: {
    isFirstShow: true,
    servicesUUID: '',
    deviceId: '',
    characteristicId: '0000FFF1-0000-1000-8000-00805F9B34FB', // notify uuid
    time: 60,
    startDate: '',
    ec: {
      lazyLoad: true
    },
    active: [true, false, false],
    interval: 0,
    delay: 0,
    percent: 0,
    isShowPercent: false,
    isFinished: true,
    startTime: '',
    totalNum: 0,
    historyList: [],
    deviceParams: [],
    showPage: '',
    writeId: '0000FFF2-0000-1000-8000-00805F9B34FB', // write uuid
    bluetoothDeviceName: '',
    timer: null,
    timer1: null,
    timer2: null,
    isOverTime: false,
    connectOverTime: false, // 连接超时
    instructs: {
      getParams: 'FEF90a0d', // 请求设备参数
      getTotal: 'FEFE0a0d', // 获取数据总条数
    },
    isPercent100: false
  },
  onHide() {
    wx.closeBluetoothAdapter({
      success: function(res) {
        wx.openBluetoothAdapter({
          success: function(res) {
            wx.stopBluetoothDevicesDiscovery({
              success: function(res) {
                wx.hideLoading();
              },
            })
            wx.showModal({
              title: '提示框',
              content: '蓝牙已断开，是否重新连接？',
              success(res) {
                if (res.confirm) {
                  wx.showLoading({
                    title: '准备重连中...',
                  })
                  let timer4 = setTimeout(() => {
                    wx.hideLoading();
                    that.initBluetooth();
                  }, 10000)
                  that.setData({
                    timer4
                  })
                }
              }
            })
          }
        })
      }
    })
  },
  onLoad(options) {
    console.log(options);
    this.setData({
      mobile: wx.getStorageSync('mobile')
    })
    if (options.id) {
      this.setData({
        bluetoothDeviceName: options.id
      })
    }
    this.getOpenId();
    this.initBluetooth();
  },
  async getOpenId() {
    let res = await reqOpenid()
    const data = JSON.parse(res.data.data)
    wx.setStorageSync('openid', data.openid)
  },
  onUnload() {
    clearTimeout(this.data.timer)
    clearTimeout(this.data.timer1)
    clearTimeout(this.data.timer2)
    clearTimeout(this.data.timer4)
    clearTimeout(this.data.timer5)
    wx.closeBluetoothAdapter()
  },
  // 超时判定
  judgeIsOverTime() {
    const that = this;
    if (this.data.isOverTime && !this.data.timer) {
      const timer = setTimeout(() => {
        wx.closeBluetoothAdapter({
          success: function(res) {
            wx.openBluetoothAdapter({
              success: function(res) {
                wx.stopBluetoothDevicesDiscovery({
                  success: function(res) {
                    wx.hideLoading();
                  },
                })
                wx.showModal({
                  title: '提示框',
                  content: '蓝牙已断开，是否重新连接？',
                  success(res) {
                    if (res.confirm) {
                      wx.showLoading({
                        title: '准备重连中...',
                      })
                      let timer4 = setTimeout(() => {
                        wx.hideLoading();
                        that.initBluetooth();
                      }, 10000)
                      that.setData({
                        timer4
                      })
                    }
                  }
                })
              }
            })
          }
        })
      }, 120000)
      this.setData({
        timer
      })
    }
  },
  submitSetting() {
    if (!this.data.interval) {
      wx.showToast({
        title: '请设置间隔',
        icon: 'none'
      })
      return
    }
    if (this.data.interval < 1 || this.data.interval > 60) {
      wx.showToast({
        title: '间隔在1~60分钟',
        icon: 'none'
      })
      return
    }
    if (!this.data.delay) {
      wx.showToast({
        title: '请设置延时',
        icon: 'none'
      })
      return
    }
    if (this.data.delay < 1 || this.data.delay > 60) {
      wx.showToast({
        title: '延时在1~60分钟',
        icon: 'none'
      })
      return
    }
    const now = new Date()
    const dateArr = [parseInt(now.getFullYear().toString().slice(2)), (now.getMonth() + 1), now.getDate(), now.getHours(), now.getMinutes(), now.getSeconds()]
    const code = generateCode2(['FE', 'FB', ...dateArr, this.data.interval, this.data.delay], 2)
    this.sendMy(string2buffer(code))
  },
  async getBindDev() {
    const mobile = this.data.mobile
    let res = await reqBindDev(mobile, this.data.bluetoothDeviceName, 'lyxdhz')
    if (res.data.code === 0) {
      wx.showToast({
        title: '添加成功',
        icon: 'none'
      })
    } else {
      wx.showToast({
        title: res.data.message,
        icon: 'none'
      })
    }
  },
  // 初始化蓝牙
  initBluetooth() {
    wx.openBluetoothAdapter({
      success:async (res) => {
        // this.countDown()
        bluetoothUtil.getTheBlueDisConnectWithAccident(() => {
          this.setData({
            isFirstShow: false
          })
        });
        wx.showLoading({
          title: '正在搜索设备...'
        })
        let deviceId = await bluetoothUtil.findBluetooth(this.data.bluetoothDeviceName)
        if(!deviceId) {
          clearTimeout(this.data.timer2);
          // 连接超时
          if (this.data.connectOverTime) {
            wx.showModal({
              title: '提示',
              content: `连接设备${this.data.bluetoothDeviceName}超时,请重新尝试`,
              showCancel: false,
              success() {
                wx.navigateBack({
                  delta: 2
                })
              }
            })
          } else {
            const timer2 = setTimeout(() => {
              this.initBluetooth()
            }, 3000)
            this.setData({
              timer2
            })
          }
        } else {
          let res1 = await bluetoothUtil.connetBlue(deviceId)
          let serviceId = await bluetoothUtil.getServiceId(deviceId, this.data.characteristicId)
          wx.hideLoading()
          wx.showToast({ title: '连接成功！' })
          this.setData({
            deviceId,
            servicesUUID: serviceId
          })
          // 监听蓝牙状态
          bluetoothUtil.monitorTheBlue(this.data.isFirstShow)
          // 请求设备参数
          setTimeout(() => {
            this.sendMy(string2buffer(this.data.instructs.getParams))
            // this.getVersion()
          }, 200)
          // 监听设备返回值
          wx.onBLECharacteristicValueChange((res) => {
            this.handleBLEValue(ab2hex(res.value));
          })
          // 超时
          this.setData({
            isOverTime: true
          })
        }
      },
      fail: res => {
        if(this.data.isFirstShow) {
          wx.showToast({
            title: '请开启蓝牙',
            icon: 'none',
            duration: 3000,
            success: res => {
              wx.redirectTo({ url: '../bluetooth' })
            }
          })
        }
        this.setData({ isFirstShow: false })
        setTimeout(() => {
          this.initBluetooth()
        }, 3000)
      }
    })
  },
  judgeIsLogin() {
    const mobile = this.data.mobile
    if (!mobile) {
      wx.showModal({
        content: '账号未登录，是否前往登录？',
        success: res => {
          if (res.confirm) {
            clearTimeout(this.data.timer1)
            clearTimeout(this.data.timer)
            wx.reLaunch({
              url: '../../mobile/verify/verify?handle=bind'
            })
          }
        }
      })
    } else {
      this.getBindDev()
    }
  },
  // 设备参数
  handleFEFA(nonceId) {
    const code = transformCode(nonceId, [2, 1, 1, 1, 1, 1, 1, 2, 1, 1, 1]);
    code[3] === '0' ? code[3] = '1' : code[3];
    const startDate = '20' + code[1] + '/' + code[2].padStart(2, '0') + '/' + code[3].padStart(2, '0') + ' ' + code[4].padStart(2, '0') + ':' + code[5].padStart(2, '0') + ':' + code[6].padStart(2, '0');
    this.setData({
      deviceParams: code,
      delay: code[8],
      startDate
    })
    this.judgeIsFirstConnectDevice(code[9])
  },
  // 得到数据
  handleFEFC(nonceId) {
    if (nonceId.length === 8) {
      this.setData({
        isOverTime: true
      })
      this.judgeIsOverTime()
    } else {
      let obj = this.data.historyList
      obj.push(transformCode(nonceId, [2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1]))
      this.setData({
        isShowPercent: true,
        historyList: obj,
        percent: obj.length * 8 / this.data.needNum * 100
      })
    }
  },
  // 获取数据总条数
  handleFEFE(nonceId) {
    const code = transformCode(nonceId, [2, 4, 1])
    console.log(code)
    this.setData({
      totalNum: parseInt(('' + code[1]).toString())
    })
    this.bindSelectDate({ currentTarget: { dataset: { index: 0 } } })
  },
  handleFEFB() {
    this.setData({ isOverTime: true })
    this.judgeIsOverTime()
    this.setData({ showPage: 'default' })
  },
  // 建立升级请求连接
  handleFEF7(nonceId) {
    const code = transformCode(nonceId, [2, 4, 1, 2]);
    this.setData({ deviceVersion: code[1] })
  },
  // 固件升级
  firmwareUpdate() {
    this.sendMy(string2buffer(generateCode2(['FE', 'F6', '01'], 2)))
    // this.sendMy(string2buffer('FEF701F6AC'));
  },
  handleFEF6(nonceId) {
    const code = transformCode(nonceId, [2, 1, 1, 2])
    console.log(code)
  },
  handleFEF5(nonceId) {
    const code = transformCode(nonceId, [2, 1, 1, 2])
    this.handleUpdateString()
    const a = 'FEF5' + Math.ceil(this.data.updateArr.length / 13).toString(16).padStart(4, '0') + this.data.updateArr.length.toString(16).padStart(8, '0')
    let code1 = [2, 2, 2, 2, 2, 2, 2, 2].map((item, index) => {
      return a.substr(index * 2, item)
    })
    console.log(code1)
    let arr = generateCode3(code1, 2)
    console.log(arr)
    this.sendMy(string2buffer(arr))
  },
  handleUpdateString() {
    // let data = updateString.split('')
    const arr = []
    for(let i = 0; i < data.length; i+=2) {
      arr.push(data[i] + data[i + 1])
    }
    this.setData({ updateArr: arr })
  },
  handleFEF4(nonceId) {
    const code = transformCode(nonceId, [2, 2, 1, 2]);
    console.log(code);
    const num = code[1].padStart(4, '0'); // 包号
    const message = this.data.updateArr.slice(num * 12, (parseInt(num) + 1) * 12 + 1)
    console.log(generateCode2(['FE', 'F4', num, ...message], 2))
    this.sendMy(string2buffer(generateCode2(['FE', 'F4', parseInt(code[1]).toString(16).padStart(4, '0').slice(0, 2), parseInt(code[1]).toString(16).padStart(4, '0').slice(2), ...message], 2)))
  },
  handleFEF3(nonceId) {
    wx.showModal({
      content: '更新完成',
      showCancel: false
    })
  },
  // 请求版本
  getVersion() {
    this.sendMy(string2buffer('FEF7F50a0d'))
  },
  // 处理蓝牙返回值 
  handleBLEValue(nonceId) {
    //console.log(nonceId)
    const that = this;
    switch(nonceId.slice(0, 4)) {
      case 'fefa':
        this.handleFEFA(nonceId);
        break;
      case 'fefc':
        this.handleFEFC(nonceId);
        break;
      case 'fefe':
        this.handleFEFE(nonceId);
        break;
      case 'fefb':
        this.handleFEFB();
        break;
      case 'fef7':
        this.handleFEF7(nonceId);
        break;
      case 'fef6':
        this.handleFEF6(nonceId);
        break;
      case 'fef5':
        this.handleFEF5(nonceId);
        break;
      case 'fef4':
        this.handleFEF4(nonceId);
        break;
      default:
        wx.showToast({
          title: '指令错误',
          icon: 'none'
        })
    }
  },
  // 进度100%
  finish() {
    const that = this;
    if (this.data.percent >= 100 && this.data.isPercent100) {
      that.debounce(function() {
        that.setData({
          isFinished: false,
          isOverTime: true,
          isPercent100: false
        })
        that.initChart(that.data.historyList, that.data.delay, that.data.startTime)
        that.judgeIsOverTime()
      }, 800)()
    }
  },
  getLocation() {
    const that = this;
    return new Promise((resolve, reject) => {
      wx.getLocation({
        type: 'wgs84',
        success(res) {
          const latitude = res.latitude
          const longitude = res.longitude
          let result = that.data.uploadData
          result.forEach(item => {
            item.jingdu = longitude
            item.weidu = latitude
          })
          resolve(result)
        },
        fail(error) {
          wx.hideLoading()
          wx.openSetting({
            success(res) {
              if (res.authSetting["scope.userLocation"] == true) {
                resolve(false)
              } else {
                wx.showToast({
                  icon: 'none',
                  title: '上传失败！',
                })
                resolve(false)
              }
            }
          })
        }
      })
    })
  },
  // 上传
  async upload() {
    wx.showLoading({ title: '上传中...' })
    let uploadData = await this.getLocation();
    if(!uploadData) return
    let res = await reqUpload(this.data.bluetoothDeviceName, uploadData)
    wx.hideLoading()
    if(res.data.code === 0) {
      wx.showToast({ title: '上传成功！' })
    } else {
      wx.showToast({
        icon: 'none',
        title: '上传失败！'
      })
    }
  },
  bindSelectDate(e) {
    const that = this
    const historyIndex = e.currentTarget.dataset.index || '0'
    clearTimeout(this.data.timer);
    this.setData({
      active: [false, false, false],
      isPercent100: true
    })
    const arr = this.data.active
    arr[historyIndex] = true
    this.setData({
      active: arr,
      historyList: [],
      timer: null
    })

    const deviceStartTime = that.data.startDate
    const deviceEndTime = that.data.deviceParams[8] * that.data.totalNum * 1000 * 60 + new Date(deviceStartTime).getTime()
    const reqStartTime = that.data.totalNum < 2000 ? new Date(deviceStartTime).getTime() : deviceEndTime - 2000 * that.data.deviceParams[8] * 60 * 1000
    let startNum = 0,
      endNum = 0,
      startTime = deviceStartTime,
      sum = 0
    if (historyIndex === '0') {
      sum = 24 * 60 / that.data.deviceParams[8]
    } else if (historyIndex === '1') {
      sum = 3 * 24 * 60 / that.data.deviceParams[8]
    } else {
      sum = 7 * 24 * 60 / that.data.deviceParams[8]
    }
    // endNum
    if (sum < that.data.totalNum && that.data.totalNum < 2000) {
      endNum = sum
    } else if ((that.data.totalNum < sum && sum < 2000) || (that.data.totalNum < 2000 && 2000 < sum)) {
      endNum = that.data.totalNum
    } else {
      endNum = 2000
    }
    // startNum
    if (endNum < that.data.totalNum && that.data.totalNum < 2000) {
      startNum = that.data.totalNum - sum;
    }
    if ((that.data.totalNum < sum && sum < 2000) || (that.data.totalNum < 2000 && 2000 < sum)) {
      startTime = new Date(deviceStartTime)
    } else if (sum < that.data.totalNum && that.data.totalNum < 2000) {
      startTime = reqStartTime + startNum * that.data.deviceParams[8] * 1000 * 60
    } else if ((sum < 2000 && 2000 < that.data.totalNum) || (2000 < sum && sum < that.data.totalNum)) {
      startTime = reqStartTime + (2000 - sum) * that.data.deviceParams[8] * 60 * 1000
    } else {
      startTime = reqStartTime + (that.data.totalNum - Math.floor(that.data.totalNum / 2000) * 2000) * that.data.deviceParams[8] * 60 * 1000
    }
    console.log('总条数: ' + that.data.totalNum)
    console.log('开始条数：' + startNum)
    console.log('所需条数：' + endNum)
    console.log('开始时间：' + new Date(startTime))
    const code = generateCode2(['FE', 'FD', startNum, endNum], 8)

    this.setData({
      needNum: endNum,
      percent: 0,
      startTime: new Date(startTime).getTime(),
      isOverTime: false,
      sumNum: sum
    })
    this.sendMy(string2buffer(code))
  },
  // 判断是否是新设备
  judgeIsFirstConnectDevice(code) {
    if (code === "0") {
      this.setData({
        showPage: 'setting'
      })
    } else {
      this.sendMy(string2buffer(this.data.instructs.getTotal))
      this.setData({
        showPage: 'default'
      })
    }
    this.ecComponent = this.selectComponent('#mychart-dom-bar')
  },
  // 设置上传间隔和延时间隔
  bindInput(e) {
    this.setData({
      [e.currentTarget.dataset.tag]: e.detail.value
    })
  },
  sendMy(buffer) {
    wx.writeBLECharacteristicValue({
      deviceId: this.data.deviceId,
      serviceId: this.data.servicesUUID,
      characteristicId: this.data.writeId,
      value: buffer,
      success: res => {
        console.log("写入成功")
      },
      fail:() => {
        wx.showToast({
          title: '设置失败',
          icon: 'none'
        })
      }
    })
  },
  initChart(historyList, delay, startTime) {
    const that = this;
    let yArr = []
    let xArr = []
    let timeArr = []
    let upY = []
    var i = 0
    historyList.forEach(item => {
      item.forEach((sItem, sIndex) => {
        if (sIndex === 0 || sIndex === item.length - 1 || sIndex === item.length - 2 || i >= that.data.needNum) {
          return
        }
        let time = formatTime(new Date(parseInt(startTime) + delay * 1000 * 60 * (i + 1))).slice(0, -3).slice(11)
        let time1 = formatTime(new Date(parseInt(startTime) + delay * 1000 * 60 * (i + 1))).slice(0, -3)
        timeArr.push(time1)
        xArr.push(time)
        yArr.push(sItem / 10)
        upY.push(sItem)
        i++
      })
    })
    if (that.data.totalNum > 2000) {
      const split = that.data.totalNum - Math.floor(that.data.totalNum / 2000) * 2000;
      yArr = [...yArr.slice(split), ...yArr.slice(0, split)]
      upY = [...upY.slice(split), ...upY.slice(0, split)]
    }
    let uploadData = xArr.map((item, index) => {
      return { shebeibianhao: that.data.bluetoothDeviceName, time: timeArr[index], temperature01: upY[index]}
    })
    this.setData({ uploadData })
    this.initCharts(xArr, yArr)
  },
  initCharts(xAxis, seriesData) {
    this.ecComponent.init((canvas, width, height) => {
      const chart = echarts.init(canvas, null, {
        width: width,
        height: height
      })

      this.setOption(chart, xAxis, seriesData)

      this.chart = chart

      return chart
    });
  },
  setOption(chart, xAxis, seriesData) {
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
        data: xAxis,
        // axisLabel: {
        //   rotate: -35
        // }
      },
      yAxis: {
        axisLabel: {
          formatter: '{value}°C'
        },
        // splitLine: {
        //   show: false
        // }
      },
      // dataZoom: [{
      //   show: true,
      //   realtime: true,
      //   startValue: xAxis[0],
      // }],
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
        data: seriesData
      }
    }
    chart.setOption(option)
  },
  debounce(fn, interval) {
    const that = this
    var timer
    var gapTime = interval || 1000
    return function() {
      clearTimeout(that.data.timer1)
      var context = this;
      var args = arguments;
      timer = setTimeout(function() {
        fn.call(context, args);
      }, gapTime);
      that.setData({
        timer1: timer
      })
    };
  },
  countDown() {
    var nsecond = 60
    var timer5 = setInterval(() => {
      nsecond -= 1
      this.setData({ second: nsecond })
      if (nsecond < 1) {
        clearInterval(timer5)
        this.setData({
          connectOverTime: true,
          second: 60
        })
      }
    }, 1000)
    this.setData({ timer5 })
  }
})