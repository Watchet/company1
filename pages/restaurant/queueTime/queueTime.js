import {Api} from '../../../utils/api.js';
const api = new Api();
const app = getApp();
import {Token} from '../../../utils/token.js';
const token = new Token();


Page({
  data: {
    img:"background:url('/images/restaurant.png')",
  },
  onLoad: function () {
    this.setData({
      fonts:app.globalData.font
    })
  },
})