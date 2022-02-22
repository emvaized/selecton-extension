document.addEventListener("DOMContentLoaded", function () {
    document.getElementById('selecton-settings-label').innerHTML = chrome.i18n.getMessage("selectonSettings") ?? 'Selecton settings';

    let openSettingsInTabButton = document.getElementById('openSettingsInTabButton');
    openSettingsInTabButton.setAttribute('title', chrome.i18n.getMessage("openInNewTab") ?? 'Open in new tab');
    openSettingsInTabButton.addEventListener('mouseup', function (e) {
        if (e.button == 0) {
            chrome.runtime.openOptionsPage();
            window.close();
        } else if (e.button == 1) {
            // let newWindow = window.open();
            // newWindow.location.href = chrome.runtime.getURL('options/options.html');
            // window.close();
            window.open(chrome.runtime.getURL('options/options.html'));
        }
    });

});