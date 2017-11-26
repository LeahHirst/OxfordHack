var DEBUG = false;

function Scd(videoEl, options, callback) {
  // Detect support for video element.
  if (!document.createElement('video').canPlayType) {
    throw Error('Native video element not supported');
  }

  // Check that videoEl is an HTML video element.
  if (!videoEl || videoEl.constructor.toString().indexOf('HTMLVideoElement') < 0) {
    throw Error('Input element is not a video element.');
  } else {
    videoEl = /** @type {HTMLVideoElement} */ (videoEl);
  }

  var MAX_DIFF_100 = 4.4167; // Math.sqrt(255 * 255 * 3) / 100;

  var width = 0;
  var height = 0;

  var controls = videoEl.controls;

  var currentTime = 0;
  var lastCurrentTime = 0;

  var createCanvas = function() {
    return /** @type {HTMLCanvasElement} */ (document.createElement('canvas'));
  };

  var canvasA = createCanvas();
  var canvasB = createCanvas();
  var canvasC = createCanvas();

  var ctxA = canvasA.getContext('2d');
  var ctxB = canvasB.getContext('2d');
  var ctxC = canvasC.getContext('2d');

  var stop = false;

  var canvasContextImageDataLength;

  var debugContainer;

  var _start;

  var getMedian;

  var sceneTimecodes = [];

  var opts = {
    mode: 'FastForwardMode',
    step: 0,
    step_width: 50,
    step_height: 50,
    minSceneDuration: 0.25,
    //threshold: 110.4182, // 25 * Math.sqrt(255 * 255 * 3) / 100,
    threshold: 70,
    debug: false
  };

  // HTMLVideoElement.HAVE_FUTURE_DATA = 3
  if (videoEl.readyState < 3) {
    // We don't have enough data, so we'll initialize values when available.
    // durationchange appears to be the first event triggered by video that exposes width and height.
    videoEl.addEventListener('durationchange', init, false);
  } else {
    // The metadata is already loaded.
    init();
  }

  function init() {
    for (var k in options) {
      switch (k) {
        case 'mode':
          opts.mode = '' + options[k];
          break;
        case 'step':
          opts.step = +/** @type {number} */ (options[k]);
          break;
        case 'step_width':
          opts.step_width = +/** @type {number} */ (options[k]);
          break;
        case 'step_height':
          opts.step_height = +/** @type {number} */ (options[k]);
          break;
        case 'minSceneDuration':
          opts.minSceneDuration = +/** @type {number} */ (options[k]);
          break;
        case 'threshold':
          // opts.threshold is set between 0 and MAX_DIFF_100 interval to save on computation later.
          opts.threshold = +/** @type {number} */ (options[k]) * MAX_DIFF_100;
          break;
        case 'debug':
          if (DEBUG)
            opts.debug = !!options[k];
          break;
      }
    }

    if (opts.step != 0) {
      opts.step_width = opts.step_height = opts.step;
    }

    // First we set default values to video tag size.
    // Values are annotated as strings to keep Closure Compiler happy.
    if (!videoEl.width) {
      videoEl.width = /** @type {string} */ videoEl.videoWidth;
    }
    if (!videoEl.height) {
      videoEl.height = /** @type {string} */ videoEl.videoHeight;
    }

    // Then, we calculate apparent video size to avoid passing out of bound values to canvas.drawImage().
    if (videoEl.videoWidth / videoEl.videoHeight > videoEl.width / videoEl.height) {
      width = /** @type {number} */ videoEl.width;
      height = videoEl.videoHeight / videoEl.videoWidth * videoEl.width;
    } else {
      width = videoEl.videoWidth / videoEl.videoHeight * videoEl.height;
      height = /** @type {number} */ videoEl.height;
    }

    canvasA.width = canvasB.width = opts.step_width;
    canvasA.height = canvasB.height = opts.step_height;

    // The number of pixels of resized frames. Used to speed up average calculation.
    var _step_sq = opts.step_width * opts.step_height;

    canvasContextImageDataLength = _step_sq * 4;

    debugContainer = document.getElementById('__scd-debug');
    if (DEBUG && opts.debug && !debugContainer) {
      debugContainer = document.createElement('div');
      debugContainer.id = '__scd-debug';
      (document.body || document.getElementsByTagName('body')[0]).appendChild(debugContainer);
    }

    // Launch the scene detection process differently depending on the mode.
    _start = function() {
      // Playback mode.
      if (stop) {
        return;
      }

      // Remove controls from video during process.
      videoEl.controls = false;

      // Play from current time to allow enable/disabling mid video
      // videoEl.currentTime = 0;
      videoEl.addEventListener('timeupdate', playbackModeEvent, false);
      videoEl.addEventListener('ended', videoEndedEvent, false);

      videoEl.play();
    };

    getMedian = new Function('a', 'a.sort(function(a,b){return a-b});' +
        ((_step_sq % 2) ?
        'return a[' + ((_step_sq / 2) - 0.5) + ']' :
        'return(a[' + ((_step_sq / 2) - 1) + ']+a[' + (_step_sq / 2) + '])/2')
        );

    videoEl.removeEventListener('durationchange', init, false);
  }

  function fastForwardModeEvent() {
    // @fixme: Bug on Opera. duration is not always defined.
    if (videoEl.ended || currentTime > videoEl.duration) {
      videoEndedEvent();
      return;
    }

    detectSceneChange();

    currentTime += opts.minSceneDuration;
    this.currentTime = currentTime;
  }

  function playbackModeEvent() {
    if (this.currentTime - lastCurrentTime >= opts.minSceneDuration) {
      currentTime = this.currentTime;
      detectSceneChange();

      lastCurrentTime = this.currentTime;
    }
  }

  function detectSceneChange() {
    ctxA.drawImage(videoEl, 0, 0, width, height, 0, 0, opts.step_width, opts.step_height);
    var diff = computeDifferences(ctxA, ctxB);

    if (diff > opts.threshold) {
      // Trigger a `scenechange` event.
      var _sceneChangeEvent = document.createEvent('Event');
      _sceneChangeEvent.initEvent('scenechange', true, true);
      videoEl.dispatchEvent(_sceneChangeEvent);

      sceneTimecodes.push(currentTime);
      if (DEBUG && opts.debug) {
        var /** @type {Element} */ tmpContainer = document.createElement('div'),
            /** @type {HTMLCanvasElement} */ tmpCanvasA = createCanvas();
        tmpCanvasA.width = width / 2;
        tmpCanvasA.height = height / 2;
        tmpCanvasA.getContext('2d').drawImage(videoEl, 0, 0, videoEl.videoWidth, videoEl.videoHeight, 0, 0, width / 2, height / 2);
        tmpContainer.appendChild(document.createTextNode(formatTime(currentTime)));
        tmpContainer.appendChild(document.createElement('br'));
        tmpContainer.appendChild(tmpCanvasA);
        tmpContainer.appendChild(document.createElement('br'));
        tmpContainer.appendChild(document.createTextNode('med: ' + Math.round(diff / MAX_DIFF_100) + '%'));
        debugContainer.appendChild(tmpContainer);
      }
    }

    ctxB.drawImage(canvasA, 0, 0, opts.step_width, opts.step_height, 0, 0, opts.step_width, opts.step_height);
  }

  function getFrameBlob(callback) {
    canvasC.width = 300;
    canvasC.height = 168;
    ctxC.drawImage(videoEl, 0, 0, width, height, 0, 0, 300, 168);
    return canvasC.toBlob(callback);
  }

  function computeDifferences(ctxA, ctxB) {
    var /** @type {Array.<number>} */ diff = [],
        /** @type {Array.<number>} */ colorsA = ctxA.getImageData(0, 0, opts.step_width, opts.step_height).data,
        /** @type {Array.<number>} */ colorsB = ctxB.getImageData(0, 0, opts.step_width, opts.step_height).data,
        /** @type {number} */ i = 0;

    for (; i < canvasContextImageDataLength; i = i + 4) {
      diff.push(getColorDistance(colorsA[i], colorsA[i + 1], colorsA[i + 2], colorsB[i], colorsB[i + 1], colorsB[i + 2]));
    }

    return getMedian(diff);
  }

  function getColorDistance(RA, GA, BA, RB, GB, BB) {
    //return Math.sqrt(Math.pow(RA - RB, 2) + Math.pow(GA - GB, 2) + Math.pow(BA - BB, 2));
    return Math.sqrt((RA - RB) * (RA - RB) + (GA - GB) * (GA - GB) + (BA - BB) * (BA - BB));
  }

  function videoEndedEvent() {
    if (callback) {
      callback(sceneTimecodes);
    }
    _stop();
  }

  function pause() {
    if (stop) {
      return;
    }

    if (opts.mode === 'FastForwardMode') {
      // Restore video element controls to its original state.
      videoEl.controls = controls;
      videoEl.removeEventListener('seeked', fastForwardModeEvent, false);
    }
    videoEl.pause();
  }

  function _stop() {
    pause();

    // Remove event listeners.
    if (opts.mode === 'FastForwardMode') {
      videoEl.removeEventListener('seeked', fastForwardModeEvent, false);

      // Restore video element controls to its original state.
      videoEl.controls = controls;
    } else {
      videoEl.removeEventListener('timeupdate', playbackModeEvent, false);
      videoEl.removeEventListener('ended', videoEndedEvent, false);
    }

    stop = true;
  }

  function formatTime(num) {
    var hours = Math.floor(num / 3600);
    var minutes = Math.floor((num - (hours * 3600)) / 60);
    var seconds = (num - (hours * 3600) - (minutes * 60)).toFixed(2);

    if (hours < 10)
      hours = '0' + hours;
    if (minutes < 10)
      minutes = '0' + minutes;
    if (seconds < 10)
      seconds = '0' + seconds;
    return hours + ':' + minutes + ':' + seconds;
  }

  return {
    // _start is set after initialization, we can't just return _start().
    start: function() {
      _start();
    },
    pause: pause,
    stop: _stop,
    getFrameBlob: getFrameBlob
  };

}
