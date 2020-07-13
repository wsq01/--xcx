const openBluetoothAdapter = () => {
  return new Promise((resolve, reject) => {
    wx.openBluetoothAdapter({
      success() { resolve(true) },
      fail(err) { console.log(err);reject(false) }
    })
  })
}
// 搜索蓝牙设备
const findBluetooths = (bluetoothDeviceName) => {
  return new Promise((resolve, reject) => {
    wx.startBluetoothDevicesDiscovery({
      success() {
        wx.getBluetoothDevices({
          success(res) {
            resolve(res.devices)
          },
          fail(err1) {
            console.log(err1)
            reject(false)
          }
        })
      },
      fail(err) {
        console.log(err)
      }
    })
  })
}
// 搜索指定蓝牙设备
const findBluetooth = (bluetoothDeviceName) => {
  return new Promise((resolve, reject) => {
    wx.startBluetoothDevicesDiscovery({
      success() {
        wx.getBluetoothDevices({
          success(res) {
            var deviceId = '';
            for (var i = 0; i < res.devices.length; i++) {
              if (res.devices[i].name && res.devices[i].localName && (res.devices[i].name == bluetoothDeviceName || res.devices[i].localName == bluetoothDeviceName)) {
                deviceId = res.devices[i].deviceId;
              }
            }
            resolve(deviceId);
          }
        })
      }
    })
  })
}

const connetBlue = (deviceId) => {
  return new Promise((resolve, reject) => {
    wx.createBLEConnection({
      deviceId: deviceId,
      success() {
        console.log('createBLEConnection success')
        wx.stopBluetoothDevicesDiscovery()
      },
      fail() {
        console.log('createBLEConnection fail')
        wx.hideLoading();
        wx.showModal({
          content: '蓝牙连接失败，请稍后重试',
          showCancel: false,
          success() {
            wx.navigateBack({
              delta: 1
            })
          }
        })
      },
      complete() {
        resolve();
      }
    })
  })
}
const connetBluetooth = (deviceId) => {
  return new Promise((resolve, reject) => {
    wx.createBLEConnection({
      deviceId: deviceId,
      success(res) {
        console.log(res)
        resolve(true)
      },
      fail(err) {
        console.log(err)
        reject(false)
      }
    })
  })
}
// 获取设备的uuid
const getServiceId = (deviceId, characteristicId) => {
  return new Promise((resolve, reject) => {
    wx.getBLEDeviceServices({
      deviceId: deviceId,
      success: (res1) => {
        wx.getBLEDeviceCharacteristics({
          deviceId: deviceId,
          serviceId: res1.services[1].uuid,
          success: (res2) => {
            wx.notifyBLECharacteristicValueChange({
              state: true, // 启用 notify 功能
              deviceId: deviceId,
              serviceId: res1.services[1].uuid,
              characteristicId: characteristicId, //第一步 开启监听 notityid  第二步发送指令 write
              success: () => {
                console.log('notifyBLECharacteristicValueChange success')
                resolve(res1.services[1].uuid);
              }
            })
          }
        })
      }
    })
  })
}
const getNotifyBLECharacteristicValue = (deviceId) => {
  return new Promise((resolve, reject) => {
    wx.getBLEDeviceServices({
      deviceId,
      success: (res1) => {
        console.log(res1)
        wx.getBLEDeviceCharacteristics({
          deviceId,
          serviceId: res1.services[0].uuid,
          success: (res2) => {
            console.log(res2)
            let obj = {
              serviceId: res1.services[0].uuid
            }
            for (var i = 0; i < res2.characteristics.length; i++) {//2个值
              var model = res2.characteristics[i]
              if (model.properties.notify == true) {
                obj.characteristicId = model.uuid
              }
              if (model.properties.write == true) {
                obj.writeId = model.uuid
              }
            }
            wx.notifyBLECharacteristicValueChange({
              state: true,
              deviceId,
              serviceId: obj.serviceId,
              characteristicId: obj.characteristicId,
              success: (res3) => {
                console.log(res3)
                resolve(obj)
              }
            })
          }
        })
      }
    })
  })
}
// 判定手机蓝牙是否打开
const monitorTheBlue = (isFirstShow) => {
  wx.onBluetoothAdapterStateChange((res) => {
    if (res.available) {
      if (isFirstShow) {
        wx.showToast({
          title: '蓝牙已开启',
          icon: 'none',
          duration: 3000
        })
      }
    } else {
      wx.showToast({
        title: '蓝牙已关闭',
        icon: 'none',
        duration: 3000,
      })
    }
  })
}
//监听蓝牙设备是否会异常断开
const getTheBlueDisConnectWithAccident = (callback) => {
  wx.onBLEConnectionStateChange(function(res) {
    if (!res.connected) {
      wx.closeBluetoothAdapter({
        success: function(res) {
        },
      })
    }
    typeof callback === 'function' && callback(res.connected);
  })
}

const sendInstruct = (value, deviceId, serviceId, characteristicId) => {
  wx.writeBLECharacteristicValue({
    deviceId,
    serviceId,
    characteristicId,
    value,
    success() {
      console.log("写入成功");
    },
    fail() {
      wx.showToast({
        title: '设置失败!',
        icon: 'none'
      })
    }
  })
}
export {
  monitorTheBlue,
  getServiceId,
  connetBlue,
  findBluetooth,
  getTheBlueDisConnectWithAccident,
  openBluetoothAdapter,
  sendInstruct,
  findBluetooths,
  connetBluetooth,
  getNotifyBLECharacteristicValue
}