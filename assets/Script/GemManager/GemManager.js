let config = require("../utils/config");

cc.Class({
  extends: cc.Component,
  properties: {
    selectedGem: {
      default: null,
      type: cc.Node,
      visible: false
    },
    chosenOutline: {
      default: null,
      type: cc.Node,
      tooltip: "选中时边框"
    },
    selectedGems: {
      get: function() {
        return this._selectedGems;
      },
      set: function(value) {
        let gems = this.selectedGems;
        gems.push(value);
        if (gems.length === 2) {
          gems.shift(); // 删除首元素
        }
        cc.log("hello,world");
      }
    }
  },
  onLoad() {},

  /**
   * 更新被选中的gem数组
   * @param {*} gem
   */
  gemSelected(gem) {
    
    this.selectedGem = gem;
  },

  /**
   * swap two gems
   * @private
   * @param {cc.Node} Gem1
   * @param {cc.Node} Gem2
   */
  _swapGem(Gem1, Gem2) {
    //
  }
});
