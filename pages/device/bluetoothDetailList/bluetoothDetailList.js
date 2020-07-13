import { reqUserDataList } from '../../../service/service'
Page({
  data: {
    mobile: '',
    devid: '',
    page: 1,
    list: [],
    isShowLoadMore: false,
    isLoad: false
  },
  onLoad(options) {
    const { devid } = options
    const mobile = wx.getStorageSync('mobile')
    this.setData({ devid, mobile })
    // this.reqUserDataList()
  },
  onShow() {
    this.setData({ list: [] })
    this.reqUserDataList()
  },
  toPage(e) {
    wx.navigateTo({
      url: `../bluetoothDetail/bluetoothDetail?devid=${this.data.devid}&startTime=${e.currentTarget.dataset.start}&endTime=${e.currentTarget.dataset.end}`
    })
  },
  async bindscrolltolower() {
    this.setData({ page: ++this.data.page, isShowLoadMore: true })
    this.reqUserDataList()
  },
  async reqUserDataList() {
    const res = await reqUserDataList(this.data.devid, this.data.page)
    if(res.data.code === 0) {}
    if(res.data.data.data.length === 0) {
      this.setData({ isLoad: true })
    }
    const list = this.data.list.concat(...res.data.data.data)
    this.setData({ list })
  },
  toBluetooth() {
    wx.openBluetoothAdapter({
      success: res => {
        if(this.data.devid.length === 6) {
          wx.navigateTo({
            url: '../../bluetooth/data/data?id=' + this.data.devid + '&from=index'
          })
        } else {
          wx.navigateTo({
            url: '../../temperature/data/data?id=' + this.data.devid + '&from=index'
          })
        }
      },
      fail: res => {
        wx.showToast({
          title: '请开启蓝牙',
          icon: 'none'
        })
      }
    })
  },
})