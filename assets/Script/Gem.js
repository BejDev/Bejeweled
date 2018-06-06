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
    this.game = this.wall.getComponent("Game");
    this.game.GemMoving = false;
    this.isMouseOver = false;
  },

  get_color() {
    return this.color;
  },

  get_XYinMap() {
    return cc.v2(this.pos_x, this.pos_y);
  },

  /**
   * 获得颜色
   */
  getColor() {
    return this.color;
  },

  onLoad() {
    cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);

    // 鼠标移入区域内时候触发
    this.node.on(
      "mouseenter",
      function(event) {
        this.isMouseOver = true;
      },
      this
    );

    // 鼠标移出区域内时候触发
    this.node.on(
      "mouseleave",
      function(event) {
        this.isMouseOver = false;
      },
      this
    );

    // 鼠标按下
    this.node.on(
      "mousedown",
      function(event) {
        // TEST
        const GemManagerScript = this._wall.getComponent("GemManager");
        GemManagerScript.gemSelected(this);
      },
      this
    );
  },
  /**
   * 返回宝石在棋盘位置
   * @returns {cc.v2(x,y)}
   */
  getMapPosition() {
    return cc.v2(this.pos_x, this.pos_y);
  },
  /**
   * 重置宝石在棋盘位置
   * @param {cc.v2(x,y)} Position
   */
  setMapPosition(Position) {
    this.pos_x = Position.x;
    this.pos_y = Position.y;
  },

  /**
   * 键盘按下事件
   * @param {*} event
   */
  onKeyDown(event) {
    if (this.isMouseOver !== true || this.game.GemMoving === false) {
      return;
    } else {
      cc.log(this.getMapPosition());
    }
    let swapGem1, swapGem2;
    cc.log(this.game.choosing_gem);
    let hasChoosingGem = -1;
    if (this.game.choosing_gem !== null) {
      swapGem1 = this.game.choosing_gem;
      hasChoosingGem = true;
    } else {
      swapGem1 = this.node;
      hasChoosingGem = false;
    }
    let SwapGemPosition = swapGem1.getComponent("Gem").getMapPosition();
    let _x = SwapGemPosition.x;
    let _y = SwapGemPosition.y;
    switch (event.keyCode) {
      case cc.KEY.a:
      case cc.KEY.left:
        swapGem2 = this.game.getGem(_x - 1, _y);
        break;
      case cc.KEY.d:
      case cc.KEY.right:
        swapGem2 = this.game.getGem(_x + 1, _y);
        break;
      case cc.KEY.w:
      case cc.KEY.up:
        swapGem2 = this.game.getGem(_x, _y + 1);
        break;
      case cc.KEY.s:
      case cc.KEY.down:
        swapGem2 = this.game.getGem(_x, _y - 1);
        break;
      default:
        cc.log(event.keyCode);
    }
    // cc.log(swapGem2);
    this.game.SwapGem(swapGem1, swapGem2);
    if (hasChoosingGem == false) {
      this.game.choosing_gem = null;
    }
  }
});

module.exports = {
  GemColor: GemColor,
  GemType: GemType
};
