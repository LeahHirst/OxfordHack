
$(document).ready(function() {
    $('#toggleCheckBox').change(function() {
        var element = $('#text');
        if ($(this).prop('checked')) {
            element.text("Audio description is currently enabled.");
        } else {
            element.text("Audio description is currently disabled.");
        }
    });
});
