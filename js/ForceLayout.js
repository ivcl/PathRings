(function($P){
	'use strict';

	$P.ForceLayout = $P.defineClass(
		null,
		function ForceLayout(config) {
			config = config || {};
			this.force = d3.layout.force();
			this.nodes = this.force.nodes();
			this.nodes.indexed = {};
			this.links = this.force.links();
			this.links.indexed = {};
			this.width = config.width || 500;
			this.height = config.height || 500;
			this.force.on('tick', this.onTick.bind(this));
			if (config.nodes) {this.addNodes(config.nodes);}
			if (config.links) {this.addLinks(config.links);}
			this.tickListeners = config.tickListeners || [];
			this.changeListeners = config.changeListeners || [];
			this.needsUpdate = false;

			this.force
				.gravity(0.03)
				.charge(function(node) {
					if (node.charge) {return node.charge;}
					return -30;})
				.linkStrength(function(link) {
					if (link.linkStrength) {return link.linkStrength;}
					return 1;})
				.linkDistance(function(link) {
					if (link.linkDistnace) {return link.linkDistance;}
					return 50;});
		},
		{
			get size() {return this._size;},
			set size(value) {
				if (value === this._size) {return;}
				this._size = value;
				this.force.size(value);},
			addNode: function(node) {
				if (this.nodes.indexed[node.id]) {return false;}
				this.needsUpdate = true;
				node.layoutId = node.layoutId || ((node.klass || '') + ':' + (node.id || node.name || ''));
				this.nodes.push(node);
				this.nodes.indexed[node.layoutId] = node;
				if (node.klass) {
					this.nodes[node.klass] = this.nodes[node.klass] || [];
					this.nodes[node.klass].push(node);}
				return true;},
			getNode: function(layoutId) {return this.nodes.indexed[layoutId];},
			addNodes: function(nodes) {this.nodes.forEach(this.addNode.bind(this));},
			getNodes: function(klass) {
				if (klass) {return this.nodes[klass];}
				return this.nodes;},
			addLink: function(link) {
				if (this.links.indexed[link.id]) {return false;}
				this.needsUpdate = true;
				link.layoutId = link.layoutId || ((link.klass || '') + ':' + (link.id || link.name || ''));
				this.links.push(link);
				this.links.indexed[link.layoutId] = link;
				if (link.klass) {
					this.links[link.klass] = this.links[link.klass] || [];
					this.links[link.klass].push(link);}
				return true;},
			getLink: function(layoutId) {return this.links.indexed[layoutId];},
			addLinks: function(links) {this.links.forEach(this.addLink.bind(this));},
			getLinks: function(klass) {
				if (klass) {return this.links[klass];}
				return this.links;},
			onTick: function() {
				var self = this;
				this.tickListeners.forEach(function(listener) {listener(self);});},
			registerTickListener: function(listener) {
				this.tickListeners.push(listener);}
		});

})(PATHBUBBLES);
