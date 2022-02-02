/// Functions used for buttons with on-hover functionality
/// First of all, Live translate button and Dictionary button

function addAstrixToHoverButton(button) {
    if (configs.showDotForHoverButtons == false) return;

    /// add astrix indicator when hover enabled
    let astrix = document.createElement('span');
    astrix.className = 'selecton-hover-button-indicator';
    // astrix.innerText = '*';
    // button.style.position = 'relative';
    button.appendChild(astrix);
    return astrix;
}

function showHoverIndicator(indicator) {
    if (configs.showDotForHoverButtons == false) return;
    indicator.style.opacity = 0.3;
}

function hideHoverIndicator(indicator) {
    if (configs.showDotForHoverButtons == false) return;
    indicator.style.opacity = 0;
}

function createHorizontalHoverPanelForButton(button, pinOnClick = false) {
    let panel = document.createElement('div');
    panel.className = 'selection-tooltip selecton-entity';
    panel.style.borderRadius = `${configs.useCustomStyle ? configs.borderRadius : 3}px`;
    panel.style.pointerEvents = 'none';
    panel.style.width = 'max-content';
    panel.style.opacity = 0;
    if (tooltipOnBottom)
        panel.style.top = '125%';
    else
        panel.style.bottom = '125%';
    if (configs.reverseTooltipButtonsOrder)
        panel.style.left = '0px';
    else
        panel.style.right = '0px';

    const dxTransformValue = configs.reverseTooltipButtonsOrder ? '-2px' : '2px';
    panel.style.transition = `opacity ${configs.animationDuration}ms ease-out, transform ${configs.animationDuration}ms ease-out`;

    /// Add shadow to panel
    if (configs.addTooltipShadow) {
        panel.style.boxShadow = `0 1px 5px rgba(0,0,0,${configs.shadowOpacity / 1.5})`;
    }

    /// Check if panel will go off-screen on top
    let panelOnBottom = false;

    if (tooltipOnBottom) {
        panelOnBottom = true;
        movePanelToBottom(panel);
        panel.style.transform = `translate(${dxTransformValue}, ${panelOnBottom ? -100 : 100}%)`;
    } else
        /// Check if panel will go off-screen
        setTimeout(function () {
            if (!tooltipIsShown) return;
            panelOnBottom = checkHoverPanelToOverflowOnTop(panel);
            panel.style.transform = `translate(${dxTransformValue}, ${panelOnBottom ? -100 : 100}%)`;
        }, configs.animationDuration);

    panel.style.transform = `translate(${dxTransformValue}, ${panelOnBottom ? '-100' : '100'}%)`;

    if (button) {
        let timerToHide, timerToAllowPointer, millsToWait = 150;
        let panelIsPinned = false;

        if (pinOnClick)
            button.addEventListener('click', function () {
                panelIsPinned = !panelIsPinned;

                // if (panelIsPinned)
                button.classList.toggle('highlighted-popup-button');
                // else 
                // button.classList.add('highlighted-popup-button');
            });

        button.addEventListener('mouseover', function () {
            clearTimeout(timerToHide);
            panel.style.opacity = 1;
            panel.style.transform = `translate(${dxTransformValue}, 0)`;

            timerToAllowPointer = setTimeout(function () {
                panel.style.pointerEvents = 'auto';
            }, configs.animationDuration / 2);
        });

        button.addEventListener('mouseout', function () {
            if (panelIsPinned) return;

            clearTimeout(timerToAllowPointer);

            timerToHide = setTimeout(function () {
                panel.style.opacity = 0;
                panel.style.pointerEvents = 'none';
                panel.style.transform = `translate(${dxTransformValue}, ${panelOnBottom ? -100 : 100}%)`;
            }, millsToWait);
        });
    }

    return panel;
}

function createVerticalHoverPanelForButton(button, initialHtml, onHoverCallback, reverseOrder = false, isHorizontal = false) {
    let timerToRemovePanel, timeoutToRevealPanel;
    const hoverIndicator = addAstrixToHoverButton(button);

    /// Set panel
    let panel = document.createElement('div');
    panel.className = 'hover-vertical-tooltip  selecton-entity';
    panel.style.borderRadius = `${configs.useCustomStyle ? configs.borderRadius : 3}px`;
    panel.style.opacity = 0;
    panel.style.visibility = 'collapse';
    panel.style.pointerEvents = 'none';

    if (initialHtml)
        panel.innerHTML = initialHtml;

    if (tooltipOnBottom)
        panel.style.top = '125%';
    else
        panel.style.bottom = '125%';

    if (reverseOrder) {
        /// specifically for the Search button
        if (configs.reverseTooltipButtonsOrder)
            panel.style.right = '0px';
        else
            panel.style.left = '0px';
    } else {
        if (configs.reverseTooltipButtonsOrder)
            panel.style.left = '0px';
        else
            panel.style.right = '0px';
    }

    /// Add shadow
    if (configs.addTooltipShadow) {
        panel.style.boxShadow = `0 1px 5px rgba(0,0,0,${configs.shadowOpacity / 1.5})`;
    }

    /// Check if panel will go off-screen on top
    const dxTransformValue = configs.reverseTooltipButtonsOrder || reverseOrder ? '-2px' : '2px';
    let panelOnBottom = false;

    if (tooltipOnBottom) {
        panelOnBottom = true;
        movePanelToBottom(panel);
        panel.style.transform = `translate(${dxTransformValue}, ${panelOnBottom ? -100 : 100}%)`;
    } else
        /// Check if panel will go off-screen
        setTimeout(function () {
            if (!tooltipIsShown) return;
            panelOnBottom = checkHoverPanelToOverflowOnTop(panel);
            panel.style.transform = `translate(${dxTransformValue}, ${panelOnBottom ? -100 : 100}%)`;

            /// Clip content on edge for better looking animation
            button.classList.add(panelOnBottom ? 'button-with-vertical-bottom-hover-panel' : 'button-with-vertical-top-hover-panel');
        }, 15);


    /// Set mouse listeners
    if (button) {
        let delayToRevealOnHover = configs.delayToRevealHoverPanels ?? 400;

        function revealPanel() {
            panel.style.visibility = 'visible';
            setTimeout(function () {
                panel.style.opacity = 1;
                panel.style.transform = `translate(${dxTransformValue},0)`;
            }, 2);

            setTimeout(function () {
                if (!panel || !tooltipIsShown) return;
                panel.style.pointerEvents = 'all';
            }, configs.animationDuration);
        }

        function hidePanel() {
            panel.style.transform = `translate(${dxTransformValue}, ${panelOnBottom ? -100 : 100}%)`;
            panel.style.opacity = 0.0;
            panel.style.pointerEvents = 'none';

            setTimeout(function () {
                if (!panel || !tooltipIsShown) return;
            }, configs.animationDuration)
        }

        let panelIsHovered = false;

        button.addEventListener('mouseover', function () {
            try {
                clearTimeout(timerToRemovePanel);
                clearTimeout(timeoutToRevealPanel);
            } catch (e) { }
            timerToRemovePanel = null;

            timeoutToRevealPanel = setTimeout(function () {
                revealPanel();
                hideHoverIndicator(hoverIndicator);
                if (onHoverCallback) onHoverCallback();
            }, delayToRevealOnHover);
        });

        button.addEventListener('mouseout', function () {
            clearTimeout(timeoutToRevealPanel);

            timerToRemovePanel = setTimeout(function () {
                if (!panel) return;
                if (panelIsHovered) return;

                hidePanel();
                showHoverIndicator(hoverIndicator);
            }, 100);
        });

        // panel.addEventListener('mouseover', function () {
        //     panelIsHovered = true;
        // });
        // panel.addEventListener('mouseout', function () {
        //     panelIsHovered = false;
        // });
    }

    return panel;
}

function checkHoverPanelToOverflowOnTop(panel) {
    /// check to hover panel overflow on screen top
    let panelRect = panel.getBoundingClientRect();

    // console.log(panel);
    // console.log(`${panelRect.top} - ${panel.clientHeight} `);
    // console.log(panelRect.top - panel.clientHeight);

    if (panelRect.top - panel.clientHeight - 12 < 5) {
        movePanelToBottom(panel);
        return true;
    } else return false;
}

function movePanelToBottom(panel) {
    panel.style.bottom = 'unset';
    panel.style.top = '125%';
    if (panel.parentNode)
        panel.parentNode.classList.add('higher-z-index');
}