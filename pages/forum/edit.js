// pages/forum/edit.js
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

		// 是否匿名
		is_anonymous: 0,
		toolbarTop: 0 //ios页面页面上滑
	},
	begin: '', // 定时器

	closeTip() {
		this.setData({ closeTip: true });
	},

	autoFocus() {
		this.setData({ autoFocus: true });
	},

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

	// 选择标签，选择学校
	selTopic(e) {
		let type = e.currentTarget.dataset.type;
		var ary = type == 'topic' ? this.data.topicList : type == 'tag' ? this.data.tags : this.data.university;
		wx.navigateTo({
			url:
				type == 'tag'
					? `./tag?tagList=${JSON.stringify(this.data.tagList || [])}&&hotTags=${JSON.stringify(
							this.data.hotTags || []
						)}`
					: `../${type}/select?topicList=${JSON.stringify(ary || [])}&&radio=${true}`
		});
	},

	anonymityChange() {
		this.setData({
			is_anonymous: !this.data.is_anonymous
		});
		console.log(this.data.is_anonymous);
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function(options) {
		this.setData({
			isQQ: app.globalData.isQQ,
			postType: options.type,
			placeholder: (options.type == 1 && '请输入标题') || '请输入标题（选填）'
		});
		const navigationTitle = (this.data.postType == 1 && '发布问题') || '随便聊聊';
		wx.setNavigationBarTitle({
			title: navigationTitle
		});
		this.getParams();
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
	// 获取科目等信息
	getParams() {
		app.post('params/index', { items: 'subject' }, (res) => {
			res.subject.unshift({ name: '请选择', id: null });
			this.setData({
				subject: res.subject
			});
		});
	},

	// 选择科目
	bindPickerChange: function(e) {
		this.setData({ [e.currentTarget.dataset.type]: e.detail.value });
	},

	/****** 富文本编辑器相关  *****/

	// 初始化触发
	onEditorReady() {
		const that = this;
		wx
			.createSelectorQuery()
			.select('#editor')
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
	onLogin: function(userInfo, requireType) {
		this.setData({ pageLoginTime: new Date().valueOf() });
	},
	/**********富文本相关结束 **********/

	// 保存草稿 和发布通用参数
	getFormData() {
		return {
			title: this.data.title || '',
			content: this.data.content || '',
			thr_type: this.data.postType, // 论坛类型 1：提问；2：交流
			is_anonymous: (this.data.is_anonymous && 1) || 0, // 是否匿名 0：非匿名；1：匿名
			tags: this.data.tags ? this.data.tags.map((e) => e.id) : '',
			uni_ids: this.data.university ? this.data.university.map((e) => e.id) : ''
		};
	},
	// 发布或保存

	flag: false,
	issueSave(e) {
		let pages = getCurrentPages()
		let prevPage = pages[pages.length - 2];//上一个页面

		if (!this.getFormData().title && this.data.postType == 1) {
			wx.showToast({ title: '请填写标题', icon: 'none', duration: 1000 });
			return;
		}

		if (!this.getFormData().content && !this.getFormData().title) {
			wx.showToast({ title: '请填写内容', icon: 'none', duration: 1000 });
			return;
		}

		if (!this.data.tags) {
			wx.showToast({ title: '请选择标签', icon: 'none', duration: 1000 });
			return;
		}

		if (this.flag) return;
		this.flag = true;

		wx.showLoading({ mask: true });

		app.post('forum/post/save', Object.assign(this.getFormData()), (res) => {
			if (res.not_verified == 1) {
				app.globalData.userInfo.is_verified = 0;
				wx.navigateTo({ url: '/pages/user/attestation' });
				wx.hideLoading();
				return;
			}

			wx.hideLoading();

			res.succ == 1 &&
				wx.showToast({
					title: this.data.noteId ? '修改成功' : '发布成功',
					icon: 'success',
					duration: 1000
				});
			prevPage.setData({
				tabIdx: 1
			})
			setTimeout(() => {
				app.prevRefresh();
				wx.navigateBack({ detail: 1 });
			}, 1000);
		},(fail) => {
			wx.hideLoading()
			wx.showModal({ title: fail.msg });
			this.flag = false;
		});
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
	onHide: function() {
		clearInterval(this.begin);
	},

	/**
	 * 生命周期函数--监听页面卸载
	 */
	onUnload: function() {
		clearInterval(this.begin);
	},

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
