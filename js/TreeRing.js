(function($P){
	'use strict';

	$P.TreeRing = $P.defineClass(
		$P.BubbleBase,
		function TreeRing(config) {
			this.processingStatus = new PATHBUBBLES.Text(this, "Processing");

			this.expressionLabel = "";

			this.dataName = config.dataName || null;

			this.dataType = config.dataType || null;
			this.selectedData = config.selectedData || null;
			this.experimentType = "Ortholog";
			this.preHierarchical = "";

			this.selected_file = null;

			this._minRatio = config.minRatio || -1.5;
			this._maxRatio = config.maxRatio || 1.5;
			this._crosstalkLevel = config.crosstalkLevel || 1;
			this._file = config.file || null;
			this._operateText = config.operateText || null;
			this._upLabel = config.upLabel || 'Up Expressed';
			this._downLabel = config.downLabel || 'Down Expressed';
			this.displayMode = config.displayMode || 'title';
			this._species = config.species || 'Gallus';

			config.name = this.dataName || 'human';
			config.minSize = undefined !== config.minSize ? config.minSize : 'current';
			$.extend(config, {mainMenu: true, closeMenu: true, groupMenu: true});
			$P.BubbleBase.call(this, config);},
		{
			get minRatio() {return this._minRatio;},
			set minRatio(value) {
				if (value === this._minRatio) {return;}
				this._minRatio = value;
				if (this.menu) {this.menu.updateRatio();}},
			get maxRatio() {return this._maxRatio;},
			set maxRatio(value) {
				if (value === this._maxRatio) {return;}
				this._maxRatio = value;
				if (this.menu) {this.menu.updateRatio();}},
			get ratios() {return [this._minRatio, this._maxRatio];},
			set ratios(value) {
				this._minRatio = value[0];
				this._maxRatio = value[1];
				if (this.menu) {this.menu.updateRatio();}},
			get crosstalkLevel() {return this._crosstalkLevel;},
			set crosstalkLevel(value) {
				if (value === this._crosstalkLevel) {return;}
				this._crosstalkLevel = value;
				if (this.menu) {this.menu.crosstalkLevel = value;}
				if (this.svg) {this.createSvg({changeLevel: true, crossTalkLevel: value});}
				this.displayMode = 'crosstalk';},
			get species() {return this._species;},
			set species(value) {
				if (value === this._species) {return;}
				this._species = value;
				if (this.menu) {this.menu.species = value;}
				if (this.svg) {
					this.createSvg({filename: './data/Ortholog/' + value + '/' + this.dataName + '.json'});}},
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
			set upLabel(value) {this._upLabel = value;},
			get downLabel() {return this._downLabel;},
			set downLabel(value) {this._downLabel = value;},
			get displayMode() {return this._displayMode;},
			set displayMode(value) {
				if (this._displayMode == value) {return;}
				this._displayMode = value;
				if (this.menu) {this.menu.updateDisplayMode(value);}
				if (this.svg) {this.svg.displayMode = value;}},
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
			var i, tmp, menu, bubble, element;
			tmp = '';

			tmp += '<div style="border: 1px solid #444; margin: 1px; padding: 4%;">';
			tmp +=   '<div style="width: 100%; font-weight: bold; text-align: center;">Display</div>';
			tmp +=   '<hr/>';

			tmp +=   '<ul class="button-group"';
			tmp +=       'style="list-style: none; width: 100%; text-align: center; margin: 5px 0;">';
			tmp +=     '<li id="titleMode" style="display: inline-block; border: 1px solid #000; width: 45%; margin: 0 1% 0 4%;">';
			tmp +=       '<a id="titleModeA" href="#" style="text-decoration: none; font-size: 90%;">';
			tmp +=         'Pathway Names';
			tmp +=       '</a>';
			tmp +=     '</li>';
			tmp +=     '<li id="crosstalkMode" style="display: inline-block; border: 1px solid #000; width: 40%; margin: 0 4% 0 1%;">';
			tmp +=       '<a id="crosstalkModeA" href="#" style="text-decoration: none; font-size: 90%;">';
			tmp +=         'Crosstalk';
			tmp +=       '</a>';
			tmp +=     '</li>';
			tmp +=   '</ul>';

			tmp +=   '<div style="display: inline; font-size: 90%; margin: auto 5% auto 0;">Species:</div>';
			tmp +=   '<select id="selectSpecies" style="display: inline-block;">';
			this.getSpeciesList().forEach(function(species) {
				tmp += '<option value="' + species + '">' + species + '</option>';});
			tmp +=   '</select>';
			tmp +=   '<br/>';

			tmp +=   '<div style="display: inline; font-size: 90%; margin: auto 5% auto 0;">Crosstalk Level:</div>';
			tmp +=   '<select id="crosstalkLevel" style="display: inline-block;">';
			for (i = 1; i <= 6; ++i) {
				tmp += '<option value="' + i + '">' + i + '</option>';}
			tmp +=   '</select>';
			tmp += '</div>';

			tmp += '<div style="border: 1px solid #444; margin: 1px; padding: 4%;">';
			tmp +=   '<div style="width: 100%; font-weight: bold; text-align: center;">Load File</div>';
			tmp +=   '<hr/>';

			tmp +=   '<div style="width: 100%; font-size: 90%; text-align: center;">Ortholog:</div>';
			tmp +=   '<input type="file" id="orthologFile" style="display: inline-block;"/>';
			tmp +=   '<br/>';

			tmp +=   '<div style="width: 100%; font-size: 90%; text-align: center;">Expression:</div>';
			tmp +=   '<input type="file" id="expressionFile" style="display: inline-block;"/>';
			tmp +=   '<div id="expressionRatios" style="margin: 10px 0;"><br/>';
			tmp +=   '<div style="font-size: 80%; display: inline; margin: auto 0;">Ratio (log2):</div>';
			tmp +=   '<input id="minRatio" type="text" style="display: inline-block; width: 20%; text-align: center;"/>';
			tmp +=   '...';
			tmp +=   '<input id="maxRatio" type="text" style="display: inline-block; width: 20%; text-align: center;"/>';
			tmp +=   '<input id="updateRatio" type="button" value="Update" style="margin: auto 5px;"/>';
			tmp +=   '<br/>';

			tmp += '</div>';
			tmp += '<br style="display: table; clear: both;"/>';

			/*
			tmp += '<div id=loadFileDiv style="position: absolute; left: 0px; top: 90px; width: 260px; ' +
				                                'font-size: 9pt;">';
			tmp +=   '<div id=loadExpressionDiv>';
			tmp +=     '<div style="position: absolute; top: 30px;">Expression: </div>';
			tmp +=     '<input type="file" id="inputFileExpression" ' +
				                 'style="position: absolute; top: 25px; left: 60px;"/>';
			tmp +=     '<div style="position: absolute; top: 45px; left: 10px;">';
			tmp +=       'With Ratio (log2):';
			tmp +=       '<input id="minRatio" type="text" placeholder="-1.5" ' +
				                   'style="display: inline; width: 40px; margin: 5px;"/>';
			tmp +=       '...';
			tmp +=       '<input id="maxRatio" type="text" placeholder="1.5" ' +
				                   'style="display: inline; width: 40px; margin: 5px;"/>';
			tmp +=     '</div>';
			tmp +=   '</div>';
			tmp += '</div>';
			 */

			config.menuString = tmp;
			config.w = null;
			config.h = null;
			$P.HtmlMenu.call(this, config);

			menu = this;
			bubble = this.parent;
			element = $(this.element);

			element.find('#titleModeA').click(function() {
				bubble.displayMode = 'title';});

			element.find('#crosstalkModeA').click(function() {
				bubble.displayMode = 'crosstalk';});

			element.find('#selectSpecies').change(function() {
				bubble.species = $(this).val();});

			element.find('#crosstalkLevel').change(function () {
				bubble.crosstalkLevel = $(this).val();});
			element.find('#crossTalkLevel').val(bubble.crossTalkLevel);

			element.find('#orthologFile').change(function() {menu.loadOrtholog();});
			element.find('#expressionFile').change(function() {menu.loadExpression();});
			element.find('#expressionRatios').slider({
				range: true,
				min: -10,
				max: 10,
				step: 0.1,
				values: [-1.5, 1.5],
				slide: function(event, ui) {
					bubble.minRatio = ui.values[0];
					bubble.maxRatio = ui.values[1];}});
			element.find('#minRatio').change(function() {
				bubble.minRatio = $(this).val();});
			element.find('#maxRatio').change(function() {
				bubble.maxRatio = $(this).val();});
			element.find('#updateRatio').on('click', function() {menu.loadExpression();});


			/*
			 element.find('#loadOrth').on('click', function () {
				var loader;
				bubble.selectedFile = element.find('#customOrth').get(0).files[0];
				if (!bubble.selectedFile) {
					alert('Please select your Ortholog data file!');
					return;}

				loader = new $P.FileLoader('Ortholog');
				loader.load(bubble.selectedFile, function (orthologData) {
					var config = {
						customOrtholog: orthologData,
						filename: './data/Ortholog/' + bubble.file + '/' + bubble.dataName + '.json',
						changeLevel: true};
					bubble.orthologLabel = 'Input ortholog file: ' + bubble.selectedFile.name;
					bubble.file = 'Default';
					bubble.experimentType = "Ortholog";
					bubble.createSvg(config);});
			});
			 */

			this.updateRatio();
			this.updateDisplayMode(bubble.displayMode);
			this.onPositionChanged();},
		{
			updateDisplayMode: function(displayMode) {
				var element = $(this.element),
						button;

				// Pressed.
				element.find('title' === displayMode ? '#titleMode' : '#crosstalkMode').css({
					background: '#ff8'});
				element.find('title' === displayMode ? '#titleModeA' : '#crosstalkModeA').css({
					color: '#000'});

				// Unpressed.
				element.find('title' === displayMode ? '#crosstalkMode' : '#titleMode').css({
					background: this.element.style.background});
				element.find('title' === displayMode ? '#crosstalkModeA' : '#titleModeA').css({
					color: '#444'});},
			updateRatio: function() {
				var element = $(this.element),
						bubble = this.parent;
				element.find('#expressionRatios').slider('values', [bubble.minRatio, bubble.maxRatio]);
				element.find('#minRatio').val(bubble.minRatio);
				element.find('#maxRatio').val(bubble.maxRatio);},
			getSpeciesList: function() {
				return ['Gallus', 'Alligator', 'Turtle', 'Human'];},
			set species(value) {
				$(this.element).find('#selectSpecies').val(value);},
			set crosstalkLevel(value) {
				$(this.element).find('#crosstalkLevel').val(value);},
			loadOrtholog: function() {
				var menu = this,
						bubble = this.parent,
						element = $(this.element),
						file = element.find('#orthologFile').get(0).files[0],
						loader;
				bubble.selectedFile = file;
				if (!file) {
					alert('Please select your Ortholog data file!');
					return;}

				loader = new $P.FileLoader('Ortholog');
				loader.load(bubble.selectedFile, function (orthologData) {
					var config = {
						customOrtholog: orthologData,
						filename: './data/Ortholog/' + bubble.species + '/' + bubble.dataName + '.json',
						changeLevel: true};
					//bubble.orthologLabel = 'Input ortholog file: ' + bubble.selectedFile.name;
					bubble.experimentType = 'Ortholog';
					bubble.createSvg(config);});},
			loadExpression: function() {
				var menu = this,
						bubble = this.parent,
						file = $(this.element).find('#expressionFile').get(0).files[0],
						loader;

				bubble.selectedFile = file;
				if (!file) {
					alert('Please select your Expression data file!');
					return;}

				loader = new $P.FileLoader('Expression');
				loader.load(bubble.selectedFile, function (expressionData) {
					var config = {
						filename: './data/Ortholog/' + bubble.species + '/' + bubble.dataName + '.json',
						customExpression: expressionData,
						changeLevel: true};
					bubble.expressionLabel = 'Input expression file: ' + bubble.selectedFile.name;
					bubble.experimentType = 'Expression';
					bubble.createSvg(config);});},
			onPositionChanged: function (dx, dy, dw, dh) {
				var crossTalkLevel = this.element.querySelector('#crossTalkLevel'),
						orthologTypeDiv = this.element.querySelector('#orthologTypeDiv'),
						expressionTypeDiv = this.element.querySelector('#expressionTypeDiv');

				if (!crossTalkLevel) {
					$P.HtmlMenu.prototype.onPositionChanged.call(this, dx, dy, dw, dh);
					return;} // not yet initialized.
				// ???
				if($('#status').length)
				{
					$('#status').css({
						left: this.parent.x + this.parent.w/2 - 60,
						top: this.parent.y + this.parent.h/2
					});
				}

				$P.HtmlMenu.prototype.onPositionChanged.call(this, dx, dy, dw, dh);
			}});
})(PATHBUBBLES);
