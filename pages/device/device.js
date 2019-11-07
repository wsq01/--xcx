import { reqBindDev, reqDevList, reqUnBindDev } from '../../service/service.js';
Page({
  data: {
    devList: [],
    isReqSuccess: false,
    isShowModal: false,
    inputDevId: '',
    offset: 5,
    count: 0
  },
  onLoad: function (options) {
    const openid = wx.getStorageSync('openid');
    reqDevList(openid).then(res => {
      this.setData({
        isReqSuccess: true,
        devList: res.data.data.data,
        count: res.data.data.count
      });
    });
  },
  onReachBottom: function () {
    const that = this;
    const openid = wx.getStorageSync('openid');
    // 页面触底时执行
    reqDevList(openid, this.data.offset).then(res => {
      if (res.data.code === 0 && res.data.data.data) {
        let list = this.data.devList;
        list = list.concat(res.data.data.data);
        console.log(list)
        this.setData({
          isReqSuccess: true,
          devList: list,
          offset: that.data.offset + 5
        });
      }
    });
  },
  onPullDownRefresh: function () {
    // 触发下拉刷新时执行
    const openid = wx.getStorageSync('openid');
    reqDevList(openid).then(res => {
      this.setData({
        isReqSuccess: true,
        devList: res.data.data.data
      });
    });
  },
  toDetail(e) {
    wx.navigateTo({
      url: './detail/detail?devid=' + e.currentTarget.dataset.devid + '&is_master=' + e.currentTarget.dataset.master,
    })
  },
  bindDev() {
    this.setData({
      isShowModal: true
    })
  },
  inputDev(e) {
    this.setData({
      inputDevId: e.detail.value
    })
  },
  bindScanCode() {
    const that = this;
    wx.scanCode({
      success(res) {
        console.log(res);
        that.setData({
          inputDevId: res.path.split('=')[1]
        })
      }
    })
  },
  addDev() {
    const mobile = wx.getStorageSync('mobile');
    const openid = wx.getStorageSync('openid');
    reqBindDev(mobile, this.data.inputDevId).then(res => {
      if (res.data.code === 0) {
        wx.showToast({
          title: '添加成功',
          icon: 'none'
        })
        reqDevList(openid).then(res => {
          if (res.data.code === 0) {
            this.setData({
              isShowModal: false,
              isReqSuccess: true,
              devList: res.data.data.data
            });
          }
        });
      } else {
        wx.showToast({
          title: res.data.message,
          icon: 'none'
        })
      }
    })
  },
  stopProp() {
  },
  bindCloseModal () {
    this.setData({
      isShowModal: false
    })
  },
  unbind(e) {
    const mobile = wx.getStorageSync('mobile');
    const devid = e.currentTarget.dataset.devid;
    const openid = wx.getStorageSync('openid');
    wx.showModal({
      content: '确定要解绑 ' + devid + ' 该设备吗？',
      success: res => {
        if(res.confirm) {
          reqUnBindDev(mobile, devid).then(res => {
            if(res.data.code === 0) {
              reqDevList(openid).then(res => {
                console.log(res);
                this.setData({
                  devList: res.data.data.data
                });
              });
              wx.removeStorageSync('devid');
              wx.showToast({
                title: '解绑成功',
                duration: 1500
              })
            } else {
              wx.showToast({
                title: res.data.message,
                icon: 'none',
                duration: 2000
              })
            }
          })
        }
      }
    })
  }
})