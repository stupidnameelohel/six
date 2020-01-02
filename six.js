BASE_URL = "https://nhentai.net/g/";

function gotoSixDigit(info, tab) {
  if(!info.selectionText.match(/\d{5,6}/)) {
    console.log("Bailing...");
    return;
  }

  // build destination url
  var url = BASE_URL + info.selectionText + "/";

  // see if any incognito windows exist to use for destination
  chrome.windows.getAll({"populate": true, "windowTypes": ["normal"]}, function(windows) {
    console.log("Windows.length: " + windows.length);
    console.log(info.selectionText);
    var incognito = {
      "found": false,
      "window": null
    };

    // See if any incognito window exists, and see if user is already browsing the six digit
    for(var i = 0; i < windows.length; ++i) {
      if(windows[i].incognito) {
        incognito.found = true;
        incognito.window = windows[i];
        for(var j = 0; j < windows[i].tabs.length; ++j) {
          var t = windows[i].tabs[j];
          console.log(t.url + "\t" + t.pendingUrl + "\t" + url);
          if(!t.url.localeCompare(url) || (t.pendingUrl && !t.pendingUrl.localeCompare(url))) {
            chrome.windows.update(windows[i].id, {"focused": true}, null);
            chrome.tabs.update(t.id, {"active": true}, null);
            return;
          }
        }
      }
    }

    if(incognito.found) {
      chrome.tabs.create({"windowId": incognito.window.id, "url": url, "active": true}, null);
    } else {
      incognito.window = chrome.windows.create({"url": url, "focused": true, "incognito": true}, null);
    }
  });
}

// Create context menu entry
chrome.contextMenus.create({"title": "Six", "contexts":["selection"],
  "onclick": gotoSixDigit});