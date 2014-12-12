/**
 * @author      Yongnan
 * @version     1.0
 * @time        11/5/2014
 * @name        WindowResize.js
 */
PATHBUBBLES.WindowResize = function(){
    var callback	= function(){
        viewpoint.h = 50;
        viewpoint.w = window.innerWidth / window.innerHeight * 50;
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        navCanvas.height = 50;
        navCanvas.width = window.innerWidth;
    };

    window.addEventListener('resize', callback, false);
    return {
        /**
         * Stop watching window resize
         */
        stop	: function(){
            window.removeEventListener('resize', callback);
        }
    };
};
