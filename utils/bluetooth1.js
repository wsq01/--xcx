const openBluetoothAdapter = () => {
  return new Promise((resolve, reject) => {
    wx.openBluetoothAdapter({
      success(res) { resolve(true) },
      fail() { resolve(false) }
    })
  })
}
// 搜索蓝牙设备
const findBluetooth = (bluetoothDeviceName) => {
  return new Promise((resolve, reject) => {
    wx.showLoading({
      title: '正在搜索设备...'
    })
    wx.startBluetoothDevicesDiscovery({
      success() {
        wx.getBluetoothDevices({
          success(res) {
            console.log(res)
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

// 连接设备
const connetBlue = (deviceId) => {
  return new Promise((resolve, reject) => {
    wx.createBLEConnection({
      deviceId: deviceId,
      success() {
        console.log('createBLEConnection success')
        wx.stopBluetoothDevicesDiscovery();
        wx.showToast({
          title: '连接成功',
          icon: 'success',
          duration: 1000
        })
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
    console.log(res)
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
  sendInstruct
}