// Handle all calls to the MS Cognitive Vision API

subscriptionKey = '[KEY HERE]';

getConfigByKey("subscriptionKey", function(value) {
    subscriptionKey = value;
});

function processImage(blob, successCallback) {

    // We are west europe
    var uriBase = "https://westeurope.api.cognitive.microsoft.com/vision/v1.0/describe";

    var params = {
        // Request parameters
        "maxCandidates": "1",
    };

    $.ajax({
        url: uriBase + "?" + $.param(params),
        beforeSend: function(xhrObj){
            // Request headers
            xhrObj.setRequestHeader("Content-Type", "application/octet-stream");
            xhrObj.setRequestHeader("Ocp-Apim-Subscription-Key",  subscriptionKey);
        },
        type: "POST",
        // Request body
        // temp
        data: blob,
        processData: false
    })
    .done(function(data) {
        successCallback(data);
    })
    .fail(function(jqXHR, textStatus, errorThrown) {
        // Display error message.
        var errorString = (errorThrown === "") ? "Error. " : errorThrown + " (" + jqXHR.status + "): ";
        errorString += (jqXHR.responseText === "") ? "" : jQuery.parseJSON(jqXHR.responseText).message;
        alert(errorString);
    });
};
