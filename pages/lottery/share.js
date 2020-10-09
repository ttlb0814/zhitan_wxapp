// pages/lottery/share.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    imgDir: app.globalData.baseUrl+"img/lottery/",
    info: null,
    prize: ''
  },

  code: '',

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.code = options.code;
    app.post("lottery/share", {
      code: this.code
    }, res=>{
      this.setData({info: res.info, prize: res.prize});
    });
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    var title = ''
    if(this.data.info.is_win>0) title = '我刚刚抽中2020青岛啤酒节酒券，你也来试试吧！';
    else title = '2020青岛啤酒节酒券免费领，你也来试试吧！';

    return {
      title: title,
      path: `/pages/lottery/share?code=${this.code}`,
      imageUrl: this.data.imgDir+"prize.png"
    }
  }
})