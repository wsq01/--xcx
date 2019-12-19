var dateTimePicker = require('../../../utils/datetimepicker.js');
import { formatTime } from '../../../utils/util.js';

Page({
  data: {
    isFirstShow: true,
    connectionEquipment: '',
    remaiderString: '',
    servicesUUID: '',
    deviceId: '', // 设备deviceId
    isBluetoothOpen: false,
    devices: '', // 蓝牙设备列表
    characteristicId: '0000FFF1-0000-1000-8000-00805F9B34FB', // notify uuid
    time: 60,
    dateTime: null,
    startDate: [], // 开始记录时间
    endYear: 2025,
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
    historyList: [],
    isDisabledChartBtn: true,
    startTime: '',
    totalNum: 0, // 总数据条数
    deviceParams: [], // 设备参数
    showPage: '', // 当前展示页
    writeId: '0000FFF2-0000-1000-8000-00805F9B34FB', // write uuid
    bluetoothDeviceName: '777001' // 蓝牙设备名
  },
  onLoad: function (options) {
    console.log(options)
    if (options.id) {
      this.setData({
        bluetoothDeviceName
      })
    }
    this.initBluetooth();
    this.initDateTimePicker()
  },
  onUnload() {
    wx.closeBluetoothAdapter({
      success: function (res) {
        wx.openBluetoothAdapter({
          success: function (res) {
            console.log('xxxxx')
          }
        })
      },
    })
  },
  initDateTimePicker() {
    var obj = dateTimePicker.dateTimePicker(this.data.startDate[0], this.data.endYear, this.data.startDate);
    // var obj = dateTimePicker.dateTimePicker(this.data.startYear, this.data.endYear);
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
    this.setData({ dateTime: e.detail.value });
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
    this.setData({ dateTime1: e.detail.value });
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
  submit() {
    const that = this;
    const startTime = that.data.dateTimeArray[0][that.data.dateTime[0]] + '-' + that.data.dateTimeArray[1][that.data.dateTime[1]] + '-' + that.data.dateTimeArray[2][that.data.dateTime[2]] + ' ' + that.data.dateTimeArray[3][that.data.dateTime[3]] + ':' + that.data.dateTimeArray[4][that.data.dateTime[4]];
    const endTime = that.data.dateTimeArray1[0][that.data.dateTime1[0]] + '-' + that.data.dateTimeArray1[1][that.data.dateTime1[1]] + '-' + that.data.dateTimeArray1[2][that.data.dateTime1[2]] + ' ' + that.data.dateTimeArray1[3][that.data.dateTime1[3]] + ':' + that.data.dateTimeArray1[4][that.data.dateTime1[4]];
    const deviceStartTime = that.data.startDate[0] + '-' + that.data.startDate[1] + '-' + that.data.startDate[2] + ' ' + that.data.startDate[3] + ':' + that.data.startDate[4];
    let s1 = new Date(startTime);
    let s2 = new Date(deviceStartTime);
    let s3 = new Date(endTime);
    console.log('totalNum: ' + that.data.totalNum)
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
    if(s3 < s1) {
      wx.showModal({
        title: '提示',
        content: '结束时间不得小于开始时间',
        showCancel: false
      })
      return 
    }
    if(deviceEndTime - s3 < 0) {
      wx.showModal({
        title: '提示',
        content: '结束时间不得超过' + formatTime(deviceEndTime),
        showCancel: false
      })
      return 
    }
    let startNum = parseInt((s1.getTime() - s2.getTime()) / 1000 / 60 / that.data.deviceParams[8]);
    let endNum = parseInt((s3.getTime() - s1.getTime()) / 1000 / 60 / that.data.deviceParams[8]);
    console.log(startNum,endNum);

    startNum = startNum.toString(16).padStart(8, '0');
    endNum = endNum.toString(16).padStart(8, '0');
    let verify = parseInt('FE', 16) + parseInt('FD', 16) + parseInt(startNum, 16) + parseInt(endNum, 16);
    verify = verify.toString().padStart(2, '0').slice(-2);
    const code = 'FEFD' + startNum + endNum + verify;
    console.log(code);
    this.sendMy(that.string2buffer(code));
    this.setData({
      percent: 0,
      needNum: endNum,
      startTime: new Date(startTime).getTime(),
      showPage: 'result'
    })
  },
  submitSetting() {
    if(!this.data.interval) {
      wx.showToast({
        title: '请设置间隔',
        icon: 'none'
      })
      return false;
    }
    if(this.data.interval < 1 || this.data.interval > 60) {
      wx.showToast({
        title: '间隔在1~60分钟',
        icon: 'none'
      })
      return false;
    }
    if(!this.data.delay) {
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
    console.log(year, month, day,h,m,s,interval,delay,verify)
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
    const msg = this.string2buffer(code);
    this.sendMy(msg);
  },
  initBluetooth() {
    const that = this;
    wx.openBluetoothAdapter({ // 初始化蓝牙模块
      success: function (res) {
        // that.countdown()
        that.getTheBlueDisConnectWithAccident();//监听蓝牙是否会异常断开
        that.findBluetooth();
        that.setData({
          isBluetoothOpen: true
        })
        that.monitorTheBlue();
      },
      fail: function (res) {
        console.log(res);
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
  // 判定手机蓝牙是否打开
  monitorTheBlue() {
    const that = this;
    wx.onBluetoothAdapterStateChange(function (res) {
      if (res.available) { // available 蓝牙开启标志
        if (!that.data.isFirstShow) {
          that.setData({
            isBluetoothOpen: true,
            connectionEquipment: '请打开设备，并靠近手机',
          })
          wx.showToast({
            title: '蓝牙已开启',
            icon: 'none',
            duration: 3000
          })
        }
      } else {
        that.setData({
          remaiderString: '等待连接',
          connectionEquipment: '请打开手机蓝牙',
          // isBloothOpen: 10,
          // isFirstShow: false,
        })
        wx.showToast({
          title: '蓝牙已关闭',
          icon: 'none',
          duration: 3000,
        })
      }
    })
  },
  // 开始获取附近的蓝牙设备
  findBluetooth() {
    const that = this;
    wx.showLoading({
      title: '正在搜索设备'
    })
    wx.startBluetoothDevicesDiscovery({
      allowDuplicatesKey: false,
      interval: 0,
      success: function (res) {
        that.getBlue();
      },
    })
  },
  // 搜索获取附近的所有蓝牙设备 获取附近所有的蓝牙设备的相关信息 获取需要连接蓝牙设备的deviceID
  getBlue() {
    const that = this;
    wx.getBluetoothDevices({
      success: function (res) {
        if (res.devices.length === 0) {
          setTimeout(() => {
            that.getBlue();
          }, 2000)
        }
        var index = false;
        for (var i = 0; i < res.devices.length; i++) {
          if (res.devices[i].name && res.devices[i].localName) {
            var arr = res.devices[i].name
            var secArr = res.devices[i].localName
            if (arr == that.data.bluetoothDeviceName || secArr == that.data.bluetoothDeviceName) {
              console.log('get bluetooth success')
              index = true;
              that.setData({
                deviceId: res.devices[i].deviceId,
                devices: res.devices,
                connectionEquipment: '已连接到设备：' + res.devices[i].localName,
                remaiderString: '已连接',
              })
              console.log("设备：" + that.data.deviceId);
            }
          }
        }
        if (!index) {
          that.setData({
            connectionEquipment: '请打开设备，并靠近手机',
            remaiderString: '未找到设备,正在重新搜索',
          })
          setTimeout(() => {
            that.findBluetooth()
          }, 3000)
        } else {
          that.connetBlue();//4.0
        }
      },
      fail: function () {
        // if (that.data.isFirstShow) {
        //   that.showFailReminder("未搜索到配套设备")
        // }
        that.setData({
          connectionEquipment: '请打开设备，并靠近手机',
          remaiderString: '等待连接',
        })
      },
      // complete: function () {
      //   that.setData({
      //     isFirstShow: false,
      //   })
      // }
    })
  },
  // 连接蓝牙设备
  connetBlue(deviceId) {
    var that = this;
    wx.createBLEConnection({
      // 这里的 deviceId 需要已经通过 createBLEConnection 与对应设备建立链接
      deviceId: that.data.deviceId,//设备id
      success: function (res) {
        that.setData({
          remaiderString: '连接成功'
        })
        wx.showToast({
          title: '连接成功',
          icon: 'success',
          duration: 1000
        })
        wx.stopBluetoothDevicesDiscovery({
          success: function (res) {
            console.log('stopBluetoothDevicesDiscovery success');
          }
        })
        that.getServiceId()//5.0
      },
      fail: function (res) {},
    })
  },
  // 获取设备的uuid
  getServiceId() {
    var that = this;
    wx.getBLEDeviceServices({
      // 这里的 deviceId 需要已经通过 createBLEConnection 与对应设备建立链接
      deviceId: that.data.deviceId,
      success: function (res) {
        console.log('getserviceid success')
        that.setData({
          servicesUUID: res.services[1].uuid
        })
        that.getCharacteId()//6.0
      }
    })
  },
  // 查看当前蓝牙设备的特征值
  getCharacteId() {
    var that = this;
    wx.getBLEDeviceCharacteristics({
      // 这里的 deviceId 需要已经通过 createBLEConnection 与对应设备建立链接
      deviceId: that.data.deviceId,
      // 这里的 serviceId 需要在上面的 getBLEDeviceServices 接口中获取
      serviceId: that.data.servicesUUID,
      success: function (res) {
        wx.hideLoading();
        console.log(res);
        for (var i = 0; i < res.characteristics.length; i++) {
          var model = res.characteristics[i]
          if (model.properties.notify == true) {
            that.setData({
              characteristicId: model.uuid//监听的值
            })
            that.startNotice(model.uuid)//7.0
          }
          // if (model.properties.read == true) {
          //   that.readData(model.uuid)
          // }
          if (model.properties.write == true) {
            // that.setData({
            //   writeId: model.uuid//用来写入的值
            // })
            // that.sendMy(that.string2buffer('FFAC'))
          }
        }
      }
    })
  },
  // 开启设备数据监听 监听蓝牙设备返回来的数据
  startNotice(uuid) {
    var that = this;
    wx.notifyBLECharacteristicValueChange({
      state: true, // 启用 notify 功能
      deviceId: that.data.deviceId,
      serviceId: that.data.servicesUUID,
      characteristicId: uuid,  //第一步 开启监听 notityid  第二步发送指令 write
      success: function (res) {
        console.log('监听设备成功')
        // 设备返回的方法
        that.sendMy(that.string2buffer('FEF9AC'));
        wx.onBLECharacteristicValueChange(function (res) {
          console.log("蓝牙测试返回的数据");
          var nonceId = that.ab2hex(res.value);
          console.log(nonceId);
          that.handleBLEValue(nonceId);    
        })
      },
      fail: function (res) {
        console.log(res);
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

      console.log(that.data.startDate);
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
          historyList: obj,
          isDisabledChartBtn: false,
          percent: obj.length * 8 / that.data.totalNum * 100
        })
        console.log(that.data.percent);
      }
    } else if (nonceId.startsWith('fefe')) { // fefe
      const code = that.transformCode(nonceId, [2, 4, 1]);
      console.log(code)
      that.setData({
        totalNum: parseInt(('' + code[1]).toString())
      })
    } else {
      wx.showToast({
        title: '指令错误',
        icon: 'none'
      })
    }
          // 请求接口
          // wx.request({
          //   method: "POST",

          //   data: {
          //     xx: nonceId
          //   },
          //   url: url,
          //   success: (res) => {
          //     //res.data.data.ciphertext：我这边服务返回来的是16进制的字符串，蓝牙设备是接收不到当前格式的数据的，需要转换成ArrayBuffer
          //     that.sendMy(that.string2buffer(res.data.data.ciphertext))//8.0
          //     // 服务器返回一个命令  我们要把这个命令写入蓝牙设备
          //   }
          // })
          // setTimeout(function () {
          //   that.setData({
          //     isDeleteRepetition: 100,
          //   })
          // }, 20000)   
  },
  judgeIsFirstConnectDevice(code) {
    if(code[9] === "0") { // 首次设置
      this.setData({
        showPage: 'setting'
      })
    } else {
      setTimeout(() => {
        this.sendMy(this.string2buffer('FEFEAC'));
      }, 300)
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
  sendMy(buffer) {
    var that = this;
    wx.writeBLECharacteristicValue({
      // 这里的 deviceId 需要在上面的 getBluetoothDevices 或 onBluetoothDeviceFound 接口中获取
      deviceId: that.data.deviceId,
      // 这里的 serviceId 需要在上面的 getBLEDeviceServices 接口中获取
      serviceId: that.data.servicesUUID,
      // 这里的 characteristicId 需要在上面的 getBLEDeviceCharacteristics 接口中获取
      characteristicId: that.data.writeId,//第二步写入的特征值
      // 这里的value是ArrayBuffer类型
      value: buffer,
      success: function (res) {
        console.log("写入成功")
        // wx.showToast({
        //   title: '写入成功'
        // })
        if(that.data.showPage === 'setting') {
          that.setData({
            showPage: 'default'
          })
        }
      },
      fail: function () {
        wx.showToast({
          title: '设置失败',
          icon: 'none'
        })
      }
    })
  },
  /**
    * 将ArrayBuffer转换成字符串
    */
  ab2hex(buffer) {
    var hexArr = Array.prototype.map.call(
      new Uint8Array(buffer),
      function (bit) {
        return ('00' + bit.toString(16)).slice(-2)
      }
    )
    return hexArr.join('');
  },
  //监听蓝牙设备是否会异常断开
  getTheBlueDisConnectWithAccident: function (e) {
    var that = this;
    wx.onBLEConnectionStateChange(function (res) {
      console.log(res)
      if (!res.connected) {
        wx.closeBluetoothAdapter({
          success: function (res) {
            wx.openBluetoothAdapter({
              success: function (res) {
              }
            })
          },
        })
        that.setData({
          remaiderString: "等待连接",
          isConnected: false,
          isFirstShow: false
        })
        // that.countdown()//开启计时
      }
    })
  },
  // 倒计时
  countdown: function () {
    var that = this;
    var time = that.data.time;
    console.log("倒计时开始")
    var interval = setInterval(function () {
      time--;
      that.setData({
        time: time
      })
      if (time == 0) {  //归0时回到60
        var countId = that.data.isConnected;
        if (!countId) {
          that.setData({
            time: 60
          })
          that.findBluetooth()
        } else {
          clearInterval(that.data.interval)
        }
      }
    }, 1000)
    that.setData({
      interval: interval
    })
  },
  // 将字符串转换成ArrayBufer
  string2buffer(str) {
    let val = "";
    if (!str) return;
    let length = str.length;
    let index = 0;
    let array = [];
    while (index < length) {
      array.push(str.substring(index, index + 2));
      index = index + 2;
    }
    val = array.join(",");
    // 将16进制转化为ArrayBuffer
    return new Uint8Array(val.match(/[\da-f]{2}/gi).map(function (h) {
      return parseInt(h, 16)
    })).buffer
  },
  // 指令转换
  transformCode(code, split) {
    let sum = 0;
    return split.map((item, index) => {
      let a;
      if(index === 0 || index === split.length - 1) {
        a = code.substr(sum * 2, item * 2)
      } else {
        a = parseInt(code.substr(sum * 2, item * 2), 16).toString();
      }
      sum += item;
      return a;
    })
  },
})