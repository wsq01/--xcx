import API from './index.js';

export const reqDevList = (openid, offset = 0) => {
  return new Promise((resolve, reject) => {
    wx.request({
      url: API.reqDevList,
      data: {
        openid,
        offset
      },
      success(res) {
        resolve(res);
      }
    })
  })
}

export const reqLookDev = (devicenumber) => {
  return new Promise((resolve, reject) => {
    wx.request({
      url: API.reqLookDev,
      data: {
        exclusive: 'zjzl8888',
        devicenumber
      },
      success(res) {
        resolve(res);
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
            resolve(data);
          }
        })
      }
    })
  })
}
// 解绑副设备
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
            resolve(data);
          }
        })
      }
    })
  })
}

export const reqVerifyRegister= (openid) => {
  return new Promise((resolve, reject) => {
    wx.request({
      url: API.reqVerifyRegister,
      data: {
        openid
      },
      success: res => {
        resolve(res);
      }
    })
  })
}

export const reqSmsCode = (phone) => {
  return new Promise((resolve, reject) => {
    wx.request({
      url: API.reqSendCode,
      data: {
        phone
      },
      success: res => {
        resolve(res);
      }
    })
  })
}
export const reqRegister = (openid, phone, code, pwd) => {
  return new Promise((resolve, reject) => {
    wx.request({
      url: API.reqRegister,
      data: {
        openid,
        phone,
        code,
        pwd
      },
      success: res => {
        resolve(res);
      }
    })
  })
}
export const reqUnbind = (openid, phone, code) => {
  return new Promise((resolve, reject) => {
    wx.request({
      url: API.reqUnbind,
      data: {
        openid,
        phone,
        code
      },
      success: res => {
        resolve(res);
      }
    })
  })
}
export const getMemberList = (mainname) => {
  return new Promise((resolve, reject) => {
    wx.request({
      url: API.reqMemberList,
      data: {
        mainname
      },
      success: res => {
        resolve(res);
      }
    })
  })
}

export const reqEditMember = (mainname, aftername, nickname) => {
  return new Promise((resolve, reject) => {
    wx.request({
      url: API.reqEditMember,
      data: {
        mainname,
        aftername,
        nickname
      },
      success: res => {
        resolve(res);
      }
    })
  })
}
export const reqDeleteMember = (mainname, aftername) => {
  return new Promise((resolve, reject) => {
    wx.request({
      url: API.reqDeleteMember,
      data: {
        mainname,
        aftername
      },
      success: res => {
        resolve(res);
      }
    })
  })
}
export const reqBindDev = (mainname, devicenumber) => {
  return new Promise((resolve, reject) => {
    wx.request({
      url: API.reqBindDev,
      data: {
        mainname,
        devicenumber
      },
      success: res => {
        resolve(res);
      }
    })
  })
}
export const reqUnBindDev = (mainname, devicenumber) => {
  return new Promise((resolve, reject) => {
    wx.request({
      url: API.reqUnbindDev,
      data: {
        mainname,
        devicenumber
      },
      success: res => {
        resolve(res);
      }
    })
  })
}
export const reqDevCharts = (mobile, devid, endTime, startTime = '2000-08-26 00:00:00') => {
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
        Length: 20,
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
export const reqSetParams = (submitData) => {
  return new Promise((resolve, reject) => {
    wx.request({
      url: API.reqSetParams,
      method: 'post',
      data: submitData,
      success: res => {
        resolve(res);
      }
    })
  })
}
export const reqBillList = (mainname) => {
  return new Promise((resolve, reject) => {
    wx.request({
      url: API.reqBillList,
      data: {
        mainname
      },
      success: res => {
        resolve(res);
      }
    })
  })
}
export const reqCheckSmsCode = (phone, code) => {
  return new Promise((resolve, reject) => {
    wx.request({
      url: API.reqCheckSmsCode,
      data: {
        phone,
        code
      },
      success: res => {
        resolve(res);
      }
    })
  })
}

export const reqDevParams = (mobile, devid) => {
  return new Promise((resolve, reject) => {
    wx.request({
      url: API.reqDevParams,
      data: {
        admin_permit: 'zjly8888',
        UserP: 'W',
        admin_pass: '123456',
        admin_user: mobile,
        SheBeiBianHao: devid
      },
      method: 'post',
      success: res => {
        resolve(res);
      }
    })
  })
}

export const reqDevData = (mobile, devid, startNo, endTime) => {
  return new Promise((resolve, reject) => {
    wx.request({
      url: API.reqDevData,
      method: 'post',
      data: {
        admin_permit: 'zjly8888',
        UserP: 'W',
        admin_user: mobile,
        admin_pass: '123456',
        StartTime: '2000-08-26 00:00:00',
        StartNo: startNo,
        Length: 20,
        EndTime: endTime,
        SheBeiBianHao: devid
      },
      success: res => {
        resolve(res);
      }
    })
  })
}
export const reqUpdateMobile = (old_phone, new_phone) => {
  return new Promise((resolve, reject) => {
    wx.request({
      url: API.reqUpdateMobile,
      method: 'post',
      data: {
        old_phone,
        new_phone
      },
      success: res => {
        resolve(res);
      }
    })
  })
}
