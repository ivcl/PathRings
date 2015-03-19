(function($P){
	'use strict';

	$P.SplitForce = $P.defineClass(
		$P.BubbleBase,
		function SplitForce(config) {
			config.closeMenu = true;
			config.groupMenu = true;
			$P.BubbleBase.call(this, config);
		},
		{
			onAdded: function(parent) {
				var config;
				$P.BubbleBase.prototype.onAdded.call(this, parent);

				if (!this.svg) {
					config = {
						parent: this
						//ids: this.ids,
						//leftPathway: this.leftPathway,
						//rightPathway: this.rightPathway
					};
					config = $.extend(config, this.getInteriorDimensions());
					this.svg = new $P.D3SplitForce(config);}},

			receiveEvent: function(event) {
				var result;

				if ('dragPathway' == event.name && this.contains(event.x, event.y)) {
					console.log('Pathway Event Received');
					this.svg.addPathway(event.pathwayId);
					return true;}

				result = $P.BubbleBase.prototype.receiveEvent.call(this, event);
				if (result) {return result;}

				return false;}
		});

})(PATHBUBBLES);
