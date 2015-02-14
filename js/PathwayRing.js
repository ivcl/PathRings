/**
 * @author      Yongnan
 * @version     1.0
 * @time        11/6/2014
 * @name        PathBubble_PathwayRing
 */
var $P = PATHBUBBLES;

$P.TreeRing = $P.defineClass(
	$P.BubbleBase,
	function (x, y, w, h, dataName, dataType, selectedData) {
    PATHBUBBLES.BubbleBase.call(this, {
			x: x, y: y, w: w, h: h,
			strokeStyle: '#0ff',
			fillStyle: '#fff',
			cornerRadius: 20,
			lineWidth: 10
		});

    this.button = new PATHBUBBLES.Button(this);   //Button 0 for file selection

    var tmp = '';
    tmp += '<input type="button" id=ungroup value= "Ungroup" style="position: absolute; left:' + this.x + ' px; top:' + this.y + 50 + 'px; ">';
    tmp += '<input type="button" id=delete value= "Delete" style="position: absolute; left:' + this.x + ' px; top:' + this.y + 75 + 'px; ">';
    tmp += '</div>';

    this.button.addButton(tmp);

    this.name = '';
    this.title = new $P.Title({
			parent: this,
			name: this.name,
			cornerRadius: this.cornerRadius,
			lineWidth: this.lineWidth});
    this.__objectsAdded = [];
    this.__objectsRemoved = [];
    this.center = {x: this.x + this.w / 2, y: this.y + this.h / 2};
    this.GROUP = false;},
	{
		addHtml: function () {
      this.setOffset();
      if (!this.dataType)
        this.dataType = "Gallus";
      this.treeRing = new $P.D3Ring(this, Math.min(this.w, this.h) - 30, this.dataType, this.dataName);
      this.treeRing.init();
		},
		addObject: function (object) {
      var index = this.children.indexOf(object);
      if (index > -1) {
        this.children.splice(index, 1);
      }
      this.children.push(object);
		},
		removeObject: function (object) {

      if ($('#svg' + this.id).length)
        $('#svg' + this.id).remove();
      if ($('#menuView' + this.id).length)
        $('#menuView' + this.id).remove();
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
      $menuBarbubble.children('#file').change(function () {
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

        _this.treeRing = null;
        _this.treeRing = new PATHBUBBLES.D3Ring(_this, Math.min(_this.w, _this.h) - 30, val, _this.dataName);
        _this.treeRing.file = "./data/Ortholog/" + val + "/" + _this.dataName + ".json";
        _this.treeRing.showCrossTalkLevel = parseInt($menuBarbubble.children('#crossTalkLevel').val());
        if (customExpression) {
          _this.treeRing.customExpression = customExpression;
          _this.name = "(Expression) " + _this.selected_file.name;
        }
        else {
          _this.name = _this.pre + val;
        }

        _this.treeRing.init();
      });
      $menuBarbubble.children('#crossTalkLevel').change(function () {
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
        _this.treeRing = null;

        var fileVal = $('#menuView' + _this.id).children('#file').val();
        _this.treeRing = new PATHBUBBLES.D3Ring(_this, Math.min(_this.w, _this.h) - 30, fileVal, _this.dataName);

        _this.treeRing.ChangeLevel = true;
        _this.treeRing.showCrossTalkLevel = val;
        _this.treeRing.file = "./data/Ortholog/" + fileVal + "/" + _this.dataName + ".json";
        if (orthlogData) {
          _this.treeRing.customOrtholog = orthlogData;
          _this.name = _this.pre + "custom";
        }
        if (expressionData) {
          _this.treeRing.customExpression = expressionData;
          _this.name = "(Expression) " + _this.selected_file.name;
        }
        _this.treeRing.init();
				//            if ($menuBarbubble.find('#customOrth' ).get(0).files[0] !== undefined) {
				////                if ($menuBarbubble.find('#customOrth' + _this.id).get(0).files[0] !== undefined) {
				//                var localFileLoader = new PATHBUBBLES.FileLoader("Ortholog");
				//                localFileLoader.load(_this.selected_file, function (orthlogData) {
				//                    _this.treeRing.customOrtholog = orthlogData;
				//                    _this.treeRing.customExpression = null;
				//                    _this.name = _this.pre + "custom";
				//                });
				//                _this.treeRing.init();
				//            }
				//            else if ($menuBarbubble.find('#customExp' ).get(0).files[0] !== undefined) {
				////            else if ($menuBarbubble.find('#customExp' + _this.id).get(0).files[0] !== undefined) {
				//                var localFileLoader = new PATHBUBBLES.FileLoader("Expression");
				//                localFileLoader.load(_this.selected_file, function (expression) {
				//                    _this.treeRing.customExpression = expression;
				//                    _this.treeRing.customOrtholog = null;
				//                    if ($menuBarbubble.find('#customExp' ).get(0).files[0] !== undefined)
				//                        _this.name = "(Expression) " + $menuBarbubble.find('#customExp' ).get(0).files[0].name;
				////                    if ($menuBarbubble.find('#customExp' + _this.id).get(0).files[0] !== undefined)
				////                        _this.name = "(Expression) " + $menuBarbubble.find('#customExp' + _this.id).get(0).files[0].name;
				//                });
				//                _this.treeRing.init();
				//            }
				//            else {
				//                _this.treeRing.init();
				//            }
      });
      $menuBarbubble.find('#delete').on('click', function () {
        if (!_this.GROUP)
          _this.deleteBubble();
        else {
          var id = _this.id;
          var group = _this.parent;
          _this.GROUP = false;
          var tempdata = [];
          for (var i = 0; i < group.children.length; ++i) {
            if (group.children[i].id !== _this.id) {
              var a = group.children[i];
              a.parent = undefined;
              tempdata.push(a);
            }
          }
          _this.parent = undefined;
          _this.deleteBubble();
          group.tempPoints.length = 0;
          group.arranged.length = 0;
          group.children.length = 0;
          for (var i = 0; i < tempdata.length; ++i) {
            group.RESET = true;
            group.add(tempdata[i]);
          }
          group.RESET = false;
          scene.addObject(group);
        }
      });
      $menuBarbubble.find('#ungroup').on('click', function () {
        _this.ungroup();
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
            _this.treeRing = null;
            var val = $menuBarbubble.children('#file').val();
            _this.treeRing = new PATHBUBBLES.D3Ring(_this, Math.min(_this.w, _this.h) - 30, val, _this.dataName);
            _this.treeRing.file = "./data/Ortholog/" + val + "/" + _this.dataName + ".json";
            _this.treeRing.showCrossTalkLevel = parseInt($menuBarbubble.children('#crossTalkLevel').val());
            _this.treeRing.customOrtholog = orthlogData;
            if (customExpression) {
              _this.treeRing.customExpression = customExpression;
            }
						//                    _this.treeRing.renderType = "Ortholog";
            _this.name = _this.pre + "custom";
            $menuBarbubble.find('#file').val("Default");
            _this.treeRing.init();
          });
        }
      });
      $menuBarbubble.find('#customOrth').on('change', function () {
				//        $menuBarbubble.find('#customOrth' + _this.id).on('change', function () {
        var temp = $(this).val();
        if (temp == "")
          return;
        $menuBarbubble.find("label[for=customOrth" + "]").text(temp.replace(/^.*[\\\/]/, ''));
				//            $menuBarbubble.find("label[for=customOrth" + _this.id + "]").text(temp.replace(/^.*[\\\/]/, ''));
      });
      $menuBarbubble.find('#loadExp').on('click', function () {
        _this.selected_file = $menuBarbubble.find('#customExp' ).get(0).files[0];
				//            _this.selected_file = $menuBarbubble.find('#customExp' + _this.id).get(0).files[0];
        if (!_this.selected_file) {
          alert("Please select your Expression data file!");
        }
        else {
          var minRatio = $menuBarbubble.find('#minRatio').val();
          var maxRatio = $menuBarbubble.find('#maxRatio').val();
          if (minRatio == "")
            minRatio = "0.5";
          if (maxRatio == "")
            maxRatio = "2.0";
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
            _this.treeRing = null;
            var orthologyFile = $menuBarbubble.children('#file').val();     //
						//                    var functionType =$menuBarbubble.children('#type').val();

            _this.treeRing = new PATHBUBBLES.D3Ring(_this, Math.min(_this.w, _this.h) - 30, orthologyFile, _this.dataName);
            _this.treeRing.file = "./data/Ortholog/" + orthologyFile + "/" + _this.dataName + ".json";
            _this.treeRing.customExpression = expressionData;
            _this.treeRing.showCrossTalkLevel = parseInt($menuBarbubble.children('#crossTalkLevel').val());
            if (customOrtholog) {
              _this.treeRing.customOrtholog = customOrtholog;
            }
						//                    _this.treeRing.renderType = "Expression";
            _this.name = "(Expression) " + _this.selected_file.name;
            _this.treeRing.init();
          });
        }
      });
			//        $menuBarbubble.find('#customExp' + _this.id).on('change', function () {
      $menuBarbubble.find('#customExp' ).on('change', function () {
        var temp = $(this).val();
        if (temp == "")
          return;
        $menuBarbubble.find("label[for=customExp" + "]").text(temp.replace(/^.*[\\\/]/, ''));
				//            $menuBarbubble.find("label[for=customExp" + _this.id + "]").text(temp.replace(/^.*[\\\/]/, ''));
      });
		},
		ungroup: function () {
      if (!this.GROUP) {
        alert("It is not Grouped, right now!");
      }
      else {
        var id=Math.floor((Math.random() * PATHBUBBLES.borderColors.length) + 1);
        this.strokeColor = PATHBUBBLES.borderColors[id];
        var group = this.parent;
        this.GROUP = false;
        var tempdata = [];
        for (var i = 0; i < group.children.length; ++i) {
          if (group.children[i].id !== this.id) {
            var a = group.children[i];
            a.parent = undefined;
            tempdata.push(a);
          }
        }
        this.parent = undefined;     //just has one set
        group.tempPoints.length = 0;
        group.arranged.length = 0;
        group.children.length = 0;
        for (var i = tempdata.length - 1; i >= 0; i--) {
          group.RESET = true;
          group.add(tempdata[i]);
        }
        group.RESET = false;
        scene.addObject(group);
      }
		},
		deleteBubble: function () {
      if ($('#svg' + this.id).length)
        $('#svg' + this.id).remove();
      if ($('#menuView' + this.id).length)
        $('#menuView' + this.id).remove();
      this.removeObject(this);
		},
		updateMenu: function () {
      var $menuBarbubble = $('#menuView' + this.id);
      $menuBarbubble.css({
        left: this.x + this.offsetX + this.w + 10,
        top: this.y + this.offsetY + this.cornerRadius / 2 + 40,
        width: 200,
        height: 265
      });
      $menuBarbubble.find('#crossTalkLevel').css({
        left: 10,
        top: 25,
        width: 180
      });
      $menuBarbubble.find('#ungroup').css({
        left: 10,
        top: 50,
        width: 180
      });
      $menuBarbubble.find('#delete').css({
        left: 10,
        top: 75,
        width: 180
      });
      $menuBarbubble.find('#file').css({
        left: 10,
        top: 100,
        width: 180
      });
      $menuBarbubble.find('#customOrth').css({
        left: 10,
        top: 125,
        width: 180
      });
      $menuBarbubble.find('#loadOrthDiv').css({
        left: 10,
        top: 150,
        width: 180
      });
      $menuBarbubble.find('#customExp').css({
        left: 10,
        top: 175,
        width: 180
      });
      $menuBarbubble.find('#minMaxRatio').css({
        left: 10,
        top: 200,
        width: 180
      });
      $menuBarbubble.find('#loadExpDiv').css({
        left: 10,
        top: 225,
        width: 180
      });
		},
		draw: function (ctx, scale) {
      this.setOffset();
      ctx.save();
      this.shape.draw(ctx, scale);
      var space = 6;
      $('#svg' + this.id).css({
        width: this.w - 10 - space,      //leve 6 space for tree ring
        height: this.h - 10 - space,
        left: this.x + this.w / 2 - this.treeRing.defaultRadius / 2 - 10 + space / 2,
        top: this.y + this.h / 2 - this.treeRing.defaultRadius / 2 + 50 - 20 + space / 2
      });
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
            num--;
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
      if (this.menu && scale == 1) {
        this.menu.draw(ctx, scale);
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
        ctx.restore();
      }
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

      bubble.center = this.center;
      bubble.GROUP = this.GROUP;
      return bubble;
		}
	});
