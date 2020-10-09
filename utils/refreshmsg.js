var _page = null;

var resMsg = null;

var flagStart = false;

var isRefresh = false;

var timeout = null;

var _newChatCallback = null;

var approveNum = 0;
var discussNum = 0;
var countNum = 0;

/**
 * 设置tab上的消息提示
 * @param {*} app 
 */
function setTabMsg(app) {
	isRefresh = false;
	timeout = setTimeout(refreshMsg, 10000);
	var count =
		parseInt(resMsg.discuss.count_new) +
		parseInt(resMsg.approve.count_new) +
		parseInt(resMsg.new_fans.count_new) +
		parseInt(app.globalData.userInfo.count_new_chat);

	var page = getCurrentPages();
	page = page[page.length - 1];
	var route = page.__route__;

	if ([ 'pages/index/index', 'pages/note/index', 'pages/university/index', 'pages/user/index' ].indexOf(route) < 0)
		return;

	if (parseInt(resMsg.approve.count_new) > approveNum && approveNum != 0) {
		app.globalData.approveMsgNum = true;
		page.setData({ approveMsgNum: true });
	}

	if (parseInt(resMsg.discuss.count_new) > discussNum && discussNum != 0) {
		app.globalData.discussMsgNum = true;
		page.setData({ discussMsgNum: true });
	}

	!app.globalData.approveMsgNum && (count = countNum - approveNum);
	!app.globalData.discussMsgNum && (count = countNum - discussNum);

	if (count > 0) {
		wx.setTabBarBadge({
			index: 3,
			text: '' + count
		});
		approveNum = parseInt(resMsg.approve.count_new);
		discussNum = parseInt(resMsg.discuss.count_new);
		countNum = approveNum + discussNum + parseInt(app.globalData.userInfo.count_new_chat);

		return;
	}
	wx.removeTabBarBadge({ index: 3 });
}

var isFirst = true; //是否首次刷新
function refreshMsg() {
	var app = getApp();

	var c = isFirst ? 1 : 0;
	isRefresh = true;
	app.post(
		'msg/index',
		{},
		(res) => {
			c++;
			resMsg = res;

			if (c >= 2) setTabMsg(app);

			if (!_page) return;

			_page.setData({
				new_fans: res.new_fans, // 新粉丝信息
				discuss: res.discuss, // 评论信息
				approve: res.approve // 点赞消息
			});
		},
		function() {}
	);

	if (!isFirst) {
		app.get('account/user/info', function(res) {
			if (app.globalData.userInfo.count_new_chat < res.user.count_new_chat && _newChatCallback)
				_newChatCallback();
			app.globalData.userInfo = res.user;
			c++;
			if (c >= 2) setTabMsg(app);
		});
	} else isFirst = false;
}

/**
 * 开始监测（仅在app.js里面setUser时调用）
 */
module.exports.start = function() {
	if (flagStart) return;
	flagStart = true;
	setTimeout(() => {
		refreshMsg();
	}, 2000);
};

/**
 * 绑定到页面，一般在页面中调用
 * @param {Page} page 
 */
module.exports.bind = function(page) {
	_page = page;

	if (!resMsg) return;

	_page.setData({
		new_fans: resMsg.new_fans, // 新粉丝信息
		discuss: resMsg.discuss, // 评论信息
		approve: resMsg.approve // 点赞消息
	});
};

/**
 * 暂停刷新
 */
module.exports.pause = function() {
	if (timeout) clearTimeout(timeout);
};

/**
 * 手动刷新
 */
module.exports.refresh = function() {
	if (isRefresh) return;
	if (timeout) clearTimeout(timeout);
	refreshMsg();
};

/**
 * 有新私信时回调接口
 * @param {function} fnCallback 回调函数
 */
module.exports.onNewChat = function(fnCallback) {
	_newChatCallback = fnCallback;
};
