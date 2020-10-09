// pages/forum/info.js
const app = getApp();
const datalist = require('../../utils/datalist');
Page({
	/**
   * 页面的初始数据
   */
	data: {
		info: {},
		author: {},
		refresherTriggered: false,
		focus: false,
		isReg: false,
		poster: false, // 海报
		statusBarHeight: app.globalData.statusBarHeight,
		isQQ: app.globalData.isQQ,
		sort_type: 0, // 排序方式，0热度，1时间,
		post_id: '0'
	},
	setInterval: '', // 定时器

	cutSortType(e) {
		this.setData({ sort_type: e.currentTarget.dataset.val });
		if (datalist.isLoading(this)) return;
		datalist.refresh(this, this.getParams());
	},

	answerInfo(e) {
		const post_id = e.currentTarget.dataset.postid;
		wx.navigateTo({
			url: `/pages/forum/answer-info?post_id=${post_id}&id=${this.data.id}&title=${this.data.info.title}`
		});
	},

	// 评论状态控制
	readComment() {
		// 滚动到指定位置
		var query = wx.createSelectorQuery().in(this);

		query.selectViewport().scrollOffset();
		query.select('#comment-title').boundingClientRect();
		query.exec(function (res) {
			var miss = res[0].scrollTop + (res[1].top - res[1].height) - 10;
			wx.pageScrollTo({
				scrollTop: miss,
				duration: 300
			});
		});
	},

	/**
   * 生命周期函数--监听页面加载
   */
	onLoad: function (options) {
		console.log(options)
		if (options.scene) {
			let s = options.scene.split('_')
			s.forEach((item, i) => {
				// s[i] = parseInt(item, 16)
				s[i] = item
			})
			this.setData({
				id: s[0],
				infoId: s[0]
			})
			console.log(s, this.data)
		} else {
			const id = options.id;
			this.setData({
				id: id,
				infoId: id,
				userId: app.globalData.userInfo ? app.globalData.userInfo.id : ''
			});
		}
		this.getInfo();
		this.getAnswerList();
	},
	// 点赞

	approve(e) {
		if (!app.globalData.userInfo && !app.globalData.userTP) {
			wx.navigateTo({
				url: '/pages/user/reg'
			});
			return;
		}
		let type = e.currentTarget.dataset.type == 1 ? 0 : 1;
		const post_id = e.currentTarget.dataset.postid;
		const id = e.currentTarget.dataset.tid;
		const idx = e.currentTarget.dataset.idx;
		app.post(`forum/post/approve`, { id: id, post_id: post_id, type: type }, (res) => {
			wx.hideLoading();

			this.setData({
				['dataList[' + idx + '].approve_sta']: type,
				['dataList[' + idx + '].count_approve']: type == 1 ? Number(this.data.dataList[idx].count_approve) + 1 : Number(this.data.dataList[idx].count_approve) - 1
			});
		})
		app.prevRefresh();
	},

	approveCollect() {
		if (!app.globalData.userInfo && !app.globalData.userTP) {
			wx.navigateTo({
				url: '/pages/user/reg'
			});
			return;
		}
		let type = this.data.info.approve_sta;
		app.post(
			'forum/post/approve',
			{ id: this.data.info.forum_post.tid, post_id: this.data.info.forum_post.id, type: type == 1 ? 0 : 1 },
			(res) => {
				this.getInfo();
				app.prevRefresh();
			}
		);
	},

	getInfo() {
		wx.showLoading({ mask: true });
		app.post('forum/info/info', { id: this.data.id }, (res) => {
			this.data.author.id = res.data.user_id;
			this.data.author.nick_name = res.data.nick_name;
			this.data.author.head_url = res.data.head_url;
			this.data.author.tid = res.data.tid;
			this.data.author.is_anonymous = res.data.is_anonymous;
			this.data.author.isMyFanning = res.data.forum_post.isMyFanning;

			// 正文富文本排版处理
			res.data.forum_post.content = res.data.forum_post.content
				.replace(/<img /gi, '<img style="max-width:100%;height:auto;display:block;"')
				.replace(/<p[^>]*>/gi, "<p style='margin-bottom: 0.5em; display: block; min-height: 1em'>");

			wx.hideLoading();
			this.setData({
				info: res.data,
				author: this.data.author,
				// userId: app.globalData.userInfo ? app.globalData.userInfo.id : ''
			});
		});
	},

	getAnswerList() {
		datalist.bind(this, 'forum/info/answerlist', this.getParams());
	},

	getParams() {
		return {
			id: this.data.id,
			post_id: this.data.post_id,
			sort_type: this.data.sort_type
		};
	},

	onLogin: function (userInfo, requireType) {
		this.setData({ isReg: userInfo ? true : false ,pageLoginTime: new Date().valueOf()});
	},

	// 发表评论
	formSubmit(e) {

		let content = this.data.content;
		wx.showLoading({ mask: true });
		app.post(`forum/post/savepost`, { pid: this.data.pid || 0, content, id: this.data.id }, (res) => {
			wx.hideLoading();
			this.setData({ content: '', bottom: 0 });
			// 二级评论列表刷新
			if (this.data.pid) {
				let comment = this.selectAllComponents('#forum-comment')[this.data.commentIdx];
				comment.setData({
					['item.count_reply']: res.parent_count_reply,
					[`item.last_reply`]: res.info
				});
				this.setData({ pid: null });
				return;
			}
			datalist.refresh(this);
			app.prevRefresh()
		});
	},

	parentCallBack(e) {
		this.setData({ focus: e.detail.ipt, pid: e.detail.id, commentIdx: e.detail.commentIdx });
	},

	/**
   * 生命周期函数--监听页面初次渲染完成
   */
	onReady: function () { },

	onLoadMore: function (e) {
		datalist.next(this, this.getParams());
	},

	refresh() {
		console.log('info')
		if (datalist.isLoading(this)) return;
		datalist.refresh(this, this.getParams());
	},

	toUniversity(e) {
		const uni_id = e.currentTarget.dataset.id
		wx.navigateTo({
			url: `/pages/university/info?id=${uni_id}`
		})
	},

	toEditAnswer() {
		wx.navigateTo({
			url: `/pages/forum/answer-edit?id=${this.data.id}&title=${this.data.info.title}`
		});
		return;
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
		// if (!this.data.isReg) {
		// 	wx.navigateTo({
		// 		url: '/pages/user/reg'
		// 	});
		// 	return;
		// }

		this.setData({ poster: !this.data.poster });
		if (!this.data.poster || this.data.shareimg) return;

		wx.showLoading({ mask: true });
		app.downloadFile(`forum/info/shareimg?id=${this.data.id}&post_id=${this.data.info.forum_post.id}`, null, (res) => {
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
			success: function () {
				wx.showToast({ title: '保存成功' });
			},
			fail: (res) => {
				wx.showToast({ title: '保存失败' });
			}
		});
	},

	/**
   * 页面相关事件处理函数--监听用户下拉动作
   */
	onRefresh: function (e) {
		this.setData({ refresherTriggered: false });
		datalist.refresh(this, this.getParams());
	},

	/**
   * 页面上拉触底事件的处理函数
   */
	// 触底加载
	onReachBottom() {
		datalist.next(this);
	},

	/**
   * 生命周期函数--监听页面显示
   */
	onShow: function () {
		console.log(app.globalData.userInfo)
		this.setData({ isReg: app.globalData.userInfo ? true : false });
	},

	/**
   * 生命周期函数--监听页面隐藏
   */
	onHide: function () {
		clearInterval(this.setInterval);
	},

	/**
   * 生命周期函数--监听页面卸载
   */
	onUnload: function () {
		clearInterval(this.setInterval);
		// this.updateNotes(1);
	},

	/**
   * 页面相关事件处理函数--监听用户下拉动作
   */
	onPullDownRefresh: function () { },

	/**
   * 用户点击右上角分享
   */
	onShareAppMessage() {
		const title = this.data.info.thr_type == 1 ? this.data.info.title : '@' + this.data.info.nick_name + '在之谈分享了ta的想法，快来看看吧~'
		return {
			title: title,
			path: `/pages/forum/info?id=${this.data.id}`
		};
	},
	onShareTimeline() {
		const title = this.data.info.thr_type == 1 ? this.data.info.title : '@' + this.data.info.nick_name + '在之谈分享了ta的想法，快来看看吧~'
		return {
			// title: '@' + this.data.author.nick_name + ' 发布了一篇干货满满的艺考经验经验，快点来看！',
			title: title,
			path: `/pages/forum/info?id=${this.data.id}`
		};
	}
});
