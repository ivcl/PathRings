/**
 * @author      Yongnan
 * @version     1.0
 * @time        9/16/2014
 * @name        PathBubble_Shape
 */
PATHBUBBLES.Shape = PATHBUBBLES.Shape || {};

PATHBUBBLES.Shape.Rectangle = function (object, x, y, w, h, strokeColor, fillColor, lineWidth, cornerRadius) {
    this.type = "Rectangle";
    this.x = x || 0;
    this.y = y || 0;
    this.w = w || 1;
    this.h = h || 1;

    this.cornerRadius = cornerRadius || 0;  //whether it is a round rectangle or not
    this.strokeColor = strokeColor || "#0000ff";
    this.fillColor = fillColor || "#FFE2B7";
    this.lineWidth = lineWidth || 1;
    this.HighLight_State = false;
    this.fillState = true;
    this.strokeState = true;
    this.offsetX = 0;
    this.offsetY = 0;
    this.object = object;

};
PATHBUBBLES.Shape.Rectangle.prototype = {
    constructor: PATHBUBBLES.Shape.Rectangle,
    draw: function (ctx, scale) {
        var x = this.x + this.offsetX;
        var y = this.y + this.offsetY;
        var w = this.w;
        var h = this.h;
        //ctx.save();	// save the context so we don't mess up others
        ctx.fillStyle = this.fillColor;
        ctx.strokeStyle = this.strokeColor;
        ctx.lineWidth = this.lineWidth * scale;
//        ctx.setLineDash([0]);
//        ctx.lineDashOffset = 0;
        if (!this.cornerRadius) {
            if (this.fillState)
                ctx.fillRect(x, y, w, h);
            if (this.strokeState)
                ctx.strokeRect(x, y, w, h);
        }
        else {
            if (this.object.type == "Bubble") {
                var x = x - this.lineWidth / 2 - 1;
                var y = y - this.lineWidth / 2 - 1;
                var w = this.w + this.lineWidth + 2;
                var h = this.h + this.lineWidth + 2;
                var r = x + w;
                var b = y + h;
                ctx.beginPath();
                if (scale == 1) {
                    ctx.moveTo((x + this.cornerRadius) * scale, y * scale);
                    ctx.lineTo((r - this.cornerRadius) * scale, y * scale);
                    ctx.quadraticCurveTo(r * scale, y * scale, r * scale, (y + this.cornerRadius) * scale);
                    ctx.lineTo(r * scale, (y + h - this.cornerRadius) * scale);
                    ctx.quadraticCurveTo(r * scale, b * scale, (r - this.cornerRadius) * scale, b * scale);
                    ctx.lineTo((x + this.cornerRadius) * scale, b * scale);
                    ctx.quadraticCurveTo(x * scale, b * scale, x * scale, (b - this.cornerRadius) * scale);
                    ctx.lineTo(x * scale, (y + this.cornerRadius) * scale);
                    ctx.quadraticCurveTo(x * scale, y * scale, (x + this.cornerRadius) * scale, y * scale);
                    ctx.closePath();
                }
                else {
                    ctx.moveTo((x + this.cornerRadius) * scale + viewpoint.x, y * scale);
                    ctx.lineTo((r - this.cornerRadius) * scale + viewpoint.x, y * scale);
                    ctx.quadraticCurveTo(r * scale + viewpoint.x, y * scale, r * scale + viewpoint.x, (y + this.cornerRadius) * scale);
                    ctx.lineTo(r * scale + viewpoint.x, (y + h - this.cornerRadius) * scale);
                    ctx.quadraticCurveTo(r * scale + viewpoint.x, b * scale, (r - this.cornerRadius) * scale + viewpoint.x, b * scale);
                    ctx.lineTo((x + this.cornerRadius) * scale + viewpoint.x, b * scale);
                    ctx.quadraticCurveTo(x * scale + viewpoint.x, b * scale, x * scale + viewpoint.x, (b - this.cornerRadius) * scale);
                    ctx.lineTo(x * scale + viewpoint.x, (y + this.cornerRadius) * scale);
                    ctx.quadraticCurveTo(x * scale + viewpoint.x, y * scale, (x + this.cornerRadius) * scale + viewpoint.x, y * scale);
                    ctx.closePath();
                }
                ctx.clip();

            }
            var x = this.x + this.offsetX;
            var y = this.y + this.offsetY;
            var w = this.w;
            var h = this.h;
            var r = x + w;
            var b = y + h;
            ctx.beginPath();
            if (scale == 1) {
                ctx.moveTo((x + this.cornerRadius) * scale, y * scale);
                ctx.lineTo((r - this.cornerRadius) * scale, y * scale);
                ctx.quadraticCurveTo(r * scale, y * scale, r * scale, (y + this.cornerRadius) * scale);
                ctx.lineTo(r * scale, (y + h - this.cornerRadius) * scale);
                ctx.quadraticCurveTo(r * scale, b * scale, (r - this.cornerRadius) * scale, b * scale);
                ctx.lineTo((x + this.cornerRadius) * scale, b * scale);
                ctx.quadraticCurveTo(x * scale, b * scale, x * scale, (b - this.cornerRadius) * scale);
                ctx.lineTo(x * scale, (y + this.cornerRadius) * scale);
                ctx.quadraticCurveTo(x * scale, y * scale, (x + this.cornerRadius) * scale, y * scale);
                ctx.closePath();
            }
            else {
                ctx.moveTo((x + this.cornerRadius) * scale + viewpoint.x, y * scale);
                ctx.lineTo((r - this.cornerRadius) * scale + viewpoint.x, y * scale);
                ctx.quadraticCurveTo(r * scale + viewpoint.x, y * scale, r * scale + viewpoint.x, (y + this.cornerRadius) * scale);
                ctx.lineTo(r * scale + viewpoint.x, (y + h - this.cornerRadius) * scale);
                ctx.quadraticCurveTo(r * scale + viewpoint.x, b * scale, (r - this.cornerRadius) * scale + viewpoint.x, b * scale);
                ctx.lineTo((x + this.cornerRadius) * scale + viewpoint.x, b * scale);
                ctx.quadraticCurveTo(x * scale + viewpoint.x, b * scale, x * scale + viewpoint.x, (b - this.cornerRadius) * scale);
                ctx.lineTo(x * scale + viewpoint.x, (y + this.cornerRadius) * scale);
                ctx.quadraticCurveTo(x * scale + viewpoint.x, y * scale, (x + this.cornerRadius) * scale + viewpoint.x, y * scale);
                ctx.closePath();
            }

            if (this.fillState)
                ctx.fill();
            if (this.strokeState)
                ctx.stroke();
        }
        //ctx.restore();	// restore context to what it was on entry
        if (this.HighLight_State) {
            this.drawStroke(ctx, scale);
        }
    },
    drawStrokeAgain: function (ctx, scale) {
        var x = this.x + this.offsetX;
        var y = this.y + this.offsetY;
        var w = this.w;
        var h = this.h;
        //ctx.save();	// save the context so we don't mess up others
        ctx.fillStyle = this.fillColor;
        ctx.strokeStyle = this.strokeColor;
        ctx.lineWidth = this.lineWidth * scale;
//        ctx.setLineDash([0]);
//        ctx.lineDashOffset = 0;
        if (!this.cornerRadius) {
            if (this.fillState)
                ctx.fillRect(x, y, w, h);
            if (this.strokeState)
                ctx.strokeRect(x, y, w, h);
        }
        else {
            var x = this.x + this.offsetX;
            var y = this.y + this.offsetY;
            var w = this.w;
            var h = this.h;
            var r = x + w;
            var b = y + h;
            ctx.beginPath();
            if (scale == 1) {
                ctx.moveTo((x + this.cornerRadius) * scale, y * scale);
                ctx.lineTo((r - this.cornerRadius) * scale, y * scale);
                ctx.quadraticCurveTo(r * scale, y * scale, r * scale, (y + this.cornerRadius) * scale);
                ctx.lineTo(r * scale, (y + h - this.cornerRadius) * scale);
                ctx.quadraticCurveTo(r * scale, b * scale, (r - this.cornerRadius) * scale, b * scale);
                ctx.lineTo((x + this.cornerRadius) * scale, b * scale);
                ctx.quadraticCurveTo(x * scale, b * scale, x * scale, (b - this.cornerRadius) * scale);
                ctx.lineTo(x * scale, (y + this.cornerRadius) * scale);
                ctx.quadraticCurveTo(x * scale, y * scale, (x + this.cornerRadius) * scale, y * scale);
                ctx.closePath();
            }
            else {
                ctx.moveTo((x + this.cornerRadius) * scale + viewpoint.x, y * scale);
                ctx.lineTo((r - this.cornerRadius) * scale + viewpoint.x, y * scale);
                ctx.quadraticCurveTo(r * scale + viewpoint.x, y * scale, r * scale + viewpoint.x, (y + this.cornerRadius) * scale);
                ctx.lineTo(r * scale + viewpoint.x, (y + h - this.cornerRadius) * scale);
                ctx.quadraticCurveTo(r * scale + viewpoint.x, b * scale, (r - this.cornerRadius) * scale + viewpoint.x, b * scale);
                ctx.lineTo((x + this.cornerRadius) * scale + viewpoint.x, b * scale);
                ctx.quadraticCurveTo(x * scale + viewpoint.x, b * scale, x * scale + viewpoint.x, (b - this.cornerRadius) * scale);
                ctx.lineTo(x * scale + viewpoint.x, (y + this.cornerRadius) * scale);
                ctx.quadraticCurveTo(x * scale + viewpoint.x, y * scale, (x + this.cornerRadius) * scale + viewpoint.x, y * scale);
                ctx.closePath();
            }
            ctx.stroke();
        }
    },
    drawStroke: function (ctx, scale) {
        var x = this.x + this.offsetX;
        var y = this.y + this.offsetY;
        var w = this.w;
        var h = this.h;

        // ctx.save();
        ctx.strokeStyle = "#ffff00";
        ctx.lineWidth = 2 * scale;
        if (this.cornerRadius) {
            // Draw the square
//            ctx.setLineDash([5, 4]);
//            ctx.lineDashOffset = 4;
            var r = x + w + 5;
            var b = y + h + 5;
            ctx.beginPath();
            if (scale != 1) {
                ctx.moveTo((x - 5 + this.cornerRadius) * scale + viewpoint.x, (y - 5) * scale);
                ctx.lineTo((r - this.cornerRadius) * scale + viewpoint.x, (y - 5) * scale);
                ctx.quadraticCurveTo(r * scale + viewpoint.x, (y - 5) * scale, r * scale + viewpoint.x, (y - 5 + this.cornerRadius) * scale);
                ctx.lineTo(r * scale + viewpoint.x, (y - 5) * scale + (h - this.cornerRadius) * scale);
                ctx.quadraticCurveTo(r * scale + viewpoint.x, b * scale, (r - this.cornerRadius) * scale + viewpoint.x, b * scale);
                ctx.lineTo((x - 5 + this.cornerRadius) * scale + viewpoint.x, b * scale);
                ctx.quadraticCurveTo((x - 5) * scale + viewpoint.x, b * scale, (x - 5) * scale + viewpoint.x, (b - this.cornerRadius) * scale);
                ctx.lineTo((x - 5) * scale + viewpoint.x, (y - 5 + this.cornerRadius) * scale);
                ctx.quadraticCurveTo((x - 5) * scale + viewpoint.x, (y - 5) * scale, (x - 5 + this.cornerRadius) * scale + viewpoint.x, (y - 5) * scale);
            }
            else {
                ctx.moveTo((x - 5 + this.cornerRadius) * scale, (y - 5) * scale);
                ctx.lineTo((r - this.cornerRadius) * scale, (y - 5) * scale);
                ctx.quadraticCurveTo(r * scale, (y - 5) * scale, r * scale, (y - 5 + this.cornerRadius) * scale);
                ctx.lineTo(r * scale, (y - 5) * scale + (h - this.cornerRadius) * scale);
                ctx.quadraticCurveTo(r * scale, b * scale, (r - this.cornerRadius) * scale, b * scale);
                ctx.lineTo((x - 5 + this.cornerRadius) * scale, b * scale);
                ctx.quadraticCurveTo((x - 5) * scale, b * scale, (x - 5) * scale, (b - this.cornerRadius) * scale);
                ctx.lineTo((x - 5) * scale, (y - 5 + this.cornerRadius) * scale);
                ctx.quadraticCurveTo((x - 5) * scale, (y - 5) * scale, (x - 5 + this.cornerRadius) * scale, (y - 5) * scale);
            }

            ctx.closePath();
            ctx.stroke();
        }
        else {
            if (scale == 1)
                ctx.strokeRect(x * scale, y * scale, w * scale, h * scale);
            else
                ctx.strokeRect(x * scale + viewpoint.x, y * scale, w * scale, h * scale);
        }
        //ctx.restore();	// restore context to what it was on entry
    },
    contains: function (mx, my) {
        var x = this.x + this.offsetX;
        var y = this.y + this.offsetY;

        return  (x <= mx) && (x + this.w >= mx) && (y <= my) && (y + this.h >= my);
    },
    clone: function () {
        var rectangle = new PATHBUBBLES.Shape.Rectangle();
        rectangle.type = this.type;
        rectangle.x = this.x + this.offsetX;
        rectangle.y = this.y + this.offsetY;
        rectangle.r = this.r;
        rectangle.strokeColor = this.strokeColor;
        rectangle.fillColor = this.fillColor;
        rectangle.lineWidth = this.lineWidth;
        rectangle.HighLight_State = this.HighLight_State;
        return rectangle;
    }
};

PATHBUBBLES.Shape.Circle = function (x, y, r, strokeColor, fillColor, lineWidth) {
    this.type = "Circle";
    this.x = x || 0;
    this.y = y || 0;
    this.r = r || 10;

    this.strokeColor = strokeColor || "#0000ff";
    this.fillColor = fillColor || "#FFE2B7";
    this.lineWidth = lineWidth || 1;
    this.HighLight_State = false;

    this.offsetX = 0;
    this.offsetY = 0;
};
PATHBUBBLES.Shape.Circle.prototype = {
    constructor: PATHBUBBLES.Shape.Circle,
    draw: function (ctx, scale) {

        var x = this.x + this.offsetX;
        var y = this.y + this.offsetY;
//        ctx.save();	// save the context so we don't mess up others
        ctx.fillStyle = this.fillColor;
        ctx.strokeStyle = this.strokeColor;
        ctx.lineWidth = this.lineWidth;
//        ctx.setLineDash([0]);
//        ctx.lineDashOffset = 0;
        ctx.beginPath();
        if (scale == 1)
            ctx.arc(x * scale, y * scale, this.r * scale, 0, 2 * Math.PI, false);
        else
            ctx.arc(x * scale + viewpoint.x, y * scale, this.r * scale, 0, 2 * Math.PI, false);
        ctx.fill();
        ctx.stroke();
        ctx.closePath();
//        ctx.restore();	// restore context to what it was on entry
        if (this.HighLight_State) {
            this.drawStroke(ctx, scale);
        }
    },
    drawStroke: function (ctx, scale) {
        var x = this.x + this.offsetX;
        var y = this.y + this.offsetY;
//        ctx.save();	// save the context so we don't mess up others
        ctx.strokeStyle = "#ffff00";
        ctx.lineWidth = this.lineWidth * 2;
        ctx.beginPath();
        if (scale == 1)
            ctx.arc(x * scale, y * scale, this.r * scale, 0, 2 * Math.PI, false);
        else
            ctx.arc(x * scale + viewpoint.x, y * scale, this.r * scale, 0, 2 * Math.PI, false);
        ctx.stroke();
        ctx.closePath();
//        ctx.restore();	// restore context to what it was on entry

    },
    contains: function (mx, my) {
        var x = this.x + this.offsetX;
        var y = this.y + this.offsetY;
        return  (x - mx ) * (x - mx) + (y - my ) * (y - my) <= this.r * this.r;
    },
    clone: function () {
        var circle = new PATHBUBBLES.Shape.Circle();
        circle.type = this.type;
        circle.x = this.x;
        circle.y = this.y;
        circle.offsetX = this.offsetX;
        circle.offsetY = this.offsetY;
        circle.r = this.r;
        circle.strokeColor = this.strokeColor;
        circle.fillColor = this.fillColor;
        circle.lineWidth = this.lineWidth;
        circle.HighLight_State = this.HighLight_State;
        return circle;
    }
};
PATHBUBBLES.Shape.Ellipse = function (x, y, w, h, strokeColor, fillColor, lineWidth) {
    this.type = "Ellipse";
    this.x = x || 0;
    this.y = y || 0;
    this.w = w || 10;
    this.h = h || 10;

    this.strokeColor = strokeColor || "#0000ff";
    this.fillColor = fillColor || "#FFE2B7";
    this.lineWidth = lineWidth || 1;
    this.HighLight_State = false;
};
PATHBUBBLES.Shape.Ellipse.prototype = {
    constructor: PATHBUBBLES.Shape.Ellipse,
    draw: function (ctx, scale) {
        var x = this.x + this.offsetX;
        var y = this.y + this.offsetY;
//        ctx.save();	// save the context so we don't mess up others
        ctx.fillStyle = this.fillColor;
        ctx.strokeStyle = this.strokeColor;
        ctx.lineWidth = this.lineWidth;
//        ctx.setLineDash([0]);
//        ctx.lineDashOffset = 0;
        var w = this.w;
        var h = this.h;
        var mx = x + w / 2;
        var my = y + h / 2;
        ctx.beginPath();
        if (scale == 1) {
            ctx.moveTo(x * scale, my * scale);
            ctx.quadraticCurveTo(x * scale, y * scale, mx * scale, y * scale);
            ctx.quadraticCurveTo((x + w) * scale, y * scale, (x + w) * scale, my * scale);
            ctx.quadraticCurveTo((x + w) * scale, (y + h) * scale, mx * scale, (y + h) * scale);
            ctx.quadraticCurveTo(x * scale, (y + h) * scale, x * scale, my * scale);
        }
        else {
            ctx.moveTo(x * scale + viewpoint.x, my * scale);
            ctx.quadraticCurveTo(x * scale + viewpoint.x, y * scale, mx * scale + viewpoint.x, y * scale);
            ctx.quadraticCurveTo((x + w) * scale + viewpoint.x, y * scale, (x + w) * scale + viewpoint.x, my * scale);
            ctx.quadraticCurveTo((x + w) * scale + viewpoint.x, (y + h) * scale, mx * scale + viewpoint.x, (y + h) * scale);
            ctx.quadraticCurveTo(x * scale + viewpoint.x, (y + h) * scale, x * scale + viewpoint.x, my * scale);
        }
        ctx.fill();
        ctx.stroke();
        ctx.closePath();
//        ctx.restore();	// restore context to what it was on entry
        if (this.HighLight_State) {
            this.drawStroke(ctx, scale);
        }
    },
    drawStroke: function (ctx, scale) {
        var x = this.x + this.offsetX;
        var y = this.y + this.offsetY;
//        ctx.save();	// save the context so we don't mess up others
        ctx.strokeStyle = "#ffff00";
        ctx.lineWidth = this.lineWidth;
        var w = this.w;
        var h = this.h;
        var mx = x + w / 2;
        var my = y + h / 2;
        ctx.beginPath();
        if (scale == 1) {
            ctx.moveTo(x * scale, my * scale);
            ctx.quadraticCurveTo(x * scale, y * scale, mx * scale, y * scale);
            ctx.quadraticCurveTo((x + w) * scale, y * scale, (x + w) * scale, my * scale);
            ctx.quadraticCurveTo((x + w) * scale, (y + h) * scale, mx * scale, (y + h) * scale);
            ctx.quadraticCurveTo(x * scale, (y + h) * scale, x * scale, my * scale);
        }
        else {
            ctx.moveTo(x * scale + viewpoint.x, my * scale);
            ctx.quadraticCurveTo(x * scale + viewpoint.x, y * scale, mx * scale + viewpoint.x, y * scale);
            ctx.quadraticCurveTo((x + w) * scale + viewpoint.x, y * scale, (x + w) * scale + viewpoint.x, my * scale);
            ctx.quadraticCurveTo((x + w) * scale + viewpoint.x, (y + h) * scale, mx * scale + viewpoint.x, (y + h) * scale);
            ctx.quadraticCurveTo(x * scale + viewpoint.x, (y + h) * scale, x * scale + viewpoint.x, my * scale);
        }
        ctx.closePath();
        ctx.stroke();
//        ctx.restore();	// restore context to what it was on entry
    },
    contains: function (mx, my) {
        var x = this.x + this.offsetX;
        var y = this.y + this.offsetY;
        return  (x <= mx) && (x + this.w >= mx) && (y <= my) && (y + this.h >= my);
    },
    clone: function () {
        var ellipse = new PATHBUBBLES.Shape.Ellipse();
        ellipse.type = this.type;
        ellipse.x = this.x;
        ellipse.y = this.y;
        ellipse.w = this.w;
        ellipse.h = this.h;
        ellipse.offsetX = this.offsetX;
        ellipse.offsetY = this.offsetY;
        ellipse.strokeColor = this.strokeColor;
        ellipse.fillColor = this.fillColor;
        ellipse.lineWidth = this.lineWidth;
        ellipse.HighLight_State = this.HighLight_State;
        return ellipse;
    }
};
PATHBUBBLES.Shape.Triangle = function (x, y, w, h, strokeColor, fillColor, lineWidth) {
    this.type = "Triangle";
    this.x = x || 0;
    this.y = y || 0;
    this.w = w || 10;
    this.h = h || 10;
    this.l = this.w;
    this.strokeColor = strokeColor || "#0000ff";
    this.fillColor = fillColor || "#FFE2B7";
    this.lineWidth = lineWidth || 1;
    this.HighLight_State = false;
};
PATHBUBBLES.Shape.Triangle.prototype = {
    constructor: PATHBUBBLES.Shape.Ellipse,
    draw: function (ctx, scale) {
        var x = this.x + this.offsetX;
        var y = this.y + this.offsetY;
//        ctx.save();	// save the context so we don't mess up others
        ctx.fillStyle = this.fillColor;
        ctx.strokeStyle = this.strokeColor;
        ctx.lineWidth = this.lineWidth * scale;
//        ctx.setLineDash([0]);
//        ctx.lineDashOffset = 0;
        var h = this.l * (Math.sqrt(3) / 2);   //h is the height of the triangle
        ctx.beginPath();
        if (scale == 1) {
            ctx.moveTo(x * scale, (y - h / 2) * scale);
            ctx.lineTo((x - this.l / 2) * scale, (y + h / 2) * scale);
            ctx.lineTo((x + this.l / 2) * scale, (y + h / 2) * scale);
            ctx.lineTo(x * scale, (y - h / 2) * scale);
        }
        else {
            ctx.moveTo(x * scale + viewpoint.x, (y - h / 2) * scale);
            ctx.lineTo((x - this.l / 2) * scale + viewpoint.x, (y + h / 2) * scale);
            ctx.lineTo((x + this.l / 2) * scale + viewpoint.x, (y + h / 2) * scale);
            ctx.lineTo(x * scale + viewpoint.x, (y - h / 2) * scale);
        }

        ctx.fill();
        ctx.stroke();
        ctx.closePath();
//        ctx.restore();	// restore context to what it was on entry
        if (this.HighLight_State) {
            this.drawStroke(ctx, scale);
        }
    },
    drawStroke: function (ctx, scale) {
        var x = this.x + this.offsetX;
        var y = this.y + this.offsetY;
        var h = this.l * (Math.sqrt(3) / 2);
//        ctx.save();	// save the context so we don't mess up others
        ctx.strokeStyle = "#ffff00";
        ctx.lineWidth = this.lineWidth * scale;
        ctx.beginPath();
        if (scale == 1) {
            ctx.moveTo(x * scale, (y - h / 2) * scale);
            ctx.lineTo((x - this.l / 2) * scale, (y + h / 2) * scale);
            ctx.lineTo(x * scale + this.l / 2, (y + h / 2) * scale);
            ctx.lineTo(x * scale, (y - h / 2) * scale);
        }
        else {
            ctx.moveTo(x * scale + viewpoint.x, (y - h / 2) * scale);
            ctx.lineTo((x - this.l / 2) * scale + viewpoint.x, (y + h / 2) * scale);
            ctx.lineTo(x * scale + this.l / 2 + viewpoint.x, (y + h / 2) * scale);
            ctx.lineTo(x * scale + viewpoint.x, (y - h / 2) * scale);
        }
        ctx.stroke();
        ctx.closePath();
//        ctx.restore();	// restore context to what it was on entry
    },
    contains: function (mx, my) {
        var x = this.x + this.offsetX;
        var y = this.y + this.offsetY;
        var h = this.l * (Math.sqrt(3) / 2);
        var minX = x - this.l / 2;
        var maxX = x + this.l / 2;
        var minY = y - h / 2;
        var maxY = y + h / 2;
        return  (minX <= mx) && (maxX >= mx) &&
            (minY <= my) && (maxY >= my);
    },
    clone: function () {
        return new PATHBUBBLES.Shape.Triangle(this);
    }
};

PATHBUBBLES.Shape.Hexahedron = function (x, y, w, h, strokeColor, fillColor, lineWidth) {
    this.type = "Hexahedron";     //for dna
    this.x = x || 0;
    this.y = y || 0;
    this.w = w || 40;
    this.h = h || 15;
    this.l = this.w;
    this.strokeColor = strokeColor || "#C2C2C2";
    this.fillColor = fillColor || "#D6EAAC";
    this.lineWidth = lineWidth || 1;
    this.HighLight_State = false;
};
PATHBUBBLES.Shape.Hexahedron.prototype = {
    constructor: PATHBUBBLES.Shape.Hexahedron,
    draw: function (ctx, scale) {
        var x = this.x + this.offsetX;
        var y = this.y + this.offsetY;
        var w = this.w;
        var h = this.h;
//        ctx.save();	// save the context so we don't mess up others
        ctx.fillStyle = this.fillColor;
        ctx.strokeStyle = this.strokeColor;
        ctx.lineWidth = this.lineWidth * scale;
//        ctx.setLineDash([0]);
//        ctx.lineDashOffset = 0;

        var mx1 = x + w / 4;
        var mx2 = x + w * 3 / 4;
        var my1 = y + h / 3;
        var my2 = y + h * 2 / 3;
        ctx.beginPath();
        if (scale == 1) {
            ctx.moveTo(x * scale, my1 * scale);
            ctx.lineTo(x * scale, my2 * scale);
            ctx.lineTo(mx1 * scale, (y + h) * scale);
            ctx.lineTo(mx2 * scale, (y + h) * scale);
            ctx.lineTo((x + w) * scale, my2 * scale);
            ctx.lineTo((x + w) * scale, my1 * scale);
            ctx.lineTo(mx2 * scale, y * scale);
            ctx.lineTo(mx1 * scale, y * scale);
        }
        else {
            ctx.moveTo(x * scale + viewpoint.x, my1 * scale);
            ctx.lineTo(x * scale + viewpoint.x, my2 * scale);
            ctx.lineTo(mx1 * scale + viewpoint.x, (y + h) * scale);
            ctx.lineTo(mx2 * scale + viewpoint.x, (y + h) * scale);
            ctx.lineTo((x + w) * scale + viewpoint.x, my2 * scale);
            ctx.lineTo((x + w) * scale + viewpoint.x, my1 * scale);
            ctx.lineTo(mx2 * scale + viewpoint.x, y * scale);
            ctx.lineTo(mx1 * scale + viewpoint.x, y * scale);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

//        ctx.restore();	// restore context to what it was on entry
        if (this.HighLight_State) {
            this.drawStroke(ctx, scale);
        }
    },
    drawStroke: function (ctx, scale) {
        var x = this.x + this.offsetX;
        var y = this.y + this.offsetY;

//        ctx.save();	// save the context so we don't mess up others
        ctx.strokeStyle = "#ffff00";
        ctx.lineWidth = this.lineWidth * scale;
        var w = this.w;
        var h = this.h;
        var mx1 = x + w / 4;
        var mx2 = x + w * 3 / 4;
        var my1 = y + h / 3;
        var my2 = y + h * 2 / 3;
        ctx.beginPath();
        if (scale == 1) {
            ctx.moveTo(x * scale, my1 * scale);
            ctx.lineTo(x * scale, my2 * scale);
            ctx.lineTo(mx1 * scale, (y + h) * scale);
            ctx.lineTo(mx2 * scale, (y + h) * scale);
            ctx.lineTo((x + w) * scale, my2 * scale);
            ctx.lineTo((x + w) * scale, my1 * scale);
            ctx.lineTo(mx2 * scale, y * scale);
            ctx.lineTo(mx1 * scale, y * scale);
        }
        else {
            ctx.moveTo(x * scale + viewpoint.x, my1 * scale);
            ctx.lineTo(x * scale + viewpoint.x, my2 * scale);
            ctx.lineTo(mx1 * scale + viewpoint.x, (y + h) * scale);
            ctx.lineTo(mx2 * scale + viewpoint.x, (y + h) * scale);
            ctx.lineTo((x + w) * scale + viewpoint.x, my2 * scale);
            ctx.lineTo((x + w) * scale + viewpoint.x, my1 * scale);
            ctx.lineTo(mx2 * scale + viewpoint.x, y * scale);
            ctx.lineTo(mx1 * scale + viewpoint.x, y * scale);
        }
        ctx.closePath();
        ctx.stroke();
//        ctx.restore();	// restore context to what it was on entry
    },
    contains: function (mx, my) {
        var x = this.x + this.offsetX;
        var y = this.y + this.offsetY;
        return  (x <= mx) && (x + this.w >= mx) && (y <= my) && (y + this.h >= my);
    },
    clone: function () {
        return new PATHBUBBLES.Shape.Hexahedron(this);
    }
};

PATHBUBBLES.Shape.PathPoint = function (id, pos, x, y, type, x2, y2) {
    this.bubbleId = id;
    this.bubblePos = pos;
    this.x = x;
    this.y = y;
    this.type = type;
    this.x2 = x2; //The other part of point is used for quadraticCurveTo
    this.y2 = y2;
    this.r = 10; //just for corner
};
//if type
//QCT: quadraticCurveTo(r, y, r, y + this.cornerRadius);
//LT: ctx.lineTo(r - this.cornerRadius, y);
PATHBUBBLES.Shape.Path = function (strokeColor, fillColor, lineWidth) {
    this.lineWidth = lineWidth || 10;
    this.strokeColor = strokeColor || "#000000";
    this.fillColor = fillColor || "#ffffff";
    this.points = [];

    this.offsetX = 0;
    this.offsetY = 0;
};
PATHBUBBLES.Shape.Path.prototype = {
    draw: function (ctx, scale) {
        //ctx.save();	// save the context so we don't mess up others
        ctx.fillStyle = this.fillColor;
        ctx.strokeStyle = this.strokeColor;
        ctx.lineWidth = this.lineWidth * scale;
//        ctx.setLineDash([0]);
//        ctx.lineDashOffset = 0;
        // beginPath
        if (this.points.length > 0) {
            ctx.beginPath();
            if (scale == 1) {
                // move to the beginning point of this path
                ctx.moveTo((this.points[0].x + this.offsetX) * scale, (this.points[0].y + this.offsetY) * scale);
                // draw lines to each point on the path
                for (var pt = 1; pt < this.points.length; pt++) {
                    var point = this.points[pt];
                    if (point.type === "LT") {
                        ctx.lineTo((point.x + this.offsetX) * scale, (point.y + this.offsetY) * scale);
                    }
                    else if (point.type === "QCT") {
                        ctx.quadraticCurveTo((point.x + this.offsetX) * scale, (point.y + this.offsetY) * scale, (point.x2 + this.offsetX) * scale, (point.y2 + this.r + this.offsetY) * scale);
                    }
                }
            }
            else {
                // move to the beginning point of this path
                ctx.moveTo((this.points[0].x + this.offsetX) * scale + viewpoint.x, (this.points[0].y + this.offsetY) * scale);
                // draw lines to each point on the path
                for (var pt = 1; pt < this.points.length; pt++) {
                    var point = this.points[pt];
                    if (point.type === "LT") {
                        ctx.lineTo((point.x + this.offsetX) * scale + viewpoint.x, (point.y + this.offsetY) * scale);
                    }
                    else if (point.type === "QCT") {
                        ctx.quadraticCurveTo((point.x + this.offsetX) * scale + viewpoint.x, (point.y + this.offsetY) * scale, (point.x2 + this.offsetX) * scale + viewpoint.x, (point.y2 + this.r + this.offsetY) * scale);
                    }
                }
            }

            ctx.closePath();
            ctx.clip();
            ctx.fill();
            // stroke this path
            ctx.stroke();

            //ctx.restore();	// restore context to what it was on entry
        }
    },
    addPoints: function (point) {
        var index = this.points.indexOf(point);
        if (index === -1) {
            this.points.push(point);
        }
    }
};




