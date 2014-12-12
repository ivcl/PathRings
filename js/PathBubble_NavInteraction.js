/**
 * @author      Yongnan
 * @version     1.0
 * @time        9/27/2014
 * @name        PathBubble_navInteraction
 */
PATHBUBBLES.NavInteraction = function (renderer) {
    this.selection = null;
    var _this = this;
    _this.dragFalg = false;
    var oldMouseX;
    navCanvas.addEventListener('mousedown', function (e) {
        var mouse = _this.getMouse(e);
        var mx = mouse.x;
        oldMouseX = mx;
        var my = mouse.y;
        renderer.valid = false;

        if (viewpoint instanceof PATHBUBBLES.ViewPoint && viewpoint.contains(mx, my)) {
            if (interection.selection[0]) {
                interection.selection[0].shape.HighLight_State = false;
            }
            _this.selection = viewpoint;
            _this.dragFalg = true;
        }
        this.style.cursor = 'auto';
    }, true);

    navCanvas.addEventListener('mousemove', function (e) {
        var mouse = _this.getMouse(e),
            mx = mouse.x,
            my = mouse.y;
        var offsetX;
        if (viewpoint instanceof PATHBUBBLES.ViewPoint) {
            if (_this.dragFalg) {
                // We don't want to drag the object by its top-left corner, we want to drag it
                // from where we clicked. Thats why we saved the offset and use it here
                offsetX = mouse.x - oldMouseX;
                oldMouseX = mouse.x;
                _this.selection.x += offsetX;
                for (var i = 0; i < scene.children.length; ++i) {
                    if (scene.children[i] instanceof PATHBUBBLES.Bubble)
                        scene.children[i].x -= offsetX * window.innerHeight / 50;
                    if (scene.children[i] instanceof PATHBUBBLES.TreeRing)
                        scene.children[i].x -= offsetX * window.innerHeight / 50;
                    if (scene.children[i] instanceof PATHBUBBLES.Table)
                        scene.children[i].x -= offsetX * window.innerHeight / 50;
                    if (scene.children[i] instanceof PATHBUBBLES.BiPartite)
                        scene.children[i].x -= offsetX * window.innerHeight / 50;
                    if (scene.children[i] instanceof PATHBUBBLES.Groups)
                        scene.children[i].offsetX -= offsetX * window.innerHeight / 50;
                }
            }

            //_this.selection.y += offsetY;
            this.style.cursor = 'move';
            renderer.valid = false; // Something's dragging so we must redraw
        }
    }, true);

    navCanvas.addEventListener('mouseup', function (e) {
        this.style.cursor = 'auto';
        _this.dragFalg = false;
        renderer.valid = false;
    }, true);

};
PATHBUBBLES.NavInteraction.prototype = {
    getMouse: function (e) {
        var element = navCanvas, offsetX = 0, offsetY = 0, mx, my;
        if (element.offsetParent !== undefined) {
            do {
                offsetX += element.offsetLeft;
                offsetY += element.offsetTop;
                element = element.offsetParent;
            } while (element);
        }
        mx = e.pageX - offsetX;
        my = e.pageY - offsetY;
        return {x: mx, y: my};
    }
};