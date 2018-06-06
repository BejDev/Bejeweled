let Direction = require("./Gem/Direction");
/**
 * 宝石颜色枚举
 */
const GemColor = cc.Enum({
  WHITE: 0,
  BLUE: 1,
  RED: 2,
  GREEN: 3,
  ORANGE: 4,
  YELLOW: 5,
  PURPLE: 6
});
/**
 * 宝石类型枚举
 */
const GemType = cc.Enum({
  NORMAL: 0,
  FLAME: 1, // 火焰
  LIGHT: 2, // 闪电
  SUPER: 3, // 超能
  STARS: 4 // 超新星
});

// 严禁将非全局属性写在Class 外部，详细原因请看 面向对象编程

cc.Class({
  extends: cc.Component,

  properties: {
    color: {
      default: GemColor.WHITE,
      type: GemColor,
      tooltip: "输入颜色类型"
    },
    type: {
      default: GemType.NORMAL,
      type: GemType,
      tooltip: "宝石类型"
    },
    gemSize: {
      default: 60,
      tooltip: "宝石大小"
    }
  },

  start() {
    this._wall = this.node.parent;
    this.game = this._wall.getComponent("Game");
    this.game.GemMoving = false;
    this.isMouseOver = false;
  },

  getColor() {
    return this.color;
  },

  /**
   * 获得颜色
   */
  getColor() {
    return this.color;
  },

  onLoad() {
    // 鼠标按下
    this.node.on(
      "mousedown",
      function(event) {
        const GemManagerScript = this._wall.getComponent("GemManager");
        GemManagerScript.gemSelected(this.node);
      },
      this
    );
  },
  /**
   * 返回宝石在棋盘位置
   * @returns {cc.v2(x,y)}
   */
  getMapPosition() {
    const pos = this.game.getNodePosition(this.node);
    return cc.v2(pos.x, pos.y);
  }
});

module.exports = {
  GemColor: GemColor,
  GemType: GemType
};
