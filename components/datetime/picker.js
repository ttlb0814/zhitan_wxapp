// components/datetime/picker.js
/***同时选择日期和时间的组件***/
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
      observer: function (newVal) {
        this.setVal(new Date(newVal * 1000));
      }
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    date: '',
    time: ''
  },

  /**
   * 组件的方法列表
   */
  methods: {
    setVal: function (date) {
      this.setData({
        date: date.Format('yyyy-MM-dd'),
        time: date.Format('HH:mm')
      });

      this.notifyChange(null);
    },

    onChange: function(e){
      var fld = e.currentTarget.dataset.fld;
      var val = e.detail.value
      this.setData({
        [fld]: val 
      });

      this.notifyChange(fld);
    },

    notifyChange: function(fld){
      var ts = 0;
     
      if (this.data.date && this.data.time) {
        var date = new Date(this.data.date.replace(/-/g,'/') + " " + this.data.time + ":00");
        ts = Math.round(date.getTime() / 1000)
      }


      var obj = {
        date: this.data.date,
        time: this.data.time,
        fieldChanged: fld,
        timestamp: ts
      };

      if (ts) obj['datetime'] = obj['date'] + " " + obj['time'] + ":00";

      this.triggerEvent('change', obj)
    }
  },

  ready: function(){
    return;
    if(this.properties.value) return;
    this.setVal(new Date());
  }
})
