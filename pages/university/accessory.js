const app = getApp();
Page({
	data: {
		editSta: false,
		files: []
	},

	onLoad: function(options) {
		!options.id && this.setData({ files: JSON.parse(options.filesList) });
		this.data.files.length > 0 && (this.files_ary = this.data.files);

		this.setData({ noteId: options.id });
		options.id && this.filesList();
		this.fileTool = this.selectComponent('#filetool');
	},

	// 附件列表
	filesList() {
		app.get(`note/edit/files/${this.data.noteId}`, (res) => {
			res.files.map((e) => (e['is_sel'] = 0));
			this.setData({ files: res.files });
		});
	},

	ids: [],

	// 删除附件
	delFiles() {
		if (!this.data.sel_amount) {
			wx.showToast({ title: '请选择删除附件', icon: 'none' });
			return;
		}

		if (this.data.noteId) {
			wx.showLoading({ mask: true });
			app.post(`note/edit/filedel/${this.data.noteId}`, { ids: this.ids.toString() }, (res) => {
				wx.hideLoading();
				res.succ == 1 && this.setData({ sel_amount: 0, editSta: false });
				this.ids = [];
				this.filesList();
			});
			return;
		}

		for (let i = this.data.files.length - 1; i >= 0; i--) {
			this.data.files[i].is_sel && this.data.files.splice(i, 1);
		}

		this.setData({ files: this.data.files, sel_amount: 0, editSta: false });
	},

	fileTool: null,

	examineFile(e) {
		// 选中附件
		if (this.data.editSta) {
			let idx = e.currentTarget.dataset.idx;
			this.setData({ [`files[${idx}].is_sel`]: !this.data.files[idx].is_sel });
			this.setData({ sel_amount: this.data.files.filter((e) => e.is_sel).length });

			if (this.data.files[idx].is_sel && this.ids.indexOf(this.data.files[idx].id)) {
				this.ids.push(this.data.files[idx].id);
			} else {
				this.ids.splice(this.ids.indexOf(this.data.files[idx].id), 1);
			}
			return;
		}
		// 查看附件
		this.data.files.forEach((e) => {
			e.noteId = this.data.noteId;
		});
		var idx = e.currentTarget.dataset.idx;
		this.fileTool.show(this.data.files[idx]);
	},

	// 附件添加
	parentReceive(e) {
		if (this.data.files.length >= 5) {
			wx.showToast({
				title: '只能添加5条附件',
				icon: 'none'
			});
			return;
		}

		this.setData({ path: e.detail.path });
		// 上传附件
		let addAccessory = this.selectComponent('#addAccessory');
		addAccessory.upload(this.data.noteId);
	},

	// 本地附件列表
	files_ary: [],

	update(e) {
		if (!this.data.noteId) {
			this.files_ary.push(e.detail.tempFiles[0]);
			this.files_ary.map((e) => (e['is_sel'] = 0));

			this.setData({ files: this.files_ary });
		}

		this.data.noteId && this.filesList();
	},

	// 保存返回
	save() {
		const pages = getCurrentPages();
		const prevPage = pages[pages.length - 2];
		wx.navigateBack({ delta: 1 });

		!this.data.noteId &&
			prevPage.setData({
				filesList: this.data.files
			});
	},

	edit() {
		this.setData({ editSta: !this.data.editSta });
	},

	// 已上传附件设置标题
	filesettitle(e) {
		
		let title = e.detail.value;
		let file_id = this.data.files[e.currentTarget.dataset.idx].id;

		if (title == '') return;

		if (this.data.noteId) {
			app.post(`note/edit/filesettitle/${this.data.noteId}`, { file_id, title }, (res) => {
				this.setData({ ['files[' + e.currentTarget.dataset.idx + '].file_title']: title });
			});
			return;
		}

		this.files_ary[e.currentTarget.dataset.idx]['title'] = title;

		this.setData({ ['files[' + e.currentTarget.dataset.idx + '].name']: title });
	},

	updateSta() {
		this.setData({ editSta: !this.data.editSta });
	}
});
