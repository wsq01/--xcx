import * as bluetoothUtil from '../../../utils/bluetooth1.js';
import {
  formatTime
} from '../../../utils/util.js';
import {
  reqBindDev,
  reqOpenid,
  reqUpload
} from '../../../service/service.js';
import {
  string2buffer,
  ab2hex,
  transformCode,
  generateCode2,
  generateCode3
} from '../../../utils/util.js';
var ratio = 1
var radius = 150
var deg0 = Math.PI / 9
var deg1 = Math.PI * 11 / 45

Page({
  data: {
    isFirstShow: true,
    mobile: '',
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
    findBluetoothTimer: null,
    overTimer: null,
    reloadTimer: null,
    debounceTimer: null,
    isOverTime: false,
    isPercent100: false,
    isShowPasswordModal: false,
    percent: 0,
    historyList: [], // 历史数据
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
    isConnected: false,
    tempParams: null,
    isShowModal: false,
    canvasWidth: undefined,
    password: ''
  },
  onUnload() {
    clearTimeout(this.data.overTimer)
    clearTimeout(this.data.reloadTimer)
    clearTimeout(this.data.findBluetoothTimer)
    clearTimeout(this.data.debounceTimer)
    wx.closeBluetoothAdapter()
  },
  onShow() {
    if(this.data.showPage === 'default') {
      wx.createSelectorQuery().select('#dashboard').fields({
        node: true,
        size: true
      }).exec(this.initCanvas.bind(this))
      const tempParams = {
        tempReadInterval: "1",
        tempAlarmHeigh: 0,
        tempAlarmLow: 0,
        tempStartTime: formatTime(new Date()),
        tempEndTime: formatTime(new Date()),
        tempDataLength: 0,
        tempDataStartNum: 0
      }
      this.setData({
        tempParams: wx.getStorageSync('tempParams') || tempParams
      })
    }
  },
  onLoad(options) {
    if (options.id) {
      wx.setStorageSync('tempParams', '')
      // if(options.id !== wx.getStorageSync('bluetoothDeviceName')) {
        
      // }
      this.setData({
        bluetoothDeviceName: options.id
      })
      wx.setStorageSync('bluetoothDeviceName', options.id)
    }
    const tempParams = {
      tempReadInterval: "1",
      tempAlarmHeigh: 0,
      tempAlarmLow: 0,
      tempStartTime: formatTime(new Date()),
      tempEndTime: formatTime(new Date()),
      tempDataLength: 0,
      tempDataStartNum: 0
    }
    this.setData({
      tempParams: wx.getStorageSync('tempParams') || tempParams,
      mobile: wx.getStorageSync('mobile')
    })
    wx.setStorageSync('tempParams', this.data.tempParams)
    this.getOpenId()
    this.initBluetooth();
  },
  hidePasswordModal() {
    this.setData({
      isShowPasswordModal: !this.data.isShowPasswordModal
    })
  },
  toPage(e) {
    clearTimeout(this.data.overTimer)
    this.setData({ isOverTime: true, overTimer: null })
    this.judgeIsOverTime()
    if(e.currentTarget.dataset.tap === 'params') {
      wx.navigateTo({
        url: `../params/params?deviceParams=${JSON.stringify(this.data.deviceParams)}&totalNum=${this.data.totalNum}`,
      })
    } else if(e.currentTarget.dataset.tap === 'history') {
      if(!this.data.isConnected) {
        wx.showToast({
          title: '蓝牙已断开',
          icon: 'none'
        })
        return
      }
      if(!this.data.tempParams) {
        wx.showToast({
          title: '暂无数据',
          icon: 'none'
        })
        return
      }

      this.bindSelectDate();
    } else if(e.currentTarget.dataset.tap === 'binddevice') {
      this.judgeIsLogin()
    } else if(e.currentTarget.dataset.tap === 'upload') {
      if(!this.data.tempParams) {
        wx.showToast({
          title: '暂无数据',
          icon: 'none'
        })
        return
      }
      this.upload()
    } else if(e.currentTarget.dataset.tap === 'factory') {
      this.setData({
        isShowPasswordModal: true
      })
    }
  },
  // 输入密码
  bindInputVal(e) {
    this.setData({
      password: e.detail.value
    })
  },
  bindPasswordSubmit() {
    if(this.data.password === '123') {
      this.sendMy(string2buffer('FEF73132330a0d'))
      this.setData({ isShowPasswordModal: false })
      wx.showLoading({
        title: '恢复中...'
      })
    } else {
      wx.showToast({
        title: '密码错误',
        icon: 'none'
      })
    }
  },
  // 上传
  async upload() {
    wx.showLoading({
      title: '上传中...',
    })
    let uploadData = await this.getLocation();
    if(uploadData.length == 0) {
      wx.hideLoading()
      wx.showToast({
        title: '暂无数据',
        icon: 'none'
      })
      return 
    } else if(uploadData === false) {
      wx.showToast({
        title: '位置信息获取失败',
        icon: 'none'
      })
    }
    let res = await reqUpload(this.data.bluetoothDeviceName, uploadData)
    console.log(res)
    wx.hideLoading();
    if(res.data.code === 0) {
      wx.showToast({
        title: '上传成功！',
      })
    } else {
      wx.showToast({
        icon: 'none',
        title: '上传失败！' + res.data.message,
      })
    }
  },
  // 获取历史数据
  bindSelectDate() {
    if(this.data.tempParams.tempDataLength === 0) {
      wx.showToast({
        title: '暂无数据',
        icon: 'none'
      })
      return
    }
    this.setData({
      isShowModal: true,
      historyList: [],
      percent: 0,
      isOverTime: false
    })
    let {tempDataStartNum, tempDataLength, tempReadInterval } = this.data.tempParams;
    const code = generateCode3(['FE', 'FD', tempReadInterval, tempDataStartNum, tempDataLength], [0, 0, 2, 8, 8])
    this.sendMy(string2buffer(code));
    clearTimeout(this.data.overTimer)
  },
  // 初始化蓝牙
  async initBluetooth() {
    // 开启蓝牙适配器
    let isOpenBluetoothAdapterSuccess = await bluetoothUtil.openBluetoothAdapter();
    if(isOpenBluetoothAdapterSuccess) {
      wx.showLoading({
        title: '正在搜索设备...'
      })
      bluetoothUtil.getTheBlueDisConnectWithAccident((res) => {
        if(!res) {
          this.setData({
            isConnected: false
          })
        } else {
          this.setData({
            isConnected: true
          })
        }
        this.setData({
          isFirstShow: false
        })
      });
      // 搜索蓝牙设备获取deviceid
      let deviceId = await bluetoothUtil.findBluetooth(this.data.bluetoothDeviceName);
      // 没找到设备
      if (!deviceId) {
        const findBluetoothTimer = setTimeout(() => {
          this.initBluetooth()
        }, 3000)
        this.setData({ findBluetoothTimer })
      } else {
        wx.showLoading({
          title: '正在连接设备...',
        })
        let res = await bluetoothUtil.connetBlue(deviceId);
        let servicesUUID = await bluetoothUtil.getServiceId(deviceId, this.data.characteristicId);
        wx.hideLoading()
        wx.showToast({ title: '连接成功！' })
        this.setData({
          deviceId,
          servicesUUID,
          overTimer: null
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
  handleFEF7(nonceId) {
    wx.hideLoading()
    const code = transformCode(nonceId, [2, 1, 1]);
    console.log(code)
    if(code[1] === '1') {
      wx.showToast({
        title: '恢复成功！',
        duration: 2000,
        success(res) {
          setTimeout(() => {
            wx.navigateBack({
              delta: 1
            })

          }, 2000)
        }
      })
    } else {
      wx.showToast({
        title: '恢复失败',
        icon: 'none'
      })
    }
  },
  // 获取设备参数
  handleFEFA(nonceId) {
    const code = transformCode(nonceId, [2, 1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 2]);
    code[3] === '0' ? code[3] = '1' : code[3];
    const startDate = '20' + code[1] + '/' + code[2].padStart(2, '0') + '/' + code[3].padStart(2, '0') + ' ' + code[4].padStart(2, '0') + ':' + code[5].padStart(2, '0') + ':' + code[6].padStart(2, '0');
    this.setData({
      deviceParams: code,
      'tempParams.tempStartTime': startDate,
      'tempParams.tempEndTime': startDate,
      startDate
    })
    wx.setStorageSync('tempParams', this.data.tempParams)
    this.judgeIsFirstConnectDevice(code[9]);
  },
  handleFEFB() {
    this.setData({
      showPage: 'default'
    })
    this.sendMy(string2buffer(this.data.instructs.getTotal));
    this.getSystemInfo();
    wx.createSelectorQuery().select('#dashboard').fields({
      node: true,
      size: true
    }).exec(this.initCanvas.bind(this))
  },
  // 获取数据总条数
  handleFEFE(nonceId) {
    const code = transformCode(nonceId, [2, 4, 1, 2]);
    this.setData({ totalNum: code[1] })
    this.setData({ isOverTime: true })
    this.judgeIsOverTime();
  },
  // 得到数据
  handleFEFC(nonceId) {
    if (nonceId.length === 8) {
    } else {
      const obj = this.data.historyList;
      obj.push(transformCode(nonceId, [2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1]));
      this.setData({
        historyList: obj,
        isPercent100: true,
        percent: (obj.length * 8 / this.data.tempParams.tempDataLength * 100).toFixed(2)
      })
    }
  },
  // 进度
  finish() {
    if (this.data.percent >= 100 && this.data.isPercent100) {
      this.debounce(() => {
        clearTimeout(this.data.overTimer)
        this.setData({
          isPercent100: false,
          isOverTime: true,
          isShowModal: false
        })
        this.judgeIsOverTime();
        wx.setStorageSync('historyList', JSON.stringify(this.data.historyList));
        wx.navigateTo({
          url: `../chart/chart?delay=${this.data.tempParams.tempReadInterval}&endTime=${this.data.tempParams.tempEndTime}&needNum=${this.data.tempParams.tempDataLength}&heigh=${this.data.tempParams.tempAlarmHeigh}&low=${this.data.tempParams.tempAlarmLow}`,
        })
      }, 500)()
    }
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
  judgeIsLogin() {
    const that = this;
    const mobile = wx.getStorageSync('mobile');
    if (!mobile) {
      wx.showModal({
        content: '账号未登录，是否前往登录？',
        success(res) {
          if (res.confirm) {
            clearTimeout(that.data.overTimer)
            wx.navigateTo({
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
    const that = this;
    if (code === "0") {
      // this.setData({
      //   showPage: 'setting'
      // })
      wx.showModal({
        content: '是否开始记录数据？',
        success(res) {
          if(res.confirm) {
            setTimeout(() => {
              const now = new Date();
              const dateArr = [parseInt(now.getFullYear().toString().slice(2)), (now.getMonth() + 1), now.getDate(), now.getHours(), now.getMinutes(), now.getSeconds()];
              that.setData({
                'tempParams.tempStartTime': formatTime(now),
                'tempParams.tempEndTime': formatTime(now)
              })
              wx.setStorageSync('tempParams', that.data.tempParams)
              const code = generateCode2(['FE', 'FB', ...dateArr, 1, 1], 2);
              that.sendMy(string2buffer(code));
            }, 100)
          } else {
            wx.navigateBack({
              delta: 1
            })
          }
        }
      })
    } else {
      this.setData({
        showPage: 'default'
      })
      this.sendMy(string2buffer(this.data.instructs.getTotal));
      this.getSystemInfo();
      wx.createSelectorQuery().select('#dashboard').fields({
        node: true,
        size: true
      }).exec(this.initCanvas.bind(this))
    }
  },
  // 超时判定
  judgeIsOverTime() {
    const that = this;
    if (this.data.isOverTime && !this.data.overTimer) {
      const overTimer = setTimeout(() => {
        wx.closeBluetoothAdapter({
          success: function(res) {
            wx.showModal({
              content: '蓝牙已断开，是否重新连接？',
              success(res) {
                if (res.confirm) {
                  wx.showLoading({
                    title: '准备重连中...',
                  })
                  let reloadTimer = setTimeout(() => {
                    wx.hideLoading();
                    that.initBluetooth();
                  }, 10000)
                  that.setData({
                    reloadTimer
                  })
                }
              }
            })
          }
        })
      }, 120000)
      this.setData({ overTimer })
    }
  },
  debounce(fn, interval = 1000) {
    const that = this;
    var debounceTimer;
    return function() {
      clearTimeout(that.data.debounceTimer);
      var context = this;
      var args = arguments;
      debounceTimer = setTimeout(function() {
        fn.call(context, args);
      }, interval);
      that.setData({ debounceTimer })
    };
  },
  getSystemInfo() {
    const that = this
    wx.getSystemInfo({
      success(res) {
        that.setData({
          canvasWidth: res.windowWidth
        })
      }
    })
  },
  initCanvas(res) {
    console.log(res)
    var that = this;
    var canvas = res[0].node;
    var ctx = canvas.getContext('2d');
    var cWidth = res[0].width;
    var cHeight = res[0].height;
    canvas.width = cWidth;
    canvas.height = cHeight;
    var dot = new Dot(),
        dotSpeed = 0.05,
        textSpeed = Math.round(dotSpeed * 10 / deg1),
        angle = 0,
        credit = -30;
    var isFinished = false;
    (function drawFrame() {
        ctx.save();
        ctx.clearRect(0, 0, cWidth, cHeight);
        ctx.translate(cWidth / 2, cHeight / 2 + 50);
        ctx.rotate(8 * deg0);
    
        dot.x = radius * Math.cos(angle);
        dot.y = radius * Math.sin(angle);
    
        var aim = (that.data.deviceParams[7]/10 - (-30)) * deg1 / 20;
        if (angle < aim) {
          angle += dotSpeed;
        }
        dot.draw(ctx);
        if (credit < that.data.deviceParams[7]/10 - textSpeed) {
          credit += textSpeed;
        } else if (credit >= that.data.deviceParams[7]/10 - textSpeed && credit < that.data.deviceParams[7]/10) {
          credit = parseFloat((0.1 + credit).toFixed(1));
          // credit = credit.toFixed(1)
        }
        drawText(credit, ctx);
        if(credit >= that.data.deviceParams[7]/10) {
          isFinished = true
        }
        ctx.save();
        ctx.beginPath();
        ctx.lineWidth = 3;
        ctx.strokeStyle = 'rgba(255, 255, 255, .5)';
        ctx.arc(0, 0, radius, 0, angle, false);
        ctx.stroke();
        ctx.restore();
        if(!isFinished) {
          canvas.requestAnimationFrame(drawFrame)
        }
    
        ctx.save(); //中间刻度层
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(255, 255, 255, .4)';
        ctx.lineWidth = 10;
        ctx.arc(0, 0, radius - 20, 0, 11 * deg0, false);
        ctx.stroke();
        ctx.restore();
    
        ctx.save(); // 刻度线
        for (var i = 0; i < 6; i++) {
          ctx.beginPath();
          ctx.lineWidth = 2;
          ctx.strokeStyle = 'rgba(255, 255, 255, .4)';
          ctx.moveTo(140 * ratio, 0);
          ctx.lineTo(130 * ratio, 0);
          ctx.stroke();
          ctx.rotate(deg1);
        }
        ctx.restore();
    
        ctx.save(); // 细分刻度线
        for (i = 0; i < 25; i++) {
          if (i % 5 !== 0) {
            ctx.beginPath();
            ctx.lineWidth = 2;
            ctx.strokeStyle = 'rgba(255, 255, 255, .1)';
            ctx.moveTo(140 * ratio, 0);
            ctx.lineTo(133 * ratio, 0);
            ctx.stroke();
          }
          ctx.rotate(deg1 / 5);
        }
        ctx.restore();
    
        ctx.save(); //信用分数
        ctx.rotate(Math.PI / 2);
        for (i = 0; i < 6; i++) {
          ctx.fillStyle = 'rgba(255, 255, 255, .8)';
          ctx.font = '12px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(-30 + 20 * i, 0, -115 * ratio);
          ctx.rotate(deg1);
        }
        ctx.restore();
    
        // ctx.save(); //分数段
        // ctx.rotate(Math.PI / 2 + deg0);
        // for (i = 0; i < 5; i++) {
        //   ctx.fillStyle = 'rgba(255, 255, 255, .8)';
        //   ctx.font = '12px sans-serif';
        //   ctx.textAlign = 'center';
        //   ctx.fillText(stage[i], 5, -115 * ratio);
        //   ctx.rotate(deg1);
        // }
        // ctx.restore();
    
        ctx.save(); //信用阶段及评估时间文字
        ctx.rotate(10 * deg0);
        ctx.fillStyle = '#ffffff';
        ctx.font = '20px sans-serif';
        ctx.textAlign = 'center';
        
        ctx.fillText(`温度区间：${that.data.tempParams.tempAlarmLow || 0}°C~${that.data.tempParams.tempAlarmHeigh || 0}°C`, 0, 30);
        
        ctx.fillStyle = '#fff';
        ctx.font = '14px sans-serif';
         // y-----
        ctx.fillText('开始时间：' + that.data.startDate, 0, 50);
        ctx.fillStyle = '#7ec5f9';
        ctx.font = '14px sans-serif';
        ctx.fillText(that.data.bluetoothDeviceName, -5, -60);
        ctx.restore();

        // ctx.save(); //最外层轨道
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(255, 255, 255, .4)';
        ctx.lineWidth = 3;
        ctx.arc(0, 0, radius, 0, 11 * deg0, false);
        ctx.stroke();
        ctx.restore();
    })()
  },
  getLocation() {
    const that = this;
    return new Promise((resolve, reject) => {
      wx.getLocation({
        type: 'wgs84',
        success(res) {
          const latitude = res.latitude;
          const longitude = res.longitude;
          const result = wx.getStorageSync('uploadData') || []
          result.forEach(item => {
            item.jingdu = longitude;
            item.weidu = latitude;
          })
          resolve(result);
        },
        fail(error) {
          wx.hideLoading();
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
  async getBindDev() {
    const mobile = this.data.mobile;
    let res = await reqBindDev(mobile, this.data.bluetoothDeviceName);
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
})

function drawText(process, ctx) {
  ctx.save();
  ctx.rotate(10 * deg0);
  ctx.fillStyle = '#ffffff';
  ctx.font = '50px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseLine = 'top';
  ctx.fillText(process + '°C', 0, 0);
  ctx.restore();
}

function Dot(ctx) {
  this.x = 0;
  this.y = 0;
  this.draw = function (ctx) {
    ctx.save();
    ctx.beginPath();
    ctx.fillStyle = 'rgba(255, 255, 255, .7)';
    ctx.arc(this.x, this.y, 3, 0, Math.PI * 2, false);
    ctx.fill();
    ctx.restore();
  };
}