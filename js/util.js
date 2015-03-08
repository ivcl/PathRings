/**
 * @author Alexander Garbarino
 * @name util
 */

var PATHBUBBLES = PATHBUBBLES || {};
var $P = PATHBUBBLES;

/**
 * Simple class inheritance.
 * Does not handle calling the superclass constructor.
 * Defines superclass on the prototype.
 * @param {?Function} superclass - the parent class
 * @param {!Function} init - the initialization function
 * @param {Object} prototype - the prototype methods
 */
$P.defineClass = function(superclass, init, prototype) {
	init.prototype = Object.create(superclass && superclass.prototype);
	Object.getOwnPropertyNames(prototype).forEach(function(name) {
		Object.defineProperty(init.prototype, name, Object.getOwnPropertyDescriptor(prototype, name));});
	init.prototype.constructor = init;
	init.prototype.superclass = superclass;
	return init;
};


/**
 * Retrieves a specific value from the passed object.
 * @callback getter
 * @param {object} object - the object to retrieve from
 * @returns {*} - a specific value on the object
 */

/**
 * Create a function that retrieves a specific key from an object.
 * @param {string} key - the key to return
 * @returns {getter}
 */
$P.getter = function (key) {return function(object) {return object[key];};};

/**
 * Create a function that takes an object and calls f from it
 * @param {string} f - the name of the function to call
 * @param {...*} arg - any additional arguments to pass
 */
$P.method = function(f) {
	var args = Array.prototype.slice.call(arguments, 1);
	return function(o) {
		return o[f].apply(o, args);};};

/**
 * Returns the first element in the array which satisfies the predicate.
 * @param {Array} array - the array
 * @param {Function} predicate - The predicate function. Takes the
 * element and its index position.
 * @returns {?*} - the first object in array satisfying predicate
 */
$P.findFirst = function(array, predicate) {
	var i, element;
	for (i = 0; i < array.length; ++i) {
		element = array[i];
		if (predicate(element, i)) {return element;}}
	return null;};

/**
 * Loops over array, returning the first true result of applying f.
 * @param {Array} array - the array to loop over
 * @param {Function} f - the function to apply
 * @returns {?*} - the first true returned value
 */
$P.or = function(array, f) {
	var i, result;
	for (i = 0; i < array.length; ++i) {
		result = f(array[i]);
		if (result) {return result;}}
	return null;};

/**
 * If the html element is visible.
 * @param {HTMLElement} element - the element to test
 * @returns {boolean} - if the element is visible
 */
$P.isHtmlElementVisible = function(element) {
	return 'none' !== element.style.display && 'hidden' !== element.style.visibility;};

$P.removeFromList = function(list, element) {
	var index = list.indexOf(element);
	if (-1 == index) {return;}
	list.splice(index, 1);};

$P.randomFromList = function(list) {
	return list[Math.floor(Math.random() * list.length)];};

$P.readonly = function(object, variable, value) {
	Object.defineProperty(object, variable, {
		value: value, enumerable: true});};

$P.not = function(fun) {
	return function(a) {return !fun(a);};};

/**
 * Truncates a string to fit within the given length.
 * @param {CanvasRenderingContext2D} context - the drawing context
 * @param {string} string - the string to truncate
 * @param {number} maxLength - the maximum length of the string
 * @param {string} [ellipsis=…] - the symbol used to indicate truncation.
 */
$P.truncateDrawnString = function(context, string, maxLength, ellipsis) {
	var length, finalString;
	ellipsis = ellipsis || '…';

	length = context.measureText(string).width;
	if (length <= maxLength) {return string;}
	do {
		string = string.slice(0, -1);
		finalString = string + ellipsis;}
	while (string.length > 0 && context.measureText(finalString).width > maxLength);

	return string + ellipsis;};

/**
 * Takes two list and returns a list composed of the common elements.
 * @param {Array} listA - the first list
 * @param {Array} listB - the second list
 * @param {Function} [compare] - The comparsion function. Defaults to strict equality.
 * @returns {Array} - The elements in A which are also in B, according to the compare function.
 */
$P.listIntersection = function(listA, listB, compare) {
	var list = [];
	if (!compare) {compare = function(a, b) {return a === b;};}
	listA.forEach(function(a) {
		if (listB.some(function(b) {return compare(a, b);})) {
			list.push(a);}});
	return list;};

/**
 * Get a json file.
 */
$P.getJSON = function(url, callback, params) {
	var call, config;
	config = {
		dataType: 'json',
		url: url,
		error: function(jqXHR, textStatus, errorThrown) {
			if ('timeout' === textStatus) {
				call();}
			else {
				console.error(errorThrown);
				console.error(textStatus);}},
		timeout: 5000,
		success: callback};
	if (params) {config = $.extend(config, params);}
	call = function call() {$.ajax(config);};
	call();};

$P.nullf = function() {};

$P.asyncLoop = function(array, callback, next) {
	var i = 0;
	function run() {
		function finish() {
			++i;
			window.setTimeout(i < array.length ? run : next, 0);}
		callback(finish, array[i], i);}
	run();};

$P.asyncOrdered = function(callbacks) {
	var i = 0;
	function run() {
		function finish() {
			++i;
			if (i < callbacks.length) {
				window.setTimeout(run, 0);}}
		callbacks[i](finish);}
	run();};
