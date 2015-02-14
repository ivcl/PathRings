/**
 * @author      Yongnan
 * @version     1.0
 * @time        11/6/2014
 * @name        PathBubble_D3PathwayRing
 */
PATHBUBBLES.D3PathwayRing = function (parent, name, dbId, defaultRadius) {
    this.parent = parent;
    this.defaultRadius = defaultRadius;
    this.name = name || null;
    this.file = "./data/Hierarchy/68616.json";
//    this.file = "./data/Hierarchy/" + dbId + ".json";
};
PATHBUBBLES.D3PathwayRing.prototype = {
    constructor: PATHBUBBLES.D3PathwayRing,
//     reflesh:function() {
//         for (var i = 0; i < this.children.length - 1; ++i) {
//             this.children[i + 1].x = this.children[i].x + this.children[i].w;
//             this.children[i + 1].y = this.children[i].y;
//         }
//     }
    init: function () {
        var _this = this;
        var width = this.defaultRadius,
            height = this.defaultRadius,
            radius = Math.min(width, height) / 2;

        var svg = d3.select("#svg" + _this.parent.id).append("svg")
            .attr("width", width)
            .attr("height", _this.parent.h);

        var mainSvg = svg.append("g")
            .attr("transform", "translate(" + width / 2 + "," + (height / 2 ) + ")");



        d3.select(self.frameElement).style("height", height + "px");
    }
};
