document.addEventListener("DOMContentLoaded", function () {
    document.getElementById('selecton-settings-label').innerHTML = chrome.i18n.getMessage("selectonSettings") ?? 'Selecton settings';

    let openSettingsInTabButton = document.getElementById('openSettingsInTabButton');
    openSettingsInTabButton.setAttribute('title', chrome.i18n.getMessage("openInNewTab") ?? 'Open in new tab');
    openSettingsInTabButton.addEventListener('click', function () {
        chrome.runtime.openOptionsPage();
        window.close();
    });

    let donateCircleButton = document.getElementById('donateCircleButton');
    donateCircleButton.setAttribute('title', chrome.i18n.getMessage("buyMeCoffee") ?? 'Support development');
    donateCircleButton.addEventListener('click', function () {
        window.close();
        window.open('https://emvaized.diaka.ua/donate', '_blank');
    });

    let emailCircleButton = document.getElementById('emailCircleButton');
    emailCircleButton.setAttribute('title', 'Email');
    emailCircleButton.addEventListener('click', function () {
        window.close();
        window.open('mailto:maximtsyba@gmail.com');
    });
});