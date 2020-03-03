
// 开始获取附近的蓝牙设备
const findBluetooth = (callback) => {
  const that = this;
  wx.showLoading({
    title: '正在搜索设备'
  })
  wx.startBluetoothDevicesDiscovery({
    allowDuplicatesKey: false,
    interval: 0,
    success: function (res) {
      console.log('startBluetoothDevicesDiscovery success')
      typeof callback === 'function' && callback();
    }
  })
}

// 判定手机蓝牙是否打开
const monitorTheBlue = (callback) => {
  wx.onBluetoothAdapterStateChange(function (res) {
    typeof callback === 'function' && callback(res);
  })
}

// 第四步 连接蓝牙设备
const connetBlue = (deviceId, callback) => {
  wx.createBLEConnection({
    // 这里的 deviceId 需要已经通过 createBLEConnection 与对应设备建立链接
    deviceId: deviceId, //设备id
    success: function (res) {
      wx.showToast({
        title: '连接成功',
        icon: 'success',
        duration: 1000
      })
      wx.stopBluetoothDevicesDiscovery({
        success: function (res) {}
      })
      typeof callback === 'function' && callback();
    },
    fail: function (res) {
      console.log(res);
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
    },
  })
}
// 获取设备的uuid
const getServiceId = (deviceId, callback) => {
  wx.getBLEDeviceServices({
    // 这里的 deviceId 需要已经通过 createBLEConnection 与对应设备建立链接
    deviceId: deviceId,
    success: function (res) {
      console.log(res)
      typeof callback === 'function' && callback(res);
    }
  })
}
// 搜索获取附近的所有蓝牙设备 获取附近所有的蓝牙设备的相关信息 获取需要连接蓝牙设备的deviceID
const getBlue = (bluetoothDeviceName, successCallback) => {
  wx.getBluetoothDevices({
    success: function (res) {
      console.log(res)
      var index = false;
      var deviceId = '';
      for (var i = 0; i < res.devices.length; i++) {
        if (res.devices[i].name && res.devices[i].localName) {
          var arr = res.devices[i].name;
          var secArr = res.devices[i].localName;
          if (arr == bluetoothDeviceName || secArr == bluetoothDeviceName) {
            index = true;
            deviceId = res.devices[i].deviceId;
          }
        }
      }
      if (!index) {
        setTimeout(() => {
          findBluetooth(() => {
            getBlue(bluetoothDeviceName, successCallback);
          })
        }, 3000)
      } else {
        typeof successCallback === 'function' && successCallback(deviceId);
      }
    },
    fail: function () {
    },
    complete: function () {
    }
  })
}

//监听蓝牙设备是否会异常断开
const getTheBlueDisConnectWithAccident = (callback) => {
  wx.onBLEConnectionStateChange(function (res) {
    if (!res.connected) {
      wx.closeBluetoothAdapter({
        success: function (res) {
          wx.openBluetoothAdapter({
            success: function (res) { }
          })
        },
      })
      typeof callback === 'function' && callback();
    }
  })
}

// 查看当前蓝牙设备的特征值
const getCharacteId = (deviceId, servicesUUID, callback) => {
  var that = this;
  wx.getBLEDeviceCharacteristics({
    // 这里的 deviceId 需要已经通过 createBLEConnection 与对应设备建立链接
    deviceId: deviceId,
    // 这里的 serviceId 需要在上面的 getBLEDeviceServices 接口中获取
    serviceId: servicesUUID,
    success: function (res) {
      typeof callback === 'function' && callback();
      // for (var i = 0; i < res.characteristics.length; i++) {
      //   var model = res.characteristics[i];
      //   if (model.properties.notify == true) {
      //     that.setData({
      //       characteristicId: model.uuid //监听的值
      //     })
      //     that.startNotice(model.uuid) //7.0
      //   }
      //   if (model.properties.write == true) {}
      // }
    }
  })
}

// 开启设备数据监听 监听蓝牙设备返回来的数据
const startNotice = (deviceId, servicesUUID, characteristicId, callback) => {
  var that = this;
  wx.notifyBLECharacteristicValueChange({
    state: true, // 启用 notify 功能
    deviceId: deviceId,
    serviceId: servicesUUID,
    characteristicId: characteristicId, //第一步 开启监听 notityid  第二步发送指令 write
    success: function (res) {
      typeof callback === 'function' && callback();
    },
    fail: function (res) { }
  })
}

module.exports = {
  findBluetooth,
  connetBlue,
  getServiceId,
  monitorTheBlue,
  getBlue,
  getCharacteId,
  startNotice,
  getTheBlueDisConnectWithAccident
}