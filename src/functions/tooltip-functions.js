function returnTooltipRevealTransform(endPosition = true, shouldShift = true) {
    let dxOffset = shouldShift ? '-50%' : '0';

    switch (configs.tooltipRevealEffect) {
        case 'noTooltipEffect': return ``;
        case 'moveUpTooltipEffect': return endPosition ? `translate(${dxOffset},0)` : `translate(${dxOffset}, 100%)`;
        case 'moveDownTooltipEffect': return endPosition ? `translate(${dxOffset},0)` : `translate(${dxOffset}, -100%)`;
        case 'scaleUpTooltipEffect': return endPosition ? `translate(${dxOffset},0) scale(1.0)` : `translate(${dxOffset},0) scale(0.0)`;
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

function checkTooltipForCollidingWithSideEdges() {
    if (configs.debugMode)
        console.log('Checking Selecton tooltip for colliding with side edges...');

    if (tooltip == null) return;

    let panelRect = tooltip.getBoundingClientRect();
    let dx = panelRect.left;
    // let tooltipWidth = panelRect.width + 20;

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
        tooltip.style.transform = returnTooltipRevealTransform(true, false);

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

        let offscreenAmount = (dx + tooltipWidth) - screenWidth;
        // let offscreenAmount = panelRect.right * -1;

        /// Tooltip is off-screen on the right
        if (offscreenAmount > 0) {
            if (configs.debugMode)
                console.log('Tooltip is colliding with right edge. Fixing...');

            // tooltip.style.left = `${dx - offscreenAmount - 5}px`;
            tooltip.style.transform = returnTooltipRevealTransform(true, false);
            tooltip.style.left = `${dx - offscreenAmount - 5}px`;

            /// Shift the arrow to match new position
            // let newLeftPercentForArrow = (dx - (dx - offscreenAmount - 5)) / tooltipWidth * 100;
            let newLeftPercentForArrow = offscreenAmount / tooltipWidth * 100;

            arrow.style.left = `${50 + (newLeftPercentForArrow / 2)}%`;
        } else {
            if (configs.debugMode)
                console.log('Tooltip is not colliding with side edges');
        }
    }
}

function createImageIconForButton(url, title, shouldAlwaysAddSpacing = false, opacity) {
    let container = document.createDocumentFragment();

    let img = document.createElement('img');
    img.setAttribute('src', url);
    img.setAttribute('class', 'selecton-button-img-icon');

    const onlyIconStyle = configs.buttonsStyle == 'onlyicon';
    img.style.opacity = opacity ?? (configs.buttonsStyle == 'onlylabel' ? 0.65 : onlyIconStyle ? 0.75 : 0.5);
    if (!onlyIconStyle || shouldAlwaysAddSpacing) img.style.marginRight = '3px';
    container.appendChild(img);

    if (title != undefined && title != '') {
        let label = document.createElement('span');
        label.textContent = title;
        container.appendChild(label);
    }

    return container;
}

function setBorderRadiusForSideButtons(parent, startFrom = 1) {
    /// Set border radius for first and last buttons of horizontal tooltip
    let children = parent.children;

    if (children.length == 1) {
        children[startFrom].style.borderRadius = onlyButtonBorderRadius;
    } else {
        children[startFrom].style.borderRadius = firstButtonBorderRadius;
        children[children.length - 1].style.borderRadius = lastButtonBorderRadius;
    }
}

function setCopyButtonTitle(copyButton, symbols, words) {
    if (configs.showStatsOnCopyButtonHover == false) return;

    setTimeout(function () {
        copyButton.title = (configs.buttonsStyle == 'onlyicon' ? copyLabel + ' ' : '') + `${symbols ?? selection.toString().length} ${chrome.i18n.getMessage('symbolsCount').toLowerCase()}, ${words ?? selection.toString().split(' ').length} ${chrome.i18n.getMessage('wordsCount').toLowerCase()}`;
    }, 5);
}

function addBasicTooltipButton(label, icon, onClick, isFirstButton = false, iconOpacity) {
    /// Used for basic button with action label + icon, when enabled
    const button = document.createElement('button');
    button.setAttribute('class', isFirstButton || configs.showButtonBorders == false ? 'selection-popup-button' : 'selection-popup-button button-with-border');

    if (configs.buttonsStyle == 'onlyicon' && configs.showButtonLabelOnHover)
        button.setAttribute('title', label);
    if (addButtonIcons)
        button.appendChild(createImageIconForButton(icon, configs.buttonsStyle == 'onlyicon' ? '' : label, false, iconOpacity));
    else
        button.textContent = label;

    button.addEventListener("mousedown", onClick);

    if (configs.reverseTooltipButtonsOrder && isFirstButton == false)
        tooltip.insertBefore(button, tooltip.children[1]);
    else
        tooltip.appendChild(button);

    return button;
}


function addContextualTooltipButton(onClick, isFirstButton = false) {
    /// Used for more complex button, which contents are created in code

    const button = document.createElement('button');
    button.setAttribute('class', isFirstButton || configs.showButtonBorders == false ? 'selection-popup-button' : 'selection-popup-button button-with-border');

    button.addEventListener("mousedown", onClick);

    if (configs.reverseTooltipButtonsOrder)
        tooltip.insertBefore(button, tooltip.children[1]);
    else
        tooltip.appendChild(button);

    return button;
}