import {Api} from '../../../utils/api.js';
const api = new Api();
const app = getApp();
import {Token} from '../../../utils/token.js';
const token = new Token();



Page({
  data: {
    mainData:[],
    addressData:[],
    userInfoData:[],
    idData:[],
   
    searchItem:{
      isdefault:1
    },
    submitData:{
      passage1:''
    },
    order_id:'',
    isFirstLoadAllStandard:['getMainData'],
  },

  onLoad() {
    const self = this;
    api.commonInit(self);
    getApp().globalData.address_id = '';
  },

  onShow(){
    const self = this;
    self.data.searchItem = {};
    if(getApp().globalData.address_id){
      self.data.searchItem.id = getApp().globalData.address_id;
    }else{
      self.data.searchItem.isdefault = 1;
    };
    for (var i = 0; i < wx.getStorageSync('payPro').length; i++) {
      self.data.idData.push(wx.getStorageSync('payPro')[i].id)
    }
    self.getMainData();
    console.log(self.data.idData)
    self.getAddressData();
  },




  getMainData(){
    const self = this;
    const postData = {};
    postData.searchItem = {
      thirdapp_id:getApp().globalData.mall_thirdapp_id,
      id:['in',self.data.idData]
    }
    const callback = (res)=>{
      if(res.info.data.length>0){
        self.data.mainData.push.apply(self.data.mainData,res.info.data);
        self.countTotalPrice(); 
        
      }else{
        self.data.isLoadAll = true;
        api.showToast('没有更多了','none');
      }
      api.checkLoadAll(self.data.isFirstLoadAllStandard,'getMainData',self);
      self.setData({
        web_mainData:self.data.mainData,
      });
      console.log(self.data.mainData)
      for (var i = 0; i < wx.getStorageSync('payPro').length; i++) {
        for (var j = 0; j < self.data.mainData.length; j++) {
          if(self.data.mainData[j].id == wx.getStorageSync('payPro')[i].id){
            self.data.countData={};
            self.data.countData.count = wx.getStorageSync('payPro')[i].count
            console.log(self.data.countData)
            self.data.mainData[j].push(self.data.countData)
          }
        }
      };
      
      self.checkLoadComplete()   
    };
    api.skuGet(postData,callback);
  },

  getAddressData(){
    const self = this;
    const postData = {}
    postData.tokenFuncName = 'getMallToken';
    postData.searchItem = api.cloneForm(self.data.searchItem);
    const callback = (res)=>{
      self.data.addressData = res;
      self.setData({
        web_addressData:self.data.addressData,
      });
    };
    api.addressGet(postData,callback);
  },


 

  addOrder(){
    const self = this;
    api.buttonCanClick(self);
    if(!self.data.order_id){
      const postData = {
        tokenFuncName : 'getMallToken',
        sku:[
          {id:self.data.id,count:self.data.count}
        ],
        pay:{wxPay:self.data.totalPrice.toFixed(2)},
        type:1
      };
      if(self.data.addressData.info.data[0]){
        postData.snap_address = self.data.addressData.info.data[0];
      };
      const callback = (res)=>{
        if(res&&res.solely_code==100000){
          self.data.order_id = res.info
          self.pay(self.data.order_id);         
        }else{
          api.showToast(res.msg,'none')
        }
      };
      api.addOrder(postData,callback);
    }else{
      self.pay(self.data.order_id)
    }   
  },



  pay(order_id){
    const self = this;
    var order_id = self.data.order_id;
    const postData = {
      tokenFuncName : 'getMallToken',
      searchItem:{
        id:order_id
      },
      wxPay:self.data.totalPrice.toFixed(2),
      wxPayStatus:0
    };
    const callback = (res)=>{
      wx.hideLoading();
      api.showToast('订单已兑换','none')
      if(res.solely_code==100000){
        setTimeout(function(){
          api.pathTo('/pages/userOrder/userOrder','redi');
        },800) 
      }else{
        api.showToast('支付失败','none')
      }
      api.buttonCanClick(self,true)  
    };
    api.pay(postData,callback);
  },



  countTotalPrice(){  
    const self = this;
    var totalPrice = 0;
    totalPrice += self.data.count*parseFloat(self.data.mainData[0].price);
    self.data.totalPrice = totalPrice;
    self.setData({
      web_totalPrice:self.data.totalPrice.toFixed(2)
    });
  },

  intoPath(e){
    const self = this;
    api.pathTo(api.getDataSet(e,'path'),'nav');
  },

  changeBind(e){
    const self = this;
    api.fillChange(e,self,'submitData');
    console.log(self.data.submitData);
    self.setData({
      web_submitData:self.data.submitData,
    });  
  },
})
