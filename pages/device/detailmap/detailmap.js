var QQMapWX = require('../../../utils/qqmap-wx-jssdk');
var qqmapsdk= new QQMapWX({
  key: "TEMBZ-BB4K2-M7GUC-C6LM4-PZLEO-AWBOF"        // 必填
})
Page({
 
  /**
   * 页面的初始数据
   */
  data: {
    latitude: '',
    longitude: '',
    address:'',
    markers: [
      {
        id: 0,
        latitude: '',
        longitude: '',
        // alpha:0,
        callout:{
          content: "",
          padding:10,
          display:'ALWAYS',
          textAlign:'center',
          borderRadius: 10,
          borderColor:'#ff0000',
          borderWidth: 2,
        }
 
      },
    ],
    mapWidth:'',
    mapHeight:''
 
  },
  toaddress:function(e){
    console.log(e)
    var id =e.markerId
    console.log(id)
  },
 
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var that=this;
    var hisdata=JSON.parse(options.data);
    var latitude1 = "markers[" + 0 + "].latitude";
    var longitude1 = "markers[" + 0 + "].longitude";
    var content = "markers[" + 0 + "].callout.content";
    qqmapsdk.reverseGeocoder({
      location: {
          latitude:hisdata.weidu,
          longitude: hisdata.jingdu
      },
      success: function(res) {
          that.setData({
            address:res.result.address,
              latitude:hisdata.weidu,
              longitude:hisdata.jingdu,
              [latitude1]:hisdata.weidu,
              [longitude1]:hisdata.jingdu,
              [content]:res.result.address+'\n'+'温度1:'+hisdata.temperature01+'℃/温度2:'+hisdata.temperature02+'℃/湿度:'+hisdata.humidity+'%RH'+'\n'+'时间'+hisdata.time,
          })
      },
      fail: function(res) {
          console.log(res);
      },
      complete: function(res) {
          console.log(res);
      }
   
  });   

        var sy = wx.getSystemInfoSync(),
        mapWidth = sy.windowWidth*2,
        mapHeight = sy.windowHeight*2;
        this.setData({
          mapWidth:mapWidth,
          mapHeight:mapHeight
        })
  },
})