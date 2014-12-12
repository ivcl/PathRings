/**
 * @author      Yongnan
 * @version     1.0
 * @time        9/16/2014
 * @name        main
 */
var scene=null;
var canvas=null;
var navCanvas=null;
var viewpoint = null;
var navInterection = null;
var interection = null;
var showLinks = true;
$(document).ready(function () {
    canvas = $("#bgCanvas")[0];
    navCanvas = $("#navCanvas")[0];
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
    scene = new PATHBUBBLES.Scene();
    viewpoint = new PATHBUBBLES.ViewPoint();
    viewpoint.h = 50;
    viewpoint.w = window.innerWidth / window.innerHeight * 50;
    PATHBUBBLES.WindowResize();
    var renderer = new PATHBUBBLES.Renderer();
    navInterection = new PATHBUBBLES.NavInteraction(renderer);
    interection = new PATHBUBBLES.Interaction(renderer);

    function render() {
        requestAnimationFrame(render);
        renderer.render();
    }

    render();

    var mousePosX, mousePosY;

    $('#bgCanvas').on('contextmenu', function (e) {
        mousePosX = e.clientX;
        mousePosY = e.clientY;
    });
    $('#bubble').contextMenu({
        selector: '#bgCanvas',
        callback: function (key) {
            if (key === 'Open_Bubble') {
                var bubble4 = new PATHBUBBLES.Bubble(mousePosX, mousePosY);
                bubble4.menuOperation();
                if (viewpoint) {
                    bubble4.offsetX = viewpoint.x;
                    bubble4.offsetY = viewpoint.y;
                }
                scene.addObject(bubble4);
            }
            else if (key === 'Open_TreeRing') {
                var bubble5 = new PATHBUBBLES.TreeRing(mousePosX, mousePosY, 700, 760, "homo sapiens");
                bubble5.addHtml();
                bubble5.menuOperation();
                if (viewpoint) {
                    bubble5.offsetX = viewpoint.x;
                    bubble5.offsetY = viewpoint.y;
                }
                scene.addObject(bubble5);
            }
//            else if (key === 'Open_Tree') {
//                var bubble6 = new PATHBUBBLES.BiPartite(mousePosX, mousePosY,600,510);
//                bubble6.addHtml();
//                bubble6.menuOperation();
//                if(viewpoint)
//                {
//                    bubble6.offsetX = viewpoint.x;
//                    bubble6.offsetY = viewpoint.y;
//                }
//                scene.addObject(bubble6);
//            }
            else if (key === 'Delete_All') {       //modify a bug by changing for loop from i=0, ... to i= array length to 0
                for (var l = scene.children.length-1; l >=0; l--) {
                    if (scene.children[l] instanceof PATHBUBBLES.Bubble
                        ||scene.children[l] instanceof PATHBUBBLES.TreeRing
                        ||scene.children[l] instanceof PATHBUBBLES.Table
                        ||scene.children[l] instanceof PATHBUBBLES.BiPartite)
//                        scene.removeObject(scene.children[l]);
                        scene.children[l].deleteThisBubble();
                }
                scene.children.length = 0;
                for (var l = PATHBUBBLES.objects.length-1; l >= 0; l--) {
                    if (PATHBUBBLES.objects[l])
                        delete PATHBUBBLES.objects[l];
                }
                PATHBUBBLES.objects.length = 0;

                $('svg').parent().remove();
                $('.menu').remove();     //modify a bug by changing for loop from i=0, ... to i= array length to 0
            }
            else if (key === 'Open_Help') {       //modify a bug by changing for loop from i=0, ... to i= array length to 0
                $("#infoBox").dialog("open");
            }
            else if (key === 'Toggle_Links') {       //modify a bug by changing for loop from i=0, ... to i= array length to 0

                showLinks =!showLinks;
            }
        },
        items: {
            "Open_Bubble": {name: "Open Pathway Graph"},
            "Open_TreeRing": {name: "Open Pathway TreeRing"},
//            "Open_Tree": {name: "Open Pathway"},
            "Delete_All": {name: "Delete All"},
            "sep1": "---------",
            "Open_Help": {name: "Open Simple Tutorial"},
            "Toggle_Links": {name: "Toggle show Links"}
        }
    });
});
