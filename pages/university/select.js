const app = getApp();

Page({
	data: {
		sel_sch: [],
		selectList: []
	},

	onLoad: function(options) {
		this.setData({
			sel_sch: JSON.parse(options.topicList),
			radio_num: options.radio ? 1 : 3  // 选择数量
		});
		console.log(this.data.radio);
		this.data.sel_sch.forEach((e) => (e['is_sel'] = true));
		this.setData({ sel_sch: this.data.sel_sch });
	},

	seaSch(e) {
		app.post('university/select', { kw: e.detail.value }, (res) => {
			!res.data.length && wx.showToast({ title: '请输入准确名称', icon: 'none' });
			res.data.forEach((e) => (e['is_sel'] = false));

			this.setData({ selectList: res.data });
		});
	},

	selItem(e) {
		let id = e.currentTarget.dataset.item.id;

		let idx = e.currentTarget.dataset.idx;

		if (this.data.sel_sch.map((e) => e.id).indexOf(id) >= 0) {
			wx.showToast({ title: '请勿添加重复学校', icon: 'none' });
			return;
		}

		if (this.data.sel_sch.filter((e) => e.is_sel).length >= this.data.radio_num) {
			wx.showToast({ title: `最多只能选${this.data.radio_num}所高校`, icon: 'none' });
			return;
		}

		e.currentTarget.dataset.item['is_sel'] = true;
		this.data.sel_sch.push(e.currentTarget.dataset.item);
		this.data.selectList.splice(idx, 1);
		this.setData({ sel_sch: this.data.sel_sch, selectList: this.data.selectList });
	},

	delItem(e) {
		let idx = e.currentTarget.dataset.idx;

		if (this.data.sel_sch.filter((e) => e.is_sel).length >= this.data.radio_num && !this.data.sel_sch[idx].is_sel) {
			wx.showToast({ title: `最多只能选${this.data.radio_num}所高校`, icon: 'none' });
			return;
		}

		this.setData({ [`sel_sch[${idx}].is_sel`]: !this.data.sel_sch[idx].is_sel });
	},

	confirm() {
		let pages = getCurrentPages();
		let prevPage = pages[pages.length - 2];
		let university = this.data.sel_sch.filter((e) => e.is_sel);

		prevPage.setData({ university });
		wx.navigateBack({ delta: 1 });
	}
});
