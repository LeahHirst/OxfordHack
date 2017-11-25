// main.js - Main content script

window.onload = function() {
  // Find all videos of the page
  var videos = document.getElementsByTagName("video");

  if (videos != undefined) {

    // Only target the first video
    var target = videos[0];
    target.setAttribute('crossorigin', '*');
    console.log(target);

    // Instanciate SCD with the video
    var scd = Scd(target, {
      mode: 'PlaybackMode',
      step_width: 50,
      step_height: 37
    });

    // Add the scene change event listener
    target.addEventListener('scenechange', function(e) {
      console.log("Scene Changed.");
      scd.getFrameBlob(function(blob) {
        processImage(blob, function(data) {
          target.pause();
          textToSpeech(data['description']['captions'][0]['text'], function() {
            target.play();
          });
        })
      });
    });

    target.addEventListener('durationchange', function() { scd.start(); });

  }
}
