/**
 * @author      Yongnan
 * @version     1.0
 * @time        10/18/2014
 * @name        PathBubble_D3Table
 */

(function($P){
	'use strict';

	$P.D3Table = $P.defineClass(
		$P.HtmlObject,
		function D3Table(config) {
			$P.HtmlObject.call(this, {
				parent: '#bubble',
				type: 'div',
				pointer: 'auto',
				objectConfig: config});
			this.maxHeight = this.h;
			this.data = config.data || null;
			if (!config.dbId) {console.error('ERROR: D3Table(', config, ') dbId is not defined.');}
			this.dbId = config.dbId;
			this.querySymbol = config.querySymbol;
			this.keepQuery = undefined === config.keepQuery ? true : config.keepQuery;
			this._symbols2Pathways = this.parent.crosstalking;},
		{
			onPositionChanged: function(dx, dy, dw, dh) {
				$P.HtmlObject.prototype.onPositionChanged.call(this, dx, dy, dw, dh);
				this.maxHeight += dh;},
			init: function (dbId, querySymbol) {
				if (undefined !== dbId) {this.dbId = dbId;}
				if (undefined !== querySymbol) {this.querySymbol = querySymbol;}

				var self = this,
						width = this.w,
						height = this.h;

				var container = d3.select(this.element)
							.style('width', width )
							.style('height',  height )
							.style('border', '2px solid #000')
							.style('overflow', 'scroll');

				var table = container.append('table')
							.style('width', width )
							.style('height', height );

				table.append('thead');
				table.append('tbody');

				var previousSort = null;
				var format = d3.time.format('%a %b %d %Y');
				refreshTable(null);
				function refreshTable(sortOn){
					if (!self.data) {
						if (self.querySymbol) {
							$P.getJSON('./php/querybyPathwayIdSymbol.php', function (jsonData) {operation(jsonData);}, {
								type: 'GET',
								data: {pathwaydbId: self.dbId, symbol: self.querySymbol}});}
						else {
							$P.getJSON('./php/querybyPathwayId.php', function (jsonData) {operation(jsonData);}, {
								type: 'GET',
								data: {pathwaydbId: self.dbId}});
						}
					}
					else {
						operation(self.data);
					}
					function operation(jsonData) {

						self.data = jsonData;

						var oldH = self.h,
								newH = Math.min(jsonData.length*12+100, self.maxHeight);
						self.parent.translate(0, 0, 0, newH - oldH);
						self.h = newH;

						container
							.style('width', width )
							.style('height',  height );
						container.select('table')
							.style('width', width )
							.style('height',  height );
						var click = true;
						// create the table header
						var thead = container.select('thead').selectAll('th')
									.data(d3.keys(jsonData[0]))
									.enter().append('th')
									.style('padding', '5px')
									.text(function (d) {
										if(d=='ratio')
											return 'ratio(log2 based)';
										return d;
									})
									.on('click', function(d,i){
										click=!click;
										if(click)
										{
											container.select('tbody').selectAll('tr').sort(function (a, b) {
												return sort(a[d], b[d]);
											});
										}
										else
										{
											container.select('tbody').selectAll('tr').sort(function (a, b) {
												return sort(b[d], a[d]);
											});
										}

									});

						// fill the table
						// create rows
						var tr = container.select('tbody').selectAll('tr').data(jsonData);
						tr.enter().append('tr');

						var maxCount = d3.max(jsonData,function(d){ return d.count});
						var maxCrossTalks = d3.max(jsonData,function(d){ return d.crossTalk});
						var maxRatio = d3.max(jsonData,function(d){ return parseFloat(d.ratio)});
						// create cells
						tr.on('click', function(d) {
							//d3.selectAll('tr').classed('highlight', false);
							//d3.select(this).classed('highlight', true);
						});
						var td = tr.selectAll('td').data(function (d) {
							if(self.keepQuery)
							{
								var symbol = d.symbol;
								var obj = [];
								d3.entries(d).forEach(function(data){
									data.symbol = symbol;
									obj.push(data);
								});

								return obj;
							}
							else
								return d3.entries(d);
						});
						var cellTd = td.enter().append('td');
						updateRect();

						cellTd.on('click', function (d){
							var i, treeRing;
							if(d.key=='symbol')
							{
								if( $('#information').children('iframe').length==0)
								{
									var iframe = $('<iframe frameborder="0" marginwidth="0" marginheight="0" width="560px" height="500"></iframe>');
									iframe.attr({src: 'http://www.ncbi.nlm.nih.gov/gquery/?term='+d.value});
									$('#information').append(iframe).dialog({
										autoOpen: false,
										modal: false,
										resizable: false,
										width: 'auto',
										height: 'auto',
										position: [(d3.event.pageX+10),d3.event.pageY-10],
										close: function () {
											iframe.attr('src', 'http://www.ncbi.nlm.nih.gov/gquery');
										}
									});
								}
								else
								{
									$('#information').dialog('option', 'position', [(d3.event.pageX+10),d3.event.pageY-10]);
									$('#information').children('iframe').attr({src: 'http://www.ncbi.nlm.nih.gov/gquery/?term='+d.value});
								}

								$('#information').dialog('open');
								$('#information').on('contextmenu', function(e){
									return false;
								});
							}
							else if(d.key=='crossTalk')
							{
								if(d.value == 0) {
									alert('It does not have cross-talking pathways!');
									console.error('It does not have cross-talking pathways!');}

								else {
									treeRing = self.parent.sourceRing;

									var index = self._symbols2Pathways.symbols.indexOf(d.symbol);
									if (index !== -1) {
										var pathways = self._symbols2Pathways.pathwayNames[index].slice(0);
										for(i = 0; i < pathways.length; ++i) {
											pathways[i] = $.trim(pathways[i]);}
										if (!treeRing) {return;}
										treeRing.createSvg({highlightPathways: pathways});
									}
								}
							}
						})
							.on('contextmenu', function (d, i) {
								if (self.keepQuery && d.key == 'symbol')
								{
									if (d.value == String(d.value))
									{
										var table = new $P.Table({
											keepQuery: false,
											queryObject: {dbId: self.dbId, symbol: d.value},
											name: self.parent.name + '-' + d.value
										});
										self.parent.parent.add(table);
										d3.event.preventDefault();
									}
									d3.event.preventDefault();
								}
								else
								{
									d3.event.preventDefault();
								}
							});

						cellTd.append('text')
							.style('margin', '0px 5px')
							.attr('class', function (d) {
								if (d.key == 'symbol')
									return 'hyper';
								else  if(d.key == 'crossTalk')
									return 'hyper';
								else
									return 'normalCell';
							})
							.text(function (d) {
								return d.value;
							});
						function updateRect(){

							if(jsonData[0].hasOwnProperty('count'))
							{
								var maxCount = d3.max(jsonData,function(d) {return d.count;});
								if(maxCount > 0) {
									cellTd.append('svg')
										.attr('class', 'cellCount')
										.attr('width',
													function(d) {
														if(d.key == 'count')
															return d.value /maxCount * 20;
														else
															return 0;
													})
										.attr('height', 10)
										.append('rect')
										.attr('height', 10)
										.attr('width',
													function(d) {
														if(d.key == 'count')
															return d.value /maxCount * 20;
														else
															return 0;
													});
								}
							}
							if(jsonData[0].hasOwnProperty('crossTalk'))
							{
								var maxCrossTalks = d3.max(jsonData,function(d) {return d.crossTalk;});
								if(maxCrossTalks>0)
								{
									cellTd.append('svg')
										.attr('class', 'cellCrossTalk')
										.attr('width',
													function(d) {
														if(d.key == 'crossTalk')
															return d.value /maxCrossTalks * 20;
														else
															return 0;
													})
										.attr('height', 10)
										.append('rect')
										.attr('height', 10)
										.attr('width',
													function(d) {
														if(d.key == 'crossTalk')
															return d.value /maxCrossTalks * 20;
														else
															return 0;
													});
								}
							}
							if(jsonData[0].hasOwnProperty('rateLimit'))
							{

								cellTd.append('svg')
									.attr('class', 'cellRateLimit')
									.attr('width',
												function(d) {
													if(d.key == 'rateLimit')
														return d.value ? 20:0;
													else
														return 0;
												})
									.attr('height', 10)
									.append('rect')
									.attr('height', 10)
									.attr('width',
												function(d) {
													if(d.key == 'rateLimit')
														return d.value ? 20:0;
													else
														return 0;
												});
							}
							if(jsonData[0].hasOwnProperty('ratio'))
							{
								var maxRatio = d3.max(jsonData,function(d){ return parseFloat(d.ratio)});
								var minRatio = d3.min(jsonData,function(d){ return parseFloat(d.ratio)});
								if(maxRatio>0)
								{
									cellTd.append('svg')
										.attr('class', 'cellRatio')
										.attr('width',
													function(d) {
														if(d.key == 'ratio')
														{
															if((maxRatio-minRatio)==0)
																return 0;
															return (parseFloat(d.value) -minRatio) /(maxRatio-minRatio ) * 20;
														}
														else
															return 0;
													})
										.attr('height', 10)
										.append('rect')
										.attr('height', 10)
										.attr('width',
													function(d) {
														if(d.key == 'ratio')
														{
															if((maxRatio-minRatio)==0)
																return 0;
															return (parseFloat(d.value) -minRatio) /(maxRatio-minRatio ) * 20;
														}
														else
															return 0;
													});
								}
							}
						}
					}
				}

				function sort(a,b){
					if(typeof a == 'string'){
						if(typeof parseFloat(a) == 'number' && typeof parseFloat(b) == 'number' )
						{
							if(!isNaN( parseFloat(a) ) && !isNaN (parseFloat(b) )  )
								return parseFloat(a) > parseFloat(b) ? 1 : parseFloat(a) == parseFloat(b) ? 0 : -1;
							else
								return a.localeCompare(b);
						}
						else
							return a.localeCompare(b);
					}
					else if(typeof a == 'number'){
						return a > b ? 1 : a == b ? 0 : -1;
					}
					else if(typeof a == 'boolean'){
						return b ? 1 : a ? -1 : 0;
					}
					return null;}
			},

			/**
			 * Run callback with data as the first argument.
			 */
			withData: function(callback) {
				var self = this, ajax;
				if (this.data) {
					callback(this.data);
					return;}

				ajax = {
					type: 'GET',
					data: {pathwaydbId: this.dbId},
					success: function (data) {
						self.data = data;
						callback(data);},
					error: function () {
						console.error('D3Table#withData(', callback, '): Could not retrieve data.');}};

				if (this.querySymbol) {
					ajax.url = './php/querybyPathwayIdSymbol.php';
					ajax.data.symbol = this.querySymbol;}
				else {
					ajax.url = './php/querybyPathwayId.php';}

				$.ajax(ajax);
			}
		});
})(PATHBUBBLES);
