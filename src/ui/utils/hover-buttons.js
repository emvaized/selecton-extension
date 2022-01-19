/// Functions used for buttons with on-hover functionality
/// First of all, Live translate button and Dictionary button

function addAstrixToHoverButton(button) {
    /// add astrix indicator when hover enabled
    let astrix = document.createElement('span');
    astrix.className = 'selecton-hover-button-indicator';
    // astrix.innerText = '*';
    // button.style.position = 'relative';
    button.appendChild(astrix);
    return astrix;
}

function showHoverIndicator(indicator) {
    indicator.style.opacity = 0.25;
}

function hideHoverIndicator(indicator) {
    indicator.style.opacity = 0;
}

function checkHoverPanelToOverflowOnTop(liveTranslationPanel) {
    /// check to hover panel overflow on screen top
    const panelRect = liveTranslationPanel.getBoundingClientRect();
    if (panelRect.top < 0) {
        liveTranslationPanel.style.bottom = 'unset';
        liveTranslationPanel.style.top = '120%';
    }
}

function correctTooltipPosition() {
    /// Shift tooltip after button was added asynchronously
    if (configs.tooltipPosition == 'overCursor') {

        /// Show tooltip over cursor
        tooltip.style.left = `${lastMouseUpEvent.clientX - tooltip.clientWidth / 2}px`;

    } else {
        let resultingDx;
        try {
            /// New approach - place tooltip in horizontal center between two selection handles
            let selStartDimensions = getSelectionCoordinates(true);
            let selEndDimensions = getSelectionCoordinates(false);
            let delta = selEndDimensions.dx > selStartDimensions.dx ? selEndDimensions.dx - selStartDimensions.dx : selStartDimensions.dx - selEndDimensions.dx;

            if (selEndDimensions.dx > selStartDimensions.dx)
                resultingDx = selStartDimensions.dx + (delta / 2) - (tooltip.clientWidth / 2);
            else
                resultingDx = selEndDimensions.dx + (delta / 2) - (tooltip.clientWidth / 2);

        } catch (e) {
            if (configs.debugMode) console.log(e);

            /// Fall back to old approach - place tooltip in horizontal center selection rect,
            /// which may be in fact bigger than visible selection
            resultingDx = selDimensions.dx + (selDimensions.width / 2) - (tooltip.clientWidth / 2);
        }

        tooltip.style.left = `${resultingDx}px`;
    }

    /// Correct last button's border radius
    tooltip.children[tooltip.children.length - 2].style.borderRadius = '0px';
    tooltip.children[tooltip.children.length - 1].style.borderRadius = lastButtonBorderRadius;

    if (configs.reverseTooltipButtonsOrder)
        tooltip.children[1].style.borderRadius = firstButtonBorderRadius;

    checkTooltipForCollidingWithSideEdges();
}