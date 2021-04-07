import { reqDeleteMember,reqDevShare,reqEditSharemember } from '../../../service/service.js'

Page({
  data: {
    member: {},
  
    select_all: false,
    listData: [
      // { code: "1", text: "测试1" },
      // { code: "2", text: "测试2"},
      // { code: "3", text: "测试3"},
     
   
    ],
    chooselist:[],
    batchIds: '',    //选中的ids
    queryval:''
  },
  onLoad: function (options) {
    const member = JSON.parse(options.member)
    this.setData({ member })
  },
  onShow() {
    this.requerydev()
  },
  async requerydev(){
    const mobile = wx.getStorageSync('mobile')
    const res = await reqDevShare(this.data.member.phone,mobile,'')
    console.log(res)
    let newarr=[]
    if (res.data.code === 0) {
      let cur=res.data.data;
      cur.forEach(tem => {        
          tem.ishow = true;
      })
       this.setData({
        listData:cur
       })
      var arr =res.data.data;
      arr.forEach(element => {
        if(element.shared){
          newarr.push(element.shebeibianhao)
        }
      });
      console.log(newarr)
      let chooselist=res.data.data.filter(item => { // item为数组当前的元素
        return item.shared==true
    })
       this.setData({
        chooselist:chooselist,
        listData:res.data.data,
        batchIds:newarr
       })
    } else {
      wx.showToast({
        title: res.data.message,
        icon: 'none',
        duration: 2000
      })
    }
    
  },
  async requeryadev(){    
    const mobile = wx.getStorageSync('mobile')
    const res = await reqDevShare(this.data.member.phone,mobile,this.data.queryval)
    console.log(res)
    if (res.data.code === 0) {
      let queryarr=res.data.data;
      let arr=this.data.listData
      arr.forEach((item, index) => {
        for(let i = 0; i < queryarr.length; i++) {
          if (queryarr[i].shebeibianhao === item.shebeibianhao) {
            item.ishow = true      
             
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
      console.log(arr)
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
  editItem() {
    wx.navigateTo({
      url: './edit/edit?member=' + JSON.stringify(this.data.member)
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
     console.log(e)
     console.log(e.detail.value)
     let choose=this.data.batchIds.concat(e.detail.value)
     let choosedev= this.unique(choose)
    //let choose=e.detail.value
     this.setData({
       batchIds: e.detail.value  //单个选中的值
     })
   },
　  
  unique:function(arr){
        return Array.from(new Set(arr))
  },
   //提交
   async bindsubmit() {
    const mainName = wx.getStorageSync('mobile');
    let devices=this.data.batchIds.toString();
    const res = await reqEditSharemember(mainName, this.data.member.phone, this.data.member.relation_name,devices);
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

  async deleteItem() {
    const mobile = wx.getStorageSync('mobile')
    const res = await reqDeleteMember(mobile, this.data.member.phone)
    wx.showToast({
      title: '删除成功',
      success() {
        setTimeout(() => {
          wx.navigateBack({ delta: 1 })
        }, 2000)
      }
    })
  }
})