// pages/lottery/index.js
const app = getApp();
Page({
	/**
   * 页面的初始数据
   */
	data: {
		isQQ: app.globalData.isQQ,
		imgDir: app.globalData.baseUrl + 'img/lottery/',
		imgCountAll: 3,
		loadFinish: false,

		idxGift: -1,
		arrGift: [ 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0 ],

		popupShow: false,
		//qq小程序注册表单
		formReg: {
			telNum: '',
			code: ''
		}
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

		this.load();
	},

	isStart: false,
	onLogin: function(userInfo, requireType) {
		if (userInfo && this.isStart) {
			this.isStart = false;
			this.onRunTap();
		}
	},

	getPhoneNumber: function(e) {
		let encryptedData = e.detail.encryptedData;
		let iv = e.detail.iv;
		wx.hideLoading({ mask: true });
		let that = this;
		app.post(`account/wxa/bindtelnum`, { encryptedData, iv }, (res) => {
			wx.hideLoading();
			app.setUser(res.user);

			that.setData({ popupShow: false });
		});
	},

	load: function() {
		app.get(
			'lottery/index?r=' + Math.random(),
			(res) => {
				if (res.joined == 1) {
					wx.hideLoading();
					wx.redirectTo({
						url: '/pages/lottery/res'
					});
					return;
				}
				this.setData({ timeEnd: res.timeEnd });
			},
			(fail) => {}
		);
	},

	countImgLoaded: 0,
	onImgLoaded: function() {
		this.countImgLoaded++;
		if (this.countImgLoaded >= this.data.imgCountAll) {
			wx.hideLoading();
			this.setData({ loadFinish: true });
		}
	},

	isRunning: false,
	msec: 0.2,
	isWin: 0, //0表示未完成抽奖请求，1表示未中奖，2表示已中奖
	maxMsec: 4,
	onRunTap: function() {
		if (!app.globalData.userInfo) {
			this.isStart = true;
			this.setData({
				popupShow: true
			});
			return;
		}
		if (this.isRunning) return;

		if (this.isWin > 0) {
			wx.navigateTo({
				url: 'res'
			});
			return;
		}

		this.isRunning = true;

		this.msec = 0.1;
		var idx = Math.floor(Math.random() * this.data.arrGift.length);

		this.setData({ idxGift: idx });

		app.get('lottery/start?r=' + Math.random(), (res) => {
			this.isWin = res.win == 1 ? 2 : 1;
		});

		this.cjrun();
	},

	cjrun: function() {
		var v = Math.sqrt(this.msec + 100) - 10;
		this.msec += v;

		let that = this;
		setTimeout(function() {
			if (that.msec > that.maxMsec && that.isWin == 0) {
				that.setData({ idxGift: -1 });
				wx.showToast({
					title: '网络故障，抽奖失败。',
					icon: 'none'
				});
				that.isRunning = false;
				return;
			}

			var idx = that.data.idxGift + 1;
			if (idx == that.data.arrGift.length) idx = 0;
			that.setData({ idxGift: idx });

			if (that.msec > that.maxMsec && that.isWin - 1 == that.data.arrGift[idx]) {
				setTimeout(function() {
					that.isRunning = false;
					wx.navigateTo({
						url: 'res'
					});
				}, 1000);

				return;
			}

			that.cjrun();
		}, v * 1000);
	},

	onHidePopup: function() {
		this.setData({ popupShow: false });
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

		let that = this;
		wx.showLoading({ mask: true });
		app.post('account/qqa/bindtelnum', form, (res) => {
			wx.hideLoading();
			app.setUser(res.user);

			that.setData({ popupShow: false });
		});
	}
});
