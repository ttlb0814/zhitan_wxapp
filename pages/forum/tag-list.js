const app = getApp();
var datalist = require('../../utils/datalist');
Page({
	data: {},

	onLoad: function(options) {
		wx.setNavigationBarTitle({ title: options.title });
		this.setData({ tag_id: options.tag_id });
		datalist.bind(this, 'forum/index/tagindex', { tag_id: options.tag_id });
	},

	onShareAppMessage: function() {},
	onLogin() {
		this.setData({ pageLoginTime: new Date().valueOf() });
	},

	// 交流点赞
	circleApprove(e) {
		const post_id = e.currentTarget.dataset.postid;
		const id = e.currentTarget.dataset.tid;
		const idx = e.currentTarget.dataset.idx;
		const type = e.currentTarget.dataset.type == 1 ? 0 : 1;
		app.post('forum/post/approve', { id: id, post_id: post_id, type: type }, (res) => {
			const key = 'dataList[' + idx + '].approve_sta';
			this.setData({
				[key]: this.data.dataList[idx].approve_sta == 1 ? 0 : 1
			});
		});
	},

	refresh() {
		if (datalist.isLoading(this)) return;
		datalist.refresh(this, { tag_id: this.data.tag_id });
	},
	/**
 * 页面相关事件处理函数--监听用户下拉动作
 */
	onRefresh: function() {
		this.setData({
			refresherTriggered: false
		});
		datalist.refresh(this, { tag_id: this.data.tag_id });
	},

	onLoadMore: function(e) {
		datalist.next(this);
	}
});
