const app = getApp();

Page({
	data: {},

	onLoad: function(options) {
		this.setData({ userInfo: app.globalData.userInfo });
		wx.showLoading({ mask: true });
		app.post('university/params', {}, (res) => {
			wx.hideLoading();
			let prov_idx = app.globalData.userInfo.prov_id
				? res.province.indexOfFld('id', app.globalData.userInfo.prov_id)
				: 0;
			let city_idx = app.globalData.userInfo.region_id
				? res.province[prov_idx].cities.indexOfFld('id', app.globalData.userInfo.region_id)
				: 0;

			this.setData({
				province: res.province,
				city_id: app.globalData.userInfo.region_id,
				multiArray: [ res.province, res.province[prov_idx].cities ],
				multiIndex: [ prov_idx, city_idx ]
			});
		});
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

	bindMultiPickerChange: function(e) {
		this.setData({
			prov_id: this.data.multiArray[0][e.detail.value[0]].id,
			city_id: this.data.multiArray[1][e.detail.value[1]].id
		});
	},

	// 修改姓名
	changeName(e) {
		this.setData({ [`userInfo.${e.currentTarget.dataset.val}`]: e.detail.value });
	},

	// 选择性别
	selGender(e) {
		this.setData({ ['userInfo.gender']: e.currentTarget.dataset.val });
	},
	// 修改头像
	changeAvatar: function() {
		const _this = this;
		wx.chooseImage({
			count: 1,
			sizeType: [ 'original', 'compressed' ],
			sourceType: [ 'album', 'camera' ],
			success(res) {
				const tempFilePath = res.tempFilePaths[0];
				_this.setData({
					personImage: tempFilePath
				});
				wx.showLoading({ mask: true });
				app.uploadFile('account/user/headset', res.tempFilePaths[0], {}, (res) => {
					wx.hideLoading();
					if (res.succ == 0) {
						wx.showToast({ title: res.msg, icon: 'none' });
						return;
					}
					_this.setData({ ['userInfo.head_url']: res.head_url });
					app.globalData.userInfo.head_url = res.head_url
					app.prevRefresh()
				});
			}
		});
	},

	bindDateChange: function(e) {
		this.setData({ ['userInfo.birthday']: e.detail.value });
	},

	save() {
		wx.showLoading({ title: '保存中', mask: true });

		if (this.data.userInfo.nick_name == '') {
			wx.showToast({ title: '请填写昵称', icon: 'none' });
			return;
		}

		app.post(
			'account/user/save',
			{
				nick_name: this.data.userInfo.nick_name,
				gender: this.data.userInfo.gender,
				region_id: this.data.city_id,
				birthday: this.data.userInfo.birthday,
				signature: this.data.userInfo.signature
			},
			(res) => {
				wx.hideLoading();
				app.globalData.userInfo = res.data;
				app.prevRefresh();
				wx.navigateBack({ detail: 1 });
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
	onShareAppMessage: function() {}
});
