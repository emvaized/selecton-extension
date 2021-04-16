/// Listener to open url in new tab
chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        // chrome.tabs.create({
        //     url: request.url, active: request.focused
        // });
        // sendResponse({ farewell: "done" });

        /// Open url in new tab next to current one
        if (request.type == 'selecton-open-new-tab')
            chrome.tabs.query({
                active: true, currentWindow: true
            }, tabs => {
                let index = tabs[0].index;
                chrome.tabs.create({
                    url: request.url, active: request.focused, index: index + 1
                });
            }
            );
    }
);