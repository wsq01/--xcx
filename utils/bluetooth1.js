// 搜索蓝牙设备
const findBluetooth = (bluetoothDeviceName) => {
  return new Promise((resolve, reject) => {
    wx.showLoading({
      title: '正在搜索设备...'
    })
    wx.startBluetoothDevicesDiscovery({
      success: () => {
        console.log('startBluetoothDevicesDiscovery SUCCESS')
        wx.getBluetoothDevices({
          success: (res) => {
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
  console.log(deviceId)
  return new Promise((resolve, reject) => {
    wx.createBLEConnection({
      deviceId: deviceId,
      success: (res) => {
        console.log('createBLEConnection success')
        wx.stopBluetoothDevicesDiscovery();
        wx.showToast({
          title: '连接成功',
          icon: 'success',
          duration: 1000
        })
        resolve();
      },
      fail: () => {
        console.log('createBLEConnection fail')
        wx.hideLoading();
        wx.showModal({
          title: '提示',
          content: '蓝牙连接失败，请稍后重试',
          showCancel: false,
          success() {
            wx.navigateBack({
              delta: 1
            })
          }
        })
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
      if (!isFirstShow) {
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
          wx.openBluetoothAdapter({
            success: function(res) {}
          })
        },
      })
      typeof callback === 'function' && callback();
    }
  })
}
export {
  monitorTheBlue,
  getServiceId,
  connetBlue,
  findBluetooth,
  getTheBlueDisConnectWithAccident
}