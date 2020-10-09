// components/filetool/index.js
/**
 * 查看文件组件。使用方式：
 * 1.在布局页面中添加组件 <filetool id='filetool' />（id可根据实际情况自行更改），最好添加在页面顶部或底部，至少需要保证不在有定位属性的元素中；
 * 2.在脚本页面中定义fileTool属性，并在onLoad函数中添加 this.fileTool = this.selectComponent("#filetool");
 * 3.点击文件时，调用 this.fileTool.show(fileObj); 其中，fileObj至少需要包含url/file_url、file_ext两项属性
 */
const app = getApp();
Component({
	options: {
		addGlobalClass: true
	},
	/**
   * 组件的属性列表
   */
	properties: {

		// 是否添加删除
		identity: {
			type: Boolean,
			value: true
		}
	},

	/**
   * 组件的初始数据
   */
	data: {
		fileObj: null,

		fileType: 0,

		arrActionName: [],

		showDownload: false,

		urlShow: 'http://ww....randstr.png',

		/**文件类型对应的后缀，其他文件类型为0**/
		arrPic: [ 'jpg', 'png', 'gif' ], //图片为1
		arrVideo: [ 'mp4' ], //视频为2
		arrOffice: [ 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'pdf' ] //office文档为3
	},

	/**
   * 组件的方法列表
   */
	methods: {
		show: function(fileObj) {
			if (fileObj['file_url']) fileObj['url'] = fileObj['file_url'];
			var arrProp = [ 'file_ext', 'url' ];
			for (var i = 0; i < arrProp.length; i++) {
				if (!fileObj[arrProp[i]]) {
					console.log('文件对象中缺少参数“' + arrProp[i] + '”。');
					return;
				}
			}

			var url = fileObj.url;

			var len = url.length;
			url = url.substr(0, 14) + '...' + url.substr(len - 14);

			this.setData({
				urlShow: url,
				fileObj: fileObj
			});

			var type = 0;
			if (this.data.arrPic.indexOf(fileObj.file_ext) >= 0) type = 1;
			else if (this.data.arrVideo.indexOf(fileObj.file_ext) >= 0) type = 2;
			else if (this.data.arrOffice.indexOf(fileObj.file_ext) >= 0) type = 3;

			this.data.fileType = type;

			var arrActionName = [];
			if (type == 1) {
				arrActionName.push('查看图片');
				arrActionName.push('保存到相册');
			} else if (type == 2) {
				arrActionName.push('保存到相册');
			} else if (type == 3) {
				arrActionName.push('查看文档');
			}

			arrActionName.push('下载');
			
			this.properties.identity && arrActionName.push('删除');
			this.data.arrActionName = arrActionName;

			let that = this;
			wx.showActionSheet({
				itemList: arrActionName,
				success: function(res) {
					that._onActionSheetItemTap(res.tapIndex);
				}
			});
		},

		_onActionSheetItemTap: function(idx) {
			switch (this.data.fileType) {
				case 1: //图片
					if (idx == 0) this._previewImg();
					else if (idx == 1) this._saveToPhotosAlbum();
					else if (idx == 3) this._delAccessory();
					else this._download();
					break;

				case 2: //视频
					if (idx == 0) this._saveToPhotosAlbum();
					else if (idx == 2) this._delAccessory();
					else this._download();
					break;

				case 3: //可打开的文档
					if (idx == 0) this._openDocument();
					else if (idx == 2) this._delAccessory();
					else this._download();
					break;

				default:
					this._download();
			}
		},

		_previewImg: function() {
			wx.hideLoading();
			app.downloadFile(this.data.fileObj.url, null, function(res) {
				wx.hideLoading();
				wx.previewImage({
					urls: [ res.tempFilePath ]
				});
			});
		},

		_saveToPhotosAlbum: function() {
			wx.showLoading({
				title: '正在下载...',
				mask: true
			});
			let that = this;
			app.downloadFile(this.data.fileObj.url, null, function(res) {
				console.log(res);

				wx.hideLoading();
				if (that.data.fileType == 1) {
					wx.saveImageToPhotosAlbum({
						filePath: res.tempFilePath,
						success: function() {
							wx.showToast({
								title: '保存成功'
							});
						}
					});
				} else {
					wx.saveVideoToPhotosAlbum({
						filePath: res.tempFilePath,
						success: function() {
							wx.showToast({
								title: '保存成功'
							});
						},
						fail(e) {
							console.log(e);
						}
					});
				}
			});
		},

		_openDocument: function() {
			wx.showLoading({
				title: '正在下载...',
				mask: true
			});
			app.downloadFile(this.data.fileObj.url, null, (res) => {
				wx.hideLoading();

				wx.openDocument({
					fileType: this.data.fileObj.file_ext,
					filePath: res.tempFilePath
				});
			});
		},

		_download: function() {
			this.setData({
				showDownload: true
			});
		},

		_hideDownload: function(e) {
			this.setData({
				showDownload: false
			});

			if (e.currentTarget.dataset.copy != 1) return;

			wx.setClipboardData({
				data: this.data.fileObj.url,
				success: function() {
					wx.showToast({
						title: '复制成功'
					});
				}
			});
		},

		_helpTap: function() {
			var url = `${app.globalData.baseUrlWWW}about/filedl`;
			wx.navigateTo({
				url: '/pages/webview/index?url=' + encodeURIComponent(url)
			});
		},

		_delAccessory() {
			wx.showModal({
				title: '删除确认',
				content: '确定要删除当前附件吗',
				success: (res) => {
					if (!res.confirm) return;
					wx.showLoading({ mask: true });
					app.post(
						`note/edit/filedel/${this.data.fileObj.noteId}`,
						{ code: this.data.fileObj.file_name },
						(res) => {
							wx.hideLoading();
							this.triggerEvent('parentReceive', { upload: true }, {});
						}
					);
				}
			});
		}
	}
});
