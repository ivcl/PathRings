var $P = PATHBUBBLES;

$P.Vector2D = $P.defineClass(
	null,
	function Vector2D(x, y) {
		$P.readonly(this, 'x', x);
		$P.readonly(this, 'y', y);},
	{
		get length() {
			if (!this._length) {
				Object.defineProperty(this, '_length', {
					value: Math.pow(Math.pow(this.x, 2) + Math.pow(this.y, 2), 0.5)});}
			return this._length;},
		times: function(scalar) {return new $P.Vector2D(this.x * scalar, this.y * scalar);},
		normalized: function() {
			return new $P.Vector2D(this.x / this.length, this.y / this.length);},
		rotate90: function() {return new $P.Vector2D(-this.y, this.x);},
		rotate270: function() {return new $P.Vector2D(this.y, -this.x);}
	});
