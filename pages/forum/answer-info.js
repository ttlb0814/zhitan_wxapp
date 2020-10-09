// pages/forum/answer-info.js
const app = getApp();
const datalist = require('../../utils/datalist.js');
Page({
	/**
   * 页面的初始数据
   */
	data: {
		sort_type: 0,
		sort_rule: 0,
		refresherTriggered: false,
		content: '',
		author: {},
		statusBarHeight: app.globalData.statusBarHeight
	},

	// 点赞
	approve(e) {
		console.log(e);
		const post_id = e.currentTarget.dataset.postid;
		const id = e.currentTarget.dataset.tid;
		const type = e.currentTarget.dataset.type == 1 ? 0 : 1;
		console.log(type);
		app.post('forum/post/approve', { id: id, post_id: post_id, type: type }, (res) => {
			// datalist.refresh(this)
			this.data.info.approve_sta = type;
			this.data.info.count_approve =
				type == 1 ? Number(this.data.info.count_approve) + 1 : Number(this.data.info.count_approve) - 1;
			this.setData({ info: this.data.info });
			console.log(this.data.info);
			app.prevRefresh();
		});
	},

	// 输入框
	foucus(e) {
		this.setData({ bottom: e.detail.height });
	},

	blur(e) {
		this.setData({ bottom: 0 });
	},

	watchIpt(e) {
		this.setData({ content: e.detail.value });
	},

	// 生成海报
	createPoster() {
		this.setData({ poster: !this.data.poster });
		if (!this.data.poster || this.data.shareimg) return;

		wx.showLoading({ mask: true });
		app.downloadFile(`forum/info/shareimg?id=${this.data.id}&post_id=${this.data.post_id}`, null, (res) => {
			wx.hideLoading();
			this.setData({ shareimg: res.tempFilePath });
		});
	},
	// 保存海报
	savePic(e) {
		if (e.currentTarget.dataset.type) return;
		wx.showLoading({
			title: '正在保存...',
			mask: true
		});

		wx.saveImageToPhotosAlbum({
			filePath: this.data.shareimg,
			success: function() {
				wx.showToast({ title: '保存成功' });
			},
			fail: (res) => {
				wx.showToast({ title: '保存失败' });
			}
		});
	},

	/**
   * 生命周期函数--监听页面加载
   */
	onLoad: function(options) {
		console.log(options);
		if (options.scene) {
			let s = options.scene.split('_');
			s.forEach((item, i) => {
				s[i] = item;
			});
			this.setData({
				id: s[0],
				pid: s[1],
				post_id: s[1]
			});
			console.log(s, this.data);
		} else {
			this.setData({ id: options.id, pid: options.post_id, post_id: options.post_id });
		}
		this.answerInfo();
		this.getAnswerList();
	},

	answerInfo() {
		app.post('forum/info/answerinfo', { id: this.data.id, post_id: this.data.pid }, (res) => {
			this.data.author.id = res.data.user_id;
			this.data.author.nick_name = res.data.nick_name;
			this.data.author.head_url = res.data.head_url;
			this.data.author.tid = res.data.tid;
			this.data.author.is_anonymous = res.data.is_anonymous;
			// 正文富文本排版处理
			res.data.content = res.data.content
				.replace(/<img /gi, '<img style="max-width:100%;height:auto;display:block;"')
				.replace(/<p[^>]*>/gi, "<p style='margin-bottom: 0.5em; display: block; min-height: 0.5em'>");
			this.setData({ info: res.data, author: this.data.author });
		});
	},

	getAnswerList() {
		datalist.bind(this, 'forum/info/answerlist', this.getParams());
	},

	getParams() {
		console.log(this.data.pid, this.data.id);
		return {
			id: this.data.id,
			post_id: this.data.post_id,
			sort_type: this.data.sort_type,
			sort_rule: this.data.sort_rule
		};
	},

	onLoadMore: function(e) {
		datalist.next(this, this.getParams());
	},

	refresh() {
		if (datalist.isLoading(this)) return;
		datalist.refresh(this, this.getParams());
	},

	/**
   * 页面相关事件处理函数--监听用户下拉动作
   */
	onRefresh: function(e) {
		this.setData({ refresherTriggered: false });
		datalist.refresh(this, this.getParams());
	},

	/**
 * 页面上拉触底事件的处理函数
 */
	// 触底加载
	onReachBottom() {
		datalist.next(this, this.getParams());
	},

	onLogin: function(userInfo, requireType) {
		this.setData({ pageLoginTime: new Date().valueOf() });
	},

	postInfo() {
		wx.navigateTo({
			url: `/pages/forum/info?id=${this.data.id}`
		});
	},

	goHomepage(e) {
		let userId = e.currentTarget.dataset.id;

		if (!userId) return;

		wx.navigateTo({ url: '/pages/user/author?userId=' + userId });
	},

	// 发表评论
	formSubmit(e) {
		// console.log('pid', this.data.pid)
		if (!this.data.isReg) {
			wx.navigateTo({
				url: '/pages/user/reg'
			});
			return;
		}
		let content = this.data.content;
		wx.showLoading({ mask: true });
		app.post(`forum/post/savepost`, { pid: this.data.pid, content, id: this.data.id }, (res) => {
			wx.hideLoading();
			this.setData({ content: '', bottom: 0 });
			// 二级评论列表刷新
			if (this.data.forumComment) {
				let comment = this.selectAllComponents('#forum-comment')[this.data.commentIdx];
				// console.log(comment)
				comment.setData({
					['item.count_reply']: res.parent_count_reply,
					[`item.last_reply`]: res.info
				});
				this.setData({ forumComment: false, pid: this.data.post_id });
				return;
			}
			datalist.refresh(this, this.getParams());
			app.prevRefresh();
		});
	},

	parentCallBack(e) {
		this.setData({ focus: e.detail.ipt, pid: e.detail.id, commentIdx: e.detail.commentIdx, forumComment: true });
	},

	/**
   * 生命周期函数--监听页面初次渲染完成
   */
	onReady: function() {},

	/**
   * 生命周期函数--监听页面显示
   */
	onShow: function() {
		this.setData({ isReg: app.globalData.userInfo ? true : false });
	},

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
   * 用户点击右上角分享
   */
	onShareAppMessage: function() {
		return {
			title: this.data.info.mainInfo.title,
			path: `/pages/forum/answer-info?id=${this.data.id}&post_id=${this.data.pid}`
		};
	},
	onShareTimeline() {
		return {
			// title: '@' + this.data.author.nick_name + ' 发布了一篇干货满满的艺考经验经验，快点来看！',
			title: this.data.info.mainInfo.title,
			path: `/pages/forum/answer-info?id=${this.data.id}&post_id=${this.data.pid}`
		};
	}
});
