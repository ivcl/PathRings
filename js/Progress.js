(function($P){
	'use strict';

	$P.Progress = $P.defineClass(
		$P.Object2D,
		function Progress(config) {
			$P.Object2D.call(this, config);
			this.prefix = config.prefix || '';
			this.color = config.color || '#0ff';
		},
		{
			onParentPositionChanged: function(dx, dy, dw, dh) {
				$P.Object2D.prototype.onParentPositionChanged.call(this, dx, dy, dw, 0);},
			onAdded: function(parent) {
				var interiorConfig;
				this.move(
					parent.x + parent.w * 0.1,
					parent.y + parent.h * 0.5 - 10,
					parent.w * 0.8,
					20);
				this.border = new $P.Shape.Rectangle({
					strokeStyle: '#000',
					fillStyle: '#fff',
					x: this.x, w: this.w, y: this.y, h: this.h});
				this.add(this.border);
				interiorConfig = {
					strokeStyle: 'none',
					fillStyle: this.color};
				$.extend(interiorConfig, this.border.getInteriorDimensions());
				this.maxInteriorWidth = interiorConfig.w;
				interiorConfig.w = 0;
				this.interior = new $P.Shape.Rectangle(interiorConfig);
				this.add(this.interior, 0);
				this.text = new $P.Text({
					fontSize: 12,
					text: this.prefix + '0%',
					x: this.x + this.w * 0.5,
					y: this.y + this.h * 0.5
				});
				this.add(this.text, 0);
			},
			setProgress: function(percent) {
				this.interior.move(null, null, percent * this.maxInteriorWidth, null);
				this.text.text = this.prefix + (percent * 100).toFixed(2) + '%';
				$P.state.markDirty();},
			draw: function(context, scale, args) {
				if (args.noDetails) {return;}
				$P.Object2D.prototype.draw.call(this, context, scale, args);}
		});
})(PATHBUBBLES);
