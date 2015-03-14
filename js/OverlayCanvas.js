var $P = PATHBUBBLES;

$P.OverlayCanvas = $P.defineClass(
	$P.Canvas,
	function OverlayCanvas(config) {
		$P.Canvas.call(this, config);
		this.html.style['pointer-events']= config.pointer || 'none';
		this.html.addEventListener('contextmenu', function(event) {return false;});},
	{
		draw: function() {
			if (!this.needsRedraw) {return;}
			this.clear();
			this.context.save();
			this.context.translate(-$P.state.scrollX, 0);
			this.scene.drawLinks(this.context, this.scale, {canvas: 'overlay'});
			this.scene.drawHints(this.context, this.scale, {canvas: 'overlay'});
			this.context.restore();
			this.needsRedraw = false;}
	});
