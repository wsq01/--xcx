import * as bluetoothAPI from '../../utils/bluetoothAPI'
import {
  ab2hex,
  formatTime
} from '../../utils/util'
import { reqPrinter , reqPrintInfo } from '../../service/service'
const PrinterJobs = require('../../utils/printer/printerjobs')
const printerUtil = require('../../utils/printer/printerutil')
import * as datetimepickerUtil from '../../utils/datetimepicker'

Page({
  data: {
    bluetoothList: [],
    deviceConfig: {},
    showPage: 'list',
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
    isLoad: false,
    customBarText: '搜索打印机',
    curtype:0
  },
  onLoad(options) {
    if (options.devid) {
      this.setData({
        devid: options.devid
      })
    }

      this.setData({
        curtype: options.curtype
      })
     
    
    this.initPicker()
    this.initBluetooth()
    this.reqPrintInfo()
  },
  onUnload() {
    wx.offBLEConnectionStateChange()
    wx.closeBLEConnection({
      deviceId: this.data.deviceConfig.id
    })
    wx.closeBluetoothAdapter()
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
  async initBluetooth() {
    const step1 = await bluetoothAPI.openBluetoothAdapter()
    if (!step1) this.modal('openBluetoothAdapterFalse')
    bluetoothAPI.onBLEConnectionStateChange(() => {
      wx.hideLoading()
      this.modal('onBLEConnectionStateChangeFalse')
    })
    const bluetoothList = await bluetoothAPI.startBluetoothDevicesDiscovery()
    if (!bluetoothList) this.modal('startBluetoothDevicesDiscoveryFalse')
    this.setData({
      bluetoothList
    })
    bluetoothAPI.onBluetoothDeviceFound(res => {
      this.setData({
        bluetoothList: this.data.bluetoothList.concat(res)
      })
    })
  },
  async bindClickBluetooth(e) {
    console.log(e,333)
    console.log(this.data.curtype,555)
    this.modal('beforeConnect')
    this.setData({
      customBarText: '设置打印参数',
      isLoad: true
    })
    wx.offBluetoothDeviceFound()
    wx.stopBluetoothDevicesDiscovery()
    const res1 = await bluetoothAPI.createBLEConnection(e.currentTarget.dataset.id)
    if(this.data.curtype==1){
      var res2= await bluetoothAPI.getNotifyBLECharacteristicValue2(e.currentTarget.dataset.id)
    }else{
      var res2= await bluetoothAPI.getNotifyBLECharacteristicValue3(e.currentTarget.dataset.id)
    }
    //getNotifyBLECharacteristicValue2
    if(!res2) {
      res2 = await bluetoothAPI.getNotifyBLECharacteristicValue(e.currentTarget.dataset.id)
    }
    if (!res1 || !res2) {
      wx.hideLoading()
      this.modal('connectFail')
      return
    }
    const deviceConfig = Object.assign(res2, e.currentTarget.dataset)
    this.setData({
      deviceConfig,
      showPage: 'params'
    })
    this.modal('connectSuccess')
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
    const strArr2 = ['打印时间:' + now, '温度记录如下:', 'println', 'setAlign-c']
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
      const strArr = ['println', 'setAlign-c', '签字：']
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
        printerJobs.setAlign('ct')
      } else if (item === 'println') {
        printerJobs.println()
      } else if (item === 'setSize(2, 2)') {
        printerJobs.setSize(2, 2)
      } else if (item === 'setSize(1, 1)') {
        printerJobs.setSize(1, 1)
      } else {
        if (page >= 1) {
          printerJobs.setAlign('ct')
        }
        printerJobs.print(item)
      }
    })

    let buffer = printerJobs.buffer()
    const maxChunk = 20
    const delay = 20
    for (let i = 0, j = 0, length = buffer.byteLength; i < length; i += maxChunk, j++) {
      let subPackage = buffer.slice(i, i + maxChunk <= length ? (i + maxChunk) : length)
      setTimeout(this.sendOrder, this.data.delay, subPackage)
      this.setData({
        delay: delay + this.data.delay
      })
    }
  },
  async sendOrder(buffer) {
    console.log(this.data.deviceConfig.id, this.data.deviceConfig.serviceId, this.data.deviceConfig.writeId, buffer)
    const res = await bluetoothAPI.sendOrder(this.data.deviceConfig.id, this.data.deviceConfig.serviceId, this.data.deviceConfig.writeId, buffer)
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