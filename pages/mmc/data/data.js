var dateTimePicker = require('../../../utils/datetimepicker.js');
import {
  string2buffer,
  ab2hex,
  formatTime,
  transformCode,
  generateCode,
  generateCode2
} from '../../../utils/util.js';
import * as bluetoothUtil from '../../../utils/bluetooth1.js';
import * as echarts from '../../../utils/echarts.min.js';
import {
  reqBindDev,
  reqOpenid,
  reqUpload
} from '../../../service/service.js';

Page({
  data: {
    isFirstShow: true,
    servicesUUID: '',
    deviceId: '', // 设备deviceId
    isBluetoothOpen: false, // 蓝牙是否开启
    characteristicId: '0000FFF1-0000-1000-8000-00805F9B34FB', // notify uuid
    time: 60,
    dateTime: null,
    startDate: [],
    endYear: 2028,
    alarmItems: [{
      name: '1',
      checked: true,
      value: '零上'
    }, {
      name: '-1',
      checked: false,
      value: '零下'
    }],
    alarmItems2: [{
      name: '1',
      checked: true,
      value: '零上'
    }, {
      name: '-1',
      checked: false,
      value: '零下'
    }],
    dateTimeArray: null,
    isConnected: false,
    isIntervalDisabled: false,
    isDelayDisabled: false,
    interval: 0, // 间隔
    delay: 0, // 延时
    percent: 0, // 进度条
    dateTime: '',
    dateTime1: '',
    dateTimeArray: [],
    dateTimeArray1: [],
    isShowPercent: false,
    isDisabledChartBtn: true,
    startTime: '',
    totalNum: 0, // 总数据条数
    historyList: [], // 历史数据
    deviceParams: [], // 设备参数
    showPage: '', // 当前展示页
    writeId: '0000FFF2-0000-1000-8000-00805F9B34FB', // write uuid
    bluetoothDeviceName: '1000001', // 蓝牙设备名 HJ-580XP_EE
    timer: null,
    timer1: null,
    timer2: null,
    isOverTime: false,
    connectOverTime: false, // 连接超时
    instructs: {
      getParams: 'FEF90x0a0d', // 请求设备参数
      getTotal: 'FEFEAC', // 获取数据总条数
    },
    isPercent100: false
  },
  onLoad: function (options) {
    console.log(options);
    if (options.id) {
      this.setData({
        bluetoothDeviceName: options.id
      })
    }
    this.setData({
      mobile: wx.getStorageSync('mobile')
    })
    this.getOpenId();
    this.initBluetooth();
  },
  onUnload() {
    clearTimeout(this.data.timer);
    clearTimeout(this.data.timer1);
    clearTimeout(this.data.timer2);
    wx.closeBluetoothAdapter();
  },
  radioChange1(e) {
    const that = this;
    that.data.alarmItems.forEach((item, index) => {
      if (item.name === e.detail.value) {
        that.setData({
          ['alarmItems[' + index + '].checked']: true
        })
      } else {
        that.setData({
          ['alarmItems[' + index + '].checked']: false
        })
      }
    })
  },
  radioChange2(e) {
    const that = this;
    that.data.alarmItems2.forEach((item, index) => {
      if (item.name === e.detail.value) {
        that.setData({
          ['alarmItems2[' + index + '].checked']: true
        })
      } else {
        that.setData({
          ['alarmItems2[' + index + '].checked']: false
        })
      }
    })
  },
  async getOpenId() {
    let res = await reqOpenid();
    const data = JSON.parse(res.data.data);
    wx.setStorageSync('openid', data.openid);
  },
  submit() {
    const that = this;
    const startTime = that.data.dateTimeArray[0][that.data.dateTime[0]] + '-' + that.data.dateTimeArray[1][that.data.dateTime[1]] + '-' + that.data.dateTimeArray[2][that.data.dateTime[2]] + ' ' + that.data.dateTimeArray[3][that.data.dateTime[3]] + ':' + that.data.dateTimeArray[4][that.data.dateTime[4]];
    const endTime = that.data.dateTimeArray1[0][that.data.dateTime1[0]] + '-' + that.data.dateTimeArray1[1][that.data.dateTime1[1]] + '-' + that.data.dateTimeArray1[2][that.data.dateTime1[2]] + ' ' + that.data.dateTimeArray1[3][that.data.dateTime1[3]] + ':' + that.data.dateTimeArray1[4][that.data.dateTime1[4]];
    const deviceStartTime = that.data.startDate[0] + '-' + that.data.startDate[1] + '-' + that.data.startDate[2] + ' ' + that.data.startDate[3] + ':' + that.data.startDate[4];
    let s1 = new Date(startTime);
    let s2 = new Date(deviceStartTime);
    let s3 = new Date(endTime);
    console.log('totalNum: ' + that.data.totalNum);
    const deviceEndTime = new Date(that.data.deviceParams[9] * that.data.totalNum * 1000 * 60 + s2.getTime());
    console.log(deviceEndTime)
    if (s1 < s2) {
      wx.showModal({
        title: '提示',
        content: '开始时间不得小于' + deviceStartTime,
        showCancel: false
      })
      return
    }
    if (s3 < s1) {
      wx.showModal({
        title: '提示',
        content: '结束时间不得小于开始时间',
        showCancel: false
      })
      return
    }
    if (deviceEndTime - s3 < 0) {
      wx.showModal({
        title: '提示',
        content: '结束时间不得超过' + formatTime(deviceEndTime),
        showCancel: false
      })
      return
    }
    let startNum = parseInt((s1.getTime() - s2.getTime()) / 1000 / 60 / that.data.deviceParams[8]);
    let endNum = parseInt((s3.getTime() - s1.getTime()) / 1000 / 60 / that.data.deviceParams[8]);
    console.log(startNum, endNum);

    startNum = startNum.toString(16).padStart(8, '0');
    endNum = endNum.toString(16).padStart(8, '0');
    let verify = (parseInt('FE', 16) + parseInt('FD', 16) + parseInt(startNum, 16) + parseInt(endNum, 16)).toString().padStart(2, '0').slice(-2);
    const code = 'FEFD' + startNum + endNum + verify + '0x0a0d';
    console.log(code);
    this.sendMy(string2buffer(code));
    this.setData({
      needNum: endNum,
      startTime: new Date(startTime).getTime(),
      showPage: 'result'
    })
  },
  finish() {
    const that = this;
    if (this.data.percent >= 100) {
      that.debounce(function () {
        that.setData({
          isFinished: false,
          isOverTime: true,
          isPercent100: false
        })
        that.initChart(that.data.historyList, that.data.delay, that.data.startTime);
        that.judgeIsOverTime();
      }, 100)()
    }
  },
  // 超时判定
  judgeIsOverTime() {
    const that = this;
    if (this.data.isOverTime && !this.data.timer) {
      const timer = setTimeout(() => {
        wx.closeBluetoothAdapter({
          success: function (res) {
            wx.openBluetoothAdapter({
              success: function (res) {
                wx.stopBluetoothDevicesDiscovery({
                  success: function (res) {
                    wx.hideLoading();
                  },
                })
                wx.showModal({
                  title: '提示框',
                  content: '蓝牙已断开，是否重新连接？',
                  success(res) {
                    if (res.confirm) {
                      that.initBluetooth();
                      // wx.reLaunch({
                      //   url: '../bluetooth',
                      // })
                    }
                  }
                })
              }
            })
          }
        })
      }, 60000)
      this.setData({
        timer
      })
    }
  },
  async upload() {
    wx.showLoading({
      title: '上传中...',
    })
    console.log(this.data.uploadData)
    let res = await reqUpload(this.data.bluetoothDeviceName, this.data.uploadData)
    console.log(res)
    wx.hideLoading();
    if (res.data.data.code === 0) {
      wx.showToast({
        title: '上传成功！',
      })
    } else {
      wx.showToast({
        icon: 'none',
        title: '上传失败！',
      })
    }
  },
  submitSetting() {
    if (!this.data.interval) {
      wx.showToast({
        title: '请设置间隔',
        icon: 'none'
      })
      return false;
    }
    if (this.data.interval < 1 || this.data.interval > 60) {
      wx.showToast({
        title: '间隔在1~60分钟',
        icon: 'none'
      })
      return false;
    }
    if (!this.data.delay) {
      wx.showToast({
        title: '请设置延时',
        icon: 'none'
      })
      return false;
    }
    if (this.data.delay < 1 || this.data.delay > 60) {
      wx.showToast({
        title: '延时在1~60分钟',
        icon: 'none'
      })
      return false;
    }
    const now = new Date();
    let year = parseInt(now.getFullYear().toString().slice(2));
    let month = now.getMonth() + 1;
    let day = now.getDate();
    let h = now.getHours();
    let m = now.getMinutes();
    let s = now.getSeconds();
    let interval = parseFloat(this.data.interval);
    let delay = parseFloat(this.data.delay);
    let verify = (parseInt('fe', 16) + parseInt('fb', 16) + year + month + day + h + m + s + interval + delay).toString(16).padStart(2, '0');
    verify = verify[verify.length - 2] + verify[verify.length - 1];
    console.log(year, month, day, h, m, s, interval, delay, verify)
    year = year.toString(16).padStart(2, '0');
    month = month.toString(16).padStart(2, '0');
    day = day.toString(16).padStart(2, '0');
    h = h.toString(16).padStart(2, '0');
    m = m.toString(16).padStart(2, '0');
    s = s.toString(16).padStart(2, '0');
    interval = interval.toString(16).padStart(2, '0');
    delay = delay.toString(16).padStart(2, '0');
    const code = 'FEFB' + year + month + day + h + m + s + interval + delay + verify + '0x0a0d';
    console.log(code);
    const msg = string2buffer(code);
    this.sendMy(msg);
  },
  initBluetooth() {
    wx.openBluetoothAdapter({
      success: async (res) => {
        this.countDown();
        bluetoothUtil.getTheBlueDisConnectWithAccident(() => {
          this.setData({
            isFirstShow: false
          })
        });
        let deviceId = await bluetoothUtil.findBluetooth(this.data.bluetoothDeviceName);
        if (!deviceId) {
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
          let res1 = await bluetoothUtil.connetBlue(deviceId);
          let serviceId = await bluetoothUtil.getServiceId(deviceId, this.data.characteristicId);
          this.setData({
            deviceId,
            servicesUUID: serviceId
          })
          // 监听蓝牙状态
          bluetoothUtil.monitorTheBlue(this.data.isFirstShow);
          // 请求设备参数
          this.sendMy(string2buffer('FEF7F50x0a0d'))
          // this.sendMy(string2buffer(this.data.instructs.getParams));
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
      fail: (res) => {
        if (this.data.isFirstShow) {
          wx.showToast({
            title: '请开启蓝牙',
            icon: 'none',
            duration: 3000,
            success(res) {
              wx.redirectTo({
                url: '../bluetooth'
              })
            }
          })
        }
        this.setData({
          isFirstShow: false
        })
        setTimeout(() => {
          this.initBluetooth();
        }, 3000)
      }
    })
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
    this.judgeIsFirstConnectDevice(code[9]);
  },
  // 得到数据
  handleFEFC(nonceId) {
    if (nonceId.length === 8) {
      wx.showModal({
        content: '暂无数据',
        showCancel: false
      })
      this.setData({
        isOverTime: true
      })
      this.judgeIsOverTime();
    } else {
      let obj = this.data.historyList;
      obj.push(transformCode(nonceId, [2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1]));
      this.setData({
        isShowPercent: true,
        historyList: obj,
        percent: obj.length * 8 / this.data.needNum * 100
      })
    }
  },
  // 获取数据总条数
  handleFEFE(nonceId) {
    const code = transformCode(nonceId, [2, 4, 1]);
    console.log(code)
    this.setData({
      totalNum: parseInt(('' + code[1]).toString())
    })
    // this.bindSelectDate({ currentTarget: { dataset: { index: 0 } } });
  },
  handleFEFB() {
    this.setData({
      isOverTime: true
    })
    this.judgeIsOverTime();
    this.setData({
      showPage: 'default'
    })
  },
  // 接收版本号
  handleFEF7(nonceId) {
    const code = transformCode(nonceId, [2, 4, 1, 2]);
    console.log(code)
    this.setData({
      deviceVersion: code[1]
    })
  },
  // 固件升级
  firmwareUpdate() {
    // this.sendMy(string2buffer('FEF601F50x0a0d'));
    this.sendMy(string2buffer(generateCode2(['FE', 'F7', 'F5'], 2)))
  },
  handleFEF6(nonceId) {
    const code = transformCode(nonceId, [2, 1, 1, 2]);
    console.log(code)
    if (code[1] === '03') {
      let sCode = generateCode2(['FE', 'F7', 'F5'], 2)
      this.sendMy(string2buffer(sCode));
    }
  },
  handleFEF5(nonceId) {
    const code = transformCode(nonceId, [2, 1, 1, 2]);
    const sCode = generateCode2(['FE', 'F5', num, '数据'])
    this.sendMy(string2buffer(sCode));
  },
  handleFEF4(nonceId) {
    wx.showModal({
      content: '更新完成',
      showCancel: false
    })
  },
  // 处理蓝牙返回值 
  handleBLEValue(nonceId) {
    console.log(nonceId)
    const that = this;
    switch (nonceId.slice(0, 4)) {
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
  judgeIsLogin() {
    const that = this;
    const mobile = that.data.mobile;
    if (!mobile) {
      wx.showModal({
        content: '账号未登录，是否前往登录？',
        success(res) {
          if (res.confirm) {
            clearTimeout(that.data.timer1)
            clearTimeout(that.data.timer)
            wx.reLaunch({
              url: '../../mobile/verify/verify?handle=bind',
            })
          }
        }
      })
    } else {
      this.getBindDev();
    }
  },
  // 判断是否是新设备
  judgeIsFirstConnectDevice(code) {
    if (code === "0") { // 新设备
      this.setData({
        showPage: 'setting'
      })
    } else {
      this.sendMy(string2buffer(this.data.instructs.getTotal));
      this.setData({
        showPage: 'default'
      })
    }
    this.ecComponent = this.selectComponent('#mychart-dom-bar');
  },
  // 设置上传间隔和延时间隔
  bindInput(e) {
    console.log(e);
    this.setData({
      [e.currentTarget.dataset.tag]: e.detail.value
    })
  },
  sendMy(buffer) {
    var that = this;
    wx.writeBLECharacteristicValue({
      deviceId: that.data.deviceId,
      serviceId: that.data.servicesUUID,
      characteristicId: that.data.writeId,
      // 这里的value是ArrayBuffer类型
      value: buffer,
      success: function (res) {
        console.log("写入成功");
      },
      fail: function () {
        wx.showToast({
          title: '设置失败',
          icon: 'none'
        })
      }
    })
  },
  back() {
    this.setData({
      showPage: 'default'
    })
  },
  showLine() {
    wx.setStorageSync('historyList', JSON.stringify(this.data.historyList));
    this.setData({
      historyList: []
    })
    wx.navigateTo({
      url: '../chart/chart?delay=' + this.data.delay + '&starttime=' + this.data.startTime + '&neednum=' + this.data.needNum,
    })
  },
  initDateTimePicker() {
    console.log(this.data.startDate);
    var obj = this.data.startDate;
    obj.dateTimeArray.pop();
    obj.dateTime.pop();
    obj.dateTimeArray1.pop();
    obj.dateTime1.pop();
    this.setData({
      dateTime: obj.dateTime,
      dateTimeArray: obj.dateTimeArray,
      dateTime1: obj.dateTime1,
      dateTimeArray1: obj.dateTimeArray1
    })
  },
  changeDateTime(e) {
    this.setData({
      dateTime: e.detail.value
    });
  },
  changeDateTimeColumn(e) {
    var arr = this.data.dateTime, dateArr = this.data.dateTimeArray;
    arr[e.detail.column] = e.detail.value;
    dateArr[2] = dateTimePicker.getMonthDay(dateArr[0][arr[0]], dateArr[1][arr[1]]);
    this.setData({
      dateTimeArray: dateArr,
      dateTime: arr
    });
  },
  changeDateTime1(e) {
    this.setData({
      dateTime1: e.detail.value
    });
  },
  changeDateTimeColumn1(e) {
    var arr = this.data.dateTime1, dateArr = this.data.dateTimeArray1;
    arr[e.detail.column] = e.detail.value;
    dateArr[2] = dateTimePicker.getMonthDay(dateArr[0][arr[0]], dateArr[1][arr[1]]);
    this.setData({
      dateTimeArray1: dateArr,
      dateTime1: arr
    });
  },
  countDown() {
    var nsecond = 30;
    var timer5 = setInterval(() => {
      nsecond -= 1;
      this.setData({
        second: nsecond
      })
      if (nsecond < 1) {
        clearInterval(timer5);
        this.setData({
          connectOverTime: true,
          second: 30
        })
      }
    })
  }
})