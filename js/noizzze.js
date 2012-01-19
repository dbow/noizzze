var NOIZZZE = {};

(function () {


/**
 * NOIZZZE.Audio
 * 
 */
NOIZZZE.Audio = (function () {

    var me = {},
        context,
        soundArray,
        soundArray = ['crickets.mp3',
                      'airplane.mp3',
                      'elementary_school.mp3',
                      'chill_song.mp3'],
        soundLen = soundArray.length,
        bufferObject = {},
        gainObject = {},
        warpObject = {},
        sourceObject = {};

    /**
     * NOIZZZE.Audio.setup
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

    /**
     * NOIZZZE.Audio.loadSound
     * 
     */
    me.loadSound = function (soundUrl, context) {

      var request = new XMLHttpRequest();

      request.open('GET', soundUrl, true);
      request.responseType = 'arraybuffer';

      // Decode asynchronously
      request.onload = function() {
        context.decodeAudioData(request.response, function(buffer) {
          bufferObject[soundUrl] = buffer;
          me.handleBuffer(buffer, soundUrl);
          }, function(e) {
            log(e);
        });
      }
      request.send();

    };

    /**
     * NOIZZZE.Audio.handleBuffer
     * 
     */
    me.handleBuffer = function (buffer, name) {

      var panelElement = '<div class="musicFilePanel hidden">' + 
                           '<h2>' + name + '</h2>' +
                           '<div class="controls1">' +
                             '<div class="loopControl"><input type="checkbox" />&nbsp;loop</div>' + 
                             '<div class="volumeControl"></div>' +
                           '</div>' +
                           '<div class="controls2">' +
                             '<div class="delayControl"></div>' +
                             '<div class="warpControl"></div>' +
                          '</div>' +
                        '</div>',
          newElement = '<div class="musicFile" id="' + name + '">' +
                       name + panelElement + '</div>';


      $('#addBox').append(newElement);
      NOIZZZE.Drag.enableDrag();

    };

    /**
     * NOIZZZE.Audio.play
     * 
     */
    me.play = function(name) {

      var buffer = bufferObject[name],
          source,
          gainNode;

      log(name);
      log(sourceObject);
      if (!sourceObject[name]) {
        source = context.createBufferSource();
        source.buffer = buffer;
        gainNode = context.createGainNode();
        gainObject[name] = gainNode;
        source.connect(gainNode);
        gainNode.connect(context.destination);
        source.noteOn(0);
        sourceObject[name] = source;
      }

    };

    /**
     * NOIZZZE.Audio.stop
     * 
     */
    me.stop = function(name) {
      
      var source = sourceObject[name];
      source.noteOff(0);
      sourceObject[name] = undefined;
      
    };
    
    /**
     *
     *
     */
    me.showControls = function(musicFileElement) {
      
      var musicPanel = musicFileElement.children('.musicFilePanel');
      
      if (musicPanel.hasClass('hidden')) {
        musicPanel.removeClass('hidden');
      } else {
        musicPanel.addClass('hidden');
      }

    };
    
    /**
     * NOIZZZE.Audio.adjustVolume
     *
     */
    me.adjustVolume = function(volume, name) {
      
      var gainNode = gainObject[name];
      
      gainNode.gain.value = volume;
      
    }

    /**
     * NOIZZZE.Audio.update
     * 
     */
    me.update = function (operation, element) {

      if (operation === 'add') {
        me.play(element.attr('id'));
      } else {
        me.stop(element.attr('id'));
      }

    };

    return me;

}());


/**
 * NOIZZZE.Canvas
 * Constructs the arrows in the UI using HTML5 Canvas.
 */
NOIZZZE.Canvas = (function () {

    var me = {};

    /**
     * NOIZZZE.Canvas.setup
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
 * NOIZZZE.Drag
 * Sets up and handles the drag and drop functionality.
 */
NOIZZZE.Drag = (function () {

    var me = {};
    
    /**
     * NOIZZZE.Drag.setupDraggable
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
     * NOIZZZE.Drag.watchForExit
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
     * NOIZZZE.Drag.updateDrag
     * Updates the element's draggable and positioning based on whether
     * it's in the soundBox or not.
     */
    me.updateDrag = function (element) {

      if (element.hasClass('musicFileAdded')) {
        element.draggable('option', 'revert', false)
               .draggable('option', 'snap', false);
        NOIZZZE.Audio.update('add', element);
      } else {
        element.draggable('option', 'revert', 'invalid')
               .draggable('option', 'snap', '#soundBox')
               .draggable('option', 'snapMode', 'inner')
               .css('position', 'static')
               .css('top', 'auto')
               .css('left', 'auto')
               .css('position', 'relative');
        NOIZZZE.Audio.update('remove', element);
      }

    };
    
    /**
     *
     *
     */
    me.enableDrag = function () {

      var newElement = $('.musicFile:not(".ui-draggable")'),
          musicPanel = newElement.find('.musicFilePanel');

      newElement.draggable({revert: 'invalid',
                            snap: '#soundBox',
                            snapMode: 'inner'});
      
      musicPanel.find('.volumeControl').slider({
        min: 0,
        max: 100,
        value: 50,
        slide: function (event, ui) { },
      });
      musicPanel.find('.delayControl').slider({
  			orientation: "vertical",
  			range: "min",
  			min: 0,
  			max: 100,
  			value: 0,
  			slide: function( event, ui ) { }
  		});
  		musicPanel.find('.warpControl').slider({
  			orientation: "vertical",
  			range: "min",
  			min: 0,
  			max: 100,
  			value: 0,
  			slide: function( event, ui ) { }
  		});

    };

    return me;

}());


/**
 * NOIZZZE.Init
 *
 */
NOIZZZE.Init = (function () {

    var me = {};
    
    /**
     * NOIZZZE.Init.setup
     * 
     *
     */
    me.setup = function () {
      
      $(document).on('click', '.musicFile', function(e) {
        NOIZZZE.Audio.showControls($(this));
      });
      
    };
    
    return me;

}());


$(function () {

  NOIZZZE.Drag.setup();
  NOIZZZE.Canvas.setup();
  NOIZZZE.Audio.setup();
  NOIZZZE.Init.setup();

});

}());
