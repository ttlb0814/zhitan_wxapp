const app = getApp();
Page({
	data: {},

	onLoad: function(options) {
		this.setData({ newsId: options.id });
		wx.showLoading({ mask: true });
		app.get(`university/newsinfo/${this.data.newsId}`, (res) => {
			res.info.content = res.info.content
				.replace(/<img /gi, '<img style="max-width:100%;height:auto;display:block;"')
				.replace(/<p[^>]*>/gi, "<p style='margin-bottom: 1em; display: block; min-height: 1em'>");
			wx.hideLoading();
			this.setData({ newsInfo: res.info });
		});
	},
	onShareAppMessage() {},
	onShareTimeline() {}
});
