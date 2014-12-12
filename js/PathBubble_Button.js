/**
 * @author      Yongnan
 * @version     1.0
 * @time        9/27/2014
 * @name        PathBubble_Button
 */
PATHBUBBLES.Button = function (parent) {
    this.parent = parent;
    this.x = this.parent.x + this.parent.w + 5;
    this.y = this.parent.y + 20;
    this.w = 200;
    this.h = 245;
};
PATHBUBBLES.Button.prototype = {
    constructor: PATHBUBBLES.Button,
    addButton: function (tmpHtml) {
//        this.menuBar.buttons.push(this);
        var $menuBarId = $('#' + this.parent.id);
        if ($menuBarId.length > 0) {
            $menuBarId.append($(tmpHtml));
        }
        else {
            var tmp = '';
            tmp += '<div id ="menuView' + this.parent.id +
                '" class = "menu" style="position: absolute; opacity:0.90; filter:alpha(opacity=40);background: lightgoldenrodyellow; border: 4px solid #666;z-index:1000; '
                + this.x + ' px; top: ' + this.y + ' px; width: '
                + this.w + ' px; height: ' + this.h + ' px; display: none; opacity: 1">';
//            tmp += '    <div id ="drag" class="paraheader" style="text-align: center;">';
//            tmp += "<span style='color: green; font-size: 20pt'> Menu</span>";
//            tmp += '    </div>';
            tmp += tmpHtml;
            tmp += '</div>';
            $("#bubble").append($(tmp));
        }
    },
    remove: function () {
        $('#menuView' + this.parent.id).remove();
    },
    show: function () {
        $('#menuView' + this.parent.id).show();
    },
    hide: function () {
        $('#menuView' + this.parent.id).hide();
    }
};