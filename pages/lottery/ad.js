// pages/lottery/ad.js
const app = getApp();
Page({
	/**
   * 页面的初始数据
   */
	data: {
		imgDir: app.globalData.baseUrl + 'img/lottery/',
		imgCountAll: 5,

		userInfo: null,
		requireType: ''
	},

	/**
   * 生命周期函数--监听页面加载
   */
	onLoad: function(options) {
		if (app.globalData.userLoaded) this.onLogin(app.globalData.userInfo, app.globalData.requireType);
		wx.showLoading({
			title: '加载中...',
			mask: true
		});
	},

	flagToIndex: false,
	onLogin: function(userInfo, requireType) {
		if (this.flagToIndex && requireType != 'reg') {
			wx.redirectTo({
				url: 'index'
			});
			return;
		}
		this.setData({
			userLoaded: true,
			userInfo: userInfo,
			requireType: requireType
		});
	},

	getUserInfo: function(e) {
		var detail = e.detail;
		if (detail.errMsg != 'getUserInfo:ok') {
			wx.showToast({
				title: '请允许授权',
				icon: 'none'
			});
			return;
		}

		app.regUser(detail.encryptedData, detail.iv);
	},

	onGetUserTap: function() {
		this.flagToIndex = true;
	},

	countImgLoaded: 0,
	onImgLoaded: function() {
		this.countImgLoaded++;
		if (this.countImgLoaded >= this.data.imgCountAll) {
			wx.hideLoading();
			this.setData({ loadFinish: true });
		}
	},

	/**
   * 用户点击右上角分享
   */
	onShareAppMessage: function() {
		return {
			title: '2020青岛啤酒节酒券免费领，你也来试试吧！',
			path: `/pages/lottery/ad`,
			imageUrl: this.data.imgDir + 'prize.png'
		};
	}
});
