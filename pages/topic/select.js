const app = getApp();
Page({
	data: {
		topicVal: ''
	},
	setTimeout: '',

	selTopic(e) {
		if (this.data.topicList.length >= 3) {
			wx.showToast({ title: '最多设置三个话题', icon: 'none' });
			this.setData({ topicVal: '', searchList: [] });
			clearTimeout(this.setTimeout);
			return;
		}

		if (this.data.topicList.map((e) => e.id).indexOf(e.currentTarget.dataset.id) >= 0) {
			wx.showToast({ title: '请勿添加重复话题', icon: 'none' });
			return;
		}

		let params = {
			id: e.currentTarget.dataset.id || 0,
			topic_name: e.detail.value || e.currentTarget.dataset.value
		};
		this.data.topicList.push(params);
		this.setData({ topicList: this.data.topicList, topicVal: '', searchList: [] });
		clearTimeout(this.setTimeout);
	},

	// 监听输入
	watchPassWord(e) {
		if (e.detail.cursor <= 1) {
			clearTimeout(this.setTimeout);
			this.setData({ searchList: [] });
			return;
		}
		this.setData({ topicVal: e.detail.value });
		this.debounce(this.searchTopic, 500, this.data.topicVal);
	},

	debounce(fn, delay, text) {
		clearTimeout(this.setTimeout);
		this.setTimeout = setTimeout(() => {
			fn(text);
		}, delay);
	},

	searchTopic(kw) {
		app.post('topic/search', { kw }, (res) => {
			this.setData({ searchList: res.data });
		});
	},

	hotTopic() {
		wx.showLoading({ mask: true });
		app.get('topic/hot', (res) => {
			wx.hideLoading();
			this.setData({ hotList: res.data });
		});
	},

	remove(e) {
		let idx = e.currentTarget.dataset.index;
		this.data.topicList.splice(idx, 1);
		this.setData({ topicList: this.data.topicList });
	},

	confirm() {
		let pages = getCurrentPages();
		let prevPage = pages[pages.length - 2];
		prevPage.setData({ topicList: this.data.topicList });
		wx.navigateBack({ delta: 1 });
	},

	onLoad(options) {
		let topicList;

		topicList = options.topicList != 'undefined' ? JSON.parse(options.topicList) : [];
		topicList.forEach((e) => {
			delete e.heat_index;
			delete e.count_data;
		});
		this.setData({ topicList });
	}
});
