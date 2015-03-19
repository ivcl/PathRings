(function($P){
	'use strict';

	$P.MirrorForce = $P.defineClass(
		$P.BubbleBase,
		function MirrorForce(config) {
			this.ids = config.ids;
			this.leftPathway = config.leftPathway;
			this.rightPathway = config.rightPathway;
			config.name = config.name || 'Mirror';
			config.closeMenu = true;
			config.groupMenu = true;
			$P.BubbleBase.call(this, config);

			this.pathways = {};},
		{
			onAdded: function(parent) {
				var config;
				$P.BubbleBase.prototype.onAdded.call(this, parent);

				if (!this.svg) {
					config = {
						parent: this,
						ids: this.ids,
						leftPathway: this.leftPathway,
						rightPathway: this.rightPathway};
					config = $.extend(config, this.getInteriorDimensions());
					this.svg = new $P.D3MirrorForce(config);}}
		});

})(PATHBUBBLES);
