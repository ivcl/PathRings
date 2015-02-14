/**
 * @author      Yongnan
 * @version     1.0
 * @time        9/16/2014
 * @name        PathBubble_render
 */
PATHBUBBLES.Renderer = function () {
    this.canvasWidth = window.innerWidth;
    this.canvasHeight = window.innerHeight;
    this.navCanvasWidth = window.innerWidth;
    this.navCanvasHeight = 50;
    this.alpha = false;
    this.ctx = canvas.getContext('2d', {
//        alpha: this.alpha === true
    });  // when set to false, the canvas will redraw everything
    this.nav_ctx = navCanvas.getContext('2d', {
//        alpha: this.alpha === true
    });  // when set to false, the canvas will redraw everything
    this.valid = false;
};
PATHBUBBLES.Renderer.prototype = {
    constructor: PATHBUBBLES.Renderer,

    clear: function () {
        this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
        var grd = this.ctx.createLinearGradient(0, 0, 0, this.canvasHeight);
        grd.addColorStop(0, "#3E4041");
        grd.addColorStop(1, "#899DAB");

        this.ctx.fillStyle = grd;
        this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);

        this.nav_ctx.fillStyle = "#666699";
        this.nav_ctx.fillRect(0, 0, 300, 150);
        this.nav_ctx.clearRect(0, 0, this.navCanvasWidth, this.navCanvasHeight);

    },
    render: function () {
        var _this = this;
        this.canvasWidth = canvas.width;
        this.canvasHeight = canvas.height;
        this.navCanvasWidth = navCanvas.width;
        this.navCanvasHeight = 50;

//        function drawObject(object) {
//            if (!(object instanceof PATHBUBBLES.Scene) && !( object instanceof PATHBUBBLES.Object2D )) {
//                object.draw(_this.ctx);
//            }
//            if (!(object instanceof PATHBUBBLES.Groups)) {
//                for (var i = 0, l = object.children.length; i < l; i++) {
//                    drawObject(object.children[ i ]);
//                }
//            }
//        }

        if (!_this.valid) {
            _this.clear();
            viewpoint.draw(_this.nav_ctx, 1);
            if (scene.children.length > 0) {
                for (var i = scene.children.length - 1; i >= 0; i--) {
                  if(!scene.children[i].GROUP &&
										 scene.children[i] instanceof PATHBUBBLES.BubbleBase) {
                        scene.children[i].draw(_this.ctx, 1);
                        scene.children[i].draw(_this.nav_ctx, this.navCanvasHeight / this.canvasHeight);
                    }
                    else if(scene.children[i] instanceof PATHBUBBLES.Groups)
                    {
                        scene.children[i].draw(_this.ctx,_this.nav_ctx, this.navCanvasHeight / this.canvasHeight);
                    }
                }
            }
        }
        {   //Render bubbleLinks
            if($("#bgsvg").length==0)
            {
                var string='<div><svg id="bgsvg" width = "4000" height = "4000" style="position: absolute; margin: 0px; left: 0px; right: 0px; top: 50px; bottom: 0px; height: auto; width: auto; z-index: 0; display: block; visibility: visible;"></svg></div>';
                $("body").append(string);
            }
            $("#bgsvg").children(".bubbleLinks").remove();
            if(showLinks)
            {
                $("#bgsvg").show();
            }
            else
            {
                $("#bgsvg").hide();
            }
            for(var i=0; i<PATHBUBBLES.bubbleLinks.length; ++i)
            {
                var id=PATHBUBBLES.bubbleLinks[i].startId + "_" + PATHBUBBLES.bubbleLinks[i].endId;
                var transformString = d3.transform($("#svg"+PATHBUBBLES.bubbleLinks[i].startId).find(".graphGroup").attr("transform"));
                var transformCenter = d3.transform($("#svg"+PATHBUBBLES.bubbleLinks[i].startId).find(".mainSVG").attr("transform"));
                if( $("#svg"+PATHBUBBLES.bubbleLinks[i].startId).length==0||$("#svg"+PATHBUBBLES.bubbleLinks[i].endId).length ==0 )
                    continue;
                var startPos=$("#svg"+PATHBUBBLES.bubbleLinks[i].startId).position();
                var endPos=$("#svg"+PATHBUBBLES.bubbleLinks[i].endId).position();
                var bgsvg = d3.select("#bgsvg").append("g").attr("class", "bubbleLinks");
                var beginX = startPos.left + PATHBUBBLES.bubbleLinks[i].absolute.x*transformString.scale[0]+transformString.translate[0]+transformCenter.translate[0];
                var beginY = startPos.top-50+ PATHBUBBLES.bubbleLinks[i].absolute.y*transformString.scale[1]+transformString.translate[1]+transformCenter.translate[1];
                var poly = [
                    {"x": beginX,
                        "y": beginY},
                    {"x": beginX,
                        "y": beginY+5},
                    {"x": endPos.left, "y": endPos.top-50}
                ];

                bgsvg.selectAll("polygon")
                    .data([poly])
                    .enter().append("polygon").attr("class", id)
                    .attr("points", function (d) {
                        return d.map(function (d) {
                            return [d.x, d.y].join(",");
                        }).join(" ");
                    })
                    .attr("stroke", "grey")
                    .attr("fill", "grey")
                    .attr("stroke-width", 2)
                    .style("opacity", 0.5);
            }
        }
    }
};
