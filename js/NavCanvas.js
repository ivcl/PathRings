/**
 * @author      Yongnan
 * @version     1.0
 * @time        9/27/2014
 * @name        PathBubble_navInteraction
 */
var $P = PATHBUBBLES;

$P.NavCanvas = $P.defineClass(
	$P.Canvas,
	function (config) {
		$P.Canvas.call(this, config);
		this.state = 'default';
		this.viewbox = new $P.NavViewBox($P.state.mainCanvas, this);
		this.onResize();
	}, {
		onResize: function() {
			$P.Canvas.prototype.onResize.call(this);
			this.scale = this.getHeight() / $P.state.mainCanvas.getHeight();
			this.viewbox.updatePosition();},
		mousedown: function(event, x, y) {
			if ('default' !== this.state) {return;}
			if (this.viewbox.contains(x / this.scale, y / this.scale)) {
				this.state = 'dragview';
				this.setCursor('move');
				this.useMouseupGlobally();
				this.useMousemoveGlobally();
				this.lastX = x;
				this.lastY = y;}},
		mousemove: function(event, x, y) {
			var dx;
			if ('dragview' !== this.state) {return;}
			dx = (x - this.lastX) / this.scale;
			$P.state.scrollX += dx;
			if ($P.state.scrollX < 0) {$P.state.scrollX = 0;}
			this.lastX = x;
			this.viewbox.updatePosition();
			$P.state.markDirty();},
		mouseup: function(event, x, y) {
			if ('dragview' !== this.state) {return;}
			this.state = 'default';
			this.setCursor('auto');
			$P.state.setGlobalMouseup(null);
			$P.state.setGlobalMousemove(null);
			this.viewbox.updatePosition();},
		draw: function() {
			$P.Canvas.prototype.draw.call(this);
			this.viewbox.draw(this.context, this.scale);
		}
	});
