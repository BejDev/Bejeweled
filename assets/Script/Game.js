let config = require("./utils/config");
let Gem = require("Gem");
let GemColor = Gem["GemColor"];
let GemType = Gem["GemType"];

let choosing_gem = null; //被单击选中的宝石
let GemMoving = false;
cc.Class({
  extends: cc.Component,
  properties: {
    map: {
      default: [],
      visible: false
    },
    color_map: {
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
    gem_spacing: {
      default: 74,
      tooltip: "宝石间距"
    },
    move_speed: {
      default: 0.2,
      tooltip: "移动速度"
    }
  },

  onLoad() {
    this.choosing_gem = null;
    const random_of_max_num = this.gems.length;
    for (var x = 0; x < this.height; x++) {
      this.map[x] = [];
      this.color_map[x] = [];
      for (var y = 0; y < this.width; y++) {
        this.color_map[x][y] = this.random_num(0, random_of_max_num - 1);
      }
    }
    cc.log(this.color_map);

    for (var x = 0; x < this.height; x++) {
      for (var y = 0; y < this.width; y++) {
        let color = this.color_map[x][y];
        while (this.check_color(x, y, color)) {
          color = this.random_num(0, random_of_max_num - 1);
        }
        this.color_map[x][y] = color;
        const prefab = this.gems[color];
        let gem = this.create_gem(prefab);
        this.set_gem(x, y, gem);
      }
    }
  },

  /**
   * 返回[min_num, max_num] 中的任意整数
   *
   * @param {number} min_num 最小值
   * @param {number} max_num 最大值
   *
   * @returns {number}
   */
  random_num(min_num, max_num) {
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
  create_gem(prefab, options) {
    let gem = cc.instantiate(prefab);
    // Pre_init
    return gem;
  },

  /**
   * 将 Gem 放到 Map 的指定位置
   *
   * @author himself65
   *
   * @param {number} _x 横轴位置
   * @param {number} _y 纵轴位置
   * @param {cc.Prefab} gem 宝石的实例
   */
  set_gem(_x, _y, gem) {
    if (gem === undefined) {
      cc.error("gem is null");
      return;
    }
    gem.parent = this.wall; // 绑定到墙上
    gem.getComponent("Gem").setMapPosition(cc.v2(_x, _y));
    /**
     * 此处还需要修改
     * 改成适应各种宽度的棋盘
     * @todo
     */
    const spacing = this.gem_spacing; // 间距
    gem.setPosition(_x * spacing - 256, _y * spacing - 253);
    this.map[_x][_y] = gem;
  },

  /**
   * 检查color是否和map上的宝石冲突
   *
   * @author himself65
   *
   * @param {number} _x 横轴位置
   * @param {number} _y 纵轴位置
   * @param {number} color 目标颜色，默认无值
   * @param {*} options
   *
   * @returns {boolean}
   */
  check_color(_x, _y, color = undefined, options) {
    if (color === undefined) {
      color = this.color_map[_x][_y];
    }
    const is_same = (a, b, c) => {
      return a === b && a === c;
    };

    let tag = false;
    const c_mp = this.color_map;
    const px = _x;
    const py = _y;
    let a, b;

    if (px - 2 > 0) {
      a = c_mp[px - 1][py];
      b = c_mp[px - 2][py];
      if (is_same(a, b, color)) tag = true;
    }
    if (px + 2 < this.width) {
      a = c_mp[px + 1][py];
      b = c_mp[px + 2][py];
      if (is_same(a, b, color)) tag = true;
    }
    if (py - 2 > 0) {
      a = c_mp[px][py - 1];
      b = c_mp[px][py - 2];
      if (is_same(a, b, color)) tag = true;
    }
    if (px + 2 < this.height) {
      a = c_mp[px][py + 1];
      b = c_mp[px][py + 2];
      if (is_same(a, b, color)) tag = true;
    }
    return tag;
  },

  /**
   * 检查是否相邻
   * @param {cc.Node} Gem_a 第一个宝石
   * @param {cc.Node} Gem_b 第二个宝石
   *
   * @returns {boolean}
   */
  can_swap(Gem_a, Gem_b) {
    let Gemjs_a = Gem_a.getComponent("Gem");
    let Gemjs_b = Gem_b.getComponent("Gem");
    let aMapPositon = Gemjs_a.getMapPosition();
    let bMapPositon = Gemjs_b.getMapPosition();
    if (
      aMapPositon.x == bMapPositon.x &&
      Math.abs(aMapPositon.y - bMapPositon.y) == 1
    ) {
      return true;
    }
    if (
      aMapPositon.y == bMapPositon.y &&
      Math.abs(aMapPositon.x - bMapPositon.x) == 1
    ) {
      return true;
    }
    if (aMapPositon.x == bMapPositon.x && aMapPositon.y == bMapPositon.y) {
      return -1;
    }
    return false;
  },
  /**
   * 判断移动是否有效
   * @todo
   * @param  {cc.Node} Gem_a
   * @param  {cc.Node} Gem_b
   * @return {boolean}
   */
  checkValidMove(Gem_a, Gem_b) {
    return false;
  },

  /**
   * 移动宝石（总）
   * @param {[type]} Gem_a [description]
   * @param {[type]} Gem_b [description]
   */
  SwapGem(Gem_a, Gem_b) {
    if (this.checkValidMove(Gem_a, Gem_b)) {
      this.SwapGemValid(Gem_a, Gem_b);
    } else {
      this.SwapGemInvalid(Gem_a, Gem_b);
    }
  },

  /**
   * 无效移动
   * @param {[type]} Gem_a [description]
   * @param {[type]} Gem_b [description]
   */
  SwapGemInvalid(Gem_a, Gem_b) {
    this.GemMoving = true;
    let a_Position = Gem_a.getPosition();
    let b_Position = Gem_b.getPosition();

    let action_a = cc.moveTo(this.move_speed, a_Position);
    let action_b = cc.moveTo(this.move_speed, b_Position);

    let finished = cc.callFunc(function() {
      this.GemMoving = false;
    }, this);

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
   * @param {cc.Node} Gem_a 第一个宝石
   * @param {cc.Node} Gem_b 第二个宝石
   *
   */
  SwapGemValid(Gem_a, Gem_b) {
    this.GemMoving = true;
    let a_Position = Gem_a.getPosition();
    let b_Position = Gem_b.getPosition();

    let action_a = cc.moveTo(this.move_speed, b_Position);
    Gem_a.runAction(action_a);
    Gem_a.setLocalZOrder(1);

    let finished = cc.callFunc(function() {
      this.GemMoving = false;
    }, this);

    let action_b = cc.sequence(
      cc.moveTo(this.move_speed, a_Position),
      finished
    );
    Gem_b.runAction(action_b);
    Gem_a.setLocalZOrder(0);

    //Gem_a.setPosition(b_Position);
    //Gem_b.setPosition(a_Position);

    let Gemjs_a = Gem_a.getComponent("Gem");
    let Gemjs_b = Gem_b.getComponent("Gem");
    let aMapPositon = Gemjs_a.getMapPosition();
    let bMapPositon = Gemjs_b.getMapPosition();

    let tmp = this.color_map[aMapPositon.x][aMapPositon.y];
    this.color_map[aMapPositon.x][aMapPositon.y] = this.color_map[
      bMapPositon.x
    ][bMapPositon.y];
    this.color_map[bMapPositon.x][bMapPositon.y] = tmp;
    //swap(this.color_map[aMapPositon.x][aMapPositon.y], this.color_map[bMapPositon.x][bMapPositon.y]);

    tmp = this.map[aMapPositon.x][aMapPositon.y];
    this.map[aMapPositon.x][aMapPositon.y] = this.map[bMapPositon.x][
      bMapPositon.y
    ];
    this.map[bMapPositon.x][bMapPositon.y] = tmp;
    //swap(this.map[aMapPositon.x][aMapPositon.y], this.map[bMapPositon.x][bMapPositon.y]);

    Gemjs_a.setMapPosition(bMapPositon);
    Gemjs_b.setMapPosition(aMapPositon);
  },
  /**
   * 获取棋盘的对应坐标的宝石
   * @param {integer} _x 横坐标
   * @param {integer} _y
   * @returns {cc.Node}
   */
  getGem(_x, _y) {
    cc.log(_x, _y);
    return this.map[_x][_y];
  },
  /**
   * 取消鼠标选中
   *
   */
  delChoosingGem() {
    if (this.choosing_gem === null) return;
    this.choosing_gem.getComponent("Gem").chooingJpg.active = false;
    this.choosing_gem = null;
  },
  /**
   * 标记鼠标选中
   * @param {cc.Node} _node 宝石节点
   */
  setChoosingGem(_node) {
    if (this.choosing_gem !== null) {
      this.delChoosingGem();
    }
    this.choosing_gem = _node;
    this.choosing_gem.getComponent("Gem").chooingJpg.active = true;
    // 被选中的宝石添加选中框
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
