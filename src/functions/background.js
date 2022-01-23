/// Listener to open url in new tab
chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {

        /// Open url in new tab next to current one
        if (request.type == 'selecton-open-new-tab') {
            chrome.tabs.create({
                url: request.url, active: request.focused, index: sender.tab.index + 1
            });
            return true;
        } else if (request.type == 'selecton-no-clipboard-permission-message') {
            displayNotification('Clipboard access was not granted', 'Could not paste to this field without clipboard access');
            return true;
        } if (request.type == 'selecton-export-configs') {
            const filename = request.name ?? 'selecton-settings.json';
            const jsonStr = JSON.stringify(request.configs);

            if (/^((?!chrome|android).)*safari/i.test(navigator.userAgent)) {
                /// Safari-specific method, until 'download' attribute is properly supported
                window.open('data:text/plain;charset=utf-8,' + encodeURIComponent(jsonStr));
            } else {
                let element = document.createElement('a');
                element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(jsonStr));
                element.setAttribute('download', filename);
                element.style.display = 'none';
                element.style.position = 'absolute';
                document.body.appendChild(element);
                element.click();
                element.remove();
            }
            return true;
        }
    }
);


/// Show notification on extension update
chrome.runtime.onInstalled.addListener(function (details) {
    if (details.reason == 'update') {
        // show update notification
        let shouldShowNotification = true;
        const storageKey = 'showUpdateNotification';

        chrome.storage.local.get([storageKey], function (val) {
            if (val[storageKey] !== null && val[storageKey] !== undefined)
                shouldShowNotification = val[storageKey];

            if (shouldShowNotification) {
                // get manifest for new version number
                const manifest = chrome.runtime.getManifest();
                // show update notification and open changelog on click
                displayNotification(
                    chrome.i18n.getMessage('updateNotificationTitle', manifest.version),
                    chrome.i18n.getMessage('updateNotificationMessage'),
                    "https://github.com/emvaized/selecton-extension/blob/master/CHANGELOG.md"
                );
            }
        });
    }
});

/**
 * displays a browser notification
 * opens an URL on click if specified
 **/
function displayNotification(title, message, link, image) {
    // create notification
    // const createNotification =
    chrome.notifications.create({
        "type": "basic",
        "iconUrl": image ?? "../../icons/logo-96.png",
        "title": title,
        "message": message,
    }, function (notificationId) {
        // if an URL is specified register an onclick listener
        if (link)
            chrome.notifications.onClicked.addListener(function handleNotificationClick(id) {
                if (id === notificationId) {
                    chrome.tabs.create({
                        url: link,
                        active: true
                    });
                    // remove event listener
                    chrome.notifications.onClicked.removeListener(handleNotificationClick);
                }
            });
    });
}