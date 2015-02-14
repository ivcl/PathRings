var $P = PATHBUBBLES;

$P.NavViewBox = $P.defineClass(
	$P.Shape.Rectangle,
	/**
	 * Create the nav view box.
	 * @param {$P.MainCanvas} mainCanvas - the main canvas object
	 * @param {$P.NavCanvas} navCanvas - the nav canvas object
	 * @classdesc The display of the current view in the nav bar.
	 */
	function(mainCanvas, navCanvas) {
		$P.Shape.Rectangle.call(this, {
			cornerRadius: 0,
			lineWidth: 2,
			fillStyle: 'none',
			strokeStyle: '#fff'
		});
		this.mainCanvas = mainCanvas;
		this.navCanvas = navCanvas;
	},
	{
		/**
		 * Updates the view box's position based on canvas sizes, etc.
		 */
		updatePosition: function() {
			this.w = this.mainCanvas.getWidth();
			this.h = this.mainCanvas.getHeight();
			this.x = $P.state.scrollX;
		}
	}
);
