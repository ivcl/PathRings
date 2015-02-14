/**
 * @author      Yongnan
 * @version     1.0
 * @time        9/29/2014
 * @name        PathBubbles_Avtivation
 */
PATHBUBBLES.Activation = function (id, beginNode, endNode) {
	PATHBUBBLES.Object2D.call(this);
  this.type = "A";    //  ACTIVATION  =======>   A
  this.id = id || 0;
  this.beginNode = beginNode;
  this.endNode = endNode;

  this.dotRadius = 2;
  this.dotLimitRadius = 0.5;
  this.fillColor = "#2ca25f";
  //Complex is contained in the Compartment and the Compartment is contained in the Bubble
  //So Offset = offsetBubble + offsetCompartment
};
PATHBUBBLES.Activation.prototype = $.extend(Object.create(PATHBUBBLES.Object2D.prototype), {
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

    //var dotCount = Math.ceil((this.dotRadius - this.dotLimitRadius ) / 0.2);
    var dx = x2 - x1;
    var dy = y2 - y1;
    var distance = Math.sqrt(dx * dx + dy * dy);
    var dotCount = Math.ceil(distance / 10 * (this.dotRadius - this.dotLimitRadius )) + 3;
    var spaceX = dx / (dotCount - 1);
    var spaceY = dy / (dotCount - 1);
    var newX = x1;
    var newY = y1;
    for (var i = 0; i < dotCount; i++) {
      this.drawDot(newX, newY, (this.dotRadius - this.dotLimitRadius ) * (1 - i / dotCount) + this.dotLimitRadius, this.fillColor, ctx);
      newX += spaceX;
      newY += spaceY;
    }
    this.drawDot(x1, y1, this.dotLimitRadius, "red", ctx);
    this.drawDot(x2, y2, this.dotLimitRadius, "red", ctx);
  },
  drawDot: function (x, y, dotRadius, dotColor, ctx) {
		//        ctx.save();	// save the context so we don't mess up others
    ctx.beginPath();
    ctx.arc(x, y, dotRadius, 0, 2 * Math.PI, false);
    ctx.fillStyle = dotColor;
    ctx.fill();
		//        ctx.restore();	// restore context to what it was on entry
  }
});
