(function($P){
	'use strict';

	$P.HintBox = $P.defineClass(
		$P.Shape.Rectangle,
		function HintBox(config) {
			var textConfig;
			config.cornerRadius = config.cornerRadius || 10;
			config.lineWidth = config.lineWidth || 4;
			config.w = config.w || 200;
			config.h = config.h || 60;
			config.strokeStyle = config.strokeStyle || '#f3f';
			config.fillStyle = config.fillStyle || '#f3f';
			this.target = config.target || {x: 0, y: 0};
			this.fadeStart = config.fadeStart || 18000;
			this.fadeDuration = config.fadeDuration || 1000;
			$P.Shape.Rectangle.call(this, config);
			this.maxOpacity = config.maxOpacity || 1;
			this.opacity = this.maxOpacity;
			textConfig = {
				parent: this,
				text: config.text || 'HintBox',
				fontSize: config.fontSize || 14,
				fontBase: function(size) {return size + 'px sans-serif';}};
			$.extend(textConfig, this.getInteriorDimensions());
			textConfig.x = this.x + this.w * 0.5;
			textConfig.y = this.y + this.h * 0.5;
			this.text = new $P.Text(textConfig);
		},
		{
			onAdded: function(parent) {
				var self = this;
				$P.Shape.Rectangle.prototype.onAdded.call(this, parent);
				$P.state.scene.hints.push(this);
				window.setTimeout(function() {self.fadeOut();}, self.fadeStart);},
			onRemoved: function(parent) {
				$P.Shape.Rectangle.prototype.onRemoved.call(this, parent);
				var index = $P.state.scene.hints.indexOf(this);
				if (index !== -1) {
					$P.state.scene.hints.splice(index, 1);}},
			draw: function(context, scale, args) {
				if ('overlay' !== args.canvas) {return;}
				$P.Shape.Rectangle.prototype.draw.call(this, context, scale, args);},
			drawSelf: function(context, scale) {
				context.save();
				context.globalAlpha = this.opacity;
				context.beginPath();
				context.moveTo(this.x + this.w * 0.5, this.y + this.h * 0.5);
				context.lineTo(this.target.x, this.target.y);
				context.lineWidth = this.lineWidth;
				context.strokeStyle = this.strokeStyle;
				context.stroke();
				$P.Shape.Rectangle.prototype.drawSelf.call(this, context, scale);
				context.restore();},
			fadeOut: function() {
				var self = this;
				if (this.fadeStartTime) {return;}
				self.fadeStartTime = new Date().getTime();
				function run() {
					var now = new Date().getTime(),
							dur = now - self.fadeStartTime;
					if (dur > self.fadeDuration) {
						self.removeFromParent();}
					else {
						self.opacity = self.maxOpacity * (1 - dur / self.fadeDuration);
						self.text.opacity = self.opacity / self.maxOpacity;
						$P.state.markDirty();
						window.setTimeout(run, 5);}}
				run();},
			onPositionChanged: function(dx, dy, dw, dh) {
				$P.Shape.Rectangle.prototype.onPositionChanged.call(this, dx, dy, dw, dh);
				this.target.x += dx;
				this.target.y += dy;},
			receiveEvent: function(event) {
				var self = this;
				if ('destroyHints' === event.name) {
					window.setTimeout(function() {self.removeFromParent();}, 0);
					return false;}
				if ('mousemove' === event.name && this.contains(event.x, event.y)) {
					this.fadeOut();}
				return $P.Shape.Rectangle.prototype.receiveEvent.call(this, event);}
		});
})(PATHBUBBLES);
