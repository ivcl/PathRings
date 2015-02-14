var $P = PATHBUBBLES;

$P.Canvas = $P.defineClass(
	null,
	/**
	 * Creates a wrapper object for a canvas element.
	 * @param {HtmlCanvasElement} config.element - the canvas element
	 * @param {$P.Scene} config.scene - the collection of objects to draw to the canvas
	 * @param {number} [config.scale=1] - the scaling value
	 * @constructor
	 * @classdesc Manages and draws to a canvas. Should be subclassed for a specific canvas.
	 */
	function(config) {
		this.html = config.element;
		this.scene = config.scene;

		// Make event listeners call method of same name.
		['mousedown', 'mouseup', 'mousemove']
			.forEach(function(name) {
				this.html.addEventListener(name, function(event) {
					var mouse = this.getMouseLocation(event);
					this[name](event, mouse.x, mouse.y);
				}.bind(this));
			}.bind(this));

		/**
		 * @member {CanvasRenderingContext2D} context - the drawing context
		 */
		this.context = this.html.getContext('2d');

		/**
		 * @member {number} scale - the scaling factor for drawing
		 */
		this.scale = config.scale || 1;

		/**
		 * @member {boolean} needsRedraw - if this canvas needs to be redrawn
		 */
		this.needsRedraw = true;},
	{
		/**
		 * Sets the cursor style.
		 * @param {String} type - the cursor type name
		 */
		setCursor: function(type) {this.html.style.cursor = type;},
		/**
		 * Gets the absolute mouse location of an event.
		 */
		getMouseLocation: function(event) {
			var location = this.getLocation(),
					x = event.pageX - location.x,
					y = event.pageY - location.y;
			return {x: x, y: y};
		},
		/**
		 * Gets the x and y location of this canvas.
		 * @returns {Object.<x: number, y: number>} - the canvas location
		 */
		getLocation: function() {
			var box = this.html.getBoundingClientRect(),
					x = box.left,
					y = box.top,
					parent = this.html.offsetParent;
			while (parent) {
				x += parent.offsetLeft;
				y += parent.offsetTop;
				parent = parent.offsetParent;}
			return {x: x, y: y};},
		/**
		 * Gets the width of the canvas.
		 * @returns {number} - the canvas width
		 */
		getWidth: function() {return this.html.width;},
		/**
		 * Gets the height of the canvas.
		 * @returns {number} - the canvas height
		 */
		getHeight: function() {return this.html.height;},
		/**
		 * Clears the canvas.
		 */
		clear: function() {
			this.context.clearRect(0, 0, this.html.width, this.html.height);
		},
		/**
		 * Called when the main window is resized.
		 * @abstract
		 */
		onResize: function() {
			this.needsRedraw = true;},
		/**
		 * Draws to the canvas.
		 */
		draw: function() {
			if (!this.needsRedraw) {return;}
			this.clear();
			this.scene.draw(this.context, this.scale);
			this.needsRedraw = false;},
		/**
		 * Run when the canvas receives a mousedown event.
		 * @abstract
		 * @param {MouseEvent} event - the triggering mouse event
		 * @param {number} x - the absolute x location
		 * @param {number} y - the absolute y location
		 */
		mousedown: function(event, x, y) {},
		/**
		 * Run when the canvas receives a mouseup event.
		 * @abstract
		 * @param {MouseEvent} event - the triggering mouse event
		 * @param {number} x - the absolute x location
		 * @param {number} y - the absolute y location
		 */
		mouseup: function(event, x, y) {},
		/**
		 * Run when the canvas receives a mousemove event.
		 * @abstract
		 * @param {MouseEvent} event - the triggering mouse event
		 * @param {number} x - the absolute x location
		 * @param {number} y - the absolute y location
		 */
		mousemove: function(event, x, y) {}
	});
