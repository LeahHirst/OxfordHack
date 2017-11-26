// On ready
$(document).ready(function() {

  // Sets the visual state of the application
  function setVisualState(state) {
    var element = $('#wtv_adcheckbox');
    if (state) {
      // Enabled
      $('#text').text("Audio description is currently enabled.");
      element.prop('checked', true);
    } else {
      // Disabled
      $('#text').text("Audio description is currently disabled.");
      element.prop('checked', false);
    }
  }

  // Listen for plugin messages
  chrome.runtime.onMessage.addListener(function(request, sender) {
    // Handle turning the plugin on/off
    if (request.action == 'stateChange') {
      setVisualState(request.newState);
    }
  });

  // Get inital state
  getConfigByKey('enabled', function(val) {
    setVisualState(val);
  });

  // Register the change
  $('#wtv_adcheckbox').change(function() {
      var element = $('#text');
      var checked = $(this).prop('checked');
      setVisualState(checked);
      setEnabled(checked);
  });

});
