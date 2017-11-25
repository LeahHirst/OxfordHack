
$(document).ready(function() {
    getConfigByKey('enabled', function(val) {
      var element = $('#toggleCheckBox');
      element.prop('checked', val);
      if (val) {
        $('#text').text("Audio description is currently enabled.");
      }
    });

    $('#toggleCheckBox').change(function() {
        var element = $('#text');
        if ($(this).prop('checked')) {
            element.text("Audio description is currently enabled.");
            setEnabled(true);
        } else {
            setEnabled(false);
            element.text("Audio description is currently disabled.");
        }
    });
});
