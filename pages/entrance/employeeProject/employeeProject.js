import {Api} from '../../../utils/api.js';
const api = new Api();
const app = getApp();
import {Token} from '../../../utils/token.js';
const token = new Token();


Page({

  data: {

    mainData:[],
    isFirstLoadAllStandard:['userGet','getMainData'],
  },

  onLoad: function () {
    const self = this;
    api.commonInit(self);  	
    self.userGet();
  },

  userGet(){
    const self = this;
    const postData = {};
    postData.tokenFuncName = 'getEmployeeToken';
    const callback = (res)=>{
      if(res.info.data.length>0){
        self.data.userData = res.info.data[0];
      };
      api.checkLoadAll(self.data.isFirstLoadAllStandard,'userGet',self);
      self.setData({
        web_userData:self.data.userData,
      });
      self.getMainData()
    };
    api.userGet(postData,callback);
  },


  getMainData(isNew){
    const  self =this;
    if(isNew){
      api.clearPageIndex(self)
    };
    const postData={};
    postData.tokenFuncName = 'getEmployeeToken';
    postData.paginate = api.cloneForm(self.data.paginate);
    postData.searchItem = {
      thirdapp_id:getApp().globalData.solely_thirdapp_id,
      user_type:2
    };
    if(self.data.userData.info.behavior==2){
      postData.searchItem.sales_manager = self.data.userData.user_no
    };
    if(self.data.userData.info.behavior==3){
      postData.searchItem.project_manager = self.data.userData.user_no
    };
    const callback =(res)=>{
      if(res.info.data.length>0){
        self.data.mainData.push.apply(self.data.mainData,res.info.data);
      }else{
        self.data.isLoadAll = true;
        api.showToast('没有更多了','none');
      };
      api.checkLoadAll(self.data.isFirstLoadAllStandard,'getMainData',self);
      self.setData({
        web_mainData:self.data.mainData,
      });
    };
    api.projectGet(postData,callback);
  },     
  
  onReachBottom() {
    const self = this;
    if(!self.data.isLoadAll&&self.data.buttonCanClick){
      self.data.paginate.currentPage++;
      self.getMainData();
    };
  },

  intoPath(e){
    const self = this;
    api.pathTo(api.getDataSet(e,'path'),'nav');
  },


})
