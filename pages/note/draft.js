const app = getApp();

Page({
	data: {},

	getDraftList() {
		app.get('note/edit/info', (res) => {
			this.setData({ draftList: res.draft });
		});
	},

	onLoad: function(options) {
		this.getDraftList();
	},

	onRefresh() {
		this.setData({ refresherTriggered: false });
		this.getDraftList();
	}
});
