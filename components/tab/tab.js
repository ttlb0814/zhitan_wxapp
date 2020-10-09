Component({
	/**
   * 组件的属性列表
   */
	properties: {
		//	tab数组
		tab: {
			type: Object,
			value: []
		},
		// 默认索引
		tabIdx: {
			type: Number,
			value: 0
		},
		//每个间距
		margin: {
			type: String,
			value: '0'
		}
	},

	/**
   * 组件的初始数据
   */
	data: {},

	methods: {
		alterTab(e) {
			let tabIdx = e.currentTarget.dataset.idx;
			this.triggerEvent('parentReceive', { tabIdx });
		}
	}
});
