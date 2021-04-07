import API from '../../../service/index.js';
import {reqDevShare,reqAddSharemember} from '../../../service/service.js'
Page({

  data: {
    mobile: '',
    name: '',
    select_all: false,
    listData: [
      // { code: "1", text: "测试1" },
      // { code: "2", text: "测试2"},
      // { code: "3", text: "测试3"},
     
   
    ],
    batchIds: '',    //选中的ids
    queryval:''
  },
  onShow() {
    this.requerydev()
  },
  async requerydev(){
    const mobile = wx.getStorageSync('mobile')
    const res = await reqDevShare('',mobile,'')
    console.log(res)
 
    if (res.data.code === 0) {
      let cur=res.data.data;
      cur.forEach(tem => {        
          tem.ishow = true;
      })
       this.setData({
        listData:cur
       })
    } else {
      wx.showToast({
        title: res.data.message,
        icon: 'none',
        duration: 2000
      })
    }
    
  },
  queryval(e) {
    this.setData({ queryval: e.detail.value })
  },
  async requeryadev(){

     
    const mobile = wx.getStorageSync('mobile')
    const res = await reqDevShare('',mobile,this.data.queryval)
    console.log(res)
    if (res.data.code === 0) {
      let queryarr=res.data.data;
      let arr=this.data.listData
      let allarr=[]
      arr.forEach((item, index) => {
        allarr.push(item.shebeibianhao)

       })
   // console.log(allarr.indexOf(queryarr[0].shebeibianhao))
    // let cindex=allarr.indexOf(queryarr[0].shebeibianhao)
    // arr.map((item,index)=>{
    //   return item.ishow=false
    // })

      arr.forEach((item, index) => {
        for(let i = 0; i < queryarr.length; i++) {
          if (queryarr[i].shebeibianhao === item.shebeibianhao) {
            item.ishow = true      
            arr[index].ishow=true     
            this.setData({           
              [`listData[${index}].ishow`] :true       
            })
            break;
          } else {
            item.ishow = false
            this.setData({      
              [`listData[${index}].ishow`] : false
            })
          }
        }
      })
    // this.setData({
    //   'listData[index].ishow':false,
    //  listData:arr
    // })
      
    } else {
      wx.showToast({
        title: res.data.message,
        icon: 'none',
        duration: 2000
      })
    }
    
  },
  bindInputName(e) {
    this.setData({
      name: e.detail.value
    })
  },
  bindInputMobile(e) {
    this.setData({
      mobile: e.detail.value
    })
  },
  //全选与反全选
  selectall: function (e) {
 // console.log(e)
    var that = this;
    var arr = [];   //存放选中id的数组
    for (let i = 0; i < that.data.listData.length; i++) {

      that.data.listData[i].shared = (!that.data.select_all)

      if (that.data.listData[i].shared == true){
        // 全选获取选中的值
        arr = arr.concat(that.data.listData[i].shebeibianhao.split(','));
      }
    }
 // console.log(arr)
    that.setData({
      listData: that.data.listData,
      select_all: (!that.data.select_all),
      batchIds:arr
    })
  },

  // 单选
  checkboxChange: function (e) {
   // console.log(e.detail.value)
    this.setData({
      batchIds: e.detail.value  //单个选中的值
    })
  },
  async bindsubmit() {
    const mainName = wx.getStorageSync('mobile');
    let devices=this.data.batchIds.toString();
    const res = await reqAddSharemember(mainName, this.data.mobile, this.data.name,devices);
    if(res.data.code === 0) {
      wx.showToast({
        title: '添加成功',
        success: () => {
          setTimeout(() => {
            wx.navigateBack({
              delta: 1
            })
          }, 1500)
        }
      })
    } else {
      wx.showToast({
        title: res.data.message,
        icon: 'none',
        duration: 1500
      })
    }
  },
  reqAddMember(mainname, aftername, nickname) {
    return new Promise((resolve, reject) => {
      wx.request({
        url: API.reqAddMember,
        data: {
          mainname,
          aftername,
          nickname
        },
        success: res => {
          resolve(res);
        }
      })
    })
  }
})