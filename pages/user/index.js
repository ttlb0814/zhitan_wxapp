const app = getApp();
var datalist = require('../../utils/datalist');
var refreshMsg = require('../../utils/refreshmsg');

Page({
	data: {
		user: null,
		tab: [ '通知', '经验', '点赞', '交流' ],
		msgList: [ '粉丝通知', '点赞通知', '评论及@通知' ],
		tabIdx: 0,
		refresherTriggered: false
	},

	onLoad: function(options) {
		refreshMsg.bind(this);
		if (!app.globalData.userInfo) return;
		refreshMsg.onNewChat(() => {
			datalist.bind(this, `chat/index`);
		});
	},

	onLogin: function() {
		this.onShow();
		this.setData({ pageLoginTime: new Date().valueOf() });
	},

	touchDotX: 0, //X按下时坐标
	touchDotY: 0, //y按下时坐标
	interval: null, //计时器
	time: 0, //从按下到松开共多少时间*100
	// 触摸开始事件
	touchStart: function(e) {
		this.touchDotX = e.touches[0].pageX; // 获取触摸时的原点
		this.touchDotY = e.touches[0].pageY;
		// 使用js计时器记录时间
		this.interval = setInterval(function() {
			this.time++;
		}, 100);
	},
	// 触摸结束事件
	touchEnd: function(e) {
		let idx = e.currentTarget.dataset.idx;
		let touchMoveX = e.changedTouches[0].pageX;
		let touchMoveY = e.changedTouches[0].pageY;
		let tmX = touchMoveX - this.touchDotX;
		let tmY = touchMoveY - this.touchDotY;
		if (this.time < 20) {
			let absX = Math.abs(tmX);
			let absY = Math.abs(tmY);
			if (absX > 2 * absY) {
				if (tmX < 0) {
					this.setData({ [`dataList[${idx}].touchType`]: 'left' });
				} else {
					this.setData({ [`dataList[${idx}].touchType`]: 'right' });
				}
			}
			if (absY > absX * 2 && tmY < 0) {
				console.log('上滑动=====');
			}
		}
		clearInterval(this.interval); // 清除setInterval
		this.time = 0;
	},

	// 删除私信
	delLetter(e) {
		wx.showModal({
			title: '删除确认',
			content: '确定要删除当前私信吗',
			success: (res) => {
				if (res.confirm) {
					wx.showLoading({ mask: true });
					app.post('chat/del', { user_id: e.currentTarget.dataset.id }, (res) => {
						wx.hideLoading();
						datalist.refresh(this);
					});
					return;
				}
			}
		});
	},

	// 根据元素高度设置回答行数
	onDataShow: function(arr) {
		const that = this;
		let index = this.data.dataList.length - arr.length;

		arr.forEach((item) => {
			let id = '#title_' + item.id;
			const query_title = wx.createSelectorQuery();
			query_title.select(id).boundingClientRect();
			query_title.exec(function(res) {
				if (res[0]) {
					this.contentHeight = res[0].height;
					const contentNum = parseInt(res[0].height / 32);
					const contentShowNum = contentNum > 2 ? contentNum : 2;
					let key = 'dataList[' + index + '].contentShowNum';
					that.setData({
						[key]: contentShowNum
					});
					index++;
				}
			});
		});
	},

	onShow: function() {
		this.setData({ approveMsgNum: app.globalData.approveMsgNum, discussMsgNum: app.globalData.discussMsgNum });
		if (!this.data.user) {
			if (app.globalData.userInfo) {
				this.setData({ user: app.globalData.userInfo });
				datalist.bind(this, `chat/index`);
				refreshMsg.refresh();
			} else if (app.globalData.userTP) {
				this.setData({ user: app.globalData.userTP });
			}
		} else if (this.data.user.third_part && app.globalData.userInfo) {
			this.setData({ user: app.globalData.userInfo });
			datalist.bind(this, `chat/index`);

			refreshMsg.refresh();
		} else refreshMsg.refresh();
	},

	// 列表切换
	parentTab(e) {
		let tabIdx = e.detail.tabIdx;
		if (this.data.tabIdx == tabIdx) return;
		this.setData({ tabIdx });

		tabIdx == 0 && datalist.bind(this, `chat/index`);
		tabIdx == 1 && datalist.bind(this, 'note/index/mine');
		tabIdx == 2 && datalist.bind(this, `user/userapprove/${this.data.user.id}`);
		tabIdx == 3 && datalist.bind(this, 'forum/index/mine');
	},

	postInfo(e) {
		const id = e.currentTarget.dataset.id;
		// type 1:提问；2:交流
		const type = e.currentTarget.dataset.type;
		wx.navigateTo({
			url: `/pages/forum/info?id=${id}&type=${type}`
		});
	},

	// 跳转到答案页
	answerInfo(e) {
		const id = e.currentTarget.dataset.id;
		const post_id = e.currentTarget.dataset.postid;
		const title = e.currentTarget.dataset.title;
		wx.navigateTo({
			url: `/pages/forum/answer-info?id=${id}&post_id=${post_id}&title=${title}`
		});
	},

	// 点赞
	approve(e) {
		if (e.currentTarget.dataset.from) {
			let idx = e.currentTarget.dataset.idx;
			let id = e.currentTarget.dataset.tid;
			let post_id = e.currentTarget.dataset.postid;
			let type = e.currentTarget.dataset.type == 1 ? 0 : 1;
			wx.showLoading();
			app.post(`forum/post/approve`, { id: id, post_id: post_id, type: type }, (res) => {
				wx.hideLoading();

				this.setData({
					['dataList[' + idx + '].approve_sta']: type,
					['dataList[' + idx + '].count_approve']:
						type == 1
							? Number(this.data.dataList[idx].count_approve) + 1
							: Number(this.data.dataList[idx].count_approve) - 1
				});
			});
			return;
		}

		let idx = e.currentTarget.dataset.idx;
		let id = this.data.dataList[idx].id;
		let val = e.currentTarget.dataset.val;

		wx.showLoading({ mask: true });
		app.post(`note/info/approve/${id}`, { val }, (res) => {
			wx.hideLoading();

			this.setData({
				['dataList[' + idx + '].myApprove']: res.val,
				['dataList[' + idx + '].count_approve']: res.count_approve
			});
		});
	},
	goFansPage(e) {
		wx.navigateTo({ url: '/pages/user/fans?type=' + e.currentTarget.dataset.type });
	},

	// 预览
	previewImage(e) {
		let urls = e.currentTarget.dataset.item;
		let current = e.currentTarget.dataset.src;
		wx.previewImage({ current, urls });
	},

	refresh() {
		if (datalist.isLoading(this)) return;
		datalist.refresh(this);
		// console.log(app.globalData.userInfo);
		this.setData({ user: app.globalData.userInfo });
	},
	onLoadMore: function(e) {
		datalist.next(this);
	},
	//页面相关事件处理函数--监听用户下拉动作
	onRefresh: function(e) {
		this.setData({ refresherTriggered: false });
		datalist.refresh(this);
	}
});
