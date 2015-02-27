(function($P){
	//'use strict';

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
			this.selectedData = config.selectedData || null;
			this.showCrossTalkLevel = config.crosstalkLevel || this.parent.crosstalkLevel || 1;
			this.changeLevel = config.changeLevel || false;
			this.customExpression = config.customExpression || null;
			this.maxLevel = 6;
			this.crosstalkSymbols = config.crosstalkSymbols || {};
			this.rateLimitSymbols = config.ratelimitSymbols || {};
			this.highlightPathways = config.highlightPathways || [];
			this.displayMode = config.displayMode || this.parent.displayMode || 'title';
			this.initialized = false;
			this.nodeTextSize = config.nodeTextSize || 10;
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
				var colors = ['#fdae6b', '#a1d99b', '#bcbddc'];
				var gGroup;
				var mainSvg = svg.append('g').attr('class','mainSVG')
							.attr('transform', 'translate(' + width * 0.5 + ',' + height * 0.5 + ')');
				this.mainSvg = mainSvg;
				svg.append('text').attr('class','species')
					.style('font-size', 12)
					.attr('transform', 'translate(' + 10 + ',' + 27 + ')')
					.style('text-anchor', 'start')
					.style('fill', '#666')
					.text(self.parent.species);

				svg.append('text').attr('class','ortholog')
					.style('font-size', 12)
					.attr('transform', 'translate(' + 10 + ',' + 43 + ')')
					.style('text-anchor', 'start')
					.style('fill', '#666')
					.text(self.parent.orthologLabel);

				svg.append('text').attr('class','expression')
					.style('font-size', 12)
					.attr('transform', 'translate(' + 10 + ',' + 59 + ')')
					.style('text-anchor', 'start')
					.style('fill', '#666')
					.text(self.parent.expressionLabel);

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

				var itemDrag = d3.behavior.drag()
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
							});

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

				d3.json('./data/crossTalkings.json', function (error, crossTalkSymbols) {
					_this.crosstalkSymbols = crossTalkSymbols;

					d3.text('./data/ratelimitsymbol.txt', function (error, rateLimitSymbols) {
						//                rateLimitSymbols = rateLimitSymbols.replace(/\r\n/g, '\n');
						//                rateLimitSymbols = rateLimitSymbols.replace(/\r/g, '\n');
						//                var rateLimit_Symbols = rateLimitSymbols.split('\n');
						var rateLimit_Symbols = rateLimitSymbols.split('\r\n');
						_this.rateLimitSymbols.keys = d3.set(rateLimit_Symbols.map(function (d) {
							if (d !== '')
								return d;
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

							d3.json(_this.file, function (error, root) {
								var node, count, minRatio, maxRatio;
								nodeData = partition.nodes(root);
								node = $P.findFirst(nodeData, function(n) {return 1 === n.depth;});
								self.barLength = y(node.y + node.dy) - y(node.y);
								self.maxLevel = d3.max(nodeData, function (d) {return d.depth;});

								if (self.customOrtholog) {
									nodeData.forEach(function (d) {
										if (!d) {return;}
										var symbols = d.symbols || [];
										d.gallusOrth = {};
										d.gallusOrth.sharedSymbols = $P.listIntersection(
											symbols, self.customOrtholog,
											function(symbol, ortholog) {
												if (!symbol) {return false;}
												return symbol.toUpperCase() === ortholog.symbol.toUpperCase();});
										if (symbols.length === d.gallusOrth.sharedSymbols.length) {
											d.gallusOrth.type = 'Complete';}
										else if (0 === d.gallusOrth.sharedSymbols.length) {
											d.gallusOrth.type = 'Empty';}
										else {
											d.gallusOrth.type = 'Part';}});}

								if (self.customExpression) {
									minRatio = self.parent.minRatio;
									maxRatio = self.parent.maxRatio;
									nodeData.forEach(function(d) {
										if (!d.gallusOrth || !d.gallusOrth.sharedSymbols) {return;}
										d.expression = {ups: [], downs: [], unchanges: []};
										$P.listIntersection(
											d.gallusOrth.sharedSymbols,
											self.customExpression,
											function(symbol, expression) {
												if (symbol.toUpperCase() !== expression.symbol.toUpperCase()) {return false;}
												var ratio = parseFloat(expression.ratio);
												if (ratio >= maxRatio) {d.expression.ups.push(expression);}
												else if (ratio <= minRatio) {d.expression.downs.push(expression);}
												else {d.expression.unchanges.push(expression);}
												return true;});});}

								operation(nodeData);});

							function operation(nodeData) {
								var crossTalkFileName = './data/crossTalkLevel/' + nodeData[0].name + '.json';
								self.parent.crossTalkLevel = self.showCrossTalkLevel;
								d3.json(crossTalkFileName, function (error, crossTalkData) {
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
									var expressionColors = [
										'#08519c',
										'#3182bd',
										'#6baed6',
										'#bdd7e7',
										'#eff3ff',
										'#fdd0a2',//red
										'#fdae6b',
										'#fd8d3c',
										'#e6550d',
										'#a63603'
									];
									processTextLinks(nodeData);
									if(_this.highlightPathways.length)
									{
										processHighlightNode(nodeData);
									}
									if (self.customExpression) {
										var max;
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
											return (d.unique.downs.length + d.unique.ups.length) / d.unique.sharedSymbols.length;
										});
										//                                    }
										//                                    else {
										//                                    }

										var divisions = 10;

										var scaleMargin = {top: 5, right: 5, bottom: 5, left: 5},
												scaleWidth = 30 - scaleMargin.left - scaleMargin.right,
												scaleHeight = 170 - scaleMargin.top - scaleMargin.bottom;

										var newData = [];
										var sectionHeight = Math.floor(scaleHeight / divisions);
										for (var i = 0, j = 0; i < scaleHeight && j <= max; i += sectionHeight, j += max / 9) {
											var obj = {};
											obj.data = 9-i;
											obj.text = parseFloat(j).toFixed(3);
											newData.push(obj);
										}

										var BarWidth = scaleWidth + scaleMargin.left + scaleMargin.right;
										var BarHeight = scaleHeight + scaleMargin.top + scaleMargin.bottom;

										var colorScaleBar = svg.append('g')
													.attr('class', 'colorScaleBar')
													.attr('transform', 'translate(' + (width - 3 * scaleWidth) + ',' + ( height  ) + ')')
													.attr('width', BarWidth)
													.attr('height', BarHeight);

										colorScaleBar.selectAll('rect')
											.data(newData)
											.enter()
											.append('rect')
											.attr('x', 0)
											.attr('y', function (d) {
												return d.data;
											})
											.attr('height', sectionHeight)
											.attr('width', scaleWidth)
											.attr('fill', function (d, i) {
												return expressionColors[i];
											});

										colorScaleBar.selectAll('text')
											.data(newData)
											.enter().append('text')
											.style('font-size', 10)
											.attr('transform', 'translate(' + (scaleWidth / 2 + 15) + ',' + (sectionHeight) + ')')
											.attr('y', function (d, i) {
												return d.data - 5;
											})
											.attr('dy', '.1em')
											.style('text-anchor', 'start')
											.text(function (d, i) {
												return d.text;
											});
									}


									function getExpressionColor(ratio) {
										if (max == 0)
											return expressionColors[0];
										return expressionColors[Math.floor(9 * ratio / max)];
									}

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
														return colors[0];
													}
													else if (gallusOrth.type === 'Part') {
														return colors[1];
													}
													else if (gallusOrth.type === 'Empty') {
														return colors[2];
													}
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
										})
										.call(itemDrag);
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
										self.expressionLegend.select('#gauge-end-text')
											.text(maxExpressions);

										// Compute lengths.
										nodes.forEach(function(d, i) {
											d.thickness = Math.min(d.theta * d.radius, Math.floor(self.maxLevel * 2));
											var up = d.expression.ups.length,
													down = d.expression.downs.length;
											d.up = up;
											d.down = down;});

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
											.attr('class', 'up')
											.attr('x', function(d) {return r(d.r);})
											.attr('y', function(d) {return d.thickness * -0.5;})
											.attr('height', function(d) {return d.thickness * 0.5;})
											.attr('width', function(d) {
												if (isNaN(d.up)) {return 0;}
												if (0 === maxExpressions) {return self.barLength;}
												return self.barLength * d.up / maxExpressions;})
											.attr('fill', '#0d0')
											.attr('stroke-width', 0.3)
											.attr('stroke', '#000');
										expressionBar.append('rect')
											.attr('class', 'down')
											.attr('x', function(d) {return r(d.r);})
											.attr('y', function(d) {return 0;})
											.attr('height', function(d) {return d.thickness * 0.5;})
											.attr('width', function(d) {
												if (isNaN(d.down)) {return 0;}
												if (0 === maxExpressions) {return self.barLength;}
												return self.barLength * d.down / maxExpressions;})
											.attr('fill', '#d00')
											.attr('stroke-width', 0.3)
											.attr('stroke', '#000');}

									else {
										nodes.forEach(function(d, i) {
											var symbolCount;
											d.thickness = Math.min(d.theta * d.radius * 0.8, Math.floor(self.maxLevel));
											symbolCount = 0;
											if (d.gallusOrth) {symbolCount = d.gallusOrth.sharedSymbols.length;}
											d.exponent = Math.floor(Math.log(symbolCount) / Math.log(10));
											if (d.exponent < 0) {d.exponent = 0;}
											d.digit = Math.floor(symbolCount / Math.pow(10, d.exponent));});
										var maxExponent = Math.floor(Math.log(maxSymbol) / Math.log(10)),
												exponentLength = self.barLength * maxExponent / 9;
										self.crosstalkLegend.select('#exponent-bar').attr('width', exponentLength);
										self.crosstalkLegend.select('#exponent-end-mark').attr('x', 54.5 + exponentLength);
										self.crosstalkLegend.select('#exponent-end-label')
											.attr('x', 51.5 + exponentLength)
											.text(maxExponent);
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
												return self.barLength * d.exponent / 9;})
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
												return self.barLength * d.digit / 9;})
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
											namu: d3datum.name,
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

										var rect_height = 7.5;
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

										if (i == 0 || d.children == undefined)
											return;
										if (d.children.length == 0)
											return;
										var selectedData = d3.select(this).datum();//Clone Select data
										var name = selectedData.name;
										//var dataType = $(_this.parent.menu.element).find('#file').val();
										var dataType = this.dataType;

										var RingWidth = _this.parent.w;
										var RingHeight = _this.parent.h;
										if (d3.select(this).datum().depth >= 1) {
											RingWidth = RingWidth * 0.8;
											RingHeight = RingHeight * 0.8;
										}
										ringBubble = new $P.TreeRing({
											x: _this.parent.x + _this.parent.w - 40,
											y: _this.parent.y,
											w: RingWidth, h: RingHeight,
											dataName: selectedData.name,
											dataType: dataType,
											selectedData: selectedData});
										ringBubble.experimentType = self.parent.experimentType;
										if(_this.parent.preHierarchical!=='') {
											ringBubble.preHierarchical = self.parent.preHierarchical + '->' + self.parent.id;}
										else {
											ringBubble.preHierarchical +=  _this.parent.id;}
										ringBubble.expressionLabel = _this.parent.expressionLabel;

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

							}

							if (!_this.customExpression) {     //Color Bar for ortholog

								var scaleMargin = {top: 5, right: 5, bottom: 5, left: 5},
										scaleWidth = 30 - scaleMargin.left - scaleMargin.right,
										scaleHeight = 170 - scaleMargin.top - scaleMargin.bottom;
								var BarWidth = scaleWidth + scaleMargin.left + scaleMargin.right;
								var BarHeight = scaleHeight + scaleMargin.top + scaleMargin.bottom;

								var sectionHeight = 20;
								var texts = ['Complete', 'Partial', 'Empty'];
								var newData = [];
								for (var i = 0; i < 3; i++) {
									var obj = {};
									obj.data = i * 20;
									obj.text = texts[i];
									obj.color = colors[i];
									newData.push(obj);}

								var colorScaleBar = svg.append('g')
											.attr('class', 'colorScaleBar')
											.attr('transform', 'translate(' + (_this.w - 100) + ',' + ( 25  ) + ')')
											.attr('width', BarWidth)
											.attr('height', BarHeight);

								colorScaleBar.selectAll('rect')
									.data(newData)
									.enter()
									.append('rect')
									.attr('x', 0)
									.attr('y', function (d) {
										return d.data;
									})
									.attr('height', sectionHeight)
									.attr('width', scaleWidth)

									.attr('fill', function (d) {
										return d.color;
									});
								colorScaleBar.selectAll('text')
									.data(newData)
									.enter().append('text')
									.style('font-size', 10)
									.attr('transform', 'translate(' + (scaleWidth / 2 + 15) + ',' + (sectionHeight) + ')')
									.attr('y', function (d, i) {
										return d.data - 5;
									})
									.attr('dy', '.1em')
									.style('text-anchor', 'start')
									.text(function (d, i) {
										return d.text;
									});

								self.crosstalkLegend = self.mainSvg.append('g')
									.attr('class', 'crosstalkLegend')
									.attr('transform', 'translate(' + (self.w * 0.5 - 110) + ',' + (self.h * 0.5 - 80) + ')')
									.attr('width', BarWidth)
									.attr('height', 40);
								var legend = self.crosstalkLegend;
								legend.append('text')
									.attr('font-size', 10)
									.text('Crosstalk Count = ');
								legend.append('text')
									.attr('font-size', 10)
									.attr('x', 10)
									.attr('y', 10)
									.text('Digit × 10 ^ Exponent');

								_this.crosstalkLegend.append('text')
									.attr('font-size', 10)
									.attr('y', 22)
									.text('Digit:');
								_this.crosstalkLegend.append('rect')
									.attr('id', 'digit-bar')
									.attr('x', 55)
									.attr('y', 16)
									.attr('width', self.barLength)
									.attr('height', 3)
									.attr('fill', '#fca')
									.attr('stroke', 'black')
									.attr('stroke-width', 0.3);
								_this.crosstalkLegend.append('rect')
									.attr('x', 54.5)
									.attr('y', 14)
									.attr('width', 1)
									.attr('height', 10)
									.attr('fill', 'black');
								_this.crosstalkLegend.append('text')
									.attr('x', 51.5)
									.attr('y', 32)
									.attr('font-size', 10)
									.text('0')
									.attr('fill', 'black');
								_this.crosstalkLegend.append('rect')
									.attr('id', 'digit-end-mark')
									.attr('x', 54.5)
									.attr('y', 14)
									.attr('width', 1)
									.attr('height', 10)
									.attr('fill', 'black');
								_this.crosstalkLegend.append('text')
									.attr('id', 'digit-end-label')
									.attr('x', 51.5)
									.attr('y', 32)
									.attr('font-size', 10)
									.text('9')
									.attr('fill', 'black');

								legend.append('text')
									.attr('font-size', 10)
									.attr('y', 42)
									.text('Exponent:');
								legend.append('rect')
									.attr('id', 'exponent-bar')
									.attr('x', 55)
									.attr('y', 37)
									.attr('width', self.barLength)
									.attr('height', 6)
									.attr('fill', '#f44')
									.attr('stroke', 'black')
									.attr('stroke-width', 0.3);
								legend.append('rect')
									.attr('x', 54.5)
									.attr('y', 34)
									.attr('width', 1)
									.attr('height', 10)
									.attr('fill', 'black');
								legend.append('text')
									.attr('x', 51.5)
									.attr('y', 52)
									.attr('font-size', 10)
									.text('0')
									.attr('fill', 'black');
								legend.append('rect')
									.attr('id', 'exponent-end-mark')
									.attr('x', 54.5)
									.attr('y', 34)
									.attr('width', 1)
									.attr('height', 10)
									.attr('fill', 'black');
								legend.append('text')
									.attr('id', 'exponent-end-label')
									.attr('x', 51.5)
									.attr('y', 52)
									.attr('font-size', 10)
									.text('9')
									.attr('fill', 'black');


							}
							else
							{
								/*
								var scaleMargin = {top: 5, right: 5, bottom: 5, left: 5},
										scaleWidth = 30 - scaleMargin.left - scaleMargin.right,
										scaleHeight = 170 - scaleMargin.top - scaleMargin.bottom;
								var BarWidth = scaleWidth + scaleMargin.left + scaleMargin.right;
								var BarHeight = scaleHeight + scaleMargin.top + scaleMargin.bottom;

								var sectionHeight = 20;
								var texts = ['Down Expressed', 'Up Expressed'];
								var expressedColors=['#0f0','#f00'];
								var newData = [];
								for (var i = 0; i < 2; ++i) {
									var obj = {};
									obj.data = (1 - i) * 20;
									obj.text = texts[i];
									obj.color = expressedColors[i];
									newData.push(obj);}
								var colorScaleBar = svg.append('g')
											.attr('class', 'colorScaleBar')
											.attr('transform', 'translate(' + (width - 30 - 80) + ',' + (  25  ) + ')')
											.attr('width', BarWidth)
											.attr('height', BarHeight);

								colorScaleBar.selectAll('rect')
									.data(newData)
									.enter()
									.append('rect')
									.attr('x', 0)
									.attr('y', function (d) {
										return d.data;
									})
									.attr('height', 20)
									.attr('width', 10)

									.attr('fill', function (d) {
										return d.color;
									});
								colorScaleBar.selectAll('text')
									.data(newData)
									.enter().append('text')
									.style('font-size', 10)
									.attr('transform', 'translate(' + (scaleWidth / 2 + 15) + ',' + (sectionHeight) + ')')
									.attr('y', function (d, i) {
										return d.data - 5;
									})
									.attr('dy', '.1em')
									.style('text-anchor', 'start')
									.text(function (d, i) {
										return d.text;
									});
								 */

								self.expressionLegend = self.mainSvg.append('g')
									.attr('class', 'expressionLegend')
									.attr('transform', 'translate(' + (self.w * 0.5 - 70) + ',' + (self.h * -0.5 + 20) + ')');
								var legend = self.expressionLegend;
								legend.append('text')
									.attr('font-size', 12)
									.text('Expressed Genes: ');
								legend.append('rect')
									.attr('y', 5)
									.attr('width', 8)
									.attr('height', 8)
									.attr('fill', '#f00');
								legend.append('text')
									.attr('font-size', 12)
									.text('Up')
									.attr('x', 10)
									.attr('y', 13);
								legend.append('rect')
									.attr('x', 28)
									.attr('y', 5)
									.attr('width', 8)
									.attr('height', 8)
									.attr('fill', '#0f0');
								legend.append('text')
									.attr('font-size', 12)
									.text('Down')
									.attr('x', 38)
									.attr('y', 13);
								legend.append('rect')
									.attr('id', 'gauge')
									.attr('fill', '#f00')
									.attr('x', 1)
									.attr('y', 18)
									.attr('width', self.barLength)
									.attr('height', 6);
								legend.append('rect')
									.attr('x', 0.5)
									.attr('y', 14)
									.attr('width', 1)
									.attr('height', 14)
									.attr('fill', 'black');
								legend.append('text')
									.attr('x', -2.5)
									.attr('y', 38)
									.attr('font-size', 12)
									.text(0);
								legend.append('rect')
									.attr('id', 'gauge-end-mark')
									.attr('x', 0)
									.attr('y', 14)
									.attr('width', 1)
									.attr('height', 14)
									.attr('fill', 'black');
								legend.append('text')
									.attr('id', 'gauge-end-text')
									.attr('x', -2.5)
									.attr('y', 38)
									.attr('font-size', 12)
									.text(0);
							}
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
