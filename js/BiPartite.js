/**
 * @author      Yongnan
 * @version     1.0
 * @time        11/26/2014
 * @name        PathBubble_BiPartite
 */
PATHBUBBLES.BiPartite = function (x, y, w, h, data, name) {
	var tmp;
  PATHBUBBLES.BubbleBase.call(this, {
		type: 'BiPartite',
		mainMenu: true, closeMenu: true, groupMenu: true,
		html_elements: ['svg', 'menuView'],
		name: name || 'biPartite'
	});

  this.button = new PATHBUBBLES.Button(this);   //Button 0 for file selection
  tmp = '';
	//    tmp += '<input type="text" id=file style="position: absolute; left:' + this.x + ' px; top:' + this.y + 'px; ">';
	//    tmp += '<input type="button" id=export value= "Link TO WebGiVi" style="position: absolute; left:' + this.x + ' px; top:' + this.y + 25 + 'px; ">';
	//    tmp += '<div id=colorpickerField style="position: absolute; left:' + this.x + ' px; top: ' + this.y + 55 + ' px; "></div>';
  tmp += '<input type="button" id=saveFile value= "Save" style="position: absolute; left:' + this.x + ' px; top:' + this.y + 50 + 'px; ">';
	//    tmp += '<input type="button" id=delete value= "Delete" style="position: absolute; left:' + this.x + ' px; top:' + this.y + 105 + 'px; ">';
  this.button.addButton(tmp);

  this.data = data || null;
};

PATHBUBBLES.BiPartite.prototype = $.extend(Object.create(PATHBUBBLES.BubbleBase.prototype), {
  constructor: PATHBUBBLES.BiPartite,
  addHtml: function (header) {
    var _this=this;
    this.setOffset();
    var tmp = '';
    tmp += '<div id= svg' + this.id + ' style="position: absolute;"> </div>';
    $("#bubble").append($(tmp));
    this.biPartite = new PATHBUBBLES.D3BiPartite(this, this.w, this.h);
    if(header!==undefined)
      this.biPartite.header = header;
    this.biPartite.init();

  },
  menuOperation: function () {
    var _this = this;
    var $menuBarbubble = $('#menuView' + this.id);
    $menuBarbubble.find("#saveFile").on('click',function(){
      var currentData= _this.biPartite.data[0].data;
      var saveString = "";
      if(currentData.data!==undefined)
      {
        var tempData = currentData.data;
        var tempKey = currentData.keys;
        for(var i=0; i<tempData[0].length; ++i)
        {
          for(var j=0;j<tempData[0][i].length; ++j)
          {
            if(tempData[0][i][j] ==1)
            {
              saveString += tempKey[0][i];
              saveString += "\t";
              saveString += tempKey[1][j];
              saveString += "\n";
            }
          }
        }
        for(var i=0; i<tempData[1].length; ++i)
        {
          for(var j=0;j<tempData[1][i].length; ++j)
          {
            if(tempData[1][i][j] ==1)
            {
              saveString += tempKey[0][j];
              saveString += "\t";
              saveString += tempKey[1][i];
              saveString += "\n";
            }
          }
        }
				//                var blob = new Blob([saveString],{type:"text/plain;chartset=utf-8"});
				//                download(blob, "geneSymbol.txt", "text/plain");
        download(saveString, "geneSymbol.txt", "text/plain");
      }

    });
  },
  updateMenu: function () {
    var $menuBarbubble = $('#menuView' + this.id);
    $menuBarbubble.css({
      left: this.x + this.offsetX + this.w + 10,
      top: this.y + this.offsetY + this.cornerRadius / 2 + 40,
      width: 200,
      height: 215
    });
		//        $menuBarbubble.find('#export').css({
		//            left: 10,
		//            top: 25,
		//            width: 180
		//        });
    $menuBarbubble.find('#saveFile').css({
      left: 10,
      top: 25,
      width: 180
    });
  },
	drawSVG: function() {
	  var space = 6; // leave 6 space for tree ring
    $('#svg' + this.id).css({
      width: this.w - 15 - space,
      height: this.h - 20 - space,
      left: this.x + this.w / 2 - this.biPartite.w / 2 + 5 + space / 2,
      top: this.y  + 50 + 10 + space / 2 + 5
    });
	}
});
