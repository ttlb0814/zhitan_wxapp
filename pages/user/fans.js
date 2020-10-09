const app = getApp();
var datalist = require('../../utils/datalist');
Page({
	data: {
		refresherTriggered: false
	},

	onLoad: function(options) {
		this.setData({ type: options.type, tabIdx: options.type != 'fans' ? 1 : 0 });
		datalist.bind(this, `account/user/${options.type}`);
	},
	onShow() {
		app.get('account/user/info', (res) => {
			app.globalData.userInfo = res.user;
			this.setData({
				tab: [ `粉丝 ${res.user.count_fans}`, `关注 ${res.user.count_fanning}` ]
			});
		});
	},

	refresh() {
		if (datalist.isLoading(this)) return;
		datalist.refresh(this);
	},

	// 列表切换
	parentTab(e) {
		let tabIdx = e.detail.tabIdx;
		if (this.data.tabIdx == tabIdx) return;
		this.setData({ tabIdx, type: tabIdx ? 'fanning' : 'fans' });

		datalist.bind(this, `account/user/${this.data.type}`);
	},

	//页面相关事件处理函数--监听用户下拉动作

	onRefresh: function(e) {
		this.setData({ refresherTriggered: false });
		datalist.refresh(this);
	},

	onLoadMore: function(e) {
		datalist.next(this);
	},
	onUnload() {
		app.prevRefresh();
	}
});
