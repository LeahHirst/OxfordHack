
$(document).ready(function() {
    $('#myRange').change(readValue);
})

$(document).ready(readValue);

function readValue() {
    var sliderElement = $("#myRange");
    var output = $("#currentThreshold");
    output.text("The current threshold is : " + sliderElement.val());
}
