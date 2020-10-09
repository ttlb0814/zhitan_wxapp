// components/search/index.js
Component({
	options: {
		addGlobalClass: true
	},
	/**
   * 组件的属性列表
   */
	properties: {
		/**
     * 搜索值为空时的默认显示内容
     */
		placeholder: {
			type: String,
			value: '搜索艺考学校/专业名查看更多经验'
		},

		/**
     * 默认搜索值
     */
		value: {
			type: String,
			value: '',
			observer: function(newVal) {
				this.setData({ val: newVal });
			}
		},

		/**
     * 控制跳转后页面的tab
     */
		tabIdx: {
			type: Number,
			value: 1
		},

		/**
     * 搜索历史记录标注（不同类型的数据搜索可以存储不同类型的搜索历史）
     */
		historykey: {
			type: String,
			value: '',
			observer: function(newVal) {
				if (!newVal) return;
				this.setData({
					historyKeyName: 'search-history-' + newVal
				});
			}
		}
	},

	/**
   * 组件的初始数据
   */
	data: {
		is_active: false,
		val: '',

		arrHistory: [],

		historyKeyName: 'search-history'
	},

	/**
   * 组件的方法列表
   */
	methods: {
		_searchStart: function() {
			this.setData({ is_active: true });

			//获取搜索历史记录
			var arr = wx.getStorageSync(this.data.historyKeyName);

			if (arr)
				this.setData({
					arrHistory: arr
				});
		},

		_search: function(e) {
			this._searchEnd(e.detail.value);
		},

		_historySearch: function(e) {
			this._searchEnd(e.currentTarget.dataset.value);
		},

		_searchEnd: function(kw) {
			this.setData({ is_active: false, val: kw });

			kw = kw.trim();
			if (!kw) return;
			var arr = this.data.arrHistory;

			var idx = arr.indexOf(kw);
			if (idx >= 0) arr.splice(idx, 1);

			arr.unshift(kw);
			if (arr.length > 12) {
				//最多记录10条历史记录
				arr.pop();
			}

			wx.setStorageSync(this.data.historyKeyName, arr);
			wx.navigateTo({ url: `/pages/note/search?kw=${kw}&&tabIdx=${this.properties.tabIdx}` });
			this.setData({ val: '' });
			this.triggerEvent('confirm', { value: kw });
		},

		_cancel() {
			this.setData({ val: '' });
			this.triggerEvent('confirm', { value: '' });
		},

		history_cancel() {
			this.setData({ is_active: false });
		},

		// 清楚历史
		clear_history() {
			wx.showModal({
				title: '清空确认',
				content: '确实要清空历史记录？',
				success: (e) => {
					if (!e.confirm) return;
					wx.removeStorage({ key: this.data.historyKeyName });

					this.setData({ arrHistory: [] });
				}
			});
		}
	}
});
