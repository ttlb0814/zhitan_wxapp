const app = getApp();
var datalist = require('../../utils/datalist');

Page({
	data: {
		refresherTriggered: false,
		searchVal: '',
		multiIndex: [ 0, 0 ],
		uniIdx: 0, //  院校分类索引
		tabSecondIdx: 0, // tab


		baseUrl: app.globalData.baseUrl,
		isQQ: app.globalData.isQQ
	},

	onLoad: function(options) {
		app.post('university/params', {}, (res) => {
			var obj = { id: null, name: '不限', cities: [ { id: null, name: '不限' } ] };
			res.province.forEach((e) => {
				e.cities.unshift({ name: '全部地区', id: null });
			});
			res.uniacad.unshift({ acad_name: '院校分类', id: '' });

			res.province.unshift(obj);
			this.setData({ province: res.province, uniacad: res.uniacad, tabSecond: res.filters });
			this.setData({ multiArray: [ res.province, res.province[0].cities ] });

			datalist.bind(this, 'university/index', this.getParams());
		});
	},

	onShow: function() {
		
		this.setData({
			pageLoginTime: new Date().valueOf()
		});
	},

	tabSel(e) {
		let idx = e.currentTarget.dataset.idx;
		if (this.data.tabSecondIdx == idx) return;
		let itemWidth = wx.getSystemInfoSync().windowWidth / this.data.tabSecond.length;

		let scrollLeft = idx > 4 ? itemWidth * idx + itemWidth * 4 : itemWidth * idx;

		this.setData({ params: this.data.tabSecond[idx].params, tabSecondIdx: idx, scrollLeft });
		datalist.refresh(this, this.getParams());
	},

	// 选择地区
	selRegion: function(e) {
		var data = {
			multiArray: this.data.multiArray,
			multiIndex: this.data.multiIndex
		};
		data.multiIndex[e.detail.column] = e.detail.value;
		switch (e.detail.column) {
			case 0:
				data.multiArray[1] = this.data.province[e.detail.value].cities;
				if(this.data.multiIndex[1]>this.data.province[e.detail.value].cities.length){
					this.setData({['multiIndex[1]']:0})
				}
				break;
		}
		this.setData(data);
	},

	bindPickerChange: function(e) {
		this.setData({ [e.currentTarget.dataset.type]: e.detail.value });
		datalist.refresh(this, this.getParams());
	},

	bindMultiPickerChange: function(e) {
		this.setData({
			prov_id: this.data.multiArray[0][e.detail.value[0]].id,
			city_id: this.data.multiArray[1][e.detail.value[1]].id
		});
		datalist.refresh(this, this.getParams());
	},

	getParams() {
		return Object.assign(this.data.tabSecond[this.data.tabSecondIdx].params, {
			kw: this.data.searchVal,
			city_id: this.data.city_id,
			prov_id: this.data.prov_id,
			acad_id: this.data.uniacad ? this.data.uniacad[this.data.uniIdx].id : ''
		});
	},

	clearkw() {
		this.setData({ searchVal: '' });
		datalist.refresh(this, this.getParams());
	},

	// 输入框监控
	watchInput(event) {
		this.setData({ searchVal: event.detail.value });
	},

	searchSch(e) {
		this.setData({ searchVal: e.detail.value });
		datalist.refresh(this, this.getParams());
	},

	onLogin: function(user, requireType) {
		this.setData({ pageLoginTime: new Date().valueOf() });
	},

	refresh() {
		if (datalist.isLoading(this)) return;
		datalist.refresh(this, this.getParams());
	},

	//页面相关事件处理函数--监听用户下拉动作

	onRefresh: function(e) {
		this.setData({ refresherTriggered: false });
		datalist.refresh(this, this.getParams());
	},

	onLoadMore: function(e) {
		datalist.next(this);
	},

	onShareAppMessage() {},
	onShareTimeline() {}
});
