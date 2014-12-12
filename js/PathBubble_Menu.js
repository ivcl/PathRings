/**
 * @author      Yongnan
 * @version     1.0
 * @time        9/27/2014
 * @name        PathBubble_Menu
 */
PATHBUBBLES.Menu = function (bubble) {
//    this.buttons = [];
    this.button = null;
    this.bubble = bubble;
    this.x = this.bubble.x + this.bubble.w + 5;
    this.y = this.bubble.y + 20;
    this.flag = false;
    this.w = 200;
    this.h = 245;
    this.text = new PATHBUBBLES.Text(this, "Menu");
    this.shape = new PATHBUBBLES.Shape.Rectangle(this, this.x, this.y, this.w, this.h, "#666666", "#282525", 2, 0);
};
PATHBUBBLES.Menu.prototype = {
    constructor: PATHBUBBLES.Menu,
    draw: function (ctx, scale) {

        this.setOffset();
//        ctx.save();	// save the context so we don't mess up others
        this.shape.draw(ctx, scale);
//        ctx.restore();
//        ctx.save();	// save the context so we don't mess up others
        this.text.draw(ctx, this.x + this.w / 2 + 5, this.y + 20);
//        ctx.restore();
    },
    setOffset: function () {
        this.x = this.bubble.x + this.bubble.w + 5;
        this.y = this.bubble.y + 20;
        this.shape.x = this.x;
        this.shape.y = this.y;
    },
    contains: function (mx, my) {
        return this.shape.contains(mx, my);
    }
};
