function returnTooltipRevealTransform(onEnd = true) {
    switch (configs.tooltipRevealEffect) {
        case 'noTooltipEffect': return ``;
        case 'moveUpTooltipEffect': return onEnd ? `translate(0,0)` : `translate(0, 100%)`;
        case 'moveDownTooltipEffect': return onEnd ? `translate(0,0)` : `translate(0, -100%)`;
        case 'scaleUpTooltipEffect': return onEnd ? `scale(1.0)` : `scale(0.0)`;
    }
}

function onTooltipButtonClick(e, url) {
    hideTooltip();
    removeSelectionOnPage();
    if (configs.addDragHandles)
        hideDragHandles();

    /// Open new tab with passed url
    try {
        var evt = e || window.event;

        if ("buttons" in evt) {
            if (evt.buttons == 1) {
                /// Left button click
                chrome.runtime.sendMessage({ type: 'selecton-open-new-tab', url: url, focused: true });
            } else if (evt.buttons == 4) {
                /// Middle button click
                evt.preventDefault();
                chrome.runtime.sendMessage({ type: 'selecton-open-new-tab', url: url, focused: false });
            }
        }
    } catch (e) {
        window.open(url, '_blank');
    }
}


function returnDomainFromUrl(url, firstLetterIsCapital = true) {
    let domainContent = url.split('.');
    let titleText;

    if (domainContent.length == 2) {
        titleText = domainContent[0];
    } else if (domainContent.length == 3) {
        if (domainContent[1].includes('/'))
            titleText = domainContent[0];
        else
            titleText = domainContent[1];
    } else {
        titleText = domain.textContent.split('/')[2].split('.')[0];
    }
    titleText = titleText.replaceAll('https://', '');

    return firstLetterIsCapital == false ? titleText : titleText.charAt(0).toUpperCase() + titleText.slice(1);
}