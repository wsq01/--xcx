
import * as bluetoothAPI from '../../../utils/bluetoothAPI'
import { formatTime } from '../../../utils/util.js'
import { reqBindDev, reqOpenid, reqJudgeBluetoothName, reqBluetoothNameExist } from '../../../service/service.js'
import * as datetimepickerUtil from '../../../utils/datetimepicker.js'
import {
  string2buffer,
  ab2hex,
  transformCode,
  generateCode,
  transToHexadecimal
} from '../../../utils/util.js'
const app = getApp()

Page({
  data: {
    CustomBar: app.globalData.CustomBar,
    device: {
      id: '',
      name: ''
    },
    isOpen: false,
    closeTime: 120,
    deviceConfig: {},
    deviceParams: {},
    modalName: null,
    isShowLoading: false,
    mobile: '',
    instructs: {
      instruct_05: ['7E7E', '03', '05', 'E7E7'],
      instruct_20: 'FEFE0a0d'
    },
    showPage: '',
    totalNum: 0,
    percent: 0,
    startDate: '',
    historyList: [],
    isClick: false,
    menuList: [
      {
        text: '参数配置',
        tap: 'params'
      },
      {
        text: '历史数据',
        tap: 'history'
      },
      {
        text: '绑定设备',
        tap: 'binddevice'
      },
      {
        text: '上传云端',
        tap: 'upload'
      },
      {
        text: '恢复出厂设置',
        tap: 'factory'
      }
    ],
    tempParams: {
      tempAlarmHeigh: 8,
      tempAlarmLow: 2,
      tempStartTime: formatTime(new Date()),
      tempEndTime: formatTime(new Date()),
      tempDataLength: 0,
      tempDataStartNum: 0
    },
    password: '',
    getTotalSuccess: false,
    isCheckTimeSuccess: 0,
    checkTimeTimer: null,
    closeTimeTimer: null,
    dateTime1: '',
    dateTime2: '',
    dateTimeArray1: [],
    dateTimeArray2: [],
    alarmItems1: [{
      name: 1,
      checked: true,
      value: '零上'
    }, {
      name: -1,
      checked: false,
      value: '零下'
    }],
    alarmItems2: [{
      name: 1,
      checked: true,
      value: '零上'
    }, {
      name: -1,
      checked: false,
      value: '零下'
    }],
    alarmHeigh: 0,
    alarmLow: 0,
    isadmin:false,
    instructTimer: null,
    connectTime: 30,
    connectDeviceTimer: null
  },
  onUnload() {
    wx.hideLoading()
    clearInterval(this.data.checkTimeTimer)
    clearInterval(this.data.connectDeviceTimer)
    clearInterval(this.data.instructTimer)
    clearInterval(this.data.closeTimeTimer)
    wx.offBLEConnectionStateChange(() => {})
    wx.closeBLEConnection({ deviceId: this.data.device.id })
    wx.closeBluetoothAdapter()
  },
  onLoad(options) {
    let personadmin=[{
      name:"王久海",phone:"18911910456"},
      {name:"张园",phone:"19142641086"},
      {name:"薛明",phone:"18301695150"},
      {name:"胡经理",phone:"13651164132"},
      {name:"邢二彬",phone:"13240108346"},
      {name:"唐经理",phone:"18101282980"},
      {name:"孙总",phone:"13520357219"},
      {name:"郭志强",phone:"17718500803"},
      {name:"长波",phone:"18519773728"},
    ]
    const mobile = wx.getStorageSync('mobile') || '';
    let _result = personadmin.some(function(item) {
			if(item.phone == mobile) {
				return true;
			}
		})
    if(_result){
     //有权限恢复出厂
      this.setData({ isadmin:true })
    }else{
      //无权限恢复出厂
      this.setData({ isadmin:false })
    }
    this.judgeIsOpenLocation(() => {
      if (options.id) {
        this.setData({ 
          'device.name': options.id
        })
        wx.setStorageSync('bluetoothDeviceName', options.id)

        this.initBluetooth()
        this.getOpenId()
      } else {
        this.modal('noDeviceId')
      }
    })
  },
  initSetBluetoothName() {
    let name = wx.getStorageSync('setBluetoothName')
    if(name) {
      name = name - 0 + 1 + ''
    } else {
      name = ''
    }
    this.setData({ 'device.name': name })
  },
  bindShowParams() {
    this.setData({ isOpen: !this.data.isOpen })
  },
  // 跳转
  toPage(e) {
    this.resetCloseTime()
    this.setCloseTime()
    if(e.currentTarget.dataset.tap === 'history') {
      this.bindSelectDate()
    } else if(e.currentTarget.dataset.tap === 'binddevice') {
      this.judgeIsLogin()
    } else if(e.currentTarget.dataset.tap === 'factory') {
      this.setData({ modalName: 'inputPwd' })
    }
  },
  // 恢复出厂设置
  bindPasswordSubmit() {
    if(this.data.password === '123') {
      this.sendOrder(string2buffer(generateCode(['7E7E', '03', '04', 'E7E7'])))
      this.hideModal()
      wx.showLoading({ title: '恢复中...' })
      this.resetCloseTime()
      this.setCloseTime()
      const instructTimer = setInterval(() => {
        if(this.data.isAcceptSuccess === 3) {
          clearInterval(this.data.instructTimer)
          this.modal('setInstructFail')
        } else {
          this.setData({
            isAcceptSuccess: this.data.isAcceptSuccess + 1
          })
          this.sendOrder(string2buffer(generateCode(['7E7E', '03', '04', 'E7E7'])))
        }
      }, 5000)
      this.setData({ instructTimer })
    } else {
      this.modal('passwordError')
    }
  },
  // 移动端请求温度历史数据
  bindSelectDate() {
    if(this.data.tempParams.tempDataLength === 0) {
      this.modal('noHistory')
      return
    }
    this.setData({
      modalName: 'progress',
      historyList: [],
      percent: 0
    })
    let {tempDataStartNum, tempDataLength } = this.data.tempParams
    tempDataStartNum = transToHexadecimal(tempDataStartNum, 8)
    tempDataLength = transToHexadecimal(tempDataLength, 8)
    const startArr = [], endArr = []
    for(let i = 0; i < tempDataStartNum.length; i = i + 2) {
      startArr.push(tempDataStartNum[i] + tempDataStartNum[i + 1])
    }
    for(let i = 0; i < tempDataLength.length; i = i + 2) {
      endArr.push(tempDataLength[i] + tempDataLength[i + 1])
    }
    this.sendOrder(string2buffer(generateCode(['7E7E', '0B', '03', ...startArr, ...endArr, 'E7E7'], [0, 0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 0])))
    this.resetCloseTime()
  },
  modal(type, msg) {
    switch(type) {
      case 'openBluetoothAdapterFalsy':
        wx.showModal({
          content: '请打开蓝牙后重试',
          showCancel: false,
          success: () => {
            wx.navigateBack({ delta: 1 })
          }
        })
        break
      case 'onBLEConnectionStateChangeFalsy':
        wx.showModal({
          content: '蓝牙已断开，是否重新连接？',
          success: res => {
            if (res.confirm) {
              wx.showLoading({ title: '正在重新连接...' })
              wx.hideLoading()
              this.setData({ modalName: null })
              this.connectBluetooth({ currentTarget: { dataset: { id: this.data.device.id, name: this.data.device.name }}})
            }else{
              wx.navigateBack({ delta: 2 })
            }
          }
        })
        break
      case 'startBluetoothDevicesDiscoveryFalsy':
        wx.showModal({
          showCancel: false,
          content: '搜索失败，请重新搜索',
          success () {
            wx.navigateBack({ delta: 1 })
          }
        })
        break
      case 'connectFail':
        wx.showModal({
          showCancel: false,
          content: '连接失败，请重新连接',
          success () {
            wx.hideLoading()
            wx.navigateBack({ delta: 1 })
          }
        })
        break
      case 'connectSuccess':       
        wx.showToast({ title: '连接成功!' })
      break
      case 'beforeConnect':
        wx.showLoading({ title: '正在连接设备' })
        break
      case 'loading':
          wx.showLoading({ title: '拼命加载中...' })
          break
      case 'sendOrderFail':
        wx.showToast({ title: '指令设置失败!', icon: 'none' })
        break
      case 'errorOrder':
        wx.showToast({ title: '指令错误!', icon: 'none' })
        break
      case 'setNameSuccess':
        wx.showToast({  title: '设置成功!' })
        break
      case 'passwordError':
        wx.showToast({ title: '密码错误!', icon: 'none' })
        break
      case 'beginRecord':
        wx.showModal({
          content: '是否开始记录数据？',
          success: res => {
            if(res.confirm) {
              const now = new Date()
              const dateArr = [parseInt(now.getFullYear().toString().slice(2)), (now.getMonth() + 1), now.getDate(), now.getDay(), now.getHours(), now.getMinutes(), now.getSeconds()]
              const deviceParams = [this.data.deviceParams[0], this.data.deviceParams[1], this.data.deviceParams[2], now.getFullYear().toString().slice(2), (now.getMonth() + 1).toString(), now.getDate().toString(), now.getHours().toString(), now.getMinutes().toString(), now.getSeconds().toString(), this.data.deviceParams[9], this.data.deviceParams[10], this.data.deviceParams[11], this.data.deviceParams[12], this.data.deviceParams[13]]
              this.setData({
                'tempParams.tempStartTime': formatTime(now),
                'tempParams.tempEndTime': formatTime(now),
                deviceParams,
                startDate: formatTime(now)
              })
              this.modal('loading')
              console.log(generateCode(['7E7E', '0A', '00', ...dateArr, 'E7E7'], [0, 0, 0, 2, 2, 2, 2, 2, 2, 2, 0]))
              this.sendOrder(string2buffer(generateCode(['7E7E', '0A', '00', ...dateArr, 'E7E7'], [0, 0, 0, 2, 2, 2, 2, 2, 2, 2, 0])))
              const instructTimer = setInterval(() => {
                if(this.data.isAcceptSuccess === 3) {
                  clearInterval(this.data.instructTimer)
                  this.modal('setInstructFail')
                } else {
                  this.setData({
                    isAcceptSuccess: this.data.isAcceptSuccess + 1
                  })
                  this.sendOrder(string2buffer(generateCode(['7E7E', '0A', '00', ...dateArr, 'E7E7'], [0, 0, 0, 2, 2, 2, 2, 2, 2, 2, 0])))
                }
              }, 5000)
              this.setData({ instructTimer })
            } else {
              wx.navigateBack({ delta: 1 })
            }
          }
        })
        break
      case 'factoryResetSuccess':
        wx.hideLoading()
        wx.showToast({
          title: '恢复成功!',
          duration: 2000,
          success() {
            setTimeout(() => {
              wx.navigateBack({ delta: 1 })
            }, 2000)
          }
        })
        break
      case 'factoryResetFail':
        wx.showToast({ title: '恢复失败!', icon: 'none' })
        break
      case 'noHistory':
        wx.showToast({ title: '暂无数据', icon: 'none' })
        break
      case 'noDeviceId':
        wx.showModal({
          content: '无设备号',
          showCancel: false,
          success() {
            wx.navigateBack({ delta: 1 })
          }
        })
        break
      case 'addDeviceSuccess':
        wx.showToast({
          title: '添加成功!'
        })
        break
      case 'addDeviceFail':
        wx.showToast({ title: msg, icon: 'none' })
        break
      case 'setInstructFail':
        wx.showModal({
          content: '设置失败，请重新连接',
          showCancel: false,
          success: res => {
            wx.navigateBack({
              delta: 1
            })
          }
        })
        break
      case 'unLogin':
        wx.showModal({
          content: '账号未登录，是否前往登录？',
          success: res => {
            if (res.confirm) {
              this.resetCloseTime()
              wx.navigateTo({
                url: '../../mobile/verify/verify?handle=bind',
              })
            }
          }
        })
        break
      case 'setDeviceNameFalsy':
        wx.showToast({ title: '请输入7位设备号', icon: 'none' })
        break
      case 'toParamsFail':
        wx.showToast({ title: '正在获取数据，请稍后重试', icon: 'none' })
        break
      case 'openLocation':
        wx.showModal({
          content: '请开启位置信息后重试',
          showCancel: false,
          success: res => {
            wx.navigateBack({ delta: 1 })
          }
        })
        break
      case 'checkingTime':
        wx.showToast({
          title: '校时中，请稍候重试',
          icon: 'none'
        })
        break
      case 'slte':
        wx.showModal({
          content: '开始时间不得早于' + msg,
          showCancel: false
        })
        break
      case 'stet3':
          wx.showModal({
            content: '开始与结束时间请在3天以内',
            showCancel: false
          })
          break
      case 'sgte':
        wx.showModal({
          content: '结束时间不得早于开始时间',
          showCancel: false
        })
        break
      case 'egtde':
        wx.showModal({
          content: '结束时间不得晚于' + msg,
          showCancel: false
        })
        break
    }
  },
  judgeIsOpenLocation(callback) {
    try {
      const res = wx.getSystemInfoSync()
      if(!res.locationEnabled) {
        wx.hideLoading()
        this.modal('openLocation')
      } else {
        typeof callback === 'function' && callback()
      }
    } catch (e) {
      
    }
  },
  // 初始化蓝牙
  async initBluetooth() {
    this.setConnectTime()
    wx.showLoading({ title: '正在搜索设备' })
    const isOpenBluetooth = await bluetoothAPI.openBluetoothAdapter()
    if (!isOpenBluetooth) this.modal('openBluetoothAdapterFalsy')
    bluetoothAPI.onBLEConnectionStateChange(res => {
      wx.hideLoading()
      this.resetCloseTime()
      this.modal('onBLEConnectionStateChangeFalsy')
    })
    const bluetoothList = await bluetoothAPI.startBluetoothDevicesDiscovery()
    if (!bluetoothList) this.modal('startBluetoothDevicesDiscoveryFalsy')
    for (let i = 0; i < bluetoothList.length; i++) {
      if ((bluetoothList[i].name && bluetoothList[i].name === this.data.device.name) || bluetoothList[i].localName && bluetoothList[i].localName === this.data.device.name) {
        this.setData({ 'device.id': bluetoothList[i].deviceId })
        this.connectBluetooth()
      }
    }
    if(!this.data.device.id) {
      bluetoothAPI.onBluetoothDeviceFound(res => {
        if((res.name && res.name === this.data.device.name) || (res.localName && res.localName === this.data.device.name)) {
          this.setData({ 'device.id': res.deviceId })
          this.connectBluetooth()
        }
      })
    }
  },
  // 连接蓝牙
  async connectBluetooth () {
    clearInterval(this.data.connectDeviceTimer)
    this.modal('beforeConnect')
    wx.offBluetoothDeviceFound()
    wx.stopBluetoothDevicesDiscovery()
    const res1 = await bluetoothAPI.createBLEConnection(this.data.device.id)
    const deviceConfig = await bluetoothAPI.getNotifyBLECharacteristicValue2(this.data.device.id)
    if(!res1 || !deviceConfig) {
      wx.hideLoading()
      this.modal('connectFail')
      return
    }
    this.setData({ deviceConfig })
    wx.onBLECharacteristicValueChange((res) => {
      this.handleBLEValue(ab2hex(res.value))
    })
    setTimeout(() => {
      this.judgIsNewDevice()
      this.modal('connectSuccess')
    }, 500)
  },
  // 判断是否是0000设备
  judgIsNewDevice() {
    if(this.data.device.name === '0000000') {
      this.initSetBluetoothName()
      this.setData({ modalName: 'setName' })
    } else {
      this.modal('loading')
      this.sendOrder(string2buffer(generateCode(this.data.instructs.instruct_05)))
      const instructTimer = setInterval(() => {
        if(this.data.isAcceptSuccess === 3) {
          clearInterval(this.data.instructTimer)
          this.modal('setInstructFail')
        } else {
          this.setData({
            isAcceptSuccess: this.data.isAcceptSuccess + 1
          })
          this.sendOrder(string2buffer(generateCode(this.data.instructs.instruct_05)))
        }
      }, 5000)
      this.setData({ instructTimer })
    }
  },
  // 输入设备名
  bindInputName(e) {
    this.setData({ 'device.name': e.detail.value })
  },
  async reqBluetoothNameExist() {
    console.log("cz")
    const mobile = wx.getStorageSync('mobile') || ''
    const res = await reqBluetoothNameExist(this.data.device.name, mobile)
    if(res.data.code === 0) {
      this.reqJudgeBluetoothName()
    } else {
      wx.showToast({
        title: res.data.data
      })
    }

  },
  async reqJudgeBluetoothName() {
    if(this.data.device.name.length !== 7) {
      this.modal('setDeviceNameFalsy')
      return 
    }
    const mobile = wx.getStorageSync('mobile') || ''
    if(!mobile) {
      this.modal('unLogin')
      return
    }
    const res = await reqJudgeBluetoothName(this.data.device.name, mobile)
    if(res.data.code === 0) {
      this.bindSetName()
    } else {
      wx.showToast({
        title: res.data.data
      })
    }
  },
  // 设置设备名
  bindSetName() {
    this.setData({ isShowLoading: true })
    wx.setStorageSync('setBluetoothName', this.data.device.name)
    // 0010 0000 0003 0002
    const res = (parseInt(this.data.device.name)).toString(16).padStart(8, '0')
    const arr = []
    for(let i = 0; i < res.length; i = i + 2) {
      arr.push(res[i] + res[i + 1])
    }
    this.modal('loading')
    console.log(generateCode(['7E7E', '07', '06', ...arr, 'E7E7'], [0, 0, 0, 2, 2, 2, 2, 0]))
    this.sendOrder(string2buffer(generateCode(['7E7E', '07', '06', ...arr, 'E7E7'], [0, 0, 0, 2, 2, 2, 2, 0])))
    const instructTimer = setInterval(() => {
      if(this.data.isAcceptSuccess === 3) {
        clearInterval(this.data.instructTimer)
        this.modal('setInstructFail')
      } else {
        this.setData({
          isAcceptSuccess: this.data.isAcceptSuccess + 1
        })
        this.sendOrder(string2buffer(generateCode(['7E7E', '07', '06', ...arr, 'E7E7'], [0, 0, 0, 2, 2, 2, 2, 0])))
      }
    }, 5000)
    this.setData({ instructTimer })
  },
  hideModal() {
    this.setData({ modalName: null })
  },
  // 发送指令
  async sendOrder(buffer) {
    const res = await bluetoothAPI.sendOrder(this.data.device.id, this.data.deviceConfig.serviceId, this.data.deviceConfig.writeId, buffer)
    if(!res) this.modal('sendOrderFail')
  },
  // 处理蓝牙返回值 
  handleBLEValue(nonceId) {
    console.log(nonceId)
    switch (nonceId.slice(6, 8)) {
      case '20':
        this.handle20(nonceId)
        break
      case '21':
        this.handle21(nonceId)
        break
      case '22':
        this.handle22(nonceId)
        break
      case '23':
        this.handle23()
        break
      case '24':
        this.handle24()
        break
      case '25':
        this.handle25()
        break
      case '26':
        this.handle26()
        break
      case '27':
        this.handle27()
        break
      case '28':
        this.handle28()
        break
      case '30':
        this.handle30(nonceId)
        break
      case '31':
        this.handle31(nonceId)
        break
      default:
        this.modal('errorOrder')
    }
  },
  // 设备返回参数
  handle20(nonceId) {
    this.bindInstructTimer()
    const code = transformCode(nonceId, [2, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 1, 1, 1, 1, 2])
    code[4] === '0' ? code[4] = '1' : code[4]
    this.setData({ deviceParams: code })
    this.judgeIsFirstConnectDevice(code[11])
  },
  handle28() {
    this.hideModal()
    this.setData({ isShowLoading: false })
    this.modal('errorOrder')
  },
  // 判断是否是新设备
  judgeIsFirstConnectDevice(code) {
    if (code === "0") {
      this.modal('beginRecord')
    } else {
      const params = this.data.deviceParams
      const startDate = '20' + params[3] + '/' + params[4].padStart(2, '0') + '/' + params[5].padStart(2, '0') + ' ' + params[6].padStart(2, '0') + ':' + params[7].padStart(2, '0') + ':' + params[8].padStart(2, '0')
      this.setData({
        'tempParams.tempStartTime': startDate,
        'tempParams.tempEndTime': startDate,
        startDate
      })
      // 展示首页
      this.showIndex()
    }
  },
  bindInstructTimer() {
    clearInterval(this.data.instructTimer)
    wx.hideLoading()
    this.setData({ isShowLoading: false, isAcceptSuccess: 0 })
  },
  // 设备报送蓝牙温度计数据记录总条数
  handle21(nonceId) {
    this.bindInstructTimer()
    const code = transformCode(nonceId, [2, 1, 1, 4, 1, 1, 2])
    this.setData({ totalNum: code[3] })
    if(this.data.isClick) {
      if(code[3] === '0') {
        this.modal('noHistory')
      } else {
        this.submit()
      }
    }
  },
  // 设备报送设置设备名称成功
  handle27() {
    this.hideModal()
    this.bindInstructTimer()
    this.modal('setNameSuccess')
    setTimeout(() => {
      wx.hideLoading()
    }, 1500)
    console.log(generateCode(this.data.instructs.instruct_05))
    this.sendOrder(string2buffer(generateCode(this.data.instructs.instruct_05)))
    const instructTimer = setInterval(() => {
      if(this.data.isAcceptSuccess === 3) {
        clearInterval(this.data.instructTimer)
        this.modal('setInstructFail')
      } else {
        this.setData({
          isAcceptSuccess: this.data.isAcceptSuccess + 1
        })
        this.sendOrder(string2buffer(generateCode(this.data.instructs.instruct_05)))
      }
    }, 5000)
    this.setData({ instructTimer })
  },
  // 设备报送校时时间设备接收成功
  handle25() {
    this.setData({ isCheckTimeSuccess: 3 })
    clearInterval(this.data.checkTimeTimer)
    this.sendOrder(string2buffer(generateCode(['7E7E', '03', '02', 'E7E7'])))
  },
  // 设备报送开始记录时间设备接收成功
  handle24() {
    this.bindInstructTimer()
    this.showIndex()
  },
  // 设备报送设备恢复出厂模式成功
  handle26() {
    this.bindInstructTimer()
    this.modal('factoryResetSuccess')
  },
  // 设备报送蓝牙温度计历史数据传输完成
  handle23() {
    this.finish()
  },
  showIndex() {
    this.setData({ showPage: 'default' })
    this.setCloseTime()
    this.initDateTimePicker()
    this.initParams()
    if(this.data.deviceParams[11] === '1') {
      const now = new Date()
      const dateArr = [parseInt(now.getFullYear().toString().slice(2)), (now.getMonth() + 1) ,now.getDate(), now.getDay(), now.getHours(), now.getMinutes(), now.getSeconds()]
      // 校时
      console.log(generateCode(['7E7E', '0A', '01', ...dateArr, 'E7E7'], [0, 0, 0, 2, 2, 2, 2, 2, 2, 2, 0]))
      this.sendOrder(string2buffer(generateCode(['7E7E', '0A', '01', ...dateArr, 'E7E7'], [0, 0, 0, 2, 2, 2, 2, 2, 2, 2, 0])))
      const checkTimeTimer = setInterval(() => {
        if(this.data.isCheckTimeSuccess === 3) {
          this.setData({ isCheckTimeSuccess: 0 })
          clearInterval(this.data.checkTimeTimer)
        } else {
          this.setData({
            isCheckTimeSuccess: this.data.isCheckTimeSuccess + 1
          })
          this.sendOrder(string2buffer(generateCode(['7E7E', '0A', '01', ...dateArr, 'E7E7'], [0, 0, 0, 2, 2, 2, 2, 2, 2, 2, 0])))
        }
      }, 1000)
      this.setData({ checkTimeTimer })
    }
  },
  // 得到数据
  handle22(nonceId) {
    const obj = this.data.historyList
    obj.push(transformCode(nonceId, [2, 1, 1, 2, 2, 2, 2, 2, 2, 1, 1, 2]))
    const percent = (obj.length * 6 / this.data.tempParams.tempDataLength * 100).toFixed(2)
    this.setData({
      historyList: obj,
      percent: percent > 100 ? 100 : percent
    })
  },
  handle30(nonceId) {
    const obj = this.data.historyList
    console.log(transformCode(nonceId, [2, 1, 1, 2, 2, 2, 2, 2, 2, 1, 1, 2]))
    obj.push(transformCode(nonceId, [2, 1, 1, 2, 2, 2, 2, 2, 2, 1, 1, 2]))
    const percent = (obj.length * 3 / this.data.tempParams.tempDataLength * 100).toFixed(2)
    this.setData({
      historyList: obj,
      percent: percent > 100 ? 100 : percent
    })
  },
  handle31(nonceId) {
    this.handle30(nonceId)
  },
  // 进度
  finish() {
    this.hideModal()
    wx.setStorageSync('historyList', JSON.stringify(this.data.historyList))
    this.resetCloseTime()
    this.setCloseTime()
    this.setData({ percent: 0 })
    wx.navigateTo({
      url: `../chart/chart?endTime=${this.data.tempParams.tempEndTime}&needNum=${this.data.tempParams.tempDataLength}&heigh=${this.data.tempParams.tempAlarmHeigh}&low=${this.data.tempParams.tempAlarmLow}&startTime=${this.data.tempParams.tempStartTime}&type=${this.data.deviceParams[12]}`
    })
  },
  // 获取openid
  async getOpenId() {
    const res = await reqOpenid()
    wx.setStorageSync('openid', JSON.parse(res.data.data).openid)
  },
  // 判断是否登录
  judgeIsLogin() {
    const mobile = wx.getStorageSync('mobile')
    if (!mobile) {
      this.modal('unLogin')
    } else {
      this.isexist()
    }
  },
  resetCloseTime() {
    clearInterval(this.data.closeTimeTimer)
    this.setData({ closeTime: 120 })
  },
  setConnectTime() {
    clearInterval(this.data.connectDeviceTimer)
    const connectDeviceTimer = setInterval(() => {
      this.setData({
        connectTime: this.data.connectTime - 1
      })
      if(this.data.connectTime <= 0) {
        clearInterval(this.data.connectDeviceTimer)
        wx.hideLoading()
        this.modal('connectFail')
      }
    }, 1000)
    this.setData({ connectDeviceTimer })
  },
  // 超时设置
  setCloseTime() {
    clearInterval(this.data.closeTimeTimer)
    const closeTimeTimer = setInterval(() => {
      this.setData({
        closeTime: this.data.closeTime - 1
      })
      if(this.data.closeTime <= 0) {
        this.resetCloseTime()
        wx.closeBLEConnection({ deviceId: this.data.device.id })
      }
    }, 1000)
    this.setData({ closeTimeTimer })
  },
  //验证是否存在
  async isexist() {
    let isres = await reqIsBindDev(mobile, this.data.device.name, 'lywdj')   
    if (isres.data.code === 0) {
      this.getBindDev()
    } else {
      this.modal('addDeviceFail', res.data.message)
    }
  },
  // 绑定设备
  async getBindDev() {
    const mobile = wx.getStorageSync('mobile')
    let res = await reqBindDev(mobile, this.data.device.name, 'lywdj')
    if (res.data.code === 0) {
      this.modal('addDeviceSuccess')
    } else {
      this.modal('addDeviceFail', res.data.message)
    }
  },
  bindInputVal(e) {
    this.setData({
      [e.currentTarget.dataset.type]: e.detail.value
    })
  },
  initParams() {
    let { tempAlarmHeigh, tempAlarmLow } = this.data.tempParams
    let alarmItems1 = this.data.alarmItems1
    let alarmItems2 = this.data.alarmItems2
    if(tempAlarmHeigh > 0) {
      alarmItems1[0].checked = true
      alarmItems1[1].checked = false
    } else {
      alarmItems1[0].checked = false
      alarmItems1[1].checked = true
    }
    if(tempAlarmLow > 0) {
      alarmItems2[0].checked = true
      alarmItems2[1].checked = false
    } else {
      alarmItems2[0].checked = false
      alarmItems2[1].checked = true
    }
    this.setData({
      alarmHeigh: Math.abs(tempAlarmHeigh),
      alarmLow: Math.abs(tempAlarmLow),
      alarmItems1,
      alarmItems2
    })
  },
  bindSaveParams() {
    // 请求总条数
    if(this.data.isCheckTimeSuccess === 3 || this.data.deviceParams[11] === '0') {
      this.setData({ isClick: true })
      this.modal('loading')
      console.log(generateCode(['7E7E', '03', '02', 'E7E7']))
      this.sendOrder(string2buffer(generateCode(['7E7E', '03', '02', 'E7E7'])))
      const instructTimer = setInterval(() => {
        if(this.data.isAcceptSuccess === 3) {
          clearInterval(this.data.instructTimer)
          this.modal('setInstructFail')
        } else {
          this.setData({
            isAcceptSuccess: this.data.isAcceptSuccess + 1
          })
          this.sendOrder(string2buffer(generateCode(['7E7E', '03', '02', 'E7E7'])))
        }
      }, 5000)
      this.setData({ instructTimer })
    } else {
      this.modal('checkingTime')
    }
  },
  submit() {
    const deviceStartTime = formatDate(true, this.data.deviceParams)
    const startTime = formatDate(false, this.data.dateTimeArray1, this.data.dateTime1)
    const endTime = formatDate(false, this.data.dateTimeArray2, this.data.dateTime2)
    let s1 = new Date(startTime)
    let s2 = new Date(deviceStartTime)
    let s3 = new Date(endTime)
    const deviceEndTime = new Date(this.data.totalNum * 1000 * 60 + s2.getTime())
    if (s1 - s2 < 0) {
      this.modal('slte', deviceStartTime)
      return
    }
    if (s3 - s1 < 0) {
      this.modal('sgte')
      return
    }
    //开始时间和结束时间不能大于3天
    if (s3 - s1 > 259200000) {
      this.modal('stet3')
      return
    }
    if (deviceEndTime - s3.getTime() < 0) {
      this.modal('egtde', formatTime(deviceEndTime))
      return
    }
    let startNum = parseInt((s1.getTime() - s2.getTime()) / 1000 / 60)
    let endNum = parseInt((s3.getTime() - s1.getTime()) / 1000 / 60)
    const heigh = this.data.alarmItems1.filter(item => item.checked)[0].name * this.data.alarmHeigh
    const low = this.data.alarmItems2.filter(item => item.checked)[0].name * this.data.alarmLow
    if(low > heigh) {
      wx.showModal({
        content: '报警低温应小于报警高温',
        showCancel: false
      })
      return
    }
    const setParams = {
      tempStartTime: s1.getTime(),
      tempEndTime: s3.getTime(),
      tempDataLength: endNum,
      tempDataStartNum: startNum,
      tempAlarmHeigh: heigh,
      tempAlarmLow: low
    }
    this.setData({ tempParams: setParams })
    this.bindSelectDate()
  },
  radioChange1(e) {
    this.data.alarmItems1.forEach((item, index) => {
      if (item.name === parseInt(e.detail.value)) {
        this.setData({
          ['alarmItems1[' + index + '].checked']: true
        })
      } else {
        this.setData({
          ['alarmItems1[' + index + '].checked']: false
        })
      }
    })
  },
  radioChange2(e) {
    this.data.alarmItems2.forEach((item, index) => {
      if (item.name === parseInt(e.detail.value)) {
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
    const obj = datetimepickerUtil.dateTimePicker('20' + this.data.deviceParams[3])
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
    var arr = this.data.dateTime1, dateArr = this.data.dateTimeArray1
    arr[e.detail.column] = e.detail.value
    dateArr[2] = datetimepickerUtil.getMonthDay(dateArr[0][arr[0]], dateArr[1][arr[1]])
    this.setData({
      dateTimeArray1: dateArr,
      dateTime1: arr
    });
  },
  changeDateTime2(e) {
    this.setData({
      dateTime2: e.detail.value
    })
  },
  changeDateTimeColumn2(e) {
    var arr = this.data.dateTime2, dateArr = this.data.dateTimeArray2
    arr[e.detail.column] = e.detail.value
    dateArr[2] = datetimepickerUtil.getMonthDay(dateArr[0][arr[0]], dateArr[1][arr[1]])
    this.setData({
      dateTimeArray2: dateArr,
      dateTime2: arr
    })
  },
})
function formatDate(isData, dateTimeArray, dateTime) {
  if(isData) {
    return '20' + dateTimeArray[3] + '/' + dateTimeArray[4].padStart(2, '0') + '/' + dateTimeArray[5].padStart(2, '0') + ' ' + dateTimeArray[6].padStart(2, '0') + ':' + dateTimeArray[7].padStart(2, '0')
  }
  // y/m/d h:m
  return dateTimeArray[0][dateTime[0]] + '/' + dateTimeArray[1][dateTime[1]] + '/' + dateTimeArray[2][dateTime[2]] + ' ' + dateTimeArray[3][dateTime[3]] + ':' + dateTimeArray[4][dateTime[4]]
}