const app = getApp();
Component({
	// 自定义tab，需在页面json中设置 "navigationStyle": "custom"
	properties: {
		
		// 作者信息
		author: {
			type: Object,
			value: {}
		},
		isReg: {
			type: Boolean,
			value: true
	},
		postId: {
			type: Number,
			value: null
		},
		postType: {
		type: Number,
		value: null
		},
		// 文章id,主贴的id，回答的id为post_id
		/**
  		 * 传文章id会改变样式!!
  		 */
		infoId: {
			type: Number,
			value: null
		},
		loginTime: {
			type: Number,
			value: null,
			observer: function(newVal) {
				this.setData({ pageLoginTime: newVal });
			}
		}
	},

	/**
   * 组件的初始数据
   */
	data: {
		statusBarHeight: app.globalData.statusBarHeight
	},

	/**
   * 组件的方法列表
   */
	methods: {
		// 关注用户
		attention(e) {
			console.log(this.properties.author);
			if (!this.data.isReg) {
				wx.navigateTo({
					url: '/pages/user/reg'
				});
				return;
			}
			let id = e.currentTarget.dataset.id;

			wx.showLoading({ mask: true });
			app.post(`user/fan/${id}`, { oper: this.data.author.isMyFanning != 0 ? 0 : 1 }, (res) => {
				this.setData({ ['author.isMyFanning']: res.info.isMyFanning });
				app.prevRefresh();
				wx.hideLoading();
			});
		},

		goback() {
			var page = getCurrentPages();
			if (page.length < 2) {
				wx.switchTab({ url: '../../pages/forum/index' });
				return;
			}
			wx.navigateBack({ detail: 1 });
	},
	// 匿名操作
	anonymousChange(e) {
		const post_id = e.currentTarget.dataset.postid
		const id = e.currentTarget.dataset.infoid
		let type = e.currentTarget.dataset.isanonymous == 1 ? 0 : 1
		app.post('forum/post/anonymous', {id: id, post_id: post_id, type: type}, res => {
			this.data.author.is_anonymous = e.currentTarget.dataset.isanonymous == 1 ? 0 : 1
			this.setData({author: this.data.author})
		})
	},

	goHomepage(e) {
		const url =e.currentTarget.dataset.url
		console.log(url)
		if(url == '') return
		wx.navigateTo({
			url: url
		})
	},
    
    // 删除
    delete(e) {
      wx.showModal({
        title: '提示',
        content: '确定删除吗？',
        showCancel: true,
        success: (result) => {
          if(result.confirm){
            wx.showLoading()
            const id = e.currentTarget.dataset.infoid
            const post_id = e.currentTarget.dataset.postid
            app.post('forum/post/del', {id: id, post_id: post_id }, res => {
              wx.hideLoading()
              app.prevRefresh()
              setTimeout(() => {
                
                wx.navigateBack()
              }, 500)
            })
            
          }
        },
        fail: ()=>{},
        complete: ()=>{}
      });
    }
	},
	lifetimes: {
		ready() {
			if (app.globalData.userInfo) this.setData({ myselfId: app.globalData.userInfo.id });
		}
  },
});
