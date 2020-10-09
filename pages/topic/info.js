const app = getApp();
const datalist = require('../../utils/datalist');

Page({
	data: {
		refresherTriggered: false
	},

	onLoad: function(options) {
		this.setData({ id: options.id });
		wx.showLoading({ mask: true });
		app.post('topic/info', { id: options.id }, (res) => {
			this.setData({ topicInfo: res.info });
			wx.hideLoading();
		});

		datalist.bind(this, 'topic/contentlist', { id: options.id });
	},

	refresh() {
		datalist.bind(this, 'topic/contentlist', { id: this.data.id });
		if (datalist.isLoading()) return;
		datalist.refresh();
	},

	/**
 * 页面相关事件处理函数--监听用户下拉动作
 */
	onRefresh: function(e) {
		this.setData({
			refresherTriggered: false
		});
		datalist.refresh();
	},

	onLoadMore: function(e) {
		datalist.next();
	},

	onUnload() {
		app.prevRefresh();
	}
});
