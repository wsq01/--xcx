// components/share-moment/index.js
/**
 * 生成分享到朋友圈的图
 */
const app = getApp();
const stringUtil = require('../../utils/stringUtil.js');

var windowWidth;
var windowHeight;
const TEXT_COLOR = '#000000';
const WHITE = '#FFFFFF';
const THEME_COLOR = '#83c7d4';
const GRAY_COLOR = '#333333';
const TINT_COLOR = '#747474';

const temp = 0.01;
//图片长宽比
const scale = 1.78;
//背景图高度
const bgScale = 0.5;
//头像和宽的比
const avatarWidthScale = 0.28;
const avatarHeightScale = 0.12;
// //头像白色圆形背景
const avatarBgWidthScale = 0.38;
const avatarStrokeWidth = 4;
// //昵称高度比
// const nicknameHeightScale = 0.34 + 5 * temp;
//第一行文字高度
const topTextScale = 0.715 + 5 * temp;
//分享内容
const contentScale = 0.585 + 3 * temp;
const contentScale2 = 0.620 + 3 * temp;
//二维码直径
const qrCodeWidthScale = 0.341;
//二维码高度
const qrCodeHeightScale = 0.69;
//极客文字
const bpbScale = 0.91 + temp * 2;
//识别文字
const decodeScale = 0.935 + temp * 2;

Component({
  properties: {
    //头像 url (必须)
    avatar: {
      type: String,
      value: null
    },
    //昵称 (必须)
    nickname: {
      type: String,
      value: null
    },
    //隐藏显示，会触发事件
    showShareModel: {
      type: Boolean,
      value: false,
      observer: '_propertyChange'
    },
    shareTitle:{
      type: String,
      value: null
    },
    weather1: {
      type: String,
      value: ''
    },
    weather2: {
      type: String,
      value: ''
    },
    weather3: {
      type: String,
      value: ''
    }
  },
  /**
   * 组件的初始数据
   */
  data: {
    detailStr: {
      tip: '鲜盾管家',
      content: '',
      contentOther: '',
      bpbMini: '',
      // clickToMini: '(分享后长按进入鲜盾管家)'
    },
    canvasHeight: 0,
    imageWidth: 0,
    imageHeight: 0,
    targetSharePath: null,
    QRPath: '../../images/qrcode-app.jpg',
    avatarPath: null,
    realShow: false
  },
  ready: function () {
    var that = this;
    wx.getSystemInfo({
      success: function (res) {
        windowWidth = res.windowWidth;
        windowHeight = res.windowWidth * scale;
        that.setData({
          canvasHeight: windowHeight,
          imageWidth: windowWidth * 0.7,
          imageHeight: windowHeight * 0.7
        })
      },
    })
  },
  methods: {
    /**
     * 控件显示并且没有生成图片时，使用 canvas 生成图片
     */
    _propertyChange: function (newVal, oldVal) {
      console.log('_propertyChange---------->' + newVal);
      // 每次打开分享都走这个方法 wx.getStorageSync('shareImg')[0] ../../image/share-bg.png
      this.setData({
        shareImg: wx.getStorageSync('shareImg')[0]
      })

      if (newVal) {
        // if (!this.data.targetSharePath) {
          this.shareMoments();
        // } else {
        //   this.setData({
        //     realShow: true
        //   })
        // }
      }
    },
    /**
     * 生成分享图到朋友圈
     */
    shareMoments: function () {
      var that = this;
      //没有分享图先用 canvas 生成，否则直接预览
      // if (that.data.targetSharePath) {
      //   that.setData({
      //     showShareModel: true
      //   })
      // } else {
        that.showLoading();
        that.downloadAvatar();
      // }
    },
    showErrorModel: function (content) {
      this.hideLoading();
      if (!content) {
        content = '网络错误';
      }
      wx.showModal({
        title: '提示',
        content: content,
      })
      //改变状态，不然不会触发 _propertyChange
      this.setData({
        showShareModel: false
      })
    },
    showLoading: function () {
      wx.showLoading({
        title: '急速加载中...',
      })
    },
    hideLoading: function () {
      wx.hideLoading();
    },
    /**
     * 下载头像
     */
    downloadAvatar: function () {
      var that = this;
      console.log(that.data.avatar)
      wx.downloadFile({
        url: that.data.avatar,
        success: function (res) {
          console.log(res)
          that.setData({
            avatarPath: res.tempFilePath
          })
          that.drawImage();
        },
        fail: function () {
          console.log('rrrr')
          that.showErrorModel();
        }
      })
    },
    drawImage: function () {
      var that = this;
      //
      const ctx = wx.createCanvasContext('myCanvas', this);
      // ctx.clearRect(0, 0, windowWidth, windowHeight);
      var bgPath = this.data.shareImg;
      var userimg = this.data.avatarPath;

      ctx.setFillStyle(WHITE);
      ctx.fillRect(0, 0, windowWidth, windowHeight);
      // ctx.drawImage(userimg, 0, 0, 100,100);

      //绘制背景图片
      ctx.drawImage(bgPath, 0, 120, windowWidth, windowHeight * bgScale);

      //头像背景圆
      // ctx.arc(windowWidth / 2, avatarWidthScale / 2 * windowWidth + avatarHeightScale * windowHeight, (avatarWidthScale / 2) * windowWidth + avatarStrokeWidth, 0, 2 * Math.PI);
      // ctx.setFillStyle('#ffffff');

      // ctx.fill();

      //先绘制圆，裁剪成圆形图片
      ctx.save();
      ctx.beginPath();
      //圆的原点x坐标，y坐标，半径，起始弧度，终止弧度
      // console.log(windowWidth / 2)
      ctx.arc(60, 60, 45, 0, 2 * Math.PI);
      ctx.setStrokeStyle('#ffffff');
      ctx.stroke();
      ctx.clip();
      //绘制头像
      //图片路径，左上角x坐标，左上角y坐标，宽，高
      var avatarWidth = avatarWidthScale * windowWidth;//头像半径
      ctx.drawImage(userimg, 0, 0, avatarWidth, avatarWidth);
      ctx.restore();

      //绘制 content
      ctx.setFillStyle(GRAY_COLOR);
      ctx.setFontSize(18);
      ctx.setTextAlign('center');
      console.log(that.data.detailStr.content)
      ctx.fillText(that.data.detailStr.content, windowWidth / 2, contentScale * windowHeight);
      ctx.setFillStyle(GRAY_COLOR);
      ctx.setFontSize(18);
      ctx.setTextAlign('center');
      ctx.fillText(that.data.detailStr.contentOther, windowWidth / 2, contentScale2 * windowHeight);

      //绘制二维码
      ctx.drawImage(that.data.QRPath, windowWidth /2+40, qrCodeHeightScale * windowHeight+30, qrCodeWidthScale * windowWidth, qrCodeWidthScale * windowWidth);
      console.log('font------------>' + wx.canIUse('canvasContext.font'));

      //绘制 按压提示文字
      // ctx.setFillStyle(TINT_COLOR);
      // ctx.setFontSize(14);
      // ctx.setTextAlign('center');
      // ctx.fillText(that.data.detailStr.clickToMini, windowWidth / 2, decodeScale * windowHeight);

      //绘制加粗文字--------------------------------------------------------------
      //绘制昵称
      var chr = that.data.shareTitle;
      var row = [[],[],[]];
      ctx.setFillStyle('#000');
      ctx.setFontSize(16);
      for(var a =0;a<chr.length;a++){
        if(a<13){
          row[0].push(chr[a]);
        }else if(a>=13&&a<26){
          row[1].push(chr[a]);
        }else{
          row[2].push(chr[a]);
        }
      }
      for(var b=0;b<row.length;b++){
        ctx.fillText(row[b].join(""), windowWidth / 2+40,45+b*30,250);
      }
  
      //绘制文字一起赚
      ctx.setFillStyle(THEME_COLOR);
      ctx.setFontSize(24);
      ctx.setTextAlign('center');
      ctx.fillText(that.data.detailStr.tip, 70, topTextScale * windowHeight-10);
      // 
      ctx.setFontSize(16);
      ctx.setFillStyle('#000000');
      ctx.setTextAlign('center');
      ctx.fillText('每一个宝贝都值得用心呵护', 120, topTextScale * windowHeight + 20);
      //
      ctx.setFontSize(18);
      ctx.setFillStyle('#000000');
      ctx.setTextAlign('center');
      ctx.fillText('已记录' + that.data.weather3+'天', 100, topTextScale * windowHeight + 130);
      // 绘制  温湿度
      // ctx.setFillStyle(THEME_COLOR);
      ctx.setFontSize(36);
      ctx.setFillStyle('#000000');
      ctx.setTextAlign('center');
      ctx.fillText(that.data.weather1 +'℃', 70, topTextScale * windowHeight+70);

      // ctx.setFillStyle(THEME_COLOR);
      ctx.setFontSize(24);
      ctx.setFillStyle('#000000');
      ctx.setTextAlign('center');
      ctx.fillText(that.data.weather2 +'%RH', 70, topTextScale * windowHeight+100);
      //绘制 Geek小程序
      ctx.setFillStyle(TINT_COLOR);
      ctx.setFontSize(16);
      ctx.setTextAlign('center');
      ctx.fillText(that.data.detailStr.bpbMini, windowWidth / 2, bpbScale * windowHeight);

      //绘制到 canvas 上
      ctx.draw(false, function () {
        console.log('callback--------------->');
        that.saveCanvasImage();
      });
    },
    /**
     * 改变字体样式
     */
    setFontStyle: function (ctx, fontWeight) {
      if (wx.canIUse('canvasContext.font')) {
        ctx.font = 'normal ' + fontWeight + ' ' + '14px' + ' sans-serif';
      }
    },
    //转化为图片
    saveCanvasImage: function () {
      var that = this;
      wx.canvasToTempFilePath({
        canvasId: 'myCanvas',
        success: function (res) {
          that.setData({
            targetSharePath: res.tempFilePath,
            realShow: true
          })
        },
        complete: function () {
          that.hideLoading();
        }
      }, this)
    },
    /**
     * 保存到相册
     */
    saveImageTap: function () {
      var that = this;
      that.requestAlbumScope();
      // wx.removeStorageSync('shareImg');
    },
    /**
     * 检测相册权限
     */
    requestAlbumScope: function () {
      var that = this;
      // 获取用户信息
      wx.getSetting({
        success: res => {
          if (res.authSetting['scope.writePhotosAlbum']) {
            // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
            that.saveImageToPhotosAlbum();
          } else {
            wx.authorize({
              scope: 'scope.writePhotosAlbum',
              success(res) {
                that.saveImageToPhotosAlbum();
              },
              fail() {
                wx.showModal({
                  title: '提示',
                  content: '你需要授权才能保存图片到相册',
                  success: function (res) {
                    if (res.confirm) {
                      wx.openSetting({
                        success: function (res) {
                          if (res.authSetting['scope.writePhotosAlbum']) {
                            that.saveImageToPhotosAlbum();
                          } else {
                            //用户未同意保存图片权限
                          }
                        },
                        fail: function () {
                          //用户未同意保存图片权限
                        }
                      })
                    }
                  }
                })
              }
            })
          }
        }
      })
    },
    saveImageToPhotosAlbum: function () {
      var that = this;
      wx.saveImageToPhotosAlbum({
        filePath: that.data.targetSharePath,
        success: function () {
          wx.showModal({
            title: '',
            content: '✌️图片保存成功，\n快去分享到朋友圈吧',
            showCancel: false
          })
          that.hideDialog();
        }
      })
    },
    hideDialog: function () {
      this.setData({
        realShow: false,
        showShareModel: false
      })
    }
  }
})
