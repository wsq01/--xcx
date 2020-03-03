Component({
  properties: {
    list: {
      type: Array,
      default: []
    },
    isShowIcon: {
      type: Boolean,
      default: true
    },
    isHasAcess: {
      type: Boolean,
      default: false
    }
  },
  data: {

  },
  methods: {
    toPage(e) {
      const pagePath = e.currentTarget.dataset.page
      if (this.data.isHasAcess || (!this.data.isHasAcess && (pagePath === 'issue' || pagePath === 'service' || pagePath === 'mobile' || pagePath === 'video'))) {
        wx.navigateTo({
          url: '../' + pagePath + '/' + pagePath,
        })
      } else {
        wx.showModal({
          title: '提示',
          content: '账号未登录，请前往登录',
          success: res => {
            if(res.confirm) {
              wx.navigateTo({
                url: '../mobile/verify/verify?handle=bind',
              })
            }
          }
        })
      }
    }
  }
})
