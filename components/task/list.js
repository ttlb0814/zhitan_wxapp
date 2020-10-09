// components/task/list.js
const app = getApp();
var task = require('../../utils/task');
Component({
	/**
   * 组件的属性列表
   */
	properties: {
		/**
     * 当页面中的onLogin被执行时，更改该属性的值（可以设置为当前时间），组件会自动更新用户状态
     */
		loginTime: {
			type: Number,
			value: null,
			observer: function(newVal) {
				this._setList();
				this.setData({ pageLoginTime: newVal });
			}
		},
		// 在页面中否可以删掉
		isDel: {
			type: Boolean,
			value: true
		}
	},

	/**
   * 组件的初始数据
   */
	data: {
		task: [],
		sec: 0
	},

	/**
   * 组件的方法列表
   */
	methods: {
		_setList: function() {
			console.log('Task List:', app.globalData.task);

			this.setData({
				task: app.globalData.task,
				ary: app.globalData.task
			});
		},

		taskRefresh(sec) {
			this.setData({
				// task: app.globalData.task,
				sec: sec
			});
		},

		signIn(e) {
			let id = e.currentTarget.dataset.id;
			wx.navigateTo({ url: `/pages/task/sign-in?id=${id}` });
		},

		delTask(e) {
			let idx = e.currentTarget.dataset.idx;
			app.globalData.task[idx].is_del=1
			this.setData({ task: app.globalData.task });
		}
	},

	/**
   * 组件生命周期函数-在组件布局完成后执行
   */
	ready: function() {
		task.addPage(this);
		task.start();
	}
});
