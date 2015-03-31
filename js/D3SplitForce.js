(function($P){
	'use strict';

	$P.D3SplitForce = $P.defineClass(
		$P.HtmlObject,
		function D3SplitForce(config) {
			$P.HtmlObject.call(this, {
				parent: '#bubble',
				type: 'div',
				pointer: 'all',
				objectConfig: config});

			this.svg = d3.select(this.element).append('svg').attr('class', 'svg');
			this.svg.main = this.svg.append('g');

			this.layout = new $P.D3SplitForce.Layout();
			this.layout.registerTickListener(this.onTick.bind(this));
			this.layout.force.gravity(0);
			this.layout.gravity = 0.03;
			this.pathways = [];

			this.updateSvgPosition();
		},
		{
			set expression(value) {
				if (this._expression === value) {return;}
				this._expression = value;
				if (!value) {return;}
			},

			getExpressionColor: function(symbol) {
				if ('up' === this._expression[symbol]) {return 'yellow';}
				if ('down' === this._expression[symbol]) {return 'cyan';}
				return 'white';},

			addPathway: function(pathwayId) {
				var self = this;
				function onFinish() {
					self.zoomMod = null;
					self.pathways.push(pathwayId);
					self.layout.mode = 'single';
					self.svg.remove();
					self.svg = d3.select(self.element).append('svg').attr('class', 'svg');
					self.svg.main = self.svg.append('g');
					self.svg.defs = self.svg.append('defs');
					if (1 === self.pathways.length) {self.layoutSingle();}
					if (2 === self.pathways.length) {self.layoutMirror();}
					if (2 < self.pathways.length) {self.layoutRadial();}
					self.updateSvgPosition();
					self.layout.force.start();}
				$P.getJSON(
					'./php/querybyPathwayId.php',
					function (jsonData) {
						self.addEntities(jsonData.map($P.getter('reactomeID')), onFinish);
					},
					{type: 'GET', data: {pathwaydbId: pathwayId}});},

			layoutSingle: function() {
				var self = this, selection;

				self.zoom = d3.behavior.zoom().scaleExtent([0.1, 10])
					.center([self.w/2, self.h/2])
					.on('zoom', self.onZoom.bind(self));
				self.svg.call(self.zoom);

				var side = this.svg;

				this.layout.mode = 'single';
				this.svg.links = this.svg.main.selectAll('.link').data(this.layout.links)
					.enter().append('g').attr('class', 'link');
				this.svg.nodes = this.svg.main.selectAll('.node').data(this.layout.nodes)
					.enter().append('g').attr('class', 'node').call(this.layout.drag);

				console.log(this.layout.nodes);

				this.svg.locations = this.svg.nodes.filter(function(d, i) {return 'location' === d.klass;});
				this.svg.locations.attr('data-class', 'location');
				this.svg.locations.append('circle')
					.attr('stroke', 'black')
					.attr('fill', $P.getter('color'))
					.attr('r', 40);
				side.locations.append('text')
					.style('font-size', '15px')
					.attr('stroke', 'none')
					.attr('fill', 'black')
					.attr('text-anchor', 'middle')
				//.attr('transform', 'rotate(' + (-side.startDegrees) + ')')
					.text($P.getter('name'));
				this.svg.reactionLinks = this.svg.links.filter(
					function(d, i) {return 'reaction:entity' === d.klass;});
				this.svg.reactionLinks.attr('data-class', 'reaction:entity');
				this.svg.reactionLinks.append('line')
					.attr('stroke', 'black')
					.attr('stroke-width', 1.5)
					.attr('fill', 'none');
				this.svg.locationLinks = this.svg.links.filter(
					function(d, i) {return 'entity:location' === d.klass;});
				this.svg.locationLinks.attr('data-class', 'entity:location');
				this.svg.locationLinks.append('line')
					.attr('stroke', 'black')
					.attr('stroke-width', 0.3)
					.attr('fill', 'none');
				this.svg.reactions = this.svg.nodes.filter(function(d, i) {return 'reaction' === d.klass;});
				this.svg.reactions.attr('data-class', 'location');
				this.svg.reactions.append('rect')
					.attr('stroke', 'black')
					.attr('fill', 'red')
					.attr('width', 5).attr('height', 5)
					.attr('x', -2.5).attr('y', -2.5);
				this.svg.entities = this.svg.nodes.filter(function(d, i) {return 'entity' === d.klass;});
				this.svg.entities.attr('data-class', 'entity');
				this.svg.entities.append('circle')
					.attr('stroke', 'none')
					.attr('fill', function(entity) {return self.layout.getNode('location:'+entity.location).color;})
					.attr('fill-opacity', 0.1)
					.attr('pointer-events', 'none')
					.attr('r', 60);
				this.svg.entities.append('circle')
					.attr('stroke', 'black')
					.attr('fill', function(d) {return self.getExpressionColor(d.name);})
					.attr('r', 5);
				this.svg.entityLabels = this.svg.nodes.filter(function(d) {return 'entitylabel' === d.klass;});
				this.svg.entityLabels.attr('data-class', 'entitylabel');
				this.svg.entityLabels.append('text')
					.style('font-size', '12px')
					.attr('text-anchor', 'middle')
					.attr('fill', 'black')
					.text($P.getter('name'));
				this.svg.entityLabelLinks = this.svg.links.filter(
					function(d) {return 'entity:label' === d.klass;});
				this.svg.entityLabelLinks.attr('data-class', 'entity:label');
				this.svg.entityLabelLinks.append('line')
					.attr('stroke', 'black')
					.attr('stroke-width', 1)
					.attr('stroke-opacity', 0.2)
					.attr('fill', 'none');

			},

			layoutMirror: function() {
				var self = this, i, side, eventbox;
				this.layout.mode = 'mirror';

				self.zoom = d3.behavior.zoom().scaleExtent([0.1, 10]).size([500, 500])
					.center([250, 250])
					.on('zoom', self.onZoom.bind(self));
				self.svg.call(self.zoom);
				this.svg.attr('pointer-events', 'all').call(self.zoom);

				/*
				 self.zoom = d3.behavior.zoom().scaleExtent([0.1, 10])
				 .on('zoomstart', function() {
				 var source;
				 self.zoomStart = {
				 translate: self.zoom.translate(),
				 scale: self.zoom.scale()};
				 source = d3.select(d3.event.sourceEvent.srcElement);
				 while (!source.attr('side')) {
				 source = d3.select(source.node().parentNode);}
				 self.zoomSide = source.attr('side');
				 if (1 === self.zoomSide) {}})
				 .on('zoom', self.onZoom.bind(self));
				 */

				this.svg.main.append('line')
					.attr('class', 'divider')
					.attr('stroke', 'black')
					.attr('stroke-width', 10)
					.attr('x1', 0).attr('x2', 0)
					.attr('y1', -1000).attr('y2', 1000);

				this.svg.sides = [];
				side = this.svg.main.append('g')
					.attr('clip-path', 'url(#clipSide0)');
				//eventbox = this.svg.main.append('rect').style('visibility', 'hidden')
				//.attr('pointer-events', 'all').attr('side', 0)
				//.call(self.zoom);
				side = side.append('g')
					.attr('side', 0)
					.attr('transform', 'translate(-125,0)scale(0.5,0.5)');
				//side.eventbox = eventbox;
				side.pathway = this.pathways[0];
				side.color = 'red';
				side.index = 0;
				side.side = 0;
				side.call(self.zoom);
				side.attr('pointer-events', 'all');
				side.clip = this.svg.defs
					.append('svg:clipPath').attr('id', 'clipSide0')
					.append('svg:rect');
				this.svg.sides.push(side);

				side = this.svg.main.append('g')
					.attr('clip-path', 'url(#clipSide1)')
					.append('g')
					.attr('side', 1)
					.attr('transform', 'translate(125,0)scale(-0.5,0.5)');
				side.pathway = this.pathways[1];
				side.index = 1;
				side.side = 1;
				side.mirrored = true;
				side.call(self.zoom);
				side.attr('pointer-events', 'all');
				//side.eventbox = this.svg.main.append('rect').style('visibility', 'hidden')
				//.attr('pointer-events', 'all').attr('side', 1).call(self.zoom);
				side.clip = this.svg.defs
					.append('svg:clipPath').attr('id', 'clipSide1')
					.append('svg:rect');
				this.svg.sides.push(side);

				this.svg.sides.forEach(function(side) {
					var nodes, links;
					nodes = self.layout.nodes.filter(function(node) {
						if ('entity' === node.klass) {
							return node.pathways[side.pathway];}
						if ('entitylabel' === node.klass) {
							return self.layout.getNode('entity:'+node.id).pathways[side.pathway];}
						return true;});
					nodes.forEach(function(node) {node.side = side;});
					nodes.indexed = $P.indexBy(nodes, $P.getter('layoutId'));
					links = self.layout.links.filter(function(link) {
						return nodes.indexed[link.source.layoutId]
							|| nodes.indexed[link.target.layoutId];});

					side.links = side.selectAll('.link').data(links)
						.enter().append('g').attr('class', 'link');
					side.nodes = side.selectAll('.node').data(self.layout.nodes)
						.enter().append('g').attr('class', 'node');
					side.nodes.call(self.layout.drag);

					side.locations = side.nodes.filter(function(d, i) {return 'location' === d.klass;});
					side.locations.attr('data-class', 'location');
					side.locations.append('circle')
						.attr('stroke', 'black')
						.attr('fill', $P.getter('color'))
						.attr('r', 40);
					side.locations.append('text')
						.style('font-size', '15px')
						.attr('stroke', 'none')
						.attr('fill', 'black')
						.attr('text-anchor', 'middle')
						.attr('transform', function() {return side.mirrored ? 'scale(-1,1)' : '';})
						.text($P.getter('name'));
					side.reactionLinks = side.links.filter(
						function(d, i) {return 'reaction:entity' === d.klass;});
					side.reactionLinks.attr('data-class', 'reaction:entity');
					side.reactionLinks.append('line')
						.attr('stroke', 'black')
						.attr('stroke-width', 2)
						.attr('fill', 'none');
					side.locationLinks = side.links.filter(
						function(d, i) {return 'entity:location' === d.klass;});
					side.locationLinks.attr('data-class', 'entity:location');
					side.locationLinks.append('line')
						.attr('stroke', 'black')
						.attr('stroke-width', 0.5)
						.attr('fill', 'none');
					side.reactions = side.nodes.filter(function(d, i) {return 'reaction' === d.klass;});
					side.reactions.attr('data-class', 'location');
					side.reactions.append('rect')
						.attr('stroke', 'black')
						.attr('fill', 'red')
						.attr('width', 5).attr('height', 5);
					side.entities = side.nodes.filter(function(d, i) {return 'entity' === d.klass;});
					side.entities.attr('data-class', 'entity');
					side.entities.append('circle')
						.attr('stroke', 'none')
						.attr('fill', function(entity) {return self.layout.getNode('location:'+entity.location).color;})
						.attr('fill-opacity', 0.1)
						.attr('pointer-events', 'none')
						.attr('r', 60);
					side.entities.filter(function(d) {return nodes.indexed[d.layoutId];})
						.append('circle')
						.attr('stroke', 'black')
						.attr('fill', function(d) {return self.getExpressionColor(d.name);})
						.attr('r', 8);
					side.entities.filter(function(d) {return !nodes.indexed[d.layoutId];})
						.append('circle')
						.attr('stroke', 'black')
						.attr('fill', function(d) {return self.getExpressionColor(d.name);})
						.attr('r', 2);
					side.entityLabels = side.nodes.filter(
						function(d) {return 'entitylabel' === d.klass && nodes.indexed[d.layoutId];});
					side.entityLabels.attr('data-class', 'entitylabel');
					side.entityLabels.append('text')
						.style('font-size', '12px')
						.attr('text-anchor', 'middle')
						.attr('fill', 'black')
						.attr('transform', function() {return side.mirrored ? 'scale(-1,1)' : '';})
						.text($P.getter('name'));
					side.entityLabelLinks = side.links.filter(
						function(d) {return 'entity:label' === d.klass && nodes.indexed[d.source.layoutId];});
					side.entityLabelLinks.attr('data-class', 'entity:label');
					side.entityLabelLinks.append('line')
						.attr('stroke', 'black')
						.attr('stroke-width', 1)
						.attr('stroke-opacity', 0.2)
						.attr('fill', 'none');
				});
			},

			layoutRadial: function() {
				var self = this, i, side, angle, startDegrees, endDegrees, startRadians, endRadians, midRadians,
						startCos, startSin, endCos, endSin,
						nodes, links;
				this.layout.mode = 'radial';
				angle = Math.PI * 2 / this.pathways.length;

				self.zoom = d3.behavior.zoom().scaleExtent([0.1, 10])
					.size([500, 500]).center([0, 0])
					.on('zoom', self.onZoom.bind(self));
				this.svg.attr('pointer-events', 'all').call(self.zoom);

				this.svg.sides = [];
				for (i = 0; i < this.pathways.length; ++i) {
					startRadians = i * Math.PI * 2 / this.pathways.length;
					midRadians = (i + 0.5) * Math.PI * 2 / this.pathways.length;
					endRadians = (i + 1) * Math.PI * 2 / this.pathways.length;
					startDegrees = i * 360 / this.pathways.length;
					endDegrees = (i + 1) * 360 / this.pathways.length;
					side = this.svg.main.append('g')
						.attr('clip-path', 'url(#clipSide'+i+')')
						.append('g')
						.attr('transform', 'rotate('+startDegrees+')scale(0.5,0.5)')
						.attr('pointer-events', 'all');
					side.startRadians = startRadians;
					side.startDegrees = startDegrees;
					side.endRadians = endRadians;
					side.endDegrees = endDegrees;
					side.midRadians = midRadians;
					this.svg.sides.push(side);
					side.call(self.zoom);
					this.svg.main.append('line')
						.attr('class', 'divider')
						.attr('stroke', 'black')
						.attr('stroke-width', 10)
						.attr('x1', 0).attr('y1', 0)
						.attr('x2', 1000 * Math.cos(startRadians))
						.attr('y2', 1000 * Math.sin(startRadians));
					side.pathway = this.pathways[i];
					side.index = i;
					side.side = i;
					side.color = ['red','green','blue','yellow','pink'][i % 5];
					startCos = Math.cos(-startRadians);
					startSin = Math.sin(-startRadians);
					endCos = Math.cos(-endRadians);
					endSin = Math.sin(-endRadians);
					side.clip = this.svg.defs
						.append('svg:clipPath')
						.attr('id', 'clipSide' + i)
						.append('svg:path');

					nodes = self.layout.nodes.filter(function(node) {
						if ('entity' === node.klass) {
							return node.pathways[side.pathway];}
						if ('entitylabel' === node.klass) {
							return self.layout.getNode('entity:'+node.id).pathways[side.pathway];}
						return true;});
					nodes.forEach(function(node) {node.side = side;});
					nodes.indexed = $P.indexBy(nodes, $P.getter('layoutId'));
					links = self.layout.links.filter(function(link) {
						return nodes.indexed[link.source.layoutId]
							|| nodes.indexed[link.target.layoutId];});

					side.links = side.selectAll('.link').data(links)
						.enter().append('g').attr('class', 'link');
					side.nodes = side.selectAll('.node').data(self.layout.nodes)
						.enter().append('g').attr('class', 'node');
					side.nodes.call(self.layout.drag);

					side.locations = side.nodes.filter(function(d, i) {return 'location' === d.klass;});
					side.locations.attr('data-class', 'location');
					side.locations.append('circle')
						.attr('stroke', 'black')
						.attr('fill', $P.getter('color'))
						.attr('r', 40);
					side.locations.append('text')
						.style('font-size', '15px')
						.attr('fill', 'black')
						.attr('text-anchor', 'middle')
						.attr('transform', 'rotate(' + (-side.startDegrees) + ')')
						.text($P.getter('name'));
					side.reactionLinks = side.links.filter(
						function(d, i) {return 'reaction:entity' === d.klass;});
					side.reactionLinks.attr('data-class', 'reaction:entity');
					side.reactionLinks.append('line')
						.attr('stroke', 'black')
						.attr('stroke-width', 2)
						.attr('fill', 'none');
					side.locationLinks = side.links.filter(
						function(d, i) {return 'entity:location' === d.klass;});
					side.locationLinks.attr('data-class', 'entity:location');
					side.locationLinks.append('line')
						.attr('stroke', 'black')
						.attr('stroke-width', 0.5)
						.attr('fill', 'none');
					side.reactions = side.nodes.filter(function(d, i) {return 'reaction' === d.klass;});
					side.reactions.attr('data-class', 'location');
					side.reactions.append('rect')
						.attr('stroke', 'black')
						.attr('fill', 'red')
						.attr('width', 5).attr('height', 5);
					side.entities = side.nodes.filter(function(d, i) {return 'entity' === d.klass;});
					side.entities.attr('data-class', 'entity');
					side.entities.append('circle')
						.attr('stroke', 'none')
						.attr('fill', function(entity) {return self.layout.getNode('location:'+entity.location).color;})
						.attr('fill-opacity', 0.1)
						.attr('pointer-events', 'none')
						.attr('r', 60);
					side.entities.filter(function(d) {return nodes.indexed[d.layoutId];})
						.append('circle')
						.attr('stroke', 'black')
						.attr('fill', function(d) {return self.getExpressionColor(d.name);})
						.attr('r', 8);
					side.entities.filter(function(d) {return !nodes.indexed[d.layoutId];})
						.append('circle')
						.attr('stroke', 'black')
						.attr('fill', function(d) {return self.getExpressionColor(d.name);})
						.attr('r', 2);
					side.entityLabels = side.nodes.filter(
						function(d) {return 'entitylabel' === d.klass && nodes.indexed[d.layoutId];});
					side.entityLabels.attr('data-class', 'entitylabel');
					side.entityLabels.append('text')
						.style('font-size', '12px')
						.attr('text-anchor', 'middle')
						.attr('fill', 'black')
						.attr('transform', 'rotate(' + (-side.startDegrees) + ')')
						.text($P.getter('name'));
					side.entityLabelLinks = side.links.filter(
						function(d) {return 'entity:label' === d.klass && nodes.indexed[d.source.layoutId];});
					side.entityLabelLinks.attr('data-class', 'entity:label');
					side.entityLabelLinks.append('line')
						.attr('stroke', 'black')
						.attr('stroke-width', 1)
						.attr('stroke-opacity', 0.2)
						.attr('fill', 'none');}
			},

			onZoom: function(arg) {
				var zoom = '', oldZoom, originalx = null, x, y, translate, dx, source;
				if ('single' === this.layout.mode) {
					this.zoomMod = 'translate('+d3.event.translate+')scale('+d3.event.scale+')';
					this.updateSvgPosition();}
				if ('mirror' === this.layout.mode) {
					this.zoomMod = '';

					x = d3.event.translate[0];
					y = d3.event.translate[1];
					if (1 == this.zoomSide) {
						dx = d3.event.translate[0] - this.zoomStart.translate[0];
						x = this.zoomStart.translate[0] - dx;}

					this.updateSvgPosition();
					translate = [x, y];
					this.svg.sides[0]
						.attr('transform',
									'translate(' + translate + ')scale(' + d3.event.scale + ')'
									+ 'translate(-125,0)scale(0.5,0.5)');
					this.svg.sides[1]
						.attr('transform',
									'translate(' + (-x)+','+y + ')scale(' + d3.event.scale + ')'
									+ 'translate(125,0)scale(-0.5,0.5)');
					this.svg.oldZoom =
						{translate: d3.event.translate, scale: d3.event.scale};
					if (originalx) {this.svg.oldZoom.translate[0] = originalx;}}
				if ('radial' === this.layout.mode) {
					this.zoomMod = '';

					x = d3.event.translate[0];
					y = d3.event.translate[1];
					//if (1 == this.zoomSide) {
					//	dx = d3.event.translate[0] - this.zoomStart.translate[0];
					//	x = this.zoomStart.translate[0] - dx;}

					this.updateSvgPosition();
					translate = [x, y];
					this.svg.sides.forEach(function(side) {
						side.attr(
							'transform',
							'rotate('+side.startDegrees+')'
								+ 'translate(' + translate + ')scale(' + d3.event.scale + ')'
								+ 'scale(0.5,0.5)');
					});
				}},

			onPositionChanged: function(dx, dy, dw, dh) {
				$P.HtmlObject.prototype.onPositionChanged.call(this, dx, dy, dw, dh);
				if ((dw && dw !== 0) || (dh && dh !== 0)) {this.layout.force.start();}
				this.updateSvgPosition();},

			updateSvgPosition: function() {
				var size;
				if (!this.svg) {return;}
				this.svg.attr('width', this.w).attr('height', this.h);
				size = Math.min(this.w, this.h)/600;
				this.svg.main.attr('transform',
													 (this.zoomMod || '') +
													 'translate('+this.w/2+','+this.h/2+')'+
													 'scale('+size+','+size+')');
				if ('mirror' === this.layout.mode) {
					//this.svg.sides[0].eventbox
					//.attr('x', -this.w/2/size).attr('y', -this.h/2/size)
					//.attr('width', this.w/2/size).attr('height', this.h/size);
					//this.svg.sides[1].eventbox
					//.attr('x', 0).attr('y', -this.h/2/size)
					//.attr('width', this.w/2/size).attr('height', this.h/size);
					this.svg.sides[0].clip
						.attr('x', -this.w/2/size).attr('y', -this.h/2/size)
						.attr('width', this.w/2/size - 5).attr('height', this.h/size);
					this.svg.sides[1].clip
						.attr('x', 5).attr('y', -this.h/2/size)
						.attr('width', this.w/2/size).attr('height', this.h/size);}
				if ('radial' === this.layout.mode) {
					this.svg.sides.forEach(function(side) {
						/*
						 var angle = side.endRadians - side.startRadians,
						 cos = Math.cos(angle),
						 sin = Math.sin(angle);
						 side.clip.attr(
						 'd',
						 'M0 5'
						 + 'l 10000 0'
						 + 'l' + cos * 10000 + ' ' + sin * 10000
						 + 'l -10000 0'
						 + 'l' + cos * -10000 + ' ' + sin * -10000);
						 */
						var startCos = Math.cos(side.startRadians),
								startSin = Math.sin(side.startRadians),
								midCos = Math.cos(side.midRadians),
								midSin = Math.sin(side.midRadians),
								endCos = Math.cos(side.endRadians),
								endSin = Math.sin(side.endRadians);
						side.clip.attr(
							'd',
							'M' + midCos * 8 + ' ' + midSin * 8
								+ 'l' + startCos * 10000 + ' ' + startSin * 10000
								+ 'l' + endCos * 10000 + ' ' + endSin * 10000
								+ 'l' + startCos * -10000 + ' ' + startSin * -10000
								+ 'l' + endCos * -10000 + ' ' + endSin * -10000);
					});
				}
			},

			// by reactome id
			addEntities: function(ids, callback) {
				var self = this;
				$.getJSON('php/getEntitiesById.php?ids=' + ids.join(','), null, function(data) {
					if (data.entities) {
						$.each(data.entities, function(entityId, entity) {
							entity.klass = 'entity';
							self.layout.addNode(entity);});}
					if (data.reactions) {
						$.each(data.reactions, function(reactionId, reaction) {
							reaction.klass = 'reaction';
							self.layout.addNode(reaction);});}
					callback();
				});
			},

			drawSelf: function(context, scale, args) {
				$P.HtmlObject.prototype.drawSelf.call(this, context, scale, args);
				this.updateLayout();},

			updateLayout: function() {
				if (!this.layout.needsUpdate) {return;}
				this.layout.needsUpdate = false;},

			onTick: function() {
				var self = this,
						alpha = this.layout.force.alpha(),
						size = this.layout.force.size(),
						x, y, gravity, squish, angle, radius, edgeDistance;
				if ('single' === this.layout.mode) {
					x = size[0] * 0.5;
					y = size[1] * 0.5;
					gravity = this.layout.gravity * alpha;
					this.layout.nodes.forEach(function(node) {
						node.x += (x - node.x) * gravity;
						node.y += (y - node.y) * gravity;});}
				if ('mirror' === this.layout.mode) {
					x = size[0] * 0.5;
					y = size[1] * 0.5;
					gravity = this.layout.gravity * alpha;
					squish = 0;
					this.layout.nodes.forEach(function(node) {
						if (node.x > x) {
							++squish;
							node.x -= Math.pow(node.x - x, 1.5) * gravity;}
						else {
							node.x += (x - node.x) * gravity;}
						node.y += (y - node.y) * gravity;});
					squish /= this.layout.nodes.length;
					this.layout.nodes.forEach(function(node) {
						node.x -= squish * alpha;});}
				if ('radial' === this.layout.mode) {
					angle = Math.PI / this.pathways.length;
					radius = Math.min(size[0], size[1]);
					gravity = this.layout.gravity * alpha;
					edgeDistance = radius * 0.2;
					this.layout.nodes.forEach(function(node) {
						var r = Math.sqrt(Math.pow(node.x, 2) + Math.pow(node.y, 2)),
								a = Math.atan2(node.y, node.x),
								dMinEdge, dMaxEdge;
						if (r > radius) {r -= (r - radius) * gravity;}
						if (r < radius) {r += Math.pow(radius - r, 1) * gravity;}
						if (a < 0) {a = 0;}
						if (a > angle * 2) {a = angle * 2;}
						node.x = Math.cos(a) * r;
						node.y = Math.sin(a) * r;
						dMinEdge = r * Math.sin(a);
						dMaxEdge = r * Math.sin(angle * 2 - a);
						if (dMinEdge < edgeDistance) {
							node.y += Math.pow(edgeDistance - dMinEdge, 1.5) * gravity;}
						if (dMaxEdge < edgeDistance) {
							node.x += Math.pow(edgeDistance - dMaxEdge, 1.5) * gravity * Math.sin(angle * 2);
							node.y -= Math.pow(edgeDistance - dMaxEdge, 1.5) * gravity * Math.cos(angle * 2);}
					});}

				this.svg.selectAll('.node').attr('transform', function(d) {
					return 'translate(' + d.x + ',' + d.y + ')';});

				this.svg.selectAll('.link line')
					.attr('x1', function(link) {return link.source.x;})
					.attr('y1', function(link) {return link.source.y;})
					.attr('x2', function(link) {return link.target.x;})
					.attr('y2', function(link) {return link.target.y;});}

		});

	/*
	 $P.D3SplitForce.View = $P.defineClass(
	 null,
	 function D3SplitForceView(config) {
	 this.id = config.id;
	 if (!this.id) {
	 console.error('D3SplitForceView('+config+'): missing id');
	 return;}

	 this.parent = config.parent;
	 if (!this.id) {
	 console.error('D3SplitForceView('+config+'): missing parent');
	 return;}

	 this.mode = config.mode || 'rectangle';
	 this.up = config.up || Math.PI / 2;
	 this.flip = config.flip || false;

	 this.view = this.svg.append('g')
	 .attr('transform', config.transform);


	 },
	 {
	 get svg() {
	 return this.parent.svg;},
	 get defs() {
	 if (!this.svg.defs) {this.svg.defs = this.svg.append('defs');}
	 return this.svg.defs;}
	 });
	 */

	$P.D3SplitForce.Layout = $P.defineClass(
		$P.ForceLayout,
		function D3SplitForceLayout(config) {
			var self = this;
			$P.ForceLayout.call(this, config);
			this.reactionEdgeCount = 0;
			this._mode = 'none';
			this.drag = this.force.drag()
				.on('dragstart', function() {
					console.log('DRAGSTART');
					d3.event.sourceEvent.stopPropagation();})
				.on('drag.force', function(d) {
					if ('single' === self.mode) {
						d.px = d3.event.x;
						d.py = d3.event.y;}
					if ('mirror' === self.mode) {
						if (d.side.index === 5) {
							d.px = 500 - d3.event.x;}
						else {
							d.px = d3.event.x;}
						d.py = d3.event.y;}
					if ('radial' === self.mode) {
						d.px = d3.event.x;
						d.py = d3.event.y;
					}
					self.force.alpha(0.05);
					self.force.tick();
					//self.force.alpha(0);
				});
			this.nextLocationColor = 0;
		},
		{
			locationColors: ['red', 'green', 'blue', 'orange', 'yellow', 'purple', 'teal', 'gray'],
			get mode() {return this._mode;},
			set mode(value) {
				if (value === this._mode) {return;}
				this._mode = value;},
			addNode: function(node) {
				$P.ForceLayout.prototype.addNode.call(this, node);
				if ('entity' === node.klass) {this.onAddEntity(node);}
				if ('reaction' === node.klass) {this.onAddReaction(node);}
				return node;},
			onAddEntity: function(entity) {
				var self = this, node, link;

				entity.charge = -100;

				// Add label.
				node = this.addNode({
					name: entity.name,
					id: entity.id,
					klass: 'entitylabel',
					x: 0, y: 0,
					charge: 0});

				this.addLink({
					source: entity, target: node,
					id: entity.id,
					klass: 'entity:label',
					linkDistance: 5,
					linkStrength: 1.0});

				if (entity.location) {
					// Ensure Location.
					node = this.getNode('location:' + entity.location);
					if (!node) {
						node = {
							name: entity.location,
							id: entity.location,
							klass: 'location',
							entities: [],
							color: self.locationColors[self.nextLocationColor++ % self.locationColors.length],
							charge: -25,
							x: 0, y: 0};
						this.addNode(node);

						// Add links between locations to separate them.
						this.getNodes('location').forEach(function(other) {
							if (node === other) {return;}
							self.addLink({
								source: node, target: other,
								id: node.id + '|' + other.id,
								klass: 'location:location:',
								linkDistance: 200,
								linkStrength: 0.05});});}
					node.entities.push(entity);

					// Add link from location to entity.
					link = {
						source: entity, target: node,
						id: entity.id,
						klass: 'entity:location',
						linkDistance: 40,
						linkStrength: 0.2};
					this.addLink(link);}},
			onAddReaction: function(reaction) {
				var self = this;
				reaction.charge = -40;
				if (reaction.entities) {
					// Add links to entities.
					$.each(reaction.entities, function(entityId, direction) {
						var link;
						var entity = self.getNode('entity:' + entityId);
						if (entity) {
							link = {
								source: reaction,
								target: entity,
								klass: 'reaction:entity',
								linkDistance: 30,
								linkStrength: 1,
								id: self.reactionEdgeCount++};
							self.addLink(link);}});}
			},
			addLink: function(link) {
				$P.ForceLayout.prototype.addLink.call(this, link);
				return link;}
		});

})(PATHBUBBLES);
