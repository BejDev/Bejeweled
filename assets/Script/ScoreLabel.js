cc.Class({
  extends: cc.Component,
  properties: {
    existTime: {
      default: 0.1,
      tooltip: "存在时间"
    },
    moveDistance: {
      default: 100,
      tooltip: "移动距离"
    }
  },

  start() {
    cc.log(111);
    this.scheduleOnce(function() {
      this.node.destroy();
    }, this.existTime * 1.2);
  },

});
