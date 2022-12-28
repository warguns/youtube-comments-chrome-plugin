chrome.runtime.onInstalled.addListener(async () => {
  var watching = false;
  const apiUrl = 'https://466b-79-154-12-239.eu.ngrok.io';


  function checkWatching(tabid) {
    var flag = false;
    chrome.windows.getAll({populate: true}, function (windows) {
      windows.forEach(function (window) {
        window.tabs.forEach(function (tab) {
          if (tab.url.includes("youtube.com/watch")) {
            flag = true;
            chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
              chrome.tabs.sendMessage(tabs[0].id, {type: "watching-now"});
            });
            watching = true;
          }
        });
      });
    });
    if (!flag) {
      watching = false;
      chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {type: "watching-stop"});
      });
    }
  }

  chrome.tabs.onRemoved.addListener(function (tabid, removed) {
    checkWatching(tabid);
  });

  chrome.tabs.onUpdated.addListener(function (tabid, changeInfo) {
    if (changeInfo.status && changeInfo.status === "complete") {
      checkWatching(tabid);
    }
  })

  chrome.tabs.onCreated.addListener(function (tabid) {
    checkWatching(tabid);
  });

  chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.type === "statistics") {

      fetch(apiUrl + '/comment', {

        // Adding method type
        method: "POST",

        // Adding body or contents to send
        body: JSON.stringify({
          comments: request.comments
        }),

        // Adding headers to the request
        headers: {
          "Content-type": "application/json; charset=UTF-8"
        }
      })
          .then(response => response.json())
          .then(function (json) {
            console.log(json);
            chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
              chrome.tabs.sendMessage(tabs[0].id, {type: "statistics-response", result: parseInt(json.data.statistics)});
            });
          });


    } else if (request.type === "change-icon") {
      if (request.theme === 'dark') {
        chrome.action.setIcon({
          path: 'assets/logo-dark.png'
        });
      } else {
        chrome.action.setIcon({
          path: 'assets/logo-light.png'
        });
      }
    }
  });
});
