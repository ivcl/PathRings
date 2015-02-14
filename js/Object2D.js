/**
 * @author      Yongnan
 * @version     1.0
 * @time        9/16/2014
 * @name        PathBubble_object2D
 */

var $P = PATHBUBBLES;

$P.Object2D = $P.defineClass(
	null,
	/**
	 * @classdesc TODO
	 * @constructor
	 * @param {number} config.x - the x position
	 * @param {number} config.y - the y position
	 * @param {($P.Object2D|$P.Scene)} config.parent - The parent
	 * object. This will call the parent's add function.
	 */
	function Object2D(config) {
		config = config || {};

		/** @member {number} id - unique object id */
		this.id = $P.Object2D.IdCount++;
		/** @member {String} name - the object name */
		this.name = '';
		/** @member {(PATHBUBBLES.Object2D|PATHBUBBLES.Scene)} */
		this.parent = undefined;
		/** @member {PATHBUBBLES.Object2D[]} */
		this.children = [];
		/** @member {?number} x - x position on the screen */
		this.x = config.x || 0;
		/** @member {?number} y - y position on the screen */
		this.y = config.y || 0;
		/** @member {?number} w - width on the screen */
		this.w = config.w || 0;
		/** @member {?number} h - height on the screen */
		this.h = config.h || 0;
		/** @member {boolean} highlighted - if this object is highlighted */
		this.highlighted = config.highlighted || false;

		if (config.parent) {config.parent.add(this);}
	},
	{
		/**
		 * Gets the closest parent that is a Scene, or null if not present.
		 * @return {?PATHBUBBLES.Scene}
		 */
		getScene: function() {
			var object = this;
			while (object && !(object instanceof $P.Scene)) {
				object = object.parent;}
			return object || null;},

		/**
		 * Adds an object as a child.
		 * Will remove that object from an existing parent.
		 * @param {PATHBUBBLES.Object2D} object - the object to add
		 * @param {?number} [position] -
		 * A number specifies an integer position.
		 * Defaults to the end of the list.
		 * @returns {?number} - the index at which the object was placed.
		 */
		add: function (child, position) {
			var scene;

			if (!(child instanceof PATHBUBBLES.Object2D)) {
				console.error('PATHBUBBLES.Object2D#add(', child, '):  Added object is not an Object2D');
				return null;}

			if (child === this) {
				console.error('PATHBUBBLES.Object2D#add(:', child, "):  Can't have self as a child.");
				return null;}

			child.removeFromParent();

			if (position !== undefined) {
				this.children.splice(position, 0, child);}
			else {
				position = this.children.length;
				this.children.push(child);}

			child.parent = this;
			child.onAdded(this);

			if ($P.state) {$P.state.markDirty();}
			return position;
		},

		/**
		 * Called when this object is added to a parent.
		 * @abstract
		 * @param {($P.Object2D|$P.Scene)} parent - the parent object
		 */
		onAdded: function(parent) {},

		/**
		 * Removes an object by identity.
		 * @param {PATHBUBBLES.Object2D} object - the object to remove
		 * @returns {boolean} if the object was removed
		 */
		remove: function (object) {
			var index = this.children.indexOf(object);
			if (-1 == index) {return false;}

			object.parent = undefined;
			this.children.splice(index, 1);
			object.onRemoved(this);

			$P.state.markDirty();
			return true;},

		/**
		 * Called when this object is removed from a parent.
		 * @abstract
		 */
		onRemoved: function(parent) {},

		/**
		 * Remove this object from its parent.
		 * @returns {boolean} if this object had a parent before this call.
		 */
		removeFromParent: function() {
			if (this.parent) {
				this.parent.remove(this);
				return true;}
			return false;},

		/**
		 * Recursively calls delete for this and its children.
		 */
		delete: function() {
			if (this.deleted) {return;}
			$P.state.markDirty();
			this.deleted = true;
			this.children.slice(0).forEach(function(child) {child.delete();});
			this.onDelete();
			this.removeFromParent();},

		/**
		 * Called when this object is deleted.
		 */
		onDelete: function() {},

		/**
		 * Recursively brings this object to the front.
		 */
		bringToFront: function() {
			var parent = this.parent,
					child = this;
			while (parent) {
				parent.bringChildToFront(child);
				child = parent;
				parent = parent.parent;}},

		/**
		 * Moves the specified child to the beginning of the children list.
		 * @param {PATHBUBBLES.Object2D} child - the child to move
		 */
		bringChildToFront: function(child) {
			var index = this.children.indexOf(child);
			if (-1 == index) {return;}
			this.children.splice(index, 1);
			this.children.splice(0, 0, child);},

		/**
		 * Moves the specified child to the end of the children list.
		 * @param {PATHBUBBLES.Object2D} child - the child to move
		 */
		sendChildToBack: function(child) {
			var index = this.children.indexOf(child);
			if (-1 == index) {return;}
			this.children.splice(index, 1);
			this.children.push(child);},

		/**
		 * Called when this object is moved or resized. For child classes to
		 * add to.
		 */
		onPositionChanged: function(dx, dy, dw, dh) {
			$P.state.markDirty();
			this.children.forEach(function(child) {child.onParentPositionChanged(dx, dy, dw, dh);});},

		/**
		 * Called when this object's parent is moved or resized. For child
		 * classes to add to.
		 */
		onParentPositionChanged: function(dx, dy, dw, dh) {
			this.translate(dx, dy, dw, dh);},

		/**
		 * Draws the object and children to the screen.
		 * @see drawSelf
		 * @param {CanvasRenderingContext2D} context - the drawing context
		 * @param {number} scale - scale multiplier for drawing
		 */
		draw: function(context, scale) {
			var i;
			this.drawSelf(context, scale);
			if (this.childrenClippingShape) {
				context.save();
				this.childrenClippingShape.doPath(context, scale);
				context.clip();}
			for (i = this.children.length - 1; i >= 0; --i) {
				this.children[i].draw(context, scale);}
			if (this.childrenClippingShape) {
				context.restore();}
		},

		/**
		 * Draws just this object. For child classes to override.
		 * @see draw
		 * @param {CanvasRenderingContext2D} context - the drawing context
		 * @param {number} scale - scale multiplier for drawing
		 */
		drawSelf: function(context, scale) {},

		/**
		 * Sends an event to this object, which may or may not handle it.
		 * First passes the event to its children in order to see if they
		 * want to handle it.
		 * @param {*} event - The event.
		 * @returns {?$P.Object2D} - the object which handled the event
		 */
		receiveEvent: function(event) {
			return $P.or(this.children, $P.method('receiveEvent', event));},

		/**
		 * Moves this object by the given amount.
		 * @param {?number} dx - the change in x
		 * @param {?number} dy - the change in y
		 * @param {?number} dw - the change in w
		 * @param {?number} dh - the change in h
		 */
		translate: function(dx, dy, dw, dh) {
			dx = dx || 0;
			dy = dy || 0;
			dw = dw || 0;
			dh = dh || 0;
			this.x += dx;
			this.y += dy;
			this.w += dw;
			this.h += dh;
			this.onPositionChanged(dx, dy, dw, dh);},

		/**
		 * Moves this object to the given position.
		 * @param {?number} x - the x position
		 * @param {?number} y - the y position
		 * @param {?number} w - the width
		 * @param {?number} h - the height
		 */
		move: function(x, y, w, h) {
			x = x || this.x;
			y = y || this.y;
			w = w || this.w;
			h = h || this.h;
			var dx = x - this.x,
					dy = y - this.y,
					dw = w - this.w,
					dh = h - this.h;
			this.x = x;
			this.y = y;
			this.w = w;
			this.h = h;
			this.onPositionChanged(dx, dy, dw, dh);}
	});


$P.Object2D.IdCount = 0;
$P.Object2D.pointInRectangle = function(x, y, left, top, width, height) {
	return left <= x && x <= left + width && top <= y && y <= top + height;
};
$P.Object2D.pointInCircle = function(x, y, center_x, center_y, radius) {
	var dx = center_x - x,
			dy = center_y - y;
	return dx * dx + dy * dy <= radius * radius;
};
