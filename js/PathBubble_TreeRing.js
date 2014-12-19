/**
 * @author      Yongnan
 * @version     1.0
 * @time        10/10/2014
 * @name        PathBubble_TreeRing
 */

PATHBUBBLES.TreeRing = function (x, y, w, h, dataName, dataType, selectedData) {
    PATHBUBBLES.Object2D.call(this);
    this.type = "TreeRing";
    this.x = x || 0;
    this.y = y || 0;
    this.w = w || 500;
    this.h = h || 530;
//    this.strokeColor = "#00ffff";
    {
        var id=Math.floor((Math.random() * PATHBUBBLES.borderColors.length));
        this.strokeColor = PATHBUBBLES.borderColors[id];
    }
    this.fillColor = "#ffffff";
    this.cornerRadius = 20;
    this.lineWidth = 10;

    this.shape = new PATHBUBBLES.Shape.Rectangle(this, this.x, this.y, this.w, this.h, this.strokeColor, this.fillColor, this.lineWidth, this.cornerRadius);
    this.menu = new PATHBUBBLES.Shape.Circle(this.x + this.w - this.cornerRadius / 2, this.y + this.cornerRadius / 2, this.lineWidth, "#ff0000", this.strokeColor, 1);
    this.menuText = new PATHBUBBLES.Text(this, "M");
    this.closeMenu = new PATHBUBBLES.Shape.Circle(this.x + this.w - this.cornerRadius / 2 - this.cornerRadius -5, this.y + this.cornerRadius / 2, this.lineWidth, "#ff0000", this.strokeColor, 1);
    this.closeMenuText = new PATHBUBBLES.Text(this, "X");
    this.ungroupMenu = new PATHBUBBLES.Shape.Circle(this.x + this.w - this.cornerRadius / 2 - 2*(this.cornerRadius +5), this.y + this.cornerRadius / 2, this.lineWidth, "#ff0000", this.strokeColor, 1);
    this.ungroupMenuText = new PATHBUBBLES.Text(this, "U");
    this.resetMenu = new PATHBUBBLES.Shape.Circle(this.x + this.w - this.cornerRadius / 2 - 3*(this.cornerRadius +5), this.y + this.cornerRadius / 2, this.lineWidth, "#ff0000", this.strokeColor, 1);
    this.resetMenuText = new PATHBUBBLES.Text(this, "R");

    this.processingStatus = new PATHBUBBLES.Text(this, "Processing");

    this.button = new PATHBUBBLES.Button(this);   //Button 0 for file selection
    var tmp = '';
    tmp += '<select id="operateText" style="position: absolute; left:' + this.x + ' px; top:' + this.y + 25 + 'px; ">';
    tmp += '<option value="showTitle">Show Pathway Name</option>';
    tmp += '<option value="showCrossTalk">Show CrossTalk</option>';
    tmp += '</select>';

    tmp += '<select id="crossTalkLevel" style="position: absolute; left:' + this.x + ' px; top:' + this.y + 25 + 'px; ">';
    tmp += '</select>';

    tmp +='<div id="orthologTypeDiv" style="position: absolute; left:' + this.x + ' px; top:' + this.y + 25 + 'px; ">';
    tmp += '<select id="file" style="position: absolute; left:' + this.x + ' px; top:' + this.y + 25 + 'px; ">';
    tmp += '<option value="Default">Choose Species</option>';
    tmp += '<option value="Gallus" selected="selected">Gallus</option>';
    tmp += '<option value="Alligator">Alligator</option>';
    tmp += '<option value="Turtle">Turtle</option>';
    tmp += '<option value="Human">Human</option>';
    tmp += '</select>';
    tmp += '<input type="file" id="customOrth"  style="position: absolute; left:' + this.x + ' px; top:' + this.y + 25 + 'px; ">';
    tmp += '<div id=loadOrthDiv style="position: absolute; left:' + this.x + ' px; top:' + this.y + 25 + 'px; ">';
    tmp += '<input type="button" id=loadOrth value= "Load(Ortholog)" >';
    tmp += '<a href="./data/sample/customeOrtholog.txt" target="_blank"><button style="position: absolute; margin-left:10px"><font style="font-size: 10px">Sample Data</font></button></a>';
    tmp += '</div>';
    tmp += '</div>';
    tmp +='<div id="expressionTypeDiv" style="position: absolute; left:' + this.x + ' px; top:' + this.y + 25 + 'px; ">';
    tmp += '<div id=minMaxRatio style="position: absolute; left:' + this.x + ' px; top:' + this.y + 'px; ">';
    tmp += '<div style="float: left">';
    tmp += 'Ratio(log 2 based): &gt;=';
    tmp += '   <input id = "maxRatio" type="text"  placeholder="1.5"  style="display: inline; width: 40px;" />';
    tmp += '</div>';
    tmp += '<div style="float: left">';
    tmp += 'Ratio(log 2 based): &lt;=';
    tmp += '    <input id = "minRatio" type="text"  placeholder="-1.5" style="display: inline; width: 40px;" />';
    tmp += '</div>';
    tmp += '</div>';

    tmp += '<div id=updownLabel style="position: absolute; left:' + this.x + ' px; top:' + this.y + 'px; ">';
    tmp += '<div style="float: left">';
    tmp += 'Label for &nbsp; up&nbsp;&nbsp;   expressed:';
    tmp += '   <input id = "upLabel" type="text"  placeholder="Up expressed"  style="display: inline; width: 90px;" />';
    tmp += '</div>';
    tmp += '<div style="float: left">';
    tmp += 'Label for down expressed:';
    tmp += '    <input id = "downLabel" type="text"  placeholder="Down expressed" style="display: inline; width: 90px;" />';
    tmp += '</div>';
    tmp += '</div>';

    tmp += '<input type="file" id="customExp" style="position: absolute; left:' + this.x + ' px; top:' + this.y + 25 + 'px; ">';
    tmp += '<div id=loadExpDiv style="position: absolute; left:' + this.x + ' px; top:' + this.y + 25 + 'px; ">';
    tmp += '<input type="button" id=loadExp value= "Load(Expression)" >';
    tmp += '<a href="./data/sample/TGF0expression.txt" target="_blank"><button style="position: absolute; margin-left:10px"><font style="font-size: 10px">Sample Data</font></button></a>';
    tmp += '</div>';
    tmp += '</div>';
    this.button.addButton(tmp);

    this.pre = "Human VS ";
//    this.name = this.pre + "Gallus";
    this.orthologLabel = this.pre + "Gallus";
    this.expressionLabel ="";

    this.dataName = dataName || null;
    if(!this.dataName)
        this.name = this.id +"_" + "Homo sapiens";
    else
        this.name = this.id +"_" + this.dataName;
    this.title = new PATHBUBBLES.Title(this, this.name);
    this.__objectsAdded = [];
    this.__objectsRemoved = [];
    this.center = {x: this.x + this.w / 2, y: this.y + this.h / 2};
    this.GROUP = false;
    this.selected_file = null;

    this.dataType = dataType || null;
    this.selectedData = selectedData || null;
    this.experiment_Type = "Ortholog";
    this.preHierarchical = "";
};

PATHBUBBLES.TreeRing.prototype = Object.create(PATHBUBBLES.Object2D.prototype);

PATHBUBBLES.TreeRing.prototype = {
    constructor: PATHBUBBLES.TreeRing,
    addHtml: function () {
        this.setOffset();
        var tmp = '';
        tmp += '<div id= svg' + this.id + ' style="position: absolute; width:' + (this.w + 5) + 'px; ' + 'height:' + (this.h ) + 'px; left:' + (this.shape.x + this.offsetX) + ' px; top:' + (this.shape.y + this.offsetY) + 'px; "> </div>';
        $("#bubble").append($(tmp));

        if (!this.dataType)
            this.dataType = "Gallus";

        this.treeRing = new PATHBUBBLES.D3Ring(this, Math.min(this.w, this.h) - 30, this.dataType, this.dataName);
        if (this.selectedData !== undefined && this.selectedData !== null) {
            this.treeRing.selectedData = this.selectedData;
        }
        this.treeRing.init();
    },
    addBubbleLink: function(startId,endId, x,y) {
        var object={};
        object.startId = startId;
        object.endId = endId;
        object.absolute = {x:x, y:y};
        PATHBUBBLES.bubbleLinks.push(object);
    },
    addObject: function (object) {
        var index = this.children.indexOf(object);
        if (index > -1) {
            this.children.splice(index, 1);
        }
        this.children.push(object);
    },
    removeObject: function (object) {

        if ($('#svg' + object.id).length)
            $('#svg' + object.id).remove();
        if ($('#menuView' + object.id).length)
            $('#menuView' + object.id).remove();

        var index = PATHBUBBLES.objects.indexOf(object);
        if (index !== -1) {
            PATHBUBBLES.objects.splice(index, 1);
        }
        var index = scene.children.indexOf(object);
        if (index !== -1) {
            scene.children.splice(index, 1);
        }

    },
    menuOperation: function () {
        var _this = this;
        var $menuBarbubble = $('#menuView' + this.id);
        $menuBarbubble.find('#file').change(function () {
//            _this.statusDomElement = _this.addStatusElement();
//            $("#bubble")[0].appendChild(_this.statusDomElement);
            var operateText = $menuBarbubble.find('#operateText').val();
            var val = $(this).val();
            if (val == undefined)
                return;
            d3.select('#svg' + _this.id).remove();
            var tmp = '';
            tmp += '<div id= svg' + _this.id + ' style="position: absolute; width:' + (_this.w + 5) + 'px; ' + 'height:' + (_this.h + 5) + 'px; left:' +
                (_this.x + _this.w / 2 - (Math.min(_this.w, _this.h) - 30) / 2 - 10) + ' px; top:' +
                (_this.y + _this.h / 2 - (Math.min(_this.w, _this.h) - 30) / 2 + 50 - 15) + 'px; "> </div>';
            $("#bubble").append($(tmp));
            var customExpression = null;
            if (_this.treeRing.customExpression) {
                customExpression = _this.treeRing.customExpression;
            }
            var highLightPathways = _this.treeRing.highLightPathways;
            _this.treeRing = null;
            _this.treeRing = new PATHBUBBLES.D3Ring(_this, Math.min(_this.w, _this.h) - 30, val, _this.dataName);
            _this.treeRing.file = "./data/Ortholog/" + val + "/" + _this.dataName + ".json";
            _this.treeRing.showCrossTalkLevel = parseInt($menuBarbubble.find('#crossTalkLevel').val());
            _this.treeRing.highLightPathways = highLightPathways;
            if( operateText=="showTitle")
            {
                _this.treeRing.showTitle();
                $menuBarbubble.find('#crossTalkLevel').hide();
            }
            else if(operateText == "showCrossTalk")
            {
                _this.treeRing.showCrossTalk();
                $menuBarbubble.find('#crossTalkLevel').show();
            }
            _this.treeRing.ChangeLevel = true;
            if (customExpression) {
                _this.treeRing.customExpression = customExpression;
//                _this.name = "(Expression) ";
//                _this.name = _this.id+val;
            }
            _this.name = _this.id + "_" +val;
            _this.orthologLabel = _this.pre + val;
//            else {
//                _this.name = _this.pre + val;
//                if(val == "Human")
//                {
//                    _this.name ="(Ortholog) Human";
//                }
//            }
            _this.treeRing.init();
//            _this.statusDomElement.style.display = 'none';
        });
        $menuBarbubble.find('#crossTalkLevel').change(function () {
            var val = $(this).val();

            if (val == undefined)
                return;
            d3.select('#svg' + _this.id).remove();
            var tmp = '';
            tmp += '<div id= svg' + _this.id + ' style="position: absolute; width:' + (_this.w + 5) + 'px; ' + 'height:' + (_this.h + 5) + 'px; left:' +
                (_this.x + _this.w / 2 - (Math.min(_this.w, _this.h) - 30) / 2 - 10) + ' px; top:' +
                (_this.y + _this.h / 2 - (Math.min(_this.w, _this.h) - 30) / 2 + 50 - 15) + 'px; "> </div>';
            $("#bubble").append($(tmp));
            var orthlogData = null, expressionData = null;
            if (_this.treeRing.customOrtholog) {
                orthlogData = _this.treeRing.customOrtholog;
            }
            if (_this.treeRing.customExpression) {
                expressionData = _this.treeRing.customExpression;
            }
            var highLightPathways = _this.treeRing.highLightPathways;
            _this.treeRing = null;

            var fileVal = $('#menuView' + _this.id).find('#file').val();

            _this.treeRing = new PATHBUBBLES.D3Ring(_this, Math.min(_this.w, _this.h) - 30, fileVal, _this.dataName);
            _this.treeRing.highLightPathways = highLightPathways;
            _this.treeRing.ChangeLevel = true;
            _this.treeRing.showCrossTalkLevel = val;
            _this.treeRing.file = "./data/Ortholog/" + fileVal + "/" + _this.dataName + ".json";
            if (orthlogData) {
                _this.treeRing.customOrtholog = orthlogData;
//                _this.name = _this.pre + "custom";
            }
            if (expressionData) {
                _this.treeRing.customExpression = expressionData;
//                _this.name = "(Expression) ";
            }
            _this.treeRing.init();
        });
        $menuBarbubble.find('#operateText').change(function (){
            var val = $(this).val();
            if(val == "showTitle")
            {
                _this.treeRing.showTitle();
                $menuBarbubble.find('#crossTalkLevel').hide();
            }
            else if(val == "showCrossTalk")
            {
                  _this.treeRing.showCrossTalk();
                $menuBarbubble.find('#crossTalkLevel').show();
            }
        });
        $menuBarbubble.find('#loadOrth').on('click', function () {
            _this.selected_file = $menuBarbubble.find('#customOrth').get(0).files[0];
//            _this.selected_file = $menuBarbubble.find('#customOrth' + _this.id).get(0).files[0];
            if (!_this.selected_file) {
                alert("Please select your Ortholog data file!");
            }
            else {

                var localFileLoader = new PATHBUBBLES.FileLoader("Ortholog");
                localFileLoader.load(_this.selected_file, function (orthlogData) {

                    d3.select('#svg' + _this.id).remove();
                    var tmp = '';
                    tmp += '<div id= svg' + _this.id + ' style="position: absolute; width:' + (_this.w + 5) + 'px; ' + 'height:' + (_this.h + 5) + 'px; left:' +
                        (_this.x + _this.w / 2 - (Math.min(_this.w, _this.h) - 30) / 2 - 10) + ' px; top:' +
                        (_this.y + _this.h / 2 - (Math.min(_this.w, _this.h) - 30) / 2 + 50 - 15) + 'px; "> </div>';
                    $("#bubble").append($(tmp));
                    var customExpression = null;
                    if (_this.treeRing.customExpression) {
                        customExpression = _this.treeRing.customExpression;
                    }
                    var highLightPathways = _this.treeRing.highLightPathways;
                    _this.treeRing = null;
                    var val = $menuBarbubble.find('#file').val();
                    _this.orthologLabel = "Input ortholog file: " +_this.selected_file.name;
                    _this.treeRing = new PATHBUBBLES.D3Ring(_this, Math.min(_this.w, _this.h) - 30, val, _this.dataName);
                    _this.treeRing.file = "./data/Ortholog/" + val + "/" + _this.dataName + ".json";
                    _this.treeRing.showCrossTalkLevel = parseInt($menuBarbubble.find('#crossTalkLevel').val());
                    _this.treeRing.customOrtholog = orthlogData;
                    if($menuBarbubble.find('#operateText').val() == "showTitle")
                    {
                        _this.treeRing.showTitle();
                        $menuBarbubble.find('#crossTalkLevel').hide();
                    }
                    else if($menuBarbubble.find('#operateText').val() == "showCrossTalk")
                    {
                        _this.treeRing.showCrossTalk();
                        $menuBarbubble.find('#crossTalkLevel').show();
                    }
                    _this.treeRing.ChangeLevel = true;
                    if (customExpression) {
                        _this.treeRing.customExpression = customExpression;
                    }
                    _this.treeRing.highLightPathways = highLightPathways;
//                    _this.treeRing.renderType = "Ortholog";
//                    _this.name = _this.pre + "custom";
//                    _this.name = _this.id+val;
                    $menuBarbubble.find('#file').val("Default");
                    _this.experiment_Type = "Ortholog";
                    _this.treeRing.init();
                });
            }
        });
        $menuBarbubble.find('#loadExp').on('click', function () {
            _this.selected_file = $menuBarbubble.find('#customExp' ).get(0).files[0];
            if (!_this.selected_file) {
                alert("Please select your Expression data file!");
            }
            else {

                _this.HIDE=true;
                var minRatio = $menuBarbubble.find('#minRatio').val();
                var maxRatio = $menuBarbubble.find('#maxRatio').val();
                if (minRatio == "")
                    minRatio = "-1.5";
                if (maxRatio == "")
                    maxRatio = "1.5";

                var localFileLoader = new PATHBUBBLES.FileLoader("Expression");
                localFileLoader.load(_this.selected_file, function (expressionData) {

                    d3.select('#svg' + _this.id).remove();
                    var tmp = '';
                    tmp += '<div id= svg' + _this.id + ' style="position: absolute; width:' + (_this.w + 5) + 'px; ' + 'height:' + (_this.h + 5) + 'px; left:' +
                        (_this.x + _this.w / 2 - (Math.min(_this.w, _this.h) - 30) / 2 - 10) + ' px; top:' +
                        (_this.y + _this.h / 2 - (Math.min(_this.w, _this.h) - 30) / 2 + 50 - 15) + 'px; "> </div>';
                    $("#bubble").append($(tmp));
                    var customOrtholog = null;
                    if (_this.treeRing.customOrtholog) {
                        customOrtholog = _this.treeRing.customOrtholog;
                    }
                    _this.expressionLabel = "Input expression file: "+ _this.selected_file.name;
                    var highLightPathways = _this.treeRing.highLightPathways;
                    _this.treeRing = null;
                    var orthologyFile = $menuBarbubble.find('#file').val();     //
                    _this.treeRing = new PATHBUBBLES.D3Ring(_this, Math.min(_this.w, _this.h) - 30, orthologyFile, _this.dataName);
                    _this.treeRing.file = "./data/Ortholog/" + orthologyFile + "/" + _this.dataName + ".json";
                    _this.treeRing.customExpression = expressionData;
                    _this.treeRing.ChangeLevel = true;
                    _this.treeRing.showCrossTalkLevel = parseInt($menuBarbubble.find('#crossTalkLevel').val());
                    if($menuBarbubble.find('#operateText').val() == "showTitle")
                    {
                        _this.treeRing.showTitle();
                        $menuBarbubble.find('#crossTalkLevel').hide();
                    }
                    else if($menuBarbubble.find('#operateText').val() == "showCrossTalk")
                    {
                        _this.treeRing.showCrossTalk();
                        $menuBarbubble.find('#crossTalkLevel').show();
                    }
                    if (customOrtholog) {
                        _this.treeRing.customOrtholog = customOrtholog;
                    }
                    _this.treeRing.highLightPathways = highLightPathways;
//                    _this.name = "(Expression) " + _this.selected_file.name;
                    _this.experiment_Type = "Expression";
                    _this.treeRing.init();
                });

            }
        });
    },
    deleteThisBubble: function (){
        var _this =this;
        if (!_this.GROUP)
            _this.deleteBubble();
        else {
            _this.ungroup();
            _this.deleteBubble();
        }
    },
    ungroup: function () {
        if (!this.GROUP) {
            alert("It is not Grouped, right now!");
        }
        else {
            var id=Math.floor((Math.random() * PATHBUBBLES.borderColors.length) );
            this.strokeColor = PATHBUBBLES.borderColors[id];
            this.GROUP = false;
            this.y =this.parent.children[this.parent.children.length -1].y - 20;
            this.parent.removeObject(this);
            scene.moveObjectToFront(this);
            this.parent = scene;
        }
    },
    deleteBubble: function () {
        if ($('#svg' + this.id).length)
            $('#svg' + this.id).remove();
        if ($('#menuView' + this.id).length)
            $('#menuView' + this.id).remove();
        for(var i=PATHBUBBLES.bubbleLinks.length-1;i>=0; i--)
        {
            if(PATHBUBBLES.bubbleLinks[i].startId ==this.id)
            {
                PATHBUBBLES.bubbleLinks.splice(i, 1);
                continue;
            }
            if(PATHBUBBLES.bubbleLinks[i].endId ==this.id)
            {
                PATHBUBBLES.bubbleLinks.splice(i, 1);
            }
        }
        scene.removeObject(this);
    },
    updateMenu: function () {
        if($('#status').length)
        {
            $('#status').css({
                left: this.x + this.offsetX + this.w/2 - 60,
                top: this.y + this.offsetY + this.h/2
            })
        }
        var $menuBarbubble = $('#menuView' + this.id);
        $menuBarbubble.css({
            left: this.x + this.offsetX + this.w + 10,
            top: this.y + this.offsetY + this.cornerRadius / 2 + 40,
            width: 250,
            height: 290
        });
        $menuBarbubble.find('#operateText').css({
            left: 10,
            top: 25,
            width: 220
        });
        $menuBarbubble.find('#crossTalkLevel').css({
            left: 10,
            top: 50,
            width: 220
        });
        $menuBarbubble.find('#orthologTypeDiv').css({
            left: 10,
            top: 75,
            width: 220
        });

        $menuBarbubble.find('#file').css({
            left: 0,
            top: 0,
            width: 220
        });
        $menuBarbubble.find('#customOrth').css({
            left: 0,
            top: 25,
            width: 220
        });
        $menuBarbubble.find('#loadOrthDiv').css({
            left: 0,
            top: 50,
            width: 220
        });

        if(this.checkUIElementVisible($menuBarbubble.find('#crossTalkLevel')) )
        {
            if(this.HIDE!==undefined&&this.HIDE==true)
            {
                $menuBarbubble.find('#orthologTypeDiv').hide();
                $menuBarbubble.find('#expressionTypeDiv').css({
                    left: 10,
                    top: 75,
                    width: 220
                });
            }
            else
            {
                $menuBarbubble.find('#orthologTypeDiv').show();
                $menuBarbubble.find('#expressionTypeDiv').css({
                    left: 10,
                    top: 155,
                    width: 220
                });
            }
        }
        else
        {
            if(this.HIDE!==undefined&&this.HIDE==true)
            {
                $menuBarbubble.find('#orthologTypeDiv').css({
                    left: 10,
                    top: 55,
                    width: 220
                });
                $menuBarbubble.find('#orthologTypeDiv').hide();
                $menuBarbubble.find('#expressionTypeDiv').css({
                    left: 10,
                    top: 55,
                    width: 220
                });
            }
            else
            {
                $menuBarbubble.find('#orthologTypeDiv').css({
                    left: 10,
                    top: 55,
                    width: 220
                });
                $menuBarbubble.find('#orthologTypeDiv').show();
                $menuBarbubble.find('#expressionTypeDiv').css({
                    left: 10,
                    top: 135,
                    width: 220
                });
            }
        }

        $menuBarbubble.find('#minMaxRatio').css({
            left: 0,
            top: 0,
            width: 220
        });
        $menuBarbubble.find('#customExp').css({
            left: 0,
            top: 40,
            width: 220
        });

        $menuBarbubble.find('#updownLabel').css({
            left: 0,
            top: 65,
            width: 220
        });
        $menuBarbubble.find('#loadExpDiv').css({
            left: 0,
            top: 105,
            width: 220
        });
    },
    checkUIElementVisible: function (element) {
        return ((element.css('display') !== 'none') && (element.css('visibility') !== 'hidden'));
    },
    addStatusElement: function () {
        var e = document.getElementById('status');
        if (e === null) {
            e = document.createElement("div");
            e.id = 'status';
        }
        else
            e.style.display = 'block';
        e.style.position = "absolute";
        e.style.fontWeight = 'bold';
        e.style.fontSize = "1.2em";
        e.style.color = "#f00";
        e.style.width = "100%";
        e.style.zIndex = 1000;
        e.innerHTML = "Processing ...";
        return e;
    },
    draw: function (ctx, scale) {
        this.setOffset();
        ctx.save();
        this.shape.draw(ctx, scale);
        var space = 6;
        if(this.treeRing!==undefined||this.treeRing!==null)
        {
            $('#svg' + this.id).css({
                width: this.w - 10 - space,      //leve 6 space for tree ring
                height: this.h - 10 - space,
                left: this.x + this.w / 2 - this.treeRing.defaultRadius / 2 - 10 + space / 2,
                top: this.y + this.h / 2 - this.treeRing.defaultRadius / 2 + 50 - 20 + space / 2
            });
        }

        //
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
        if(this.resetMenu.HighLight_State)
        {
            $("#svg"+this.id).find(".graphGroup").attr("transform","translate(0,0)scale(1)");
            this.resetMenu.HighLight_State = false;
        }
        if(this.ungroupMenu && scale == 1)
        {
            this.ungroupMenu.draw(ctx, scale);
            this.ungroupMenuText.fillColor = "#f00";
            this.ungroupMenuText.font = '15pt Calibri';
            this.ungroupMenuText.draw(ctx, this.ungroupMenu.x, this.ungroupMenu.y);
        }
        if(this.resetMenu && scale == 1)
        {
            this.resetMenu.draw(ctx, scale);
            this.resetMenuText.fillColor = "#f00";
            this.resetMenuText.font = '15pt Calibri';
            this.resetMenuText.draw(ctx, this.resetMenu.x, this.resetMenu.y);
        }
        if (this.menu.HighLight_State) {
            this.updateMenu();
            this.button.show();
        }
        else {
            this.updateMenu();
            this.button.hide();
        }
        this.processingStatus.draw(ctx, this.x+this.w/2, this.y+this.h/2);
        ctx.restore();

        if (this.shape.HighLight_State) {
            ctx.save();
            this.shape.drawStroke(ctx, scale);
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
        this.shape.strokeColor = this.strokeColor;
        this.shape.offsetX = this.offsetX;
        this.shape.offsetY = this.offsetY;
        this.shape.x = this.x;
        this.shape.y = this.y;
        this.menu.fillColor = this.strokeColor;
        this.ungroupMenu.fillColor = this.strokeColor;
        this.closeMenu.fillColor = this.strokeColor;
        this.resetMenu.fillColor = this.strokeColor;

        this.menu.x = this.x + this.w - this.cornerRadius / 2;
        this.menu.y = this.y + this.cornerRadius / 2;
        this.ungroupMenu.x = this.x + this.w - this.cornerRadius / 2 - (this.cornerRadius +5)*2;
        this.ungroupMenu.y = this.y + this.cornerRadius / 2;
        this.closeMenu.x = this.x + this.w - this.cornerRadius / 2 - this.cornerRadius -5;
        this.closeMenu.y = this.y + this.cornerRadius / 2;

        this.resetMenu.x = this.x + this.w - this.cornerRadius / 2 - (this.cornerRadius +5)*3;
        this.resetMenu.y = this.y + this.cornerRadius / 2;
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
            ctx.fillStyle = "#ff0000";
            ctx.fillRect(cur.x * scale, cur.y * scale, PATHBUBBLES.selectionBoxSize * scale, PATHBUBBLES.selectionBoxSize * scale);
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
    containsInResetMenu: function (mx, my) {
        var x = this.resetMenu.x;
        var y = this.resetMenu.y;
        return  (x - mx ) * (x - mx) + (y - my ) * (y - my) <= this.resetMenu.r * this.resetMenu.r;
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

        bubble.center = this.center;
        bubble.GROUP = this.GROUP;
        return bubble;
    }
};