/**
 * @author      Yongnan
 * @version     1.0
 * @time        10/18/2014
 * @name        PathBubble_D3Table
 */

PATHBUBBLES.D3Table = function (parent, w, h) {
    this.parent = parent;
    this.w = w;
    this.h = h;
    this.data = null;
    this.dbId = null;
    this.keepQuery = true;
    this._symbols2Pathways = this.parent.crosstalking;
};

PATHBUBBLES.D3Table.prototype = {
    constructor: PATHBUBBLES.D3Table,
    init: function (dbId, querySymbol) {
        this.dbId = dbId;
        var _this = this;
        var margin = {top: 20, right: 3, bottom: 20, left: 3},
            width = this.w - margin.left - margin.right,
            height = this.h - margin.top - margin.bottom;

        d3.select("#svg" + this.parent.id)
            .attr("width", width)
            .attr("height", height);

        var container = d3.select("#svg" + this.parent.id)
            .attr("width", width )
            .attr("height",  height )
            .style("border", "2px solid #000")
            .style("overflow", "scroll");

        var table = container.append("table")
            .attr("width", width )
            .attr("height", height );

        table.append("thead");
        table.append("tbody");

        var previousSort = null;
        var format = d3.time.format("%a %b %d %Y");
        refreshTable(null);
        function refreshTable(sortOn){

            if (_this.data == null) {
                if (querySymbol !== null && querySymbol !== undefined) {
                    $.ajax({
                        url: "./php/querybyPathwayIdSymbol.php",
                        type: "GET",
                        data: {
                            pathwaydbId: dbId,
                            symbol: querySymbol
                        },
                        dataType: "json",
                        success: function (jsonData) {
                            operation(jsonData);
                        },
                        error: function () {
                        }
                    });
                }
                else {
                    $.ajax({
                        url: "./php/querybyPathwayId.php",
                        type: "GET",
                        data: {
                            pathwaydbId: dbId
                        },
                        dataType: "json",
                        success: function (jsonData) {
                            operation(jsonData);
                        },
                        error: function () {
                        }
                    });
                }
            }
            else {
                operation(_this.data);
            }
            function operation(jsonData) {

                _this.parent.h = Math.min(jsonData.length *12+100, 400);
                _this.h = Math.min(jsonData.length *12+100, 400);
                height = _this.h - margin.top - margin.bottom;

                d3.select("#svg" + _this.parent.id)
                    .attr("width", width )
                    .attr("height",  height );
                d3.select("#svg" + _this.parent.id).select("table")
                    .attr("width", width )
                    .attr("height",  height );
                var click = true;
                // create the table header
                var thead = d3.select("#svg" + _this.parent.id).select("thead").selectAll("th")
                    .data(d3.keys(jsonData[0]))
                    .enter().append("th")
                    .text(function (d) {
                        if(d=="ratio")
                            return "ratio(log2 based)";
                        return d;
                    })
                    .on("click", function(d,i){
                           click=!click;
                        if(click)
                        {
                            d3.select("#svg" + _this.parent.id).select("tbody").selectAll("tr").sort(function (a, b) {
                                return sort(a[d], b[d]);
                            });
                        }
                        else
                        {
                            d3.select("#svg" + _this.parent.id).select("tbody").selectAll("tr").sort(function (a, b) {
                                return sort(b[d], a[d]);
                            });
                        }

                    });

                // fill the table
                // create rows
                var tr = d3.select("#svg" + _this.parent.id).select("tbody").selectAll("tr").data(jsonData);
                tr.enter().append("tr");

                var maxCount = d3.max(jsonData,function(d){ return d.count});
                var maxCrossTalks = d3.max(jsonData,function(d){ return d.crossTalk});
                var maxRatio = d3.max(jsonData,function(d){ return parseFloat(d.ratio)});
                // create cells
                tr.on("click", function(d) {
                    d3.selectAll("tr").classed("highlight", false);
                    d3.select(this).classed("highlight", true);
                });
                var td = tr.selectAll("td").data(function (d) {
                      if(_this.keepQuery)
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
                var cellTd = td.enter().append("td");
                updateRect();

                cellTd.append("text").attr("class", function (d) {
                    if (d.key == "symbol")
                        return "hyper";
                    else  if(d.key == "crossTalk")
                        return "hyper";
                    else
                        return "normalCell";
                })
                    .text(function (d) {
                        return d.value;
                    })
                    .on("click",function(d,i){
                        if(d.key=="symbol")
                        {
                            if( $("#information").children('iframe').length==0)
                            {
                                var iframe = $('<iframe frameborder="0" marginwidth="0" marginheight="0" width="560px" height="500" ></iframe>');
                                iframe.attr({src: "http://www.ncbi.nlm.nih.gov/gquery/?term="+d.value});
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
                                $("#information").children("iframe").attr({src: "http://www.ncbi.nlm.nih.gov/gquery/?term="+d.value});
                            }

                            $("#information").dialog("open");
                            $("#information").on("contextmenu", function(e){
                                return false;
                            });
                        }
                        else if(d.key=="crossTalk")
                        {
                            if(d.value == 0)
                            {
                                alert("It does not have cross-talking pathways!");
                            }
                            else {

                                var index = _this._symbols2Pathways.symbols.indexOf(d.symbol);
                                if (index !== -1) {
                                    var pathways = _this._symbols2Pathways.pathwayNames[index];
                                    for(var i=0; i<pathways.length; ++i)
                                    {
                                        pathways[i] = $.trim(pathways[i]);
                                    }
                                    var currentId=_this.parent.name.split("_")[0];
                                    var currentBubble=null;
                                    for(var i=0; i<scene.children.length; ++i)
                                    {
                                        if(scene.children[i].id == currentId)
                                        {
                                            currentBubble = scene.children[i];
                                            break;
                                        }
                                    }
                                    if(!currentBubble)
                                        return;
                                    d3.select('#svg' + currentId).remove();
                                    var tmp = '';
                                    tmp += '<div id= svg' + currentId + ' style="position: absolute; width:' + (currentBubble.w + 5) + 'px; ' + 'height:' + (currentBubble.h + 5) + 'px; left:' +
                                        (currentBubble.x + currentBubble.w / 2 - (Math.min(currentBubble.w, currentBubble.h) - 30) / 2 - 10) + ' px; top:' +
                                        (currentBubble.y + currentBubble.h / 2 - (Math.min(currentBubble.w, currentBubble.h) - 30) / 2 + 50 - 15) + 'px; "> </div>';
                                    $("#bubble").append($(tmp));

                                    var defaultRadius = currentBubble.treeRing.defaultRadius;
                                    var name = currentBubble.treeRing.name;
                                    var file = currentBubble.treeRing.file;
                                    var customOrtholog = currentBubble.treeRing.customOrtholog;
                                    var selectedData = currentBubble.treeRing.selectedData;
                                    var showCrossTalkLevel = currentBubble.treeRing.showCrossTalkLevel;
                                    var ChangeLevel = currentBubble.treeRing.ChangeLevel;
                                    var customExpression = currentBubble.treeRing.customExpression;
                                    var expressionScaleMax = currentBubble.treeRing.expressionScaleMax;
//                                    var highLightPathways = currentBubble.treeRing.highLightPathways;
                                    var highLightPathways = pathways;
                                    var _crossTalkSymbols = currentBubble.treeRing._crossTalkSymbols;
                                    var _rateLimitSymbols = currentBubble.treeRing._rateLimitSymbols;
                                    var experiment_Type = currentBubble.experiment_Type;
//                                    highLightPathways = highLightPathways.concat(pathways);
                                    currentBubble.treeRing = null;
                                    currentBubble.treeRing = new PATHBUBBLES.D3Ring(currentBubble, Math.min(currentBubble.w, currentBubble.h) - 30, currentBubble.dataType, currentBubble.dataName);
                                    currentBubble.treeRing.defaultRadius = defaultRadius;
                                    currentBubble.treeRing.name = name;
                                    currentBubble.treeRing.file = file;
                                    currentBubble.treeRing.customOrtholog = customOrtholog;
                                    currentBubble.treeRing.customExpression = customExpression;
                                    currentBubble.treeRing.selectedData = selectedData;
                                    currentBubble.treeRing.showCrossTalkLevel = showCrossTalkLevel;
                                    currentBubble.treeRing.ChangeLevel = ChangeLevel;
                                    currentBubble.treeRing.expressionScaleMax = expressionScaleMax;
                                    currentBubble.treeRing._crossTalkSymbols = _crossTalkSymbols;
                                    currentBubble.treeRing._rateLimitSymbols = _rateLimitSymbols;
                                    currentBubble.treeRing.experiment_Type = experiment_Type;

                                    currentBubble.treeRing.highLightPathways = highLightPathways;
                                    currentBubble.treeRing.init();
                                }
                            }
                        }
                    })
                    .on("contextmenu", function (d, i) {
                        if (_this.keepQuery && d.key == "symbol")
                        {
                            if (d.value == String(d.value))
                            {
                                var bubble = new PATHBUBBLES.Table(_this.parent.x + _this.parent.offsetX + _this.parent.w - 40, _this.parent.y + _this.parent.offsetY, 530, 500, null, null, {dbId: _this.dbId, symbol: d.value});
                                bubble.name = _this.parent.name + "-" + d.value;
                                bubble.addHtml();
                                bubble.table.keepQuery = false;
                                bubble.menuOperation();

                                if (viewpoint) {
                                    bubble.offsetX = viewpoint.x;
                                    bubble.offsetY = viewpoint.y;
                                }
                                scene.addObject(bubble);
                                if (!_this.parent.GROUP) {
                                    var group = new PATHBUBBLES.Groups();
                                    group.objectAddToGroup(_this.parent);
                                    group.objectAddToGroup(bubble);
                                    scene.addObject(group);
                                }
                                else {
                                    if (_this.parent.parent instanceof  PATHBUBBLES.Groups) {
                                        _this.parent.parent.objectAddToGroup(_this.parent);
                                        _this.parent.parent.objectAddToGroup(bubble);
                                        scene.addObject(_this.parent.parent);
                                    }
                                }
                                d3.event.preventDefault();
                            }
                            d3.event.preventDefault();
                        }
//                        else if (_this.keepQuery && d.key == "crossTalk") {
//                            if(d.value == 0)
//                            {
//                                alert("It does not have cross-talking pathways!");
//                            }
//                            else
//                            {
//                                var index = _this._symbols2Pathways.symbols.indexOf(d.symbol);
//                                if(index!==-1)
//                                {
//                                    var pathways = _this._symbols2Pathways.pathwayNames[index];
//                                    var biPartiteData = [];
//                                    for(var i=0; i<pathways.length; ++i)
//                                    {
//                                        var da = [];
//                                        da.push(d.symbol);
//                                        da.push(pathways[i]);
//                                        biPartiteData.push(da);
//                                    }
//                                    if(biPartiteData.length>0)
//                                    {
//                                        var thisName = _this.parent.name + "-"+d.symbol + "-Crosstalking";
//                                        var bubble = new PATHBUBBLES.BiPartite(_this.parent.x + _this.parent.offsetX + _this.parent.w - 40, _this.parent.y + _this.parent.offsetY, 600,510,biPartiteData,thisName);
//                                        bubble.addHtml(["Symbol", "Pathway"]);
//
////                                        if(_this.parent.name.indexOf(")"))
////                                        {
////                                            bubble.name ="(Symbol crosstalking)"+_this.parent.name.split(")")[1];
////                                        }
//                                        bubble.menuOperation();
//                                        if(viewpoint)
//                                        {
//                                            bubble.offsetX = viewpoint.x;
//                                            bubble.offsetY = viewpoint.y;
//                                        }
//                                        scene.addObject(bubble);
//
//                                        if (!_this.parent.GROUP) {
//                                            var group = new PATHBUBBLES.Groups();
//                                            group.objectAddToGroup(_this.parent);
//                                            group.objectAddToGroup(bubble);
//                                            scene.addObject(group);
//                                        }
//                                        else {
//                                            if (_this.parent.parent instanceof  PATHBUBBLES.Groups) {
//                                                _this.parent.parent.objectAddToGroup(_this.parent);
//                                                _this.parent.parent.objectAddToGroup(bubble);
//                                                scene.addObject(_this.parent.parent);
//                                            }
//                                        }
//
//                                    }
//                                }
//                            }
//                            d3.event.preventDefault();
//                        }
                        else
                        {
                            d3.event.preventDefault();
                        }
                    });
                function updateRect(){

                    if(jsonData[0].hasOwnProperty("count"))
                    {
                        var maxCount = d3.max(jsonData,function(d){ return d.count});
                        if(maxCount>0)
                        {
                            cellTd.append("svg")
                                .attr("class", "cellCount")
                                .attr("width",
                                function(d) {
                                    if(d.key == "count")
                                        return d.value /maxCount * 20;
                                    else
                                        return 0;
                                })
                                .attr("height", 10)
                                .append("rect")
                                .attr("height", 10)
                                .attr("width",
                                function(d) {
                                    if(d.key == "count")
                                        return d.value /maxCount * 20;
                                    else
                                        return 0;
                                });
                        }
                    }
                    if(jsonData[0].hasOwnProperty("crossTalk"))
                    {
                        var maxCrossTalks = d3.max(jsonData,function(d){ return d.crossTalk});
                        if(maxCrossTalks>0)
                        {
                            cellTd.append("svg")
                                .attr("class", "cellCrossTalk")
                                .attr("width",
                                function(d) {
                                    if(d.key == "crossTalk")
                                        return d.value /maxCrossTalks * 20;
                                    else
                                        return 0;
                                })
                                .attr("height", 10)
                                .append("rect")
                                .attr("height", 10)
                                .attr("width",
                                function(d) {
                                    if(d.key == "crossTalk")
                                        return d.value /maxCrossTalks * 20;
                                    else
                                        return 0;
                                });
                        }
                    }
                    if(jsonData[0].hasOwnProperty("rateLimit"))
                    {

                        cellTd.append("svg")
                            .attr("class", "cellRateLimit")
                            .attr("width",
                            function(d) {
                                if(d.key == "rateLimit")
                                    return d.value ? 20:0;
                                else
                                    return 0;
                            })
                            .attr("height", 10)
                            .append("rect")
                            .attr("height", 10)
                            .attr("width",
                            function(d) {
                                if(d.key == "rateLimit")
                                    return d.value ? 20:0;
                                else
                                    return 0;
                            });
                    }
                    if(jsonData[0].hasOwnProperty("ratio"))
                    {
                        var maxRatio = d3.max(jsonData,function(d){ return parseFloat(d.ratio)});
                        var minRatio = d3.min(jsonData,function(d){ return parseFloat(d.ratio)});
                        if(maxRatio>0)
                        {
                            cellTd.append("svg")
                                .attr("class", "cellRatio")
                                .attr("width",
                                function(d) {
                                    if(d.key == "ratio")
                                    {
                                        if((maxRatio-minRatio)==0)
                                            return 0;
                                        return (parseFloat(d.value) -minRatio) /(maxRatio-minRatio ) * 20;
                                    }
                                    else
                                        return 0;
                                })
                                .attr("height", 10)
                                .append("rect")
                                .attr("height", 10)
                                .attr("width",
                                function(d) {
                                    if(d.key == "ratio")
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
            if(typeof a == "string"){
                if(typeof parseFloat(a) == "number" && typeof parseFloat(b) == "number" )
                {
                    if(!isNaN( parseFloat(a) ) && !isNaN (parseFloat(b) )  )
                        return parseFloat(a) > parseFloat(b) ? 1 : parseFloat(a) == parseFloat(b) ? 0 : -1;
                    else
                        return a.localeCompare(b);
                }
                else
                    return a.localeCompare(b);
            }
            else if(typeof a == "number"){
                return a > b ? 1 : a == b ? 0 : -1;
            }
            else if(typeof a == "boolean"){
                return b ? 1 : a ? -1 : 0;
            }
        }
    }
};