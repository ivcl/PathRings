(function($P){
	'use strict';

	$P.D3MirrorForce = $P.defineClass(
		$P.HtmlObject,
		function D3MirrorForce(config) {
			$P.HtmlObject.call(this, {
				parent: '#bubble',
				type: 'div',
				pointer: 'visiblePainted',
				objectConfig: config});
			this.svg = d3.select(this.element).append('svg')
				.attr('width', this.w)
				.attr('height', this.h);
			this.setLayoutOptions();
			this.initialize(config);},
		{
			get size() {return this._size;},
			set size(value) {
				if (value === this._size) {return;}
				this._size = value;},
			get scale() {return this._scale;},
			set scale(value) {
				if (value === this._scale) {return;}
				this._scale = value;},
			get unit() {return this.size * this.scale / 500;},
			onPositionChanged: function(dx, dy, dw, dh) {
				$P.HtmlObject.prototype.onPositionChanged.call(this, dx, dy, dw, dh);
				if (this.svg) {
					this.svg
						.attr('width', this.w)
						.attr('height', this.h);}
				if (this.force) {
					this.force.size([this.w, this.h]).resume();}},
			setLayoutOptions: function() {
				this.scale = 6;

				this.gravity = 0;
				this.linkDistance = 100;
				this.chargeDistance = 500;
				this.charge = -30;

				this.entityLabelDistance = 0.5;
				this.entityLabelStrength = 2;

				this.entityBackgroundSize = 35;
				this.entityBackgroundOpacity = 0.3;

				this.locationSize = 50;
				this.locationStrokeOpacity = 1.0;
				this.locationFillOpacity = 0.6;
				this.locationStrokeWidth = 2;
				this.locationLabelFontSize = 12;

				this.colors = ['cyan', 'yellow', 'lime', 'orange', 'purple'];
				this.entity_label_max_length = 10;
				this.location_label_max_length = 100;
				this.entity_background_opacity = 0.1; // 0.15
				this.entity_aura_color = 'black';
				this.entity_aura_opacity = 0.5;
				this.entity_aura_size = 0.004;
				this.entity_border_color = 'black';
				this.entity_border_size = 0.004;
				this.entity_border_width = 0.002;
				this.entity_size = 0.01;
				this.expressed_entity_size = 0.015;
				this.entity_stroke = 'black';
				this.entity_width = 0.0015;
				this.entity_opacity = 1.0;
				this.entity_pathway_border_size = 0.008;
				this.entity_pathway_border_width = 0.0001;
				this.reaction_size = 0.008;
				this.reaction_width = 0.001;
				this.locationSize = 50;
				this.location_width = 0.0015;
				this.location_separator_length = 0.45;
				this.location_separator_color_mult = 2;
				this.entity_label_size = 0.015;
				this.entity_label_distance = 0.00005;
				this.entity_label_charge = -0.05;
				this.location_label_size = 0.012;
				this.reaction_link_width = 0.002;
				this.pathway_link_width = 0.007;
				this.pathway_link_opacity = 1.0;
				this.location_entity_link_width = 0.0005;
				this.reaction_edge_count = 0;
			},
			prepareData: function(config) {
				this.entities = {};
				this.reactions = {};
				this.all_reactions = this.reactions;
				this.locations = {};

				this.leftPathway = config.leftPathway;
				this.rightPathway = config.rightPathway;
				this.addEntities(config.ids);
			},
			initialize: function(config) {
				var self = this;
				this.size = Math.min(this.w * 0.5, this.h);

				this.svg.normal_layer = this.svg.append('g').attr('id', 'normal-layer');
				this.svg.text_layer = this.svg.append('g').attr('id', 'text-layer');
				this.svg.interact_layer = this.svg.append('g').attr('id', 'interact-layer');

				this.force = d3.layout.force().size([this.size, this.size])
					.gravity(this.gravity)
					.linkDistance(function(link) {
						if (link.linkDistance) {return link.linkDistance;}
						return self.unit * self.linkDistance;})
					.linkStrength(function(link){
						if (link.linkStrength) {return link.linkStrength;}
						return 1;})
					.chargeDistance(function(node) {
						if (node.chargeDistance) {return node.chargeDistance;}
						return self.unit * self.chargeDistance;})
					.charge(function(n) {
						if (n.charge) {return n.charge;}
						return self.unit * self.charge;});

				this.force.on('tick', this.onForceTick.bind(this));

				this.nodes = this.force.nodes();
				this.nodes.entities = [];
				this.nodes.reactions = [];
				this.nodes.locations = [];
				this.nodes.entity_labels = [];
				this.edges = this.force.links();
				this.edges.reactions = [];
				this.edges.entities_to_locations = [];
				this.edges.entity_labels = [];
				this.edges.locations = [];
				this.labels = [];

				this.prepareData(config);
				this.force.start();
				console.log(this);
			},

			onForceTick: function() {
				var update_node = function(n) {
					n.attr('cx', function(n) {return n.x;})
						.attr('cy', function(n) {return n.y;});

					//n.attr('transform', function(n) {
					//	return 'translate(' + n.x + ',' + n.y + ')';});
				};

				update_node(this.svg.selectAll('.entity-background'));
				update_node(this.svg.selectAll('.entity-aura'));
				update_node(this.svg.selectAll('.entity-border'));
				update_node(this.svg.selectAll('.entity'));

				this.svg.selectAll('.location').attr('transform', function(n) {
					return 'translate(' + n.x + ',' + n.y + ')';});
				this.svg.selectAll('.reaction').attr('transform', function(n) {
					return 'translate(' + n.x + ',' + n.y + ')';});
				this.svg.selectAll('.entity-label').attr('x', $P.getter('x')).attr('y', $P.getter('y'));
				this.svg.selectAll('.entity-pathway-border').attr('transform', function(n) {
					return 'translate(' + n.x + ',' + n.y + ')';});

				var update_edge = function(e) {
					e.attr('x1', function(e) {return e.source.x;})
						.attr('y1', function(e) {return e.source.y;})
						.attr('x2', function(e) {return e.target.x;})
						.attr('y2', function(e) {return e.target.y;});};

				update_edge(this.svg.selectAll('.reaction-edge'));
				update_edge(this.svg.selectAll('.entity-to-location'));
				update_edge(this.svg.selectAll('.entity-label-edge'));

				this.svg.selectAll('.pathway-edge').each(function(e) {
					var dir = new $P.Vector2D(e.target.x - e.source.x, e.target.y - e.source.y).normalized().rotate90(),
							total = e.activePathways.length,
							middle = (total - 1) * 0.5;
					if (dir.angle() < 0) {dir = dir.times(-1);}
					d3.select(this).selectAll('.pathway-edge-part')
						.attr('x1', function(d, i) {
							return e.source.x + dir.x * (i - middle) * self.size * self.scale * self.pathway_link_width;})
						.attr('x2', function(d, i) {
							return e.target.x + dir.x * (i - middle) * self.size * self.scale * self.pathway_link_width;})
						.attr('y1', function(d, i) {
							return e.source.y + dir.y * (i - middle) * self.size * self.scale * self.pathway_link_width;})
						.attr('y2', function(d, i) {
							return e.target.y + dir.y * (i - middle) * self.size * self.scale * self.pathway_link_width;});
				});},

			addEntities: function(ids) {
				var bubble = this.parent,
						self = this,
						names;
				$.getJSON('php/getEntitiesById.php?ids=' + ids.join(','), null, function(data) {
					var x = this.size/2,
							y = this.size/2,
							pathwayId2;

					if (data.entities) {
						// Remove existing.
						for (var entity_id in data.entities) {
							if (this.entities[entity_id]) {
								delete data.entities[entity_id];}}

						$.each(data.entities, function(entity_id, entity) {
							// Create locations from entities.
							var locationId = entity.location,
									location = this.locations[locationId];
							if (!location) {
								location = {name: locationId, entities: [], is_location: true,
														color: this.colors[this.location_count % this.colors.length],
														charge: self.unit * -1,
														x: x + Math.random(), y: y + Math.random()};
								this.locations[locationId] = location;
								this.nodes.push(location);
								this.nodes.locations.push(location);
								this.location_count++;}

							var location_edge = {
								source: entity, target: location, edge_type: 'entity_to_location',
								linkDistance: this.size * this.scale * 0.02,
								linkStrength: 0.5};
							this.edges.push(location_edge);
							this.edges.entities_to_locations.push(location_edge);

							location.entities.push(entity_id);

							// Create entity label.
							var label = {
								node_type: 'entity_label',
								label_target: entity,
								name: entity.name || '',
								charge: this.size * this.scale * -0.1,
								x: x + Math.random(), y: y + Math.random()};
							if (label.name.length > this.entity_label_max_length) {
								label.name = label.name.substring(0, this.entity_label_max_length);}
							entity.label = label;
							this.nodes.push(label);
							this.nodes.entity_labels.push(label);

							var edge = {source: entity, target: label, edge_type: 'entity_label',
													linkDistance: self.unit * self.entityLabelDistance,
													linkStrength: self.entityLabelStrength};
							this.edges.push(edge);
							this.edges.entity_labels.push(edge);

							// Add to main entity list.
							entity.x = Math.random() * this.size;
							entity.y = Math.random() * this.size;
							entity.px = entity.x;
							entity.py = entity.y;
							this.entities[entity_id] = entity;
							this.nodes.push(entity);
							this.nodes.entities.push(entity);
						}.bind(this));}

					if (data.reactions) {
						// Use the actual entities instead of ids.
						$.each(data.reactions, function(reaction_id, reaction) {
							var processed = {};
							$.each(reaction.entities, function(entity_id, direction) {
								var entity = this.entities[entity_id];
								if (entity) {processed[entity_id] = entity;}}.bind(this));
							reaction.entities = processed;}.bind(this));

						// Merge the reactions
						//data.reactions = this.merge_reactions(data.reactions);

						$.each(data.reactions, function(reaction_id, reaction) {
							// Already existing reactions
							// XXX TODO possibly need to split reactions here.
							if (this.all_reactions[reaction_id]) {
								var original_reaction = this.all_reactions[reaction_id];
								if (original_reaction.merged_into) {original_reaction = original_reaction.merged_into;}
								// Add unknown entities.
								$.each(reaction.entities, function(entity_id, direction) {
									if (!original_reaction.entities[entity_id]) {
										original_reaction.entities[entity_id] = direction;
										var edge = {
											source: original_reaction,
											target: this.entities[entity_id],
											edge_type: 'reaction',
											id: this.reaction_edge_count};
										this.reaction_edge_count++;
										this.edges.push(edge);
										this.edges.reactions.push(edge);}}.bind(this));}
							// New reaction.
							else {
								this.reactions[reaction_id] = reaction;
								this.all_reactions[reaction_id] = reaction;
								reaction.x = x + Math.random();
								reaction.y = y + Math.random();
								this.nodes.push(reaction);
								this.nodes.reactions.push(reaction);
								$.each(reaction.entities, function(entity_id, direction) {
									var edge = {
										source: reaction,
										target: this.entities[entity_id],
										edge_type: 'reaction',
										id: this.reaction_edge_count};
									this.reaction_edge_count++;
									this.edges.push(edge);
									this.edges.reactions.push(edge);}.bind(this));}
						}.bind(this));}

					this.update_svg();
					this.force.start();
				}.bind(this));},
			merge_reactions: function(reactions) {
				var a, b, id_a, id_b, processed, merged;

				function have_same_entities(a, b) {
					var i,
							a_keys = Object.keys(a.entities),
							b_keys = Object.keys(b.entities);
					if (a_keys.length != b_keys.length) {return false;}
					a_keys.sort();
					b_keys.sort();
					for (i = 0; i < a_keys.length; ++i) {
						if (a_keys[i] != b_keys[i]) {return false;}}
					return true;}

				function merge_entities(parent, child) {
					parent.combined = parent.combined || {};
					parent.size = parent.size || 1;
					parent.combined[child.id] = child;
					parent.size++;
					child.merged_into = parent;}

				processed = {};
				for (id_a in reactions) {
					a = reactions[id_a];
					merged = false;
					for (id_b in processed) {
						b = reactions[id_b];
						if (have_same_entities(a, b)) {
							merge_entities(b, a);
							merged = true;
							break;}}
					if (!merged) {
						processed[id_a] = a;}}

				// Replace master reactions object.
				return processed;},

			update_svg: function() {
				var self = this,
						bubble = this.parent;

				// Color backgrounds for entities.
				this.svg.entity_backgrounds = this.svg.normal_layer.selectAll('.entity-background').data(this.nodes.entities, $P.getter('id')).enter()
					.append('circle')
					.attr('class', 'entity-background')
					.attr('stroke-opacity', 0)
					.attr('fill', function(entity) {return self.locations[entity.location].color;})
					.attr('fill-opacity', this.entityBackgroundOpacity)
					.attr('r', this.unit * this.entityBackgroundSize)
					.attr('x', this.size * this.entityBackgroundSize * -0.5)
					.attr('y', this.size * this.entityBackgroundSize * -0.5);

				// Labels
				this.svg.entity_labels = this.svg.text_layer.selectAll('.entity-label').data(this.nodes.entity_labels, function(d) {return d.label_target.id;}).enter()
					.append('text')
					.attr('class', 'entity-label')
					.style('font-size', this.size * this.scale * this.entity_label_size)
					.text($P.getter('name'));

				this.svg.entities_to_locations = this.svg.normal_layer.selectAll('.entity-to-location').data(this.edges.entities_to_locations, function(d) {return d.source.id;}).enter()
					.append('line')
					.attr('class', 'entity-to-location')
					.attr('stroke', 'black')
					.attr('stroke-width', this.size * this.scale * this.location_entity_link_width)
					.attr('stroke-opacity', 0.2)
					.attr('fill', 'none');

				// The locations
				this.svg.locations = this.svg.interact_layer.selectAll('.location').data(this.nodes.locations, $P.getter('name')).enter()
					.append('g')
					.attr('class', 'location');
				this.svg.locations
					.append('circle')
					.attr('stroke', 'black')
					.attr('stroke-width', this.unit * this.locationStrokeWidth)
					.attr('stroke-opacity', this.locationStrokeOpacity)
					.attr('fill', $P.getter('color'))
					.attr('fill-opacity', this.locationFillOpacity)
					.attr('r', this.unit * this.locationSize)
					.attr('x', this.unit * this.locationSize * -0.5)
					.attr('y', this.unit * this.locationSize * -0.5);

				this.svg.locations.append('text')
					.style('font-size', Math.floor(this.unit * this.locationLabelFontSize) + 'px')
					.attr('stroke', 'none')
					.attr('text-anchor', 'middle')
					.text($P.getter('name'));

				if (this.svg.reaction_edges) {this.svg.reaction_edges.remove();}
				this.svg.reaction_edges = this.svg.normal_layer.selectAll('.reaction-edge')
					.data(this.edges.reactions, $P.getter('id')).enter()
					.append('line')
					.attr('class', 'reaction-edge')
					.attr('stroke', function(e) {
						var entity = e.source, reaction = e.target;
						if (!reaction.color) {
							entity = e.target;
							reaction = e.source;}
						if (entity.expression == 'retinal' && reaction.color == 'red') {return 'red';}
						if (entity.expression == 'pineal' && reaction.color == 'green') {return 'green';}
						if (entity.expression == 'retinal' && reaction.green > reaction.red) {return 'purple';}
						if (entity.expression == 'pineal' && reaction.green < reaction.red) {return 'purple';}
						return reaction.color;})
					.attr('stroke-width', this.size * this.scale * this.reaction_link_width)
					.attr('stroke-opacity', 0.4)
					.attr('fill', 'none');

				if (this.svg.pathway_edges) {this.svg.pathway_edges.remove();}
				this.svg.pathway_edges = this.svg.normal_layer.selectAll('.pathway-edge')
					.data(this.edges.reactions.filter($P.getter('activePathways')), $P.getter('id')).enter()
					.append('g')
					.attr('class', 'pathway-edge');
				this.svg.pathway_edges.each(function(edge) {
					d3.select(this).selectAll('.pathway-edge-part').data(edge.activePathways).enter()
						.append('line')
						.attr('class', 'pathway-edge-part')
						.attr('stroke', function(pathwayId) {return bubble.pathways[pathwayId].color;})
						.attr('stroke-width', self.size * self.scale * self.pathway_link_width)
						.attr('stroke-opacity', self.pathway_link_opacity)
						.attr('fill', 'none');});

				// Pathway indicators
				this.svg.entityPathwayBorders = this.svg.normal_layer.selectAll('.entity-pathway-border')
					.data(this.nodes.entities.filter(this.entityHasPathwayBorder.bind(this)), $P.getter('id'));
				this.svg.entityPathwayBorders.enter()
					.append('g')
					.attr('class', 'entity-pathway-border')
					.selectAll('.pathway-border-arc').data(function(entity, index) {return entity.activePathways;})
					.enter()
					.append('path')
					.attr('d', function(pathwayId, index) {
						var entity = this.parentNode.__data__;
						return (d3.svg.arc()
										.innerRadius(0)
										.outerRadius(self.entity_radius(entity) +
																 self.entity_pathway_border_size * self.size * self.scale)
										.startAngle(Math.PI * 2 * index / entity.activePathways.length)
										.endAngle(Math.PI * 2 * (index + 1) / entity.activePathways.length))
						();})
					.attr('stroke', 'black')
					.attr('stroke-width', this.entity_pathway_border_width)
					.attr('fill', function(pathwayId) {
						return bubble.pathways[pathwayId].color;});

				this.svg.entity_label_edges = this.svg.normal_layer.selectAll('.entity-label-edge').data(this.edges.entity_labels, function(d) {return d.source.id;}).enter()
					.append('line')
					.attr('class', 'entity-label-edge')
					.attr('stroke', 'black')
					.attr('stroke-width', this.size * this.scale * 0.001)
					.attr('stroke-opacity', 0.15)
					.attr('fill', 'none');

				// The reactions.
				this.svg.reactions = this.svg.interact_layer.selectAll('.reaction').data(this.nodes.reactions, $P.getter('id')).enter()
					.append('g');
				this.svg.reactions
					.append('rect')
					.attr('class', 'reaction')
					.attr('stroke', 'black')
					.attr('stroke-width', this.reaction_width)
					.attr('fill', $P.getter('color'))
					.attr('width', this.reaction_length.bind(this))
					.attr('height', this.reaction_length.bind(this))
					.attr('x', function(d) {return -0.5 * this.reaction_length(d);}.bind(this))
					.attr('y', function(d) {return -0.5 * this.reaction_length(d);}.bind(this));

				this.svg.reactions.append('title').text(function(r) {
					if (!r.combined) {return r.name;}
					var text = '* ' + r.name;
					for (var id in r.combined) {
						text = text + '\n* ' + r.combined[id].name;}
					return text;});

				// Highlight around the nodes of interest.
				this.svg.entity_auras = this.svg.normal_layer.selectAll('.entity-aura')
					.data(this.nodes.entities.filter(this.entity_has_aura), $P.getter('id')).enter()
					.append('circle')
					.attr('class', 'entity-aura')
					.attr('stroke', 'none')
					.attr('fill', this.entity_aura_color)
					.attr('fill-opacity', this.entity_aura_opacity)
					.attr('r', function(n) {return this.entity_radius(n) + this.entity_aura_size;}.bind(this));

				// Add borders to specific entities.
				this.svg.entity_borders = this.svg.normal_layer.selectAll('.entity-border').data(this.nodes.entities.filter(this.entity_has_border), $P.getter('id')).enter()
					.append('circle')
					.attr('class', 'entity-border')
					.attr('stroke', this.entity_border_color)
					.attr('stroke-width', this.entity_border_width)
					.attr('r', function(e) {return this.entity_radius(e) + this.entity_border_size;}.bind(this));

				// The actual entity circles.
				this.svg.entities = this.svg.interact_layer.selectAll('.entity').data(this.nodes.entities, $P.getter('id')).enter()
					.append('circle')
					.attr('class', 'entity')
					.attr('stroke', this.entity_stroke)
					.attr('stroke-width', this.size * this.scale * this.entity_width)
					.attr('fill', function(n) {
						if (n.expression == 'retinal') {return 'red';}
						if (n.expression == 'pineal') {return 'green';}
						return 'white';})
					.attr('fill-opacity', this.entity_opacity)
					.attr('r', this.size * this.scale * this.entity_size)
					.on('contextmenu', function(entity) {
						d3.event.preventDefault();
						this.entity_expand(entity);});

				// Entity titles
				this.svg.entities.append('title').text(function(entity) {
					return entity.name + ' [' + entity.location + ']';});},

			// Get the entity radius.
			entity_radius: function(entity) {
				if (entity.expression == 'retinal' || entity.expression == 'pineal') {
					return this.size * this.scale * this.expressed_entity_size;}
				return this.size * this.scale * this.entity_size;},

			reaction_length: function(reaction) {
				var s = reaction.size || 1;
				s = Math.pow(s, 0.3);
				return this.size * this.scale * this.reaction_size * s;},

			location_radius: function(location) {
				return this.size * this.scale * this.location_size;},

			entity_has_aura: function(entity) {return entity.ratelimit;},

			entity_has_border: function(entity) {return entity.crosstalk;},

			entityHasPathwayBorder: function(entity) {
				var pathwayId;
				if (!entity.pathways) {return false;}
				for (pathwayId in entity.pathways) {
					if (this.parent.pathways[pathwayId]) {return true;}}
				return false;}


		});

})(PATHBUBBLES);
