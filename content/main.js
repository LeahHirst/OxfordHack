// main.js - Main content script

var wtvScd;
var lastMessages = [];
var sceneProcessing = false;

// Listen for plugin messages
chrome.runtime.onMessage.addListener(function(request, sender) {
  // Handle turning the plugin on/off
  if (request.action == 'stateChange') {
    if (wtvScd != undefined) {
      if (request.newState) {
        wtvScd.start();
      } else {
        wtvScd.pause();
      }
    } else {
      if (request.newState) {
        initWTV();
      }
    }
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
        target.setAttribute('crossorigin', '*');
        console.log(target);

        // Instanciate SCD with the video
        wtvScd = Scd(target, {
          mode: 'PlaybackMode',
          step_width: 50,
          step_height: 37
        });

        // Add the scene change event listener
        target.addEventListener('scenechange', function(e) {
          console.log("Scene Changed.");

          if (!sceneProcessing) {
            sceneProcessing = true;

            wtvScd.getFrameBlob(function(blob) {
              processImage(blob, function(data) {
                // Get the current state of the playback
                var digest = data['description']['captions'][0]['text'];

                for (var i = 0; i < lastMessages.length; i++) {
                  if (digest === lastMessages[i]) return;
                }

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

        console.log("Started tracking scene changes.");
        wtvScd.start();
      }
    }
  });
}

window.onload = function() {
  window.setTimeout(initWTV, 300);
};
