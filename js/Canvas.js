(function($P){
	'use strict';

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
			var canvas = this;

			this.html = config.element;
			this.scene = config.scene;

			['mousedown', 'mouseup', 'mousemove'].forEach(function(name) {
				canvas.html.addEventListener(name, function(event) {
					var mouse = canvas.getMouseLocation(event);
					canvas[name](event, mouse.x, mouse.y);});});

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
				this.scene.draw(this.context, this.scale, {
					noTitle: true, noButtons: true, sharpCorners: true, fillWithStroke: true,
					overrideStroke: 'black', noDetails: true});
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
			mousemove: function(event, x, y) {},
			/**
			 * Sets the entire window to use this canvas's mousemove function.
			 */
			useMousemoveGlobally: function() {
				var canvas = this;
				$P.state.setGlobalMousemove(function(event) {
					var mouse = canvas.getMouseLocation(event);
					canvas.mousemove(event, mouse.x, mouse.y);});},
			/**
			 * Sets the entire window to use this canvas's mouseup function.
			 */
			useMouseupGlobally: function() {
				var canvas = this;
				$P.state.setGlobalMouseup(function(event) {
					var mouse = canvas.getMouseLocation(event);
					canvas.mouseup(event, mouse.x, mouse.y);});}
		});
})(PATHBUBBLES);
