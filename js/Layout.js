/**
 * @author      Yongnan
 * @version     1.0
 * @time        10/2/2014
 * @name        PathBubble_Layout
 */
PATHBUBBLES.Layout = PATHBUBBLES.Layout || {};
PATHBUBBLES.Layout.CircleLayout = function (x, y, w, h, radius, startAngle, nodes) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;

    this.radius = radius;
    this.startAngle = startAngle;
    this.nodes = nodes;
};
PATHBUBBLES.Layout.CircleLayout.prototype = {
    init: function () {
        var center = {x: this.x + this.w / 2, y: this.y + this.h / 2};
        var theta = this.startAngle;
        var dTheta = 2 * Math.PI / this.nodes.length;
        var r;
        var minDistance = 4;   //Node radius = 2;
        // calculate the radius
        if (this.nodes.length) {
            minDistance *= 1.75;
            var hDtheta = dTheta / 2;
            r = minDistance / (2 * Math.sin(hDtheta));
        }

        var getPos = function (i) {
            var rx = r * Math.cos(theta);
            var ry = r * Math.sin(theta);
            var pos = {
                x: center.x + rx,
                y: center.y + ry
            };

            theta = (theta + dTheta * i) % 2 * Math.PI;
            return pos;
        };
    }
};
PATHBUBBLES.Layout.Node = function (data) {
    this.data = data;
    this.type = "circle";

    this.x = 0;
    this.y = 0;
    this.r = 2;
    this.shape = new PATHBUBBLES.Circle(this.x, this.y, this.r, "#0000ff", "0000ff", 1);
    this.offsetX = 0;
    this.offsetY = 0;
};
PATHBUBBLES.Layout.Node.prototype = {
    constructor: PATHBUBBLES.Biomolecule.DNA,
    draw: function (ctx, scale) {
        this.setOffset();
        this.shape.strokeColor = "#0000ff";
        this.shape.fillColor = "#0000ff";
        this.shape.draw(ctx, 1);
    },
    setOffset: function () {
        this.shape.offsetX = this.offsetX;
        this.shape.offsetY = this.offsetY;
        this.shape.x = this.x;
        this.shape.y = this.y;
        this.shape.r = this.r;
    },
    contains: function (mx, my) {
        this.setOffset();
        return this.shape.contains(mx, my);
    }

};

