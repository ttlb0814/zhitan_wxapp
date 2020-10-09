const app = getApp();
var datalist = require('../../utils/datalist');
Page({
	data: {
		refresherTriggered: false,
		tab: [ '经验', '简介' ],

		tabIdx: 0
	},

	onLoad: function(options) {
		this.setData({ inst_id: options.id });
		wx.showLoading({ mask: true });
		app.get(`inst/info/${options.id}`, (res) => {
			wx.hideLoading();
			this.setData({ instInfo: res.info });
		});

		datalist.bind(this, 'note/index/inst', { inst_id: this.data.inst_id });
	},

	// 列表切换
	parentTab(e) {
		let tabIdx = e.detail.tabIdx;
		if (this.data.tabIdx == tabIdx) return;
		this.setData({ tabIdx });
		tabIdx == 0 && datalist.bind(this, 'note/index/inst', { inst_id: this.data.inst_id });
	},

	// 展开全文
	unfold(e) {
		this.setData({ articleHeight: !this.data.articleHeight });
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

	onShareAppMessage() {
		return {
			title: this.data.instInfo.inst_name,
			path: `/pages/organization/info?id=${this.data.inst_id}`
		};
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

	refresh() {
		if (datalist.isLoading()) return;
		datalist.refresh(this);
	},

	//页面相关事件处理函数--监听用户下拉动作

	onRefresh: function(e) {
		this.setData({ refresherTriggered: false });
		datalist.refresh(this);
	},

	onLoadMore: function(e) {
		datalist.next(this);
	},

	onShareTimeline() {
		return {
			title: this.data.instInfo.inst_name,
			imageUrl: this.data.instInfo.logoUrl,
			path: `/pages/organization/info?id=${this.data.inst_id}`
		};
	},
	onLogin: function(userInfo, requireType) {
		this.setData({ pageLoginTime: new Date().valueOf() });
	}
});
