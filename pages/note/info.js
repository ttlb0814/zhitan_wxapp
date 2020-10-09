const app = getApp();
var datalist = require('../../utils/datalist');
Page({
	data: {
		info: {},
		author: null,
		refresherTriggered: false,
		focus: false,

		poster: false, // 海报
		statusBarHeight: app.globalData.statusBarHeight,
		isQQ: app.globalData.isQQ
	},
	setInterval: '', // 定时器

	// 更新经验浏览时间
	updateNotes(e) {
		app.post('note/info/viewtime/' + this.data.infoId, { isFinish: e }, (res) => {}, (fail) => {});
	},

	// 点赞 收藏
	approveCollect(e) {
		if (!app.globalData.userInfo && !app.globalData.userTP) {
			wx.navigateTo({ url: '/pages/user/reg' });
			return;
		}
		const type = e.currentTarget.dataset.type;
		let val;
		type == 'approve' ? (val = this.data.info.myApprove) : (val = this.data.info.myCollect);
		wx.showLoading({ mask: true });
		app.post(`note/info/${type}/${this.data.infoId}`, { val: val ? 0 : 1 }, (res) => {
			wx.hideLoading();
			if (type == 'approve') {
				this.setData({ ['info.count_approve']: res.count_approve, ['info.myApprove']: res.val });
				app.prevRefresh();
				return;
			}
			this.setData({ ['info.myCollect']: res.val, ['info.count_collect']: res.count_collect });
		});
	},

	// 推荐列表点赞
	approve(e) {
		let idx = e.currentTarget.dataset.idx;
		let id = this.data.recmds[idx].id;
		let val = e.currentTarget.dataset.val;

		wx.showLoading({ mask: true });
		app.post(`note/info/approve/${id}`, { val }, (res) => {
			wx.hideLoading();
			this.setData({ ['recmds[' + idx + '].myApprove']: res.val });
		});
	},

	// 发表评论
	formSubmit(e) {

		let content = this.data.content;
		wx.showLoading({ mask: true });
		app.post(`note/discuss/add/${this.data.infoId}`, { pid: this.data.pid || 0, content }, (res) => {
			wx.hideLoading();
			this.setData({ content: '', bottom: 0 });
			// 二级评论列表刷新
			if (this.data.pid) {
				let comment = this.selectAllComponents('#comment')[this.data.commentIdx];
				console.log(comment);
				comment.setData({
					['item.count_discuss']: res.parent_count_discuss,
					[`item.last_reply`]: res.info
				});
				this.setData({ pid: null });
				return;
			}

			datalist.refresh(this);
		});
	},

	parentCallBack(e) {
		this.setData({ focus: e.detail.ipt, pid: e.detail.id, commentIdx: e.detail.commentIdx });
	},

	fileTool: null,

	examineFile(e) {
		this.data.filesList.forEach((e) => {
			e.noteId = this.data.noteId;
		});
		var idx = e.currentTarget.dataset.idx;
		this.fileTool.show(this.data.filesList[idx]);
	},

	onLoad: function(options) {
		this.setData({
			infoId: options.id ? options.id : options.scene,
			type: options.type ? options.type : null
		});
		this.getNoteInfo();
		this.setInterval = setInterval(() => {
			this.updateNotes(0);
		}, 10000);

		this.fileTool = this.selectComponent('#filetool');
		datalist.bind(this, `note/discuss/index/${this.data.infoId}`);

		let that = this;
		if (!app.globalData.userLoaded) {
			app.onLogin = function(userInfo, requireType) {
				that.onLogin(userInfo, requireType);
			};
		}
	},

	getNoteInfo() {
		wx.showLoading({ mask: true });
		app.get(
			'note/info/index/' + this.data.infoId,
			(res) => {
				res.info.content = res.info.content
					.replace(/<img /gi, '<img style="max-width:100%;height:auto;display:block;"')
					.replace(/<p[^>]*>/gi, "<p style='margin-bottom: 1em; display: block; min-height: 1em'>");

				wx.hideLoading();
				this.setData({
					info: res.info,
					filesList: res.files,
					topicList: res.topics,
					unisList: res.unis,
					author: res.author,
					recmds: res.recmds
				});
			},
			(fail) => {
				wx.hideLoading();
				wx.showModal({
					title: '数据加载失败',
					content: fail.msg,
					success: (res) => {
						wx.navigateBack();
					}
				});
			}
		);
	},

	onLogin: function(userInfo, requireType) {
		this.setData({ pageLoginTime: new Date().valueOf() });
	},



	onHide() {
		clearInterval(this.setInterval);
	},

	onUnload() {
		clearInterval(this.setInterval);
		this.updateNotes(1);
	},

	refresh() {
		if (datalist.isLoading(this)) return;
		this.getNoteInfo();
		datalist.refresh(this);
	},

	foucus(e) {
		this.setData({ bottom: e.detail.height });
	},

	blur(e) {
		this.setData({ bottom: 0 });
	},

	watchIpt(e) {
		this.setData({ content: e.detail.value });
	},

	// 评论状态控制
	readComment() {
		// 滚动到指定位置
		var query = wx.createSelectorQuery().in(this);

		query.selectViewport().scrollOffset();
		query.select('#comment-title').boundingClientRect();
		query.exec(function(res) {
			var miss = res[0].scrollTop + (res[1].top - res[1].height) - 10;
			wx.pageScrollTo({
				scrollTop: miss,
				duration: 300
			});
		});
	},

	// 触底加载
	onReachBottom() {
		datalist.next(this);
	},

	// 生成海报
	createPoster() {

		this.setData({ poster: !this.data.poster });
		if (!this.data.poster || this.data.shareimg) return;

		wx.showLoading({ mask: true });
		app.downloadFile(`note/info/shareimg/${this.data.infoId}`, null, (res) => {
			wx.hideLoading();
			this.setData({ shareimg: res.tempFilePath });
		});
	},

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

	onShareAppMessage() {
		return {
			title: this.data.info.title,
			path: `/pages/note/info?id=${this.data.infoId}`
		};
	},

	onShareTimeline() {
		return {
			title: this.data.info.title,
			path: `/pages/note/info?id=${this.data.infoId}`
		};
	}
});
