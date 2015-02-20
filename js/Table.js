/**
 * @author      Yongnan
 * @version     1.0
 * @time        10/18/2014
 * @name        PathBubble_Table
 */

(function($P){
	'use strict';

	$P.Table = $P.defineClass(
		$P.BubbleBase,
		function Table(config) {
			this.dbId = config.dbId;
			this.dataName = config.name || null;
			if (this.dataName) {this.name = this.dataName;}
			else {this.name = 'Table';}
			this.selectedFile = null;
			this.data = config.data || null;
			this.queryObject = config.queryObject || null;
			this.crosstalking = config.crosstalking || null;
			this.experimentType = config.experimentType || 'Ortholog';
			this.preHierarchical = config.preHierarchical || '';
			this.keepQuery = config.keepQuery || null;
			this.sourceRing = config.sourceRing || null;

			$.extend(config, {closeMenu: true, groupMenu: true});
			console.log(config);
			$P.BubbleBase.call(this, config);
		}, {
			onAdded: function(parent) {
				var config;

				$P.BubbleBase.prototype.onAdded.call(this, parent);

				if (!this.svg) {
					config = {parent: this, data: this.data};
					$.extend(config, this.getInteriorDimensions());
					if (this.queryObject) {
						config.dbId = this.queryObject.dbId;
						config.querySymbol = this.queryObject.symbol;}
					else {
						config.dbId = this.dbId;}
					this.svg = new $P.D3Table(config);
					this.svg.init();}

			},
			drawSVG: function() {
				var space = 6; // leave 6 space for tree ring
				$('#svg' + this.id).css({
					width: this.w - 15 - space,
					height: this.h - 20 - space,
					left: this.x + space / 2 + 5,
					top: this.y + this.h / 2 - this.table.h / 2 + 50 + 10 + space / 2 + 5
				});
			}
		});
})(PATHBUBBLES);
