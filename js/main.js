/**
 * @author      Yongnan
 * @version     1.0
 * @time        9/16/2014
 * @name        main
 */
(function($P){
	'use strict';

	var viewpoint = null;
	var navInterection = null;
	var interection = null;
	var showLinks = true;
	$(document).ready(function () {
		$P.state = new $P.Context();

		var canvas = $('#bgCanvas')[0];
		var overlayCanvas = $('#overlayCanvas')[0];
		var navCanvas = $('#navCanvas')[0];
		window.addEventListener( 'keydown', function(event){
			if(event.keyCode === 70)
			{
				screenfull.request();
			}
		}, false );
		// trigger the onchange() to set the initial values
		screenfull.onchange();
		//    THREEx.FullScreen.bindKey({ charCode: 'f'.charCodeAt(0) });
		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;
		navCanvas.height = 50;
		navCanvas.width = window.innerWidth;

		$P.state.scene = new $P.Scene();
		$P.state.scrollX = 0;

		// Resize events.
		$P.state.needsResize = true;
		window.addEventListener('resize', function() {
			if (!$P.state.needsResize) {
				$P.state.needsResize = true;
				$P.requestAnimationFrame(function() {
					$P.state.mainCanvas.onResize();
					$P.state.overlayCanvas.onResize();
					$P.state.navCanvas.onResize();});}});

		$P.state.mainCanvas = new $P.MainCanvas({element: canvas, scene: $P.state.scene});
		$P.state.overlayCanvas = new $P.OverlayCanvas({element: overlayCanvas, scene: $P.state.scene});
		$P.state.navCanvas = new $P.NavCanvas({element: navCanvas, scene: $P.state.scene});
		$P.state.markDirty = function() {
			this.mainCanvas.needsRedraw = true;
			this.overlayCanvas.needsRedraw = true;
			this.navCanvas.needsRedraw = true;};

		function render() {
			$P.requestAnimationFrame(render);
			$P.state.mainCanvas.draw();
			$P.state.overlayCanvas.draw();
			$P.state.navCanvas.draw();
		}

		render();

		$P.state.scene.add(new $P.TreeRing({
			x: 50, y: 50, w: 750, h: 700,
			dataName: 'human'}));

		var mousePosX, mousePosY;

		$('#bgCanvas').on('contextmenu', function (e) {
			mousePosX = e.clientX;
			mousePosY = e.clientY;
		});
		$('#bubble').contextMenu({
			selector: '#bgCanvas',
			callback: function (key) {
				var bubble;
				if (key === 'Open_Bubble') {
					bubble = new $P.PathwayDiagram({x: mousePosX + $P.state.scrollX, y: mousePosY, w: 400, h: 400});
					$P.state.scene.add(bubble);}
				else if (key === 'Open_TreeRing') {
					$P.state.scene.add(new $P.TreeRing({
						x: mousePosX + $P.state.scrollX, y: mousePosY, w: 700, h: 700,
						dataName: 'human'}));}
				else if ('open_force' == key) {
					bubble = new $P.Force({x: mousePosX + $P.state.scrollX, y: mousePosY, w: 400, h: 400});
					$P.state.scene.add(bubble);}
				else if (key === 'Delete_All') {
					$P.state.scene.deleteAll();}
				else if (key === 'Open_Help') {       //modify a bug by changing for loop from i=0, ... to i= array length to 0
					$('#infoBox').dialog('open');
				}
				else if (key === 'Toggle_Links') {       //modify a bug by changing for loop from i=0, ... to i= array length to 0

					showLinks =!showLinks;
				}
			},
			items: {
				'Open_Bubble': {name: 'Open Pathway Graph'},
				'Open_TreeRing': {name: 'Open Pathway TreeRing'},
				open_force: {name: 'Open Force Directed'},
				//            'Open_Tree': {name: 'Open Pathway'},
				'Delete_All': {name: 'Delete All'},
				'sep1': '---------',
				'Open_Help': {name: 'Open Simple Tutorial'},
				'Toggle_Links': {name: 'Toggle show Links'}
			}
		});
	});
})(PATHBUBBLES);
