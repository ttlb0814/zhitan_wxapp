const app = getApp();
Page({
	data: {
		formats: {},
		editorHeight: 300,
		editorFocus: false,
		keyboardHeight: 0,
		isIOS: false,
		picker: {
			subIdx: 0,
			contIdx: 0,
			gradeIdx: 0
		},
		pois: [],
		draftList: [],
		draftId: '',
		noteId: null,
		hideNt: true, // 隐藏经验
		toolbarTop: 0 //ios页面页面上滑
	},

	flagStart: 0,
	onEditorFocus() {
		if (this.flagStart == 0&&this.data.isIOS) {
			this.setData({ editorFocus: false });

			this.flagStart += 1;
			return;
		}
		this.setData({ editorFocus: true });
	},

	onEditorBlur() {
		this.setData({ editorFocus: false });
	},

	begin: '', // 定时器

	getVal(e) {
		if (e.currentTarget.dataset.type == 'title') {
			this.setData({ title: e.detail.value });
			return;
		}
		this.setData({ content: e.detail.html });
	},

	// 草稿列表,经验详情
	getDraft() {
		let id = this.data.noteId || '';
		app.post(`note/edit/info/${id}`, {}, (res) => {
			id && this.setData({ hideNt: res.info.is_hidden == '0' });
			id
				? this.setData({
						noteInfo: res.info,
						point: res.point,
						topicList: res.topics,
						university: res.unis
					})
				: this.setData({ draftList: res.draft });
			id && this.formCommon(this.data.noteInfo);

			// 使用草稿
			this.data.draftIdx && this.formCommon(this.data.draftList[this.data.draftIdx], this.data.draftIdx);
		});
	},

	formCommon(obj, i) {
		this.setData({
			title: obj.title,
			content: obj.content != 'undefined' ? obj.content : '',
			draftId: Number(i) >= 0 ? Number(i) + 1 : 0,
			['picker.subIdx']: obj.subject_id == 0 ? 0 : this.data.subject.indexOfFld('id', obj.subject_id),
			['picker.contIdx']: obj.content_type == 0 ? 0 : this.data.contType.indexOfFld('id', obj.content_type),
			['picker.gradeIdx']: obj.grade_type == 0 ? 0 : this.data.gradeType.indexOfFld('id', obj.grade_type)
		});
		this.onEditorReady();
	},

	// 删除草稿 删除经验
	delDraftNote() {
		let url = this.data.noteId ? 'note/edit/del' : 'note/edit/draftdel';
		let parameter = this.data.noteId ? { id: this.data.noteId } : { idx: this.data.draftId };

		wx.showModal({
			title: '删除确认',
			content: this.data.noteId ? '确定要删除当前经验' : '确定要删除当前草稿',
			success: (res) => {
				if (!res.confirm) return;
				wx.showLoading({ mask: true });
				app.post(url, parameter, (res) => {
					wx.hideLoading();
					if (this.data.noteId) {
						app.prevRefresh();
						wx.navigateBack({ delta: 1 });
						return;
					}
					this.cancel();
					this.getDraft();
				});
			}
		});
	},

	getParams() {
		app.post('params/index', { items: 'subject|noteconttype|notegradetype' }, (res) => {
			res.subject.unshift({ name: '请选择', id: null });
			this.setData({
				subject: res.subject,
				contType: res.noteconttype,
				gradeType: res.notegradetype
			});
			this.getDraft();
		});
	},

	bindPickerChange: function(e) {
		this.setData({ [e.currentTarget.dataset.type]: e.detail.value });
	},

	// 发布或保存
	flag: false,
	issueSave(e) {
		console.log(this.flag);
		// 未认证跳转
		if (app.globalData.userInfo.is_verified == 0) {
			this.saveDrafts();
			wx.navigateTo({ url: '../user/attestation' });
			return;
		}

		let obj = {
			id: this.data.noteId || 0,
			point: this.data.point ? JSON.stringify(this.data.point) : '',
			draft: this.data.draftId || 0
		};

		if (!this.getFormData().title) {
			wx.showToast({ title: '请填写标题', icon: 'none', duration: 1000 });
			return;
		}

		if (!this.getFormData().content) {
			wx.showToast({ title: '请填写内容', icon: 'none', duration: 1000 });
			return;
		}

		if (this.data.subject[this.data.picker.subIdx].id == null) {
			wx.showToast({ title: '请选择所选科目', icon: 'none', duration: 1000 });
			return;
		}

		if (this.flag) return;
		this.flag = true;

		wx.showLoading({ mask: true });
		app.post(
			'note/edit/save',
			Object.assign(this.getFormData(), obj),
			(res) => {
				if (res.not_verified == 1) {
					app.globalData.userInfo.is_verified = 0;
					wx.navigateTo({ url: '/pages/user/attestation' });
					wx.hideLoading();
					return;
				}

				//本地上传附件
				if (this.data.filesList && this.data.filesList[this.fileCount]) {
					this.uploadFile(res.info.id);
					return;
				}

				wx.hideLoading();

				res.succ == 1 &&
					wx.showToast({
						title: this.data.noteId ? '修改成功' : '发布成功',
						icon: 'success',
						duration: 1000
					});

				if (this.data.draftIdx) {
					app.prevRefresh(null, 2);
					wx.switchTab({ url: '/pages/user/index' });
					return;
				}

				setTimeout(() => {
					!this.data.noteId && this.getDraft();
					app.prevRefresh();
					wx.navigateBack({ detail: 1 });
				}, 1000);
			},
			(fail) => {
				wx.hideLoading()
				wx.showModal({ title: fail.msg });
				this.flag = false;
			}
		);
	},

	onPageScroll: function(t) {
		this.setData({ toolbarTop: t.scrollTop });
	},

	// 保存草稿
	saveDrafts(e) {
		let type = e ? e.currentTarget.dataset.type : '';

		if (this.data.draftList.length == 10) {
			type && wx.showToast({ title: '最多只能保存10条草稿', icon: 'none', duration: 1000 });
			return;
		}

		if (!this.getFormData().title) {
			type && wx.showToast({ title: '请填写标题', icon: 'none', duration: 1000 });
			return;
		}

		type && wx.showLoading({ mask: true });
		var obj = this.getFormData();
		app.post('note/edit/draftsave', Object.assign(obj, { idx: this.data.draftId || 0 }), (res) => {
			type && wx.hideLoading();
			if (res.succ == 1) {
				if (this.data.draftId == 0) {
					var arr = this.data.draftList;
					arr.unshift(obj);
					this.setData({
						draftId: 1,
						draftList: arr
					});
				}
				type &&
					wx.showToast({
						title: '成功保存为草稿',
						icon: 'none',
						duration: 2000
					});
			}
		});
	},

	// 保存草稿 和发布通用参数
	getFormData() {
		return {
			title: this.data.title,
			content_type: this.data.contType[this.data.picker.contIdx].id,
			subject_id: this.data.subject[this.data.picker.subIdx].id,
			grade_type: this.data.gradeType[this.data.picker.gradeIdx].id,
			content: this.data.content || '',
			topics: JSON.stringify(this.data.topicList || []),
			uni_ids: this.data.university ? this.data.university.map((e) => e.id).toString() : ''
		};
	},

	preview() {
		wx.setStorageSync('content', this.data.content);
		wx.navigateTo({ url: `/pages/note/preview?title=${this.data.title || ''}` });
	},

	fileCount: 0,

	// 本地情况下上传附件
	uploadFile(infoId) {
		app.uploadFile(
			`note/edit/fileadd/${infoId}`,
			this.data.filesList[this.fileCount].path || this.data.filesList[this.fileCount].tempFilePath,
			{ title: this.data.filesList[this.fileCount].title || this.data.filesList[this.fileCount].name || '' },
			(res) => {
				if (res.succ == 0) {
					wx.showToast({
						title: res.msg,
						icon: 'none',
						duration: 2000
					});
					wx.hideLoading();
					return;
				}
				if (this.fileCount == this.data.filesList.length - 1) {
					// 上传结束

					wx.showToast({
						title: '发布成功',
						icon: 'success',
						duration: 1000
					});

					setTimeout(() => {
						this.getDraft();
						app.prevRefresh();
						wx.navigateBack({ detail: 1 });
					}, 1000);
					return;
				}
				this.fileCount++;
				this.uploadFile(infoId);
			}
		);
	},

	onLogin: function(userInfo, requireType) {
		this.setData({ pageLoginTime: new Date().valueOf() });
	},

	// 隐藏或显示经验
	hideNote() {
		wx.showModal({
			title: this.data.hideNt ? '隐藏确认' : '显示确认',
			content: this.data.hideNt ? '确定要隐藏当前经验' : '确定要显示当前经验',
			success: (res) => {
				if (!res.confirm) return;
				wx.showLoading({ mask: true });
				app.post('note/edit/hide', { id: this.data.noteId, hide: this.data.hideNt ? 1 : 0 }, (res) => {
					wx.hideLoading();
					this.setData({ hideNt: !this.data.hideNt });
				});
			}
		});
	},

	// 选择话题，选择学校
	selTopic(e) {
		let type = e.currentTarget.dataset.type;
		var ary = type == 'topic' ? this.data.topicList : this.data.university;
		wx.navigateTo({ url: `../${type}/select?topicList=${JSON.stringify(ary || [])}` });
	},

	// 查看附件列表
	accessory() {
		wx.navigateTo({
			url: `../university/accessory?id=${this.data.noteId || ''}&&filesList=${JSON.stringify(
				this.data.filesList || []
			)}`
		});
	},

	onLoad(e) {
		this.setData({ noteId: e.id, draftIdx: e.idx });
		this.data.noteId && wx.setNavigationBarTitle({ title: '修改经验' });

		!e.id &&
			(this.begin = setInterval(() => {
				this.saveDrafts();
			}, 30000));
		this.getParams();

		const platform = wx.getSystemInfoSync().platform;
		const isIOS = platform === 'ios';
		this.setData({ isIOS });
		this.updatePosition(0);
		let keyboardHeight = 0;
		wx.onKeyboardHeightChange((res) => {
			if (res.height === keyboardHeight) return;
			const duration = res.height > 0 ? res.duration * 1000 : 0;
			keyboardHeight = res.height;
			setTimeout(() => {
				wx.pageScrollTo({
					scrollTop: 0,
					success: () => {
						this.updatePosition(keyboardHeight);
						this.editorCtx.scrollIntoView();
					}
				});
			}, duration);
		});
	},

	onShow() {
		if (app.globalData.userInfo) return;
		app.get(`account/user/info`, (res) => {
			app.globalData.userInfo = res.user;
		});
	},

	onUnload() {
		clearInterval(this.begin);
	},

	updatePosition(keyboardHeight) {
		const toolbarHeight = 50;
		const { windowHeight, platform } = wx.getSystemInfoSync();
		let editorHeight = keyboardHeight > 0 ? windowHeight - keyboardHeight - toolbarHeight : windowHeight;
		this.setData({ editorHeight, keyboardHeight });
	},
	calNavigationBarAndStatusBar() {
		const systemInfo = wx.getSystemInfoSync();
		const { statusBarHeight, platform } = systemInfo;
		const isIOS = platform === 'ios';
		const navigationBarHeight = isIOS ? 44 : 48;
		return statusBarHeight + navigationBarHeight;
	},

	onEditorReady() {
		const that = this;
		wx
			.createSelectorQuery()
			.select('#editor')
			.context(function(res) {
				that.editorCtx = res.context;
				that.editorCtx.setContents({ html: that.data.content || '' });
			})
			.exec();
	},
	blur() {
		this.editorCtx.blur();
	},
	format(e) {
		let { name, value } = e.target.dataset;
		if (!name) return;
		this.editorCtx.format(name, value);
	},
	onStatusChange(e) {
		const formats = e.detail;
		this.setData({ formats });
	},
	insertDivider() {
		this.editorCtx.insertDivider({
			success: function() {
				console.log('insert divider success');
			}
		});
	},

	removeFormat() {
		this.editorCtx.removeFormat();
	},
	insertDate() {
		const date = new Date();
		const formatDate = `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
		this.editorCtx.insertText({
			text: formatDate
		});
	},

	insertImage() {
		const that = this;
		wx.chooseImage({
			count: 1,
			success: function(res) {
				wx.showLoading({ mask: true });
				app.uploadFile('/account/user/addimg', res.tempFilePaths[0], {}, (result) => {
					wx.hideLoading();
					that.editorCtx.insertImage({
						src: result.url,
						data: {},
						width: '100%'
					});
				});
			}
		});
	}
});
