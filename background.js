// Background script

function registerVideo(element) {

}

// Find all videos of the page
var videos = document.getElementsByTagName("video");

setInterval(function() { togglePause(videos[0]); }, 3000);

function togglePause(element) {
  if (element.paused) element.play();
  else element.pause();
}
