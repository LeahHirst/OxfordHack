// main.js - Main content script

var wtvScd;
var video;
var lastMessages = [];
var sceneProcessing = false;
var scdEnabled = false;
var threshold = 70;

// Listen for plugin messages
chrome.runtime.onMessage.addListener(function(request, sender) {
  console.log(request);
  // Fires on a URL change (example YouTube)
  if (request.reinit = true) {
    initWTV();
  }
  // Handle turning the plugin on/off
  if (request.action == 'stateChange') {
    scdEnabled = request.newState;
    if (wtvScd != undefined) {
      if (request.newState) {
        console.log("Starting SCD");
      } else {
        console.log("Stopping SCD");
      }
    } else {
      if (request.newState) {
        initWTV();
      }
    }
  }

  if (request.action == 'updateThreshold') {
    threshold = request.newVal;
    if (wtvScd != undefined) wtvScd.stop();
    initWTV();
  }
});

function initWTV() {
  getConfigByKey('enabled', function(enabled) {
    if (enabled) {
      // Find all videos of the page
      var videos = document.getElementsByTagName("video");

      if (videos != undefined) {

        // Only target the first video
        var target = videos[0];
        if (target != undefined) {
          video = target;
          target.setAttribute('crossorigin', '*');
          console.log(target);

          // Instanciate SCD with the video
          wtvScd = Scd(target, {
            mode: 'PlaybackMode',
            step_width: 50,
            step_height: 37,
            threshold: threshold
          });

          // Add the scene change event listener
          target.addEventListener('scenechange', function(e) {
            console.log("Scene Changed.");

            if (!scdEnabled) return;

            if (!sceneProcessing) {
              sceneProcessing = true;

              wtvScd.getFrameBlob(function(blob) {
                processImage(blob, function(data) {
                  // Get the current state of the playback
                  var digest = data['description']['captions'][0]['text'];

                  //for (var i = 0; i < lastMessages.length; i++) {
                  //  if (digest === lastMessages[i]) return;
                  //}

                  // Play the message
                  target.pause();
                  console.log("Playing digest: " + digest);
                  textToSpeech(digest, function() {
                    target.play();
                    console.log("Unpausing");
                    sceneProcessing = false;
                  });
                })
              });
            }
          });

          // Start after small timeout
          setTimeout(function() {
            console.log("Started tracking scene changes.");
            wtvScd.start();
          }, 300)
        }
      }
    }
  });
}
