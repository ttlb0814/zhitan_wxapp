//index.js
//获取应用实例
const app = getApp();

Page({
	data: {
		userLoaded: false,

		userInfo: null,

		//（仅当userInfo为null时有效）当该值为“reg”时，显示授权按钮，值为“tel_num”时，显示获取电话号码按钮
		requireType: null
	},

	onLoad: function() {
		if (app.globalData.userLoaded) this.onLogin(app.globalData.userInfo, app.globalData.requireType);
	},

	onLogin: function(userInfo, requireType) {
		if (app.globalData.showLottery == 1) {
			wx.redirectTo({
				url: '/pages/lottery/ad'
			});
			return;
		}

		//requireType = 'reg'; //开发测试使用

		if (requireType != 'reg' || true) {
			wx.switchTab({
				url: '/pages/note/index'
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

	getPhoneNumber: function(e) {
		let encryptedData = e.detail.encryptedData;
		let iv = e.detail.iv;
		wx.hideLoading({ mask: true });
		app.post(`account/wxa/bindtelnum`, { encryptedData, iv }, (res) => {
			wx.hideLoading();
			app.setUser(res.user);
		});
	}
});
