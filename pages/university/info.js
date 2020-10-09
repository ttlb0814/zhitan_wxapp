const app = getApp();
var datalist = require('../../utils/datalist');
Page({
	data: {
		uni_id: null, // 学校id
		refresherTriggered: false,
		tab: [ '简介', '资讯', '经验' ],
		tabIdx: 0
	},

	onLoad: function(options) {
		this.setData({ uni_id: options.id });
		wx.showLoading({ mask: true });
		app.get(`university/info/${options.id}`, (res) => {
			wx.hideLoading();
			this.setData({ schInfo: res.info });
		});
	},

	// 列表切换
	parentTab(e) {
		let tabIdx = e.detail.tabIdx;
		if (this.data.tabIdx == tabIdx) return;
		this.setData({ tabIdx });
		tabIdx == 2 && datalist.bind(this, 'note/index/uni', { uni_id: this.data.uni_id });
		tabIdx == 1 && datalist.bind(this, 'university/newslist', { uni_id: this.data.uni_id });
	},

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

	// 展开全文
	unfold(e) {
		this.setData({ articleHeight: !this.data.articleHeight });
	},

	refresh() {
		if (datalist.isLoading()) return;
		datalist.refresh(this);
	},

	// 点赞
	approve(e) {
		let idx = e.currentTarget.dataset.idx;
		let id = this.data.dataList[idx].id;
		let val = e.currentTarget.dataset.val;

		app.post(`note/info/approve/${id}`, { val }, (res) => {
			this.setData({
				['dataList[' + idx + '].myApprove']: res.val,
				['dataList[' + idx + '].count_approve']: res.count_approve
			});
		});
	},
	// 预览
	previewImage(e) {
		let urls = e.currentTarget.dataset.item;
		let current = e.currentTarget.dataset.src;
		wx.previewImage({ current, urls });
	},

	//页面相关事件处理函数--监听用户下拉动作

	onRefresh: function(e) {
		this.setData({ refresherTriggered: false });
		datalist.refresh(this);
	},

	onLoadMore: function(e) {
		datalist.next(this);
	},

	onShareAppMessage() {
		return {
			title: this.data.schInfo.uni_name,
			path: `/pages/university/info?id=${this.data.uni_id}`
		};
	},

	onShareTimeline() {
		return {
			title: this.data.schInfo.uni_name,
			imageUrl: this.data.schInfo.logoUrl,
			path: `/pages/university/info?id=${this.data.uni_id}`
		};
	},

	onLogin: function(userInfo, requireType) {
		this.setData({ pageLoginTime: new Date().valueOf() });
	},


});
