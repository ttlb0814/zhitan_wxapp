/**
 * 绑定到页面的列表数据加载模块
 * 该模块会在数据加载完成后给页面设置数据（{dataList: val, isEnd: val, countAll: val}），请不要在页面中重复设置
 * dataList：Array 数据列表数组
 * isEnd：Boolean 内容加载结束标志
 * countAll：Integer 数据总条数
 * 绑定数据列表的页面中，可以定义一个onDataLoad(arrNew)函数，用于处理每次从服务端加载的数据列表（可以修改arrNew数组中的数据，修改后将在列表中提现）
 * 
 * 绑定数据列表的页面中，可以定义一个onDataShow(arrNew)函数，用于处理每次从服务端加载完数据并绑定到页面之后调用（修改arrNew中的数据无效）
 */



/**********内部函数和参数**********/
const app = getApp();

var _page = null; //当前页面对象
var _url = ''; //数据查询链接
var _params = {}; //数据查询参数

var _pageNum = 0; //分页码
var _isEnd = false; //结束标志

var _isLoading = false;

function loadData(page) {
  if(!page.__datalist__params) page.__datalist__params = {};
  page.__datalist__params['page'] = page.__datalist__pageNum;
  page.__datalist__isLoading = true;
  app.post(page.__datalist__url, page.__datalist__params, res=>{
    page.__datalist__isLoading = false;
    var arr = page.data.dataList;
    if(!arr||res.page==0) arr = [];
    page.__datalist__isEnd = res.isEnd=='1';

    if(res.data == null) {
      return
    }

    if(typeof(page.onDataLoad)=='function') page.onDataLoad(res.data);

    var obj = {
      dataList: arr.concat(res.data),
      isEnd: page.__datalist__isEnd
    };

    if(page.__datalist__pageNum==0){
      obj['countAll'] = res.countAll;
    }
    page.setData(obj);

    if(typeof(page.onDataShow)=='function') page.onDataShow(res.data);
  });
}

function bind(page, url, params) {
  if(!page||!page.__wxExparserNodeId__){
    wx.showToast({
      title: '数据列表参数错误',
      icon:'none'
    })
    return;
  }

  page.__datalist__url = url;
  page.__datalist__params = params;

  page.__datalist__pageNum = 0;
  page.__datalist__isEnd=false;
  page.__datalist__isLoading = false;

  refresh(page, params);
}

function refresh(page, params){
  if(!page||!page.__wxExparserNodeId__){
    wx.showToast({
      title: '数据列表参数错误',
      icon:'none'
    })
    return;
  }

  if(params) page.__datalist__params = params;
  page.__datalist__pageNum = 0;
  page.__datalist__isEnd=false;

  //page.setData({dataList: []});

  loadData(page);
}

function next(page){
  if(!page||!page.__wxExparserNodeId__){
    wx.showToast({
      title: '数据列表参数错误',
      icon:'none'
    })
    return;
  }

  if(page.__datalist__isEnd) return;
  page.__datalist__pageNum++;
  loadData(page);
}


/**********外部接口及参数说明**********/

/**
 * 将功能模块绑定到指定页面，一般在页面的onLoad函数中调用，绑定之后会自动开始加载数据
 * @params Page page 当前页面，调用时可以直接填this
 * @params String url 数据加载链接
 * @params Object params (optional) 查询&排序参数
 */
module.exports.bind = bind

/**
 * 刷新列表，一般在“scroll-view.bindrefresherrefresh”、“Page.onPullDownRefresh”以及“数据查询参数发生改变”等情况下调用，
 * 第一种情况和第二种情况根据页面加载数据方式来选择
 * @params Page page 当前页面，调用时可以直接填this
 * @params Object params (optional) 新的查询参数
 */
module.exports.refresh = refresh

/**
 * 加载下一页，在“scroll-view.bindscrolltolower”或者“Page.onReachBottom”中调用，根据具体页面的加载数据方式决定
 * @params Page page 当前页面，调用时可以直接填this
 */
module.exports.next = next

module.exports.isLoading = function(page){
  if(!page||!page.__wxExparserNodeId__){
    wx.showToast({
      title: '数据列表参数错误',
      icon:'none'
    })
    return;
  }

  return page.__datalist__isLoading;
}