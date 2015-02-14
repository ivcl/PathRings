/**
 * @author      Yongnan
 * @version     1.0
 * @time        10/18/2014
 * @name        PathBubble_Table
 */
var $P = PATHBUBBLES;

$P.Table = $P.defineClass(
	$P.BubbleBase,
	function Table(config) {
		this.dbId = config.dbId;
		this.dataName = config.name || null;
		if (this.dataName) {this.name = this.dataName;}
		else {this.name = 'Table';}
		this.selectedFile = null;
		this.data = config.data || null;
		this.queryObject = config.queryObject || null;
		this.crosstalking = config.crosstalking || null;
		this.experimentType = config.experimentType || 'Ortholog';
		this.preHierarchical = config.preHierarchical || '';

		$.extend(config, {mainMenu: true, closeMenu: true, groupMenu: true});
		$P.BubbleBase.call(this, config);
	}, {
		onAdded: function(parent) {
			var config;

			$P.BubbleBase.prototype.onAdded.call(this, parent);

			if (!this.svg) {
				config = {parent: this, data: this.data};
				$.extend(config, this.getInteriorDimensions());
				if (this.queryObject) {
					config.dbId = this.queryObject.dbId;
					config.querySymbol = this.queryObject.symbol;}
				else {
					config.dbId = this.dbId;}
				this.svg = new $P.D3Table(config);
				this.svg.init();}

		},

		addHtml: function () {
			var tmp = '';
			tmp += '<div id= svg' + this.id + ' style="position: absolute;"> </div>';
			$('#bubble').append($(tmp));
			this.table = new PATHBUBBLES.D3Table(this, this.w, this.h);
			if (this.data !== undefined && this.data !== null) {
				this.table.data = this.data;
			}
			if (this.queryObject !== undefined && this.queryObject !== null) {
				this.table.init(this.queryObject.dbId, this.queryObject.symbol);
			}
			else {
				this.table.init(this.dbId);
			}
		},
		addBubbleLink: function(startId,endId, x,y) {
			var object={};
			object.startId = startId;
			object.endId = endId;
			object.absolute = {x:x, y:y};
			PATHBUBBLES.bubbleLinks.push(object);
		},
		menuOperation: function () {
			var _this = this;
			var $menuBarbubble = $('#menuView' + this.id);
			if(this.experimentType == 'Expression')
			{
				$menuBarbubble.find('#export').show();
			}
			else
			{
				$menuBarbubble.find('#export').hide();
			}
			$menuBarbubble.find('#export').on('click',function(){
				if(_this.data.length)
				{
					if(_this.data[0].gene_id!==undefined)
					{
						var entrezIDsString = '';
						for(var i=0; i<_this.data.length; ++i)
						{
							if(i!==0)
								entrezIDsString +=',';
							entrezIDsString +=_this.data[i].gene_id;
						}
						var userString = '';
						//test from webGIVI
						//                    userString +='userID=';
						//                    userString +='pathbubbles';  //$userID
						//                    userString +='&password=';
						//                    userString +='webgiviForYongnan';  //$password
						//                    userString +='&entrezIDs=';
						//                    userString +=entrezIDsString;  //$entrezIDs
						//                    window.open('http://raven.anr.udel.edu/~sunliang/webgivi/webgiviAPI.php?'+userString);

						//test from eGIFT
						//                    userString +='user=';
						//                    userString +='liang';  //$userID
						//                    userString +='&pass=';
						//                    userString +='AnalysisForLiang';  //$password
						//                    userString +='&entrezids=';
						//                    userString +=entrezIDsString;  //$entrezIDs
						//                    window.open('http://biotm.cis.udel.edu/udelafc/getGeneAnalysisResults.php?'+userString);        //connect to eGIFT

						$.ajax({
							type: 'POST',
							url: './php/connect_eGIFT.php',
							dataType: 'text',
							data: {
								entrezIDs: entrezIDsString
							}, // send the string directly
							success: function (result) {
								if (result) {
									var lines = result.split('\n');
									var biPartiteData = [];
									for(var i=0; i<lines.length; ++i)
									{
										if(lines[i]=='')
											continue;
										var arrays = lines[i].split(',');
										var string1 = arrays[0].substr(1, arrays[0].length-2).toUpperCase();
										var string2 = arrays[4].substr(1, arrays[4].length-2).split('  ');
										for(var j=0; j<string2.length; ++j)
										{
											var line = [];
											line.push(string1);
											var string2temp=string2[j].split(' (')[0].toUpperCase();
											line.push(string2temp);
											biPartiteData.push(line);

										}

									}
									if(biPartiteData.length>0)
									{
										var bubble = new PATHBUBBLES.BiPartite(_this.x + _this.offsetX + _this.w-40, _this.y + _this.offsetY,600,510,biPartiteData);
										bubble.addHtml();
										//                                    if(_this.name.indexOf(')'))
										//                                    {
										//                                        bubble.name ='(Gene Symbol)'+_this.name.split(')')[1];
										//                                    }

										bubble.menuOperation();
										if(viewpoint)
										{
											bubble.offsetX = viewpoint.x;
											bubble.offsetY = viewpoint.y;
										}
										scene.addObject(bubble);

										_this.getGroup().add(bubble);
									}

								}
							}
						});
					}
					else
					{
						alert('Link to eGIFT is just for expression Analysis!');
					}
				}
			});
		},
		updateMenu: function () {
			var $menuBarbubble = $('#menuView' + this.id);
			$menuBarbubble.css({
				left: this.x + this.offsetX + this.w + 10,
				top: this.y + this.offsetY + this.cornerRadius / 2 + 40,
				width: 200,
				height: 80
			});
			$menuBarbubble.find('#export').css({
				left: 10,
				top: 25,
				width: 180
			});

		},
		drawSVG: function() {
			var space = 6; // leave 6 space for tree ring
			$('#svg' + this.id).css({
				width: this.w - 15 - space,
				height: this.h - 20 - space,
				left: this.x + space / 2 + 5,
				top: this.y + this.h / 2 - this.table.h / 2 + 50 + 10 + space / 2 + 5
			});
		}
	});
