/**
 * @author      Yongnan
 * @version     1.0
 * @time        11/26/2014
 * @name        PathBubble_D3BiPartite
 * @acknowledgment http://bl.ocks.org/NPashaP/9796212#biPartite.js
 */

PATHBUBBLES.D3BiPartite = function (parent, w, h) {
    this.parent = parent;
    this.w = w;
    this.h = h;
    this.data = null;
    this.header = ["Item", "Symbol"];
};

PATHBUBBLES.D3BiPartite.prototype = {
    constructor: PATHBUBBLES.D3BiPartite,
    init: function () {
        var _this = this;      // w 1100 h 610
        var b=30, bb=150, buffMargin=1, minHeight=12, fontSize=9;
        var c1=[-130, 40], c2=[-50, 120], c3=[-10, 160]; //Column positions of labels.
        var d3Colors = d3.scale.category20c();
        var bP=this;
        var datawa=  [
            ['Lite','CA'],
            ['Grand','WA'],
            ['Small','WV'],
            ['Medium','WV'],
            ['Grand','WV'],
            ['Elite','WV']
        ];
        if(_this.parent.data)
            datawa = _this.parent.data;
        var margin = {top: 40, right: 50, bottom: 0, left: 170},
            width = this.w - margin.left - margin.right,
            height = this.h - margin.top - margin.bottom;

        var container = d3.select("#svg" + _this.parent.id)
            .attr("width", width)
            .attr("height", Math.min(height,datawa.length *(minHeight+2) + margin.top + margin.bottom))
            .style("border", "2px solid #000")
            .style("overflow", "scroll");

        _this.data = [
            {data: this.partData(datawa), id: 'geneSymbols', header: _this.header}
        ];
        var maxLength_ = Math.max(_this.data[0].data.data[0].length, _this.data[0].data.data[1].length);
        var _needLength = (datawa.length) *(minHeight+2) + maxLength_ *2 * buffMargin + margin.top + margin.bottom;
        this.parent.h = Math.min(600, _needLength)+60;
        if(_needLength>100)
            _this.h = _needLength;
        else
            _this.h = _needLength;
        height = _this.h - margin.top - margin.bottom ;
        d3.select("#svg" + _this.parent.id)
            .attr("width", width )
            .attr("height",  height );
//         height = datawa.length * (minHeight+2) + 40;

        var svg = container.append('svg')
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g");
//            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");



        bP.partData = function(data){
            var sData={};

            sData.keys=[
                d3.set(data.map(function(d){ return d[0];})).values().sort(function(a,b){ return ( a<b? -1 : a>b ? 1 : 0);}),
                d3.set(data.map(function(d){ return d[1];})).values().sort(function(a,b){ return ( a<b? -1 : a>b ? 1 : 0);})
            ];

            sData.data = [	sData.keys[0].map( function(d){ return sData.keys[1].map( function(v){ return 0; }); }),
                sData.keys[1].map( function(d){ return sData.keys[0].map( function(v){ return 0; }); })
            ];

            data.forEach(function(d){
                sData.data[0][sData.keys[0].indexOf(d[0])][sData.keys[1].indexOf(d[1])]=1;
                sData.data[1][sData.keys[1].indexOf(d[1])][sData.keys[0].indexOf(d[0])]=1;
//            sData.data[0][sData.keys[0].indexOf(d[0])][sData.keys[1].indexOf(d[1])]=d[p];
//            sData.data[1][sData.keys[1].indexOf(d[1])][sData.keys[0].indexOf(d[0])]=d[p];
            });

            return sData;
        }

        function visualize(data){
            var vis ={};
            function calculatePosition(a, s, e, b, m){
                var total=d3.sum(a);
                var sum=0, neededHeight=0, leftoverHeight= e-s-2*b*a.length;
                var ret =[];

                a.forEach(
                    function(d){
                        var v={};
                        v.percent = (total == 0 ? 0 : d/total);
                        v.value=d;
                        v.height=Math.max(v.percent*(e-s-2*b*a.length), m);
                        (v.height==m ? leftoverHeight-=m : neededHeight+=v.height );
                        ret.push(v);
                    }
                );

                var scaleFact=leftoverHeight/Math.max(neededHeight,1), sum=0;

                ret.forEach(
                    function(d){
                        d.percent = scaleFact*d.percent;
                        d.height=(d.height==m? m : d.height*scaleFact);
                        d.middle=sum+b+d.height/2;
                        d.y=s + d.middle - d.percent*(e-s-2*b*a.length)/2;
                        d.h= d.percent*(e-s-2*b*a.length);
                        d.percent = (total == 0 ? 0 : d.value/total);
                        sum+=2*b+d.height;
                    }
                );
                return ret;
            }

            vis.mainBars = [
                calculatePosition( data.data[0].map(function(d){ return d3.sum(d);}), 0, height, buffMargin, minHeight),
                calculatePosition( data.data[1].map(function(d){ return d3.sum(d);}), 0, height, buffMargin, minHeight)
            ];

            vis.subBars = [[],[]];
            vis.mainBars.forEach(function(pos,p){
                pos.forEach(function(bar, i){
                    calculatePosition(data.data[p][i], bar.y, bar.y+bar.h, 0, 0).forEach(function(sBar,j){
                        sBar.key1=(p==0 ? i : j);
                        sBar.key2=(p==0 ? j : i);
                        vis.subBars[p].push(sBar);
                    });
                });
            });
            vis.subBars.forEach(function(sBar){
                sBar.sort(function(a,b){
                    return (a.key1 < b.key1 ? -1 : a.key1 > b.key1 ?
                        1 : a.key2 < b.key2 ? -1 : a.key2 > b.key2 ? 1: 0 )});
            });

            vis.edges = vis.subBars[0].map(function(p,i){
                return {
                    key1: p.key1,
                    key2: p.key2,
                    y1:p.y,
                    y2:vis.subBars[1][i].y,
                    h1:p.h,
                    h2:vis.subBars[1][i].h
                };
            });
            vis.keys=data.keys;
            return vis;
        }

        function arcTween(a) {
            var i = d3.interpolate(this._current, a);
            this._current = i(0);
            return function(t) {
                return edgePolygon(i(t));
            };
        }

        function drawPart(data, id, p){

            d3.select("#svg" + _this.parent.id).select("#"+id).append("g").attr("class","part"+p)
                .attr("transform","translate("+( p*(bb+b))+",0)");
            d3.select("#svg" + _this.parent.id).select("#"+id).select(".part"+p).append("g").attr("class","subbars");
            d3.select("#svg" + _this.parent.id).select("#"+id).select(".part"+p).append("g").attr("class","mainbars");

            var mainbar = d3.select("#svg" + _this.parent.id).select("#"+id).select(".part"+p).select(".mainbars")
                .selectAll(".mainbar").data(data.mainBars[p])
                .enter().append("g").attr("class","mainbar");

            mainbar.append("rect").attr("class","mainrect")
                .attr("x", 0).attr("y",function(d){ return d.middle-d.height/2; })
                .attr("width",b).attr("height",function(d){ return d.height; })
                .style("shape-rendering","auto")
                .style("fill-opacity",0).style("stroke-width","0.5")
                .style("stroke","black").style("stroke-opacity",0);

            mainbar.append("text").attr("class","barlabel hyper")
                .style("font-size",fontSize)
                .attr("x", c1[p]).attr("y",function(d){ return d.middle+5;})
                .text(function(d,i){ return trimLabel( data.keys[p][i] );})
                .attr("text-anchor","start" )
                .on("click", function(d,i) {
//                    $("#information").children('iframe').remove();
//                    var iframe = $('<iframe frameborder="0" marginwidth="0" marginheight="0" width="560px" height="500"></iframe>');
//                    iframe.attr({src: "http://www.ncbi.nlm.nih.gov/gquery/?term="+data.keys[p][i]});
//                    $("#information").append(iframe).dialog({
//                        autoOpen: false,
//                        modal: false,
//                        resizable: false,
//                        width: "auto",
//                        height: "auto",
//                        position: [(d3.event.pageX+10),d3.event.pageY-10],
//                        close: function () {
//                            iframe.attr("src", "");
//                        }
//                    });
                    if( $("#information").children('iframe').length==0)
                    {
                        var iframe = $('<iframe frameborder="0" marginwidth="0" marginheight="0" width="560px" height="500"></iframe>');
                        iframe.attr({src: "http://www.ncbi.nlm.nih.gov/gquery/?term="+data.keys[p][i]});
                        $("#information").append(iframe).dialog({
                            autoOpen: false,
                            modal: false,
                            resizable: false,
                            width: "auto",
                            height: "auto",
                            position: [(d3.event.pageX+10),d3.event.pageY-10],
                            close: function () {
                                iframe.attr("src", "http://www.ncbi.nlm.nih.gov/gquery");
                            }
                        });
                    }
                    else
                    {
                        $('#information').dialog('option', 'position', [(d3.event.pageX+10),d3.event.pageY-10]);
                        $("#information").children("iframe").attr({src: "http://www.ncbi.nlm.nih.gov/gquery/?term="+data.keys[p][i]});
                    }
                    $("#information").dialog("open");
                });

            mainbar.append("text").attr("class","barvalue").style("font-size",fontSize)
                .attr("x", c2[p]).attr("y",function(d){ return d.middle+5;})
                .text(function(d,i){ return d.value ;})
                .attr("text-anchor","end");

            mainbar
                .append("text").attr("class","barpercent").style("font-size",fontSize)
                .attr("x", c3[p]).attr("y",function(d){ return d.middle+5;})
                .text(function(d,i){ return "( "+Math.round(100*d.percent)+"%)" ;})
                .attr("text-anchor","end").style("fill","grey");

            d3.select("#svg" + _this.parent.id).select("#"+id).select(".part"+p).select(".subbars")
                .selectAll(".subbar").data(data.subBars[p]).enter()
                .append("rect").attr("class","subbar")
                .attr("x", 0).attr("y",function(d){ return d.y})
                .attr("width",b).attr("height",function(d){ return d.h})
//            .style("fill",function(d){ return colors[d.key1];});
                .style("fill",function(d){ return d3Colors(d.key1);});
        }

        function drawEdges(data, id){
            d3.select("#svg" + _this.parent.id).select("#"+id).append("g").attr("class","edges").attr("transform","translate("+ b+",0)");

            d3.select("#svg" + _this.parent.id).select("#"+id).select(".edges").selectAll(".edge")
                .data(data.edges).enter().append("polygon").attr("class","edge")
                .attr("points", edgePolygon).style("fill",function(d){ return d3Colors(d.key1);})
//            .attr("points", edgePolygon).style("fill",function(d){ return colors[d.key1];})
                .style("opacity",0.5).each(function(d) { this._current = d; });
        }

        function drawHeader(header, id){
//            d3.select("#svg" + _this.parent.id).select("#"+id).append("g").attr("class","header").append("text").text(header[2])
//                .style("font-size","20").attr("x",108).attr("y",-20).style("text-anchor","middle")
//                .style("font-weight","bold");

            [0,1].forEach(function(d){
                var h = d3.select("#svg" + _this.parent.id).select("#"+id).select(".part"+d).append("g").attr("class","header");

                h.append("text").text(header[d]).attr("x", (c1[d]-5)).style("font-size","14")
                    .attr("y", -15).style("fill","grey");

                h.append("text").text("Count").attr("x", (c2[d]-10)).style("font-size","14")
                    .attr("y", -15).style("fill","grey");

                h.append("line").attr("x1",c1[d]-10).attr("y1", -2)
                    .attr("x2",c3[d]+10).attr("y2", -2).style("stroke","black")
                    .style("stroke-width","1").style("shape-rendering","crispEdges");
            });
        }

        function edgePolygon(d){
            return [0, d.y1, bb, d.y2, bb, d.y2+d.h2, 0, d.y1+d.h1].join(" ");
        }

        function transitionPart(data, id, p){
            var mainbar = d3.select("#svg" + _this.parent.id).select("#"+id).select(".part"+p).select(".mainbars")
                .selectAll(".mainbar").data(data.mainBars[p]);

            mainbar.select(".mainrect").transition().duration(500)
                .attr("y",function(d){ return d.middle-d.height/2;})
                .attr("height",function(d){ return d.height;});

            mainbar.select(".barlabel").transition().duration(500)
                .attr("y",function(d){ return d.middle+5;});

            mainbar.select(".barvalue").transition().duration(500).style("font-size",fontSize)
                .attr("y",function(d){ return d.middle+5;}).text(function(d,i){ return d.value ;});

            mainbar.select(".barpercent").transition().duration(500)
                .attr("y",function(d){ return d.middle+5;}).style("font-size",fontSize)
                .text(function(d,i){ return "( "+Math.round(100*d.percent)+"%)" ;});

            d3.select("#svg" + _this.parent.id).select("#"+id).select(".part"+p).select(".subbars")
                .selectAll(".subbar").data(data.subBars[p])
                .transition().duration(500)
                .attr("y",function(d){ return d.y}).attr("height",function(d){ return d.h});
        }

        function transitionEdges(data, id){
            d3.select("#svg" + _this.parent.id).select("#"+id).append("g").attr("class","edges")
                .attr("transform","translate("+ b+",0)");

            d3.select("#svg" + _this.parent.id).select("#"+id).select(".edges").selectAll(".edge").data(data.edges)
                .transition().duration(500)
                .attrTween("points", arcTween)
                .style("opacity",function(d){ return (d.h1 ==0 || d.h2 == 0 ? 0 : 0.5);});
        }

        function transition(data, id){
            transitionPart(data, id, 0);
            transitionPart(data, id, 1);
            transitionEdges(data, id);
        }

        var menu = d3.select("body")
            .append("div")
            .attr("class", "biPartiteMenu")
            .style("fill", "#000")
            .style("position", "absolute")
            .style("z-index", "100")
            .html("<button " + "id=" +0+"_"+0 +">Delete</button>");

        bP.draw = function(data, svg){
            var _this =this;
//            var maxLength = Math.max(data[0].data.data[0].length, data[0].data.data[1].length);
//            height = Math.min(height, maxLength *minHeight + 40);
//            d3.select("#svg" + _this.parent.id)
//                .attr("width", width+ margin.left + margin.right)
//                .attr("height", height+ margin.top + margin.bottom);
//            d3.select("#svg" + _this.parent.id).select("svg")
//                .attr("width", width + margin.left + margin.right)
//                .attr("height", height + margin.top + margin.bottom);

            d3.select("#svg" + _this.parent.id).select("#main").remove();
            var mainSvg =svg.append("g").attr("id", "main").attr("transform","translate("+ margin.left+","+margin.top+")");
            data.forEach(function(biP){
                mainSvg.append("g")
                    .attr("id", biP.id);

                var visData = visualize(biP.data);
                drawPart(visData, biP.id, 0);
                drawPart(visData, biP.id, 1);
                drawEdges(visData, biP.id);
                drawHeader(biP.header, biP.id);

                [0,1].forEach(function(p){
                    d3.select("#svg" + _this.parent.id).select("#"+biP.id)
                        .select(".part"+p)
                        .select(".mainbars")
                        .selectAll(".mainbar")
                        .on("click",function(d, i){
                            if($(".biPartiteMenu").length)
                            {
                                $(".biPartiteMenu").css({
                                    opacity:0
                                }) ;
                            }
                            return bP.selectSegment(data, p, i);
                        })
                        .on("contextmenu",function(d, i){
                            menu
                                .style("top", (d3.event.pageY-10)+"px")
                                .style("left", (d3.event.pageX+10)+"px")
                                .style("opacity", 0.9)
//                                .html("<button id='"+ p+"_"+i +"'" + "onclick= 'myFunction(" + p+","+i + ")'"+">Delete</button>");
                                .html("<button id='"+ p+"_"+i +"'"+" class = 'itemDelete'>Delete</button>");
                            $(".itemDelete").on("click",
                                function(){
                                    var str = $(this).attr("id");
                                    var array = str.split("_");
                                    if(array.length!==2)
                                        return;
                                    var p = parseInt(array[0]);
                                    var i = parseInt(array[1]);
                                    _this.deleteItem(_this.data,p,i);
                                });
                            d3.event.preventDefault();
                        });
                });
            });
            mainSvg.on("dblclick", function(d,i){
                if($(".biPartiteMenu").length)
                {
                    $(".biPartiteMenu").css({
                        opacity:0
                    }) ;
                }
                bP.draw(data,svg);
            });
        }

        bP.selectSegment = function(data, m, s){
            data.forEach(function(k){
                var newdata =  {keys:[], data:[]};

                newdata.keys = k.data.keys.map( function(d){ return d;});

                newdata.data[m] = k.data.data[m].map( function(d){ return d;});

                newdata.data[1-m] = k.data.data[1-m]
                    .map( function(v){ return v.map(function(d, i){ return (s==i ? d : 0);}); });

                transition(visualize(newdata), k.id);

                var selectedBar = d3.select("#"+k.id).select(".part"+m).select(".mainbars")
                    .selectAll(".mainbar").filter(function(d,i){ return (i==s);});

                selectedBar.select(".mainrect").style("stroke-opacity",1);
                selectedBar.select(".barlabel").style('font-weight','bold');
                selectedBar.select(".barvalue").style('font-weight','bold');
                selectedBar.select(".barpercent").style('font-weight','bold');
            });
        }

        bP.deleteItem = function(data,p,i){
            var _this = this;
            data.forEach(function(k){
                k.data.keys[p].splice(i, 1);
                k.data.data[p].splice(i, 1);
                if(p==0)
                {
                    for(var tt=0; tt<k.data.data[1].length; ++tt)
                    {
                        k.data.data[1][tt].splice(i, 1);
                    }
                }
                else if(p==1)
                {
                    for(var tt=0; tt<k.data.data[0].length; ++tt)
                    {
                        k.data.data[0][tt].splice(i, 1);
                    }
                }
                $(".biPartiteMenu").css({
                    opacity:0
                }) ;

                _this.draw(data, d3.select("#svg" + _this.parent.id).select("svg"));

            });
        }

        bP.deSelectSegment = function(data, m, s){
            data.forEach(function(k){
                transition(visualize(k.data), k.id);

                var selectedBar = d3.select("#svg" + _this.parent.id).select("#"+k.id).select(".part"+m).select(".mainbars")
                    .selectAll(".mainbar").filter(function(d,i){ return (i==s);});

                selectedBar.select(".mainrect").style("stroke-opacity",0);
                selectedBar.select(".barlabel").style('font-weight','normal');
                selectedBar.select(".barvalue").style('font-weight','normal');
                selectedBar.select(".barpercent").style('font-weight','normal');
            });
        }

        function trimLabel(label) {
            if (label.length > 10) {
                return String(label).substr(0,10) + "...";
            }
            else {
                return label;
            }
        }

        _this.draw(_this.data,svg);

    },
    partData: function (data) {
        var sData = {};

        sData.keys = [
            d3.set(data.map(function (d) {
                return d[0];
            })).values().sort(function (a, b) {
                return ( a < b ? -1 : a > b ? 1 : 0);
            }),
            d3.set(data.map(function (d) {
                return d[1];
            })).values().sort(function (a, b) {
                return ( a < b ? -1 : a > b ? 1 : 0);
            })
        ];

        sData.data = [    sData.keys[0].map(function (d) {
            return sData.keys[1].map(function (v) {
                return 0;
            });
        }),
            sData.keys[1].map(function (d) {
                return sData.keys[0].map(function (v) {
                    return 0;
                });
            })
        ];

        data.forEach(function (d) {
            sData.data[0][sData.keys[0].indexOf(d[0])][sData.keys[1].indexOf(d[1])] = 1;
            sData.data[1][sData.keys[1].indexOf(d[1])][sData.keys[0].indexOf(d[0])] = 1;
        });

        return sData;
    }

};