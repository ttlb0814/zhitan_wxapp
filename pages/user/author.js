const app = getApp();
var datalist = require('../../utils/datalist');
Page({
	data: {
		refresherTriggered: false,
		tab: [ '经验', '点赞', '交流' ],
		tabIdx: 0
	},

	onLoad: function(options) {
		this.setData({ user_id: options.userId });
		// 查看用户基本信息
		wx.showLoading({ mask: true });
		app.get(`user/index/${options.userId}`, (res) => {
			wx.hideLoading();
			this.setData({ userInfo: res.info });

			datalist.bind(this, 'note/index/user', { user_id: options.userId });
		});
	},

	postInfo(e) {
		const id = e.currentTarget.dataset.id;
		// type 1:提问；2:交流
		const type = e.currentTarget.dataset.type;
		wx.navigateTo({
			url: `/pages/forum/info?id=${id}&type=${type}`
		});
	},

	// 关注
	attention(e) {
		let oper = e.currentTarget.dataset.oper;

		wx.showLoading({ mask: true });
		app.post(`user/fan/${this.data.user_id}`, { oper }, (res) => {
			wx.hideLoading();
			this.setData({ ['userInfo.isMyFanning']: res.info.isMyFanning });
			app.prevRefresh();
		});
	},

	// 点赞
	approve(e) {
		if (e.currentTarget.dataset.from) {
			let idx = e.currentTarget.dataset.idx;
			let id = e.currentTarget.dataset.tid;
			let post_id = e.currentTarget.dataset.postid;
			let type = e.currentTarget.dataset.type == 1 ? 0 : 1;
			app.post(`forum/post/approve`, { id: id, post_id: post_id, type: type }, (res) => {
				this.setData({
					['dataList[' + idx + '].approve_sta']: type,
					['dataList[' + idx + '].count_approve']:
						type == 1
							? Number(this.data.dataList[idx].count_approve) + 1
							: Number(this.data.dataList[idx].count_approve) - 1
				});
			});
			return;
		}

		let idx = e.currentTarget.dataset.idx;
		let id = this.data.dataList[idx].id;
		let val = e.currentTarget.dataset.val;

		app.post(`note/info/approve/${id}`, { val }, (res) => {
			this.setData({
				['dataList[' + idx + '].myApprove']: res.val,
				['dataList[' + idx + '].count_approve']: res.count_approve
			});
		});
	},

	// 列表切换
	parentTab(e) {
		let tabIdx = e.detail.tabIdx;
		if (this.data.tabIdx == tabIdx) return;
		this.setData({ tabIdx });
		tabIdx == 0 && datalist.bind(this, 'note/index/user', { user_id: this.data.user_id });
		tabIdx == 1 && datalist.bind(this, `user/userapprove/${this.data.user_id}`);
		tabIdx == 2 && datalist.bind(this, 'forum/index/user', { user_id: this.data.user_id });
	},

	refresh() {
		if (datalist.isLoading(this)) return;
		datalist.refresh(this, { user_id: this.data.user_id });
	},

	previewImage(e) {
		let urls = e.currentTarget.dataset.item;
		let current = e.currentTarget.dataset.src;
		wx.previewImage({ current, urls });
	},

	// 帖子详情
	postInfo(e) {
		const id = e.currentTarget.dataset.id;
		// type 1:提问；2:交流
		const type = e.currentTarget.dataset.type;
		wx.navigateTo({
			url: `/pages/forum/info?id=${id}&type=${type}`
		});
	},

	// 跳转到答案页
	answerInfo(e) {
		console.log(e);
		const id = e.currentTarget.dataset.id;
		const post_id = e.currentTarget.dataset.postid;
		const title = e.currentTarget.dataset.title;
		wx.navigateTo({
			url: `/pages/forum/answer-info?id=${id}&post_id=${post_id}&title=${title}`
		});
	},

	/**
 * 页面相关事件处理函数--监听用户下拉动作
 */
	onRefresh: function(e) {
		this.setData({ refresherTriggered: false });
		datalist.refresh(this, { user_id: this.data.user_id });
	},

	onLoadMore: function(e) {
		datalist.next(this);
	}
});
