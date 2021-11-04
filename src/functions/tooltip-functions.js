function returnTooltipRevealTransform(onEnd = true) {
    switch (configs.tooltipRevealEffect) {
        case 'noTooltipEffect': return ``;
        case 'moveUpTooltipEffect': return onEnd ? `translate(0,0)` : `translate(0, 100%)`;
        case 'moveDownTooltipEffect': return onEnd ? `translate(0,0)` : `translate(0, -100%)`;
        case 'scaleUpTooltipEffect': return onEnd ? `scale(1.0)` : `scale(0.0)`;
    }
}

function onTooltipButtonClick(e, url, text) {
    // if (configs.addDragHandles)
    //     hideDragHandles();

    /// Open new tab with passed url
    try {
        const evt = e || window.event;

        if ("buttons" in evt) {
            if (evt.button == 0) {
                /// Left button click
                hideTooltip();
                removeSelectionOnPage();

                if (configs.convertResultClickAction == 'copy' && text)
                    copyManuallyToClipboard(text);
                else
                    chrome.runtime.sendMessage({ type: 'selecton-open-new-tab', url: url, focused: true });

            } else if (evt.button == 1) {
                /// Middle button click
                evt.preventDefault();
                if (configs.middleClickHidesTooltip) {
                    hideTooltip();
                    removeSelectionOnPage();
                }

                chrome.runtime.sendMessage({ type: 'selecton-open-new-tab', url: url, focused: false });
            }
        }
    } catch (e) {
        window.open(url, '_blank');
    }
}

function copyManuallyToClipboard(text) {
    try {
        const input = document.createElement('input');
        input.setAttribute('style', `position: fixed; top: 0px; left: 0px; opacity: 0.0;`)
        document.body.appendChild(input);
        input.value = text;
        input.focus();
        input.select();
        document.execCommand('Copy');
        // document.body.removeChild(input);
        input.remove();
    } catch (e) {
        navigator.clipboard.writeText(text);
    }
}

function returnDomainFromUrl(url, firstLetterIsCapital = true) {
    if (url == null || url == undefined || url == '') return '';

    try {
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
            titleText = url.textContent.split('/')[2].split('.')[0];
        }
        titleText = titleText.replaceAll('https://', '');

        if (titleText == null || titleText == undefined) return '';

        return firstLetterIsCapital == false ? titleText : titleText.charAt(0).toUpperCase() + titleText.slice(1);
    } catch (error) {
        return '';
    }
}

function checkTooltipForCollidingWithSideEdges() {
    if (configs.debugMode)
        console.log('Checking Selecton tooltip for colliding with side edges...');

    if (tooltip == null) return;

    let dx = parseInt(tooltip.style.left.replaceAll('px', ''));
    let tooltipWidth = 24.0;
    for (let i = 0, l = tooltip.children.length; i < l; i++) {
        if (i == 0) continue; /// ignore arrow element
        tooltipWidth += tooltip.children[i].offsetWidth;
    }

    /// Tooltip is off-screen on the left
    if (dx < 0) {

        if (configs.debugMode)
            console.log('Tooltip is colliding with left edge. Fixing...');

        tooltip.style.left = '5px';

        /// Shift the arrow to match new position
        var newLeftPercentForArrow = (-dx + 5) / tooltipWidth * 100;
        if (arrow !== null && arrow !== undefined)
            arrow.style.left = `${50 - newLeftPercentForArrow}%`;

    } else {
        /// Check tooltip to be off-screen on the right

        let screenWidth = window.innerWidth
            || document.documentElement.clientWidth
            || document.body.clientWidth;

        // let screenWidth = document.body.clientWidth;

        // let offscreenAmount = (dx + tooltipWidth) - screenWidth + 10;
        let offscreenAmount = (dx + tooltipWidth) - screenWidth;

        /// Tooltip is off-screen on the right
        if (offscreenAmount > 0) {
            if (configs.debugMode)
                console.log('Tooltip is colliding with right edge. Fixing...');

            tooltip.style.left = `${dx - offscreenAmount - 5}px`;

            /// Shift the arrow to match new position
            // let newLeftPercentForArrow = (dx - (dx - offscreenAmount - 5)) / tooltipWidth * 100;
            let newLeftPercentForArrow = offscreenAmount / tooltipWidth * 100;

            // if (configs.tooltipPosition !== 'overCursor')
            arrow.style.left = `${50 + (newLeftPercentForArrow / 2)}%`;

        } else {
            if (configs.debugMode)
                console.log('Tooltip is not colliding with side edges');
        }
    }
}