// pages/forum/answer-edit.js
const app = getApp();
Page({
	/**
	 * 页面的初始数据
	 */
	data: {
		formats: {},
		editorHeight: 300,
		editorFocus: false,
		keyboardHeight: 0,
		isIOS: false,
		content: '',
		is_anonymous: 0,
		toolbarTop: 0
	},

	postInfo() {
		wx.navigateTo({
			url: `/pages/forum/info?id=${this.data.id}`
		});
	},

	//   匿名
	anonymityChange() {
		this.setData({
			is_anonymous: !this.data.is_anonymous
		});
		console.log(this.data.is_anonymous);
	},

	// 选择标签，选择学校
	selTopic(e) {
		let type = e.currentTarget.dataset.type;
		var ary = type == 'topic' ? this.data.topicList : type == 'tag' ? this.data.tags : this.data.university;
		wx.navigateTo({
			url:
				type == 'tag'
					? `./tag?tagList=${JSON.stringify(ary || [])}`
					: `../${type}/select?topicList=${JSON.stringify(ary || [])}`
		});
	},

	/****** 富文本编辑器相关  *****/

	// 编写标题和内容
	getVal(e) {
		if (e.currentTarget.dataset.type == 'title') {
			this.setData({ title: e.detail.value });
			return;
		}
		this.setData({ content: e.detail.html });
	},

	// IOS 页面滚动富文本滚动问题
	onPageScroll(t) {
		this.setData({ toolbarTop: t.scrollTop });
	},

	// 初始化触发
	onEditorReady() {
		const that = this;
		wx
			.createSelectorQuery()
			.select('#answer-editor')
			.context(function(res) {
				that.editorCtx = res.context;
				that.editorCtx.setContents({ html: that.data.content || '' });
			})
			.exec();
	},

	flagStart: 0,
	onEditorFocus() {
		if (this.flagStart == 0&&this.data.isIOS) {
			this.setData({ editorFocus: false });

			this.flagStart += 1;
			return;
		}
		this.setData({ editorFocus: true });
	},

	onEditorBlur() {
		this.setData({ editorFocus: false });
	},

	onStatusChange(e) {
		const formats = e.detail;
		this.setData({ formats });
	},
	insertDivider() {
		this.editorCtx.insertDivider({
			success: function() {
				console.log('insert divider success');
			}
		});
	},

	blur() {
		this.editorCtx.blur();
	},
	format(e) {
		console.log(e);
		let { name, value } = e.target.dataset;
		if (!name) return;
		this.editorCtx.format(name, value);
	},

	// 选择图片
	insertImage() {
		const that = this;
		wx.chooseImage({
			count: 1,
			success: function(res) {
				wx.showLoading({ mask: true });
				app.uploadFile('/account/user/addimg', res.tempFilePaths[0], {}, (result) => {
					wx.hideLoading();
					that.editorCtx.insertImage({
						src: result.url,
						data: {},
						width: '100%'
					});
				});
			}
		});
	},

	/**********富文本相关结束 **********/

	// 保存草稿 和发布通用参数
	getFormData() {
		return {
			id: this.data.id,
			pid: '',
			content: this.data.content || '',
			is_anonymous: (this.data.is_anonymous && 1) || 0 // 是否匿名 0：非匿名；1：匿名
		};
	},

	// 发布或保存
	flag: false,
	issueSave(e) {
		if (!this.getFormData().content) {
			wx.showToast({ title: '请填写内容', icon: 'none', duration: 1000 });
			return;
		}

		if (this.flag) return;
		this.flag = true;
		wx.showLoading({ mask: true });
		app.post(
			'forum/post/savepost',
			Object.assign(this.getFormData()),
			(res) => {
				if (res.not_verified == 1) {
					app.globalData.userInfo.is_verified = 0;
					wx.navigateTo({ url: '/pages/user/attestation' });
					wx.hideLoading();
					return;
				}

				wx.hideLoading();

				res.succ == 1 &&
					wx.showToast({
						title: '发布成功',
						icon: 'success',
						duration: 1000
					});
				setTimeout(() => {
					console.log('app.prevRefsh()');
					app.prevRefresh();
					wx.navigateBack({ detail: 1 });
				}, 1000);
			},
			(fail) => {
				wx.hideLoading();
				wx.showModal({ title: fail.msg });
				this.flag = false;
			}
		);
	},

	onLogin: function(userInfo, requireType) {
		this.setData({ pageLoginTime: new Date().valueOf() });
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function(options) {
		console.log(options);
		this.setData({
			isQQ: app.globalData.isQQ,
			id: options.id,
			title: options.title
		});

		const platform = wx.getSystemInfoSync().platform;
		const isIOS = platform === 'ios';
		this.setData({ isIOS });
		this.updatePosition(0);
		let keyboardHeight = 0;
		wx.onKeyboardHeightChange((res) => {
			if (res.height === keyboardHeight) return;
			const duration = res.height > 0 ? res.duration * 1000 : 0;
			keyboardHeight = res.height;
			setTimeout(() => {
				wx.pageScrollTo({
					scrollTop: 0,
					success: () => {
						this.updatePosition(keyboardHeight);
						this.editorCtx.scrollIntoView();
					}
				});
			}, duration);
		});
	},

	updatePosition(keyboardHeight) {
		const toolbarHeight = 50;
		const { windowHeight, platform } = wx.getSystemInfoSync();
		let editorHeight = keyboardHeight > 0 ? windowHeight - keyboardHeight - toolbarHeight : windowHeight;
		this.setData({ editorHeight, keyboardHeight });
	},

	/**
	 * 生命周期函数--监听页面初次渲染完成
	 */
	onReady: function() {},

	/**
	 * 生命周期函数--监听页面显示
	 */
	onShow: function() {},

	/**
	 * 生命周期函数--监听页面隐藏
	 */
	onHide: function() {},

	/**
	 * 生命周期函数--监听页面卸载
	 */
	onUnload: function() {},

	/**
	 * 页面相关事件处理函数--监听用户下拉动作
	 */
	onPullDownRefresh: function() {},

	/**
	 * 页面上拉触底事件的处理函数
	 */
	onReachBottom: function() {},

	/**
	 * 用户点击右上角分享
	 */
	onShareAppMessage: function() {}
});
