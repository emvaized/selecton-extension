/// Listener to open url in new tab
chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {

        /// Open url in new tab next to current one
        if (request.type == 'selecton-open-new-tab') {
            chrome.tabs.query({
                active: true, currentWindow: true
            }, tabs => {
                let index = tabs[0].index;
                chrome.tabs.create({
                    url: request.url, active: request.focused, index: index + 1
                });
            }
            );
            return true;
        }

        else if (request.type == 'selecton-fetch-url') {
            fetch(request.url).then(async function (res) {
                let json = await res.json();
                // sendResponse(json);
                sendResponse({ complete: true, value: json });
            }).catch((err) => sendResponse({ complete: false }))
            return true;
        }
    }
);