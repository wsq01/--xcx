import * as bluetoothUtil from '../../../utils/bluetooth1.js';
import dateTimePicker from '../../../utils/datetimepicker.js';

Page({
  data: {
    findBluetoothTimer: null,
    mobile: wx.getStorageSync('mobile'),
    servicesUUID: '',
    deviceId: '',
    bluetoothDeviceName: '',
    characteristicId: '0000FFF1-0000-1000-8000-00805F9B34FB',
    writeId: '0000FFF2-0000-1000-8000-00805F9B34FB',
    instructs: {
      getParams: 'FEF90a0d', // 请求设备参数
      getTotal: 'FEFE0a0d', // 获取数据总条数
    },
    showPage: '',
    totalNum: 0, // 总数据条数
    dateTime1: '',
    dateTime2: '',
    dateTimeArray1: [],
    dateTimeArray2: [],
  },
  onLoad(options) {
    if (options.id) {
      this.setData({
        bluetoothDeviceName: options.id
      })
    }
    this.getOpenId();
    this.initBluetooth();
  },
  // 初始化蓝牙
  async initBluetooth() {
    // 开启蓝牙适配器
    let isOpenBluetoothAdapterSuccess = await bluetoothUtil.openBluetoothAdapter();
    if(isOpenBluetoothAdapterSuccess) {
      // 搜索蓝牙设备获取deviceid
      let deviceId = await bluetoothUtil.findBluetooth(this.data.bluetoothDeviceName);
      // 没找到设备
      if (!deviceId) {
        const findBluetoothTimer = setTimeout(() => {
          this.initBluetooth()
        }, 3000)
        this.setData({ findBluetoothTimer })
      } else {
        let res = await bluetoothUtil.connetBlue(deviceId);
        let servicesUUID = await bluetoothUtil.getServiceId(deviceId, this.data.characteristicId);
        this.setData({
          deviceId,
          servicesUUID,
          isOverTime: true
        })
        // 监听蓝牙状态
        bluetoothUtil.monitorTheBlue(this.data.isFirstShow);
        // 监听设备返回值
        wx.onBLECharacteristicValueChange((res) => {
          this.handleBLEValue(ab2hex(res.value));
        })
        // 请求设备参数
        setTimeout(() => {
          this.sendMy(string2buffer(this.data.instructs.getParams));
        }, 300)
      }
    } else {
      wx.showToast({
        title: '请开启蓝牙',
        icon: 'none',
        duration: 3000,
        success(res) {
          wx.navigateBack({ delta: 1 })
        }
      })
    }
  },
  // 处理蓝牙返回值 
  handleBLEValue(nonceId) {
    console.log(nonceId)
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
  handleFEFA(nonceId) {
    const code = transformCode(nonceId, [2, 1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 2]);
    code[3] === '0' ? code[3] = '1' : code[3];
    const startDate = '20' + code[1] + '/' + code[2].padStart(2, '0') + '/' + code[3].padStart(2, '0') + ' ' + code[4].padStart(2, '0') + ':' + code[5].padStart(2, '0') + ':' + code[6].padStart(2, '0');
    this.setData({
      deviceParams: code,
      startDate
    })
    this.judgeIsFirstConnectDevice(code[9]);
  },
  // 获取数据总条数
  handleFEFE(nonceId) {
    const code = transformCode(nonceId, [2, 4, 1, 2]);
    this.setData({
      totalNum: code[1]
    })
  },
  // 获取openid
  async getOpenId() {
    let res = await reqOpenid();
    wx.setStorageSync('openid', JSON.parse(res.data.data).openid);
  },
  sendMy(buffer) {
    wx.writeBLECharacteristicValue({
      deviceId: this.data.deviceId,
      serviceId: this.data.servicesUUID,
      characteristicId: this.data.writeId,
      value: buffer,
      success(res) {
        console.log("写入成功");
      },
      fail: function () {
        wx.showToast({
          title: '设置失败!',
          icon: 'none'
        })
      }
    })
  },
  // 判断是否是新设备
  judgeIsFirstConnectDevice(code) {
    if (code === "0") {
      this.setData({
        showPage: 'setting'
      })
    } else {
      this.setData({
        showPage: 'default'
      })
      this.sendMy(string2buffer(this.data.instructs.getTotal));
      this.initDateTimePicker();
    }
  },
  radioChange1(e) {
    this.data.alarmItems.forEach((item, index) => {
      if (item.name === e.detail.value) {
        this.setData({
          ['alarmItems[' + index + '].checked']: true
        })
      } else {
        this.setData({
          ['alarmItems[' + index + '].checked']: false
        })
      }
    })
  },
  radioChange2(e) {
    this.data.alarmItems2.forEach((item, index) => {
      if (item.name === e.detail.value) {
        this.setData({
          ['alarmItems2[' + index + '].checked']: true
        })
      } else {
        this.setData({
          ['alarmItems2[' + index + '].checked']: false
        })
      }
    })
  },
  initDateTimePicker() {
    let params = this.data.deviceParams;
    const startDate = ['20' + params[1], params[2].padStart(2, '0'), params[3].padStart(2, '0'), params[4].padStart(2, '0'), params[5].padStart(2, '0'), params[6].padStart(2, '0')];
    const obj = dateTimePicker(startDate);
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
  changeDateTime2(e) {
    this.setData({
      dateTime2: e.detail.value
    });
  },
  changeDateTimeColumn2(e) {
    var arr = this.data.dateTime2, dateArr = this.data.dateTimeArray2;
    arr[e.detail.column] = e.detail.value;
    dateArr[2] = dateTimePicker.getMonthDay(dateArr[0][arr[0]], dateArr[1][arr[1]]);
    this.setData({
      dateTimeArray2: dateArr,
      dateTime2: arr
    });
  }
})