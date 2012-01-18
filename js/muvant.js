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

        // addArrow is 35x50px. removeArrow is 35x60px.
        var addCanvas = document.getElementById('addArrow'),
            removeCanvas = document.getElementById('removeArrow'),
            addCtx = addCanvas.getContext('2d'),
            removeCtx = removeCanvas.getContext('2d');

        addCtx.fillStyle = 'black';        
        addCtx.beginPath();
        addCtx.moveTo(30, 50);
        addCtx.lineWidth = 8;
        addCtx.quadraticCurveTo(20, 40, 15, 10);
        addCtx.moveTo(12, 5);
        addCtx.lineTo(25, 20);
        addCtx.moveTo(17, 5);
        addCtx.lineTo(5, 20);
        addCtx.stroke();

        removeCtx.fillStyle = 'black';        
        removeCtx.beginPath();
        removeCtx.moveTo(0, 5);
        removeCtx.lineWidth = 8;
        removeCtx.quadraticCurveTo(20, 0, 20, 47);
        removeCtx.moveTo(24, 55);
        removeCtx.lineTo(10, 40);
        removeCtx.moveTo(20, 55);
        removeCtx.lineTo(30, 40);
        removeCtx.stroke();

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


/**
 * MUVANT.Drag
 * Sets up and handles the drag and drop functionality.
 */
MUVANT.Drag = (function () {

    var me = {};
    
    /**
     * MUVANT.Drag.setupDraggable
     * Initializes the draggable and droppable jQuery UI functionality
     * on the musicFile elements and soundbox.
     */
    me.setupDraggable = function () {

      $('.musicFile').draggable({revert: 'invalid',
                                 snap: '#soundBox',
                                 snapMode: 'inner'});

      $('#soundBox').droppable({
        hoverClass: 'soundBoxHover',
        tolerance: 'touch',
  			drop: function(event, ui) {
    		  ui.draggable.addClass('musicFileAdded');
    		  me.updateDrag(ui.draggable);
    		},
    		out: function(event, ui) {
    		  ui.draggable.removeClass('musicFileAdded');
    		  // watchForExit checks if the element has the musicFileAdded class
    		  // when it is eventually dropped somewhere. Because the drop function
    		  // above appears to be called before the dragstop one, it handles the
    		  // case where you drag something out but re-add it to the soundBox.
    		  me.watchForExit(ui.draggable);
    		}
  		});

    };

    /**
     * MUVANT.Drag.watchForExit
     * Checks if the file ends up in the soundBox or not.  If not,
     * calls updateDrag on the element.
     */
    me.watchForExit = function (element) {

      element.on("dragstop", function(event, ui) {

        var dragElement = ui.helper;

        if (!dragElement.hasClass('musicFileAdded')) {
          me.updateDrag(dragElement);
        }

      });

    };

    /**
     * MUVANT.Drag.updateDrag
     * Updates the element's draggable and positioning based on whether
     * it's in the soundBox or not.
     */
    me.updateDrag = function (element) {

      if (element.hasClass('musicFileAdded')) {
        element.draggable('option', 'revert', false)
               .draggable('option', 'snap', false);
      } else {
        element.draggable('option', 'revert', 'invalid')
               .draggable('option', 'snap', '#soundBox')
               .draggable('option', 'snapMode', 'inner')
               .css('position', 'static')
               .css('top', 'auto')
               .css('left', 'auto')
               .css('position', 'relative');
      }

    };

    return me;

}());


$(function () {

  MUVANT.Drag.setupDraggable();
  MUVANT.Canvas.setup();

});

}());
