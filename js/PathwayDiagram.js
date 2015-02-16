/**
 * @author      Yongnan
 * @version     1.0
 * @time        9/16/2014
 * @name        PathBubble_Bubble
 */

(function($P){
	'use strict';

	$P.PathwayDiagram = $P.defineClass(
		$P.BubbleBase,
		function PathwayDiagram(config) {
			var tmp;
			$.extend(config, {mainMenu: true, closeMenu: true, groupMenu: true});
			$P.BubbleBase.call(this, config);
			this.selectedFile = null;
		},
		{
			createMenu: function() {
				this.menu = new $P.PathwayDiagram.Menu({parent: this});}
		});

	$P.PathwayDiagram.Menu = $P.defineClass(
		$P.HtmlMenu,
		function PathwayDiagram(config) {
			var tmp, bubble, html, load;
			tmp = '';
			tmp += '<input type="file" id=file style="position: absolute; left: 10px; top: 10px; width: 230px">';
			tmp += '<input type="button" id=load value= "Load" style="position: absolute; left: 10px; top: 35px; width: 230px">';

			config.menuString = tmp;
			config.w = 250;
			config.h = 70;
			$P.HtmlMenu.call(this, config);

			bubble = this.parent;
			html = $(this.element);

			load = html.find('#load');
			load.on('click', function() {
				var selectedFile = html.find('#file').get(0).files[0],
						loader;
				if (!selectedFile) {
					alert('Please choose a file.');
					return;}
				if (bubble.html) {
					bubble.html.delete();
					bubble.html = null;}
				loader = new $P.LocalFileLoader({bubble: bubble});
				loader.load(selectedFile);
				bubble.name = loader.fileName;
			});},
		{});
})(PATHBUBBLES);
