(function($P){
	'use strict';

	$P.Debug = $P.defineClass(
		null,
		function Debug() {
		},
		{
			/**
			 * Get the first or nth bubble.
			 */
			bubble: function(index) {
				if (undefined === index) {index = 0;}
				function predicate(object) {
					if (object instanceof $P.BubbleBase) {
						--index;
						if (index < 0) {
							return object;}}
					return false;}
				return $P.state.scene.findChild(predicate);},

			treering: function(index) {
				if (undefined === index) {index = 0;}
				function predicate(object) {
					if (object instanceof $P.TreeRing) {
						--index;
						if (index < 0) {
							return object;}}
					return false;}
				return $P.state.scene.findChild(predicate);},

			pathway: function(name) {
				var bubble = this.treering();
				if (!bubble) {return null;}
				return $P.findFirst(bubble.svg.nodes, function(node) {
					return node.name == name;});}
		});

	$P.debug = new $P.Debug();
})(PATHBUBBLES);
