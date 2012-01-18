var MUVANT = {};

(function () {


/**
 * MUVANT.Audio
 * 
 */
MUVANT.Audio = (function () {

    var me = {},
        context,
        soundArray,
        soundArray = ['crickets.mp3',
                      'airplane.mp3',
                      'elementary_school.mp3',
                      'chill_song.mp3'],
        soundLen = soundArray.length,
        bufferObject = {},
        sourceObject = {};

    /**
     * MUVANT.Audio.setup
     * 
     */
    me.setup = function () {
      
      try {
        context = new webkitAudioContext();
      }
      catch(e) {
        // TODO(dbow): better error handling as this is real browser specific.
        alert('Web Audio API is not supported in this browser');
        return;
      }
      
      // TODO(dbow): After testing complete, update with real functionality.
      for (var i=0; i < soundLen; i++) {
        me.loadSound(soundArray[i], context);
      }

    };
    
    me.loadSound = function (soundUrl, context) {

      var request = new XMLHttpRequest();

      request.open('GET', soundUrl, true);
      request.responseType = 'arraybuffer';
      // Decode asynchronously
      request.onload = function() {
        context.decodeAudioData(request.response, function(buffer) {
          me.handleBuffer(buffer, soundUrl);
          }, function(e) {
            log(e);
        });
      }
      request.send();

    };
    
    me.handleBuffer = function (buffer, name) {

      var newElement = '<div class="musicFile">' + name + '</div>';

      bufferObject[name] = buffer;
      $('#addBox').append(newElement);
      MUVANT.Drag.enableDrag();

    };
    
    me.play = function(name) {

      var buffer = bufferObject[name],
          source = context.createBufferSource(); // creates a sound source

      source.buffer = buffer;                    // tell the source which sound to play
      source.connect(context.destination);       // connect the source to the context's destination (the speakers)
      source.noteOn(0);                          // play the source now
      sourceObject[name] = source;

    };
    
    me.stop = function(name) {
      
      var source = sourceObject[name];
      source.noteOff(0);
      
    };
    
    me.update = function (operation, element) {
      if (operation === 'add') {
        me.play(element.text());
      } else {
        me.stop(element.text());
      }
    };

    return me;

}());


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
    me.setup = function () {

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

      element.on('dragstop', function(event, ui) {

        var dragElement = ui.helper;

        if (!dragElement.hasClass('musicFileAdded')) {
          me.updateDrag(dragElement);
          element.off('dragstop');
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
        MUVANT.Audio.update('add', element);
      } else {
        element.draggable('option', 'revert', 'invalid')
               .draggable('option', 'snap', '#soundBox')
               .draggable('option', 'snapMode', 'inner')
               .css('position', 'static')
               .css('top', 'auto')
               .css('left', 'auto')
               .css('position', 'relative');
        MUVANT.Audio.update('remove', element);
      }

    };
    
    /**
     *
     *
     */
    me.enableDrag = function () {

      $('.musicFile:not(".ui-draggable")').draggable({revert: 'invalid',
                                                      snap: '#soundBox',
                                                      snapMode: 'inner'});

    };

    return me;

}());


$(function () {

  MUVANT.Drag.setup();
  MUVANT.Canvas.setup();
  MUVANT.Audio.setup();

});

}());
