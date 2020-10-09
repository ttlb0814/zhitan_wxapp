const app = getApp();

Component({
	properties: {
		// 新增还是修改
		identity: {
			type: String,
			value: 'edit'
		}
	},
	data: {
		tempFiles: []
	},

	methods: {
		addAccessory() {
			wx.showActionSheet({
				itemList: [ '本地相册中的图片和视频', '聊天记录中的文件' ],
				success: (e) => {
					if (e.tapIndex == 0) {
						wx.chooseMedia({
							count: 1,
							success: (e) => {
								this.setData({ tempFiles: e.tempFiles, path: e.tempFiles[0].tempFilePath });
								this.triggerEvent('parentReceive', { path: e.tempFiles[0].tempFilePath });
							}
						});
					} else {
						wx.chooseMessageFile({
							count: 1,
							type: 'file',
							extension: [
								'doc',
								'docx',
								'ppt',
								'pptx',
								'xls',
								'xlsx',
								'txt',
								'pdf',
								'zip',
								'rar',
								'mp3',
								'wav',
								'flac'
							],
							success: (e) => {
								this.setData({ tempFiles: e.tempFiles, path: e.tempFiles[0].path });
								this.triggerEvent('parentReceive', { path: e.tempFiles[0].path });
							}
						});
					}
				}
			});
		},

		cancel() {
			this.setData({ tempFiles: [] });
			this.triggerEvent('parentReceive', { path: null });
		},
		upload(noteId) {
			if (this.data.identity == 'edit') {
				wx.showLoading({ mask: true });
				app.uploadFile(
					`note/edit/fileadd/${noteId}`,
					this.data.path,
					{ title: this.data.tempFiles[0].name || '' },
					(res) => {
						wx.hideLoading();
						if (res.succ == 0) {
							wx.showToast({
								title: res.msg,
								icon: 'none',
								duration: 2000
							});
							return;
						}
						this.triggerEvent('update', {});

						// this.setData({ tempFiles: [] });
					}
				);
				return;
			}
			this.triggerEvent('update', { tempFiles: this.data.tempFiles });
		}
	}
});
