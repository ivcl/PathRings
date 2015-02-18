/**
 * @author      Yongnan
 * @version     1.0
 * @time        10/21/2014
 * @name        PathBubble_Title
 */

var $P = PATHBUBBLES;

$P.Title = $P.defineClass(
	$P.Shape.Rectangle,
	function (config) {
		config.cornerRadius = config.cornerRadius || 10;
		config.lineWidth = config.lineWidth || 10;
		$P.Shape.Rectangle.call(this, config);
    this.name = config.name || 'Title';
		this.strokeStyle = config.strokeStyle || this.parent.strokeStyle || '#f00';
		this.fillStyle = config.fillStyle || this.parent.strokeStyle || '#fff';
    this.text = new $P.Text({
			parent: this,
			text: this.name,
			fontSize: config.fontSize || this.lineWidth * 1.5,
			fontBase: function(size) {return size + 'px sans-serif';}});
		this.resetPosition();
    this.wrapText = false;
	},
	{
		get name() {return this._name;},
		set name(value) {
			if (value.length > 0) {
				value = value.charAt(0).toUpperCase() + value.slice(1);}
			this._name = value;
			if (this.text) {this.text.text = value;}},
		/**
		 * Recenters self above parent.
		 */
		resetPosition: function() {
			var context = $P.state.mainCanvas.context,
					width = this.parent.w * 0.5,
					maxWidth = this.parent.w - this.cornerRadius * 2,
					buffer = this.cornerRadius,
					textWidth, centerX, x, y;

			context.save();

			this.text.text = this.name;
			textWidth = this.text.getTextWidth(context, 1);
			if (textWidth > width - buffer * 2) {
				this.text.setFont(context, 1);
				width = textWidth + buffer * 2;

				if (width > maxWidth) {
					width = maxWidth;
					this.text.text = $P.truncateDrawnString(
						context, this.name, maxWidth - buffer * 2);}}

			context.restore();

			centerX = this.parent.x + this.parent.w * 0.5;
			this.x = centerX - width * 0.5;
			this.y = this.parent.y - 20;
			this.w = width,
			this.h = 20;
			this.text.move(centerX, this.parent.y - 15, width, 20);},
		onPositionChanged: function(dx, dy, dw, dh) {
			$P.Shape.Rectangle.prototype.onPositionChanged.call(this, dx, dy, dw, dh);
			this.resetPosition();},

		draw: function(context, scale, args) {
			if (args.noTitle) {return;}
			$P.Shape.Rectangle.prototype.draw.call(this, context, scale, args);}
	});
