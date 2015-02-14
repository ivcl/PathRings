/**
 * @author      Yongnan
 * @version     1.0
 * @time        9/16/2014
 * @name        PathBubble_Bubble
 */

PATHBUBBLES.Bubble = function (x, y, w, h, strokeColor, fillColor, cornerRadius, text) {
	var tmp;
  PATHBUBBLES.BubbleBase.call(this, {
		type: 'Bubble',
		x: x, y: y, w: w, h: h,
		strokeColor: strokeColor, fillColor: fillColor,
		cornerRadius: cornerRadius,
		name: text,
		mainMenu: true, closeMenu: true, groupMenu: true});

  this.button = new PATHBUBBLES.Button(this);   //Button 0 for file selection
  tmp = '';
  tmp += '<input type="file" id=file style="position: absolute; left:' + this.x + ' px; top:' + this.y + 'px; ">';
  tmp += '<input type="button" id=load value= "Load" style="position: absolute; left:' + this.x + ' px; top:' + this.y + 25 + 'px; ">';
  tmp += '<div id=colorpickerField style="position: absolute; left:' + this.x + ' px; top: ' + this.y + 55 + ' px; "></div>';
	//    tmp += '<input type="button" id=ungroup value= "Ungroup" style="position: absolute; left:' + this.x + ' px; top:' + this.y + 80 + 'px; ">';
	//    tmp += '<input type="button" id=delete value= "Delete" style="position: absolute; left:' + this.x + ' px; top:' + this.y + 105 + 'px; ">';
  this.button.addButton(tmp);

  this.selected_file = null;
};

PATHBUBBLES.Bubble.prototype = $.extend(Object.create(PATHBUBBLES.BubbleBase.prototype), {
  constructor: PATHBUBBLES.Bubble,
  updateMenu: function () {
    var $menuBarbubble = $('#menuView' + this.id);
    $menuBarbubble.css({
      left: this.x + this.offsetX + this.w + 10,
      top: this.y + this.offsetY + this.cornerRadius / 2 + 40,
      width: 200,
      height: 215
    });
    $menuBarbubble.find('#file').css({
      left: 10,
      top: 45,
      width: 180
    });
    $menuBarbubble.find('#load').css({
      left: 10,
      top: 70,
      width: 180
    });
    $menuBarbubble.find('#colorpickerField').css({
      left: 10,
      top: 95,
      width: 180
    });
		//        $menuBarbubble.find('#ungroup').css({
		//            left: 10,
		//            top: 120,
		//            width: 180
		//        });
		//        $menuBarbubble.find('#delete').css({
		//            left: 10,
		//            top: 145,
		//            width: 180
		//        });
  },
  menuOperation: function () {
    var _this = this;
    var $menuBarbubble = $('#menuView' + this.id);
    $menuBarbubble.find('#load').on('click', function () {
      _this.selected_file = $menuBarbubble.find('#file').get(0).files[0];
      if (!_this.selected_file) {
        alert("Please select data file!");
      }
      else {
        var index = _this.children.indexOf(_this.bubbleView);
				if (-1 !== index) {_this.children.splice(index, 1);}
        _this.bubbleView = null;
        var localFileLoader = new PATHBUBBLES.LocalFileLoader(_this);

        localFileLoader.load(_this.selected_file);
        _this.name = localFileLoader.fileName;
      }
    });
    $menuBarbubble.find('#colorpickerField').ColorPicker({
      color: '#0000ff',
      onShow: function (colpkr) {
        $(colpkr).fadeIn(500);
        return false;
      },
      onHide: function (colpkr) {
        $(colpkr).fadeOut(500);
        return false;
      },
      onChange: function (hsb, hex, rgb) {
        $menuBarbubble.find('#colorpickerField').css('backgroundColor', '#' + hex);
      }
    });
  },
  detectEqual: function (object1, object2) {
    return (object1.x == object2.x + object2.w ||
            object1.x + object1.w == object2.x ||
            object1.y == object2.y + object2.h ||
            object1.h + object1.y == object2.y) ||
      (object2.x == object1.x + object1.w ||
       object2.x + object2.w == object1.x ||
       object2.y == object1.y + object1.h ||
       object2.h + object2.y == object1.y);
  }
});
