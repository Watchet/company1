import {Api} from '../../../utils/api.js';
const api = new Api();
const app = getApp();
import {Token} from '../../../utils/token.js';
const token = new Token();


Page({
  data: {
    windowWidth: wx.getSystemInfoSync().windowWidth,
    windowHeight: wx.getSystemInfoSync().windowHeight,
    hiddenSmallImg:true,
    countsArray:[1,2,3,4,5,6,7,8,9,10],
    productCounts:1,
    currentTabsIndex:0,
    cartTotalCounts:0,
    minusStatus: 'disabled',
    mainData:[],
    products:[],
    totalPrice:0,
    isChooseAll:'',
    isFirstLoadAllStandard:['getMainData'],
  },
  
  onLoad() {
    const self = this;
    api.commonInit(self);
  },

  /*添加到购物车*/
  onAddingToCartTap:function(e){
      if(this.data.flayTo){
          return;
      }
      this._flyToCartEffect(e); 
  },
  _flyToCartEffect:function(e){
    //获得当前点击的位置，距离可视区域左上角
    const self = this;
    console.log(333,e);
    var touches=e.touches[0];
    console.log(touches);
    var diff={
      x:-touches.clientX*0.32+'px',
      y:self.data.windowHeight-touches.clientY-70+'px',
    },
    style = 'display: block;-webkit-transform:translate('+diff.x+','+diff.y+') rotate(350deg) scale(0.3); opacity: 1;',  //移动距离
    style1 = '-webkit-transform:scale(1.1)'
    var flay_circle = e.target.dataset.index;
    if(flay_circle == 0){
      var style2= '-webkit-transform:scale(0,0);opacity:0;background:#fff;transform:scale(0.1,0.1);';
    }else{
        var style2= '-webkit-transform: none;transform:none;';
    }
    self.setData({
      flayTo:e.target.dataset.index,
      translateStyle:style,
      shoppingStyle:style1,
    });
    setTimeout(()=>{
      self.setData({
        flayTo:0,
        translateStyle:style2,  //恢复到最初状态
        isShake:true, 
      });
      setTimeout(()=>{
        var counts=self.data.cartTotalCounts+self.data.productCounts;
        self.setData({
            isShake:false,
       
            translateStyle:'opacity:0;'
        });
      },300);
    },400);
  },

  onShow() {

    const self = this;
    self.data.mainData = api.getStorageArray('cartData');
    console.log('onShow',self.data.mainData);
    self.checkChooseAll();
    self.setData({
      web_isChooseAll:self.data.isChooseAll,
      web_mainData:self.data.mainData
    });
    api.checkLoadAll(self.data.isFirstLoadAllStandard,'getMainData',self);
    self.countTotalPrice();

  },

  checkChooseAll(){
    const self = this;
    var isChooseAll = true;
    for (var i = 0; i < self.data.mainData.length; i++) {
      if(!self.data.mainData[i].isSelect){
        isChooseAll = false;
      };
    };
    self.data.isChooseAll = isChooseAll;
    self.setData({
      web_isChooseAll:self.data.isChooseAll
    });
  },

  chooseAll(){
    const self = this;
    self.data.isChooseAll = !self.data.isChooseAll;
    for (var i = 0; i < self.data.mainData.length; i++) {
      self.data.mainData[i].isSelect = self.data.isChooseAll;
      api.setStorageArray('cartData',self.data.mainData[i],'id',999);
    };
    self.setData({
      web_isChooseAll:self.data.isChooseAll,
      web_mainData:self.data.mainData
    });
    self.countTotalPrice();
  },

  delete(){
    const self = this;
    for(var i=0;i<self.data.mainData.length;i++){
      if(self.data.mainData[i].isSelect){
        api.delStorageArray('cartData',self.data.mainData[i],'id');
      }
    };
    self.data.mainData = api.getStorageArray('cartData');
    self.checkChooseAll();
    self.setData({
      web_mainData:self.data.mainData
    });
  },

  choose(e){
    const self = this;
    const index = api.getDataSet(e,'index');
    if(self.data.mainData[index].isSelect){
      self.data.mainData[index].isSelect = false;
    }else{
      self.data.mainData[index].isSelect = true;
    };
    api.setStorageArray('cartData',self.data.mainData[index],'id',999);
    self.setData({
      web_mainData:self.data.mainData
    });
    self.checkChooseAll();
    self.countTotalPrice();
  },

  countTotalPrice(){
    const self = this;
    var totalPrice = 0;
    var cartTotalCounts = 0;
    for(var i=0;i<self.data.mainData.length;i++){
      if(self.data.mainData[i].isSelect){
        totalPrice += self.data.mainData[i].price*self.data.mainData[i].count;
        cartTotalCounts += self.data.mainData[i].count;
      };
    };
    self.setData({
      web_cartTotalCounts:cartTotalCounts,
      web_totalPrice:totalPrice.toFixed(2),
    })
  },

  formIdAdd(e){
    api.WxFormIdAdd(e.detail.formId,(new Date()).getTime()/1000+7*86400);  
  },

  pay(e){
    const self = this;
    api.buttonCanClick(self);
    let formId = e.detail.formId;
    console.log(999,formId)
    const skuDatas = [];
    for(var i=0;i<self.data.mainData.length;i++){
      if(self.data.mainData[i].isSelect){
        skuDatas.push({
          id:self.data.mainData[i].id,
          count:self.data.mainData[i].count
        });
      }
    };
    const postData = {
      tokenFuncName:'getMallToken',
    };
    const callback = (res)=>{
      console.log(res);
      if(res.info.data.length>0&&res.info.data[0].phone){
       
        const c_postData = {
          tokenFuncName:'getMallToken',
          sku:skuDatas,
          type:1

        };
        if(c_postData.sku.length==0){
          api.showToast('未选择商品','none');
          return;
        };
        const c_callback = (res)=>{
          api.buttonCanClick(self,true);
          if(res&&res.solely_code==100000){
            api.pathTo('/pages/mall/confirmOrder/confirmOrder?order_id='+res.info.id,'nav');        
          }else{
            api.showToast(res.msg,'none');
          };
        };
        api.addOrder(c_postData,c_callback);
      }else{
        api.showToast('请完善信息','none');
        api.buttonCanClick(self,true);
        api.pathTo('/pages/mall/userInfo/userInfo','nav');
      };
    };
    api.userInfoGet(postData,callback)
  },


  counter(e){
    const self = this;
    const index = api.getDataSet(e,'index');
    if(api.getDataSet(e,'type')=='+'){  
       self.data.mainData[index].count++;
      if(self.data.flayTo){
          return;
      }
      self.onAddingToCartTap(e);
    }else{
      if(self.data.mainData[index].count > 1){
        self.data.mainData[index].count--;
      }
    };
    api.setStorageArray('cartData',self.data.mainData[index],'id',999);
    self.setData({
      web_mainData:self.data.mainData
    });
    self.countTotalPrice();
  },


  bindManual(e) {
    const self = this;
    const index = api.getDataSet(e,'index');
    var num = e.detail.value;
    if(!num||num<1){
      num = 1;
    };
    self.data.mainData[index].count = num;
    api.setStorageArray('cartData',self.data.mainData[index],'id',999);
    self.setData({
      num: num,
      web_mainData:self.data.mainData
    });
    self.countTotalPrice();
  }, 



  intoPathRedi(e){
    const self = this;
    api.pathTo(api.getDataSet(e,'path'),'redi');
  },


   
  
})
