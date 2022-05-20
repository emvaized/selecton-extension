function returnTooltipRevealTransform(endPosition = true, shouldShift = true) {
    let dxOffset = shouldShift ? '-50%' : '0';

    switch (configs.tooltipRevealEffect) {
        case 'noTooltipEffect': return `translate(${dxOffset},0)`;
        case 'moveUpTooltipEffect': return endPosition ? `translate(${dxOffset},0)` : `translate(${dxOffset}, 100%)`;
        case 'moveDownTooltipEffect': return endPosition ? `translate(${dxOffset},0)` : `translate(${dxOffset}, -100%)`;
        case 'scaleUpTooltipEffect': return endPosition ? `translate(${dxOffset},0) scale(1.0)` : `translate(${dxOffset},0) scale(0.0)`;
        case 'scaleUpFromBottomTooltipEffect': return endPosition ? `translate(${dxOffset},0) scale(1.0)` : `translate(${dxOffset},0) scale(0.0)`;
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
                    chrome.runtime.sendMessage({ type: 'selecton-open-new-tab', url: url, focused: configs.leftClickBackgroundTab ? false : true });

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
        if (configs.showTooltipArrow && arrow !== null && arrow !== undefined) {
            const newLeftPercentForArrow = (-dx + 5) / tooltipWidth * 100;
            arrow.style.left = `${50 - newLeftPercentForArrow}%`;
        }

    } else {
        /// Check tooltip to be off-screen on the right
        let screenWidth = window.innerWidth
            || document.documentElement.clientWidth
            || document.body.clientWidth;

        let offscreenAmount = (dx + tooltipWidth) - screenWidth;

        /// Tooltip is off-screen on the right
        if (offscreenAmount > 0) {
            if (configs.debugMode)
                console.log('Tooltip is colliding with right edge. Fixing...');

            tooltip.style.transform = returnTooltipRevealTransform(true, false);
            tooltip.style.left = `${dx - offscreenAmount - 5}px`;

            /// Shift the arrow to match new position
            if (configs.showTooltipArrow) {
                const newLeftPercentForArrow = offscreenAmount / tooltipWidth * 100;
                arrow.style.left = `${50 + (newLeftPercentForArrow / 2)}%`;
            }
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
    setTimeout(function () {
        let children = parent.children;

        if (children.length == 1) {
            children[startFrom].style.borderRadius = onlyButtonBorderRadius;
        } else {
            const revertedVerticalButtons = configs.verticalLayoutTooltip && tooltipOnBottom;
            children[startFrom].style.borderRadius = revertedVerticalButtons ? lastButtonBorderRadius : firstButtonBorderRadius;
            children[children.length - 1].style.borderRadius = revertedVerticalButtons ? firstButtonBorderRadius : lastButtonBorderRadius;
        }
    }, 50);
}

function setCopyButtonTitle(copyButton, symbols, words) {
    if (configs.showStatsOnCopyButtonHover == false) return;

    setTimeout(function () {
        if (!copyButton.isConnected) return;
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


function mouseMoveToHideListener(mouseMoveEvent) {
    /// Hide tooltip when mouse moved far from text selection
    if (tooltipIsShown == false) {
        window.removeEventListener('mousemove', mouseMoveToHideListener);
        return;
    }

    if (Math.abs(mouseMoveEvent.clientX - lastMouseUpEvent.clientX) > this.window.screen.width / 4 ||
        Math.abs(mouseMoveEvent.clientY - lastMouseUpEvent.clientY) > this.window.screen.height / 4) {
        window.removeEventListener('mousemove', mouseMoveToHideListener);

        try {
            hideTooltip();
            hideDragHandles();
        } catch (e) { }
    }
}