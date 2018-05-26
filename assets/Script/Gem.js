let Direction = require('Direction');
/**
 * 宝石颜色枚举
 * 
 * @author himself65
 */
const GemColor = cc.Enum({
    WHITE: 0,
    BLUE: 1,
    RED: 2,
    GREEN: 3,
    ORANGE: 4,
    YELLOW: 5,
    PURPLE: 6,
});

/**
 * 宝石类型枚举
 * 
 * @author himself65
 */
const GemType = cc.Enum({
    NORMAL: 0,
    FLAME: 1, // 火焰
    LIGHT: 2, // 闪电
    SUPER: 3, // 超能
    STARS: 4, // 超新星
})

let MouseIsOver = false; //鼠标悬停在宝石上
let XinColorMap = -1; //宝石横坐标,从0开始
let YinColorMap = -1;

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
        gem_size: {
            default: 60,
            tooltip: "宝石大小"
        },
        chooingJpg: {
            type: cc.Node,
            default: null,
            tooltip: "被选中图片标记"
        },
    },

    start() {
        this.wall = this.node.parent;
        this.game = this.wall.getComponent('Game');
    },

    get_color() {
        return this.color;
    },

    get_XYinMap() {
    	return cc.v2(this.XinColorMap, this.YinColorMap);
    },

    onLoad() {
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
        this.node.on('mouseenter', function (event) {
            this.MouseIsOver = true;
        }, this);
        this.node.on('mouseleave', function (event) {
            this.MouseIsOver = false;
        }, this);
        this.node.on('mousedown', function (event) {
            let original_gem = this.game.choosing_gem;
            if(original_gem == null || this.game.can_swap(original_gem, this.node) == false){
                this.game.setChoosingGem(this.node);
                // cc.log(1111);
            } else if(this.game.can_swap(original_gem, this.node) == -1){
            	this.game.delChoosingGem();
            } else {
            	cc.log(original_gem.getComponent('Gem').getMapPosition());
            	cc.log(this.getMapPosition());
                this.game.SwapGem(original_gem, this.node);
                this.game.delChoosingGem();
                // cc.log(2222);
            }
        }, this);
        this.node.on('touchcancel', function (event) {
        	// cc.log(this.getMapPosition());
            let pre = event.getStartLocation();
            let dx = event.getLocationX() - pre.x;
            let dy = event.getLocationY() - pre.y;
            cc.log(dx,dy);
            let SwapGems = null;
            if(Math.abs(dx) + Math.abs(dy) >= this.gem_size/2){
            	if(Math.abs(dx) > Math.abs(dy)) {
	                if(dx > 0) {
	                    SwapGems = this.game.getGem(this.XinColorMap + 1, this.YinColorMap);
	                } else {
	                    SwapGems = this.game.getGem(this.XinColorMap - 1, this.YinColorMap);
	                }
	            } else {
	                if (dy > 0) {
	                    SwapGems = this.game.getGem(this.XinColorMap, this.YinColorMap + 1);
	                } else {
	                    SwapGems = this.game.getGem(this.XinColorMap, this.YinColorMap - 1);
	                }
	            }
            }
            if (SwapGems === null) {
                cc.log('validMove is none');
            } else {
                this.game.SwapGem(this.node, SwapGems);
                cc.log(3333);
            }
        }, this);
    },
    /**
     * 返回宝石在棋盘位置
     * @returns {cc.v2(x,y)}
     */
    getMapPosition() {
        return cc.v2(this.XinColorMap, this.YinColorMap);
    },
    /**
     * 重置宝石在棋盘位置
     * @param {cc.v2(x,y)} Position
     */
    setMapPosition(Position) {
    	this.XinColorMap = Position.x;
    	this.YinColorMap = Position.y;
    },

    onKeyDown(event) {
        if (this.MouseIsOver !== true) {
            return;
        } else {
        	cc.log(this.getMapPosition());
        }
        let SwapGem_1 = null;
        let SwapGem_2 = null;
        let hasChoosingGem = -1;
        if (this.game.choosing_gem !== null) {
            SwapGem_1 = this.game.choosing_gem;
            hasChoosingGem = true;
        } else {
            SwapGem_1 = this.node;
            hasChoosingGem = false;
        }
        let SwapGemPosition = SwapGem_1.getComponent('Gem').getMapPosition();
        let _x = SwapGemPosition.x;
        let _y = SwapGemPosition.y;
        switch (event.keyCode) {
            case cc.KEY.a:
            case cc.KEY.left:
                SwapGem_2 = this.game.getGem(_x - 1, _y);
                break;
            case cc.KEY.d:
            case cc.KEY.right:
                SwapGem_2 = this.game.getGem(_x + 1, _y);
                break;
            case cc.KEY.w:
            case cc.KEY.up:
                SwapGem_2 = this.game.getGem(_x, _y + 1);
                break;
            case cc.KEY.s:
            case cc.KEY.down:
                SwapGem_2 = this.game.getGem(_x, _y - 1);
                break;
            default:
                cc.log(event.keyCode);
        }
        cc.log(SwapGem_2);
        this.game.SwapGem(SwapGem_1, SwapGem_2);
        if(hasChoosingGem == false) {
        	this.game.delChoosingGem();
        }
    },

});
module.exports = {
    'GemColor': GemColor,
    'GemType': GemType,
}