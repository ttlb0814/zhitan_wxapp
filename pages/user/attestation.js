Page({
	data: {},
	onLoad: function(options) {},

	copyText: function(e) {
		wx.setClipboardData({
			data: e.currentTarget.dataset.text,
			success: function(res) {
				wx.getClipboardData({
					success: function(res) {
						wx.showToast({
							title: '复制成功'
						});
					}
				});
			}
		});
	},

	/**
   * 用户点击右上角分享
   */
	onShareAppMessage: function() {}
});
