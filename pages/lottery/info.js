// pages/lottery/info.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    imgDir: app.globalData.baseUrl+"img/lottery/",
    info: null,
    prize: '',
    arrCity: [],
    idxCity: -1
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.showLoading({
      mask: true
    })
    app.get("lottery/info?r="+Math.random(), res=>{
      wx.hideLoading()
      var idx = res.regions.indexOfFld("id", res.info.region_id);
      this.setData({info: res.info, prize: res.prize, arrCity: res.regions, idxCity: idx});

      this.formPost = {address: res.info.address, real_name: res.info.real_name, tel_num: res.info.tel_num};
      if(idx>=0) this.formPost['regionId'] = this.data.arrCity[idx].id;
      else this.formPost['regionId'] = 0;
    });
  },

  onCityChg: function(e){
    this.setData({idxCity: e.detail.value});

    this.formPost['regionId'] = this.data.arrCity[e.detail.value].id;
  },

  formPost: {},

  onFldChange: function(e){
    this.formPost[e.currentTarget.dataset.fld] = e.detail.value

    console.log(this.formPost);
  },

  onFormSubmit: function(){

    if(this.formPost.regionId==0){
      wx.showToast({
        title: '请选择城市',
        icon: 'none'
      })
      return
    }

    if(!this.formPost.address){
      wx.showToast({
        title: '请填写收件地址',
        icon: 'none'
      })
      return
    }

    if(!this.formPost.real_name){
      wx.showToast({
        title: '请填写收件人姓名',
        icon: 'none'
      })
      return
    }

    if(!this.formPost.tel_num){
      wx.showToast({
        title: '请填写联系电话',
        icon: 'none'
      })
      return
    }

    wx.showLoading({
      mask: true
    })
    app.post("lottery/infoset", this.formPost, res=>{
      wx.hideLoading()
      wx.showToast({
        title: '提交成功。',
      })
      setTimeout(function(){
        wx.navigateBack()
      }, 1000);
      
    });
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

    return {
      title: '我刚刚抽中2020青岛啤酒节酒券，你也来试试吧！',
      path: `/pages/lottery/share?code=${this.data.info.res_code}`,
      imageUrl: this.data.imgDir+"prize.png"
    }
  }
})