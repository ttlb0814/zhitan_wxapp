const app = getApp();

Page({
	data: {
		record: [],
		comment: '' // 评论内容
	},

	setInterval: null, // 定时器

	onLoad: function(options) {
		this.setData({ user_id: options.id });
		this.chatRecord();

		this.setInterval = setInterval(() => {
			this.chatRecord(
				{
					is_new: 1,
					last_id: this.data.record[this.data.record.length - 1]
						? this.data.record[this.data.record.length - 1].id
						: ''
				},
				'update'
			);
		}, 5000);
		app.prevRefresh();
	},

	// 获取与给定id用户的私信记录
	chatRecord(e, type) {
		let obj = e ? { ...e } : { is_new: 0 };
		type === 'more' && wx.showLoading({ mask: true });
		app.post('chat/user', Object.assign(obj, { user_id: this.data.user_id }), (res) => {
			type && wx.hideLoading();
			wx.setNavigationBarTitle({ title: res.other.nick_name });

			res.data.forEach((e) => {
				// 是否和上一个时间节点相等
				e['is_now'] = new Date(e.add_time * 1000).Format('HH:mm');
			});

			this.setData({
				record:
					type === 'more'
						? res.data.reverse().concat(this.data.record)
						: this.data.record.concat(res.data.reverse()),
				myself: res.myself,
				other: res.other
			});
			type != 'update' && this.setData({ isEnd: res.isEnd });
			type === 'more' && this.setData({ toLast: `item${res.data.length}` });
			!e && this.setData({ toLast: `item${this.data.record.length}` });
		});
	},

	// 发送消息
	sendNews(e) {
		app.post(
			'chat/add',
			{
				user_id: this.data.user_id,
				last_id: this.data.record[this.data.record.length - 1]
					? this.data.record[this.data.record.length - 1].id
					: '',
				content: this.data.comment
			},
			(res) => {
				this.setData({ record: this.data.record.concat(res.data.reverse()), comment: '' });
				this.setData({ toLast: `item${this.data.record.length}` });
				app.prevRefresh();
			}
		);
	},

	TimeID: -1,

	// 查看更多
	overMore() {
		clearTimeout(this.TimeID);
		this.TimeID = setTimeout(() => {
			this.data.isEnd == 0 && this.chatRecord({ is_new: 0, last_id: this.data.record[0].id }, 'more');
		}, 500);
	},

	onHide() {
		clearInterval(this.setInterval);
	},
	onUnload() {
		clearInterval(this.setInterval);
	},
	foucus(e) {
		this.setData({ bottom: e.detail.height });
	},

	blur(e) {
		this.setData({ bottom: 0 });
	},

	watchIpt(e) {
		this.setData({ comment: e.detail.value });
	}
});
