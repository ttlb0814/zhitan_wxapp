// components/popup/index.js
const app = getApp();
Component({
	/**
   * 组件的属性列表
   */
	properties: {},

	/**
   * 组件的初始数据
   */
	data: {
		show: false,
		imgUrl: '',
		navUrl: '',
		guideUrl: app.globalData.baseUrl + 'img/instruction.png'
	},

	/**
   * 组件的方法列表
   */
	methods: {
		_close: function() {
			this.setData({
				show: false
			});
		},

		_nav: function() {
			this._close();
			if (!this.data.navUrl) return;
			wx.navigateTo({
				url: this.data.navUrl
			});
		}
	},

	/**
   * 组件生命周期函数-在组件布局完成后执行
   */
	ready: function() {
		var page = getCurrentPages();

		page = page[page.length - 1];

		var route = page.route;

		var options = page.options;

		if (!app.globalData.popups) return;

		var popup = null;

		for (var i = 0, len = app.globalData.popups.length; i < len; i++) {
			if (app.globalData.popups[i].page == route) {
				popup = app.globalData.popups[i];
				break;
			}
		}

		if (popup == null) return;

		if (popup.params) {
			var arr = popup.params.split('&');
			for (var i = arr.length - 1; i >= 0; i--) {
				var tmp = arr[i].split('=');
				if (tmp != 2) continue;

				if (options[tmp[0]] != tmp[1]) return;
			}
		}

		this.setData({
			show: true,
			imgUrl: popup.img,
			navUrl: popup.url
		});
	}
});
