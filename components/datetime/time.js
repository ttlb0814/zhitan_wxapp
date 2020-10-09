// components/datetime/time.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    sec: {
      type: Number,
      value: 0,
      observer: function(newVal){
        var s = Math.round(newVal%60);
        var m = Math.floor(newVal/60)
        this.setData({s: s, m: m});
      }
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    s: 0,
    m: 0
  }
})
