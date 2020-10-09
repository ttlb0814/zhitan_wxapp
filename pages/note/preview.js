const app = getApp();
Page({
	/**
   * 页面的初始数据
   */
	data: {},

	/**
   * 生命周期函数--监听页面加载
   */
	onLoad: function(options) {
		let content = wx.getStorageSync('content');
		content =
			content &&
			content
				.replace(/<img /gi, '<img style="max-width:100%;height:auto;display:block;"')
				.replace(/<p[^>]*>/gi, "<p style='margin-bottom: 1em; display: block; min-height: 1em'>");

		this.setData({ title: options.title, content });
	}
});
