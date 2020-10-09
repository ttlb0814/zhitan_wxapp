const app = getApp();
var datalist = require('../../utils/datalist');
Page({
	data: {
		type: null // 消息类型
	},

	onLoad(options) {
		this.setData({ type: options.type });
		wx.setNavigationBarTitle({
			title: options.type == 0 ? '粉丝通知' : options.type == 1 ? '点赞通知' : '评论及@通知'
		});

		options.type == 1 && datalist.bind(this, '/msg/list', { isApprove: 2 });
		options.type == 0 && datalist.bind(this, '/account/user/fans', { isNew: 1 });
		options.type == 2 && datalist.bind(this, '/msg/list', { isApprove: 1 });

		options.type == 1 && (app.globalData.approveMsgNum = false);
		options.type == 2 && (app.globalData.discussMsgNum = false);
	},

	refresh() {
		if (datalist.isLoading(this)) return;
		datalist.refresh(this);
	},

	// 关注用户
	attention(e) {
		let id = e.currentTarget.dataset.id;
		let idx = e.currentTarget.dataset.idx;

		wx.showLoading({ mask: true });
		app.post(`user/fan/${id}`, { oper: this.data.dataList[idx].is_fanning != 0 ? 0 : 1 }, (res) => {
			this.setData({ ['dataList[' + idx + '].is_fanning']: res.info.isMyFanning });
			wx.hideLoading();
		});
	},

	// 评论展开
	reversal(e) {
		let idx = e.currentTarget.dataset.idx;
		this.data.dataList[idx]['reversal'] = this.data.dataList[idx]['reversal'] ? false : true;
		this.setData({ dataList: this.data.dataList });
	},

	//页面相关事件处理函数--监听用户下拉动作

	onRefresh: function(e) {
		this.setData({ refresherTriggered: false });
		datalist.refresh(this);
	},

	onLoadMore: function(e) {
		datalist.next(this);
	},

	skip(e) {
		let item = e.currentTarget.dataset.item;
		let idx = e.currentTarget.dataset.index;
		app.post('msg/read', { id: item.id }, (res) => {
			this.setData({ [`dataList[${idx}].is_read`]: res.succ });
			app.prevRefresh();

			item.data_type == 1 && wx.navigateTo({ url: '/pages/note/info?id=' + item.data_id });

			let dataId = item.data_info.parent_id != 0 ? item.data_info.parent_id : item.data_info.id;
			item.data_type == 2 &&
				wx.navigateTo({
					url: `/pages/note/discussInfo?noteId=${item.data_info.note_id}&&dataId=${dataId}`
				});
		});
	}
});
