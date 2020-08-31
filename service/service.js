import API from './index.js'

const wxRequest = ({ url, method = 'get', data }) => {
  return new Promise((resolve, reject) => {
    wx.request({
      url,
      data,
      method,
      success: res => {
        resolve(res)
      },
      fail: err => {
        console.log(err)
        wx.showToast({
          title: '系统错误',
          icon: 'none'
        })
      }
    })
  })
}
export const reqDevList = (openid, offset = 0) => wxRequest({
  url: API.reqDevList,
  data: {
    openid,
    offset,
    hour: 3
  }
})
export const reqUserDataInfoList = data => wxRequest({
  url: API.reqUserDataInfoList,
  data
})
export const reqDiagram = data => wxRequest({
  url: API.reqDiagram,
  method: 'post',
  data
})

export const reqUserDataList = (shebeibianhao, page) => wxRequest({
  url: API.reqUserDataList,
  data: {
    shebeibianhao,
    page
  }
})

export const reqBluetoothList = (openid, offset = 0) => wxRequest({
  url: API.reqBluetoothList,
  data: {
    openid,
    offset
  }
})

export const reqLookDev = devicenumber => wxRequest({
  url: API.reqLookDev,
  data: {
    exclusive: 'zjzl8888',
    devicenumber
  }
})

export const reqUpload = (deviceId, data, startTime, endTime, equipment_type) => {
  return new Promise((resolve, reject) => {
    wx.request({
      url: API.reqUpload,
      method: 'POST',
      data: {
        data: data,
        shebeibianhao: deviceId,
        start_time: startTime,
        equipment_type,
        end_time: endTime
      },
      success(res) {
        resolve(res)
      }
    })
  })
}

export const reqOpenid = () => {
  return new Promise((resolve, reject) => {
    wx.login({
      success: res => {
        wx.request({
          url: API.reqOpenid,
          data: {
            js_code: res.code
          },
          success(data) {
            resolve(data)
          }
        })
      }
    })
  })
}
export const reqJudgeBinded = (mainname, devicenumber) => {
  return new Promise((resolve, reject) => {
    wx.login({
      success: res => {
        wx.request({
          url: API.reqJudgeBinded,
          data: {
            mainname,
            devicenumber
          },
          success(data) {
            resolve(data)
          }
        })
      }
    })
  })
}

export const reqPrinter = (shebeibianhao, sort, startTime, endTime, page , chepaihao ,forwarding_unit,receiving_unit,transport_personnel,waybill_number,item_name) => wxRequest({
  url: API.reqPrinter,
  data: {
    shebeibianhao,
    sort,
    startTime,
    endTime,
    page,
    chepaihao,
    forwarding_unit,
    receiving_unit,
    transport_personnel,
    waybill_number,
    item_name
  }
})

export const reqVerifyRegister = openid => wxRequest({
  url: API.reqVerifyRegister,
  data: { openid }
})

export const reqJudgeBluetoothName = (shebeibianhao, admin_user) => wxRequest({
  url: API.reqJudgeBluetoothName,
  data: {
    shebeibianhao,
    admin_user
  }
})

export const reqBluetoothNameExist = (shebeibianhao, admin_user) => wxRequest({
  url: API.reqBluetoothNameExist,
  data: {
    shebeibianhao,
    admin_user
  }
})

export const reqSmsCode = phone => wxRequest({
  url: API.reqSendCode,
  data: { phone }
})

export const reqRegister = (openid, phone, code, pwd) => wxRequest({
  url: API.reqRegister,
  data: { openid, phone, code, pwd }
})

export const reqUnbind = (openid, phone, code) => wxRequest({
  url: API.reqUnbind,
  data: { openid, phone, code }
})

export const getMemberList = mainname => wxRequest({
  url: API.reqMemberList,
  data: { mainname }
})

export const reqEditMember = (mainname, aftername, nickname) => wxRequest({
  url: API.reqEditMember,
  data: {
    mainname,
    aftername,
    nickname
  }
})

export const reqDeleteMember = (mainname, aftername) => wxRequest({
  url: API.reqDeleteMember,
  data: {
    mainname,
    aftername
  }
})

export const reqBindDev = (mainname, devicenumber, bandType) => wxRequest({
  url: API.reqBindDev,
  data: {
    mainname,
    devicenumber,
    bandType
  }
})



export const reqUnBindDev = (mainname, devicenumber) => wxRequest({
  url: API.reqUnbindDev,
  data: {
    mainname,
    devicenumber
  }
})

export const reqDevCharts = (mobile, devid, endTime, startTime = '2010-08-26 00:00:00') => {
  return new Promise((resolve, reject) => {
    wx.request({
      url: API.reqDevCharts,
      data: {
        admin_permit: 'zjly8888',
        UserP: 'W',
        admin_user: 'c',
        admin_pass: '123456',
        StartTime: startTime,
        StartNo: 0,
        Length: 1000,
        EndTime: endTime,
        SheBeiBianHao: devid
      },
      method: 'post',
      success: res => {
        resolve(res)
      }
    })
  })
}
export const reqSetParams = submitData => wxRequest({
  url: API.reqSetParams,
  method: 'post',
  data: submitData
})

export const reqSetRemarks = submitData => wxRequest({
  url: API.reqSetRemarks,
  method: 'post',
  data: submitData
})
export const reqBillList = mainname => wxRequest({
  url: API.reqBillList,
  data: {
    mainname
  }
})

export const reqPrintInfo = shebeibianhao => wxRequest({
  url: API.reqPrintInfo,
  data: {
    shebeibianhao
  }
})

export const reqShowchart = (shebeibianhao,curveType) => wxRequest({
  url: API.reqShowchart,
  method: 'post',
  data: {
    shebeibianhao,
    curveType
  }
})

export const reqCheckSmsCode = (phone, code, openid) => wxRequest({
  url: API.reqCheckSmsCode,
  data: {
    phone,
    code,
    openid
  }
})

export const reqDevParams = (mobile, devid) => wxRequest({
  url: API.reqDevParams,
  data: {
    admin_permit: 'zjly8888',
    UserP: 'W',
    admin_pass: '123456',
    admin_user: mobile,
    SheBeiBianHao: devid
  },
  method: 'post'
})

export const reqDevData = (mobile, devid, startNo, endTime) => wxRequest({
  url: API.reqDevData,
  method: 'post',
  data: {
    admin_permit: 'zjly8888',
    UserP: 'W',
    admin_user: mobile,
    admin_pass: '123456',
    StartTime: '2010-08-26 00:00:00',
    StartNo: startNo,
    Length: 20,
    EndTime: endTime,
    SheBeiBianHao: devid
  }
})

export const reqUpdateMobile = (old_phone, new_phone) => wxRequest({
  url: API.reqUpdateMobile,
  method: 'post',
  data: {
    old_phone,
    new_phone
  }
})