// On ready
$(document).ready(function() {

  // Sets the visual state of the application
  function setVisualState(state) {
    var element = $('#wtv_adcheckbox');
    if (state) {
      // Enabled
      $('#wtv_adstate').text("Audio description is currently enabled.");
      element.prop('checked', true);
    } else {
      // Disabled
      $('#wtv_adstate').text("Audio description is currently disabled.");
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

  getConfigByKey('voice', function(val) {
    console.log("Voice val " + val);
    $('#wtv_voiceselect').val(val);
  })

  // Register the change
  $('#wtv_adcheckbox').change(function() {
      var element = $('#wtv_adstate');
      var checked = $(this).prop('checked');
      setVisualState(checked);
      setEnabled(checked);
  });

  $('#wtv_apikey').change(function() {
    setConfigByKey('apikey', $(this).val());
  })

  var threshold = document.getElementById('wtv_threshold');

  setTimeout(function() {
    threshold.oninput = function() {
      var val = threshold.value;

      setTimeout(function() {
        if (val == threshold.value) {
          // Change it
          chrome.runtime.sendMessage({
            action: 'updateThreshold',
            newVal: threshold.value
          });
        }
      }, 1000);
    }
  }, 1000);

});
