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

        value.getComponent("Gem").selected = true;
        gems.push(value);
        // cc.log(gems);
        if (gems.length === 2) {
          if (this.isNear(gems[0], gems[1])) {
            this.swapGem(gems[0], gems[1]);
          }
          gems[0].getComponent("Gem").selected = false;
          gems.shift();
          gems.shift();
        }
      },
      visible: false
    },
    moveSpeed: {
      default: 0.2,
      tooltip: "宝石移动速度"
    },
    fallSpeed: {
      default: 0.2,
      tooltip: "下落速度/格"
    }
  },

  /**
   * 更新被选中的gem数组
   * @public
   * @param {cc.Node} gem
   */
  gemSelected(gem) {
    // cc.log("gem selected.");
    this.selectedGems = gem;
  },

  /**
   * 交换两个宝石，不相邻无法交换
   * @public
   * @param {cc.Node} Gem1
   * @param {cc.Node} Gem2
   */
  swapGem(Gem1, Gem2) {
    const script = this.node.getComponent("Game");
    script.swapGem(Gem1, Gem2);
    if(this._checkGemMap(Gem1, Gem2)){
      this._swapGemValid(Gem1, Gem2);
      this.scheduleOnce(function() {
        this.clearGem(Gem1);
        this.clearGem(Gem2);
      }, this.moveSpeed * 1.5);
    } else {
      this._swapGemInvalid(Gem1, Gem2);
      script.swapGem(Gem1, Gem2);//换回来
    }
  },

  /**
   * 检查移动是否造成匹配
   *
   * @param      {cc.Node}   Gem1    The gem 1
   * @param      {cc.Node}   Gem2    The gem 2
   * @return     {Number}
   */
  _checkGemMap(Gem1, Gem2) {
    let tag = 0;
    tag = tag | this.matchDetect(Gem1).tag;
    tag = tag | this.matchDetect(Gem2).tag;
    return tag;
  },

  /**
   * 检查是否相邻
   * @public
   * @param {cc.Node} Gem1 第一个宝石
   * @param {cc.Node} Gem2 第二个宝石
   *
   * @returns {boolean}
   */
  isNear(Gem1, Gem2) {
    let Gemjs_a = Gem1.getComponent("Gem");
    let Gemjs_b = Gem2.getComponent("Gem");
    const script = this.node.getComponent("Game");
    const pa = script.getNodePosition(Gem1);
    const pb = script.getNodePosition(Gem2);
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
   * @param {cc.Node} Gem1 第一个宝石
   * @param {cc.Node} Gem2 第二个宝石
   */
  _swapGemInvalid(Gem1, Gem2) {
    const moveSpeed = this.moveSpeed;
    const gemAScript = Gem1.getComponent("Gem");
    const gemBScript = Gem2.getComponent("Gem");
    const gemAPos = gemAScript.getPosition();
    const gemBPos = gemBScript.getPosition();
    const actionToA = cc.moveTo(moveSpeed, gemAPos);
    const actionToB = cc.moveTo(moveSpeed, gemBPos);
    const sleepTime = cc.delayTime(0.1);
    let seqA = cc.sequence(actionToB, sleepTime, actionToA);
    let seqB = cc.sequence(actionToA, sleepTime, actionToB);
    Gem1.setLocalZOrder(1);
    Gem1.runAction(seqA);
    Gem2.runAction(seqB);
    Gem1.setLocalZOrder(0);
  },

  /**
   * 交换宝石（可以交换时调用）
   * @private
   * @param {cc.Node} Gem1 第一个宝石
   * @param {cc.Node} Gem2 第二个宝石
   */
  _swapGemValid(Gem1, Gem2) {
    const moveSpeed = this.moveSpeed;
    const gemAScript = Gem1.getComponent("Gem");
    const gemBScript = Gem2.getComponent("Gem");
    const gemAPos = gemAScript.getPosition();
    const gemBPos = gemBScript.getPosition();
    const actionToA = cc.moveTo(moveSpeed, gemAPos);
    const actionToB = cc.moveTo(moveSpeed, gemBPos);
    Gem1.setLocalZOrder(1);
    Gem1.runAction(actionToB);
    Gem2.runAction(actionToA);
    Gem1.setLocalZOrder(0);
  },
  /**
   * 清除该宝石四周能清除的宝石
   *
   * @param      {cc.Node}  Gem     The gem
   */
  clearGem(Gem) {
    const script = this.node.getComponent("Game");
    const _map = script.colorMap;
    const position = script.getNodePosition(Gem);
    const _x = position.x;
    const _y = position.y;

    const event = this.matchDetect(Gem);
    const tag = event.tag;
    const _up = event.up;
    const _dn = event.down;
    const _lt = event.left;
    const _rt = event.right;
    const maxMatch = event.maxMatch;

    if(tag & 2) {
      for(var y = _up + 1; y < _dn; y++) {
        let delGem = script.getGem(_x, y);
        delGem.destroy();
      }
    }
    if(tag & 1) {
      for(var x = _lt + 1; x < _rt; x++) {
        let delGem = script.getGem(x, _y);
        delGem.destroy();
      }
    }
  },
  /**
   * 匹配探测
   *
   * @param      {cc.Node}  Gem     The gem
   * @return     {Object}  datas for match and clear
   */
  matchDetect(Gem){
    const script = this.node.getComponent("Game");
    const _map = script.colorMap;
    const _x = script.getNodePosition(Gem).x;
    const _y = script.getNodePosition(Gem).y;
    let tag = 0;
    // tag = 0 不可消除
    // tag = 1 横向可消除
    // tag = 2 纵向可消除
    // tag = 3 横竖可消除
    let _up = _y, _dn = _y;
    while(_up >= 0 && _map[_x][_up] == _map[_x][_y]) _up--;
    while(_dn < script.width && _map[_x][_dn] == _map[_x][_y]) _dn++;
    if(_dn - _up >= 4) tag = tag | 2;

    let _lt = _x, _rt = _x;
    while(_lt >= 0 && _map[_lt][_y] == _map[_x][_y]) _lt--;
    while(_rt < script.height && _map[_rt][_y] == _map[_x][_y]) _rt++;
    if(_rt - _lt >= 4) tag = tag | 1;

    const maxMatch = Math.max(_dn - _up, _rt - _lt) - 1;
    // tag 和 maxMatch 帮助生成特殊宝石

    return {
      tag: tag,
      up: _up,//四个方向的最大匹配位置
      down: _dn,
      left: _lt,
      right: _rt,
      maxMatch: maxMatch//单方向最大匹配宝石数
    };
  },

});
