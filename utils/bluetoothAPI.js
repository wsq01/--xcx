// 初始化蓝牙模块
const openBluetoothAdapter = () => {
  return new Promise((resolve, reject) => {
    wx.openBluetoothAdapter({
      success: res => {
        resolve(true)
      },
      fail: res => {
        resolve(false)
      }
    })
  })
}
// 监听蓝牙连接变化
const onBLEConnectionStateChange = (callback) => {
  wx.onBLEConnectionStateChange((res) => {
    if (!res.connected) {
      typeof callback === 'function' && callback(res.connected)
    }
  })
}
// 搜索蓝牙设备
// 部分设备不开启位置信息搜不到设备
const startBluetoothDevicesDiscovery = () => {
  return new Promise((resolve, reject) => {
    wx.startBluetoothDevicesDiscovery({
      success(res) {
        wx.getBluetoothDevices({
          success(res1) {
            console.log('getBluetoothDevices success', res1)
            resolve(res1.devices)
          },
          fail(err1) {
            console.log('getBluetoothDevices fail', err1)
            resolve(false)
          }
        })
      },
      fail(err) {
        console.log('startBluetoothDevicesDiscovery fail', err)
      }
    })
  })
}
// 监听寻找到到新设备
// 部分设备不开启位置信息不回调用该接口
const onBluetoothDeviceFound = (callback) => {
  wx.onBluetoothDeviceFound((res) => {
    typeof callback === 'function' && callback(res.devices[0])
  })
}
// 连接设备
const createBLEConnection = (deviceId) => {
  return new Promise((resolve, reject) => {
    wx.createBLEConnection({
      deviceId,
      timeout: 60000,
      success(res) {
        console.log('createBLEConnection success')
        resolve(true)
      },
      fail(err) {
        console.log('createBLEConnection fail', err)
        resolve(false)
      }
    })
  })
}
// 获取蓝牙设备服务的特征值
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
            for (var i = 0; i < res2.characteristics.length; i++) {
              var model = res2.characteristics[i]
              if (model.properties.notify == true) {
                obj.notifyId = model.uuid
              }
              if (model.properties.write == true) {
                obj.writeId = model.uuid
              }
            }
            wx.notifyBLECharacteristicValueChange({
              state: true,
              deviceId,
              serviceId: obj.serviceId,
              characteristicId: obj.notifyId,
              success(res3) {
                console.log(res3)
                resolve(obj)
              },
              fail(err) {
                console.log('notifyBLECharacteristicValueChange fail', err)
                resolve(false)
              }
            })
          }
        })
      }
    })
  })
}
const getNotifyBLECharacteristicValue2 = (deviceId) => {
  return new Promise((resolve, reject) => {
    wx.getBLEDeviceServices({
      deviceId,
      success: (res1) => {
        console.log(res1)
        if(!res1.services[6]) {
          resolve(false)
        } else {
          wx.getBLEDeviceCharacteristics({
            deviceId,
            serviceId: res1.services[6].uuid,
            success: (res2) => {
              console.log(res2)
              let obj = {
                serviceId: res1.services[6].uuid,
                writeId: '0000FF02-0000-1000-8000-00805F9B34FB',
                notifyId: '0000FF01-0000-1000-8000-00805F9B34FB'
              }
              // for (var i = 0; i < res2.characteristics.length; i++) {
              //   var model = res2.characteristics[i]
              //   if (model.properties.notify == true) {
              //     obj.notifyId = model.uuid
              //   }
              //   if (model.properties.write == true) {
              //     obj.writeId = model.uuid
              //   }
              // }
              console.log(obj)
              wx.notifyBLECharacteristicValueChange({
                state: true,
                deviceId,
                serviceId: obj.serviceId,
                characteristicId: obj.notifyId,
                success(res3) {
                  console.log(res3)
                  resolve(obj)
                },
                fail(err) {
                  console.log('notifyBLECharacteristicValueChange fail', err)
                  resolve(false)
                }
              })
            }
          })
        }
      }
    })
  })
}

const getNotifyBLECharacteristicValue3 = (deviceId) => {
  return new Promise((resolve, reject) => {
    wx.getBLEDeviceServices({
      deviceId,
      success: (res1) => {
        console.log(res1)
        
        wx.getBLEDeviceCharacteristics({
          deviceId,
          serviceId: res1.services[1].uuid,
          success: (res2) => {
            console.log(res2)
            let obj = {
              serviceId: res1.services[1].uuid,
              writeId: '0000FFF2-0000-1000-8000-00805F9B34FB',
              notifyId: '0000FFF1-0000-1000-8000-00805F9B34FB'
            }
            // for (var i = 0; i < res2.characteristics.length; i++) {
            //   var model = res2.characteristics[i]
            //   if (model.properties.notify == true) {
            //     obj.notifyId = model.uuid
            //   }
            //   if (model.properties.write == true) {
            //     obj.writeId = model.uuid
            //   }
            // }
            console.log(obj)
            wx.notifyBLECharacteristicValueChange({
              state: true,
              deviceId,
              serviceId: obj.serviceId,
              characteristicId: obj.notifyId,
              success(res3) {
                console.log(res3)
                resolve(obj)
              },
              fail(err) {
                console.log('notifyBLECharacteristicValueChange fail', err)
                resolve(false)
              }
            })
          }
        })
      }
    })
  })
}
// 断开设备
const closeBLEConnection = (deviceId) => {
  return new Promise((resove, reject) => {
    wx.closeBLEConnection({
      deviceId,
      success () {
        resolve(true)
      }
    })
  })
}
// 发送指令
const sendOrder = (deviceId, serviceId, characteristicId, buffer) => {
  return new Promise((resolve, reject) => {
    wx.writeBLECharacteristicValue({
      deviceId,
      serviceId,
      characteristicId,
      value: buffer,
      success(res) {
        resolve(true)
      },
      fail(err) {
        console.log(err)
        resolve(false)
      }
    })
  })
}
export {
  openBluetoothAdapter,
  onBLEConnectionStateChange,
  startBluetoothDevicesDiscovery,
  onBluetoothDeviceFound,
  createBLEConnection,
  getNotifyBLECharacteristicValue,
  closeBLEConnection,
  sendOrder,
  getNotifyBLECharacteristicValue2,
  getNotifyBLECharacteristicValue3
}