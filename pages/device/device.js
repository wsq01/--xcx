import { reqBindDev, reqDevList, reqUnBindDev, reqJudgeBinded, reqOpenid, reqSetParams } from '../../service/service.js';
Page({
  data: {
    devList: [],
    isReqSuccess: false,
    isShowModal: false,
    inputDevId: '',
    offset: 5,
    count: 0,
    setname: '',
    isShowSetNameModal: false,
    paramsData: {},
    devid: ''
  },
  onHide() {
    this.setData({
      offset: 5
    })
  },
  onLoad: function (options) {
    if (options.id) {
      wx.setStorageSync('devid', options.id);
    }
    const devid = wx.getStorageSync('devid');
    // 请求openid
    reqOpenid().then(res => {
      const data = JSON.parse(res.data.data);
      wx.setStorageSync('openid', data.openid);
    }).then(() => {
      const openid = wx.getStorageSync('openid');
      if (openid) {
        reqDevList(openid).then(res => {
          this.setData({
            isReqSuccess: true,
            devList: res.data.data.data,
            count: res.data.data.count
          });
        });
      } else {
        wx.showModal({
          content: '账号未登录，是否前往登录？',
          success(res) {
            if (res.confirm) {
              wx.reLaunch({
                url: '../mobile/verify/verify?handle=bind',
              })
            }
          }
        })
      }

    })
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
  bindSetName(e) {
    this.setData({
      setname: e.currentTarget.dataset.name,
      devid: e.currentTarget.dataset.devid,
      isShowSetNameModal: true
    })
  },
  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        selected: 0
      })
    }
    const openid = wx.getStorageSync('openid');
    if (openid) {
      reqDevList(openid).then(res => {
        this.setData({
          isReqSuccess: true,
          devList: res.data.data.data,
          count: res.data.data.count
        });
      });
    }
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
  bindCloseSetNameModal() {
    this.setData({
      isShowSetNameModal: false
    })
  },
  bindDev() {
    this.setData({
      isShowModal: true
    })
  },
  inputName(e) {
    this.setData({
      setname: e.detail.value
    })
  },
  inputDev(e) {
    this.setData({
      inputDevId: e.detail.value
    })
  },
  bindSaveParams() {
    const openid = wx.getStorageSync('openid');
    this.setData({
      'paramsData.openid': openid,
      'paramsData.devid': this.data.devid,
      'paramsData.beizhu': this.data.setname
    })
    reqSetParams(this.data.paramsData).then(res => {
      if (res.data.code === 0) {
        wx.showToast({
          title: '修改成功!',
          icon: 'success',
          duration: 2000
        })
        this.setData({
          isShowSetNameModal: false
        })
        reqDevList(openid).then(res => {
          this.setData({
            isReqSuccess: true,
            devList: res.data.data.data,
            count: res.data.data.count
          });
        });
      } else {
        wx.showToast({
          title: res.data.message,
          icon: 'none'
        })
      }
    })
  },
  changeName() {
    this.bindSaveParams()
  },
  bindScanCode() {
    const that = this;
    wx.scanCode({
      success(res) {
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
  bindCloseModal () {
    this.setData({
      isShowModal: false
    })
  },
  stopProp() {
  },
  unbind(e) {
    const mobile = wx.getStorageSync('mobile');
    const devid = e.currentTarget.dataset.devid;
    const openid = wx.getStorageSync('openid');
    console.log(e.currentTarget)
    wx.showModal({
      content: '确定要解绑 ' + devid + ' 该设备吗？',
      success: res => {
        if(res.confirm) {
          if(e.currentTarget.dataset.type === 1) {
            reqUnBindDev(mobile, devid).then(res => {
              if (res.data.code === 0) {
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
          } else {
            reqJudgeBinded(mobile, devid).then(res => {
              if (res.data.code === 0) {
                reqDevList(openid).then(res => {
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
      }
    })
  }
})