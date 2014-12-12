/**
 * @author      Yongnan
 * @version     1.0
 * @time        10/21/2014
 * @name        PathBubble_Title
 */
PATHBUBBLES.Title = function (bubble, name) {
    this.parent = bubble;
    this.x = this.parent.x + this.parent.w / 4;
    this.y = this.parent.y - 20;
    this.flag = false;
    this.w = this.parent.w / 2;
    this.h = 20;
    this.name = name;
    this.text = new PATHBUBBLES.Text(this, this.name);
    this.text.font = "bold 12px sans-serif";
    this.shape = new PATHBUBBLES.Shape.Rectangle(this, this.x, this.y, this.w, this.h, this.parent.strokeColor, this.parent.strokeColor, 10, 10);
    this.WrapText = false;
};
PATHBUBBLES.Title.prototype = {
    constructor: PATHBUBBLES.Title,
    draw: function (ctx, scale) {
        if (scale !== 1)
            return;
        this.setOffset();
        this.shape.draw(ctx, scale);
        if (this.name == undefined)
            this.name = "";
        this.text.text = this.name;
        if(!this.WrapText)
            this.text.draw(ctx, this.x + this.parent.w / 4, this.y + 5);
        else
            this.text.drawWrapText(ctx, this.x + this.parent.w / 4, this.y + 5, this.w, 5);
    },
    setOffset: function () {
        this.x = this.parent.x + this.parent.w / 4;
        this.y = this.parent.y - 20;
        this.w = this.parent.w / 2;
        this.shape.x = this.x;
        this.shape.y = this.y;
        this.shape.w = this.w;
    },
    contains: function (mx, my) {
        var x = this.x;
        var y = this.y;
        var w = this.w;
        var h = this.h;

        return  (x <= mx) && (x + w >= mx) && (y <= my) && (y + h >= my);
    }
};
