/// Listener to open url in new tab
chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {

        /// Open url in new tab next to current one
        if (request.type == 'selecton-open-new-tab') {
            chrome.tabs.create({
                url: request.url, active: request.focused, index: sender.tab.index + 1
            });
            return true;
        } else if (request.type == 'selecton-export-configs') {
            const filename = 'selecton-settings.json';
            const jsonStr = JSON.stringify(request.configs);
            let element = document.createElement('a');
            element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(jsonStr));
            element.setAttribute('download', filename);
            element.style.display = 'none';
            document.body.appendChild(element);
            element.click();
            document.body.removeChild(element);
        }
    }
);