const app = getApp();
var datalist = require('../../utils/datalist');

Page({
	data: {
		refresherTriggered: false,
		tab: [ '关注', '推荐' ],
		tabIdx: 1,
		tabSecondIdx: 0,
		imgUrls:[],
		swiperIndex: 0,
		scrollTop:0,
	},



	// 点赞
	approve(e) {
		let idx = e.currentTarget.dataset.idx;
		let id = this.data.dataList[idx].id;
		let val = e.currentTarget.dataset.val;
		app.post(`note/info/approve/${id}`, { val }, (res) => {
			this.setData({ ['dataList[' + idx + '].myApprove']: res.val });
		});
	},

	onLoad() {
		wx.showLoading({ mask: true });
		app.post('topic/swiper', {}, (res) => {
			this.setData({ imgUrls: res.data });
		},fail=>{});
		app.get('note/index/params', (res) => {
			wx.hideLoading();
			res.data.unshift({ name: '综合', params: {} });
			this.setData({ tabSecond: res.data });
			datalist.bind(this, 'note/index/index', this.data.params);
		});
	},
	scroll(e){
		this.setData({scrollTop:e.detail.scrollTop})
	},
	onShow() {
		this.setData({
			pageLoginTime: new Date().valueOf()
		});
	},

	onLogin: function(user, requireType) {
		this.setData({
			pageLoginTime: new Date().valueOf()
		});
	},

	onBtnRegTap: function(e) {
		this.approve();
	},

	// 列表切换
	parentTab(e) {
		let tabIdx = e.detail.tabIdx;
		if (this.data.tabIdx == tabIdx) return;
		this.setData({ tabIdx });
		tabIdx == 0 && datalist.bind(this, 'note/index/fanning');
		tabIdx == 1 && datalist.bind(this, 'note/index/index', this.data.params);
	},

	tabSel(e) {
		let idx = e.currentTarget.dataset.idx;
		if (this.data.tabSecondIdx == idx) return;

		let itemWidth = wx.getSystemInfoSync().windowWidth / this.data.tabSecond.length;

		let scrollLeft = idx > 4 ? itemWidth * idx + itemWidth * 4 : itemWidth * idx;

		this.setData({ params: this.data.tabSecond[idx].params, tabSecondIdx: idx, scrollLeft });
		datalist.refresh(this, this.data.params);
	},

	refresh() {
		if (datalist.isLoading(this)) return;
		datalist.refresh(this, this.data.params);
	},

	previewImage(e) {
		let urls = e.currentTarget.dataset.item;
		let current = e.currentTarget.dataset.src;
		wx.previewImage({ current, urls });
	},

	// 跳转作者个人页
	checkAuthor(e) {
		wx.navigateTo({ url: `../user/author?userId=${e.currentTarget.dataset.userid}` });
	},

	editNote() {
		wx.navigateTo({ url: '/pages/note/edit' });
	},
	/**
 * 页面相关事件处理函数--监听用户下拉动作
 */
	onRefresh: function(e) {
		this.setData({ refresherTriggered: false });
		datalist.refresh(this, this.data.params);
	},

	onLoadMore: function(e) {
		datalist.next(this);
	},

	onShareAppMessage() {
		return {
			title: '真实的艺考硬核干货社区',
			imageUrl: app.globalData.baseUrl + '/img/share-app.jpg'
		};
	},
	onShareTimeline() {
		return {
			title: '真实的艺考硬核干货社区',
			imageUrl: app.globalData.baseUrl + '/img/share-app.jpg'
		};
	}
});
