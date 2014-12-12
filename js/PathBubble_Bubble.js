/**
 * @author      Yongnan
 * @version     1.0
 * @time        9/16/2014
 * @name        PathBubble_Bubble
 */

PATHBUBBLES.Bubble = function (x, y, w, h, strokeColor, fillColor, cornerRadius, text) {
    PATHBUBBLES.Object2D.call(this);
    this.type = "Bubble";
    this.x = x || 0;
    this.y = y || 0;
    this.w = w || 500;
    this.h = h || 500;
    this.strokeColor = strokeColor || "#00ffff";
    this.fillColor = fillColor || "#ffffff";
    this.cornerRadius = cornerRadius || 20;
    this.lineWidth = 10;

    this.shape = new PATHBUBBLES.Shape.Rectangle(this, this.x, this.y, this.w, this.h, this.strokeColor, this.fillColor, this.lineWidth, this.cornerRadius);
    this.menu = new PATHBUBBLES.Shape.Circle(this.x + this.w - this.cornerRadius / 2, this.y + this.cornerRadius / 2, this.lineWidth, "#ff0000", this.strokeColor, 1) || null;
    this.menuText = new PATHBUBBLES.Text(this, "M");
    this.bubbleView = null;
    this.closeMenu = new PATHBUBBLES.Shape.Circle(this.x + this.w - this.cornerRadius / 2 - this.cornerRadius -5, this.y + this.cornerRadius / 2, this.lineWidth, "#ff0000", this.strokeColor, 1);
    this.closeMenuText = new PATHBUBBLES.Text(this, "X");
    this.ungroupMenu = new PATHBUBBLES.Shape.Circle(this.x + this.w - this.cornerRadius / 2 - 2*(this.cornerRadius +5), this.y + this.cornerRadius / 2, this.lineWidth, "#ff0000", this.strokeColor, 1);
    this.ungroupMenuText = new PATHBUBBLES.Text(this, "U");

    this.button = new PATHBUBBLES.Button(this);   //Button 0 for file selection
    var tmp = '';
    tmp += '<input type="file" id=file style="position: absolute; left:' + this.x + ' px; top:' + this.y + 'px; ">';
    tmp += '<input type="button" id=load value= "Load" style="position: absolute; left:' + this.x + ' px; top:' + this.y + 25 + 'px; ">';
    tmp += '<div id=colorpickerField style="position: absolute; left:' + this.x + ' px; top: ' + this.y + 55 + ' px; "></div>';
//    tmp += '<input type="button" id=ungroup value= "Ungroup" style="position: absolute; left:' + this.x + ' px; top:' + this.y + 80 + 'px; ">';
//    tmp += '<input type="button" id=delete value= "Delete" style="position: absolute; left:' + this.x + ' px; top:' + this.y + 105 + 'px; ">';
    this.button.addButton(tmp);

    this.name = text;
    this.title = new PATHBUBBLES.Title(this, this.name);
    this.__objectsAdded = [];
    this.__objectsRemoved = [];
    this.center = {x: this.x + this.w / 2, y: this.y + this.h / 2};
    this.GROUP = false;
    this.selected_file = null;
};

PATHBUBBLES.Bubble.prototype = Object.create(PATHBUBBLES.Object2D.prototype);

PATHBUBBLES.Bubble.prototype = {
    constructor: PATHBUBBLES.Bubble,
    updateMenu: function () {
        var $menuBarbubble = $('#menuView' + this.id);
        $menuBarbubble.css({
            left: this.x + this.offsetX + this.w + 10,
            top: this.y + this.offsetY + this.cornerRadius / 2 + 40,
            width: 200,
            height: 215
        });
        $menuBarbubble.find('#file').css({
            left: 10,
            top: 45,
            width: 180
        });
        $menuBarbubble.find('#load').css({
            left: 10,
            top: 70,
            width: 180
        });
        $menuBarbubble.find('#colorpickerField').css({
            left: 10,
            top: 95,
            width: 180
        });
//        $menuBarbubble.find('#ungroup').css({
//            left: 10,
//            top: 120,
//            width: 180
//        });
//        $menuBarbubble.find('#delete').css({
//            left: 10,
//            top: 145,
//            width: 180
//        });
    },
    addObject: function (object) {
        var index = this.children.indexOf(object);
        if (index > -1) {
            this.children.splice(index, 1);
        }
        this.children.push(object);
    },
    removeObject: function (object) {
        var index = PATHBUBBLES.objects.indexOf(object);
        if (index !== -1) {
            PATHBUBBLES.objects.splice(index, 1);
        }
        var index = this.children.indexOf(object);
        if (index !== -1) {
            this.children.splice(index, 1);
        }
        if(this.children.length ==1)
        {
            this.children[0].GROUP = false;
        }
    },
    menuOperation: function () {
        var _this = this;
        var $menuBarbubble = $('#menuView' + this.id);
        $menuBarbubble.find('#load').on('click', function () {
            _this.selected_file = $menuBarbubble.find('#file').get(0).files[0];
            if (!_this.selected_file) {
                alert("Please select data file!");
            }
            else {
                _this.bubbleView = null;
                _this.children.length = 0;
                var localFileLoader = new PATHBUBBLES.LocalFileLoader(_this);

                localFileLoader.load(_this.selected_file);
                _this.name = localFileLoader.fileName;
            }
        });
//        $menuBarbubble.find('#delete').on('click', function () {
//            if (!_this.GROUP)
//                _this.deleteBubble();
//            else {
//                var id = _this.id;
//                var group = _this.parent;
//                _this.GROUP = false;
//                var tempdata = [];
//                for (var i = 0; i < group.children.length; ++i) {
//                    if (group.children[i].id !== _this.id) {
//                        var a = group.children[i];
//                        a.parent = undefined;
//                        tempdata.push(a);
//                    }
//                }
//                _this.parent = undefined;
//                _this.deleteBubble();
//                group.tempPoints.length = 0;
//                group.arranged.length = 0;
//                group.children.length = 0;
//                for (var i = 0; i < tempdata.length; ++i) {
//                    group.RESET = true;
//                    group.addToGroup(tempdata[i]);
//                }
//                group.RESET = false;
//                scene.addObject(group);
//
//            }
//        });
//        $menuBarbubble.find('#ungroup').on('click', function () {
//            _this.ungroup();
//        });
        $menuBarbubble.find('#colorpickerField').ColorPicker({
            color: '#0000ff',
            onShow: function (colpkr) {
                $(colpkr).fadeIn(500);
                return false;
            },
            onHide: function (colpkr) {
                $(colpkr).fadeOut(500);
                return false;
            },
            onChange: function (hsb, hex, rgb) {
                $menuBarbubble.find('#colorpickerField').css('backgroundColor', '#' + hex);
            }
        });
    },
    ungroup: function () {
        if (!this.GROUP) {
            alert("It is not Grouped, right now!");
        }
        else {
            this.GROUP = false;
            this.y =this.parent.children[this.parent.children.length -1].y - 20;
            this.parent.removeObject(this);
            scene.moveObjectToFront(this);
            this.parent = scene;
//            var tempdata = [];
//            for (var i = 0; i < group.children.length; ++i) {
//                if (group.children[i].id !== this.id) {
//                    var a = group.children[i];
//                    a.parent = undefined;
//                    tempdata.push(a);
//                }
//            }
//            this.parent = undefined;     //just has one set
//            group.tempPoints.length = 0;
//            group.arranged.length = 0;
//            group.children.length = 0;
//            for (var i = tempdata.length - 1; i >= 0; i--) {
//                group.RESET = true;
//                group.addToGroup(tempdata[i]);
//            }
//            group.RESET = false;
//            scene.addObject(group);
        }
    },
    detectEqual: function (object1, object2) {
        return (object1.x == object2.x + object2.w ||
            object1.x + object1.w == object2.x ||
            object1.y == object2.y + object2.h ||
            object1.h + object1.y == object2.y) ||
            (object2.x == object1.x + object1.w ||
                object2.x + object2.w == object1.x ||
                object2.y == object1.y + object1.h ||
                object2.h + object2.y == object1.y);
    },
    deleteBubble: function () {
        this.button.remove();
        scene.removeObject(this);
    },
    deleteThisBubble: function(){
        var _this =this;
        if (!_this.GROUP)
            _this.deleteBubble();
        else {
            _this.ungroup();
            _this.deleteBubble();
//            var id = _this.id;
//            var group = _this.parent;
//            _this.GROUP = false;
//            var tempdata = [];
//            for (var i = 0; i < group.children.length; ++i) {
//                if (group.children[i].id !== _this.id) {
//                    var a = group.children[i];
//                    a.parent = undefined;
//                    tempdata.push(a);
//                }
//            }
//            _this.parent = undefined;
//            _this.deleteBubble();
//            group.tempPoints.length = 0;
//            group.arranged.length = 0;
//            group.children.length = 0;
//            for (var i = 0; i < tempdata.length; ++i) {
//                group.RESET = true;
//                group.addToGroup(tempdata[i]);
//            }
//            group.RESET = false;
//            scene.addObject(group);

        }
    },
    draw: function (ctx, scale) {
        this.setOffset();
        ctx.save();
        this.shape.draw(ctx, scale);
        if (this.bubbleView)
            if (this.bubbleView.compartments.length != 0)
                this.bubbleView.draw(ctx, scale);
        this.shape.drawStrokeAgain(ctx, scale);
        ctx.restore();
        if (this.title !== undefined) {
            var num = 12;
            while (num > 6) {
                if (this.title.text.getTextWidth(num, ctx) < this.title.w) {
                    break;
                }
                else {
                    num--
                }
            }
            this.title.text.setFontSize(num);
            this.title.name = this.name;
            if (this.title.text.getTextWidth(num, ctx) > this.title.w)
            {
                this.title.WrapText= true;
            }
            this.title.draw(ctx, scale);
        }

        ctx.save();
        if(this.menu && scale == 1)
        {
            this.menu.draw(ctx, scale);
            this.menuText.fillColor = "#f00";
            this.menuText.font = '15pt Calibri';
            this.menuText.draw(ctx, this.menu.x, this.menu.y);
        }
        if (this.closeMenu && scale == 1) {
            this.closeMenu.draw(ctx, scale);
            this.closeMenuText.fillColor = "#f00";
            this.closeMenuText.font = '15pt Calibri';
            this.closeMenuText.draw(ctx, this.closeMenu.x, this.closeMenu.y);
        }
        if(this.ungroupMenu.HighLight_State)
        {
            this.ungroupMenuText.text = "G";
        }
        else
        {
            this.ungroupMenuText.text = "U";
        }
        if(this.ungroupMenu && scale == 1)
        {
            this.ungroupMenu.draw(ctx, scale);
            this.ungroupMenuText.fillColor = "#f00";
            this.ungroupMenuText.font = '15pt Calibri';
            this.ungroupMenuText.draw(ctx, this.ungroupMenu.x, this.ungroupMenu.y);
        }
        if (this.menu.HighLight_State && scale == 1) {
//            this.menuBar.draw(ctx, scale);
        }
        if (this.menu.HighLight_State) {
            this.updateMenu();
            this.button.show();
        }
        else {
            this.updateMenu();
            this.button.hide();
        }
        ctx.restore();
        if (this.shape.HighLight_State) {
            ctx.save();
            this.shape.drawStroke(ctx, scale);
            this.drawSelection(ctx, scale);
            ctx.restore();
        }
    },
    setOffset: function () {
        if (this.parent !== undefined) {
            this.offsetX = this.parent.x;
            this.offsetY = this.parent.y;
        }
        else {
            this.offsetX = 0;
            this.offsetY = 0;
        }
        this.shape.offsetX = this.offsetX;
        this.shape.offsetY = this.offsetY;
        this.shape.x = this.x;
        this.shape.y = this.y;
        this.menu.x = this.x + this.w - this.cornerRadius / 2;
        this.menu.y = this.y + this.cornerRadius / 2;
        this.ungroupMenu.x = this.x + this.w - this.cornerRadius / 2 - (this.cornerRadius +5)*2;
        this.ungroupMenu.y = this.y + this.cornerRadius / 2;
        this.closeMenu.x = this.x + this.w - this.cornerRadius / 2 - this.cornerRadius -5;
        this.closeMenu.y = this.y + this.cornerRadius / 2;
        this.shape.w = this.w;
        this.shape.h = this.h;
    },
    drawSelection: function (ctx, scale) {
        var i, cur, half;
        var x = this.shape.offsetX + this.shape.x;
        var y = this.shape.offsetY + this.shape.y;

        var w = this.shape.w;
        var h = this.shape.h;
        if (this.GROUP) {
            x -= 6;
            y -= 6;
            w += 12;
            h += 12;
        }
        // draw the boxes
        half = PATHBUBBLES.selectionBoxSize / 2;
        // 0  1  2
        // 3     4
        // 5  6  7
        // top left, middle, right
        PATHBUBBLES.selectionHandles[0].x = x - half;
        PATHBUBBLES.selectionHandles[0].y = y - half;

        PATHBUBBLES.selectionHandles[1].x = x + w / 2 - half;
        PATHBUBBLES.selectionHandles[1].y = y - half;

        PATHBUBBLES.selectionHandles[2].x = x + w - half;
        PATHBUBBLES.selectionHandles[2].y = y - half;

        //middle left
        PATHBUBBLES.selectionHandles[3].x = x - half;
        PATHBUBBLES.selectionHandles[3].y = y + h / 2 - half;

        //middle right
        PATHBUBBLES.selectionHandles[4].x = x + w - half;
        PATHBUBBLES.selectionHandles[4].y = y + h / 2 - half;

        //bottom left, middle, right
        PATHBUBBLES.selectionHandles[6].x = x + w / 2 - half;
        PATHBUBBLES.selectionHandles[6].y = y + h - half;

        PATHBUBBLES.selectionHandles[5].x = x - half;
        PATHBUBBLES.selectionHandles[5].y = y + h - half;

        PATHBUBBLES.selectionHandles[7].x = x + w - half;
        PATHBUBBLES.selectionHandles[7].y = y + h - half;

        for (i = 0; i < 8; i += 1) {
            cur = PATHBUBBLES.selectionHandles[i];
//            ctx.save();	// save the context so we don't mess up others
            ctx.fillStyle = "#ff0000";
            ctx.fillRect(cur.x * scale, cur.y * scale, PATHBUBBLES.selectionBoxSize * scale, PATHBUBBLES.selectionBoxSize * scale);
//            ctx.restore();
        }
    },
    contains: function (mx, my) {
        return this.shape.contains(mx, my);
    },
    insideRect: function (mx, my, x, y, w, h) {
        return  (x <= mx) && (x + w >= mx) && (y <= my) && (y + h >= my);
    },
    containsInMenu: function (mx, my) {
        var x = this.menu.x;
        var y = this.menu.y;
        return  (x - mx ) * (x - mx) + (y - my ) * (y - my) <= this.menu.r * this.menu.r;
    },
    containsInCloseMenu: function (mx, my) {
        var x = this.closeMenu.x;
        var y = this.closeMenu.y;
        return  (x - mx ) * (x - mx) + (y - my ) * (y - my) <= this.closeMenu.r * this.closeMenu.r;
    },
    containsInUnGroupMenu: function (mx, my) {
        var x = this.ungroupMenu.x;
        var y = this.ungroupMenu.y;
        return  (x - mx ) * (x - mx) + (y - my ) * (y - my) <= this.ungroupMenu.r * this.ungroupMenu.r;
    },
    containsInHalo: function (mx, my) {
        if(this.title.contains(mx,my))
            return true;
        var x = this.shape.offsetX + this.shape.x + 5;
        var y = this.shape.offsetY + this.shape.y + 5;
        var w = this.shape.w - 10;
        var h = this.shape.h - 10;

        var x2 = this.shape.offsetX + this.shape.x - 5;
        var y2 = this.shape.offsetY + this.shape.y - 5;
        var w2 = this.shape.w + 10;
        var h2 = this.shape.h + 10;
        return (!this.insideRect(mx, my, x, y, w, h) && this.insideRect(mx, my, x2, y2, w2, h2));
    },
    containsInsideBubble: function (mx, my) {
        var x = this.shape.offsetX + this.shape.x + 5;
        var y = this.shape.offsetY + this.shape.y + 5;
        var w = this.shape.w - 10;
        var h = this.shape.h - 10;
        return this.insideRect(mx, my, x, y, w, h);
    },
    clone: function () {
        var bubble = new PATHBUBBLES.Bubble();
        bubble.id = this.id;
        bubble.name = this.name;
        bubble.parent = this.parent;
        for (var i = 0; i < this.children.length; ++i) {
            var a = this.children[i];
            if (bubble.children.indexOf(a) == -1)
                bubble.children.push(a);
        }

        bubble.type = this.type;
        bubble.x = this.x;
        bubble.y = this.y;
        bubble.w = this.w;
        bubble.h = this.h;
        bubble.strokeColor = this.strokeColor;
        bubble.fillColor = this.fillColor;
        bubble.cornerRadius = this.cornerRadius;

        bubble.shape = new PATHBUBBLES.Shape.Rectangle(this.x, this.y, this.w, this.h, this.strokeColor, this.fillColor, 10, this.cornerRadius);
        bubble.offsetX = this.offsetX;
        bubble.offsetY = this.offsetY;


        for (var i = 0, il = this.__objectsAdded.length; i < il; i++) {
            var a = this.__objectsAdded[ i ];
            bubble.__objectsAdded.push(a);
        }
        for (var i = 0, il = this.__objectsRemoved.length; i < il; i++) {
            var a = this.__objectsRemoved[ i ];
            bubble.__objectsRemoved.push(a);
        }
        bubble.__objectsRemoved = this.__objectsRemoved;
        bubble.center = this.center;
        bubble.GROUP = this.GROUP;
        return bubble;
    }
};