const app = getApp();

var arrPage = [];

/**********外部接口及参数说明**********/

/**
 * 将页面或自定义组件
 * @params Page|Component page 页面或自定义组件，页面或组件需要定义函数 taskRefresh()
 */
module.exports.addPage = function(page) {
	typeof page.taskRefresh == 'function' && page.taskRefresh(sec);
	arrPage.push(page);
};

var sec = 0;
var timer;

var flagStart = false;

module.exports.start = function() {
	if (flagStart) return;
	flagStart = true;

	if (!app.globalData.task) return;

	timer = setInterval(() => {
		sec += 1;

		var c = 0;
		app.globalData.task.forEach((item) => {
			if (item.sign_wait > sec) c++;
		});

		c == 0 && clearInterval(timer);
		arrPage.forEach((e) => {
			if (typeof e.taskRefresh == 'function') {
				e.taskRefresh(sec);
			}
		});
	}, 1000);
};


