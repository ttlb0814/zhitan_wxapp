// pages/forum/index.js

const app = getApp();
var datalist = require('../../utils/datalist');
Page({
	/**
   * 页面的初始数据
   */
	data: {
		isReg: false,
		countDownNum: 20,

		tab: [ '最热', '最新' ],
		tabIdx: 0
	},

	// 列表切换
	parentTab(e) {
		let tabIdx = e.detail.tabIdx;
		if (this.data.tabIdx == tabIdx) return;
		wx.showLoading({mask:true})
		this.setData({ tabIdx });
		datalist.refresh(this, this.getParams());
		wx.hideLoading()
	},

	showPostType() {
		this.setData({ showPostType: !this.data.showPostType });
		if (this.data.showPostType) {
			// 页面显示
			var animation = wx.createAnimation({
				duration: 400,
				timingFunction: 'ease'
			});

			this.animation = animation;

			animation.opacity(1).step();

			this.setData({
				animationData: animation.export()
			});

			let that = this;
			setTimeout(() => {
				that.setData({
					animationData: animation.export()
				});
			}, 10);
		} else {
			var animation = wx.createAnimation({
				duration: 1,
				timingFunction: 'ease'
			});

			this.animation = animation;

			animation.opacity(0).step();

			this.setData({
				animationData: animation.export()
			});

			let that = this;
			setTimeout(() => {
				that.setData({
					animationData: animation.export()
				});
			});
		}
	},

	hidePostType() {
		this.setData({ showPostType: false });
		var animation = wx.createAnimation({
			duration: 1,
			timingFunction: 'ease'
		});

		this.animation = animation;

		animation.opacity(0).step();

		this.setData({
			animationData: animation.export()
		});

		let that = this;
		setTimeout(() => {
			that.setData({
				animationData: animation.export()
			});
		});
	},

	postType(e) {
		const postType = e.currentTarget.dataset.type;
		// if (!this.data.isReg) {
		// 	wx.navigateTo({ url: '/pages/user/reg' });
		// 	return ;
		// }
		wx.navigateTo({ url: `/pages/forum/edit?type=${postType}` });
		wx.hideLoading()
	},

	signIn() {
		wx.navigateTo({
			url: '/pages/sign-in/index'
		});
	},

	/**
   * 生命周期函数--监听页面加载
   */
	onLoad: function(options) {
		console.log(options)
		// wx.showLoading({ mask: true });
		datalist.bind(this, 'forum/index/index', this.getParams());
		wx.hideLoading()
		// let time = 20
		// setTimeout(() => {
		// 	time = time - 1
		// 	console.log(time)
		// }, 1000)
		// this.countDown()
	},

	countDown: function() {
		console.log(this.data.countDown);
		let that = this;
		let countDownNum = that.data.countDownNum; //获取倒计时初始值
		//如果将定时器设置在外面，那么用户就看不到countDownNum的数值动态变化，所以要把定时器存进data里面
		that.data.timer = setInterval(function() {
			//这里把setInterval赋值给变量名为timer的变量
			//在倒计时还未到0时，这中间可以做其他的事情，按项目需求来
			if (countDownNum == 0) {
				//   wx.showToast({
				// 	title: 'aaa',
				//   })
				clearInterval(that.data.timer);
				//这里特别要注意，计时器是始终一直在走的，如果你的时间为0，那么就要关掉定时器！不然相当耗性能
				//因为timer是存在data里面的，所以在关掉时，也要在data里取出后再关闭
				// clearInterval(that.data.timer);
				//关闭定时器之后，可作其他处理codes go here
			} else {
				// console.log(countDownNum)
				//每隔一秒countDownNum就减一，实现同步
				countDownNum--;
				//然后把countDownNum存进data，好让用户知道时间在倒计着
				that.setData({
					countDownNum: countDownNum
				});
			}
		}, 1000);
	},
	// onDataLoad: function(arr){
	//   arr.forEach(item=>{
	//     item.title = "一二三四五六"+item.title
	//   });

	// },
	// 根据元素高度设置回答行数
	onDataShow: function(arr) {
		const that = this;
		let index = this.data.dataList.length - arr.length;

		arr.forEach((item) => {
			let id = '#title_' + item.id;
			const query_title = wx.createSelectorQuery();
			query_title.select(id).boundingClientRect();
			query_title.exec(function(res) {
				if (res[0]) {
					this.contentHeight = res[0].height;
					const contentNum = parseInt(res[0].height / 32);
					const contentShowNum = contentNum > 2 ? contentNum : 2;
					let key = 'dataList[' + index + '].contentShowNum';
					that.setData({
						[key]: contentShowNum
					});
					index++;
				}
			});
		});
	},

	postInfo(e) {
		const id = e.currentTarget.dataset.id;
		// type 1:提问；2:交流
		const type = e.currentTarget.dataset.type;
		wx.navigateTo({
			url: `/pages/forum/info?id=${id}&type=${type}`
		});
	},

	previewImage(e) {
		const current = e.currentTarget.dataset.currentImg
		const urls = e.currentTarget.dataset.urls
		wx.previewImage({current, urls})
	},

	approve(e) {
		if (!app.globalData.userInfo && !app.globalData.userTP) {
			wx.navigateTo({
				url: '/pages/user/reg'
			});
			return;
		}
		const post_id = e.currentTarget.dataset.postid;
		const id = e.currentTarget.dataset.tid;
		const type = e.currentTarget.dataset.type == 1 ? 0 : 1;
		const idx = e.currentTarget.dataset.idx;
		app.post('forum/post/approve', { id: id, post_id: post_id, type: type }, (res) => {
			const key = 'dataList[' + idx + '].approve_sta';
			this.setData({
				[key]: this.data.dataList[idx].approve_sta == 1 ? 0 : 1
			});
		});
	},

	/**
   * 生命周期函数--监听页面初次渲染完成
   */
	onReady: function() {},

	/**
   * 生命周期函数--监听页面显示
   */
	onShow: function() {
		this.setData({
			showPostType: false,
			// isReg: app.globalData.userInfo ? true : false,
			pageLoginTime: new Date().valueOf()
		});
	},

	onLogin: function(user, requireType) {
		this.setData({
			// isReg: user ? true : false,
			pageLoginTime: new Date().valueOf()
		});
	},

	onLoadMore: function(e) {
		datalist.next(this, this.getParams());
		wx.hideLoading()
	},

	refresh() {
		if (datalist.isLoading(this)) return;
		datalist.refresh(this, this.getParams());
		wx.hideLoading()
	},

	getParams() {
		return {isNew: this.data.tabIdx == 1 ? 1 :0}
	},

	/**
   * 页面相关事件处理函数--监听用户下拉动作
   */
	onRefresh: function(e) {
		this.setData({ refresherTriggered: false });
		datalist.refresh(this, this.getParams());
		wx.hideLoading()
	},

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
	onShareAppMessage() {
		return {
			title: '',
			imageUrl: app.globalData.baseUrl + '/img/share-app.jpg'
		};
	},
	onShareTimeline() {
		return {
			title: '',
			imageUrl: app.globalData.baseUrl + '/img/share-app.jpg'
		};
	}
});
