/**
 * @author      Yongnan
 * @version     1.0
 * @time        9/23/2014
 * @name        PathBubble_interaction
 */

var $P = PATHBUBBLES;

//Select, Drag, Resize
$P.MainCanvas = $P.defineClass(
	$P.Canvas,
	function MainCanvas(config) {
		$P.Canvas.call(this, config);

		//this.renderer = renderer;

		this.defaultMode();

		this.dragging = false; // Keep track of when we are dragging
		this.resizeDragging = false; // Keep track of resize
		this.expectResize = -1; // save the # of the selection handle
		this.groupResize = false;
		this.menu = false;
		this.bubbleViewDrag = false;
		this.moleculeDrag = false;
		this.selection = []; // the current selected objects.
		var _this = this;
		var oldMouseX;
		var oldMouseY;
		this.html.addEventListener('mousewheel', mousewheel, false);
		this.html.addEventListener('DOMMouseScroll', mousewheel, false); // firefox
		function mousewheel() {
			/*
			var delta = 0;
			if (event.wheelDelta) { // WebKit / Opera / Explorer 9
				delta = -(event.wheelDelta / 120);
			}
			else if (event.detail) { // Firefox
				delta = event.detail / 3;
			}
			this.renderer.valid = false;
			 */
		}
	},
	{
		mousedown: function(event, x, y) {this.mode.mousedown(event, x + $P.state.scrollX, y);},
		mousemove: function(event, x, y) {this.mode.mousemove(event, x + $P.state.scrollX, y);},
		mouseup: function(event, x, y) {this.mode.mouseup(event, x, y);},

		clear: function() {
			var gradient,
					width = this.getWidth(),
					height = this.getHeight();
			//$P.Canvas.clear.call(this);
			gradient = this.context.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, '#3E4041');
      gradient.addColorStop(1, '#899DAB');
      this.context.fillStyle = gradient;
      this.context.fillRect(0, 0, width, height);
		},
		draw: function() {
			if (!this.needsRedraw) {return;}
			this.clear();
			this.context.save();
			this.context.translate(-$P.state.scrollX, 0);
			this.scene.draw(this.context, this.scale, {canvas: 'main'});
			this.context.restore();
			this.needsRedraw = false;},

		/**
		 * Go back to the default interaction mode.
		 */
		defaultMode: function() {
			this.mode = new $P.MainCanvas.Mode.Default(this);},

		/**
		 * Begin dragging an object.
		 * @param {$P.Object2D} object - the object to drag
		 * @param {number} x - the starting x location
		 * @param {number} y - the starting y location
		 */
		beginDrag: function(object, x, y) {
			this.mode = new $P.MainCanvas.Mode.Drag(this, object, x, y);},

		/**
		 * Begin resizing an object.
		 * @param {$P.Object2D} object - the object to resize
		 * @param {String} direction - the resize direction (e.g. 'nw')
		 * @param {number} x - the starting x location
		 * @param {number} y - the starting y location
		 */
		beginResize: function(object, direction, x, y) {
			this.mode = new $P.MainCanvas.Mode.Resize(this, object, direction, x, y);},

		detectOverlap: function (object1, object2) {
			return (object1.x < object2.x + object2.w &&
							object1.x + object1.w > object2.x &&
							object1.y < object2.y + object2.h &&
							object1.h + object1.y > object2.y) ||
				(object2.x < object1.x + object1.w &&
				 object2.x + object2.w > object1.x &&
				 object2.y < object1.y + object1.h &&
				 object2.h + object2.y > object1.y);
		}
	});

$P.MainCanvas.Mode = $P.defineClass(
	null,
	function() {},
	{
		/**
		 * What to do on a mouse down event.
		 * @param {MouseEvent} event - the down event
		 * @param {number} x - the x position of the mouse
		 * @param {number} y - the y position of the mouse
		 */
		mousedown: function() {},
		/**
		 * What to do on a mouse move event.
		 * @param {MouseEvent} event - the movement event
		 * @param {number} x - the x position of the mouse
		 * @param {number} y - the y position of the mouse
		 */
		mousemove: function(event, x, y) {},
		/**
		 * What to do on a mouse up event.
		 * @param {MouseEvent} event - the up event
		 * @param {number} x - the x position of the mouse
		 * @param {number} y - the y position of the mouse
		 */
		mouseup: function(event, x, y) {}
	});

$P.MainCanvas.Mode.Default = $P.defineClass(
	$P.MainCanvas.Mode,
	/**
	 * @constructor
	 * @param {$P.MainCanvas} canvas - the main canvas object
	 */
	function(canvas) {
		this.canvas = canvas;
		this.canvas.useMousemoveGlobally();
		this.canvas.useMouseupGlobally();
	},
	{
		mousemove: function(event, x, y) {
			this.canvas.setCursor('auto');
			this.canvas.scene.sendEvent({name: 'mousemove', x: x, y: y});},
		mousedown: function(event, x, y) {
			this.canvas.scene.sendEvent({name: 'mousedown', x: x, y: y});},
		mouseup: function(event, x, y) {}
	}
);

$P.MainCanvas.Mode.Drag = $P.defineClass(
	$P.MainCanvas.Mode,
	/**
	 * @constructor
	 * @param {$P.MainCanvas} canvas - the main canvas object
	 * @param {$P.Object2D} selected - the selected object to drag
	 * @param {number} x - the starting x location
	 * @param {number} y - the starting y location
	 */
	function Drag(canvas, selected, x, y) {
		this.canvas = canvas;
		this.selected = selected;
		this.x = x;
		this.y = y;
		this.selected.highlighted = true;
		this.selected.inMotion = true;
		this.canvas.setCursor('move');
		this.canvas.useMousemoveGlobally();
		this.canvas.useMouseupGlobally();
		$P.state.scene.disableHtmlPointerEvents();
	},
	{
		mousemove: function(event, x, y) {
			var dx = x - this.x,
					dy = y - this.y;
			this.selected.translate(dx, dy);
			this.x = x;
			this.y = y;},
		mouseup: function(event, x, y) {
			this.canvas.defaultMode();
			$P.state.scene.enableHtmlPointerEvents();
			this.selected.highlighted = false;
			this.selected.inMotion = false;
			this.selected.receiveEvent({name: 'dragFinish', x: x + $P.state.scrollX, y: y});
			$P.state.scene.sendEvent({
				name: 'bubbleMoved',
				bubble: this.selected});}
	});

$P.MainCanvas.Mode.Resize = $P.defineClass(
	$P.MainCanvas.Mode,
	/**
	 * @constructor
	 * @param {$P.MainCanvas} canvas - the main canvas object
	 * @param {$P.Object2D} selected - the selected object to resize
	 * @param {String} direction - the direction to resize in
	 * @param {number} x - the starting x location
	 * @param {number} y - the starting y location
	 */
	function(canvas, selected, direction, x, y) {
		this.canvas = canvas;
		this.selected = selected;
		this.direction = direction;
		this.x = x;
		this.y = y;
		this.selected.highlighted = true;
		this.canvas.useMouseupGlobally();
		this.canvas.useMousemoveGlobally();
		$P.state.scene.disableHtmlPointerEvents();
	},
	{
		mousemove: function(event, x, y) {
			var dx = x - this.x,
					dy = y - this.y,
					unused;
			// unused accounts for the bubble having a minimum size.
			unused = this.selected.resize(this.direction, dx, dy);
			x += unused.l - unused.r;
			y += unused.t - unused.b;
			this.x = x;
			this.y = y;},
		mouseup: function(event, x, y) {
			this.canvas.defaultMode();
			$P.state.scene.enableHtmlPointerEvents();
			this.selected.highlighted = false;
		}
	});
