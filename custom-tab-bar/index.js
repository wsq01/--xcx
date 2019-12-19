Component({
  properties: {
    tabbar: {
      type: Object,
      value: {
        "selectedColor": "#83c7D4",
        "list": [
          {
            "pagePath": "/pages/index/index",
            "iconPath": "/images/icon-home@2x.png",
            "selectedIconPath": "/images/icon-home-active@2x.png",
            "text": "首页"
          },
          {
            "pagePath": "pages/index/index",
            "iconPath": "/images/icon-scnner@2x.png",
            "selectedIconPath": "/images/icon-scnner@2x.png",
            "text": "查看设备",
            "isSpecial": true
          },
          {
            "pagePath": "/pages/my/my",
            "iconPath": "/images/icon-my@2x.png",
            "selectedIconPath": "/images/icon-my-active@2x.png",
            "text": "我的"
          }
        ]
      }
    }
  },
  data: {
    selected: 0,
  },
  methods: {
    switchTab(e) {
      const data = e.currentTarget.dataset;
      if(data.special) {
        this.scanCode();
      } else {
        const url = data.url
        wx.switchTab({ url })
        this.setData({
          selected: data.index
        })
      }
    },
    scanCode() {
      wx.scanCode({
        success: res => {
          const code = res.path.match(/\?id=(.*)/)[1];
          wx.setStorageSync('devid', code);
          const openid = wx.getStorageSync('openid');
          wx.reLaunch({
            url: '/pages/index/index?id=' + code,
          })
        },
        fail: res => {
          wx.showToast({
            title: '未识别，扫描失败！',
            icon: 'none'
          })
        }
      })
    }
  }
})
