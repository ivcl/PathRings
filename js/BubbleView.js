/**
 * @author      Yongnan
 * @version     1.0
 * @time        9/29/2014
 * @name        PathBubble_BubbleView
 */

(function($P){
	'use strict';

	/**
	 * @constructor
	 */
	$P.BubbleView = $P.defineClass(
		$P.Object2D,
		function  BubbleView(config) {
			PATHBUBBLES.Object2D.call(this);
			this.type = 'BubbleView';
			this.compartments = [];
			// Fixed size 500x500
			this.x = config.x || 0;
			this.y = config.y || 0;
			this.h = config.h || 500;
			this.w = config.w || 500;
			this.inset = config.inset || 10;
			this.shape = new $P.Shape.Rectangle(
				this, this.x, this.y, this.w, this.h, null, null, 10, config.cornerRadius);
			this.childrenClippingShape = this.shape.clone();
			// Convenience list of all nodes.
			this.nodes = [];
			// Arrow is divide into three type, Black Arrow, Green Activation, Yellow Inhibition.
			this.arrows = [];
			this.inhibitions = [];
			this.activations = [];

			if (config.parent) {config.parent.add(this, config.position);}},
		{
			setCenterCoordinate: function (x, y, w, h) {
				var oldx = x;
				var oldy = y;
				this.w = w;
				this.h = h;
				var OffsetX = -oldx;
				var OffsetY = -oldy;
				this.x = this.parent.w / 2 - this.w / 2;
				this.y = this.parent.h / 2 - this.h / 2;
				this.offsetX = 0;
				this.offsetY = 0;

				for (var i = 0; i < this.compartments.length; ++i) {
					this.compartments[i].x += OffsetX;
					this.compartments[i].y += OffsetY;
				}
				return;
			},
			setOffset: function () {
				if (this.parent !== undefined) {
					this.childrenClippingShape.w = this.parent.shape.w - this.inset * 2;
					this.childrenClippingShape.h = this.parent.shape.h - this.inset * 2;
				}
				else {
					this.offsetX = 0;
					this.offsetY = 0;
				}
				this.shape.offsetX = this.offsetX;
				this.shape.offsetY = this.offsetY;
				this.shape.x = this.x;
				this.shape.y = this.y;
				this.shape.w = this.w;
				this.shape.h = this.h;
			},

			// Want to draw children in specific order, so override directly.
			draw: function (ctx, scale) {
				this.setOffset();

				ctx.save();
				this.childrenClippingShape.doPath(ctx, scale);
				ctx.clip();

				if (this.compartments.length > 0) {
					this.drawCompartment(ctx, scale);
				}

				//this.shape.draw(ctx, scale);

				if (this.arrows.length > 0) {
					this.drawArrow(ctx);
				}
				if (this.activations.length > 0) {
					this.drawActivation(ctx);
				}
				if (this.inhibitions.length > 0) {
					this.drawInhibition(ctx);
				}
				if (this.compartments.length > 0) {
					this.drawCompartmentElements(ctx);
				}

				ctx.restore();
			},

			addArrow: function (id, beginNode, endNode) {
				var arrow = new PATHBUBBLES.Arrow(id, beginNode, endNode);
				this.add(arrow);
				this.arrows.push(arrow);
			},
			drawArrow: function (ctx) {
				for (var i = 0; i < this.arrows.length; i++) {
					this.arrows[i].draw(ctx);
				}
			},
			addInhibition: function (id, beginNode, endNode) {
				var inhibition = new PATHBUBBLES.Inhibition(id, beginNode, endNode);
				this.add(inhibition);
				this.inhibitions.push(inhibition);
			},
			drawInhibition: function (ctx) {
				for (var i = 0; i < this.inhibitions.length; i++) {
					this.inhibitions[i].draw(ctx);
				}
			},
			addActivation: function (id, beginNode, endNode) {
				var activation = new PATHBUBBLES.Activation(id, beginNode, endNode);
				this.add(activation);
				this.activations.push(activation);
			},
			drawActivation: function (ctx) {
				for (var i = 0; i < this.activations.length; i++) {
					this.activations[i].draw(ctx);
				}
			},
			addCompartment: function (compartmentId, x, y, w, h, name) {
				var compartment = new PATHBUBBLES.Biomolecule.Compartment(this, compartmentId, x * this.w, y * this.h, w * this.w, h * this.h, name);
				this.add(compartment);
				this.compartments.push(compartment);

			},
			drawCompartment: function (ctx, scale) {
				for (var i = 0; i < this.compartments.length; i++) {
					this.compartments[i].draw(ctx, scale);    //This is the relative position (this.x, this.y) for all the compartment inside the bubble
				}
			},  //As Arrows should be draw on the lowest layer, so I first draw the arrow and then draw the other elements by dividing the drawCompartment function into two parts:  drawCompartment and  drawCompartmentElements
			drawCompartmentElements: function (ctx) {
				for (var i = 0; i < this.compartments.length; i++) {
					this.compartments[i].drawElements(ctx);
				}
			},
			// We never want to actually collide with anything.
			contains: function (x, y) {return false;}
		});
})(PATHBUBBLES);
