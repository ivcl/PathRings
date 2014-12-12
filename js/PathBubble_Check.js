/**
 * Created by Yongnan on 6/22/2014.
 * Part of code modified from https://github.com/xtk/X/blob/master/io/loader.js
 */

PATHBUBBLES.Check = function () {
    this.extensions = ["JSON", "XML"];
};
PATHBUBBLES.Check.prototype = {
    constructor: PATHBUBBLES.Check,
    checkFileFormat: function (filepath) {
        //get the file extension
        var extension = filepath.split('.').pop().toUpperCase();
        // support no extensions
        if (extension == filepath.toUpperCase()) {
            // this means no extension
            extension = '';
        }
        // check if the file format is supported
        if (this.extensions.indexOf(extension) === -1) {
            //throw new Error('The ' + extension + ' file format is not supported.');
            alert('The ' + extension + ' file format is not supported.');
            extension = '';
        }
        return extension;
    }
};

