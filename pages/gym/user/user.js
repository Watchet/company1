import {Api} from '../../../utils/api.js';
var api = new Api();
const app = getApp();
import {Token} from '../../../utils/token.js';
const token = new Token();


Page({
  data: {
     img:"background:url('/images/gym.png')",
  },
  //事件处理函数

  onLoad(options){
    const self = this;
    self.setData({
      img:app.globalData.img,
    });
  },
 
  intoPath(e){
    const self = this;
    api.pathTo(api.getDataSet(e,'path'),'nav');
  },

  intoPathRedi(e){
    const self = this;
    wx.navigateBack({
      delta:1
    })
  },
  intoPathRedirect(e){
    const self = this;
    api.pathTo(api.getDataSet(e,'path'),'redi');
  }, 
   tel:function () {
    wx.makePhoneCall({
      phoneNumber: '18192654258',
    })
  },
})

  