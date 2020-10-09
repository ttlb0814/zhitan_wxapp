const app = getApp();
Page({
	data: {},
	Choose(e) {
		let pages = getCurrentPages();
		let prevPage = pages[pages.length - 2];
		prevPage.setData({
			point: e.currentTarget.dataset.item
		});
		wx.navigateBack({ delta: 1 });
	},

	onLoad: function() {
		wx.showLoading({ mask: true });
		wx.getLocation({
			type: 'wgs84',
			success: (res) => {
				app.post('qmap/gcoder', { lat: res.latitude, lng: res.longitude }, (res) => {
					this.setData({ pois: res.data });
					wx.hideLoading();
				});
			}
		});
	}
});
