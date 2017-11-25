// Get a config option
function getConfig(callback) {
  chrome.storage.sync.get(null, function(data) {
    callback(data);
  });
}

// Set the config
function setConfig(config) {
  chrome.storage.sync.set(config);
}

// Set a value by key
function setConfigByKey(key, value) {
  // Get the current config
  getConfig(function(config) {
    // Set the value
    config[key] = value;
    // Update the config
    setConfig(config);
  });
}

// Get a config value by key
function getConfigByKey(key, callback) {
  // Get the config
  getConfig(function(config) {
    // Call the callback with the key
    callback(config[key]);
  });
}

function setEnabled(state) {
  setConfigByKey('enabled', state);
  // Tell the user
  if (state) {
    textToSpeech('Audio description enabled');
  } else {
    textToSpeech('Audio description disabled');
  }
}

// Register command listener
chrome.commands.onCommand.addListener(function(command) {
  // Toggle state
  if (command === 'toggle-ad') {
    getConfigByKey('enabled', function(val) {
      setEnabled(!val);
    });
  }
});
