function returnTooltipRevealTransform(endPosition = true, shouldShift = true) {
    const dxOffset = shouldShift ? '-50%' : '0';
    const dyPercentOffset = configs.verticalLayoutTooltip ? 30 : 100;

    switch (configs.tooltipRevealEffect) {
        case 'noTooltipEffect': return `translate(${dxOffset},0)`;
        case 'moveUpTooltipEffect': return endPosition ? `translate(${dxOffset},0)` : `translate(${dxOffset}, ${dyPercentOffset}%)`;
        case 'moveDownTooltipEffect': return endPosition ? `translate(${dxOffset},0)` : `translate(${dxOffset}, -${dyPercentOffset}%)`;
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

    let dx = tooltip.getBoundingClientRect().left;
    let tooltipWidth = 4.0;

    /// we can't rely on clientWidth, because tooltip gets collapsed when colliding with screen edge
    // tooltipWidth = tooltip.clientWidth;
    if (configs.verticalLayoutTooltip) {
        tooltipWidth = 140;
    } else {
        const tooltipButtons = tooltip.querySelectorAll('.selection-tooltip > .selection-popup-button');
        for (let i = 0, l = tooltipButtons.length; i < l; i++) {
            tooltipWidth += tooltipButtons[i].offsetWidth;
        }
    }

    /// fix for collision detection not working with 'scale up' effects
    if (configs.tooltipRevealEffect == 'scaleUpTooltipEffect' || configs.tooltipRevealEffect == 'scaleUpFromBottomTooltipEffect') {
        dx -= tooltipWidth / 2;
    }

    /// Tooltip is off-screen on the left
    if (dx < 0) {
        if (configs.debugMode)
            console.log('Tooltip is colliding with left edge. Fixing...');

        tooltip.style.left = `${5 + (tooltipWidth / 2)}px`;

        /// Shift the arrow to match new position
        if (configs.showTooltipArrow && arrow) {
            const newLeftPercentForArrow = (-dx + 5) / tooltipWidth * 100;
            arrow.style.left = `${50 - newLeftPercentForArrow}%`;
        }

    } else {
        /// Check tooltip to be off-screen on the right
        const screenWidth = document.body.clientWidth || window.innerWidth
            || document.documentElement.clientWidth;

        const offscreenAmount = (dx + tooltipWidth) - screenWidth;

        /// Tooltip is off-screen on the right
        if (offscreenAmount > 0) {
            if (configs.debugMode)
                console.log(`Tooltip is colliding with right edge by ${offscreenAmount}px`);

            tooltip.style.left = 'unset';
            tooltip.style.right = `${5 - (tooltipWidth / 2)}px`;

            /// Shift the arrow to match new position
            if (configs.showTooltipArrow && arrow) {
                const newLeftPercentForArrow = (offscreenAmount + 5) / tooltipWidth * 100;
                arrow.style.left = `${50 + newLeftPercentForArrow}%`;
            }
        } else {
            if (configs.debugMode)
                console.log('Tooltip is not colliding with side edges');

            /// correct tooltip's position if 'more' button is used
            if (configs.correctTooltipPositionByMoreButtonWidth) {
                const attachedMoreButton = tooltip.querySelector('.more-button');
                if (!attachedMoreButton) return;
                const moreButtonWidth = attachedMoreButton.clientWidth;
                tooltip.style.left = parseInt(tooltip.style.left.replaceAll('px', '')) + (moreButtonWidth / 2) + 'px';

                if (configs.showTooltipArrow && arrow) {
                    const newLeftPercentForArrow = (moreButtonWidth / 2) / tooltipWidth * 100;
                    arrow.style.left = `${50 - newLeftPercentForArrow}%`;
                }
            }
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

function setBorderRadiusForSideButtons(parent, applyOnlyToButtons = true) {
    /// Set border radius for first and last buttons of horizontal tooltip
    // setTimeout(function () {
    const children = applyOnlyToButtons ? parent.querySelectorAll('.selection-tooltip > .selection-popup-button') : parent.children;
    const childrenLength = children.length;
    if (childrenLength == 1) {
        children[0].style.borderRadius = onlyButtonBorderRadius;
    } else {
        const revertedVerticalButtons = configs.verticalLayoutTooltip && tooltipOnBottom;
        children[0].style.borderRadius = revertedVerticalButtons ? lastButtonBorderRadius : firstButtonBorderRadius;
        children[childrenLength - 1].style.borderRadius = revertedVerticalButtons ? firstButtonBorderRadius : lastButtonBorderRadius;
    }
    // }, 50);
}

function setCopyButtonTitle(copyButton, symbols, words) {
    let infoString = `${symbols ?? selectedText.length} ${chrome.i18n.getMessage('symbolsCount').toLowerCase()}`;
    if (words && words > 1) infoString += ` · ${words} ${chrome.i18n.getMessage('wordsCount').toLowerCase()}`;

    if (configs.showStatsOnCopyButtonHover)
        setTimeout(function () {
            if (copyButton.isConnected)
                copyButton.title = (configs.buttonsStyle == 'onlyicon' ? copyLabel + ' ' : '') + infoString;
        }, 3)

    /// add info panel
    if (configs.showInfoPanel) {
        infoPanel = document.createElement('div');
        infoPanel.className = 'selecton-info-panel';
        infoPanel.innerText = infoString;

        configs.verticalLayoutTooltip ? tooltip.appendChild(infoPanel) : tooltip.insertBefore(infoPanel, tooltip.children[1]);
        makeTooltipElementDraggable(infoPanel, false);

        if (selectedTextIsCode == true) {
            // setTimeout(function () {
            //     if (!tooltipIsShown) return;

            /// Detect language of code (currently disabled)
            // let detectedLang = detectCodeLanguage(selectedText);
            // if (detectedLang && detectedLang !== 'Unknown')
            //     infoPanel.innerText += ' · ' + detectedLang;
            // else
            infoPanel.innerText += ' · code';
            // }, 5)
        }
    }
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

    // button.addEventListener("mousedown", onClick);
    button.onmousedown = onClick;

    if (configs.reverseTooltipButtonsOrder && isFirstButton == false)
        tooltip.insertBefore(button, tooltip.children[1]);
    else
        tooltip.appendChild(button);

    return button;
}


function addContextualTooltipButton(onClick, isFirstButton = false) {
    /// Used for more custom button, which contents will be created in code
    const button = document.createElement('button');
    button.setAttribute('class', isFirstButton || configs.showButtonBorders == false ? 'selection-popup-button' : 'selection-popup-button button-with-border');
    button.addEventListener("mousedown", onClick);

    if (configs.reverseTooltipButtonsOrder)
        tooltip.insertBefore(button, tooltip.children[1]);
    else
        tooltip.appendChild(button);

    return button;
}

/// Hide tooltip when mouse moved far from text selection
function mouseMoveToHideListener(mouseMoveEvent) {
    if (tooltipIsShown == false || configs.hideTooltipWhenCursorMovesAway == false) {
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

/// Set tooltip styling to be on bottom of text selection
function setTooltipOnBottom() {
    arrow.classList.add('arrow-on-bottom');
    tooltipOnBottom = true;

    if (configs.showInfoPanel && infoPanel && infoPanel.isConnected) {
        const newInfoPanel = infoPanel.cloneNode(true);
        newInfoPanel.classList.add('info-panel-on-bottom');
        tooltip.appendChild(newInfoPanel);
        try {
            infoPanel.remove();
            tooltip.removeChild(infoPanel);
        } catch (e) { }
        infoPanel = newInfoPanel;
    }
}

/// Makes tooltip draggable by given element (for example, arrow)
function makeTooltipElementDraggable(element, compensateTooltipHeight = true) {
    element.style.cursor = 'grab';
    element.onmousedown = function (e) {
        isDraggingTooltip = true;
        e.preventDefault();
        if (configs.debugMode)
            console.log('Started dragging tooltip...');

        tooltip.style.left = `0px`;
        tooltip.style.top = `0px`;
        tooltip.style.transition = `opacity ${configs.animationDuration}ms ease-in-out`;
        document.body.style.cursor = 'grabbing';

        // const tooltipOnBottom = arrow.classList.contains('arrow-on-bottom');
        const tooltipHeightCompensation = tooltipOnBottom ? (arrow.clientHeight / 3) : compensateTooltipHeight ? tooltip.clientHeight : 0;
        tooltip.style.transform = `translate(${e.clientX - tooltip.clientWidth / 2}px, ${tooltipOnBottom ? (e.clientY + tooltipHeightCompensation) : (e.clientY - tooltipHeightCompensation)}px)`;
        tooltip.style.pointerEvents = 'none';

        document.onmousemove = function (e) {
            e.preventDefault();

            /// Move main tooltip
            tooltip.style.transform = `translate(${e.clientX - tooltip.clientWidth / 2}px, ${tooltipOnBottom ? (e.clientY + tooltipHeightCompensation) : (e.clientY - tooltipHeightCompensation)}px)`;
        };

        document.onmouseup = function (e) {
            e.preventDefault();
            document.onmousemove = null;
            document.onmouseup = null;
            isDraggingTooltip = false;
            document.body.style.cursor = 'unset';

            tooltip.style.left = `${e.clientX - tooltip.clientWidth / 2}px`;
            tooltip.style.top = `${tooltipOnBottom ? (e.clientY + tooltipHeightCompensation) : (e.clientY - tooltipHeightCompensation)}px`;
            tooltip.style.transform = null;
            tooltip.style.pointerEvents = 'auto';

            if (configs.debugMode)
                console.log('Dragging tooltip finished');
        };

        if (configs.hideTooltipWhenCursorMovesAway) {
            window.removeEventListener('mousemove', mouseMoveToHideListener);
        }
    }
}