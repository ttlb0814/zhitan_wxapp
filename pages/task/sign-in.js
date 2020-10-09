// pages/sign-in/index.js
const app = getApp();
var task = require('../../utils/task');
Page({
	/**
   * 页面的初始数据
   */
	data: {
		signInImage: '',
		showModal: false,
		signData: [
			{
				money: 0.5
			},
			{
				money: 0.5
			},
			{
				money: 0.5
			},
			{
				money: 0.5
			},
			{
				money: 0.5
			},
			{
				money: 0.5
			},
			{
				money: 2
			}
		],
		money: 0,
		signin_sta: 'time_out'
	},
	isSign: false,

	closeModal() {
		this.setData({ adoptRedpacket: false });
	},

	adoptRedpacket() {
		this.setData({ adoptRedpacket: true });
	},

	catch() {
		console.log('点击弹窗');
	},

	// 复制微信号或qq号
	copyText(e) {
		wx.setClipboardData({
			data: e.currentTarget.dataset.text,
			success: function(res) {
				wx.getClipboardData({
					success: function(res) {
						wx.showToast({
							title: '复制成功'
						});
					}
				});
			}
		});
	},

	id: 0,

	/**
   * 生命周期函数--监听页面加载
   */
	onLoad: function(options) {
		wx.showLoading({mask: true})
		this.setData({
			id: options.id,
			signInImage: app.globalData.baseUrl + 'img/popup-qiandao.jpg'
		});

		if(app.globalData.userLoaded) this.onLogin(app.globalData.userInfo, app.globalData.requireType);
	},

	getSignInfo() {
		app.post(`task/info/info`, { id: this.data.id }, (res) => {
			console.log(res);
			this.setData({ signInfo: res.data });
			wx.hideLoading()
			if (!res.data.tu) return;
			this.data.signData.forEach((item, i) => {
				if (i + 1 <= res.data.tu.count_sign) {
					item.is_sign = true;
					this.data.money += item.money;
					console.log(this.data.money);
				}
			});
			this.setData({
				signData: this.data.signData,
				money: this.data.money
			});
		});
	},

	setList: function(id) {
		console.log('Task List:', app.globalData.task);
		const taskIdx = app.globalData.task.indexOfFld('id', id);
		this.setData({
			task: app.globalData.task,
			taskIdx: taskIdx
		});
	},

	taskRefresh(sec) {
		this.setData({
			task: app.globalData.task,
			sec: sec
		});
	},

	flag: false,
	onLogin: function(user, requireType) {
		if(!this.flag){
			task.addPage(this);
			task.start();
			this.setList(this.data.id);
			this.flag = true;
		}
		
		
		this.getSignInfo();
		console.log(this.data.signInImage);

		this.setData({
			pageLoginTime: new Date().valueOf()
		});
	},

	signIn() {
		if (this.data.signInfo.is_today_finish || this.isSign) {
			wx.showToast({
				title: '今天已经签到过了哦',
				icon: 'none'
			});
			return;
		}
		this.isSign = true;
		app.post(
			`task/post/subtask`,
			{ id: this.data.id },
			(res) => {
				this.data.signInfo.tu = res.data.tu;
				this.data.signInfo.is_today_finish = res.data.is_today_finish;
				this.data.money = 0;
				this.data.signData.forEach((item, i) => {
					if (i + 1 <= res.data.tu.count_sign) {
						item.is_sign = true;
						this.data.money += item.money;
					}
				});
				// this.data.money += this.data.signData[res.data.tu.count_sign - 1].money
				this.setData({
					signInfo: this.data.signInfo,
					signData: this.data.signData,
					money: this.data.money
				});
				wx.showToast({
					title: '签到成功',
					icon: 'none'
				});
			},
			(fail) => {
				this.isSign = false;
			}
		);
	},

	/**
   * 生命周期函数--监听页面初次渲染完成
   */
	onReady: function() {},

	/**
   * 生命周期函数--监听页面显示
   */
	onShow: function() {},

	/**
   * 生命周期函数--监听页面隐藏
   */
	onHide: function() {},

	/**
   * 生命周期函数--监听页面卸载
   */
	onUnload: function() {},

	/**
   * 页面相关事件处理函数--监听用户下拉动作
   */
	onPullDownRefresh: function() {},

	/**
   * 页面上拉触底事件的处理函数
   */
	onReachBottom: function() {},

	/**
   * 用户点击右上角分享
   */
	onShareAppMessage: function() {
		return {
			title: '我刚刚真的领到了现金红包，你也来试试!',
			path: `/pages/task/sign-in?id=${this.data.id}`
		};
	},

	onShareTimeline() {
		return {
			title: '我刚刚真的领到了现金红包，你也来试试!',
			path: `/pages/task/sign-in?id=${this.data.id}`
		};
	}
});
