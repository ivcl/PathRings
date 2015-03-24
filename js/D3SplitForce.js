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
					.on('zoom', self.onZoom.bind(self));
				self.svg.call(self.zoom);

				this.layout.mode = 'single';
				this.svg.links = this.svg.main.selectAll('.link').data(this.layout.links)
					.enter().append('g').attr('class', 'link');
				this.svg.nodes = this.svg.main.selectAll('.node').data(this.layout.nodes)
					.enter().append('g').attr('class', 'node').call(this.layout.drag);

				this.svg.locations = this.svg.nodes.filter(function(d, i) {return 'location' === d.klass;});
				this.svg.locations.attr('data-class', 'location');
				this.svg.locations.append('circle')
					.attr('stroke', 'black')
					.attr('fill', 'white')
					.attr('r', 40);
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
					.attr('stroke', 'black')
					.attr('fill', 'blue')
					.attr('r', 5);

			},

			layoutMirror: function() {
				var self = this, i, side, eventbox;
				this.layout.mode = 'mirror';

				self.zoom = d3.behavior.zoom().scaleExtent([0.1, 10]).size([250, 500])
					.on('zoom', self.onZoom.bind(self));
				self.svg.call(self.zoom);

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

				this.svg.attr('pointer-events', 'all').call(self.zoom);

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
						.attr('fill', 'white')
						.attr('r', 40);
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
					side.entities.filter(function(d) {return nodes.indexed[d.layoutId];})
						.append('circle')
						.attr('stroke', 'black')
						.attr('fill', side.color || 'blue')
						.attr('r', 8);
					side.entities.filter(function(d) {return !nodes.indexed[d.layoutId];})
						.append('circle')
						.attr('stroke', 'black')
						.attr('fill', 'white')
						.attr('r', 2);});
			},

			layoutRadial: function() {
				var self = this, i, side, angle, startDegrees, nodes, links;
				this.layout.mode = 'radial';
				angle = Math.PI * 2 / this.pathways.length;

				this.svg.sides = [];
				for (i = 0; i < this.pathways.length; ++i) {
					startDegrees = i * 360 / this.pathways.length;
					side = this.svg.main.append('g')
						.attr('transform', 'translate(200)rotate('+startDegrees+')scale(0.5,0.5)');
					this.svg.sides.push(side);
					side.pathway = this.pathways[i];
					side.color = ['red','green','blue','yellow','pink'][i];
					nodes = self.layout.nodes.filter(function(node) {
						if ('entity' === node.klass) {
							return node.pathways[side.pathway];}
						return true;});
					side.nodes = side.selectAll('.node').data(nodes)
						.enter().append('g').attr('class', 'node');
					side.entities = side.nodes.filter(function(d, i) {return 'entity' === d.klass;});
					side.entities.attr('data-class', 'entity');
					side.entities.append('circle')
						.attr('stroke', 'black')
						.attr('fill', side.color || 'blue')
						.attr('r', 5);}
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
					if (originalx) {this.svg.oldZoom.translate[0] = originalx;}}},

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
						.attr('width', this.w/2/size).attr('height', this.h/size);
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
				var alpha = this.layout.force.alpha(),
						size = this.layout.force.size(),
						x, y, gravity, squish;
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
					self.force.alpha(0.009);
					self.force.tick();
					self.force.alpha(0);});
		},
		{
			get mode() {return this._mode;},
			set mode(value) {
				if (value === this._mode) {return;}
				this._mode = value;},
			addNode: function(node) {
				$P.ForceLayout.prototype.addNode.call(this, node);
				if ('entity' === node.klass) {this.onAddEntity(node);}
				if ('reaction' === node.klass) {this.onAddReaction(node);}},
			onAddEntity: function(entity) {
				var self = this, node, link;

				entity.charge = -100;

				if (entity.location) {
					// Ensure Location.
					node = this.getNode('location:' + entity.location);
					if (!node) {
						node = {
							name: entity.location,
							id: entity.location,
							klass: 'location',
							entities: [],
							color: 'white',
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
								linkDistance: 1000,
								linkStrength: 0.1});});}
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
			}
		});

})(PATHBUBBLES);
