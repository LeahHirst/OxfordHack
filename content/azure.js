// Handle all calls to the MS Cognitive Vision API

subscriptionKeys = {
  vision: 'e5c2bd251bdc4a9badee0740a3a27b74'
};

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
            xhrObj.setRequestHeader("Ocp-Apim-Subscription-Key",  subscriptionKeys.vision);
        },
        type: "POST",
        // Request body
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

function textToSpeech(text, callback) {
  // Uses HTML5 SpeechSynthesisUtterance
  // Due to a known bug, we need to store the msg in a global var, otherwise
  // the onend callback does not always fire.
  getConfigByKey('voice', function(voiceId) {
    window.utterances = [];
    var msg = new SpeechSynthesisUtterance();
    var voices = window.speechSynthesis.getVoices();
    msg.voice = voices[voiceId]; // Note: some voices don't support altering params
    msg.voiceURI = 'native';
    msg.volume = 1; // 0 to 1
    msg.rate = 1; // 0.1 to 10
    msg.pitch = 1; //0 to 2
    msg.lang = 'en-US';
    msg.onend = callback; // End callback
    utterances.push(msg);

    msg.text = ' ';
    speechSynthesis.speak(msg);
    msg.text = text;
    speechSynthesis.speak(msg);
  });
}
