// components/modal/index.js
Component({
  options: {
    multipleSlots: true
  },
  properties: {
    isShowCustomCloseBtn: {
      type: Boolean,
      value: true
    },
    isShowCustomFooter: {
      type: Boolean,
      value: true
    },
    footerBtnColor: {
      type: String,
      value: 'blue'
    },
    cancelBtnText: {
      type: String,
      value: '取消'
    },
    confirmBtnText: {
      type: String,
      value: '确定'
    }
  },
  data: {

  },
  methods: {
    hideModal() {

    },
    confirm() {

    }
  }
})
