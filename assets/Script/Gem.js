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
  LIGHT: 1, // 闪电
  FLAME: 4, // 火焰
  SUPER: 5, // 超能
  STARS: 6 // 超新星

});

// 严禁将非全局属性写在Class 外部，详细原因请看 面向对象编程
let GemMoving = false;
let GemFalling = false;

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
    },
    selected: {
      get: function () {
        return this._selected;
      },
      set: function (value) {
        this._selected = value;
        if (value) {
          // 被选中
        } else {
          // 没被选中
        }
      }
    }
  },

  start() {
    this._wall = this.node.parent;
    this.game = this._wall.getComponent("Game");
    this.GemMoving = false;
    this.GemFalling = false;
    // cc.log(this.getMapPosition());
    if(this.getMapPosition().y >= this.game.width) {
      this.node.opacity = 0;
    }
  },

  onLoad() {
    // 鼠标按下
    this.node.on(
      "mousedown",
      function (event) {
        // cc.log(this.getMapPosition());
        const GemManagerScript = this._wall.getComponent("GemManager");
        GemManagerScript.gemSelected(this.node);
      },
      this
    );
  },
  /**
   * 返回在游戏中的绝对位置
   * @returns {cc.Vec2}
   */
  getPosition() {
    return this.node.getPosition();
  },
  /**
   * 返回在地图上的相对位置
   * @returns {{x: number,y: number}}
   */
  getMapPosition() {
    return this._wall.getComponent("Game").getNodePosition(this.node);
  },

  /**
   * 返回宝石的颜色
   * @returns {GemColor}
   */
  getColor() {
    return this.color;
  },

  /**
   * 返回宝石类型
   * @returns {GemType}
   */
  getType() {
    return this.type;
  }
});

module.exports = {
  GemColor: GemColor,
  GemType: GemType
};
