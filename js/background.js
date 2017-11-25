// Register command listener
chrome.commands.onCommand.addListener(function(command) {
  // Toggle state
  if (command === 'toggle-ad') {
    getConfigByKey('enabled', function(val) {
      setEnabled(!val);
    });
  }
});
