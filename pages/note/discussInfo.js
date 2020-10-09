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
		this.setData({ my_userId: app.globalData.userInf ? app.globalData.userInfo.id : null });
		wx.showLoading({ mask: true });
		app.post(
			`note/discuss/info/${options.noteId}`,
			{ disc_id: options.dataId },
			(res) => {
				this.setData({
					noteInfo: res.note,
					discussInfo: res.info,
					noteId: options.noteId,
					disc_id: options.dataId,
					userId: options.userId
				});
				wx.setNavigationBarTitle({ title: `更多关于${res.info.nick_name}的回复` });
				wx.hideLoading();
				datalist.bind(this, `note/discuss/index/${options.noteId}`, { pid: options.dataId });
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
		that.setData({ bottom: e.detail.height });
	},

	//失去聚焦
	blur: function(e) {
		var that = this;
		that.setData({ bottom: 0 });
	},

	watchIpt(e) {
		this.setData({ content: e.detail.value });
	},

	formSubmit(e) {
		wx.showLoading({ mask: true });
		app.post(
			`note/discuss/add/${this.data.noteId}`,
			{ pid: this.data.disc_id, content: this.data.content, at_uid: this.data.at_uid },
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
		let disc_id = this.data.dataList[idx].id;
		let itemList = [];
		if (this.data.dataList[idx].deleted == 1) return;
		itemList = app.globalData.userInfo.id == at_uid ? [ '回复', '删除' ] : [ '回复' ];
		console.log(app.globalData.userInfo.id);

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
							app.post(`note/discuss/del/${this.data.noteId}`, { disc_id }, (res) => {
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

	comment() {
		this.setData({ placeholder: '写评论', at_uid: '', focus: true });
	},
	goHomepage(e) {
		if (e.currentTarget.dataset.id) {
			wx.navigateTo({ url: `/pages/user/author?userId=${e.currentTarget.dataset.id}` });
			return;
		}

		wx.navigateTo({ url: `/pages/user/author?userId=${this.data.discussInfo.user_id}` });
	},
	// 删除顶层评论
	deleteComment(e) {
		let disc_id = e.currentTarget.dataset.id;
		wx.showModal({
			title: '删除确认',
			content: '确定要删除当前评论吗',
			success: (res) => {
				if (!res.confirm) return;
				wx.showLoading({ mask: true });
				app.post(`note/discuss/del/${this.data.noteId}`, { disc_id }, (res) => {
					wx.hideLoading();
					this.setData({ ['discussInfo.deleted']: res.succ });
					app.prevRefresh();
				});
			}
		});
	},

	// 点赞
	giveLike(e) {
		let idx = e.currentTarget.dataset.idx;
		let disc_id = idx >= 0 ? this.data.dataList[idx].id : this.data.discussInfo.id;
		let val = idx >= 0 ? this.data.dataList[idx].myApprove : this.data.discussInfo.myApprove;

		app.post(`note/discuss/approve/${this.data.noteId}`, { disc_id, val: val == 0 ? 1 : 0 }, (res) => {
			if (idx >= 0) {
				this.setData({
					[`dataList[${idx}].myApprove`]: res.val,
					[`dataList[${idx}].count_approve`]: res.count_approve
				});
				return;
			}
			this.setData({ ['discussInfo.myApprove']: res.val, ['discussInfo.count_approve']: res.count_approve });
		});
	},

	refresh() {
		if (datalist.isLoading(this)) return;
		datalist.refresh(this);
	},

	foucus: function(e) {
		var that = this;
		that.setData({ bottom: e.detail.height });
	},
	blur: function(e) {
		var that = this;
		that.setData({ bottom: 0 });
	},
	onLogin: function(userInfo, requireType) {
		this.setData({ pageLoginTime: new Date().valueOf() });
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
