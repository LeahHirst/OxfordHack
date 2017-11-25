
$(document).ready(function() {
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
