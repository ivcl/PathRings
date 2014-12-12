/**
 * @author      Yongnan
 * @version     1.0
 * @time        9/16/2014
 * @name        PathBubble_object2D
 */
PATHBUBBLES.Object2D = function () {
    this.id = PATHBUBBLES.Object2DIdCount++;
    this.name = '';
    this.parent = undefined;
    this.children = [];
    this.offsetX = 0;
    this.offsetY = 0;
    this.x = 0;
    this.y = 0;
};
PATHBUBBLES.Object2D.prototype = {

    constructor: PATHBUBBLES.Object2D,
    add: function (object) {
        if (arguments.length > 1) {
            for (var i = 0; i < arguments.length; i++) {
                this.add(arguments[ i ]);
            }
            return this;
        }

        if (object === this) {
            console.error("PATHBUBBLES.Object2D.add:", object, "can't be added as a child of itself.");
            return this;
        }

        if (object) {
            if (object.parent !== undefined) {
                object.parent.remove(object);
            }

            object.parent = this;
            //object.dispatchEvent( { type: 'added' } );

            this.children.push(object);

            // add to scene
            var scene = this;
            while (scene.parent !== undefined) {
                scene = scene.parent;
            }

            if (scene !== undefined && scene instanceof  PATHBUBBLES.Scene) {
                scene.addObject(object);
            }

        }
        return this;
    },
    remove: function (object) {
        if (arguments.length > 1) {
            for (var i = 0; i < arguments.length; i++) {
                this.remove(arguments[ i ]);
            }
        }
        ;
        var index = this.children.indexOf(object);
        if (index !== -1) {
            object.parent = undefined;
            this.children.splice(index, 1);
            // remove from scene
            var scene = this;
            while (scene.parent !== undefined) {
                scene = scene.parent;
            }
            if (scene !== undefined && scene instanceof PATHBUBBLES.Scene) {
                scene.removeObject(object);
            }
        }
    },
    traverse: function (callback) {
        callback(this);
        for (var i = 0, l = this.children.length; i < l; i++) {
            this.children[ i ].traverse(callback);
        }
    },

    getObjectById: function (id, recursive) {

        for (var i = 0, l = this.children.length; i < l; i++) {
            var child = this.children[ i ];
            if (child.id === id) {
                return child;
            }

            if (recursive === true) {
                child = child.getObjectById(id, recursive);
                if (child !== undefined) {
                    return child;
                }
            }
        }
        return undefined;
    },
    getObjectByName: function (name, recursive) {

        for (var i = 0, l = this.children.length; i < l; i++) {
            var child = this.children[ i ];
            if (child.name === name) {
                return child;
            }

            if (recursive === true) {
                child = child.getObjectByName(name, recursive);
                if (child !== undefined) {
                    return child;
                }
            }
        }
        return undefined;
    }
};
PATHBUBBLES.Object2DIdCount = 0;
