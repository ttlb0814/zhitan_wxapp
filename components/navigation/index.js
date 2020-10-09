const app = getApp();
Component({
	// 自定义tab，需在页面json中设置 "navigationStyle": "custom"
	properties: {
		// 作者信息
		author: {
			type: Object,
			value: {}
		},
		// 文章id
		/**
  		 * 传文章id会改变样式!!
  		 */
		infoId: {
			type: Number,
			value: null
		},
		loginTime: {
			type: Number,
			value: null,
			observer: function(newVal) {
				this.setData({ pageLoginTime: newVal });
			}
		}
	},

	/**
   * 组件的初始数据
   */
	data: {
		statusBarHeight: app.globalData.statusBarHeight
	},

	/**
   * 组件的方法列表
   */
	methods: {
		// 关注用户
		attention(e) {

			let id = e.currentTarget.dataset.id;

			wx.showLoading({ mask: true });
			app.post(`user/fan/${id}`, { oper: this.data.author.isMyFanning != 0 ? 0 : 1 }, (res) => {
				this.setData({ ['author.isMyFanning']: res.info.isMyFanning });
				app.prevRefresh();
				wx.hideLoading();
			});
		},

		goBack() {
			var page = getCurrentPages();
			if (page.length < 2) {
				wx.switchTab({ url: '../../pages/note/index' });
				return;
			}
			wx.navigateBack({ detail: 1 });
		},

		goHomepage() {
			if (this.properties.author.is_anonymous != 1) {
				let url = '/pages/user/author?userId=' + this.properties.author.id;
				wx.navigateTo({ url });
			}
		},
		editNote() {
			wx.navigateTo({ url: `/pages/note/edit?id=${this.properties.infoId}` });
		}
	},
	lifetimes: {
		ready() {
			if (app.globalData.userInfo)
				this.setData({ myselfId: app.globalData.userInfo.id});
		}
	}
});
