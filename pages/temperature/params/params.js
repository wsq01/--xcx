import {
  formatTime
} from '../../../utils/util.js';
import * as datetimepickerUtil from '../../../utils/datetimepicker.js';

Page({
  data: {
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
    // 低温
    alarmItems2: [{
      name: 1,
      checked: true,
      value: '零上'
    }, {
      name: -1,
      checked: false,
      value: '零下'
    }],
    deviceParams: [],
    readInterval: 1,
    alarmHeigh: 0,
    alarmLow: 0,
    tempParams: null
  },
  onLoad(options) {

    this.setData({
      tempParams: wx.getStorageSync('tempParams'),
      deviceParams: JSON.parse(options.deviceParams),
      totalNum: options.totalNum
    })
    this.initDateTimePicker()
    this.initParams()
  },
  bindInputVal(e) {
    this.setData({
      [e.currentTarget.dataset.type]: e.detail.value
    })
  },
  initParams() {
    let { tempReadInterval, tempAlarmHeigh, tempAlarmLow, tempStartTime, tempEndTime } = this.data.tempParams
    console.log(this.data.tempParams)
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
    let dateTime1 = new Date(tempStartTime)
    let dateTime2 = new Date(tempEndTime)
    var year = withData(dateTime1.getFullYear()),
    mont = withData(dateTime1.getMonth() + 1),
    date = withData(dateTime1.getDate()),
    hour = withData(dateTime1.getHours()),
    minu = withData(dateTime1.getMinutes());
    var year2 = withData(dateTime2.getFullYear()),
    mont2 = withData(dateTime2.getMonth() + 1),
    date2 = withData(dateTime2.getDate()),
    hour2 = withData(dateTime2.getHours()),
    minu2 = withData(dateTime2.getMinutes());
    const obj = datetimepickerUtil.dateTimePicker('20' + this.data.deviceParams[1], undefined, [year, mont, date, hour, minu], [year2, mont2, date2, hour2, minu2]);
    console.log(obj)
    this.setData({
      readInterval: tempReadInterval,
      alarmHeigh: Math.abs(tempAlarmHeigh),
      alarmLow: Math.abs(tempAlarmLow),
      alarmItems1,
      alarmItems2,
      dateTime1: obj.dateTime1,
      dateTimeArray1: obj.dateTimeArray1,
      dateTime2: obj.dateTime2,
      dateTimeArray2: obj.dateTimeArray2
    })
  },
  submit() {
    const that = this;
    if(!this.data.readInterval || this.data.readInterval < 0) {
      wx.showModal({
        title: '提示',
        content: '读取间隔设置错误！',
        showCancel: false
      })
      return
    }
    const deviceStartTime = '20' + this.data.deviceParams[1] + '/' + this.data.deviceParams[2].padStart(2, '0') + '/' + this.data.deviceParams[3].padStart(2, '0') + ' ' + this.data.deviceParams[4].padStart(2, '0') + ':' + this.data.deviceParams[5].padStart(2, '0') + ':' + this.data.deviceParams[6].padStart(2, '0');
    const startTime = that.data.dateTimeArray1[0][that.data.dateTime1[0]] + '/' + that.data.dateTimeArray1[1][that.data.dateTime1[1]] + '/' + that.data.dateTimeArray1[2]   [that.data.dateTime1[2]] + ' ' + that.data.dateTimeArray1[3][that.data.dateTime1[3]] + ':' + that.data.dateTimeArray1[4][that.data.dateTime1[4]];
    const endTime = that.data.dateTimeArray2[0][that.data.dateTime2[0]] + '/' + that.data.dateTimeArray2[1][that.data.dateTime2[1]] + '/' + that.data.dateTimeArray2[2]     [that.data.dateTime2[2]] + ' ' + that.data.dateTimeArray2[3][that.data.dateTime2[3]] + ':' + that.data.dateTimeArray2[4][that.data.dateTime2[4]];
    let s1 = new Date(startTime);
    let s2 = new Date(deviceStartTime);
    let s3 = new Date(endTime);
    const deviceEndTime = new Date(that.data.deviceParams[9] * that.data.totalNum * 1000 * 60 + s2.getTime());
    if (s1 - s2 < 0) {
      wx.showModal({
        title: '提示',
        content: '开始时间不得小于' + deviceStartTime,
        showCancel: false
      })
      return
    }
    if (s3 - s1 < 0) {
      wx.showModal({
        title: '提示',
        content: '结束时间不得小于开始时间',
        showCancel: false
      })
      return
    }
    if (deviceEndTime - s3.getTime() < 0) {
      wx.showModal({
        title: '提示',
        content: '结束时间不得超过' + formatTime(deviceEndTime),
        showCancel: false
      })
      return
    }
    let startNum = parseInt((s1.getTime() - s2.getTime()) / 1000 / 60 / that.data.deviceParams[8]);
    let endNum = parseInt((s3.getTime() - s1.getTime()) / 1000 / 60 / that.data.deviceParams[8]);
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
      tempAlarmLow: low,
      tempReadInterval: this.data.readInterval
    }
    wx.setStorageSync('tempParams', setParams)
    wx.navigateBack({ delta: 1 })
  },
  radioChange1(e) {
    console.log(e)
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
    const obj = datetimepickerUtil.dateTimePicker('20' + this.data.deviceParams[1]);
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
    var arr = this.data.dateTime1,
      dateArr = this.data.dateTimeArray1;
    arr[e.detail.column] = e.detail.value;
    dateArr[2] = datetimepickerUtil.getMonthDay(dateArr[0][arr[0]], dateArr[1][arr[1]]);
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
    var arr = this.data.dateTime2,
      dateArr = this.data.dateTimeArray2;
    arr[e.detail.column] = e.detail.value;
    dateArr[2] = datetimepickerUtil.getMonthDay(dateArr[0][arr[0]], dateArr[1][arr[1]]);
    this.setData({
      dateTimeArray2: dateArr,
      dateTime2: arr
    });
  },
})
function withData(param) {
  return param < 10 ? '0' + param : '' + param;
}