const app = getApp()
import { reqVerifyRegister, reqOpenid, reqDevList, reqSetParams, reqBluetoothList, reqUnBindDev, reqSetRemarks } from '../../service/service.js'
var canUseReachBottom = true;
Page({
  data: {
    CustomBar: app.globalData.CustomBar,
    modalName: null,
    TabCur: 0,
    tabList: ['监控宝(GPRS)', '蓝牙设备'],
    menuList: [
      {
        type: 'invite',
        icon: '/images/icon-invite@2x.png',
        text: '邀请家人',
        page: '../invite/invite'
      },
      {
        type: 'bill',
        icon: '/images/icon-bill@2x.png',
        text: '待缴账单',
        page: '../bill/bill'
      },
      {
        type: 'mobile',
        icon: '/images/icon-mobile@2x.png',
        text: '账户设置',
        page: '../mobile/mobile'
      },
      {
        type: 'issue',
        icon: '/images/icon-issue@2x.png',
        text: '常见问题',
        page: '../issue/issue'
      },
      {
        type: 'service',
        icon: '../../images/icon-service@2x.png',
        text: '联系客服',
        page: '../service/service'
      }
    ],
    openid: '',
    devList: [],
    bluetoothList: [],
    currDevice: null,
    isHasAcess: false,
    count1: 0,
    count2: 0,
    offset1: 0,
    offset2: 5,
    isShowLoadMore1: false,
    isShowLoadMore2: false,
    isLoad1: false,
    isLoad2: false,
    animation: false,
    animation1: true,
    animation2: false,
    isTriggered: false,
    isutypeb:true,
    tapTime: '',
  },
  onShow(){
    canUseReachBottom = true;
  },
  onLoad(options) {
    if (options.id) {
      wx.setStorageSync('devid', options.id)
    }
    this.reqOpenid()
  },
  bindrefresherrefresh() {
    canUseReachBottom = true;
    if(this.data.TabCur === 0) {
      this.setData({ offset1: 0, isLoad1: false,devList:[] })
      this.getDevList(this.data.openid, 0)
    } else if(this.data.TabCur === 1) {
      this.setData({ offset2: 0, isLoad2: false })
      this.getBluetoothList(this.data.openid, this.data.offset2)
    }
  },
  toPage(e) {
    if(e.currentTarget.dataset.type === 'redirect') {
      wx.redirectTo({ url: e.currentTarget.dataset.page })
    } else {
      wx.navigateTo({ url: e.currentTarget.dataset.page })
    }
  },
  toPageWidthVerify(e) {
    const type = e.currentTarget.dataset.type
    const pagePath = e.currentTarget.dataset.page
    if (this.data.isHasAcess || (!this.data.isHasAcess && (type === 'issue' || type === 'service' || type === 'mobile'))) {
      wx.navigateTo({ url: pagePath })
    } else {
      wx.showModal({
        content: '账号未登录，请前往登录',
        success: res => {
          if(res.confirm) {
            wx.redirectTo({
              url: '../mobile/verify/verify?handle=bind'
            })
          }
        }
      })
    }
  },
  async reqOpenid() {
    const res = await reqOpenid()
    const openid = JSON.parse(res.data.data).openid
    this.getDevList(openid, 0)
    this.getBluetoothList(openid, 0)
    this.setData({ openid })
    wx.setStorageSync('openid', openid)
    this.reqVerifyRegister()
  },
  async reqVerifyRegister() {
    const res = await reqVerifyRegister(this.data.openid)
    if (res.data.code === 0 && res.data.data) {
      if (res.data.data.phone) {
        wx.setStorageSync('mobile', res.data.data.phone)
        wx.setStorageSync('utype',res.data.data.uType)
        if(res.data.data.uType=='b'){
           this.setData({
            isutypeb:false
           })
           this.data.tabList.splice(1,1);
           this.setData({
            tabList:this.data.tabList,
            'tabList[0]':'设备列表'
           });
           let _menulist=this.data.menuList.slice(3);
            this.setData({
              menuList:_menulist
            });
        }
        
        this.setData({ isHasAcess: true })
      } else {
        wx.removeStorageSync('mobile')

      }
    }else{
      wx.showModal({
        content: '账号未登录，请前往登录',
        success: res => {
          if(res.confirm) {
            wx.redirectTo({
              url: '../mobile/verify/verify?handle=bind'
            })
          }
        }
      })
    }
  },
  async getDevList(openid, offset = 0) {
    let res = await reqDevList(openid, offset)
    this.setData({
      devList: res.data.data.data || [],
      count1: res.data.data.count || 0,
      isTriggered: false
    })
  },
  async bindscrolltolower() {
    if(!canUseReachBottom) return;
    this.setData({ offset1: this.data.offset1 + 5 })
    if(this.data.TabCur === 0) { 
      this.setData({ isShowLoadMore1: true })
      let res = await reqDevList(this.data.openid, this.data.offset1)
      let deviceList = res.data.data.data || []
      if(deviceList.length < 5&&res.data.data.count<5){
        this.setData({ isLoad1: true,isShowLoadMore1: true ,devList:deviceList})
        canUseReachBottom = false;
      }else if(deviceList.length < 5&&res.data.data.count>5){
        this.setData({isLoad1: true,isShowLoadMore1:true,devList: this.data.devList.concat(deviceList)})
        canUseReachBottom = false;
      }else if(deviceList.length == 0&&res.data.data.count==undefined){
        this.setData({isLoad1: true,isShowLoadMore1:true,devList: this.data.devList.concat(deviceList)})
        canUseReachBottom = false;
      }else{
        canUseReachBottom = true;
        this.setData({
          devList: this.data.devList.concat(deviceList)
        })
       
      }
     
    } else {
      this.setData({ isShowLoadMore2: true })
      let res = await reqBluetoothList(this.data.openid, this.data.offset2+5)
      let bluetoothList = res.data.data.data || []
      this.setData({
        offset2: this.data.offset2 + 5,
        bluetoothList: this.data.bluetoothList.concat(bluetoothList)
      })
      if(bluetoothList.length === 0) {
        this.setData({ isLoad2: true })
      }
    }
  },
  onHide() {
    this.setData({
      offset1: 5,
      offset2: 5
    })
  },
  showModal(e) {
    this.setData({
      modalName: e.currentTarget.dataset.target,
      animation: true
    })
    setTimeout(() => {
      this.setData({ animation: false })
    }, 1000)
  },
  hideModal() {
    this.setData({
      modalName: null
    })
  },
  swiperChange(e) {
    this.initAnimation(e.detail.current)
    this.setData({
      TabCur: e.detail.current
    })
  },
  initAnimation(id) {
    this.setData({
      isShowLoadMore1: false,
      isShowLoadMore2: false
    })
    if(id === 0) {
      this.setData({
        animation1: true
      })
    } else if(id === 1) {
      this.setData({
        animation2: true
      })
    }
    setTimeout(() => {
      this.setData({
        animation2: false,
        animation1: false
      })
    }, 1000)
  },
  tabSelect(e) {
    canUseReachBottom = true
    this.initAnimation(e.currentTarget.dataset.id)
    this.setData({
      TabCur: e.currentTarget.dataset.id
    })
  },
  bindShowSetNameModal(e) {
    this.setData({
      currDevice: e.currentTarget.dataset,
      modalName: 'setName'
    })
  },
  bindInputName(e) {
    this.setData({
      'currDevice.name': e.detail.value
    })
  },
  bindChangeName() {
    console.log(this.data.TabCur)
   
    if(this.data.TabCur==0){
      const obj = {
        shebeibianhao: this.data.currDevice.id,
        beizhu: this.data.currDevice.name
      }
      this.reqSetRemarks(obj)
    }else{
      const obj = {
        devid: this.data.currDevice.id,
        beizhu: this.data.currDevice.name,
        openid: this.data.openid,
        userType: 'lywdj'
      }
      this.reqSetParams(obj)
    }    
  },
  async getBluetoothList(openid, offset = 0) {
    if(offset === 0) {
      this.setData({
        offset2: 0,
        isLoad2: false
      })
    }
    let res = await reqBluetoothList(openid, offset)
    this.setData({
      bluetoothList: res.data.data.data || [],
      count2: res.data.data.count || 0,
      isTriggered: false
    })
  },
  async reqSetParams(params) {
    const res = await reqSetParams(params)
    if (res.data.code === 0) {
      wx.showToast({
        title: '修改成功!',
        icon: 'success'
      })
      this.hideModal()
      this.getDevList(this.data.openid, 0)
      this.getBluetoothList(this.data.openid, 0)
    } else {
      wx.showToast({
        title: res.data.message,
        icon: 'none'
      })
    }
  },
  async reqSetRemarks(params) {
    const res = await reqSetRemarks(params)
    if (res.data.code === 0) {
      wx.showToast({
        title: '设置成功!',
        icon: 'success'
      })
      this.hideModal()
      this.getDevList(this.data.openid, 0)
      this.getBluetoothList(this.data.openid, 0)
    } else {
      wx.showToast({
        title: res.data.message,
        icon: 'none'
      })
    }
  },
  bindUnBind(e) {
    wx.showModal({
      content: '确定要解绑 ' + e.currentTarget.dataset.id + ' 设备吗？',
      success: res => {
        if(res.confirm) {
          this.unBind(e.currentTarget.dataset.id)
        }
      }
    })
  },
  async unBind(id) {
    const mobile = wx.getStorageSync('mobile')
    let res = await reqUnBindDev(mobile, id)
    if (res.data.code === 0) {
      wx.showToast({ title: '解绑成功' })
      this.getBluetoothList(this.data.openid, 0)
    } else {
      wx.showToast({
        title: res.data.message,
        icon: 'none',
        duration: 2000
      })
    }
  }
})