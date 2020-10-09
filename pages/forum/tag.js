const app = getApp();

Page({
	data: {},

	onLoad: function(options) {
		this.setData({
			tagList_ary: JSON.parse(options.tagList || []),
			hotTags_ary: JSON.parse(options.hotTags || [])
		});

		this.getTagList();
	},

	getTagList() {
		app.post('forum/index/tag', {}, (res) => {
			res.data.map((e) => (e.is_sel = false));
			res.data.sort((item1, item2) => item1.count_thread - item2.count_thread);

			const hotTags = res.data.splice(-4, 4);
			res.data.forEach((e) => {
				hotTags.forEach((item) => {
					e == item && res.data.splice(e, 1);
				});
			});
			this.setData({ hotTags: hotTags, tagList: res.data });

			// 已有选择赋值
			if (this.data.tagList_ary.length > 0) {
				res.data.forEach((e) => {
					this.data.tagList_ary.forEach((item) => {
						e.id == item.id && this.setData({ [`tagList[${res.data.indexOf(e)}]`]: item });
					});
				});
			}

			if (this.data.hotTags_ary.length > 0) {
				hotTags.forEach((e) => {
					this.data.hotTags_ary.forEach((item, idx) => {
						e.id == item.id && this.setData({ [`hotTags[${hotTags.indexOf(e)}]`]: item });
					});
				});
			}
		});
	},

	confirm() {
		let pages = getCurrentPages();
		let prevPage = pages[pages.length - 2];

		prevPage.setData({
			tags: this.data.tagList.filter((e) => e.is_sel).concat(this.data.hotTags.filter((e) => e.is_sel)),
			tagList: this.data.tagList.filter((e) => e.is_sel),
			hotTags: this.data.hotTags.filter((e) => e.is_sel)
		});
		wx.navigateBack({ delta: 1 });
	},

	// 选择标签

	selTag(e) {
		const type = e.currentTarget.dataset.from;
		const idx = e.currentTarget.dataset.idx;

		let count = this.data.hotTags.filter((e) => e.is_sel).length + this.data.tagList.filter((e) => e.is_sel).length;
		let ary = type == 'hotTag' ? this.data.hotTags : this.data.tagList;

		if (count >= 3 && ary[idx].is_sel == false) {
			wx.showToast({ title: '最多只能选择3个标签', icon: 'none' });
			return;
		}

		let key = type == 'hotTag' ? 'hotTags' : 'tagList';
		this.setData({ [`${key}[${idx}].is_sel`]: !ary[idx].is_sel });
	}
});
