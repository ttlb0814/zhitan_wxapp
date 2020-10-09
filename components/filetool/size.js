Component({

  properties: {
    value: {
      type:Number,
      value: 0,
      observer: function(newVal){
        this.setSize(newVal);
      }
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    txt: '0B'
  },

  /**
   * 组件的方法列表
   */
  methods: {
    setSize: function(v){
      var str = '';
      if(v<1000) str = v+"B";
      else if(v<1000000){
        str = Math.round(v / 102.4) / 10 + "K";
      }else{
        str = Math.round(v / 104857.6) / 10 + "M";
      }

      this.setData({txt: str});
    }
  }
})
