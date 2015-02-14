/**
 * @author      Yongnan
 * @version     1.0
 * @time        9/29/2014
 * @name        PathBubble_Arrow
 */
PATHBUBBLES.Arrow = function (id, beginNode, endNode) {
	PATHBUBBLES.Object2D.call(this);
  this.type = "J";  //ARROW     ===>   J
  this.id = id;
  this.beginNode = beginNode;
  this.endNode = endNode;
  this.fillColor = "#C2C2C2";
};
PATHBUBBLES.Arrow.prototype = $.extend(Object.create(PATHBUBBLES.Object2D.prototype), {

  draw: function (ctx) {
    if (this.beginNode.type === "B" || this.beginNode.type === "K") {           //because those two has already fixed to center
      var x1 = this.beginNode.offsetX + this.beginNode.x;
      var y1 = this.beginNode.offsetY + this.beginNode.y;
    }
    else {
      var x1 = this.beginNode.offsetX + this.beginNode.shape.w / 2 + this.beginNode.x;
      var y1 = this.beginNode.offsetY + this.beginNode.shape.h / 2 + this.beginNode.y;
    }
    if (this.endNode.type === "B" || this.endNode.type === "K") {
      var x2 = this.endNode.offsetX + this.endNode.x;
      var y2 = this.endNode.offsetY + this.endNode.y;
    }
    else {
      var x2 = this.endNode.offsetX + this.endNode.shape.w / 2 + this.endNode.x;
      var y2 = this.endNode.offsetY + this.endNode.shape.h / 2 + this.endNode.y;
    }
		//        ctx.save();	// save the context so we don't mess up others
    ctx.fillStyle = this.fillColor;
    ctx.beginPath();
    if (Math.abs(y1 - y2) > Math.abs(x1 - x2)) {
      ctx.moveTo(x1 - 2.5, y1);
      ctx.lineTo(x1 + 2.5, y1);
      ctx.lineTo(x2, y2);
    }
    else {
      ctx.moveTo(x1, y1 - 2.5);
      ctx.lineTo(x1, y1 + 2.5);
      ctx.lineTo(x2, y2);
    }
    ctx.fill();
    ctx.closePath();
		//        ctx.restore();	// restore context to what it was on entry
  }
});
