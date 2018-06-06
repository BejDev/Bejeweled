let config = require("../utils/config");

cc.Class({
  extends: cc.Component,
  properties: {
    chosenOutline: {
      default: null,
      type: cc.Prefab,
      tooltip: "选中时边框"
    },
    selectedGems: {
      get: function() {
        return this._selectedGems;
      },
      set: function(value) {
        if (this._selectedGems === undefined) {
          this._selectedGems = [];
        }
        let gems = this._selectedGems;

        gems.push(value);
        cc.log(gems);
        if (gems.length === 2) {
          if (this.canSwap(gems[0], gems[1])) {
            this.swapGem(gems[0], gems[1]);
          }
          gems.shift(); // 删除首元素
        }
      },
      visible: false
    }
  },

  /**
   * 更新被选中的gem数组
   * @public
   * @param {cc.Node} gem
   */
  gemSelected(gem) {
    cc.log("gem被选中");
    this.selectedGems = gem;
  },

  /**
   * 交换两个宝石，不相邻无法交换
   * @public
   * @param {cc.Node} Gem1
   * @param {cc.Node} Gem2
   */
  swapGem(Gem1, Gem2) {
    this._swapGemValid(Gem1, Gem2);
  },

  /**
   *
   */
  _checkGemMap(Gem1, Gem2) {
    const script = this.node.getComponent("Game");
  },

  /**
   * 检查是否相邻
   * @public
   * @param {cc.Node} Gem_a 第一个宝石
   * @param {cc.Node} Gem_b 第二个宝石
   *
   * @returns {boolean}
   */
  canSwap(Gem_a, Gem_b) {
    let Gemjs_a = Gem_a.getComponent("Gem");
    let Gemjs_b = Gem_b.getComponent("Gem");
    const script = this.node.getComponent("Game");
    const pa = script.getNodePosition(Gem_a);
    const pb = script.getNodePosition(Gem_b);
    if (pa === null || pb == null) {
      cc.error("找不到位置");
    }
    let x = Math.abs(pa.x - pb.x);
    let y = Math.abs(pa.y - pb.y);
    if (x + y === 1) return true;
    return false;
  },

  /**
   * 无效移动
   * @private
   * @param {[type]} Gem_a [description]
   * @param {[type]} Gem_b [description]
   */
  _swapGemInvalid(Gem_a, Gem_b) {
    this.GemMoving = true;
    let a_Position = Gem_a.getPosition();
    let b_Position = Gem_b.getPosition();

    let action_a = cc.moveTo(this.move_speed, a_Position);
    let action_b = cc.moveTo(this.move_speed, b_Position);

    Gem_a.setLocalZOrder(1);
    Gem_a.runAction(cc.sequence(action_b, cc.delayTime(0.1), action_a));
    Gem_a.setLocalZOrder(0);
    Gem_b.runAction(
      cc.sequence(
        action_a,
        cc.delayTime(0.1),
        action_b,
        cc.delayTime(0.1),
        finished
      )
    );
  },

  /**
   * 交换宝石（可以交换时调用）
   * @private
   * @param {cc.Node} Gem_a 第一个宝石
   * @param {cc.Node} Gem_b 第二个宝石
   */
  _swapGemValid(Gem_a, Gem_b) {
    this.GemMoving = true;
    let a_Position = Gem_a.getPosition();
    let b_Position = Gem_b.getPosition();

    let action_a = cc.moveTo(this.move_speed, b_Position);
    Gem_a.runAction(action_a);
    Gem_a.setLocalZOrder(1);

    let action_b = cc.sequence(
      cc.moveTo(this.move_speed, a_Position),
      finished
    );

    Gem_b.runAction(action_b);
    Gem_a.setLocalZOrder(0);

    let Gemjs_a = Gem_a.getComponent("Gem");
    let Gemjs_b = Gem_b.getComponent("Gem");
    let aMapPositon = Gemjs_a.getMapPosition();
    let bMapPositon = Gemjs_b.getMapPosition();

    const script = this.node.getComponent("Game");
    script.swapGem(Gem_a, Gem_b);
  }
});
