/**
 * Provides requestAnimationFrame in a cross browser way.
 * @author paulirish / http://paulirish.com/
 */
var $P = PATHBUBBLES;

var existingImplementation =
			window.requestAnimationFrame ||
			window.webkitRequestAnimationFrame ||
      window.mozRequestAnimationFrame ||
      window.oRequestAnimationFrame ||
      window.msRequestAnimationFrame;

if (existingImplementation) {
	$P.requestAnimationFrame = function(callback, element) {
		return existingImplementation.call(window, callback, element);};}
else {
	$P.requestAnimationFrame = function(callback, element) {
    window.setTimeout(callback, 1000 / 60);};}
