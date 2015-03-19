/**
 * @author      Yongnan
 * @version     1.0
 * @time        9/17/2014
 * @name        PathBubble_groups
 *              Attempt to put the bubbles from left to right
 */

var $P = PATHBUBBLES;

$P.BubbleGroup = $P.defineClass(
	$P.Object2D,
	function  BubbleGroup(child) {
		$P.Object2D.call(this);
		if (child) {
			this.strokeStyle = child.strokeStyle;
			this.x = child.x;
			this.y = child.y;
			this.add(child);}},
	{
		get centerX() {
			this.updateSize();
			return this.x + this.w * 0.5;},

		add: function(child, index) {
			$P.Object2D.prototype.add.call(this, child, index);
			child.setStrokeStyle(this.strokeStyle);
			this.arrangeChildren();
			return;},
		remove: function(child) {
			child.neighbors.left = null;
			child.neighbors.right = null;
			$P.Object2D.prototype.remove.call(this, child);
			if (0 == this.children.length) {this.delete();}
			else {
				//this.x += child.w * 0.5;
				this.arrangeChildren();}},

		/**
		 * Gets the index which an object should be added at, based on its
		 * position.
		 * @param {number} x - the x position
		 * @param {number} y - the y position
		 * @returns {number} - the index the object should be added at
		 */
		getAddIndex: function(x, y) {
			var index;
			$P.findFirst(this.children, function(child, i) {
				var xl = child.x,
						xm = xl + child.w * 0.5,
						xr = xl + child.w;
				if (xl <= x && x <= xm) {
					index = i;
					return i;}
				if (xm <= x && x <= xr) {
					index = i + 1;
					return i + 1;}
				return null;});
			return index;},

		contains: function(x, y) {
			return this.children.some(function(child) {
				return child.contains(x, y);});},

		receiveEvent: function(event) {
			if ('dragFinish' === event.name) {
				$P.state.scene.sendEvent({
					name: 'bubbleDragOnto', group: this, x: event.x, y: event.y});
				return true;}
			if ('bubbleDragOnto' == event.name &&
					event.group !== this &&
					this.contains(event.x, event.y)) {
				var index = this.getAddIndex(event.x, event.y);
				event.group.children.forEach(function(child) {
					this.add(child, index);
					++index;
				}.bind(this));
				return true;}
			return $P.Object2D.prototype.receiveEvent.call(this, event);},

		/**
		 * Recalculate size based on children.
		 */
		updateSize: function() {
			var child, i;
			if (0 == this.children.length) {return;}
			child	= this.children[0];
			this.x = child.x;
			this.y = child.y;
			this.w = child.w;
			this.h = child.h;
			for (i = 1; i < this.children.length; ++i) {
				child = this.children[i];
				this.h = Math.max(this.h, child.h);
				this.w += child.w;
				this.w += this.children[i - 1].lineWidth * 0.5;}},
		arrangeChildren: function(){
			var x = this.x,
					grouped = this.children.length > 1,
					i;
			for (i = 0; i < this.children.length; ++i) {
				this.children[i].neighbors.left = this.children[i - 1] || null;
				this.children[i].neighbors.right = this.children[i + 1] || null;}
			this.children.forEach(function(child) {
				child.move(x, this.y);
				if (child.groupButton) {child.groupButton.setHighlighted(grouped);}
				x += child.w + child.lineWidth * 0.5;
			}.bind(this));
		}
	}
);
