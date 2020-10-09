const isQQ = false;

const refreshMsg = require('utils/refreshmsg');

import 'utils/umtrack-wx.js'; //微信小程序使用的umeng包
//import "utils/umtrack-qq.js"; //qq小程序使用的umeng包

App({
	umengConfig: {
		appKey: isQQ ? '5f4339b2b4b08b653e985657' : '5f43394dd3093221547c285c', //由友盟分配的APP_KEY
		// 使用Openid进行统计，此项为false时将使用友盟+uuid进行用户统计。
		// 使用Openid来统计微信小程序的用户，会使统计的指标更为准确，对系统准确性要求高的应用推荐使用Openid。
		useOpenid: true,
		// 使用openid进行统计时，是否授权友盟自动获取Openid，
		// 如若需要，请到友盟后台"设置管理-应用信息"(https://mp.umeng.com/setting/appset)中设置appId及secret
		autoGetOpenid: true,
		debug: false, //是否打开调试模式
		uploadUserInfo: true // 自动上传用户信息，设为false取消上传，默认为false
	}
});

//app.js
App({
	onLaunch: function() {
		Date.prototype.Format = function(fmt) {
			//author: meizz
			var o = {
				'M+': this.getMonth() + 1, //月份
				'd+': this.getDate(), //日
				'h+': this.getHours(), //小时
				'H+': this.getHours(), //小时
				'm+': this.getMinutes(), //分
				's+': this.getSeconds(), //秒
				'q+': Math.floor((this.getMonth() + 3) / 3), //季度
				S: this.getMilliseconds() //毫秒
			};
			if (/(y+)/i.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + '').substr(4 - RegExp.$1.length));
			for (var k in o)
				if (new RegExp('(' + k + ')').test(fmt))
					fmt = fmt.replace(
						RegExp.$1,
						RegExp.$1.length == 1 ? o[k] : ('00' + o[k]).substr(('' + o[k]).length)
					);
			return fmt;
		};

		/**
     * 数组扩展
     */
		Array.prototype.indexOfFld = function(fld, val) {
			for (var i = 0, len = this.length; i < len; i++) {
				if (this[i][fld] == val) return i;
			}
			return -1;
		};

		// 展示本地存储能力
		let that = this;
		this.globalData.requestHeader['Cookie'] = wx.getStorageSync('cookie');

		this.get('account/user/info', function(res) {
			that.globalData.userTP = res.userTP;
			if (res.globalData) {
				for (var k in res.globalData) {
					that.globalData[k] = res.globalData[k];
				}
			}

			if (res.user) {
				that.globalData.userLoaded = true;
				that.setUser(res.user);
			} else that._login();
		});
	},

	_login() {
		let that = this;
		wx.login({
			success: (res) => {
				// 发送 res.code 到后台换取 openId, sessionKey, unionId
				let code = res.code;
				that.post(
					'account/' + (that.globalData.isQQ ? 'qqa' : 'wxa') + '/login',
					{
						code
					},
					(res) => {
						that.globalData.userTP = res.userTP;
						that.globalData.userLoaded = true;
						if (res.succ == 0) {
							console.log(res.msg);
						} else that.setUser(res.user, res.require);
					}
				);
			}
		});
	},

	/**
   * 注册新用户，用户授权之后获取的数据
   * @param encryptedData e.detail.encryptedData
   * @param iv  e.detail.iv
   */
	regUser: function(encryptedData, iv) {
		let that = this;
		this.post(
			'account/' + (that.globalData.isQQ ? 'qqa' : 'wxa') + '/reg',
			{
				encryptedData: encryptedData,
				iv: iv
			},
			function(res) {
				if (res.user == null) {
					that.globalData.userTP = res.userTP;
					if (res.require) {
						that.setUser(null, res.require);
						return;
					}

					wx.showModal({
						title: '注册失败',
						content: '注册失败',
						showCancel: false
					});
					return;
				}

				that.globalData.userLoaded = true;

				that.setUser(res.user);
			}
		);
	},

	/**
   * 登录成功之后设置用户，设置成功之后会触发页面中的onLogin方法
   */
	setUser: function(user, requireType) {
		this.globalData.userInfo = user;
		this.globalData.requireType = requireType;

		if (user) refreshMsg.start();
		this._onLogin();
	},

	_onLogin: function() {
		var pages = getCurrentPages();
		pages.forEach((page) => {
			if (typeof page.onLogin == 'function') page.onLogin(this.globalData.userInfo, this.globalData.requireType);
		});
	},

	globalData: {
		//当前小程序是否QQ小程序
		isQQ: isQQ,

		// 是否显示消息数量
		approveMsgNum: true,
		discussMsgNum: true,

		// 头部自定义高度
		statusBarHeight: wx.getSystemInfoSync()['statusBarHeight'],
		userLoaded: false,

		//userInfo为null时，该值可能为reg或tel_num
		requireType: null,
		userInfo: null,
		userTP: null, //第三方登录信息，仅当userInfo为null时才可能有

		requestHeader: {
			'content-type': 'application/x-www-form-urlencoded',
			Cookie: ''
		},

		baseUrl: 'https://zhitan.xiaoyansuo.cn/'
		// baseUrl: 'https://www.zistip.com/'
	},

	/**** 网络请求函数 ****/
	_pretreatUrl(url) {
		if (/^https:\/\//.test(url)) return url;
		return this.globalData.baseUrl + url.replace(/^\//, '');
	},

	flagRequestRetry: false,
	post(url, dataObj, fn, fnFail) {
		url = this._pretreatUrl(url);
		let that = this;
		wx.request({
			url: url,
			data: dataObj,
			method: 'post',
			header: this.globalData.requestHeader,
			success: function(res) {
				that.flagRequestRetry = false;
				that._setCookie(res);
				if (typeof res.data == 'string') {
					wx.hideLoading();
					wx.showModal({
						title: '数据加载失败',
						content: res.data,
						showCancel: false
					});
				} else {
					if (!res.data.succ) {
						if (typeof fnFail == 'function') fnFail(res.data);
						else {
							wx.hideLoading();
							var msg = res.data.msg;
							if (!msg) msg = '(没有具体错误信息)';
							wx.showModal({
								title: '操作失败',
								content: msg,
								showCancel: false
							});
						}
					} else if (typeof fn == 'function') fn(res.data);
				}
			},
			fail: function(res) {
				wx.hideLoading();
				if (!that.flagRequestRetry) {
					that.flagRequestRetry = true;
					that.post(url, dataObj, fn, fnFail);
				} else {
					that.flagRequestRetry = false;
					if (fnFail)
						fnFail({
							succ: 0,
							msg: res.errMsg
						});
				}
			}
		});
	},

	get(url, fn, fnFail) {
		url = this._pretreatUrl(url);
		let that = this;
		wx.request({
			url: url,
			method: 'get',
			header: this.globalData.requestHeader,
			success(res) {
				that._setCookie(res);
				if (typeof res.data == 'string') {
					wx.hideLoading();
					wx.showModal({
						title: '操作失败',
						content: res.data,
						showCancel: false
					});
				} else {
					if (!res.data.succ) {
						if (typeof fnFail == 'function') fnFail(res.data);
						else {
							var msg = res.data.msg;
							if (!msg) msg = '(没有具体错误信息)';
						}
					} else if (typeof fn == 'function') fn(res.data);
				}
			}
		});
	},

	uploadFile(url, filePath, formData, fnSucc, fnFail) {
		url = this._pretreatUrl(url);
		let that = this;

		var obj = {
			url: url,
			filePath: filePath,
			name: 'file',
			header: this.globalData.requestHeader
		};

		if (formData) obj['formData'] = formData;

		obj['success'] = function(res) {
			that._setCookie(res);
			if (res.statusCode != 200) {
				wx.hideLoading();
				wx.showModal({
					title: '上传文件失败',
					content: res.data
				});

				return;
			}
			if (fnSucc) fnSucc(JSON.parse(res.data));
		};

		obj['fail'] = function(res) {
			if (fnFail) fnFail(res);
		};

		return wx.uploadFile(obj);
	},

	downloadFile: function(url, filePath, fnComplete) {
		url = this._pretreatUrl(url);

		let that = this;

		var obj = {
			url: url,
			header: this.globalData.requestHeader
		};

		if (filePath) obj['filePath'] = filePath;

		obj['complete'] = function(res) {
			if (fnComplete) fnComplete(res);
		};

		wx.downloadFile(obj);
	},

	//调用上一页面的refresh函数
	/**
   * @params null|object (optional) 需要传给上一个页面的相关参数
   * @delta null|integer (optional) 同wx.navigateBack中的delta参数
   */
	prevRefresh: function(params, delta) {
		var pages = getCurrentPages();

		if (!delta) delta = 2;
		else delta = delta + 1;

		if (pages.length < delta) return;

		var prev = pages[pages.length - delta];
		if (!prev.refresh) return;
		prev.refresh(params);
	},

	_setCookie(res) {
		if (res.header['Set-Cookie']) {
			this.globalData.requestHeader['Cookie'] = res.header['Set-Cookie'];
			wx.setStorageSync('cookie', res.header['Set-Cookie']);
		} else if (res.header['set-cookie']) {
			this.globalData.requestHeader['Cookie'] = res.header['set-cookie'];
			wx.setStorageSync('cookie', res.header['set-cookie']);
		}
	}
});
