// Register command listener
chrome.commands.onCommand.addListener(function(command) {
  // Toggle state
  if (command === 'toggle-ad') {
    getConfigByKey('enabled', function(val) {
      // Set if the plugin is enabled
      setEnabled(!val);
      // Tell the content script
      chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'stateChange', newState: !val });
      });

      chrome.browserAction.setBadgeText({"text": !val ? "" : "off"});
    });
  }
});

// Detect page load finish
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  if(changeInfo && changeInfo.status == "complete") {
    chrome.tabs.sendMessage(tabId, { reinit: true });
  }
});

chrome.runtime.onMessage.addListener(function(request, sender) {
  if (request.action === "stateChange") {
    // if disabled, display a badge saying "off"
    chrome.browserAction.setBadgeText({"text": request.newState ? "" : "off"});
  }

  // Forward plugin messages to content scripts
  chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
    chrome.tabs.sendMessage(tabs[0].id, request);
  });
});
