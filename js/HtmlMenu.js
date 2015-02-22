var $P = PATHBUBBLES;

$P.HtmlMenu = $P.defineClass(
	$P.HtmlObject,

	/**
	 * @classdesc A menu to go beside a bubble
	 * @constructor
	 * @param {!string} config.parent - the parent bubble
	 */
	function HtmlMenu(config) {
		var parent = config.parent,
				menuString = config.menuString || parent.menuString || '';
		config.x = parent.x + parent.w + parent.lineWidth * 0.6;
		config.y = parent.y;
		config.w = config.w;
		config.h = config.h;
		config = {objectConfig: config};
		config.parent = '#bubble';
		config.type = 'div';
		config.pointer = 'visiblePainted';
		$P.HtmlObject.call(this, config);
		this.element.class = 'menu';
		//this.element.style.opacity = 0.9;
		this.element.style.filter = 'alpha:(opacity=40)';
		this.element.style.background = 'lightgoldenrodyellow';
		this.element.style.border = '4px solid #666';
		this.element.style['z-index'] = 1000;
		this.element.innerHTML += menuString;},
	{

	});
