const app = getApp();
var datalist = require('../../utils/datalist');

Page({
	data: {
		refresherTriggered: false,
		placeholder: '请留下你的评论',
		focus: false,
		at_uid: ''
	},

	onLoad: function(options) {
		console.log(options);
		wx.showLoading({ mask: true });
		app.post(
			`forum/info/answerinfo`,
			{ post_id: options.postid, id: options.id },
			(res) => {
				this.setData({
					// noteInfo: res.note,
					discussInfo: res.data,
					id: options.id,
					post_id: options.postid
					// userId: options.userId
				});
				wx.setNavigationBarTitle({ title: `更多关于${res.data.nick_name}的回复` });
				wx.hideLoading();
				datalist.bind(this, `forum/info/answerlist`, {
					id: options.id,
					post_id: this.data.post_id,
					sort_type: 1
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

	//输入聚焦
	foucus: function(e) {
		var that = this;
		that.setData({
			bottom: e.detail.height
		});
	},

	//失去聚焦
	blur: function(e) {
		var that = this;
		that.setData({
			bottom: 0
		});
	},

	watchIpt(e) {
		this.setData({ content: e.detail.value });
	},

	formSubmit(e) {
		wx.showLoading({ mask: true });
		app.post(
			`forum/post/savepost`,
			{ pid: this.data.post_id, id: this.data.id, content: this.data.content, at_uid: this.data.at_uid },
			(res) => {
				wx.hideLoading();
				this.data.dataList.unshift(res.info);
				this.setData({ dataList: this.data.dataList, content: '', at_uid: '', placeholder: '写评论' });
				app.prevRefresh();
			}
		);
	},

	openActionsheet(e) {
		let idx = e.currentTarget.dataset.idx;
		let at_uid = this.data.dataList[idx].user_id;
		let id = this.data.dataList[idx].tid;
		let post_id = this.data.dataList[idx].id;
		let itemList = [];
		if (this.data.dataList[idx].is_del == 1) return;
		itemList = app.globalData.userInfo.id == at_uid ? [ '回复', '删除' ] : [ '回复' ];

		wx.showActionSheet({
			itemList,
			success: (res) => {
				res.tapIndex == 0 &&
					this.setData({
						placeholder: `回复${e.currentTarget.dataset.name}的评论`,
						focus: true,
						at_uid
					});

				res.tapIndex == 1 &&
					wx.showModal({
						title: '删除确认',
						content: '确定要删除当前评论吗',
						success: (res) => {
							if (!res.confirm) return;
							wx.showLoading({ mask: true });
							app.post(`forum/post/del`, { post_id: post_id, id: id }, (res) => {
								wx.hideLoading();
								this.data.dataList.splice(idx, 1);
								this.setData({ dataList: this.data.dataList });
								app.prevRefresh();
							});
						}
					});
			}
		});
	},
	goHomepage(e) {
		if (e.currentTarget.dataset.id) {
			wx.navigateTo({ url: `/pages/user/author?userId=${e.currentTarget.dataset.id}` });
			return;
		}

		wx.navigateTo({ url: `/pages/user/author?userId=${this.data.discussInfo.user_id}` });
	},

	comment() {
		this.setData({ placeholder: '写评论', at_uid: '', focus: true });
	},
	lookUser(e) {
		wx.navigateTo({ url: '/pages/user/author?userId=' + e.currentTarget.dataset.id });
	},

	//  删除最顶上一级评论
	delete(e) {
		wx.showModal({
			title: '删除确认',
			content: '确定要删除当前评论吗',
			success: (res) => {
				if (!res.confirm) return;
				wx.showLoading({ mask: true });
				app.post(
					`forum/post/del`,
					{ post_id: this.data.discussInfo.id, id: this.data.discussInfo.tid },
					(res) => {
						this.setData({ dataList: this.data.dataList });
						app.prevRefresh();
						wx.hideLoading();
						wx.navigateBack();
					}
				);
			}
		});
	},

	// 点赞
	giveLike(e) {
		// if (!app.globalData.userInfo && !app.globalData.userTP) {
		// 	wx.navigateTo({
		// 		url: '/pages/user/reg'
		// 	});
		// 	return;
		// }
		const id = e.currentTarget.dataset.tid;
		const post_id = e.currentTarget.dataset.postid;
		let idx = e.currentTarget.dataset.idx;
		let type = e.currentTarget.dataset.type == 1 ? 0 : 1;
		// let disc_id = idx >= 0 ? this.data.dataList[idx].id : this.data.discussInfo.id;
		// let val = idx >= 0 ? this.data.dataList[idx].approve_sta : this.data.discussInfo.myApprove;

		wx.showLoading({ mask: true });
		app.post(`forum/post/approve`, { id: id, post_id: post_id, type: type }, (res) => {
			wx.hideLoading();
			if (idx >= 0) {
				this.setData({
					[`dataList[${idx}].approve_sta`]: type
					// [`dataList[${idx}].count_approve`]: res.count_approve
				});
				return;
			}
			this.setData({
				['discussInfo.approve_sta']: type
				// ['discussInfo.count_approve']: res.count_approve
			});
		});
	},

	refresh() {
		if (datalist.isLoading(this)) return;
		datalist.refresh(this);
	},

	foucus: function(e) {
		var that = this;
		that.setData({
			bottom: e.detail.height
		});
	},
	blur: function(e) {
		var that = this;
		that.setData({
			bottom: 0
		});
	},
	onLogin: function(userInfo, requireType) {
		this.setData({ pageLoginTime: new Date().valueOf() });
	},

	onShow: function() {
		this.setData({
			myselfId: app.globalData.userInfo ? app.globalData.userInfo.id : null
		});
	},

	//页面相关事件处理函数--监听用户下拉动作

	onRefresh: function(e) {
		this.setData({ refresherTriggered: false });
		datalist.refresh(this);
	},

	onLoadMore: function(e) {
		datalist.next(this);
	}
});
