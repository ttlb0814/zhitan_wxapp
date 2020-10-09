// components/btn-reg/index.js

//组件支持时间bindmytap，数据可以直接使用data-XX的格式设置到组件上面

const app = getApp();
Component({
	options: {
		addGlobalClass: true
	},

	/**
   * 组件的属性列表
   */
	properties: {
		/**
     * 按钮中的文字内容
     */
		text: String,

		/**
     * 按钮中的图片
     */
		src: String,

		/**
     * 是否需要获取电话号码
     */
		requireTelnum: {
			type: Boolean,
			value: false
		},

		/**
     * 当页面中的onLogin被执行时，更改该属性的值（可以设置为当前时间），组件会自动更新用户状态
     */
		loginTime: {
			type: Number,
			value: null,
			observer: function(newVal) {
				//console.log(newVal, "Global Data:", app.globalData)
				this.setData({
					user: app.globalData.userInfo,
					userTP: app.globalData.userTP || null
				});

				if (this.data.flagBtnTap) {
					if (this.data.user || (this.data.userTP && !this.data.requireTelnum)) this._onBtnTap();
					else if (this.properties.requireTelnum) {
						this.setData({ showTelPanel: true });
					}
					this.setData({ flagBtnTap: false });
				}
			}
		}
	},

	/**
   * 组件的初始数据
   */
	data: {
		user: null,
		userTP: null,
		isQQ: app.globalData.isQQ,
		showTelPanel: false,

		//qq小程序注册表单
		formReg: {
			telNum: '',
			code: ''
		},

		flagBtnTap: false
	},

	/**
   * 组件的方法列表
   */
	methods: {
		_onBtnTap: function() {
			this.triggerEvent('mytap', this);
		},

		_onShowTelPanel: function() {
			this.setData({ showTelPanel: true });
		},
		_onHideTelPanel: function() {
			this.setData({ showTelPanel: false });
		},

		_invalid: function() {},

		//微信端授权获取手机号
		_onGetPhoneNumber: function(res) {
			console.log('_onGetPhoneNumber', res);
			var d = res.detail;
			if (d.errMsg == 'getPhoneNumber:fail user deny') {
				wx.showToast({
					title: '发布内容需要手机注册认证',
					icon: 'none',
					duration: 4000
				});
				this._onHideTelPanel();
				return;
			}
			if (d.errMsg != 'getPhoneNumber:ok') {
				wx.showToast({
					title: d.errMsg,
					icon: 'none'
				});
				return;
			}

			let that = this;

			wx.showLoading({ mask: true });
			app.post(`account/wxa/bindtelnum`, { encryptedData: d.encryptedData, iv: d.iv }, (res) => {
				wx.hideLoading();
				app.setUser(res.user);

				that._onHideTelPanel();
				that._onBtnTap();
			});
		},

		_onGetUserInfo: function(res) {
			var d = res.detail;
			if (d.errMsg == 'getUserInfo:fail auth deny') {
				wx.showToast({
					title: '请允许授权',
					icon: 'none'
				});
				return;
			}
			if (d.errMsg != 'getUserInfo:ok') {
				wx.showToast({
					title: d.errMsg,
					icon: 'none'
				});
				return;
			}
			//console.log(d);
			app.regUser(d.encryptedData, d.iv);

			this.setData({ flagBtnTap: true });
		},

		/**qq小程序注册相关函数**/
		_onRegInput(e) {
			var fld = 'formReg.' + e.currentTarget.dataset.fld;
			this.setData({
				[fld]: e.detail.value
			});
		},

		_onCodeTap: function() {
			var form = this.data.formReg;
			if (form.telNum.length != 11) return;

			wx.showLoading({ mask: true });
			app.post('account/qqa/smsvcode', form, (res) => {
				wx.hideLoading();

				wx.showToast('发送成功。');
			});
		},

		_onRegTap: function() {
			var form = this.data.formReg;
			if (form.telNum.length != 11 || !form.code) return;

			let that = this;
			wx.showLoading({ mask: true });
			app.post('account/qqa/bindtelnum', form, (res) => {
				wx.hideLoading();

				app.setUser(res.user, null);

				that._onHideTelPanel();

				that._onBtnTap();
			});
		}
	}
});
