/**
 * @author      Yongnan
 * @version     1.0
 * @time        9/16/2014
 * @name        PathBubble_scene
 */
//A management class to manage objects inside the scene
PATHBUBBLES.Scene = function () {
    PATHBUBBLES.Object2D.call(this);
    this.type = "Scene";
    this.__objectsAdded = [];
    this.__objectsRemoved = [];
};
PATHBUBBLES.Scene.prototype = Object.create(PATHBUBBLES.Scene.prototype);

PATHBUBBLES.Scene.prototype = {
    addObject: function (object) {
        object.parent = this;
        if (PATHBUBBLES.objects.indexOf(object) == -1)
            PATHBUBBLES.objects.push(object);
        var index = this.children.indexOf(object);

        if (index > -1) {
            this.children.splice(index, 1);
        }
        this.children.push(object);
    },
    moveObjectToFront: function (object) {
        var indexThis = this.children.indexOf(object);
        var indexObjects = PATHBUBBLES.objects.indexOf(object);
        if (indexThis > -1) {
            this.children.splice(indexThis, 1);
            this.children.splice(0, 0, object);
        }
        if (indexObjects > -1) {
            PATHBUBBLES.objects.splice(indexObjects, 1);
            PATHBUBBLES.objects.splice(0, 0, object);
        }
    },
    removeBasicObject: function (object) {        //fix a bug
        if (object instanceof PATHBUBBLES.Bubble) {
            if (object.menu.HighLight_State)
                object.button.hide();
            object.menu.HighLight_State = false;
            object.bubbleView = null;
        }
        else if (object instanceof PATHBUBBLES.TreeRing) {
            if (object.menu.HighLight_State)
                object.button.hide();
            object.menu.HighLight_State = false;
        }
        else if (object instanceof PATHBUBBLES.Table) {
            if (object.menu.HighLight_State)
                object.button.hide();
            object.menu.HighLight_State = false;
        }
        else if (object instanceof PATHBUBBLES.BiPartite) {
            if (object.menu.HighLight_State)
                object.button.hide();
            object.menu.HighLight_State = false;
        }
        var index = PATHBUBBLES.objects.indexOf(object);
        if (index !== -1) {
            PATHBUBBLES.objects.splice(index, 1);
        }

        var index = this.children.indexOf(object);
        if (index !== -1) {
            this.children.splice(index, 1);
        }
    },
    removeObject: function (object) {
//        if (object instanceof PATHBUBBLES.Groups) {
//            for (var c = 0; c < object.children.length; c++) {
//                this.removeObject(object.children[ c ]);
//            }
//        }
//        else
        if (object instanceof PATHBUBBLES.Bubble) {
            if (object.menu.HighLight_State)
                object.button.hide();
            object.menu.HighLight_State = false;
            object.bubbleView = null;
        }
        else if (object instanceof PATHBUBBLES.TreeRing) {
            if (object.menu.HighLight_State)
                object.button.hide();
            object.menu.HighLight_State = false;
//            object.deleteBubble();
        }
        else if (object instanceof PATHBUBBLES.Table) {
            if (object.menu.HighLight_State)
                object.button.hide();
            object.menu.HighLight_State = false;
//            object.deleteBubble();
        }
        else if (object instanceof PATHBUBBLES.BiPartite) {
            if (object.menu.HighLight_State)
                object.button.hide();
            object.menu.HighLight_State = false;
//            object.deleteBubble();
        }
        var index = PATHBUBBLES.objects.indexOf(object);
        if (index !== -1) {
            PATHBUBBLES.objects.splice(index, 1);
        }

        var index = this.children.indexOf(object);
        if (index !== -1) {
            this.children.splice(index, 1);
        }
    }
};

