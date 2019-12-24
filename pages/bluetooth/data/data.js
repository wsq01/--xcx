var dateTimePicker = require('../../../utils/datetimepicker.js');
import {
  string2buffer,
  ab2hex,
  formatTime
} from '../../../utils/util.js';
import {
  findBluetooth,
  connetBlue,
  monitorTheBlue,
  getServiceId,
  startNotice,
  getBlue,
  getCharacteId,
  getTheBlueDisConnectWithAccident
} from '../../../utils/bluetooth.js';
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
    bluetoothDeviceName: '777001' // 蓝牙设备名 HJ-580XP_EE
  },
  onLoad: function(options) {
    console.log(options);
    if (options.id) {
      this.setData({
        bluetoothDeviceName
      })
    }
    this.initBluetooth();
    // this.initDateTimePicker();
  },
  onUnload() {
    wx.closeBluetoothAdapter({
      success: function(res) {
        wx.openBluetoothAdapter({
          success: function(res) {
            console.log('xxxxx')
          }
        })
      },
    })
  },
  radioChange1(e) {
    const that = this;
    that.data.alarmItems.forEach((item, index) => {
      if(item.name === e.detail.value) {
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
    const code = 'FEFD' + startNum + endNum + verify;
    console.log(code);
    this.sendMy(string2buffer(code));
    this.setData({
      needNum: endNum,
      startTime: new Date(startTime).getTime(),
      showPage: 'result'
    })
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
    const code = 'FEFB' + year + month + day + h + m + s + interval + delay + verify;
    console.log(code);
    const msg = string2buffer(code);
    this.sendMy(msg);
  },
  initBluetooth() {
    const that = this;
    wx.openBluetoothAdapter({ // 初始化蓝牙模块
      success: function(res) {
        that.setData({
          isBluetoothOpen: true
        })
        getTheBlueDisConnectWithAccident(() => {
          that.setData({
            isConnected: false,
            isFirstShow: false
          })
        }); //监听蓝牙是否会异常断开
        findBluetooth(() => {
          getBlue(that.data.bluetoothDeviceName, (res) => {
            that.setData({
              deviceId: res
            })
            connetBlue(that.data.deviceId, () => {
              getServiceId(that.data.deviceId, (res) => {
                that.setData({
                  servicesUUID: res.services[1].uuid
                })
                getCharacteId(that.data.deviceId, that.data.servicesUUID, () => {
                  wx.hideLoading();
                  startNotice(that.data.deviceId, that.data.servicesUUID, that.data.characteristicId, () => {

                    that.sendMy(string2buffer('FEF9AC'));
                    // 设备返回的方法
                    wx.onBLECharacteristicValueChange(function(res) {
                      console.log("蓝牙测试返回的数据");
                      console.log(res)
                      var nonceId = ab2hex(res.value);
                      console.log(nonceId)
                      that.handleBLEValue(nonceId);
                    })
                  }) //7.0
                }) //6.0
              }) //5.0
            }); //4.0
          });
        })
        monitorTheBlue((res) => {
          if (res.available) { // available 蓝牙开启标志
            if (!that.data.isFirstShow) {
              that.setData({
                isBluetoothOpen: true
              })
              wx.showToast({
                title: '蓝牙已开启',
                icon: 'none',
                duration: 3000
              })
            }
          } else {
            that.setData({
              connectionEquipment: '请打开手机蓝牙',
              // isFirstShow: false,
            })
            wx.showToast({
              title: '蓝牙已关闭',
              icon: 'none',
              duration: 3000,
            })
          }
        });
      },
      fail: function(res) {
        console.log(res)
        if (that.data.isFirstShow) { // 提示一次
          wx.showToast({
            title: '请开启蓝牙',
            icon: 'none',
            duration: 3000
          })
        }
        that.setData({
          isFirstShow: false,
          isBluetoothOpen: false
        })
        setTimeout(() => {
          that.initBluetooth();
        }, 3000)
      }
    })
  },
  // 处理蓝牙返回值 
  handleBLEValue(nonceId) {
    const that = this;
    if (nonceId.startsWith('fefa')) { // fefa 
      const code = that.transformCode(nonceId, [2, 1, 1, 1, 1, 1, 1, 2, 1, 1, 1]);
      console.log(code);
      that.setData({
        deviceParams: code,
        delay: code[8],
        startDate: ['20' + code[1], code[2].padStart(2, '0'), code[3].padStart(2, '0'), code[4].padStart(2, '0'), code[5].padStart(2, '0'), code[6].padStart(2, '0')]
      })
      that.initDateTimePicker();
      that.judgeIsFirstConnectDevice(code);
    } else if (nonceId.startsWith('fefc')) { // fefc 
      if (nonceId.length === 8) {
        wx.showModal({
          title: '提示',
          content: '无数据',
        })
        that.setData({
          isDisabledChartBtn: true
        })
      } else {
        const code = that.transformCode(nonceId, [2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1]);
        let obj = that.data.historyList;
        obj.push(code);
        console.log(obj)
        that.setData({
          isShowPercent: true,
          historyList: obj,
          isDisabledChartBtn: false,
          percent: obj.length * 8 / that.data.totalNum * 100
        })
        console.log(that.data.percent);
      }
    } else if (nonceId.startsWith('fefe')) { // fefe 
      const code = that.transformCode(nonceId, [2, 4, 1]);
      console.log(code);
      that.setData({
        totalNum: parseInt(('' + code[1]).toString())
      })
    } else if (nonceId.startsWith('fefb')) {
      that.setData({
        showPage: 'default'
      })
    } else {
      wx.showToast({
        title: '指令错误',
        icon: 'none'
      })
    }
  },
  judgeIsFirstConnectDevice(code) {
    if (code[9] === "0") { // 首次设置
      this.setData({
        showPage: 'setting'
      })
    } else {
      this.sendMy(string2buffer('FEFEAC'));
      this.setData({
        showPage: 'default'
      })
    }
  },
  bindinputInterval(e) {
    this.setData({
      interval: e.detail.value
    })
  },
  bindinputDelay(e) {
    this.setData({
      delay: e.detail.value
    })
  },
  // 指令转换 
  transformCode(code, split) {
    let sum = 0;
    return split.map((item, index) => {
      let a;
      if (index === 0 || index === split.length - 1) {
        a = code.substr(sum * 2, item * 2)
      } else {
        a = parseInt(code.substr(sum * 2, item * 2), 16).toString();
      }
      sum += item;
      return a;
    })
  },
  sendMy(buffer) {
    var that = this;
    wx.writeBLECharacteristicValue({
      // 这里的 deviceId 需要在上面的 getBluetoothDevices 或 onBluetoothDeviceFound 接口中获取
      deviceId: that.data.deviceId,
      // 这里的 serviceId 需要在上面的 getBLEDeviceServices 接口中获取
      serviceId: that.data.servicesUUID,
      // 这里的 characteristicId 需要在上面的 getBLEDeviceCharacteristics 接口中获取
      characteristicId: that.data.writeId, //第二步写入的特征值
      // 这里的value是ArrayBuffer类型
      value: buffer,
      success: function(res) {
        console.log("写入成功");
      },
      fail: function() {
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
    var obj = dateTimePicker.dateTimePicker(parseInt(this.data.startDate[0]), this.data.endYear, this.data.startDate);
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
  }
})