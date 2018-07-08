let config = require("../utils/config");
let prefab = null;

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
        if (prefab === null){
          prefab = cc.instantiate(this.chosenOutline);
          prefab.parent = this.node;
        }
        if (this._selectedGems === undefined) {
          this._selectedGems = [];
        }
        let gems = this._selectedGems;

        value.getComponent("Gem").selected = true;
        gems.push(value);

        if (gems.length === 2) {
          if (this.isNear(gems[0], gems[1])) {
            this.swapGem(gems[0], gems[1]);
          }
          gems[0].getComponent("Gem").selected = false;
          gems.shift();
          gems.shift();
          prefab.opacity = 0;
        }else{
          let pos = gems[0].getComponent("Gem").getPosition();
          prefab.opacity = 255;
          prefab.setPosition(pos.x,pos.y);
        }
      },
      visible: false
    },
    debug: {
      type: cc.Prefab,
      default: null,
      tooltip: "picture for debug"
    },
    moveTime: {
      default: 0.2,
      tooltip: "宝石移动时间"
    },
    fallTime: {
      default: 0.3,
      tooltip: "下落时间"
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
    let Gemjs_a = Gem1.getComponent("Gem");
    let Gemjs_b = Gem2.getComponent("Gem");
    Gemjs_a.GemMoving = true;
    Gemjs_b.GemMoving = true;
    const script = this.node.getComponent("Game");
    let aisSuper = Gemjs_a.type == 5;//SUPER Gem
    let bisSuper = Gemjs_b.type == 5;
    if(aisSuper && bisSuper) {
      let delta = this.clearColor(-1);
      script.addScore(Gem1.getPosition(), delta);
    } else if(aisSuper && !bisSuper) {
      let delta = this.clearColor(Gemjs_b.color);
      script.addScore(Gem2.getPosition(), delta);
      this.delGem(Gem1);
    } else if(!aisSuper && bisSuper) {
      let delta = this.clearColor(Gemjs_a.color)
      script.addScore(Gem1.getPosition(), delta);
      this.delGem(Gem2);
    } else {
      script.swapGem(Gem1, Gem2);
      if(this._checkGemMap(Gem1, Gem2)){
        script.addChain();
        this._swapGemValid(Gem1, Gem2);
        this.scheduleOnce(function() {
          this.clearGem(Gem1);
          if(Gem2.isValid || Gemjs_b.GemDeleting) this.clearGem(Gem2);
          this.GemFall();
          // cc.log(script.colorMap);
          // cc.log(script.map);
        }, this.moveTime * 2);
      } else {
        this._swapGemInvalid(Gem1, Gem2);
        script.swapGem(Gem1, Gem2);//换回来
      }
    }
    this.scheduleOnce(function() {
        Gemjs_a.GemMoving = false;
        Gemjs_b.GemMoving = false;
      }, this.moveTime * 2);
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
    if(Gemjs_a.GemFalling || Gemjs_a.GemMoving) return false;
    if(Gemjs_b.GemFalling || Gemjs_b.GemMoving) return false;

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
    const moveTime = this.moveTime;
    const gemAScript = Gem1.getComponent("Gem");
    const gemBScript = Gem2.getComponent("Gem");
    const gemAPos = gemAScript.getPosition();
    const gemBPos = gemBScript.getPosition();
    const actionToA = cc.moveTo(moveTime, gemAPos);
    const actionToB = cc.moveTo(moveTime, gemBPos);
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
    const moveTime = this.moveTime;
    const gemAScript = Gem1.getComponent("Gem");
    const gemBScript = Gem2.getComponent("Gem");
    const gemAPos = gemAScript.getPosition();
    const gemBPos = gemBScript.getPosition();
    const actionToA = cc.moveTo(moveTime, gemAPos);
    const actionToB = cc.moveTo(moveTime, gemBPos);
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
    if (Gem == undefined || Gem == null || Gem.isValid == false) return;
    const gemScript = Gem.getComponent("Gem");
    if(gemScript.GemDeleting) return;
    const script = this.node.getComponent("Game");
    const _map = script.colorMap;
    const position = script.getNodePosition(Gem);
    const _x = position.x;
    const _y = position.y;
    if(_y >= script.height) return;
    const event = this.matchDetect(Gem);
    if (event == null) {
      let bug = cc.instantiate(this.debug);
      bug.parent = this.node;
      bug.setPosition(Gem.getPosition());
      return;
    }
    const tag = event.tag;
    const _up = event.up;
    const _dn = event.down;
    const _lt = event.left;
    const _rt = event.right;
    const maxMatch = event.maxMatch;

    if (tag & 2) {
      for(var y = _dn + 1; y < _up; y++) {
        this.delGem(script.getGem(_x, y));
      }
    }
    if (tag & 1) {
      for(var x = _lt + 1; x < _rt; x++) {
        this.delGem(script.getGem(x, _y));
      }
    }
    if(maxMatch >= 3 && _y < script.height) script.addScore(Gem.getPosition(), maxMatch);
    if (_y < script.height) script.makeSPGem(event);
  },
  /**
   * 匹配探测
   *
   * @param      {cc.Node}  Gem     The gem
   * @return     {Object}  datas for match and clear
   */
  matchDetect(Gem) {
    if (Gem == undefined || Gem == null) return null;
    const script = this.node.getComponent("Game");
    const gemScript = Gem.getComponent("Gem");
    if(gemScript.GemDeleting == true) return null;
    const _map = script.colorMap;
    const position = script.getNodePosition(Gem);
    const _x = position.x;
    const _y = position.y;
    if (_x == -1 || _y == -1) {
      cc.error(position);
      return null;
    }
    let tag = 0;
    // tag = 0 不可消除
    // tag = 1 横向可消除
    // tag = 2 纵向可消除
    // tag = 3 横竖可消除
    let _up = _y, _dn = _y;
    while (_dn >= 0 && _map[_x][_dn] == _map[_x][_y]) _dn--;
    while (_up < _map[_x].length / 2 && _map[_x][_up] == _map[_x][_y]) _up++;
    if (_up - _dn >= 4) tag = tag | 2;

    let _lt = _x, _rt = _x;
    while (_lt >= 0 && _map[_lt][_y] == _map[_x][_y]) _lt--;
    while (_rt < _map.length && _map[_rt][_y] == _map[_x][_y]) _rt++;
    if (_rt - _lt >= 4) tag = tag | 1;

    if(_map[_x][_y] == -1) tag = 0;
    const maxMatch = Math.max(_up - _dn, _rt - _lt) - 1;
    // tag 和 maxMatch 帮助生成特殊宝石
    let colors = gemScript.getColor();
    return {
      x: _x,
      y: _y,
      tag: tag,
      up: _up,//四个方向的最大匹配位置
      down: _dn,
      left: _lt,
      right: _rt,
      color: colors,
      maxMatch: maxMatch//单方向最大匹配宝石数
    };
  },
  /**
   * 下落可能检测
   *
   * @return     {Array}  每个宝石需要下落的格子数
   */
  GemFallDetect() {
    const script = this.node.getComponent("Game");
    const colorMap = script.colorMap;
    let fallmap = [];
    for (var x = 0; x < colorMap.length; x++) {
      fallmap[x] = [];
      for (var y = 0; y < colorMap[x].length; y++) {
          fallmap[x][y] = (y == 0 ? 0 : fallmap[x][y - 1]);
        if (colorMap[x][y] == -1) {
            fallmap[x][y]++;
        }
      }
    }
    return fallmap;
  },
  GemFall() {
    const fallmap = this.GemFallDetect();
    const script = this.node.getComponent("Game");
    const colorMap = script.colorMap;
    for (var x = 0; x < fallmap.length; x++) {
      for (var y = 0; y < fallmap[x].length; y++) {
        if (fallmap[x][y] != 0 && colorMap[x][y] != -1) {
          const gem = script.getGem(x, y);
          if(gem == null || gem == undefined) {
            cc.error("null!!");
            continue;
          }
          // cc.log(gem);
          const gemScript = gem.getComponent("Gem");
          gemScript.GemFalling = true;
          if(y - fallmap[x][y] < script.width) {
            gem.opacity = 255;
          } else {
            gem.opacity = 0;
          }
          const actionA = cc.moveBy(this.fallTime, 0, -1 * script.gem_spacing * fallmap[x][y]);
          gem.runAction(actionA);
          script.colorMap[x][y - fallmap[x][y]] = colorMap[x][y];
          script.colorMap[x][y] = -1;
          script.map[x][y - fallmap[x][y]] = gem;
          this.scheduleOnce(function() {
            gemScript.GemFalling = false;
            script.makeGem(2);
            if(!gemScript.GemDeleting) {
              this.clearGem(gem);
              this.scheduleOnce(function() {
                this.GemFall();
              }, this.moveTime * 1.5 );
            }
          }, this.fallTime * 1.5 );
        }
      }
    }
  },
  /**
   * 清除宝石
   *
   * @param      {cc.Node}  Gem     The gem
   */
  delGem(Gem) {
    if (Gem == undefined || Gem == null || Gem.parent == null) {
      return;
    }
    const gemScript = Gem.getComponent("Gem");
    const script = this.node.getComponent("Game");
    // cc.log(gemScript.GemDeleting);
    if(gemScript.GemDeleting == true){
      this.scheduleOnce(function() {
        if(Gem.isValid == true) Gem.destroy();
      }, 1);
      return;
    }
    gemScript.GemDeleting = true;
    // cc.log(gemScript);
    const position = gemScript.getMapPosition();
    if (gemScript.type == 1) {//LIGHT
      for(var _x = 0; _x < script.colorMap.length; _x++) {
        if(_x != position.y) this.delGem(script.getGem(position.x, _x));
        if(_x != position.y) this.delGem(script.getGem(_x, position.y));
      }
      script.addScore(Gem.getPosition(), script.width + script.height - 1);
    } else if (gemScript.type == 4) {//FLAME
      for(var _x = -1; _x <= 1; _x++) {
        for(var _y = -1; _y <= 1; _y++) {
          if(_x != 0 && _y != 0) this.delGem(script.getGem(position.x + _x, position.y + _y));
        }
      }
      script.addScore(Gem.getPosition(), 9);
    } else if (gemScript.type == 5) {//SUPER
      const random_of_max_num = script.gems.length;
      script.addScore(Gem.getPosition(), this.clearColor(script.randomNumber(0, random_of_max_num - 2)));
    } else if (gemScript.type == 6) {//STARS
      for(var _x = 0; _x < script.colorMap.length; _x++) {
        for(_y = -1; _y <= 1; _y++){
          if(position.x + _y >= 0 && position.x + _y < script.width && _x != position.y)
            this.delGem(script.getGem(position.x + _y, _x));
          if(position.y + _y >= 0 && position.y + _y < script.height && _x != position.x)
            this.delGem(script.getGem(_x, position.y + _y));
        }
      }
      script.addScore(Gem.getPosition(), (this.width + this.height) * 3 - 9);
    }
    script.colorMap[position.x][position.y] = -1;
    Gem.destroy();
  },
  /**
   * 清除当前全部 color 颜色
   * @param  {number} color
   * @return {number} 清除个数
   */
  clearColor(color) {
    const script = this.node.getComponent("Game");
    let gemMap = script.map;
    let counter = 0;
    for(var i = 0; i < script.width; i++) {
      for(var j = 0; j < script.height; j++) {
        let gem = gemMap[i][j].getComponent("Gem");
        let gemColor = gem.getColor();
        if(gemColor == color || color === -1) {
          this.delGem(gemMap[i][j]);
          counter++;
        }
      }
    }
    this.GemFall();
    cc.log(script.colorMap);
    cc.log(script.map);
    return counter;
  }
});
