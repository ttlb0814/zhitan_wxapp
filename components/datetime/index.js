// components/datetime/index.js
const app = getApp();
Component({
	/**
   * 组件的属性列表
   */
	properties: {
		/**
     * 时间戳（秒）
     */
		value: {
			type: Number,
			value: 0,
			observer: function() {
				this.setDateStr();
			}
		},
		format: {
			type: String,
			value: 'yyyy-MM-dd HH:mm:ss'
		},

		/**
     * 是否显示为友好的时间，如3分钟前，刚刚，1小时前等
     */
		friendly: {
			type: Boolean,
			value: false
		}
	},

	/**
   * 组件的初始数据
   */
	data: {
		dateStr: ''
	},

	/**
   * 组件的方法列表
   */
	methods: {
		setDateStr: function() {
			this.setData({
				dateStr: this.calc()
			});
		},

		calc: function() {
			var ts = this.properties.value;
			if (this.properties.friendly) {
				var now = Math.round(new Date().getTime() / 1000);
				var v = now - ts;
				//if (v < 0) return d.Format(this.properties.format);

				if (v < 60) return '刚刚';

				if (v < 3600) return Math.floor(v / 60) + '分钟前';

				if (v < 86400) {
					return Math.floor(v / 3600) + '小时前';
					// return Math.floor(v/3600)+"时"+Math.floor(v%3600/60)+"分前";
				}

				var date = new Date(ts * 1000);

				if (v < 2592000) {
					// return date.Format("MM月dd日 HH:mm")
					return date.Format('MM月dd日');
				}

				return date.Format('yyyy-MM-dd');
			}
			return new Date(ts * 1000).Format(this.properties.format);
		}
	}
});
