const LAST_CONNECTED_DEVICE = 'last_connected_device'
const PrinterJobs = require('../../utils/printer/printerjobs')
const printerUtil = require('../../utils/printer/printerutil')
import {
  formatTime
} from '../../utils/util'
import { reqPrinter , reqPrintInfo } from '../../service/service'
import * as datetimepickerUtil from '../../utils/datetimepicker'
function inArray(arr, key, val) {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i][key] === val) {
      return i
    }
  }
  return -1
}

// ArrayBuffer转16进度字符串示例
function ab2hex(buffer) {
  const hexArr = Array.prototype.map.call(
    new Uint8Array(buffer),
    function (bit) {
      return ('00' + bit.toString(16)).slice(-2)
    }
  )
  return hexArr.join(',')
}

function str2ab(str) {
  // Convert str to ArrayBuff and write to printer
  let buffer = new ArrayBuffer(str.length)
  let dataView = new DataView(buffer)
  for (let i = 0; i < str.length; i++) {
    dataView.setUint8(i, str.charAt(i).charCodeAt(0))
  }
  return buffer;
}

Page({
  data: {
    devices: [],
    connected: false,
    chs: [],
    showPage:'list',
    dateTime1: '',
    dateTime2: '',
    dateTimeArray1: [],
    dateTimeArray2: [],
    devid: '',
    sort: false,
    printData: {},
    printsetData:{},
    isDisabled: false,
    page: 1,
    delay: 0,
    isLoad: "over",
  },

  onLoad(options) {
    console.log('onLoad')
    this.openBluetoothAdapter()
    console.log('onLaunch监听小程序初始化');
    const lastDevice = wx.getStorageSync(LAST_CONNECTED_DEVICE);
    this.setData({
      lastDevice: lastDevice
     })
     if (options.devid) {
      this.setData({
        devid: options.devid
      })
    }

      this.setData({
        curtype: options.curtype
      })
      this.initPicker()
      this.reqPrintInfo()
  },  
  onUnload() {
    this.closeBluetoothAdapter()
  },
  updatesbh: function (e) {
    this.setData({
      devid:e.detail.value
    })
  },
  updatecph: function (e) {
    this.setData({
      'printsetData.chepaihao':e.detail.value
    })
  },
  updatefhdw: function (e) {
    this.setData({
      'printsetData.forwarding_unit':e.detail.value
    })
  },
  updatefhry: function (e) {
    this.setData({
      'printsetData.transport_personnel':e.detail.value
    })
  },
  updateydbh: function (e) {
    this.setData({
      'printsetData.waybill_number':e.detail.value
    })
  },
  updateshdw: function (e) {
    this.setData({
      'printsetData.receiving_unit':e.detail.value
    })
  },
  updatewpmc:function(e){
    this.setData({
      'printsetData.item_name':e.detail.value
    })
  },
  modal(type, msg) {
    const that = this
    switch (type) {
      case 'openBluetoothAdapterFalse':
        wx.showModal({
          content: '请打开蓝牙后重试',
          showCancel: false,
          success: () => {
            wx.navigateBack({
              delta: 1
            })
          }
        })
        break
      case 'onBLEConnectionStateChangeFalse':
        wx.showModal({
          content: '蓝牙已断开，是否重新连接？',
          success: res => {
            if (res.confirm) {
              wx.showLoading({
                title: '正在重新连接...'
              })
              // const reloadTimer = setTimeout(() => {
              wx.hideLoading()
              // that.initBluetooth()
              that.bindClickBluetooth({
                currentTarget: {
                  dataset: {
                    id: that.data.deviceConfig.id,
                    name: that.data.deviceConfig.name
                  }
                }
              })
              // }, 10000)
              // that.setData({ reloadTimer })
            }
          }
        })
        break
      case 'startBluetoothDevicesDiscoveryFalse':
        wx.showModal({
          showCancel: false,
          content: '搜索失败，请重新搜索',
          success() {
            wx.navigateBack({
              delta: 1
            })
          }
        })
        break
      case 'connectFail':
        wx.showModal({
          showCancel: false,
          content: '连接失败，请重新连接',
          success() {
            wx.navigateBack({
              delta: 1
            })
          }
        })
        break
      case 'connectSuccess':
        wx.showToast({
          title: '连接成功'
        })
        break
      case 'beforeConnect':
        wx.showLoading({
          title: '正在连接设备'
        })
        break
      case 'sendOrderFail':
        wx.showToast({
          title: '指令设置失败',
          icon: 'none'
        })
        break
      case 'zeroData':
        wx.showModal({
          content: '共0条数据',
          showCancel: false
        })
        break
      case 'tips':
        wx.showModal({
          title: '提示',
          content: '共' + this.data.printData.count + '条数据，是否打印？',
          success: res => {
            if (res.confirm) {
              this.printMsg()
            }
          }
        })
        break
      case 'error':
        wx.showToast({
          title: msg,
          icon: 'none'
        })
    }
  },
  openBluetoothAdapter() {
    if (!wx.openBluetoothAdapter) {
      wx.showModal({
        title: '提示',
        content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。'
      })
      return
    }
    wx.openBluetoothAdapter({
      success: (res) => {
        console.log('openBluetoothAdapter success', res)
        this.startBluetoothDevicesDiscovery()
      },
      fail: (res) => {
        console.log('openBluetoothAdapter fail', res)
        if (res.errCode === 10001) {
          wx.showModal({
            title: '错误',
            content: '未找到蓝牙设备, 请打开蓝牙后重试。',
            showCancel: false
          })
          wx.onBluetoothAdapterStateChange((res) => {
            console.log('onBluetoothAdapterStateChange', res)
            if (res.available) {
              // 取消监听，否则stopBluetoothDevicesDiscovery后仍会继续触发onBluetoothAdapterStateChange，
              // 导致再次调用startBluetoothDevicesDiscovery
              wx.onBluetoothAdapterStateChange(() => {
              });
              this.startBluetoothDevicesDiscovery()
            }
          })
        }
      }
    })
    wx.onBLEConnectionStateChange((res) => {
      // 该方法回调中可以用于处理连接意外断开等异常情况
      console.log('onBLEConnectionStateChange', `device ${res.deviceId} state has changed, connected: ${res.connected}`)
      this.setData({
        connected: res.connected
      })
      if (!res.connected) {
        wx.showModal({
          title: '错误',
          content: '蓝牙连接已断开',
          showCancel: false
        })
      }
    });
  },
  getBluetoothAdapterState() {
    wx.getBluetoothAdapterState({
      success: (res) => {
        console.log('getBluetoothAdapterState', res)
        if (res.discovering) {
          this.onBluetoothDeviceFound()
        } else if (res.available) {
          this.startBluetoothDevicesDiscovery()
        }
      }
    })
  },
  startBluetoothDevicesDiscovery() {
    if (this._discoveryStarted) {
      return
    }
    this._discoveryStarted = true
    wx.startBluetoothDevicesDiscovery({
      success: (res) => {
        console.log('startBluetoothDevicesDiscovery success', res)
        this.onBluetoothDeviceFound()
      },
      fail: (res) => {
        console.log('startBluetoothDevicesDiscovery fail', res)
      }
    })
  },
  stopBluetoothDevicesDiscovery() {
    wx.stopBluetoothDevicesDiscovery({
      complete: () => {
        console.log('stopBluetoothDevicesDiscovery')
        this._discoveryStarted = false
      }
    })
  },
  onBluetoothDeviceFound() {
    wx.onBluetoothDeviceFound((res) => {
      res.devices.forEach(device => {
        if (!device.name && !device.localName) {
          return
        }
        const foundDevices = this.data.devices
        const idx = inArray(foundDevices, 'deviceId', device.deviceId)
        const data = {}
        if (idx === -1) {
          data[`devices[${foundDevices.length}]`] = device
        } else {
          data[`devices[${idx}]`] = device
        }
        console.log(data)
        this.setData(data)
      })
    })
  },
  createBLEConnection(e) {
    const ds = e.currentTarget.dataset
    const deviceId = ds.deviceId
    const name = ds.name
    this._createBLEConnection(deviceId, name)
  },
  _createBLEConnection(deviceId, name) {
   
    this.modal('beforeConnect')
    wx.createBLEConnection({
      deviceId,
      success: () => {
        console.log('createBLEConnection success');
        this.setData({
          connected: true,
          showPage:"params",
          name,
          deviceId,
        })
        this.modal('connectSuccess')
        this.getBLEDeviceServices(deviceId)
        // wx.setStorage({
        //   key: LAST_CONNECTED_DEVICE,
        //   data: name + ':' + deviceId
        // })
      },
      complete() {
        wx.hideLoading()
      },
      fail: (res) => {
        console.log('createBLEConnection fail', res)
      }
    })
    this.stopBluetoothDevicesDiscovery()
  },
  closeBLEConnection() {
    wx.closeBLEConnection({
      deviceId: this.data.deviceId
    })
    this.setData({
      connected: false,
      showPage: "list",
      chs: [],
      canWrite: false,
      page:0
    })
  },
  getBLEDeviceServices(deviceId) {
    wx.getBLEDeviceServices({
      deviceId,
      success: (res) => {
        console.log('getBLEDeviceServices', res)
        for (let i = 0; i < res.services.length; i++) {
          if (res.services[i].isPrimary) {
            this.getBLEDeviceCharacteristics(deviceId, res.services[i].uuid)
            return
          }
        }
      }
    })
  },
  getBLEDeviceCharacteristics(deviceId, serviceId) {
    wx.getBLEDeviceCharacteristics({
      deviceId,
      serviceId,
      success: (res) => {
        console.log('getBLEDeviceCharacteristics success', res.characteristics)
        // 这里会存在特征值是支持write，写入成功但是没有任何反应的情况
        // 只能一个个去试
        for (let i = 0; i < res.characteristics.length; i++) {
          const item = res.characteristics[i]
          if (item.properties.write) {
            this.setData({
              canWrite: true
            })
            this._deviceId = deviceId
            this._serviceId = serviceId
            this._characteristicId = item.uuid
            break;
          }
        }
      },
      fail(res) {
        console.error('getBLEDeviceCharacteristics', res)
      }
    })
  },
  writeBLECharacteristicValue() {
    let printerJobs = new PrinterJobs();
    printerJobs
      .print('2018年12月5日17:34')
      .print(printerUtil.fillLine())
      .setAlign('ct')
      .setSize(2, 2)
      .print('#20饿了么外卖')
      .setSize(1, 1)
      .print('切尔西Chelsea')
      .setSize(2, 2)
      .print('在线支付(已支付)')
      .setSize(1, 1)
      .print('订单号：5415221202244734')
      .print('下单时间：2017-07-07 18:08:08')
      .setAlign('lt')
      .print(printerUtil.fillAround('一号口袋'))
      .print(printerUtil.inline('意大利茄汁一面 * 1', '15'))
      .print(printerUtil.fillAround('其他'))
      .print('餐盒费：1')
      .print('[赠送康师傅冰红茶] * 1')
      .print(printerUtil.fillLine())
      .setAlign('rt')
      .print('原价：￥16')
      .print('总价：￥16')
      .setAlign('lt')
      .print(printerUtil.fillLine())
      .print('备注')
      .print("无")
      .print(printerUtil.fillLine())
      .println();

    let buffer = printerJobs.buffer();
    console.log('ArrayBuffer', 'length: ' + buffer.byteLength, ' hex: ' + ab2hex(buffer));
    // 1.并行调用多次会存在写失败的可能性
    // 2.建议每次写入不超过20字节
    // 分包处理，延时调用
    const maxChunk = 20;
    const delay = 20;
    for (let i = 0, j = 0, length = buffer.byteLength; i < length; i += maxChunk, j++) {
      let subPackage = buffer.slice(i, i + maxChunk <= length ? (i + maxChunk) : length);
      setTimeout(this._writeBLECharacteristicValue, j * delay, subPackage);
    }
  },
  _writeBLECharacteristicValue(buffer) {
    wx.writeBLECharacteristicValue({
      deviceId: this._deviceId,
      serviceId: this._serviceId,
      characteristicId: this._characteristicId,
      value: buffer,
      success(res) {
        console.log('writeBLECharacteristicValue success', res)
      },
      fail(res) {
        console.log('writeBLECharacteristicValue fail', res)
      }
    })
  },
  closeBluetoothAdapter() {
    wx.closeBluetoothAdapter()
    this._discoveryStarted = false
  },

  createBLEConnectionWithDeviceId(e) {
    // 小程序在之前已有搜索过某个蓝牙设备，并成功建立连接，可直接传入之前搜索获取的 deviceId 直接尝试连接该设备
    const device = this.data.lastDevice
    if (!device) {
      return
    }
    const index = device.indexOf(':');
    const name = device.substring(0, index);
    const deviceId = device.substring(index + 1, device.length);
    console.log('createBLEConnectionWithDeviceId', name + ':' + deviceId)
    wx.openBluetoothAdapter({
      success: (res) => {
        console.log('openBluetoothAdapter success', res)
        this._createBLEConnection(deviceId, name)
      },
      fail: (res) => {
        console.log('openBluetoothAdapter fail', res)
        if (res.errCode === 10001) {
          wx.showModal({
            title: '错误',
            content: '未找到蓝牙设备, 请打开蓝牙后重试。',
            showCancel: false
          })
          wx.onBluetoothAdapterStateChange((res) => {
            console.log('onBluetoothAdapterStateChange', res)
            if (res.available) {
              // 取消监听
              wx.onBluetoothAdapterStateChange(() => {
              });
              this._createBLEConnection(deviceId, name)
            }
          })
        }
      }
    })
  },
  async reqPrinter() {
    const startTime = formatDate(false, this.data.dateTimeArray1, this.data.dateTime1)
    const endTime = formatDate(false, this.data.dateTimeArray2, this.data.dateTime2)
    const res = await reqPrinter(this.data.devid, this.data.sort, startTime, endTime, this.data.page,this.data.printsetData.chepaihao ,this.data.printsetData.forwarding_unit,this.data.printsetData.receiving_unit,this.data.printsetData.transport_personnel,this.data.printsetData.waybill_number,this.data.printsetData.item_name)
    if (res.data.code === 0) {
      this.setData({ printData: res.data.data })
    } else {
      this.modal('error', res.data.message)
    }
  },
  async reqPrintInfo() {
    const res = await reqPrintInfo(this.data.devid)
    if (res.data.code === 0) {
      this.setData({ printsetData: res.data.data })
    } else {
      this.modal('error', res.data.message)
    }
  },
  bindChangeSwitch(e) {
    this.setData({ sort: e.detail.value })
  },
  bindSendOrder() {
    this.setData({ page: 0 })
    wx.showLoading({ title: '加载中...' })
    this.reqPrinter()
    setTimeout(() => {
      wx.hideLoading()
      const count = this.data.printData.count ? this.data.printData.count : 0
      if (count === 0) {
        this.modal('zeroData')
        return
      }
      this.modal('tips')
    }, 800)
  },
  printMsg() {
    wx.showLoading({ title: '打印中...' })
    const now = formatTime(new Date())
    const mobile = wx.getStorageSync('mobile')
    const strArr1 = ['println', 'setSize(2, 2)', this.data.printData.gongsimingcheng, 'setSize(1, 1)', '用户名:' + mobile, 'ID号:' + this.data.devid]
    if(this.data.printData.chepaihao.length>0){
      strArr1.push( '车牌号:' + this.data.printData.chepaihao)
    }
    if(this.data.printsetData.forwarding_unit.length>0){
      strArr1.push('发货单位:' + this.data.printsetData.forwarding_unit)
    }
    if(this.data.printsetData.receiving_unit.length>0){
      strArr1.push('收货单位:' + this.data.printsetData.receiving_unit)
    }
    if(this.data.printsetData.transport_personnel.length>0){
      strArr1.push('运输人员:' + this.data.printsetData.transport_personnel)
    }
    if(this.data.printsetData.waybill_number.length>0){
      strArr1.push('运单编号:' + this.data.printsetData.waybill_number)
    }
    if(this.data.printsetData.item_name.length>0){
      strArr1.push('物品名称:' + this.data.printsetData.item_name)
    }
    const strArr2 = ['打印时间:' + now, '温度记录如下:', 'println', 'setAlign-l']
    const strArr = strArr1.concat(strArr2);
   
    if (this.data.printData.model_type === 'TT') {
      strArr.push('    时间    |温度1 |温度2')
    } else if (this.data.printData.model_type === 'TH') {
      strArr.push('    时间    | 温度 | 湿度')
    } else {
      strArr.push('        时间        | 温度')
    }
    this.writeBLECharacteristicValue(strArr, 0)
    this.judgedListLength()
  },
  async judgedListLength() {
    const { count, page, model_type } = this.data.printData
    const listLength = this.data.printData.data.length
    let dataList
    if (model_type === 'TT') {
      dataList = this.data.printData.data.map(item => `${item.time.slice(5, 16)} | ${item.temperature01} | ${item.temperature02}`)
    } else if (model_type === 'TH') {
      dataList = this.data.printData.data.map(item => `${item.time.slice(5, 16)} | ${item.temperature01} | ${item.humidity}`)
    } else {
      dataList = this.data.printData.data.map(item => `${item.time.slice(5, 16)} | ${item.temperature01}`)
    }
    this.writeBLECharacteristicValue(dataList, page)
    if (count > (page - 1) * 1000 + listLength) {
      this.setData({
        page: ++this.data.page
      })
      const startTime = formatDate(false, this.data.dateTimeArray1, this.data.dateTime1)
      const endTime = formatDate(false, this.data.dateTimeArray2, this.data.dateTime2)
      const res = await reqPrinter(this.data.devid, this.data.sort, startTime, endTime, this.data.page,this.data.printsetData.chepaihao ,this.data.printsetData.forwarding_unit,this.data.printsetData.receiving_unit,this.data.printsetData.transport_personnel,this.data.printsetData.waybill_number,this.data.printsetData.item_name)
      if (res.data.code === 0) {
        this.setData({
          printData: res.data.data
        })
        this.judgedListLength()
      } else {
        this.modal('error', res.data.message)
      }
    }
    if (count === (page - 1) * 1000 + listLength) { 
      const strArr1 = ['setSize(1, 1)', '最高温度:' +  this.data.printData.statistics[0].max_temperature01, '最低温度:' +  this.data.printData.statistics[0].min_temperature01, '平均温度:' +  this.data.printData.statistics[0].avg_temperature01]   
      const strArr2 = ['println', 'setAlign-l', '','签字:','','']
      const strArr=strArr1.concat(strArr2);
      this.writeBLECharacteristicValue(strArr, ++this.data.page)
      wx.hideLoading()
      wx.showToast({ title: '打印完成' })
    }
  },
  writeBLECharacteristicValue(strArr, page) {
    let printerJobs = new PrinterJobs()
    strArr.forEach(item => {
      if (item === 'println') {
        printerJobs.print(printerUtil.fillLine())
      } else if (item === 'setAlign-c') {
        printerJobs.setAlign('lt')
      } else if (item === 'setAlign-l') {
        printerJobs.setAlign('lt')
      }else if (item === 'println') {
        printerJobs.println()
      } else if (item === 'setSize(2, 2)') {
        printerJobs.setSize(2, 2)
      } else if (item === 'setSize(1, 1)') {
        printerJobs.setSize(1, 1)
      } else {
        if (page >= 1) {
          printerJobs.setAlign('lt')
        }
        printerJobs.print(item)
      }
    })

    let buffer = printerJobs.buffer()
    const maxChunk = 20
    const delay = 20
    for (let i = 0, j = 0, length = buffer.byteLength; i < length; i += maxChunk, j++) {
      let subPackage = buffer.slice(i, i + maxChunk <= length ? (i + maxChunk) : length)
      setTimeout(this._writeBLECharacteristicValue, this.data.delay, subPackage)
      this.setData({
        delay: delay + this.data.delay
      })
    }
  },
  async sendOrder(buffer) {
    console.log(this._deviceId, this._serviceId, this.data.deviceConfig.writeId, buffer)
    const res = await bluetoothAPI.sendOrder(this._deviceId, this._serviceId, this.data.deviceConfig.writeId, buffer)
    if (!res) this.modal('sendOrderFail')
  },
  initPicker() {
    const obj = datetimepickerUtil.dateTimePickerWithS(2010)
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
    })
  },
  changeDateTimeColumn1(e) {
    var arr = this.data.dateTime1,
      dateArr = this.data.dateTimeArray1
    arr[e.detail.column] = e.detail.value
    dateArr[2] = datetimepickerUtil.getMonthDay(dateArr[0][arr[0]], dateArr[1][arr[1]])
    this.setData({
      dateTimeArray1: dateArr,
      dateTime1: arr
    })
  },
  changeDateTime2(e) {
    this.setData({
      dateTime2: e.detail.value
    })
  },
  changeDateTimeColumn2(e) {
    var arr = this.data.dateTime2
    var dateArr = this.data.dateTimeArray2
    arr[e.detail.column] = e.detail.value
    dateArr[2] = datetimepickerUtil.getMonthDay(dateArr[0][arr[0]], dateArr[1][arr[1]])
    this.setData({
      dateTimeArray2: dateArr,
      dateTime2: arr
    })
  }

})
function formatDate(isData, dateTimeArray, dateTime) {
  if (isData) {
    return '20' + dateTimeArray[3] + '-' + dateTimeArray[4].padStart(2, '0') + '-' + dateTimeArray[5].padStart(2, '0') + ' ' + dateTimeArray[6].padStart(2, '0') + ':' + dateTimeArray[7].padStart(2, '0')
  }
  // y/m/d h:m
  return dateTimeArray[0][dateTime[0]] + '-' + dateTimeArray[1][dateTime[1]] + '-' + dateTimeArray[2][dateTime[2]] + ' ' + dateTimeArray[3][dateTime[3]] + ':' + dateTimeArray[4][dateTime[4]] + ':' + dateTimeArray[5][dateTime[5]]
}