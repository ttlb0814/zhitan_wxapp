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
		loginTime: {
			type: Number,
			value: null,
			observer: function(newVal) {
				this.setData({ pageLoginTime: newVal });
			}
		}
	},

	data: {},

	methods: {
		// 点赞
		discapprove(e) {
			let disc_id = e.currentTarget.dataset.id;
			let val = this.properties.item.myApprove;
			app.post(`note/discuss/approve/${this.properties.infoId}`, { disc_id, val: val ? 0 : 1 }, (res) => {
				this.setData({ ['item.myApprove']: res.val, ['item.count_approve']: res.count_approve });
			});
		},

		// 删除
		delete(e) {
			let disc_id = e.currentTarget.dataset.id;
			wx.showModal({
				title: '删除确认',
				content: '确定要删除当前评论吗',
				success: (res) => {
					if (!res.confirm) return;
					wx.showLoading({ mask: true });
					app.post(`note/discuss/del/${this.properties.infoId}`, { disc_id }, (res) => {
						wx.hideLoading();
						res.succ == 1 && this.setData({ ['item.deleted']: 1 });
					});
				}
			});
		},

		// 发送二级评论
		commont(e) {
			this.triggerEvent('parentReceive', {
				ipt: true,
				id: e.currentTarget.dataset.id,
				commentIdx: this.properties.idx
			});
			console.log(this.properties, this.properties.idx);
		},

		goHomepage(e) {;
			wx.navigateTo({ url: '/pages/user/author?userId=' + e.currentTarget.dataset.id });
		},
	},

	lifetimes: {
		ready() {
			if (app.globalData.userInfo) this.setData({ myselfId: app.globalData.userInfo.id });
		}
	}
});
