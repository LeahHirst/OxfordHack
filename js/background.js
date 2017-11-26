// Register command listener
chrome.commands.onCommand.addListener(function(command) {
  // Toggle state
  if (command === 'toggle-ad') {
    getConfigByKey('enabled', function(val) {
      setEnabled(!val);
    });
  }
});

// Forward plugin messages to content scripts
chrome.runtime.onMessage.addListener(function(request, sender) {
  chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
    chrome.tabs.sendMessage(tabs[0].id, request);
  });
});
