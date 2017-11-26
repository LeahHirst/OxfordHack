$(document).ready(function() {
  $('select').material_select();

  $('#wtv_voiceselect').change(function() {
    console.log("Voice change");
    setVoice($(this).val());
  });
});

speechSynthesis.onvoiceschanged = function() {
  var voices = speechSynthesis.getVoices();

    console.log(voices);
  for (var i = 0; i < voices.length; i++) {
    $('#wtv_voiceselect').append($('<option>', {
      value: i,
      text: voices[i].name
    }));
  }
}
