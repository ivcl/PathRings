/**
 * @author      Yongnan
 * @version     1.0
 * @time        10/16/2014
 * @name        PathBubble_SvgToCanvas
 * @acknowledgment Alex: http://pastebin.com/index/ksniHz8d
 */
// Can't figure out how to make lint see lib files, for now just fake
// define them to keep it quiet.
var $ = $ || {};
var d3 = d3 || {};
var $G = $G || {};

$G.canvas = {};
$G.path = {};

$G.Path = function (path_string) {
    var split, current_command, i, part, part_string, first;

    this.parts = [];

    split = path_string.split(/(?=[QqCcLlMm])|,/);
    current_command = undefined;
    i = 0;
    while (i < split.length) {
        part = {};
        part_string = split[i];

        first = part_string.charAt(0);
        if ($G.Path.prototype.commands.indexOf(first) != -1) {
            current_command = first;
            part_string = part_string.substring(1);
        }

        part.command = current_command;
        switch (current_command) {
            case 'C':
            case 'c':
                part.coords = {
                    x0: parseFloat(part_string),
                    y0: parseFloat(split[i + 1]),
                    x1: parseFloat(split[i + 2]),
                    y1: parseFloat(split[i + 3]),
                    x2: parseFloat(split[i + 4]),
                    y2: parseFloat(split[i + 5])};
                i = i + 6;
                break;
            case 'Q':
            case 'q':
                part.coords = {
                    x0: parseFloat(part_string),
                    y0: parseFloat(split[i + 1]),
                    x1: parseFloat(split[i + 2]),
                    y1: parseFloat(split[i + 3])};
                i = i + 4;
                break;
            case 'M':
            case 'm':
            case 'L':
            case 'l':
                part.coords = {
                    x: parseFloat(part_string),
                    y: parseFloat(split[i + 1])};
                i = i + 2;
                break;
        }
        this.parts.push(part);
    }
};

$G.Path.prototype.commands = ['C', 'c', 'Q', 'q', 'L', 'l', 'M', 'm'];

$G.Path.prototype.toString = function () {
    var sb = [];
    this.parts.forEach(function (part) {
        sb.push(part.command);
        switch (part.command) {
            case 'C':
            case 'c':
                sb.push(part.coords.x0.toString());
                sb.push(',');
                sb.push(part.coords.y0.toString());
                sb.push(',');
                sb.push(part.coords.x1.toString());
                sb.push(',');
                sb.push(part.coords.y1.toString());
                sb.push(',');
                sb.push(part.coords.x2.toString());
                sb.push(',');
                sb.push(part.coords.y2.toString());
                sb.push(',');
                break;
            case 'Q':
            case 'q':
                sb.push(part.coords.x0.toString());
                sb.push(',');
                sb.push(part.coords.y0.toString());
                sb.push(',');
                sb.push(part.coords.x1.toString());
                sb.push(',');
                sb.push(part.coords.y1.toString());
                sb.push(',');
                break;
            case 'M':
            case 'm':
            case 'L':
            case 'l':
                sb.push(part.coords.x.toString());
                sb.push(',');
                sb.push(part.coords.y.toString());
                sb.push(',');
                break;
        }
    });
    sb.pop();
    return sb.join('');
};

$G.Path.prototype.append = function (other) {
    var path = this;
    var first = true;
    other.parts.forEach(function (part) {
        if (first && part.command == 'M') {
            path.parts.push({
                command: 'L',
                coords: {x: part.coords.x, y: part.coords.y}});
        }
        else {
            path.parts.push(part);
        }
        first = false;
    });
};

// Add control point duplicates in the center until we are the right length.
// XXX very hacky.
$G.Path.prototype.lengthenTo = function (length) {
    var i, before, x, y;
    while (this.parts.length < length) {
        i = Math.ceil(0.01 + this.parts.length / 2),
            before = this.parts[i];
        x = before.coords.x2;
        y = before.coords.y2;
        this.parts.splice(i + 1, 0, {
            command: 'C',
            coords: {x0: x, y0: y, x1: x, y1: y, x2: x, y2: y}});
    }
};

$G.Path.prototype.draw = function (context) {
    var x = context.last_x || 0,
        y = context.last_y || 0;

    this.parts.forEach(function (part) {
        var x0, y0, x1, y1;
        switch (part.command) {
            case 'M':
                x = part.coords.x;
                y = part.coords.y;
                context.moveTo(x, y);
                break;
            case 'm':
                x += part.coords.x;
                y += part.coords.y;
                context.moveTo(x, y);
                break;
            case 'L':
                x = part.coords.x;
                y = part.coords.y;
                context.lineTo(x, y);
                break;
            case 'l':
                x += part.coords.x;
                y += part.coords.y;
                context.lineTo(x, y);
                break;
            case 'Q':
                x = part.coords.x1;
                y = part.coords.y1;
                context.quadraticCurveTo(
                    part.coords.x0, part.coords.y0,
                    x, y);
                break;
            case 'q':
                x0 = x + part.coords.x0;
                y0 = y + part.coords.y0;
                x = x0 + part.coords.x1;
                y = y0 + part.coords.y1;
                context.quadraticCurveTo(x0, y0, x, y);
                break;
            case 'C':
                x = part.coords.x2;
                y = part.coords.y2;
                context.bezierCurveTo(
                    part.coords.x0, part.coords.y0,
                    part.coords.x1, part.coords.y1,
                    x, y);
                break;
            case 'c':
                x0 = x + part.coords.x0;
                y0 = y + part.coords.y0;
                x1 = x0 + part.coords.x1;
                y1 = y0 + part.coords.y1;
                x = x1 + part.coords.x2;
                y = y1 + part.coords.y2;
                context.bezierCurveTo(x0, y0, x1, y1, x, y);
                break;
        }
    });

    context.last_x = x;
    context.last_y = y;
};

$G.canvas.do_path = function (context, path) {
    var parts = path.split(/(?=[CLM])|,/),
        command,
        first,
        x, y, x2, y2, x3, y3, lx, ly,
        i = 0;
    lx = 0;
    ly = 0;
    while (i < parts.length) {
        first = parts[i].charAt(0);
        x = parts[i];
        switch (first) {
            case 'C':
            case 'L':
            case 'M':
            {
                command = first;
                x = x.substring(1);
            }
        }

        x = parseFloat(x);
        y = parseFloat(parts[i + 1]);

        switch (command) {
            case 'C':
            {
                x2 = parseFloat(parts[i + 2]);
                y2 = parseFloat(parts[i + 3]);
                x3 = parseFloat(parts[i + 4]);
                y3 = parseFloat(parts[i + 5]);
                i = i + 4;
                context.bezierCurveTo(x, y, x2, y2, x3, y3);
                lx = x3;
                ly = y3;
                break;
            }
            case 'M':
            {
                context.moveTo(x, y);
                command = 'L';
                break;
            }
            case 'm':
                context.moveTo(x + lx, y + ly);
                break;
            case 'L':
            {
                context.lineTo(x, y);
                break;
            }
        }

        lx = x;
        ly = y;
        i = i + 2;
    }
};
