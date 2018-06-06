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
          if (this.isNear(gems[0], gems[1])) {
            this.swapGem(gems[0], gems[1]);
          }
          gems.shift(); // 删除首元素
        }
      },
      visible: false
    },
    moveSpeed: {
      default: 0.2,
      tooltip: "宝石移动速度"
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
   * 检查是否能交换
   * @param {cc.Node} gemA
   * @param {cc.Node} gemB
   */
  canSwap(gemA, gemB) {},

  /**
   * 检查是否相邻
   * @public
   * @param {cc.Node} gemA 第一个宝石
   * @param {cc.Node} gemB 第二个宝石
   *
   * @returns {boolean}
   */
  isNear(gemA, gemB) {
    let Gemjs_a = gemA.getComponent("Gem");
    let Gemjs_b = gemB.getComponent("Gem");
    const script = this.node.getComponent("Game");
    const pa = script.getNodePosition(gemA);
    const pb = script.getNodePosition(gemB);
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
   * @param {cc.Node} gemA 第一个宝石
   * @param {cc.Node} gemB 第二个宝石
   */
  _swapGemInvalid(gemA, gemB) {
    const moveSpeed = this.moveSpeed;
    const gemAScript = gemA.getComponent("Gem");
    const gemBScript = gemB.getComponent("Gem");
    const gemAPos = gemAScript.getPosition();
    const gemBPos = gemBScript.getPosition();
    const actionToA = cc.moveTo(moveSpeed, gemAPos);
    const actionToB = cc.moveTo(moveSpeed, gemBPos);
    const sleepTime = cc.delayTime(0.1);
    let seqA = cc.sequence(actionToB, sleepTime, actionToA);
    let seqB = cc.sequence(actionToA, sleepTime, actionToB);
    gemA.setLocalZOrder(1);
    gemA.runAction(seqA);
    gemA.setLocalZOrder(0);
    gemB.runAction(seqB);
  },

  /**
   * 交换宝石（可以交换时调用）
   * @private
   * @param {cc.Node} gemA 第一个宝石
   * @param {cc.Node} gemB 第二个宝石
   */
  _swapGemValid(gemA, gemB) {
    const moveSpeed = this.moveSpeed;
    const gemAScript = gemA.getComponent("Gem");
    const gemBScript = gemB.getComponent("Gem");
    const gemAPos = gemAScript.getPosition();
    const gemBPos = gemBScript.getPosition();
    const actionToA = cc.moveTo(moveSpeed, gemAPos);
    const actionToB = cc.moveTo(moveSpeed, gemBPos);
    gemA.setLocalZOrder(1);
    gemA.runAction(actionToB);
    gemB.runAction(actionToA);
    gemA.setLocalZOrder(0);
    // 结束时候保存信息
    const script = this.node.getComponent("Game");
    script.swapGem(gemA, gemB);
  }
});
