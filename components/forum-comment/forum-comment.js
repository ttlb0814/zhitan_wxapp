const app = getApp();

Component({
	properties: {
		item: {
			type: Object,
			value: {}
		},
		infoId: {
			type: Number,
			value: 0
		},

		// 组件当前索引
		idx: {
			type: Number,
			value: 0
		},
		userId: {
			type: Number,
			value: null
		},
		isReg: {
			type: Boolean,
			value: false
		},
		postType: {
			type: Number,
			value: null
		},
		authorId: {
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

	data: {

	},

	methods: {
		// 点赞
		discapprove(e) {
			if (!app.globalData.userInfo && !app.globalData.userTP) {
				wx.navigateTo({
					url: '/pages/user/reg'
				});
				return;
			}
			let post_id = e.currentTarget.dataset.id;
			let type = this.properties.item.approve_sta;

			app.post(`forum/post/approve`, {id: this.properties.infoId, post_id, type: type ? 0 : 1 }, (res) => {
				this.setData({ ['item.approve_sta']: this.data.item.approve_sta == 0 ? '1': 0, ['item.count_approve']: res.info.count_approve });
			});
		},

		// 删除
		delete(e) {
			let post_id = e.currentTarget.dataset.id;
			wx.showModal({
				title: '删除确认',
				content: '确定要删除当前评论吗',
				success: (res) => {
					if (!res.confirm) return;
					wx.showLoading({ mask: true });
					app.post(`forum/post/del`, { id: this.properties.infoId, post_id }, (res) => {
						wx.hideLoading();
						res.succ == 1 && this.setData({ ['item.is_del']: 1 });
					});
				}
			});
		},

		// 发送二级评论
		commont(e) {
			this.triggerEvent('parentReceive', {
				ipt: true,
				id: e.currentTarget.dataset.id,
				commentIdx: this.properties.idx,
				forumComment: true
			});
			// console.log(this.properties, this.properties.idx)
		},

		goHomepage(e) {
			// if (!this.data.isReg) {
			// 	wx.navigateTo({ url: '/pages/user/reg' });
			// 	return;
			// }
			wx.navigateTo({ url: '/pages/user/author?userId=' + e.currentTarget.dataset.id });
		}
	},

	lifetimes: {
		ready() {
			if (app.globalData.userInfo) this.setData({ myselfId: app.globalData.userInfo.id });
		}
	}
});
