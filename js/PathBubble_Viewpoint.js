/**
 * @author      Yongnan
 * @version     1.0
 * @time        9/27/2014
 * @name        PathBubble_Viewpoint
 */
PATHBUBBLES.ViewPoint = function () {
    PATHBUBBLES.Object2D.call(this);
    this.type = "ViewPoint";
    this.x = 0;
    this.y = 0;
    this.h = 50;
    this.w = window.innerWidth / window.innerHeight * 50;
    this.shape = new PATHBUBBLES.Shape.Rectangle(this, this.x, this.y, this.w, this.h, "#C2C2C2", "#00ff00", 2, 0);
    this.shape.fillState = false;
};
PATHBUBBLES.ViewPoint.prototype = Object.create(PATHBUBBLES.Object2D.prototype);
PATHBUBBLES.ViewPoint.prototype = {
    constructor: PATHBUBBLES.ViewPoint,
    draw: function (ctx, scale) {
        this.setOffset();
        this.shape.draw(ctx, scale);
    },
    setOffset: function () {
        this.offsetX = 0;
        this.offsetY = 0;

        this.shape.offsetX = this.offsetX;
        this.shape.offsetY = this.offsetY;
        this.shape.x = this.x;
        this.shape.y = 0;
        this.shape.w = this.w;
        this.shape.h = this.h;
    },
    contains: function (mx, my) {
        this.setOffset();
        return this.shape.contains(mx, my);
    }
};
