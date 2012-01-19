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
      
      // TODO(dbow): Decide where sounds come from and how many to load.
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

      var panelElement = $('#musicPanelTemplate').html(),
          convertedName = NOIZZZE.Init.convertNameToId(name),
          newElement = '<div class="musicFile" id="' + convertedName + '">' +
                        name + panelElement + '</div>';

      $(newElement).find('h2').text(name)
                   .parents('.musicFile')
                   .appendTo('#addBox');
      NOIZZZE.Canvas.createAudioIcons();
      NOIZZZE.Interaction.enableDrag();

    };

    /**
     * NOIZZZE.Audio.play
     * 
     */
    me.play = function(name) {

      var buffer = bufferObject[name],
          source,
          gainNode,
          convertedName = NOIZZZE.Init.convertNameToId(name),
          element = $('#' + convertedName),
          currentGain = element.find('.volumeControl').slider('value') / 100,
          currentDelay = element.find('.delayControl').slider('value'),
          currentWarp = element.find('.warpControl').slider('value');

      if (!sourceObject[name]) {
        source = context.createBufferSource();
        source.buffer = buffer;
        gainNode = context.createGainNode();
        gainObject[name] = gainNode;
        source.connect(gainNode);
        gainNode.connect(context.destination);
        gainNode.gain.value = currentGain;
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
     * NOIZZZE.Audio.showControls
     *
     */
    me.showControls = function(musicFileElement) {
      
      var musicPanel = musicFileElement.children('.musicFilePanel');
      
      if (musicPanel.hasClass('hidden')) {
        $('.musicFilePanel:visible').addClass('hidden');
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
      
      if (gainNode) {
        gainNode.gain.value = volume;
      }
            
    };

    /**
     * NOIZZZE.Audio.update
     * 
     */
    me.update = function (operation, element) {

      var convertedId = NOIZZZE.Init.convertIdToName(element.attr('id'));
      
      if (operation === 'add') {
        me.play(convertedId);
      } else {
        if (sourceObject[convertedId]) {
          me.stop(convertedId);
        }
      }

    };

    return me;

}());


/**
 * NOIZZZE.Canvas
 * Constructs the UI elements that use HTML5 Canvas.
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

    /**
     * NOIZZZE.Canvas.createAudioIcons
     *
     */
    me.createAudioIcons = function () {

      if (Modernizr.canvas) {

        var audioIcons = document.getElementsByClassName('volumeIcon'),
            iconLen = audioIcons.length,
            icon;

        for (var i=0; i < iconLen; i++) {
          icon = audioIcons[i].getContext('2d');  // 0 --> 20px (x)
                                                  // |
                                                  // 20px (y)
          icon.beginPath();
          icon.fillRect(0, 7, 4, 6);
          icon.lineWidth = 1;
          icon.moveTo(4, 7);
          icon.lineTo(9, 0);
          icon.lineTo(9, 20);
          icon.lineTo(4, 13);
          icon.stroke();
          icon.beginPath();
          icon.arc(0, 10, 13, me.convertRadians(345), me.convertRadians(20));
          icon.stroke();
          icon.beginPath();
          icon.arc(0, 10, 16, me.convertRadians(335), me.convertRadians(30));
          icon.stroke();
          icon.beginPath();
          icon.arc(0, 10, 19, me.convertRadians(325), me.convertRadians(40));
          icon.stroke();
        }

      } else {
        log('no canvas');
      }

    };

    /**
     * NOIZZZE.Canvas.convertRadians
     *
     */
    me.convertRadians = function (degrees) {

      var radians = (Math.PI/180) * degrees;

      return radians;

    };

    return me;

}());


/**
 * NOIZZZE.Interaction
 * Sets up and handles the drag and drop functionality.
 */
NOIZZZE.Interaction = (function () {

    var me = {};
    
    /**
     * NOIZZZE.Interaction.setup
     * 
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

    		  // removes any previous dragstop event handler in case user drags
    		  // object in and out multiple times before dropping.
    		  ui.draggable.off('dragstop');

    		  // watchForExit checks if the element has the musicFileAdded class
    		  // when it is eventually dropped somewhere. Because the drop function
    		  // above appears to be called before the dragstop one, it handles the
    		  // case where you drag something out but re-add it to the soundBox.
    		  me.watchForExit(ui.draggable);
    		}
  		});

    };

    /**
     * NOIZZZE.Interaction.watchForExit
     * Checks if the file ends up in the soundBox or not.  If not,
     * calls updateDrag on the element.
     */
    me.watchForExit = function (element) {

      element.on('dragstop', function(event, ui) {

        var dragElement = ui.helper;

        if (!dragElement.hasClass('musicFileAdded')) {
          me.updateDrag(dragElement);
        }
        
        element.off('dragstop');

      });

    };

    /**
     * NOIZZZE.Interaction.updateDrag
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
        me.resetSliders(element);
        element.find('.musicFilePanel').addClass('hidden');
        NOIZZZE.Audio.update('remove', element);
      }

    };

    /**
     * NOIZZZE.Interaction.enableDrag
     *
     */
    me.enableDrag = function () {

      var newElement = $('.musicFile:not(".ui-draggable")'),
          musicPanel = newElement.find('.musicFilePanel');

      newElement.draggable({revert: 'invalid',
                            snap: '#soundBox',
                            snapMode: 'inner'});
      
      me.setupSliders(musicPanel);

    };
    
    /**
     * NOIZZZE.Interaction.setupSliders
     *
     */
    me.setupSliders = function (musicPanel) {
      
      musicPanel.find('.volumeControl').slider({
        min: 0,
        max: 100,
        value: 50,
        slide: function (event, ui) {

          var newVolume = ui.value/100,
              musicFileId = $(ui.handle).parents('.musicFile').attr('id'),
              convertedId = NOIZZZE.Init.convertIdToName(musicFileId);

          NOIZZZE.Audio.adjustVolume(newVolume, convertedId);

        },
      });

      musicPanel.find('.delayControl').slider({
  			orientation: "vertical",
  			range: "min",
  			min: 0,
  			max: 100,
  			value: 0,
  			slide: function( event, ui ) {
  			  // TODO(dbow): Add delay handler.
  			  log(ui.value);
  			}
  		});

      musicPanel.find('.warpControl').slider({
        orientation: "vertical",
      	range: "min",
      	min: 0,
      	max: 100,
      	value: 0,
      	slide: function( event, ui ) {
      	  // TODO(dbow); Add warp handler.
      	  log(ui.value);
      	}
      });
      
    };
    
    /**
     * NOIZZZE.Interaction.resetSliders
     *
     */
    me.resetSliders = function (musicPanel) {
      
      musicPanel.find('.volumeControl').slider('option', 'value', 50);
      musicPanel.find('.delayControl').slider('option', 'value', 0);
      musicPanel.find('.warpControl').slider('option', 'value', 0);
      
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
      
      $(document).on('click', '.loopControlContainer', function (e) {
        log('clicked loop!');
        // TODO(dbow): Add loop handler.
        e.stopPropagation();
      });

      // Clicking anywhere on the page closes open musicFilePanels.
      $(document).on('click', function(e) {
        $('.musicFilePanel:visible').addClass('hidden');
      });
      // Except clicking on a musicFile or musicFilePanel.
      $(document).on('click', '.musicFile, .musicFilePanel', function(e) {
        e.stopPropagation();
      });
      
    };
    
    /**
     * NOIZZZE.Init.convertNameToId
     *
     */
    me.convertNameToId = function (name) {
      
      return name.replace('.', '--dot--');
      
    }

    /**
     * NOIZZZE.Init.convertIdToName
     *
     */
    me.convertIdToName = function (id) {
      
      return id.replace('--dot--', '.');
      
    }
    
    return me;

}());


$(function () {

  NOIZZZE.Interaction.setup();
  NOIZZZE.Canvas.setup();
  NOIZZZE.Audio.setup();
  NOIZZZE.Init.setup();

});

}());
