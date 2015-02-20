(function($P){
	'use strict';

	$P.TreeRing = $P.defineClass(
		$P.BubbleBase,
		function TreeRing(config) {
			this.processingStatus = new PATHBUBBLES.Text(this, "Processing");

			this.orthologLabel = 'Gallus';
			this.expressionLabel = "";

			this.dataName = config.dataName || null;

			this.dataType = config.dataType || null;
			this.selectedData = config.selectedData || null;
			this.experiment_Type = "Ortholog";
			this.preHierarchical = "";

			this.selected_file = null;

			this._minRatio = config.minRatio || -1.5;
			this._maxRatio = config.maxRatio || 1.5;
			this._crossTalkLevel = config.crossTalkLevel || 1;
			this._file = config.file || null;
			this._operateText = config.operateText || null;
			this._upLabel = config.upLabel || 'Up Expressed';
			this._downLabel = config.downLabel || 'Down Expressed';

			config.name = this.dataName || 'human';
			config.minSize = undefined !== config.minSize ? config.minSize : 'current';
			$.extend(config, {mainMenu: true, closeMenu: true, groupMenu: true});
			$P.BubbleBase.call(this, config);},
		{
			get minRatio() {return this._minRatio;},
			set minRatio(value) {
				this._minRatio = value;
				if (this.menu) {
					$(this.menu.element).find('#minRatio').val(this._minRatio);}},
			get maxRatio() {return this._maxRatio;},
			set maxRatio(value) {
				this._maxRatio = value;
				if (this.menu) {
					$(this.menu.element).find('#maxRatio').val(this._maxRatio);}},
			get crossTalkLevel() {return this._crossTalkLevel;},
			set crossTalkLevel(value) {
				this._crossTalkLevel = value;
				if (this.menu) {
					$(this.menu.element).find('#crossTalkLevel').val(this._crossTalkLevel);}},
			get file() {return this._file;},
			set file(value) {
				this._file = value;
				if (this.menu) {
					$(this.menu.element).find('#file').val(this._file);}},
			get operateText() {return this._operateText;},
			set operateText(value) {
				this._operateText = value;
				if (this.menu) {
					$(this.menu.element).find('#operateText').val(this._operateText);}},
			get upLabel() {return this._upLabel;},
			set upLabel(value) {
				this._upLabel = value;
				if (this.menu) {
					$(this.menu.element).find('#upLabel').val(this._upLabel);}},
			get downLabel() {return this._downLabel;},
			set downLabel(value) {
				this._downLabel = value;
				if (this.menu) {
					$(this.menu.element).find('#downLabel').val(this._downLabel);}},


			onAdded: function(parent) {
				if (!$P.BubbleBase.prototype.onAdded.call(this, parent)) {
					this.createSvg();}},

			/**
			 * (Re)creates the svg component.
			 * @param {object} [config] - optional config paremeters.
			 */
			createSvg: function(config) {
				var actual_config = Object.create(this.svg || null); // Automatically use parameters from existing svg.
				if (!this.dataType) {this.dataType = 'Gallus';}
				$.extend(actual_config, {
					defaultRadius: Math.min(this.w, this.h) - 30,
					dataType: this.dataType,
					selectedData: this.selectedData,
					name: this.dataName});
				actual_config = $.extend(actual_config, this.getInteriorDimensions());
				actual_config.x += 8;
				actual_config.y += 8;
				actual_config.w -= 16;
				actual_config.h -= 16;
				actual_config = $.extend(actual_config, config);
				if (this.svg) {this.svg.delete();}
				actual_config.parent = this;
				this.svg = new $P.D3TreeRing(actual_config);
				this.svg.init();},
			/**
			 * Removes the svg component.
			 */
			deleteSvg: function() {
				this.svg.delete();
				this.svg = null;},
			createMenu: function() {
				this.menu = new $P.TreeRing.Menu({parent: this});},
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

			receiveEvent: function(event) {
				if ('reactionDrag' == event.name && this.contains(event.x, event.y)) {return this;}
				return $P.BubbleBase.prototype.receiveEvent.call(this, event);},

			drawSVG: function() {
				var space = 6; // leave 6 space for tree ring
				$('#svg' + this.id).css({
					width: this.w - 10 - space,
					height: this.h - 10 - space,
					left: this.x + this.w / 2 - this.treeRing.defaultRadius / 2 - 10 + space / 2,
					top: this.y + this.h / 2 - this.treeRing.defaultRadius / 2 + 50 - 20 + space / 2
				});
			},
			drawExtra: function(ctx, scale) {this.processingStatus.draw(ctx, this.x+this.w/2, this.y+this.h/2);}
		});

	$P.TreeRing.Menu = $P.defineClass(
		$P.HtmlMenu,
		function TreeRingMenu(config) {
			var tmp, bubble, element;
			tmp = '';
			tmp += '<select id="operateText" style="position: absolute; left: 10px; top: 25px; width: 220px;">';
			tmp += '<option value="showTitle">Show Pathway Name</option>';
			tmp += '<option value="showCrossTalk">Show CrossTalk</option>';
			tmp += '</select>';

			tmp += '<select id="crossTalkLevel" style="display: none; position: absolute; left: 10px; top: 50px; width: 220px;">';
			tmp += '</select>';

			tmp += '<div id="orthologTypeDiv" style="position: absolute; left: 10px; top: 75px; width:220px;">';
			tmp += '<select id="file" style="position: absolute; left: 0px; top: 0px; width: 220px;">';
			tmp += '<option value="Default">Choose Species</option>';
			tmp += '<option value="Gallus" selected="selected">Gallus</option>';
			tmp += '<option value="Alligator">Alligator</option>';
			tmp += '<option value="Turtle">Turtle</option>';
			tmp += '<option value="Human">Human</option>';
			tmp += '</select>';
			tmp += '<input type="file" id="customOrth"  style="position: absolute; left: 0px; top: 25px; width: 220px;">';
			tmp += '<div id=loadOrthDiv style="position: absolute; left: 0px; top: 50px; width: 220px;">';
			tmp += '<input type="button" id=loadOrth value= "Load(Ortholog)" >';
			tmp += '<a href="./data/sample/Orthology.example1.txt" target="_blank" download><button style="position: absolute; margin-left:10px"><font style="font-size: 10px">Sample Data</font></button></a>';
			tmp += '</div>';
			tmp += '</div>';
			tmp += '<div id="expressionTypeDiv" style="position: absolute; left: 10px; width: 220px;">';
			tmp += '<div id=minMaxRatio style="position: absolute; left: 0px; top: 0px; width: 220px;">';
			tmp += '<div style="float: left">';
			tmp += 'Ratio(log 2 based): &gt;=';
			tmp += '   <input id = "maxRatio" type="text"  placeholder="1.5"  style="display: inline; width: 40px;" />';
			tmp += '</div>';
			tmp += '<div style="float: left">';
			tmp += 'Ratio(log 2 based): &lt;=';
			tmp += '    <input id = "minRatio" type="text"  placeholder="-1.5" style="display: inline; width: 40px;" />';
			tmp += '</div>';
			tmp += '</div>';

			tmp += '<div id=updownLabel style="position: absolute; left: 0px; top: 65px; width: 220px">';
			tmp += '<div style="float: left">';
			tmp += 'Label for &nbsp; up&nbsp;&nbsp;   expressed:';
			tmp += '   <input id = "upLabel" type="text"  placeholder="Up expressed"  style="display: inline; width: 90px;" />';
			tmp += '</div>';
			tmp += '<div style="float: left">';
			tmp += 'Label for down expressed:';
			tmp += '    <input id = "downLabel" type="text"  placeholder="Down expressed" style="display: inline; width: 90px;" />';
			tmp += '</div>';
			tmp += '</div>';

			tmp += '<input type="file" id="customExp" style="position: absolute; left: 0px; top: 40px; width: 220px">';
			tmp += '<div id=loadExpDiv style="position: absolute; left: 0px; top: 105px; width: 220px;">';
			tmp += '<input type="button" id=loadExp value= "Load(Expression)" >';
			tmp += '<a href="./data/sample/GeneExpression.TGF.txt" target="_blank" download><button style="position: absolute; margin-left:10px"><font style="font-size: 10px">Sample Data</font></button></a>';
			tmp += '</div>';
			tmp += '</div>';

			config.menuString = tmp;
			config.w = config.w || 250;
			config.h = config.h || 290;
			$P.HtmlMenu.call(this, config);

			bubble = this.parent;
			element = $(this.element);

			element.find('#operateText').change(function (){
				var val = $(this).val();
				bubble._operateText = val;
				if ('showTitle' == val) {bubble.svg.displayMode = 'title';}
				else if ('showCrossTalk' == val) {bubble.svg.displayMode = 'crosstalk';}
			});
			//element.find('#operateText').val(bubble.operateText);

			element.find('#file').change(function () {
				var val = $(this).val(),
						config;
				if (val == undefined) {return;}
				bubble._file = val;
				config = {
					filename: './data/Ortholog/' + val + '/' + bubble.dataName + '.json',
					crosstalkLevel: parseInt(element.find('#crossTalkLevel').val()),
					changeLevel: true};
				bubble.createSvg(config);

				bubble.name = val;
				bubble.orthologLabel = val;
			});
			//element.find('#file').val(bubble.file);

			element.find('#crossTalkLevel').change(function () {
				var val = $(this).val(),
						config;
				if (!val) {return;}
				bubble._crossTalkLevel = val;
				config = {
					filename: './data/Ortholog/' + element.find('#file').val() + '/' + bubble.dataName + '.json',
					changeLevel: true,
					crossTalkLevel: val};
				bubble.deleteSvg();
				bubble.createSvg(config);
			});
			element.find('#crossTalkLevel').val(bubble.crossTalkLevel);

			element.find('#loadOrth').on('click', function () {
				var loader;
				bubble.selected_file = element.find('#customOrth').get(0).files[0];
				if (!bubble.selected_file) {
					alert('Please select your Ortholog data file!');
					return;}

				loader = new $P.FileLoader('Ortholog');
				loader.load(bubble.selected_file, function (orthologData) {
					var config = {
						customOrtholog: orthologData,
						filename: './data/Ortholog/' + bubble.file + '/' + bubble.dataName + '.json',
						changeLevel: true};
					bubble.orthologLabel = 'Input ortholog file: ' + bubble.selected_file.name;
					bubble.file = 'Default';
					bubble.experiment_Type = "Ortholog";
					bubble.createSvg(config);});
			});

			element.find('#loadExp').on('click', function () {
				var operateText = bubble.operateText,
						loader;

				bubble.selected_file = element.find('#customExp').get(0).files[0];
				if (!bubble.selected_file) {
					alert('Please select your Expression data file!');
					return;}

				bubble.menuHidden = true;

				loader = new $P.FileLoader('Expression');
				loader.load(bubble.selected_file, function (expressionData) {
					var config = {
						filename: './data/Ortholog/' + element.find('#file').val() + '/' + bubble.dataName + '.json',
						customExpression: expressionData,
						changeLevel: true};

					bubble.expressionLabel = 'Input expression file: ' + bubble.selected_file.name;
					bubble.experiment_Type = 'Expression';
					bubble.createSvg(config);});
			});

			element.find('#upLabel').change(function() {
				bubble._upLabel = $(this).val();});
			element.find('#upLabel').val(bubble.upLabel);

			element.find('#downLabel').change(function() {
				bubble._downLabel = $(this).val();});
			element.find('#downLabel').val(bubble.downLabel);

			element.find('#minRatio').change(function() {
				bubble._minRatio = $(this).val();});
			element.find('#minRatio').val(bubble.minRatio);

			element.find('#maxRatio').change(function() {
				bubble._maxRatio = $(this).val();});
			element.find('#maxRatio').val(bubble.maxRatio);

			this.onPositionChanged();},
		{
			onPositionChanged: function (dx, dy, dw, dh) {
				var crossTalkLevel = this.element.querySelector('#crossTalkLevel'),
						orthologTypeDiv = this.element.querySelector('#orthologTypeDiv'),
						expressionTypeDiv = this.element.querySelector('#expressionTypeDiv');

				if (!crossTalkLevel) {return;} // not yet initialized.
				// ???
				if($('#status').length)
				{
					$('#status').css({
						left: this.parent.x + this.parent.w/2 - 60,
						top: this.parent.y + this.parent.h/2
					});
				}

				if ($P.isHtmlElementVisible(crossTalkLevel)) {
					if (this.menuHidden) {
						$(orthologTypeDiv).hide();
						expressionTypeDiv.style.top = '75px';}
					else {
						$(orthologTypeDiv).show();
						expressionTypeDiv.style.top = '155px';}}
				else {
					orthologTypeDiv.style.top = '55px';
					if (this.menuHidden) {
						$(orthologTypeDiv).hide();
						expressionTypeDiv.style.top = '55px';}
					else {
						$(orthologTypeDiv).show();
						expressionTypeDiv.style.top = '135px';}}

				$P.HtmlMenu.prototype.onPositionChanged.call(this, dx, dy, dw, dh);
			}});
})(PATHBUBBLES);
