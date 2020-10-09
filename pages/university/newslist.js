const app = getApp();
var datalist = require('../../utils/datalist');
Page({
	data: {
		refresherTriggered: false
	},

	onLoad: function(options) {
		datalist.bind(this, 'university/newslist');
	},

	refresh() {
		if (datalist.isLoading(this)) return;
		datalist.refresh(this);
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
