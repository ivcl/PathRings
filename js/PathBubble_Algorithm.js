/**
 * @author      Yongnan
 * @version     1.0
 * @time        10/1/2014
 * @name        PathBubbles_Algorithm
 * @thanks      UnionFind algorithm is from  https://github.com/nickkthequick/node-union-find/blob/master/unionFind.js
 */
PATHBUBBLES.Algorithm = PATHBUBBLES.Algorithm || {};
PATHBUBBLES.Algorithm.UnionFind = function (nodes) {
    this.nodes = {};
    this.groupCount = nodes.length;
    this.initGroups(nodes);
};
PATHBUBBLES.Algorithm.UnionFind.prototype = {
    initGroups: function (nodes) {
        for (var i = 0; i < nodes.length; i++) {
            this.nodes[nodes[i]] = new PATHBUBBLES.Algorithm.UnionFind.Node(nodes[i]);
        }
    },
    find: function (node) {
        return this.nodes[node];
    },
    inSameGroup: function (node1, node2) {
        if (!this.find(node1)) {
            console.log("node1 couldn't find that referenced group");
            console.log(JSON.stringify(node1));
            return false;
        } else if (!this.find(node2)) {
            console.log("node2 couldn't find that referenced group");
            return false;
        }
        return this.find(node1).equals(this.find(node2));
    },
    union: function (group1, group2) {
        if (!this.nodes[group1]) {
            console.log("group1 was not present!");
            return;
        } else if (!this.nodes[group2]) {
            console.log("group2 was not present!");
            return;
        }

        var smallGroup
            , bigGroup;

        if (this.nodes[group1].getGroupSize() >= this.nodes[group2].getGroupSize()) {
            bigGroup = this.nodes[group1];
            smallGroup = this.nodes[group2];
        } else {
            smallGroup = this.nodes[group1];
            bigGroup = this.nodes[group2];
        }
        smallGroup.changeGroup(bigGroup, this.nodes);
        this.groupCount--;
    }
};
PATHBUBBLES.Algorithm.UnionFind.Group = function (node) {
    this.nodes = [];

    this.leader = node;
    this.nodes.push(node);
    this.groupSize = 1;
};

PATHBUBBLES.Algorithm.UnionFind.Group.prototype = {
    mergeGroup: function (sourceGroup) {
        this.groupSize += sourceGroup.groupSize;
        this.nodes = this.nodes.concat(sourceGroup.nodes);
    },
    mergeIntoGroup: function (targetGroup, nodelist) {
        for (var i = 0; i < this.nodes.length; i++) {
            nodelist[this.nodes[i]].group = targetGroup;
        }
    }
};

PATHBUBBLES.Algorithm.UnionFind.Node = function (node) {
    this.node = node;
    this.group = new PATHBUBBLES.Algorithm.UnionFind.Group(node);
};

PATHBUBBLES.Algorithm.UnionFind.Node.prototype = {
    changeGroup: function (targetNode, nodelist) {
        targetNode.group.mergeGroup(this.group);
        this.group.mergeIntoGroup(targetNode.group, nodelist);
    },
    equals: function (otherNode) {
        return this.group.leader == otherNode.group.leader;
    },
    getGroupSize: function () {
        return this.group.groupSize;
    },
    getGroupLeader: function () {
        return this.group.leader;
    }
};


