const app = getApp();
var datalist = require('../../utils/datalist');
Page({
	data: { val: '', tab: [ '用户', '经验/交流',  '学校' ], tabIdx: 1 },

	onLoad: function(options) {
		this.setData({ kw: options.kw, tabIdx: options.tabIdx });
		this.bind(options.tabIdx);
	},

	getSearch(e) {
		this.setData({ kw: e.detail.value });
		datalist.refresh(this, { kw: this.data.kw });
	},
	// 输入框监控
	watchInput(event) {
		this.setData({ kw: event.detail.value });
	},
	goHomepage(e) {
		wx.navigateTo({ url: '/pages/user/author?userId=' + e.currentTarget.dataset.id });
	},
	
	//经验 点赞
	approve(e) {
		let idx = e.currentTarget.dataset.idx;
		let id = this.data.dataList[idx].data_id;
		let val = e.currentTarget.dataset.val;

		wx.showLoading({ mask: true });
		app.post(`note/info/approve/${id}`, { val }, (res) => {
			wx.hideLoading();

			this.setData({
				['dataList[' + idx + '].myApprove']: res.val,
				['dataList[' + idx + '].count_approve']: res.count_approve
			});
			app.prevRefresh();
		});
	},

	// 交流点赞
	circleApprove(e) {
		const post_id = e.currentTarget.dataset.postid;
		const id = e.currentTarget.dataset.tid;
		const idx = e.currentTarget.dataset.idx;
		const type = e.currentTarget.dataset.type == 1 ? 0 : 1
		app.post('forum/post/approve', { id: id, post_id: post_id, type: type }, (res) => {
			const key = 'dataList[' + idx + '].approve_sta';
			this.setData({
				[key]: type
			});
		});
	},

	// 列表切换
	parentTab(e) {
		if (this.data.tabIdx == e.detail.tabIdx) return;
		this.setData({ tabIdx: e.detail.tabIdx });
		this.bind(e.detail.tabIdx);
	},

	bind(idx) {
		idx == 1 && datalist.bind(this, 'search/index', { kw: this.data.kw });
		idx == 0 && datalist.bind(this, 'search/user', { kw: this.data.kw });
		idx == 2 && datalist.bind(this, 'university/index', { kw: this.data.kw });
	},

	// 预览
	previewImage(e) {
		let urls = e.currentTarget.dataset.item;
		let current = e.currentTarget.dataset.src;
		wx.previewImage({ current, urls });
	},

	clearkw() {
		this.setData({ kw: '', dataList: [] });
	},

	refresh() {
		if (datalist.isLoading(this)) return;
		datalist.refresh(this, { kw: this.data.kw });
	},


	/**
 * 页面相关事件处理函数--监听用户下拉动作
 */
	onRefresh: function() {
		this.setData({
			refresherTriggered: false
		});
		datalist.refresh(this, { kw: this.data.kw });
	},

	onLoadMore: function(e) {
		datalist.next(this);
	},

	onLogin: function(userInfo, requireType) {
		this.setData({  pageLoginTime: new Date().valueOf() });
	},


});
