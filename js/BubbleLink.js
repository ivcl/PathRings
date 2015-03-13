var $P = PATHBUBBLES;


$P.BubbleLink = $P.defineClass(
	$P.Object2D,
	/**
	 * @param {$P.BubbleLink.End} config.source - the source link end
	 * @param {$P.BubbleLink.End} config.target - the target link end
	 * @param {string} [config.fillStyle=gray] - the fill style
	 * @param {number} [sourceWidth=6] - the width of the link at source
	 * @param {number} [targetWidth=1] - the width of the link at target
	 */
	function BubbleLink(config) {
		if (!(config.source instanceof $P.BubbleLink.End)) {
			console.error('$P.BubbleLink(',config,'): [source] must be a link end.');}
		if (!(config.target instanceof $P.BubbleLink.End)) {
			console.error('$P.BubbleLink(',config,'): [target] must be a link end.');}

		this.source = config.source;
		this.source.registerLink(this);
		this.target = config.target;
		this.target.registerLink(this);
		this.strokeStyle = config.strokeStyle || 'none';
		this.fillStyle = config.fillStyle || 'gray';
		this.opacity = config.opacity || 0.5;
		this.sourceWidth = config.sourceWidth || 7;
		this.targetWidth = config.targetWidth || 2;

		$P.Object2D.call(this, config);
	},
	{
		drawSelf: function(context, scale) {
			var dx = this.target.x - this.source.x,
					dy = this.target.y - this.source.y,
					baseDir = new $P.Vector2D(dx, dy).normalized().rotate90();
			context.save();
			context.globalAlpha = this.opacity;
			context.beginPath();
			context.moveTo(
				this.source.x + baseDir.x * this.sourceWidth * 0.5,
				this.source.y + baseDir.y * this.sourceWidth * 0.5);
			context.lineTo(
				this.source.x - baseDir.x * this.sourceWidth * 0.5,
				this.source.y - baseDir.y * this.sourceWidth * 0.5);
			context.lineTo(
				this.target.x - baseDir.x * this.targetWidth * 0.5,
				this.target.y - baseDir.y * this.targetWidth * 0.5);
			context.lineTo(
				this.target.x + baseDir.x * this.targetWidth * 0.5,
				this.target.y + baseDir.y * this.targetWidth * 0.5);
			context.closePath();
			if (this.strokeStyle !== 'none') {
				context.strokeStyle = this.strokeStyle;
				context.stroke();}
			context.fillStyle = this.fillStyle;
			context.fill();
			context.restore();},
		onDelete: function() {
			$P.removeFromList(this.source.object.links, this);
			$P.removeFromList(this.target.object.links, this);
			$P.removeFromList($P.state.scene.links, this);
			$P.state.markDirty();}
	});

$P.BubbleLink.End = $P.defineClass(
	null,
	function BubbleLinkEnd(config) {
		this.object = config.object || null;},
	{
		get x() {return this.object.x;},
		get y() {return this.object.y;},
		registerLink: function(link) {
			this.object.links.push(link);}
	});
