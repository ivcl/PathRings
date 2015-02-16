/**
 * @author      Yongnan
 * @version     1.0
 * @time        9/16/2014
 * @name        PathBubble_Shape
 */
var $P = PATHBUBBLES;

$P.Shape = $P.defineClass(
	$P.Object2D,
	function(config) {$P.Object2D.call(this, config);},
	{});

$P.Shape.Circle = $P.defineClass(
	$P.Shape,
	/**
	 * @param {number} config.x
	 * @param {number} config.y
	 * @param {number} config.r
	 */
	function(config) {
		var highlight;

		config.x = config.x || 0;
		config.y = config.y || 0;
		$P.Shape.call(this, config);

		this.r = config.r || 10;
		this.strokeStyle = config.strokeStyle || '#00f';
		this.fillStyle = config.fillStyle || '#FEC';
		this.lineWidth = config.lineWidth || 1;

		highlight = config.highlight || {};
		this.highlight = {
			strokeStyle: highlight.strokeStyle || '#ff0',
			lineWidth: highlight.lineWidth || this.lineWidth * 2};},
	{
		drawSelf: function (ctx, scale) {
			var x = this.x * scale,
					y = this.y * scale,
					r = this.r * scale;

			ctx.fillStyle = this.fillStyle;
			ctx.strokeStyle = this.strokeStyle;
			ctx.lineWidth = this.lineWidth;

			ctx.beginPath();
			ctx.arc(x, y, r, 0, 2 * Math.PI, false);
			ctx.fill();
			ctx.stroke();

			if (this.highlighted) {
				ctx.strokeStyle = this.highlight.strokeStyle;
				ctx.lineWidth = this.highlight.lineWidth;
				ctx.stroke();}
		},
		contains: function (x, y) {
			var dx = x - this.x,
					dy = y - this.y;
			return  dx * dx + dy * dy <= this.r * this.r;}
	});

$P.Shape.Rectangle = $P.defineClass(
	$P.Shape,
	/**
	 * @param {number} config.x
	 * @param {number} config.y
	 * @param {number} config.w
	 * @param {number} config.h
	 */
	function Rectangle(config) {
		var highlight;

		config.x = config.x || 0;
		config.y = config.y || 0;
		$P.Shape.call(this, config);
		this.w = config.w || 100;
		this.h = config.h || 100;
		this.cornerRadius = config.cornerRadius || 0;
		this.strokeStyle = config.strokeStyle || '#00f';
		this.fillStyle = config.fillStyle || '#FEC';
		this.lineWidth = config.lineWidth || 1;

		highlight = config.highlight || {};
		this.highlight = {
			strokeStyle: highlight.strokeStyle || '#ff0',
			lineWidth: highlight.lineWidth || this.lineWidth * 2};},
	{
		/**
		 * Sets this object as the current path of the context.
		 * @param {CanvasRenderingContext2D} context - the rendering context
		 * @param {number} scale - a scaling constant
		 */
		doPath: function(context, scale) {
			/*
			var x1 = (this.x - this.lineWidth / 2 - 1) * scale,
					y1 = (this.y - this.lineWidth / 2 - 1) * scale,
					x2 = x1 + (this.w + this.lineWidth + 2) * scale,
					y2 = y1 + (this.h + this.lineWidth + 2) * scale,
					r = this.cornerRadius * scale;
			 */
			var x1 = this.x * scale,
					y1 = this.y * scale,
					x2 = x1 + this.w * scale,
					y2 = y1 + this.h * scale,
					r = this.cornerRadius * scale;
			context.beginPath();
			context.moveTo(x1 + r, y1);
			context.lineTo(x2 - r, y1);
			context.quadraticCurveTo(x2, y1, x2, y1 + r);
			context.lineTo(x2, y2 - r);
			context.quadraticCurveTo(x2, y2, x2 - r, y2);
			context.lineTo(x1 + r, y2);
			context.quadraticCurveTo(x1, y2, x1, y2 - r);
			context.lineTo(x1, y1 + r);
			context.quadraticCurveTo(x1, y1, x1 + r, y1);},
		/**
		 * Expands this object by n pixels in each direction, keeping its center the same.
		 * @param {number} n - the number of pixels to expand by
		 */
		expand: function(n) {
			this.x -= n;
			this.y -= n;
			this.w += n;
			this.h += n;},
		/**
		 * Expand the given edge by the given amount of pixels.
		 * @param {number} right - the amount to expand the right edge by
		 * @param {number} top - the amount to expand the top edge by
		 * @param {number} left - the amount to expand the left edge by
		 * @param {number} bottom - the amount to expand the bottom edge by
		 */
		expandEdges: function(right, top, left, bottom) {
			this.x -= left;
			this.y -= top;
			this.w += left + right;
			this.h += top + bottom;},
		drawSelf: function (ctx, scale) {
			this.doPath(ctx, scale);
			ctx.strokeStyle = this.strokeStyle;
			ctx.fillStyle = this.fillStyle;
			ctx.lineWidth = Math.round(this.lineWidth * scale);
			if ('none' !== this.fillStyle) {ctx.fill();}
			ctx.stroke();},
		contains: function (mx, my) {
			var x = this.x;
			var y = this.y;
			return  (x <= mx) && (x + this.w >= mx) && (y <= my) && (y + this.h >= my);},
		/**
		 * If a point is contained in this shape, given that this shape
		 * were expanded by a number of pixels horizontally and
		 * vertically.
		 * @param {number} x - the x location to test
		 * @param {number} y - the y location to test
		 * @param {number} expansion - the number of pixels to expand/contract by
		 * @returns {boolean} - if the point is contained
		 */
		expandedContains: function(x, y, expansion) {
			var xl = this.x - expansion * 0.5,
					xr = this.x + this.w + expansion * 0.5,
					yt = this.y - expansion * 0.5,
					yb = this.y + this.h + expansion * 0.5;
			return (xl <= x) && (x <= xr) && (yt <= y) && (y <= yb);},

		clone: function() {return new $P.Shape.Rectangle(this);}
	});

$P.Shape.Ellipse = function (x, y, w, h, strokeColor, fillColor, lineWidth) {
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
$P.Shape.Ellipse.prototype = {
  constructor: $P.Shape.Ellipse,
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
    var ellipse = new $P.Shape.Ellipse();
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
$P.Shape.Triangle = function (x, y, w, h, strokeColor, fillColor, lineWidth) {
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
$P.Shape.Triangle.prototype = {
  constructor: $P.Shape.Ellipse,
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
    return new $P.Shape.Triangle(this);
  }
};

$P.Shape.Hexahedron = function (x, y, w, h, strokeColor, fillColor, lineWidth) {
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
$P.Shape.Hexahedron.prototype = {
  constructor: $P.Shape.Hexahedron,
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
    return new $P.Shape.Hexahedron(this);
  }
};

$P.Shape.PathPoint = function (id, pos, x, y, type, x2, y2) {
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
$P.Shape.Path = function (strokeColor, fillColor, lineWidth) {
  this.lineWidth = lineWidth || 10;
  this.strokeColor = strokeColor || "#000000";
  this.fillColor = fillColor || "#ffffff";
  this.points = [];

  this.offsetX = 0;
  this.offsetY = 0;
};
$P.Shape.Path.prototype = {
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
      //ctx.clip();
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
