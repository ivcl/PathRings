/**
 * @author      Yongnan
 * @version     1.0
 * @time        9/16/2014
 * @name        PathBubble_scene
 */

var $P = PATHBUBBLES;

// The top level object container.
$P.Scene = $P.defineClass(
	null,
	function  Scene() {
		this.children = [];
		/**
		 * @member {$P.HtmlObject[]} htmlObjects - List of all created html objects.
		 */
		this.htmlObjects = [];
		/**
		 * @member {$P.HtmlObject[]} disabledPointerHtmlObjects - List of html objects which have had
		 * their pointer events disabled.
		 */
		this.disabledPointerHtmlObjects = [];
		/**
		 * @member links - List of all links between objects.
		 */
		this.links = [];},
	{
		/**
		 * Draws the scene to a canvas.
		 * @param {CanvasRenderingContext2D} context - the canvas context
		 * @param {number} scale - a scaling constant
		 */
		draw: function(context, scale) {
			var i;
			for (i = this.children.length - 1; i >= 0; --i) {
				this.children[i].draw(context, scale);}},

		/**
		 * Draws the links to a canvas.
		 * @param {CanvasRenderingContext2D} context - the canvas context
		 * @param {number} scale - a scaling constant
		 */
		drawLinks: function(context, scale) {
			var i;
			for (i = this.links.length - 1; i >= 0; --i) {
				this.links[i].draw(context, scale);}},

		/**
		 * Adds an object to this scene.
		 * @param {$P.Object2D} child - the added object
		 */
		add: function (child) {
			if (!(child instanceof $P.Object2D)) {
				console.error('$P.Object2D#add(', child, '): not an instance of Object2D');
				return;}
			child.removeFromParent();
			this.children.push(child);
			child.parent = this;
			child.onAdded(this);},

		/**
		 * Removes an object from the scene.
		 * @param {$P.Object2D} child - the child to remove
		 */
		remove: function (child) {
			var index = this.children.indexOf(child);
			if (-1 == index) {return;}

			child.onRemoved(this);
			this.children.splice(index, 1);
			child.parent = null;},

		/**
		 * Moves the specified child to the beginning of the children list.
		 * @param {PATHBUBBLES.Object2D} child - the child to move
		 */
		bringChildToFront: function(child) {
			var index = this.children.indexOf(child);
			if (-1 == index) {return;}
			this.children.splice(index, 1);
			this.children.splice(0, 0, child);
		},

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
		 * Sends an event to every object.
		 * @see $P.Object2D#handleEvent
		 * @param {*} event - The event type. Usually a string.
		 * @param {number} x - the x coordinate
		 * @param {number} y - the y coordinate
		 * @returns {?*} - the value returned by the event handler
		 */
		sendEvent: function(event) {
			return $P.or(this.children, $P.method('receiveEvent', event));},

		/**
		 * Removes and deletes all children.
		 */
		deleteAll: function() {
			this.children.slice(0).forEach(function(child) {child.delete();});
			this.children = [];
			this.links.slice(0).forEach(function(link) {link.delete();});
			this.links = [];},

		/**
		 * Adds an HtmlObject to the list.
		 * @param {$P.HtmlObject} object - the objcet to register.
		 */
		registerHtmlObject: function(object) {
			this.htmlObjects.push(object);},

		/**
		 * Removes an HtmlObject from the list.
		 * @param {$P.HtmlObject} object - the objcet to register.
		 */
		unregisterHtmlObject: function(object) {
			var i = this.htmlObjects.indexOf(object);
			if (-1 !== i) {this.htmlObjects.splice(i, 1);}},

		/**
		 * Disables pointer events for registered html objects.
		 */
		disableHtmlPointerEvents: function() {
			this.htmlObjects.forEach(function(object) {
				if (object.arePointerEventsEnabled()) {
					this.disabledPointerHtmlObjects.push(object);
					object.setPointerEventsEnabled(false);}}.bind(this));},

		/**
		 * Re-enables pointer events for objects which have previously been disabled.
		 */
		enableHtmlPointerEvents: function() {
			this.disabledPointerHtmlObjects.forEach(function(object) {
				if (!object.arePointerEventsEnabled()) {
					object.setPointerEventsEnabled(true);}}.bind(this));
			this.disabledPointerHtmlObjects = [];}

	});
