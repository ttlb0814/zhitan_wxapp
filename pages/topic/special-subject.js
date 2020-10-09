// pages/topic/special-subject.js
const app = getApp()
var datalist = require('../../utils/datalist');
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  	// 点赞
	approve(e) {
    if (!app.globalData.userInfo && !app.globalData.userTP) {
			wx.navigateTo({
				url: '/pages/user/reg'
			});
			return;
		}
    if (e.currentTarget.dataset.from == 'note') {
      let idx = e.currentTarget.dataset.idx;
      let id = this.data.dataList[idx].data_id;
      let val = e.currentTarget.dataset.val;
      app.post(`note/info/approve/${id}`, { val }, (res) => {
        this.setData({ ['dataList[' + idx + '].myApprove']: res.val });
      });
    } else {
      const post_id = e.currentTarget.dataset.postid;
      const id = e.currentTarget.dataset.tid;
      const type = e.currentTarget.dataset.type == 1 ? 0 : 1;
      const idx = e.currentTarget.dataset.idx;
      app.post('forum/post/approve', { id: id, post_id: post_id, type: type }, (res) => {
        const key = 'dataList[' + idx + '].approve_sta';
        this.setData({
          [key]: this.data.dataList[idx].approve_sta == 1 ? 0 : 1
        });
      });
    }
  },
  
  postInfo(e) {
		const id = e.currentTarget.dataset.id;
		// type 1:提问；2:交流
		const type = e.currentTarget.dataset.type;
		wx.navigateTo({
			url: `/pages/forum/info?id=${id}&type=${type}`
		});
  },
  
  previewImage(e) {
    if (e.currentTarget.dataset.from == 'note') {
      let current = e.currentTarget.dataset.src;
      let urls = e.currentTarget.dataset.item;
      wx.previewImage({ current, urls });
    } else {
      const current = e.currentTarget.dataset.currentImg
      const urls = e.currentTarget.dataset.urls
      wx.previewImage({current, urls})
    }
  },
  
  onLogin: function(user, requireType) {
		this.setData({
			pageLoginTime: new Date().valueOf()
		});
	},

	onLoadMore: function(e) {
		datalist.next(this, {id: this.data.id});
		wx.hideLoading()
	},

	refresh() {
		if (datalist.isLoading(this)) return;
		datalist.refresh(this, {id: this.data.id});
		wx.hideLoading()
  },
  
  	/**
 * 页面相关事件处理函数--监听用户下拉动作
 */
	onRefresh: function(e) {
		this.setData({ refresherTriggered: false });
		datalist.refresh(this, {id: this.data.id});
	},


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({id: options.id})
    app.post(`topic/info`, {id: options.id}, res => {
      this.setData({topicInfo: res.info})
    })
    wx.setNavigationBarTitle({
      title: options.id == 1 ? '特辑 |  联考高分经验' : options.id == 2 ? '特辑 |  画室真实经历' : '特辑 |  辛酸艺考路' // 导航栏标题
    });
    datalist.bind(this, `topic/contentlist`, {id: options.id})
    // datalist.bind(this, `user/userapprove/2051`)
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
		this.setData({
			pageLoginTime: new Date().valueOf()
		});
	},

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },
  

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})