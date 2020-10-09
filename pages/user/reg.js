// pages/user/reg.js
const app = getApp();
Page({
	/**
   * 页面的初始数据
   */
	data: {
		userInfo: null,
		requireType: null,
		isQQ: app.globalData.isQQ,

		//qq小程序注册表单
		formReg: {
			telNum: '',
			code: ''
		}
	},

	/**
   * 生命周期函数--监听页面加载
   */
	onLoad: function() {
		this.setData({
			userInfo: app.globalData.userInfo,
			requireType: app.globalData.requireType
		});
	},

	backAfterLogin: false,
	onLogin: function(userInfo, requireType) {
		if (this.backAfterLogin && app.globalData.isQQ) {
			wx.navigateBack();
			return;
		}

		this.setData({
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
		this.backAfterLogin = true;
		app.regUser(detail.encryptedData, detail.iv);
	},

	getPhoneNumber: function(e) {
		let encryptedData = e.detail.encryptedData;
		let iv = e.detail.iv;
		wx.hideLoading({ mask: true });
		app.post(`account/wxa/bindtelnum`, { encryptedData, iv }, (res) => {
			wx.hideLoading();
			app.setUser(res.user);

			wx.showToast({
				title: '绑定成功'
			});
			wx.navigateBack();
		});
	},

	/**qq小程序注册相关函数**/
	onRegInput(e) {
		var fld = 'formReg.' + e.currentTarget.dataset.fld;
		this.setData({
			[fld]: e.detail.value
		});
	},

	onCodeTap: function() {
		var form = this.data.formReg;
		if (form.telNum.length != 11) return;

		wx.showLoading({ mask: true });
		app.post('account/qqa/smsvcode', form, (res) => {
			wx.hideLoading();

			wx.showToast('发送成功。');
		});
	},

	onRegTap: function() {
		var form = this.data.formReg;
		if (form.telNum.length != 11 || !form.code) return;

		wx.showLoading({ mask: true });
		app.post('account/qqa/bindtelnum', form, (res) => {
			wx.hideLoading();

			wx.showToast('注册成功。');

			app.setUser(res.user, null);
			wx.navigateBack();
		});
	}
});
