import { reqBindDev, reqDevList, reqUnBindDev, reqJudgeBinded, reqOpenid, reqSetParams, reqVerifyRegister, reqBluetoothList } from '../../service/service.js';
var loadMoreView;
Page({
  data: {
    devList: [],
    isReqSuccess: false,
    isShowModal: false,
    inputDevId: '',
    offset1: 5,
    offset2: 5,
    count1: 0,
    count2: 0,
    setname: '',
    isShowSetNameModal: false,
    paramsData: {},
    devid: '',
    swiperItemHeight: 0,
    currentItem: 0,
    active: ['active', ''],
    tabList: [{
      text: '监控宝(GPRS)'
    }, {
      text: '蓝牙设备'
    }],
    openid: ''
  },
  onHide() {
    this.setData({
      offset1: 5,
      offset2: 5
    })
  },
  async onLoad(options) {
    if (options.id) {
      wx.setStorageSync('devid', options.id);
    }
    const devid = wx.getStorageSync('devid');
    // 请求openid
    const res = await reqOpenid();
    const openid = JSON.parse(res.data.data).openid;
    this.setData({ openid })
    wx.setStorageSync('openid', openid);
    this.getDevList(this.data.openid, 0);
    this.getBluetoothList(this.data.openid, 0);
    let verify = await reqVerifyRegister(openid);
    if (verify.data.code === 0 && verify.data.data) {
      if (verify.data.data.phone) {
        wx.setStorageSync('mobile', verify.data.data.phone);
        this.setData({
          isHasAcess: true
        })
      } else {
        wx.removeStorageSync('mobile');
        wx.showModal({
          content: '账号未登录，是否前往登录？',
          success(res) {
            if (res.confirm) {
              wx.reLaunch({
                url: '../mobile/verify/verify?handle=bind'
              })
            }
          }
        })
      }
    }
  },
  loadMoreListener: function (e) {
    console.log('111')
  },
  clickLoadMore: function (e) {
    console.log('222')
  },
  // 页面触底
  async onReachBottom() {
    loadMoreView.loadMore();
    loadMoreView.loadMoreComplete(true)
    if(this.data.currentItem === 0) {
      let res = await reqDevList(this.data.openid, this.data.offset1);
      let deviceList = res.data.data.data || [];
      this.setData({
        offset1: this.data.offset1 + 5,
        deviceList: this.data.deviceList.concat(deviceList)
      })
      this.setSwiperHeight('.tab-swiper1')
    } else {
      let res = await reqBluetoothList(this.data.openid, this.data.offset2);
      let bluetoothList = res.data.data.data || [];
      this.setData({
        offset2: this.data.offset2 + 5,
        bluetoothList: this.data.bluetoothList.concat(bluetoothList)
      })
      this.setSwiperHeight('.tab-swiper2')
    }
    loadMoreView.loadMoreComplete(false)
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
    if (this.data.openid) {
      if (this.data.currentItem === 0) {
        this.getDevList(this.data.openid, 0);

      } else {
        this.getBluetoothList(this.data.openid, 0);
      }
    }
  },
  // 下拉刷新
  onPullDownRefresh: function () {
    if (this.data.currentItem === 0) {
      this.getDevList(this.data.openid, 0);
    } else {
      this.getBluetoothList(this.data.openid, 0);
    }
  },
  toDetail(e) {
    wx.navigateTo({
      url: './detail/detail?devid=' + e.currentTarget.dataset.devid + '&is_master=' + e.currentTarget.dataset.master,
    })
  },
  initBluetooth(e) {
    const that = this;
    wx.openBluetoothAdapter({
      success:(res) => {
        wx.navigateTo({
          url: '../bluetooth/data/data?id=' + e.currentTarget.dataset.devid + '&from=index',
        })
      },
      fail: (res) => {
        wx.showModal({
          content: '请开启蓝牙',
          showCancel: false
        })
      }
    })
  },
  toBluetooth(e) {
    this.initBluetooth(e);
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
  async getDevList(openid, offset = 0) {
    let res = await reqDevList(openid, offset);
    let deviceList = res.data.data.data || [];
    this.setData({
      isReqSuccess: true,
      deviceList,
      count1: res.data.data.count || 0
    })
    this.setSwiperHeight(`.tab-swiper1`);
    loadMoreView = this.selectComponent("#loadMoreView1");
    
  },
  async getBluetoothList(openid, offset = 0) {
    let res = await reqBluetoothList(openid, offset);
    let bluetoothList = res.data.data.data || [];
    this.setData({
      isReqSuccess: true,
      bluetoothList,
      count2: res.data.data.count || 0
    })
    this.setSwiperHeight(`.tab-swiper2`);
    loadMoreView = this.selectComponent("#loadMoreView2");
  },
  bindSaveParams() {
    this.setData({
      'paramsData.openid': this.data.openid,
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
        this.getDevList(this.data.openid, 0)
      } else {
        wx.showToast({
          title: res.data.message,
          icon: 'none'
        })
      }
    })
  },
  changeName() {
    this.bindSaveParams();
  },
  bindScanCode() {
    wx.scanCode({
      success(res) {
        this.setData({
          inputDevId: res.path.split('=')[1]
        })
      }
    })
  },
  bindCloseModal () {
    this.setData({
      isShowModal: false
    })
  },
  stopProp() {},
  unbind(e) {
    const mobile = wx.getStorageSync('mobile');
    const devid = e.currentTarget.dataset.devid;
    wx.showModal({
      content: '确定要解绑 ' + devid + ' 该设备吗？',
      success: res => {
        if(res.confirm) {
          if (e.currentTarget.dataset.type === 1 || e.currentTarget.dataset.type === 2) {
            reqUnBindDev(mobile, devid).then(res => {
              if (res.data.code === 0) {
                if (this.data.currentItem === 0) {
                  this.getDevList(this.data.openid, 0);
                } else {
                  this.getBluetoothList(this.data.openid, 0);
                }
                this.setData({
                  offset1: 0,
                  offset2: 0
                })
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
                this.getDevList(this.data.openid, 0);
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
  },
  setSwiperHeight(selector) {
    wx.createSelectorQuery().select(selector).boundingClientRect((rect) => {
      this.setData({
        swiperItemHeight: rect.height + 50 + 'px'
      })
    }).exec()
  },
  bindtabChange(e) {
    console.log(e.currentTarget.dataset)
    let active = ['', ''];
    active[e.currentTarget.dataset.id] = 'active';
    this.setData({
      currentItem: e.currentTarget.dataset.id,
      active: active
    })
    this.setSwiperHeight(`.tab-swiper${e.currentTarget.dataset.id + 1}`);
  },
  swiperChange(e) {
    let active = ['', ''];
    active[e.detail.current] = 'active'
    this.setData({
      active: active,
      currentItem: e.detail.current
    })
    this.setSwiperHeight(`.tab-swiper${e.detail.current + 1}`);
  }
})