let config = require("./utils/config");
let Gem = require("Gem");
let GemColor = Gem["GemColor"];
let GemType = Gem["GemType"];

cc.Class({
  extends: cc.Component,
  properties: {
    map: {
      default: [],
      visible: false
    },
    colorMap: {
      default: [],
      visible: false
    },
    width: config.map_width,
    height: config.map_height,
    wall: {
      default: null,
      type: cc.Node,
      tooltip: "宝石所处的墙"
    },
    gems: {
      default: [],
      type: [cc.Prefab],
      tooltip: "宝石数组"
    },
    superGem: {
      default: null,
      type: cc.Prefab,
      tooltip: "超能宝石"
    },
    gem_spacing: {
      default: 74,
      tooltip: "宝石间距"
    },
    scoreOnBoard: {
      type: cc.Label,
      default: null,
      tooltip: "当前得分"
    },
    scoreOnGem: {
      type: cc.Prefab,
      default: null,
      tooltip: "匹配得分"
    },
    basisPoints: {
      default: 5,
      tooltip: "消除每个宝石得分"
    },
    chainTime: {
      default: 3,
      tooltip: "连击有效时间"
    },
    checkTime: {
      default: 0.1,
      tooltip: "检查时间"
    },
    nowChainLabel: {
      default: null,
      type: cc.Label,
      tooltip: "当前连击展示框"
    },
    maxChainLabel: {
      default: null,
      type: cc.Label,
      tooltip: "最大连击展示框"
    },
    chainTimeLeftLebel: {
      default: null,
      type: cc.Label,
      tooltip: "连击剩余时间展示框"
    }
  },

  onLoad() {
    this.nowChain = 0;
    this.maxChain = 0;
    this.scoreNumber = 0;
    for (var x = 0; x < this.height; x++) {
      this.map[x] = [];
      this.colorMap[x] = [];
      for (var y = 0; y < this.width * 2; y++) {
        this.colorMap[x][y] = -1;
      }
    }
    this.makeGem(1);
    // cc.log(this.colorMap);
  },
  start() {
    this.schedule(function() {
      if(this.nowChain == 0) {
        this.chainTimeLeft = 0;
      }
      this.chainTimeLeft -= this.checkTime;
      this.chainTimeLeft = this.chainTimeLeft.toFixed(1);
      if(this.chainTimeLeft <= 0) {
        this.nowChain = 0;
        this.chainTimeLeft = 0;
      }
      this.nowChainLabel.string = "NowChain: " + this.nowChain.toString();
      this.maxChainLabel.string = "MaxChain: " + this.maxChain.toString();
      this.chainTimeLeftLebel.string = "ChainTimeLeft: " + this.chainTimeLeft.toString();
    }, this.checkTime);
  },
  /**
   * 返回[min_num, max_num] 中的任意整数
   *
   * @param {number} min_num 最小值
   * @param {number} max_num 最大值
   *
   * @returns {number}
   */
  randomNumber(min_num, max_num) {
    if (min_num === null || max_num === null) {
      cc.error("null param");
      return 0;
    }
    return parseInt(Math.random() * (max_num - min_num + 1) + min_num, 10);
  },

  /**
   * 创建新节点
   *
   * @author himself65
   *
   * @param {cc.Prefab} prefab 预制资源
   */
  createGem(prefab) {
    let gem = cc.instantiate(prefab);
    return gem;
  },

  /**
   * 将 Gem 放到 Map 的指定位置
   *
   * @author himself65
   *
   * @private
   * @param {number} _x 横轴位置
   * @param {number} _y 纵轴位置
   * @param {cc.Prefab} gem 宝石的实例
   */
  setGem(_x, _y, gem) {
    if (gem === undefined) {
      cc.error("gem is null");
      return;
    }
    gem.parent = this.wall; // 绑定到墙上
    let sprite = gem.getComponent("Gem");
    /**
     * 此处还需要修改
     * 改成适应各种宽度的棋盘
     * @todo
     */
    const spacing = this.gem_spacing; // 间距
    gem.setPosition(_x * spacing - 256, _y * spacing - 253);
    this.map[_x][_y] = gem;
    this.colorMap[_x][_y] = sprite.color;
  },

  /**
   * 检查color是否和map上的宝石冲突
   *
   * @author himself65
   *
   * @param {number} _x 横轴位置
   * @param {number} _y 纵轴位置
   * @param {number} color 目标颜色，默认无值
   * @param {function} callback callback function
   *
   * @returns {boolean}
   */
  checkColor(_x, _y, color, callback) {
    //input invalid
    if (_x < 0 || _y < 0 || _x >= this.width || _y >= this.height * 2) {
      cc.error("input invalid");
      return false;
    }

    if (color === undefined) {
      color = this.colorMap[_x][_y];
    }
    const is_same = (a, b, c) => {
      return a === b && a === c;
    };

    let tag = false;
    const c_mp = this.colorMap;
    const px = _x;
    const py = _y;
    let a, b;
    // 在边角上的宝石会忽略某些方向
    // 防止出现内存越界
    if (px - 2 >= 0) {
      a = c_mp[px - 1][py];
      b = c_mp[px - 2][py];
      if (is_same(a, b, color)) tag = true;
    }
    if (px + 2 < this.width) {
      a = c_mp[px + 1][py];
      b = c_mp[px + 2][py];
      if (is_same(a, b, color)) tag = true;
    }
    if (py - 2 >= 0) {
      a = c_mp[px][py - 1];
      b = c_mp[px][py - 2];
      if (is_same(a, b, color)) tag = true;
    }
    if (px + 2 < this.height) {
      a = c_mp[px][py + 1];
      b = c_mp[px][py + 2];
      if (is_same(a, b, color)) tag = true;
    }
    if (callback !== undefined) {
      callback(tag);
    }
    return tag;
  },

  /**
   * 获取棋盘的对应坐标的宝石
   * @param {integer} _x 横坐标
   * @param {integer} _y
   * @returns {cc.Node}
   */
  getGem(_x, _y) {
    if(_x < 0 || _y < 0 || _x >= this.map.length || _y >= this.map[_x].length) {
      return undefined;
    }
    else return this.map[_x][_y];
  },

  /**
   * @example getComponent("Game").getNodePosition(this.node);
   * @param {cc.Node} node
   * @returns {x: number,y: number}
   */
  getNodePosition(node) {
    //
    const map = this.map;
    // cc.log(this.map);
    let i, j;
    for (i = 0; i < map.length; i++) {
      j = map[i].indexOf(node);
      if (j > -1) break;
    }
    return { x: i, y: j };
  },

  /**
   * 更新map存储
   * @public
   * @param {cc.Node} gemA
   * @param {cc.Node} gemB
   */
  swapGem(gemA, gemB) {
    let posA = gemA.getComponent("Gem").getMapPosition();
    let posB = gemB.getComponent("Gem").getMapPosition();
    // 三元素交换，我记得 JavaScript 有更简单的办法
    // - by Himself65
    // @icy: 如果有我早写了
    let tmp = this.map[posA.x][posA.y];
    this.map[posA.x][posA.y] = this.map[posB.x][posB.y];
    this.map[posB.x][posB.y] = tmp;
    // cc.log(this.colorMap[posA.x][posA.y], this.colorMap[posB.x][posB.y]);
    tmp = this.colorMap[posA.x][posA.y];
    this.colorMap[posA.x][posA.y] = this.colorMap[posB.x][posB.y];
    this.colorMap[posB.x][posB.y] = tmp;
    // cc.log(this.colorMap[posA.x][posA.y], this.colorMap[posB.x][posB.y]);
  },
  /**
   * Makes gems.
   * @param      {Number}  1是全局生成 2是隐藏部分生成
   */
  makeGem(option) {
    const random_of_max_num = this.gems.length;
    const y0 = (option == 1 ? 0 : this.height);
    for (var x = 0; x < this.width; x++) {
      for (var y = y0; y < this.height * 2; y++) {
        if(this.colorMap[x][y] == -1) {
          this.colorMap[x][y] = this.randomNumber(0, random_of_max_num - 2);
          let color = this.colorMap[x][y];
          while (this.checkColor(x, y, color)) {
            color = this.randomNumber(0, random_of_max_num - 2);
          }
          this.colorMap[x][y] = color;
          const prefab = this.gems[color];
          let gem = this.createGem(prefab);
          this.setGem(x, y, gem);
          if(y >= this.height) gem.opicity = 0;
        }
      }
    }
  },
  /**
   * 制造特殊宝石
   * @param  {object} event GemManager.matchDetect 的返回 event
   */
  makeSPGem(event) {
    if(event.tag != 3 && event.maxMatch <= 3) {
      return;
    }
    this.colorMap[event.x][event.y] = event.color;
    const prefab = this.gems[event.color];
    let gem = this.createGem(prefab);
    const gemScript = gem.getComponent("Gem");
    gemScript.color = event.color;
    if(event.tag == 3) {
      gemScript.type = GemType.LIGHT;
      gem.getChildByName("Lights").active = true;
      cc.log("LIGHT");
    } else if(event.maxMatch == 4) {
      gemScript.type = GemType.FLAME;
      gem.getChildByName("Flames").active = true;
      cc.log("FLAME");
    } else if(event.maxMatch == 5) {
      gemScript.type = GemType.SUPER;
      gem.destroy();
      gem = this.createGem(this.superGem);
      cc.log("SUPER");
    } else if(event.maxMatch >= 6) {
      gemScript.type = GemType.STARS;
      gem.getChildByName("Stars").active = true;
      cc.log("STARS");
    } else {
      cc.error("invalid SP gem");
      cc.log(event);
    }
    this.setGem(event.x, event.y, gem);
  },
  /**
   * 分数更新
   * @param  {cc.v2()} position  动态加分提示放置位置
   * @param  {number} deltaGems 消除宝石个数
   */
  addScore(position, deltaGems) {
    // let label = cc.instantiate(this.scoreonGem);
    // label.parent = this.node;
    // label.setPosition(position);
    let delta = deltaGems * this.basisPoints;
    this.scoreNumber += delta * (this.nowChain + 1);
    // cc.log(label.getComponent(cc.Label));
    this.scoreOnBoard.string = "Score: " + this.scoreNumber.toString();
    // label.getComponent(cc.Label).string = "+" + delta.toString();
  },
  addChain() {
    this.nowChain++;
    this.maxChain = Math.max(this.nowChain, this.maxChain);
    this.chainTimeLeft = this.chainTime;
    this.nowChainLabel.string = "NowChain: " + this.nowChain.toString();
    this.maxChainLabel.string = "MaxChain: " + this.maxChain.toString();
    this.chainTimeLeftLebel.string = "ChainTimeLeft: " + this.chainTimeLeft.toString();
  }

});

/**
 * 测试数据
 */
function test_map_data() {
  return [
    [1, 2, 3, 4, 5, 4, 1, 1],
    [2, 0, 5, 1, 2, 5, 1, 1],
    [3, 2, 1, 6, 0, 2, 3, 1],
    [4, 3, 5, 3, 2, 5, 4, 3],
    [5, 2, 2, 0, 2, 2, 3, 4],
    [6, 1, 6, 4, 3, 5, 1, 2],
    [1, 2, 3, 5, 5, 6, 5, 1],
    [2, 6, 2, 3, 2, 0, 1, 5]
  ];
}
