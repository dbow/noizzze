var MUVANT = {};

(function () {

/**
 * MUVANT.Canvas
 * Constructs the arrows in the UI using HTML5 Canvas.
 */
MUVANT.Canvas = (function () {

    var me = {};

    /**
     * MUVANT.Canvas.setup
     * Creates arrows in the two canvas tags.
     */
    me.setup = function () {
      
      if (Modernizr.canvas) {

        // removeArrow is 35x60px.  addArrow is 35x50px.
        var removeCanvas = document.getElementById('removeArrow'),
            addCanvas = document.getElementById('addArrow'),
            removeCtx = removeCanvas.getContext('2d'),
            addCtx = addCanvas.getContext('2d');

        removeCtx.fillStyle = "black";        
        removeCtx.beginPath();
        removeCtx.moveTo(35, 5);
        removeCtx.lineWidth = 8;
        removeCtx.quadraticCurveTo(15, 0, 15, 47);
        removeCtx.moveTo(11, 55);
        removeCtx.lineTo(25, 40);
        removeCtx.moveTo(15, 55);
        removeCtx.lineTo(5, 40);
        removeCtx.stroke();
        
        addCtx.fillStyle = "black";        
        addCtx.beginPath();
        addCtx.moveTo(30, 50);
        addCtx.lineWidth = 8;
        addCtx.quadraticCurveTo(20, 40, 15, 10);
        addCtx.moveTo(12, 5);
        addCtx.lineTo(25, 20);
        addCtx.moveTo(17, 5);
        addCtx.lineTo(5, 20);
        addCtx.stroke();
        
      } else {
        log('no canvas');
      }
      
    };
    

    /**
     * MUVANT.Canvas.convertRadians
     * Utility function to convert degrees to radians.
     * @param {number} degrees The degree value to convert to radians.
     * @return {number} radians The equivalent radians to the provided degrees.
     */
    me.convertRadians = function (degrees) {

      var radians = (Math.PI/180)*degrees;
      return radians;

    };

    return me;

}());


$(function () {

  MUVANT.Canvas.setup();

});

}());
