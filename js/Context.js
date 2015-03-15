(function($P){
	'use strict';

	$P.Context = $P.defineClass(
		null,
		function Context() {
			this.scrollX = 0;
			this.hintsEnabled = true;
			this.linksEnabled = true;
		},
		{
			/**
			 * Sets the global mousemove command to be used. This is so that
			 * if the mouse is dragged off a component, the component can
			 * make sure that its mousemove callback is used.
			 * @param {Function} callback - the mousemove callback.
			 */
			setGlobalMousemove: function(callback) {
				window.onmousemove = callback;},
			/**
			 * Sets the global mouseup command to be used. This is so that
			 * if the mouse is dragged off a component and then released,
			 * the component can make sure that its mouseup callback is
			 * used.
			 * @param {Function} callback - the mouseup callback.
			 */
			setGlobalMouseup: function(callback) {
				window.onmouseup = callback;}
		});
})(PATHBUBBLES);
