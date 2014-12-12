/**
 * @author      Yongnan
 * @version     1.0
 * @time        9/17/2014
 * @name        PathBubbles_text
 */
PATHBUBBLES.Text = function (object, text) {
    this.object = object;
    this.x = 0;
    this.y = 0;
    this.fillColor = '#0000ff';
    this.text = text;

    this.font = '20pt Calibri';
    this.textAlign = 'center';   //
    this.textBaseline = 'middle';   //bottom
};
PATHBUBBLES.Text.prototype = {
    constructor: PATHBUBBLES.Text,
    setFontSize: function (num) {
        this.font = num + 'pt Calibri';
    },
    draw: function (ctx, x, y) {
//        if(x==undefined)
//            x=this.x;
//        if(y==undefined)
//            y=this.y;
//        ctx.save();	// save the context so we don't mess up others
        ctx.font = this.font;
        // textAlign aligns text horizontally relative to placement
        ctx.textAlign = this.textAlign;
        // textBaseline aligns text vertically relative to font style
        ctx.textBaseline = this.textBaseline;
        ctx.fillStyle = this.fillColor;
        ctx.fillText(this.text, x, y);
//        ctx.restore();	// restore context to what it was on entry
    },
    drawWrapText: function (ctx,  x, y, maxWidth, lineHeight) {
        ctx.font = this.font;
        // textAlign aligns text horizontally relative to placement
        ctx.textAlign = this.textAlign;
        // textBaseline aligns text vertically relative to font style
        ctx.textBaseline = this.textBaseline;
        ctx.fillStyle = this.fillColor;
        var cars = this.text.split("\n");
        for (var ii = 0; ii < cars.length; ii++) {
            var line = "";
            var words = cars[ii].split(" ");
            for (var n = 0; n < words.length; n++) {
                var testLine = line + words[n] + " ";
                var metrics = ctx.measureText(testLine);
                var testWidth = metrics.width;
                if (testWidth > maxWidth) {
                    ctx.fillText(line, x, y);
                    line = words[n] + " ";
                    y += lineHeight;
                }
                else {
                    line = testLine;
                }
            }
            ctx.fillText(line, x, y);
            y += lineHeight;
        }
    },
    getTextHeight: function () {
        return 15;
    },
    getTextWidth: function (num, ctx) {
//        ctx.save();
        ctx.font = num + 'pt Calibri';
//        var width = ctx.measureText(this.text).width;
//        ctx.restore();
        return ctx.measureText(this.text).width;
    }
};
