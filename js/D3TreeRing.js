(function($P){
	//'use strict';

	var forceEnabled = false;

	$P.D3TreeRing = $P.defineClass(
		$P.HtmlObject,
		function D3TreeRing(config) {
			$P.HtmlObject.call(this, {
				parent: '#bubble',
				type: 'div',
				pointer: 'auto',
				objectConfig: config});

			this.defaultRadius = config.defaultRadius;
			this.name = config.name || '';
			this.dataType = config.dataType;
			this.file = config.filename || ('./data/Ortholog/' + this.dataType + '/' + this.name + '.json');
			this.customOrtholog = config.customOrtholog;
			this.selectedData = config.selectedData || this.parent.selectedData || null;
			this.showCrossTalkLevel = config.crosstalkLevel || this.parent.crosstalkLevel || 1;
			this.customExpression = config.customExpression || null;
			this.maxLevel = 6;
			this.crosstalkSymbols = config.crosstalkSymbols || {};
			this.rateLimitSymbols = config.ratelimitSymbols || {};
			this.highlightPathways = config.highlightPathways || [];
			this.displayMode = config.displayMode || this.parent.displayMode || 'title';
			this.localExpressionPercent = config.localExpressionPercent || false;
			this.orthologFile = config.orthologFile || null;
			this.expressionFile = config.expressionFile || null;
			this.initialized = false;
			this.nodeTextSize = config.nodeTextSize || 10;
			this.barLength = 60;
			this.legendWidth = 140;
			this.color = {
				crosstalkExponent: '#f44',
				crosstalkDigit: '#fca',
				upExponent: '#aa0',
				upDigit: '#ff5',
				downExponent: '#00a',
				downDigit: '#55f'};
			this.expressionColors = [
				'#089c51',
				'#31bd82',
				'#6bd6ae',
				'#bde7d7',
				'#effff3',
				'#fdd0a2',
				'#fdae6b',
				'#fd8d3c',
				'#e6550d',
				'#a63603'];
			/*
			 this.expressionColors = [
			 '#ffa', '#ff6', '#ffb', '#ff9', '#ff7',
			 '#ff5', '#ff3', '#ff1', '#0c0', '#0a0'
			 ];
			 */
		},
		{
			onPositionChanged: function(dx, dy, dw, dh) {
				$P.HtmlObject.prototype.onPositionChanged.call(this, dx, dy, dw, dh);
				if (this.svg) {
					this.svg
						.attr('width', this.w)
						.attr('height', this.h);}},
			get displayMode() {return this._displayMode;},
			set displayMode(value) {
				if ('title' === value) {
					if (this.initialized) {
						d3.select(this.element).selectAll('.link').style('opacity', 0);
						d3.select(this.element).selectAll('.titleLink').style('opacity', 1);
						d3.select(this.element).selectAll('.inner_node').style('opacity', 1);
						$(this.element).find('#crossTalkLevel').hide();}
					this._displayMode = 'title';}
				if ('crosstalk' === value) {
					if (this.initialized) {
						d3.select(this.element).selectAll('.titleLink').style('opacity', 0);
						d3.select(this.element).selectAll('.inner_node').style('opacity', 0);
						d3.select(this.element).selectAll('.link').style('opacity', 1);
						$(this.element).find('#crossTalkLevel').show();}
					this._displayMode = 'crosstalk';}},
			get centerX() {return this.x + this.radius;},
			get centerY() {return this.y + this.radius;},
			/**
			 * Adds a legend to the display.
			 * @param {Array} config.entries - the entries to add.
			 */
			addLegend: function(config) {
				var fontsize = config.fontsize || 14,
						x = config.x || 0,
						y = config.y || 0,
						legend;
				legend = config.base.append('g')
					.attr('class', 'legend')
					.attr('id', config.id)
					.attr('transform', 'translate(' + x + ', ' + y + ')');
				legend.append('text')
					.attr('font-size', fontsize)
					.text(config.title);
				legend.selectAll('.color').data(config.entries).enter().append('rect')
					.attr('class', 'color')
					.attr('x', 2)
					.attr('y', function(entry, i) {return 5 + (i + (config.colorOffsetY || 0)) * (fontsize + 2);})
					.attr('width', fontsize - 2).attr('height', fontsize - 2)
					.attr('fill', function(entry) {return entry.color || 'none';})
					.attr('stroke', function(entry) {return entry.stroke || 'black';});
				legend.selectAll('.text').data(config.entries).enter().append('text')
					.attr('class', 'text')
					.attr('x', 20)
					.attr('y', function(entry, i) {return fontsize + 2  + (i + (config.textOffsetY || 0)) * (fontsize + 2);})
					.attr('font-size', fontsize)
					.text(function(entry) {return entry.text;});
				return legend;},
			addMarkedBar: function(config) {
				var x = config.x || 0,
						y = config.y || 0,
						fontsize = config.fontsize || 14,
						height = config.height || 8,
						labelWidth = config.labelWidth || 66,
						size = config.size || 50,
						bar = config.base.append('g')
							.attr('class', 'markedBar')
							.attr('id', config.id)
							.attr('transform', 'translate(' + x + ', ' + y + ')');
				bar.append('text')
					.attr('font-size', fontsize)
					.attr('y', fontsize * 1.25)
					.text(config.label);
				bar.append('rect')
					.attr('fill', config.fill)
					.attr('stroke', 'black')
					.attr('stroke-width', 0.3)
					.attr('x', labelWidth)
					.attr('y', 5 - height / 2)
					.attr('height', height)
					.attr('width', size);
				bar.append('rect')
					.attr('fill', 'black')
					.attr('x', labelWidth - 1)
					.attr('y', 0)
					.attr('height', 10)
					.attr('width', 2);
				bar.append('rect')
					.attr('fill', 'black')
					.attr('x', labelWidth - 1 + size)
					.attr('y', 0)
					.attr('height', 10)
					.attr('width', 2);
				bar.append('text')
					.attr('font-size', fontsize)
					.attr('x', labelWidth - 4.5)
					.attr('y', fontsize * 1.5 + 2)
					.text(config.leftLabel || '0');
				bar.append('text')
					.attr('font-size', fontsize)
					.attr('x', labelWidth - 8.5 + size)
					.attr('y', fontsize * 1.5 + 2)
					.text(config.rightLabel || '10');

				return bar;},
			addSplitLegend: function(config) {
				var legend,
						entrySpacing = 62,
						entryStart = 0,
						fontsize = config.fontsize || 14,
						self = this;
				legend = config.base.append('g')
					.attr('class', 'legend')
					.attr('id', config.id)
					.attr('transform', 'translate(' + config.x + ', ' + config.y + ')');
				if (config.title) {
					legend.append('text')
						.attr('font-size', fontsize)
						.text(config.title);
					legend.append('rect')
						.attr('y', fontsize / 2)
						.attr('width', 140)
						.attr('height', 1)
						.attr('fill', 'black');
					entryStart = fontsize + 6;}
				config.entries.forEach(function(entry, i) {
					legend.append('text')
						.attr('font-size', fontsize)
						.attr('y', entryStart + i * entrySpacing)
						.text(entry.name);
					self.addMarkedBar({
						base: legend,
						y: entryStart + i * entrySpacing + 4,
						height: 3,
						size: entry.size,
						fill: entry.digitColor,
						fontsize: fontsize,
						label: 'Digit:'});
					self.addMarkedBar({
						base: legend,
						y: entryStart + i * entrySpacing + 4 + fontsize * 2,
						height: 7,
						size: entry.size,
						fill: entry.exponentColor,
						fontsize: fontsize,
						label: 'Exponent:'});
					legend.append('rect')
						.attr('y', entryStart + (1 + i) * entrySpacing - fontsize)
						.attr('width', 140)
						.attr('height', 1)
						.attr('fill', 'black');});

				legend.append('text')
					.attr('font-size', fontsize)
					.attr('y', 4 + entryStart + config.entries.length * entrySpacing)
					.text('is Digit × 10 ^ Exponent');


				return legend;},
			init: function () {
				var self = this,
						bubble = this.parent;

				var _this = this;
				var width = this.defaultRadius,
						height = this.defaultRadius,
						radius = Math.min(width, height) / 2;
				this.radius = radius;
				var x = d3.scale.linear()
							.range([0, 2 * Math.PI]);
				var a = x;

				var y = d3.scale.sqrt()
							.range([0, radius]);
				var r = y;

				var svg = d3.select(this.element).append('svg')
							.attr('width', this.w)
							.attr('height', this.h);
				this.svg = svg;
				self.orthologColors = ['#fdae6b', '#a1d99b', '#bcbddc'];
				var gGroup;
				var mainSvg = svg.append('g').attr('class','mainSVG')
							.attr('transform', 'translate(' + width * 0.5 + ',' + height * 0.5 + ')');
				this.mainSvg = mainSvg;
				svg.append('text').attr('class','species')
					.style('font-size', 12)
					.attr('transform', 'translate(' + 10 + ',' + 18 + ')')
					.style('text-anchor', 'start')
					.style('fill', 'black')
					.text(self.parent.orthologLabel || ('Human vs. ' + self.parent.species));

				/*
				 svg.append('text').attr('class','ortholog')
				 .style('font-size', 12)
				 .attr('transform', 'translate(' + 10 + ',' + 30 + ')')
				 .style('text-anchor', 'start')
				 .style('fill', function() {return self.parent.orthologLabel ? 'black' : '#888';})
				 .text(self.parent.orthologLabel || 'No ortholog file loaded.');
				 */

				svg.append('text').attr('class','expression')
					.style('font-size', 12)
					.attr('transform', 'translate(' + 10 + ',' + 30 + ')')
					.style('text-anchor', 'start')
					.style('fill', function() {return self.parent.expressionLabel ? 'black' : '#888';})
					.text(self.parent.expressionLabel || 'No expression file loaded.');

				this.zoomListener = d3.behavior.zoom()
					.translate([0, 0])
					.scaleExtent([1, 10])
					.on('zoomstart', function() {
						this.zoomScale = this.zoomListener.scale();
						this.zoomTranslate = this.zoomListener.translate();
					}.bind(this))
					.on('zoom', function () {
						var cx, cy;
						this.zoomScale = d3.event.scale;
						this.zoomTranslate = d3.event.translate;
						cx = this.x + this.w * 0.5 + this.zoomTranslate[0] / this.zoomScale;
						cy = this.y + this.h * 0.5 + this.zoomTranslate[1] / this.zoomScale;
						gGroup.attr('transform', 'translate(' + d3.event.translate + ')scale(' + d3.event.scale + ')');
						this.parent.links.forEach(function(link) {
							if (link.source == this.parent) {
								link.sourceOffset.x = cx + link.radialX * this.zoomScale;
								link.sourceOffset.y = cy + link.radialY * this.zoomScale;}
							else if (link.target == this.parent) {
								link.sourceOffset.x = cx + link.radialX * this.zoomScale;
								link.sourceOffset.y = cy + link.radialY * this.zoomScale;}
							$P.state.overlayCanvas.needsRedraw = true;
						}.bind(this));
					}.bind(this));

				var partition = d3.layout.partition()
							.value(function (d) {
								return d.size;
							});
				var arcReal = d3.svg.arc()
							.startAngle(function (d) {
								return Math.max(0, Math.min(2 * Math.PI, x(d.x)));
							})
							.endAngle(function (d) {
								return Math.max(0, Math.min(2 * Math.PI, x(d.x + d.dx)));
							})
							.innerRadius(function (d) {
								return Math.max(0, y(d.y));
							})
							.outerRadius(function (d) {
								return Math.max(0, y(d.y + d.dy));
							});

				var arc = function(datum) {
					var angle = x(datum.x + datum.dx * 0.5) - Math.PI * 0.5;
					datum.outsideEdge =
						new $P.Vector2D(Math.cos(angle), Math.sin(angle))
						.times(y(datum.y + datum.dy * 0.8));
					return arcReal(datum);};

				var itemDrag;
				if (forceEnabled) {
					itemDrag = d3.behavior.drag()
						.on('dragstart', function(d) {
							_this.dragging = this;
							_this.dragOffset = {x: 0, y: 0};
							_this.dragLeft = d3.event.sourceEvent.which == 1;})
						.on('drag', function(d) {
							if (!_this.dragLeft) {return;}
							_this.dragOffset.x += d3.event.dx;
							_this.dragOffset.y += d3.event.dy;
							_this.dragAbsolute = {x: d3.event.x, y: d3.event.y};
							var dx = _this.dragOffset.x,
									dy = _this.dragOffset.y;
							d3.select(this).attr('transform', 'translate('+dx+','+dy+')');
						})
						.on('dragend', function(d) {
							var force, x, y, expression, color;

							if (!_this.dragLeft) {return;}
							if (!_this.dragAbsolute) {return;}

							x = _this.dragAbsolute.x + _this.parent.x + _this.parent.w * 0.5,
							y = _this.dragAbsolute.y + _this.parent.y + _this.parent.h * 0.5;

							force = $P.state.scene.sendEvent({name: 'reactionDrag', x: x, y: y});

							// No object, so make a new force diagram.
							if (!force) {
								force = new $P.Force({x: x, y: y, w: 600, h: 600});
								$P.state.scene.add(force);
								force.addPathway(d.dbId, d.name, bubble.strokeStyle);
								force.svg.addSymbols(d.dbId, _this.getExpressionMap(), d.symbols);}

							// The object is a force, so add.
							else if (force instanceof $P.Force) {
								force.addPathway(d.dbId, d.name, bubble.strokeStyle);
								force.svg.addSymbols(d.dbId, _this.getExpressionMap(), d.symbols);}

							else {force = null;}

							if (force) {
								color = force.getPathwayColor(d.dbId);
								$P.state.scene.addLink(
									new $P.BubbleLink({
										fillStyle: color,
										source: new $P.D3TreeRing.BubbleLinkEnd({
											d3ring: self,
											datum: d3.select(this).datum()}),
										target: new $P.BubbleLink.End({object: force})}));}

							d3.select(this).attr('transform', null);
							_this.dragging = null;
							_this.dragOffset = null;
						});}

				var tooltip = d3.select(this.parent.svg.element)
							.append('div')
							.attr('class', 'tooltip')
							.style('fill', '#333')
							.style('font-size', '12px')
							.style('background', '#eee')
							.style('box-shadow', '0 0 5px #999999')
							.style('position', 'absolute')
							.style('z-index', '10');

				function format_number(x) {
					return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
				}

				function format_name(d) {
					var name = d.name;
					return  '<b>' + name + '</b>';
				}

				var nodeData;
				//edge ----------------------------------------------------------------------------
				var bundle = d3.layout.bundle();
				var diagonal = d3.svg.diagonal()
							.projection(function (node) {
								return [node.x, node.y];
							});

				$P.getJSON('./data/crossTalkings.json', function (crossTalkSymbols, error) {
					_this.crosstalkSymbols = crossTalkSymbols;

					d3.text('./data/ratelimitsymbol.txt', function (error, rateLimitSymbols) {
						//                rateLimitSymbols = rateLimitSymbols.replace(/\r\n/g, '\n');
						//                rateLimitSymbols = rateLimitSymbols.replace(/\r/g, '\n');
						//                var rateLimit_Symbols = rateLimitSymbols.split('\n');
						var rateLimit_Symbols = rateLimitSymbols.split('\n');
						_this.rateLimitSymbols.keys = d3.set(rateLimit_Symbols.map(function (d) {
							if (d !== '') {return d;}
						})).values().sort(function (a, b) {
							return ( a < b ? -1 : a > b ? 1 : 0);
						});
						_this.rateLimitSymbols.values = _this.rateLimitSymbols.keys.map(function (d) {
							return 0;
						});
						for (var i = 0; i < rateLimit_Symbols.length; ++i) {
							var index = _this.rateLimitSymbols.keys.indexOf(rateLimit_Symbols[i]);
							if (index !== -1) {
								_this.rateLimitSymbols.values[index]++;
							}
						}
						{   //main
							var minRatio;
							var maxRatio;
							//                        if (_this.selectedData == null) {  //12/10/2014

							$P.getJSON(_this.file, function (root, error) {
								var node, count, minRatio, maxRatio, progress;
								nodeData = partition.nodes(root);
								node = $P.findFirst(nodeData, function(n) {return 1 === n.depth;});
								self.maxLevel = d3.max(nodeData, function (d) {return d.depth;});

								$P.asyncOrdered([
									_loadOrtholog,
									_loadExpression,
									operation]);});

							function _loadOrtholog(finish) {
								var progress, set, predicate;
								if (self.customOrtholog) {
									set = new $P.Set()
										.addList(
											self.customOrtholog,
											function(orth) {return orth.symbol.toUpperCase();});
									predicate = function(symbol) {
										if (!symbol) {return false;}
										return set.contains(symbol.toUpperCase());};
									function process(d) {
										if (!d) {return;}
										var symbols = d.symbols || [];
										d.gallusOrth = {};
										d.gallusOrth.sharedSymbols = symbols.filter(predicate);
										if (symbols.length === d.gallusOrth.sharedSymbols.length) {
											d.gallusOrth.type = 'Complete';}
										else if (0 === d.gallusOrth.sharedSymbols.length) {
											d.gallusOrth.type = 'Empty';}
										else {
											d.gallusOrth.type = 'Part';}}

									if (self.customOrtholog.length > 100) {
										progress = new $P.Progress({prefix: 'Processing Ortholog Data: '});
										bubble.add(progress);
										$P.asyncLoop(
											nodeData,
											function (finish, d, i) {
												progress.setProgress(i / nodeData.length);
												process(d);
												finish();},
											function() {
												bubble.remove(progress);
												finish();});}
									else {
										nodeData.forEach(process);
										finish();}}
								else {
									finish();}}

							function _loadExpression(finish) {
								var progress, expressions;
								if (self.customExpression) {
									expressions = $P.indexBy(self.customExpression, function(e) {return e.symbol.toUpperCase();});
									function process(d) {
										if (!d.gallusOrth || !d.gallusOrth.sharedSymbols) {return;}
										var minRatio, maxRatio;
										minRatio = self.parent.minRatio;
										maxRatio = self.parent.maxRatio;
										d.expression = {ups: [], downs: [], unchanges: []};
										d.gallusOrth.sharedSymbols.forEach(function(symbol) {
											var expression, ratio;
											if (!symbol) {return;}
											expression = expressions[symbol.toUpperCase()];
											if (!expression) {return;}
											ratio = parseFloat(expression.ratio);
											if (ratio >= maxRatio) {d.expression.ups.push(expression);}
											else if (ratio <= minRatio) {d.expression.downs.push(expression);}
											else {d.expression.unchanges.push(expression);}});}

									if (self.customExpression.length > 100) {
										progress = new $P.Progress({prefix: 'Processing Expression Data: ', color: '#0f0'});
										bubble.add(progress);
										$P.asyncLoop(
											nodeData,
											function(finish, d, i) {
												progress.setProgress(i / nodeData.length);
												process(d);
												finish();},
											function() {
												bubble.remove(progress);
												finish();});}
									else {
										nodeData.forEach(process);
										finish();}}
								else {
									finish();}}


							function operation(finish) {
								var crossTalkFileName = './data/crossTalkLevel/' + nodeData[0].name + '.json';
								self.parent.crossTalkLevel = self.showCrossTalkLevel;
								$P.getJSON(crossTalkFileName, function (crossTalkData, error) {
									var classes = crossTalkData[self.showCrossTalkLevel - 1];
									gGroup = mainSvg.append('g').attr('class', 'graphGroup');
									self.graphGroup = gGroup;
									gGroup.call(_this.zoomListener) // delete this line to disable free zooming
										.call(_this.zoomListener.event);
									var pathG = gGroup.append('g').selectAll('.path');
									var link = gGroup.append('g').selectAll('.link');
									var node; // = gGroup.append('g').selectAll('.node');
									//_this.nodeGroup = node;
									var downNode= gGroup.append('g').selectAll('.downNode');
									var highlightNode = gGroup.append('g').selectAll('.highlightNode');
									var barCounts;
									var expressionColors = self.expressionColors;
									processTextLinks(nodeData);
									if(_this.highlightPathways.length) {
										processHighlightNode(nodeData);}
									var max;
									if (self.customExpression) {
										for (var i = 0; i < nodeData.length; ++i) {
											if (nodeData[i].name !== 'homo sapiens' && nodeData[i].expression !== undefined && nodeData[i].gallusOrth !== undefined) {
												nodeData[i].unique = {};
												nodeData[i].unique.ups = [];
												nodeData[i].unique.downs = [];
												nodeData[i].unique.sharedSymbols = [];
												for (var j = 0; j < nodeData[i].expression.ups.length; ++j) {
													if (nodeData[i].unique.ups.indexOf(nodeData[i].expression.ups[j]) == -1) {
														nodeData[i].unique.ups.push(nodeData[i].expression.ups[j]);
													}
												}
												for (var j = 0; j < nodeData[i].expression.downs.length; ++j) {
													if (nodeData[i].unique.downs.indexOf(nodeData[i].expression.downs[j]) == -1) {
														nodeData[i].unique.downs.push(nodeData[i].expression.downs[j]);
													}
												}
												for (var j = 0; j < nodeData[i].gallusOrth.sharedSymbols.length; ++j) {
													if (nodeData[i].unique.sharedSymbols.indexOf(nodeData[i].gallusOrth.sharedSymbols[j]) == -1) {
														nodeData[i].unique.sharedSymbols.push(nodeData[i].gallusOrth.sharedSymbols[j]);
													}
												}
											}

										}

										max = d3.max(nodeData, function (d) {
											if (d.name == 'homo sapiens' || d.expression == undefined || d.gallusOrth == undefined)
												return 0;
											//                            return (d.expression.downs.length + d.expression.ups.length) / d.gallusOrth.sharedSymbols.length;
											return (d.unique.downs.length + d.unique.ups.length) / d.unique.sharedSymbols.length;});
										//                                    }
										//                                    else {
										//                                    }
									}


									self.maxExpressionPercent = 1;
									function getExpressionColor(ratio) {
										var max = 1;
										if (self.localExpressionPercent) {max = self.maxExpressionPercent;}
										ratio = Math.min(ratio, max - 0.0000001);
										ratio = Math.max(ratio, 0);
										return self.expressionColors[Math.floor(9 * ratio / max)];}

									if (self.customExpression && self.localExpressionPercent) {
										self.maxExpressionPercent =
											d3.max(nodeData, function(d) {
												if (!d.unique) {return 0;}
												return (d.unique.downs.length + d.unique.ups.length) / d.unique.sharedSymbols.length;});}

									pathG = pathG.data(nodeData)
										.enter().append('path')
										.attr('id', function (d, i) {
											return 'group' + i;
										})
										.attr('d', arc)
										.style('fill', function (d, i) {
											if (i == 0)
												return '#fff';
											if (!_this.customExpression) {
												if (d.children !== undefined)
													var gallusOrth = (d.children ? d : d.parent).gallusOrth;
												else
													var gallusOrth = d.gallusOrth;
												if (gallusOrth !== undefined) {
													if (gallusOrth.type === 'Complete') {
														return self.orthologColors[0];
													}
													else if (gallusOrth.type === 'Part') {
														return self.orthologColors[1];
													}
													else if (gallusOrth.type === 'Empty') {
														return self.orthologColors[2];
													}
													else {return '#fff';}
												}
												else {
													return '#fff';
												}
											}
											else if (_this.customExpression) {
												if (d.name == 'homo sapiens' || d.expression == undefined || d.gallusOrth == undefined)
													return '#fff';
												//                            else if (d.gallusOrth.sharedSymbols.length == 0) {
												else if (d.unique.sharedSymbols.length == 0) {
													return getExpressionColor(0);
												}
												else {
													//                                return colorRange((d.expression.downs.length + d.expression.ups.length) / d.gallusOrth.sharedSymbols.length);
													return getExpressionColor((d.unique.downs.length + d.unique.ups.length) / d.unique.sharedSymbols.length);
												}
											}
											return null;})
										.style('cursor', 'pointer')
										.on('contextmenu', rightClick)
										.on('click', click)
										.on('mousedown', function() {d3.event.stopPropagation();})
										.on('mouseover', function (d, i) {
											if (d.name == 'homo sapiens')
												return null;
											tooltip.html(function () {
												return format_name(d);
											});
											return tooltip.transition()
												.duration(50)
												.style('opacity', 0.9);})
										.on('mousemove', function (d, i) {
											if (d.name == 'homo sapiens') {return null;}
											return tooltip
												.style('top', (d3.event.pageY - 10 - _this.parent.y - 70 ) + 'px')
												.style('left', (d3.event.pageX + 10 - _this.parent.x + $P.state.scrollX) + 'px');
										})
										.on('mouseout', function () {
											return tooltip.style('opacity', 0);
										});
									if (forceEnabled) {pathG.call(itemDrag);}
									svg.on('mouseout', function () {
										return tooltip.html('');
									});

									function computeTextRotation(d, i) {
										if (i == 0)
											return 0;
										var angle = a(d.a + d.da / 2) - Math.PI / 2;
										return angle / Math.PI * 180;
									}

									var nodes = nodeData.filter(function(d) {return self.parent.crosstalkLevel == d.depth;});
									nodeData.forEach(function(node) {
										node.a = node.x;
										node.r = node.y;
										node.da = node.dx;
										node.dr = node.dy;
										node.x = Math.sin(
											Math.PI - (Math.max(0, Math.min(2 * Math.PI, a(node.a)))
																 + Math.max(0, Math.min(2 * Math.PI, a(node.a + node.da)))) / 2)
											* Math.max(0, r(node.r)),
										node.y = Math.cos(
											Math.PI - (Math.max(0, Math.min(2 * Math.PI, a(node.a)))
																 + Math.max(0, Math.min(2 * Math.PI, a(node.a + node.da)))) / 2)
											* Math.max(0, r(node.r));});

									var maxSymbol, maxUp, maxDown;
									if (self.customExpression) {
										maxUp = d3.max(nodes, function(d) {
											if (!d.expression) {return 0;}
											return d.expression.ups.length;});
										maxDown = d3.max(nodes, function(d) {
											if (!d.expression) {return 0;}
											return d.expression.downs.length;});}
									else {
										maxSymbol = d3.max(nodes, function(d) {
											if (!d.gallusOrth.sharedSymbols) {return 0;}
											return d.gallusOrth.sharedSymbols.length;});}

									if (classes && classes.length) {
										var links = [];
										classes.forEach(function(klass) {
											var source;
											var targets = [];
											if (klass.imports.length != 0) {
												for (var ii = 0; ii < nodes.length; ++ii) {
													if (klass.name == nodes[ii].name) {
														source = nodes[ii];}
													for (var ij = 0; ij < klass.imports.length; ++ij) {
														if (klass.imports[ij] == nodes[ii].name) {
															targets.push(nodes[ii]);}}}}
											for (var ijk = 0; ijk < targets.length; ++ijk) {
												var importObj = {};
												importObj.source = source;
												importObj.target = targets[ijk];
												links.push(importObj);}});
										link = link
											.data(bundle(links))
											.enter().append('path')
											.each(function (d) {
												d.source = d[0];
												d.target = d[d.length - 1];})
											.attr('class', 'link')
											.attr('d', diagonal)
											.style('opacity', function(d, i) {return 'crosstalk' === self.displayMode ? 1 : 0;});}

									// Compute coordinates and sizes.
									nodes.forEach(function(d, i) {
										d.theta = Math.max(0, Math.min(2 * Math.PI, a(d.a + d.da)))
											- Math.max(0, Math.min(2 * Math.PI, a(d.a)));
										d.radius = Math.max(0, r(d.r));
										d.angle = computeRotation(d, i);});

									if (self.customExpression) {
										var maxExpressions = Math.max(maxUp, maxDown);
										//self.expressionLegend.select('#gauge-end-text')
										//	.text(maxExpressions);

										nodes.forEach(function(d, i) {
											d.thickness = Math.min(d.theta * d.radius, 40);
											var up = d.expression.ups.length,
													down = d.expression.downs.length;
											d.upExponent = Math.max(0, Math.floor(Math.log(up) / Math.log(10)));
											d.upDigit = up / Math.pow(10, d.upExponent);
											d.downExponent = Math.max(0, Math.floor(Math.log(down) / Math.log(10)));
											d.downDigit = down / Math.pow(10, d.downExponent);});

										var groupExpressionBars = self.graphGroup.append('g').attr('id', 'group-expression-bars');
										var expressionBar = groupExpressionBars.selectAll('.expression-bar').data(nodes).enter()
													.append('g')
													.attr('class', 'expression-bar')
													.attr('transform', function(d) {return 'rotate(' + d.angle + ')';})
													.on('contextmenu', expressionBarClick)
													.on('mouseover', mouseovered)
													.on('mouseout', mouseouted);
										node = expressionBar;
										expressionBar.append('rect')
											.attr('class', 'upExponent')
											.attr('x', function(d) {return r(d.r);})
											.attr('y', function(d) {return d.thickness * -0.5;})
											.attr('height', function(d) {return d.thickness * 0.5;})
											.attr('width', function(d) {
												if (isNaN(d.upExponent)) {return 0;}
												if (0 === maxExpressions) {return 0;}
												return self.barLength * d.upExponent * 0.1;})
											.attr('fill', self.color.upExponent)
											.attr('stroke-width', 0.3)
											.attr('stroke', '#000');
										expressionBar.append('rect')
											.attr('class', 'upDigit')
											.attr('x', function(d) {return r(d.r);})
											.attr('y', function(d) {return d.thickness * -0.35;})
											.attr('height', function(d) {return d.thickness * 0.2;})
											.attr('width', function(d) {
												if (isNaN(d.upDigit)) {return 0;}
												if (0 === maxExpressions) {return 0;}
												return self.barLength * d.upDigit * 0.1;})
											.attr('fill', self.color.upDigit)
											.attr('stroke-width', 0.3)
											.attr('stroke', '#000');
										expressionBar.append('rect')
											.attr('class', 'downExponent')
											.attr('x', function(d) {return r(d.r);})
											.attr('y', function(d) {return 0;})
											.attr('height', function(d) {return d.thickness * 0.5;})
											.attr('width', function(d) {
												if (isNaN(d.downExponent)) {return 0;}
												if (0 === maxExpressions) {return 0;}
												return self.barLength * d.downExponent * 0.1;})
											.attr('fill', self.color.downExponent)
											.attr('stroke-width', 0.3)
											.attr('stroke', '#000');
										expressionBar.append('rect')
											.attr('class', 'down')
											.attr('x', function(d) {return r(d.r);})
											.attr('y', function(d) {return d.thickness * 0.15;})
											.attr('height', function(d) {return d.thickness * 0.2;})
											.attr('width', function(d) {
												if (isNaN(d.downDigit)) {return 0;}
												if (0 === maxExpressions) {return 0;}
												return self.barLength * d.downDigit * 0.1;})
											.attr('fill', self.color.downDigit)
											.attr('stroke-width', 0.3)
											.attr('stroke', '#000');}

									else {
										nodes.forEach(function(d, i) {
											var symbolCount;
											d.thickness = Math.min(d.theta * d.radius * 0.8, 20);
											symbolCount = 0;
											if (d.gallusOrth) {symbolCount = d.gallusOrth.sharedSymbols.length;}
											d.exponent = Math.floor(Math.log(symbolCount) / Math.log(10));
											if (d.exponent < 0) {d.exponent = 0;}
											d.digit = symbolCount / Math.pow(10, d.exponent);});
										var maxExponent = Math.floor(Math.log(maxSymbol || 1) / Math.log(10));
										var groupCrosstalkBars = self.graphGroup.append('g').attr('id', 'group-crosstalk-bars');
										var crosstalkBar = groupCrosstalkBars.selectAll('.crosstalk-bar').data(nodes).enter()
													.append('g')
													.attr('class', 'crosstalk-bar')
													.attr('transform', function(d) {return 'rotate(' + d.angle + ')';})
													.on('contextmenu', barClick)
													.on('mouseover', mouseovered)
													.on('mouseout', mouseouted);
										node = crosstalkBar;
										crosstalkBar.append('rect')
											.attr('class', 'exponent')
											.attr('x', function(d) {return r(d.r);})
											.attr('y', function(d) {return d.thickness * -0.5;})
											.attr('height', function(d) {return d.thickness;})
											.attr('width', function(d) {
												if (isNaN(d.exponent)) {return 0;}
												if (0 === maxExponent) {return 0;}
												return self.barLength * d.exponent * 0.1;})
											.attr('fill', '#f22')
											.attr('stroke-width', 0.3)
											.attr('stroke', '#000');
										crosstalkBar.append('rect')
											.attr('class', 'digit')
											.attr('x', function(d) {return r(d.r);})
											.attr('y', function(d) {return d.thickness * -0.2;})
											.attr('height', function(d) {return d.thickness * 0.4;})
											.attr('width', function(d) {
												if (isNaN(d.digit)) {return 0;}
												return self.barLength * d.digit * 0.1;})
											.attr('fill', '#fb8')
											.attr('stroke-width', 0.3)
											.attr('stroke', '#000');}

									var textG = gGroup.append('g').selectAll('.text').data(nodeData.filter(
										function (d, i) {
											if (i == 0)          //center of the circle
												return true;
											var thea = Math.max(0, Math.min(2 * Math.PI, a(d.a + d.da))) - Math.max(0, Math.min(2 * Math.PI, a(d.a)));
											var radius = Math.max(0, r(d.r));
											return thea * radius >= 10;
										}))
												.enter().append('text')
												.attr('class', 'bar-text') // add class
												.attr('text-anchor', 'middle')
												.attr('transform', function (d, i) {
													if (i == 0)
														return 'rotate(0)';
													var angle = a(d.a + d.da / 2) * 180 / Math.PI - 90;
													return 'rotate(' + angle + ')translate(' + r(d.r + d.dr * 0.5) + ')rotate(' + (angle > 90 ? -180 : 0) + ')';
												})
												.attr('dy', '0.35em')
												.style('font-size', function(d, i) {
													var width = Math.abs(r(d.r + d.dr) - r(d.r)),
															height = Math.abs(a(d.a + d.da) - a(d.a));
													return Math.min(width / 4, height * Math.PI * 128) + 'px';})
												.text(function (d, i) {
													if (i == 0) {return '';}
													var str = d.name;
													str = str.match(/\b\w/g).join('');
													str = str.substr(0, 4);
													return str;
												});

									addLegends();

									function barClick() {
										var symbols, tableData, i, j, symbolObj, index1, index2, selection, datum, table;

										symbols = d3.select(this).datum().gallusOrth.sharedSymbols;
										tableData = [];
										symbols.forEach(function(symbol) {
											var datum = $P.findFirst(tableData, function(datum) {return symbol === datum.symbol;});
											if (datum) {
												++datum.count;}
											else {
												tableData.push({
													symbol: symbol,
													count: 1,
													crossTalk: self.getCrossTalkPathways(symbol).length,
													rateLimit: self.getRateLimit(symbol)});}});

										selection = d3.select(this);
										datum = selection.datum();
										table = new $P.Table({
											dbId: datum.dbId,
											name: datum.name,
											data: tableData,
											experimentType: _this.parent.experimentType,
											crosstalking: _this.crosstalkSymbols,
											keepQuery: true,
											sourceRing: self,
											w: 400, h: 400});
										bubble.parent.add(table);

										var angle = datum.angle * Math.PI / 180,
												offset = r(datum.r + datum.dr * 0.8);

										datum.outsideEdge = new $P.Vector2D(
											Math.cos(angle) * offset,
											Math.sin(angle) * offset);

										$P.state.scene.addLink(
											new $P.BubbleLink({
												source: new $P.D3TreeRing.BubbleLinkEnd({
													d3ring: self,
													datum: datum}),
												target: new $P.BubbleLink.End({object: table})
											}));

										d3.event.preventDefault();}

									function expressionBarClick() {
										var d3selection = d3.select(this),
												d3datum = d3selection.datum(),
												expression = d3datum.expression,
												ups, downs, tableData, upData, downData, table, angle, offset;

										if (!expression) {return;}

										ups = expression.ups;
										downs = expression.downs;
										upData = [];
										downData = [];

										ups.forEach(function(up) {
											var datum = $P.findFirst(upData, function(datum) {return up.symbol === datum.symbol;});
											if (datum) {
												++datum.count;}
											else {
												upData.push({
													symbol: up.symbol,
													count: 1,
													gene_id: up.gene_id,
													regulation: 'Up',
													ratio: parseFloat(up.ratio).toFixed(5),
													crossTalk: self.getCrossTalkPathways(up.symbol).length,
													rateLimit: self.getRateLimit(up.symbol)});}});
										upData.forEach(function(datum) {datum.symbol = datum.symbol.toUpperCase();});

										downs.forEach(function(down) {
											var datum = $P.findFirst(upData, function(datum) {return down.symbol === datum.symbol;});
											if (datum) {
												++datum.count;}
											else {
												downData.push({
													symbol: down.symbol,
													count: 1,
													gene_id: down.gene_id,
													regulation: 'Down',
													ratio: parseFloat(down.ratio).toFixed(5),
													crossTalk: self.getCrossTalkPathways(down.symbol).length,
													rateLimit: self.getRateLimit(down.symbol)});}});
										downData.forEach(function(datum) {datum.symbol = datum.symbol.toUpperCase();});

										table = new $P.Table({
											dbId: d3datum.dbId,
											name: d3datum.name,
											data: upData.concat(downData),
											experimentType: self.parent.experimentType,
											crosstalking: self.crosstalkSymbols,
											keepQuery: true,
											sourceRing: self,
											w: 400, h: 400});
										bubble.parent.add(table);

										angle = d3datum.angle * Math.PI / 180;
										offset = r(d3datum.r + d3datum.dr * 0.8);
										d3datum.outsideEdge = new $P.Vector2D(
											Math.cos(angle) * offset,
											Math.sin(angle) * offset);

										$P.state.scene.addLink(
											new $P.BubbleLink({
												source: new $P.D3TreeRing.BubbleLinkEnd({
													d3ring: self,
													datum: d3.select(this).datum()}),
												target: new $P.BubbleLink.End({object: table})
											}));

										d3.event.preventDefault();}

									function computeRotation(d, i) {
										var angle = a(d.a + d.da / 2) - Math.PI / 2;
										return angle / Math.PI * 180;}

									function processHighlightNode(nodeData)
									{
										var highlights = [];
										nodeData.forEach(function(d){
											if(d.name!==undefined)
											{
												var index = _this.highlightPathways.indexOf(d.name);
												if(index !== -1)
												{
													var index1 = highlights.indexOf(d);
													if(index1 ==-1)
													{
														highlights.push(d);
													}
												}
											}
										});


										var nodeCircle = highlightNode.data(highlights).enter().append('g')
													.attr('class', 'highlightNode');
										nodeCircle =nodeCircle.append('circle')
											.attr('cx', function (d) {
												if(d.depth == 0)
													return 0;
												return Math.sin(
													Math.PI - (Math.max(0, Math.min(2 * Math.PI, x(d.x)))
																		 + Math.max(0, Math.min(2 * Math.PI, x(d.x + d.dx)))) / 2
												)
													* Math.max(0, y(d.y+ d.dy/2));
											})
											.attr('cy', function (d) {
												if(d.depth == 0)
													return 0;
												return Math.cos(
													Math.PI - (Math.max(0, Math.min(2 * Math.PI, x(d.x)))
																		 + Math.max(0, Math.min(2 * Math.PI, x(d.x + d.dx)))) / 2
												)
													* Math.max(0, y(d.y+ d.dy/2));
											})
											.attr('r',function(d){
												if(d.depth == 0)
													return 0;
												return 5;
											})
											.style('fill','yellow')
											.on('mouseover', function (d, i) {
												if (d.name == 'homo sapiens')
													return;
												tooltip.html(function () {
													return format_name(d);
												});
												return tooltip.transition()
													.duration(50)
													.style('opacity', 0.8);
											})
											.on('mousemove', function (d, i) {
												if (d.name == 'homo sapiens')
													return;
												return tooltip
													.style('top', (d3.event.pageY - 10 - _this.parent.y - 70 ) + 'px')
													.style('left', (d3.event.pageX + 10 - _this.parent.x) + 'px');
											})
											.on('mouseout', function () {
												return tooltip.style('opacity', 0);
											})
											.style('opacity', 0.8);
									}
									function processTextLinks(nodes) {
										var i;

										var importLinks = [];
										var data = [];
										for (i = 0; i < nodes.length; ++i) {
											if (nodes[i].depth == 1) {
												data.push(nodes[i]);}}

										var rect_height = 7.2;
										var rect_width = 20;
										var inner_y = d3.scale.linear()
													.domain([0, data.length])
													.range([-(data.length * rect_height) / 2, (data.length * rect_height) / 2]);
										var inners = [];

										for (i = 0; i < data.length; ++i) {
											var object = {};
											object.id = i;
											object.name = data[i].name;
											object.x = -(rect_width / 2);
											object.y = inner_y(i);
											object.linkTo = data[i];
											inners.push(object);}

										for (var i = 0; i < inners.length; ++i) {
											var importObj = {};
											importObj.id = inners[i].id;
											importObj.target = inners[i];
											importObj.source = inners[i].linkTo;
											importLinks.push(importObj);
										}

										var inode = gGroup.append('g').selectAll('.inner_node');
										self.inode = inode;
										var titleLink = gGroup.append('g').attr('class', 'links').selectAll('.titleLink');
										var inodeRect = inode.data(inners).enter().append('g')
													.attr('class', 'inner_node');
										self.inodeRect = inodeRect;
										var inodeText = inode.data(inners).enter().append('g')
													.attr('class', 'inner_node');

										var minY = d3.min(inners, $P.getter('y'));

										gGroup.append('text')
											.attr('class', 'inner_node')
											.attr('id', 'pathwayTitleLabel')
											.attr('transform',
														'translate(' + (rect_width / 2 - 10) + ', ' + (rect_height * 0.75 + minY - 10) + ')')
											.attr('text-anchor', 'middle')
											.style('font-size', rect_height + 1)
											.style('font-weight', 'bold')
											.text('Top Level Pathways:');

										inodeText = inodeText.append('text')
											.attr('id', function (d) {
												return d.id + '-txt';
											})
											.attr('text-anchor', 'middle')
											.attr('transform', function (d) {
												return 'translate(' + ( rect_width / 2 + d.x ) + ', ' + (rect_height * .75 + d.y) + ')';
											})
											.style('font-size', rect_height + 1)
											.style('font-weight', 'bold')
											.text(function (d) {
												return d.name;
											})
											.each(function (d) {
												d.bx = this.getBBox().x;
												d.by = this.getBBox().y;
												d.bwidth = this.getBBox().width;
												d.bheight = this.getBBox().height;
											})
											.on('mouseover', mouserOverText)
											.on('mouseout', mouseOutText);

										inodeRect = inodeRect.append('rect')
											.attr('id', function(d) {
												return 'textbkg' + d.id;})
											.attr('x', function (d) {
												return d.bx;
											})
											.attr('y', function (d) {
												return d.by;
											})
											.attr('width', function (d) {
												return d.bwidth;
											})
											.attr('height', function (d) {
												return d.bheight;
											})
											.attr('text-anchor', 'middle')
											.attr('transform', function (d) {
												return 'translate(' + ( rect_width / 2 + d.x ) + ', ' + (rect_height * .75 + d.y) + ')';
											})
											.attr('id', function (d) {
												return d.id + '-txt';
											})
											.attr('fill', function (d) {
												return '#e5f5f9';
											})
											.on('mouseover', mouserOverText)
											.on('mouseout', mouseOutText);
										var diagonal = d3.svg.diagonal()
													.source(function (d) {
														var innerRadius = Math.max(0, y(d.source.y));
														var arcCenter = x(d.source.x + d.source.dx / 2.0);

														return {'x': innerRadius * Math.cos(Math.PI - arcCenter),      //radial space
																		'y': innerRadius * Math.sin(Math.PI - arcCenter)};
													})
													.target(function (d) {                                           //normal space
														return {'x': d.target.y + rect_height / 2,
																		//                                'y': d.source.x ? d.target.x : d.target.x + rect_width};
																		'y': d.source.x + d.source.dx / 2.0 < Math.PI ? -d.target.bwidth / 2 : -d.target.bwidth / 2};
													})
													.projection(function (d) {
														return [d.y, d.x];
													});

										// links
										titleLink = titleLink
											.data(importLinks)
											.enter().append('path')
											.attr('class', 'titleLink')
											.attr('id', function (d) {
												return  'titleLink' + d.id;
											})
											.attr('d', diagonal)
											.attr('stroke', function (d) {
												return '#00f';
											})
											.attr('stroke-width', '1px')
											.style('opacity', function(d, i) {return 'title' === self.displayMode ? 1 : 0;});

										function mouserOverText(d, i) {
											d3.select(_this.parent.svg.element).select('#' + 'titleLink' + d.id).attr('stroke-width', '5px');
											d3.select(self.inodeRect[0][i]).select('rect').attr('fill', '#bb3');
										}

										function mouseOutText(d, i) {
											d3.select(_this.parent.svg.element).select('#' + 'titleLink' + d.id).attr('stroke-width', '1px');
											d3.select(self.inodeRect[0][i]).selectAll('rect').attr('fill', '#e5f5f9');
										}

										gGroup.selectAll('.inner_node')
											.style('opacity', function(d, i) {return 'title' === self.displayMode ? 1 : 0;});

									}

									function mouseovered(d) {
										node
											.each(function (n) {
												n.target = n.source = false;
											});

										link
											.classed('link--target', function (l) {
												if (l.target === d) {return l.source.source = true;}
												return null;})
											.classed('link--source', function (l) {
												if (l.source === d) {return l.target.target = true;}
												return null;})
											.filter(function (l) {return l.target === d || l.source === d;})
											.each(function () {this.parentNode.appendChild(this);});

										node
											.classed('node--target', function (n) {
												return n.target;})
											.classed('node--source', function (n) {
												return n.source;});
									}

									function mouseouted(d) {
										link
											.classed('link--target', false)
											.classed('link--source', false);
										node
											.classed('node--target', false)
											.classed('node--source', false);}

									function rightClick(d, i) {
										var selection, datum, table;
										if (d3.event.defaultPrevented) {return;}

										selection = d3.select(this);
										datum = selection.datum();
										table = new $P.Table({
											dbId: datum.dbId,
											name: datum.name,
											experimentType: self.parent.experimentType,
											sourceRing: self,
											w: 400, h: 400});
										bubble.parent.add(table);

										$P.state.scene.addLink(
											new $P.BubbleLink({
												source: new $P.D3TreeRing.BubbleLinkEnd({
													d3ring: _this,
													datum: d3.select(this).datum()}),
												target: new $P.BubbleLink.End({object: table})
											}));

										d3.event.preventDefault();}

									function click(d, i) {
										var ringBubble;
										if (d3.event.defaultPrevented) {return;} // Don't trigger on drag.

										if (i == 0 || d.children == undefined) {return;}
										if (d.children.length == 0) {return;}
										var selectedData = d3.select(this).datum();//Clone Select data
										var name = selectedData.name;
										//var dataType = $(_this.parent.menu.element).find('#file').val();
										var dataType = this.dataType;

										var RingWidth = _this.parent.w;
										var RingHeight = _this.parent.h;
										if (d3.select(this).datum().depth >= 1) {
											RingWidth = (RingWidth - self.legendWidth) * 0.8 + self.legendWidth;
											RingHeight = RingHeight * 0.8;
										}
										ringBubble = new $P.TreeRing({
											x: _this.parent.x + _this.parent.w - 40,
											y: _this.parent.y,
											w: RingWidth, h: RingHeight,
											dataName: selectedData.name,
											dataType: dataType,
											selectedData: selectedData,
											orthologFile: self.orthologFile,
											expressionFile: self.expressionFile});
										self.parent.parent.add(ringBubble);
										$P.state.scene.addLink(
											new $P.BubbleLink({
												source: new $P.D3TreeRing.BubbleLinkEnd({
													d3ring: _this,
													datum: d3.select(this).datum()}),
												target: new $P.BubbleLink.End({object: ringBubble})
											}));

										if (self.customOrtholog) {
											ringBubble.svg.customOrtholog = _this.customOrtholog;
											ringBubble.minRatio = _this.parent.minRatio;
											ringBubble.maxRatio = _this.parent.maxRatio;
											ringBubble.crossTalkLevel = _this.parent.crossTalkLevel;
											ringBubble.file = _this.parent.file;}
										if (self.customExpression) {
											d3.select(ringBubble.svg.element).selectAll('.symbol').remove();
											ringBubble.svg.customExpression = _this.customExpression;
											ringBubble.minRatio = _this.parent.minRatio;
											ringBubble.maxRatio = _this.parent.maxRatio;
											ringBubble.crossTalkLevel = _this.parent.crossTalkLevel;
											ringBubble.file = _this.parent.file;}
										d3.event.preventDefault();
									}
								});

								finish();}

							function addLegends() {
								if (!_this.customExpression) {     //Color Bar for ortholog

									var entries = [{text: 'Complete'}, {text: 'Partial'}, {text: 'Empty'}];
									entries.forEach(function(entry, i) {entry.color = self.orthologColors[i];});

									self.crosstalkLegend = self.addSplitLegend({
										base: self.mainSvg,
										id: 'crosstalkLegend',
										x: self.w * 0.5 - self.legendWidth * 0.5,
										y: self.h * -0.5 + 10,
										fontsize: 12,
										entries: [{
											name: 'Crosstalk Count:',
											size: self.barLength,
											exponentColor: self.color.crosstalkExponent,
											digitColor: self.color.crosstalkDigit}]});

									self.orthologLegend = self.addLegend({
										base: self.mainSvg,
										id: 'orthologLegend',
										x: self.w * 0.5 - self.legendWidth * 0.5,
										y: self.h * 0.1,
										fontsize: 14,
										title: 'Ortholog:',
										entries: entries});}
								else {
									self.expressionLegend = self.addSplitLegend({
										base: self.mainSvg,
										id: 'expressionLegend',
										x: self.w * 0.5 - self.legendWidth * 0.5,
										y: self.h * -0.5 + 20,
										fontsize: 12,
										title: 'Expression:',
										entries: [
											{name: 'Up:',
											 size: self.barLength,
											 exponentColor: self.color.upExponent,
											 digitColor: self.color.upDigit},
											{name: 'Down:',
											 size: self.barLength,
											 exponentColor: self.color.downExponent,
											 digitColor: self.color.downDigit}]});

									entries = [];
									for (i = 10; i >= 0; --i) {
										var max = 100;
										if (self.localExpressionPercent) {max = self.maxExpressionPercent * 100;}
										entries.push({
											color: self.expressionColors[i] || 'none',
											text: '- ' + (i * 0.1 * max).toFixed(0) + '%',
											stroke: 10 == i ? 'none' : 'black'
										});
									}
									self.addLegend({
										base: self.mainSvg,
										id: 'expressionArcLegend',
										fontsize: 12,
										x: self.w * 0.5 - self.legendWidth * 0.5,
										y: self.h * 0.1,
										colorOffsetY: -0.5,
										title: 'Percent Expressed:',
										entries: entries});}}

						}

					});
				});

				d3.select(self.frameElement).style('height', height + 'px');
				this.initialized = true;
				// Force display mode.
				this.displayMode = this.displayMode;},
			/**
			 * Returns the ratio limits set by the user.
			 * @returns {Object} - a min and max value.
			 */
			getRatioLimits: function() {
				return {
					min: parseFloat(this.parent.minRatio || '1.5'),
					max: parseFloat(this.parent.maxRatio || '-1.5')};},
			/**
			 * Gets a (cached) map of ids -> expression
			 */
			getExpressionMap: function() {
				var limits;
				if (!this.customExpression) {return {};}
				if (!this.expressionMap) {
					this.expressionMap = {};
					limits = this.getRatioLimits();
					this.customExpression.forEach(function(expression) {
						if (expression.ratio <= limits.min) {
							this.expressionMap[expression.symbol] = 'down';}
						else if (expression.ratio >= limits.max) {
							this.expressionMap[expression.symbol] = 'up';}
					}.bind(this));}
				return this.expressionMap;},
			/**
			 * Gets the expression for a specific id.
			 * @param {string} id - the id to retrieve
			 * @returns {?string} - up or down
			 */
			getExpression: function(id) {
				return this.getExpressionMap()[id.toUpperCase()];},

			/**
			 * Gets the list of pathways for a crosstalk symbol.
			 * @param {string} symbol - the crosstalk symbol
			 * @returs {string[]} - the pathways names
			 */
			getCrossTalkPathways: function(symbol) {
				var i = this.crosstalkSymbols.symbols.indexOf(symbol);
				if (-1 === i) {return [];}
				return this.crosstalkSymbols.pathwayNames[i];},

			/**
			 * Gets the rate limit for a symbol
			 * @param {string} symbol - the rate-limited symbol
			 * @returs {number} - the rate limiting on the symbol
			 */
			getRateLimit: function(symbol) {
				var i = this.rateLimitSymbols.keys.indexOf(symbol);
				if (-1 === i) {return 0;}
				return this.rateLimitSymbols.values[i];},

			get barLength() {return this._barLength;},
			set barLength(value) {
				if (this._barLength === value) {return;}
				this._barLength = value;
				if (this.expressionLegend) {
					this.expressionLegend.select('#gauge').attr('width', value);
					this.expressionLegend.select('#gauge-end-mark').attr('x', 0.5 + value);
					this.expressionLegend.select('#gauge-end-text').attr('x', 0.5 + value);}
				if (this.crosstalkLegend) {
					this.crosstalkLegend.select('#exponent-bar').attr('width', value);
					this.crosstalkLegend.select('#exponent-end-mark').attr('x', 54.5 + value);
					this.crosstalkLegend.select('#exponent-end-label').attr('x', 51.5 + value);
					this.crosstalkLegend.select('#digit-bar').attr('width', value);
					this.crosstalkLegend.select('#digit-end-mark').attr('x', 54.5 + value);
					this.crosstalkLegend.select('#digit-end-label').attr('x', 51.5 + value);}}
		});

	$P.D3TreeRing.BubbleLinkEnd = $P.defineClass(
		$P.BubbleLink.End,
		function D3TreeRingBubbleLinkEnd(config) {
			this.ring = config.d3ring;
			this.datum = config.datum;
			$P.BubbleLink.End.call(this, {object: this.ring.parent});
		},
		{
			get x() {
				var x = this.ring.centerX + this.ring.zoomTranslate[0]
							+ this.datum.outsideEdge.x * this.ring.zoomScale;
				return x;},
			get y() {
				return this.ring.centerY + this.ring.zoomTranslate[1]
					+ this.datum.outsideEdge.y * this.ring.zoomScale;}
		});

	// old name
	$P.D3Ring = $P.D3TreeRing;
})(PATHBUBBLES);
