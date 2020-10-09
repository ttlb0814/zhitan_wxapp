// components/datetime/card.js
Component({
  options: {
    addGlobalClass: true
  },
  /**
   * 组件的属性列表
   */
  properties: {
    /**
         * 时间戳（秒）
         */
    value: {
      type: Number,
      value: 0,
      observer: function () {
        this.setDateStr()
      }
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    month: "00",
    date: "00"
  },

  /**
   * 组件的方法列表
   */
  methods: {
    setDateStr: function () {
      var date = new Date(this.properties.value*1000);
      var month = date.getMonth()+1;
      var date = date.getDate();

      if(month<10) month = "0"+month.toString();
      if(date<10) date = "0"+date.toString();
      this.setData({
        "month": month,
        "date": date
      });
      
    }
  }
})
