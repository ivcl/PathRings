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
		console.log(this.name);
		this.strokeStyle = config.strokeStyle || this.parent.strokeStyle || '#f00';
		this.fillStyle = config.fillStyle || this.parent.strokeStyle || '#fff';
    this.text = new $P.Text({
			parent: this,
			text: this.name,
			fontSize: config.fontSize || this.lineWidth * 2,
			fontBase: function(size) {return 'bold ' + size + 'px sans-serif';}});
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
			this.move(
				this.parent.x + this.parent.w * 0.25,
				this.parent.y - 20,
				this.parent.w * 0.5,
				20);
			this.text.move(
				this.parent.x + this.parent.w * 0.5,
				this.parent.y - 10,
				this.parent.w * 0.5,
				20);},
		onParentPositionChanged: function(dx, dy, dw, dh) {
			this.resetPosition();}
	});
