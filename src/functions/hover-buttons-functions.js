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


function createHoverPanelForButton(button, initialHtml, onHoverCallback, reverseOrder = false, revealAfterDelay = true, pinOnClick = false, unknownHeight = true) {
    let timerToRemovePanel, timeoutToRevealPanel;
    const hoverIndicator = revealAfterDelay ? addAstrixToHoverButton(button) : undefined;

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
        /// specially for the Search button
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

    /// Add panel shadow
    if (configs.addTooltipShadow) {
        panel.style.boxShadow = `0 1px 5px rgba(0,0,0,${configs.shadowOpacity / 1.5})`;
    }

    /// Checks to execute after panel was added to the DOM
    let dxTransformValue = configs.reverseTooltipButtonsOrder || reverseOrder ? '-2px' : '2px';
    let panelOnBottom = false;

    setTimeout(function () {
        if (!tooltipIsShown) return;

        /// Check if panel will go off-screen
        if (tooltipOnBottom) {
            panelOnBottom = true;
            movePanelToBottom(panel);
        } else {
            panelOnBottom = checkHoverPanelToOverflowOnTop(panel);
        }

        /// Clip content on edge for better looking animation
        if (unknownHeight)
            button.classList.add(panelOnBottom ? 'button-with-bottom-hover-panel' : 'button-with-top-hover-panel');

        /// If button is not alone in the tooltip, and located in the start, align hover panel to the left
        if (!reverseOrder) {
            let parentButtons = button.parentNode.children;
            if (parentButtons.length < 2) return;

            let positionOfButton = Array.prototype.indexOf.call(parentButtons, button);

            if (positionOfButton == 0) {
                panel.style.left = '0px';
                panel.style.right = 'unset';
                dxTransformValue = '-2px';
            }
        }

        /// Set initial transform position for panel
        panel.style.transform = `translate(${dxTransformValue}, ${panelOnBottom ? -100 : 100}%)`;
    }, 15);


    /// Set mouse listeners
    if (button) {
        let delayToRevealOnHover = revealAfterDelay ? (configs.delayToRevealHoverPanels ?? 400) : 0;
        let panelIsPinned = false;

        if (pinOnClick)
            button.addEventListener('click', function () {
                panelIsPinned = !panelIsPinned;

                // if (panelIsPinned)
                button.classList.toggle('highlighted-popup-button');
                // else 
                // button.classList.add('highlighted-popup-button');
            });

        function revealPanel() {
            panel.style.visibility = 'visible';
            setTimeout(function () {
                panel.style.opacity = 1;
                panel.style.transform = `translate(${dxTransformValue},0)`;
            }, 3);

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
                if (revealAfterDelay) hideHoverIndicator(hoverIndicator);
                if (onHoverCallback) onHoverCallback();
            }, delayToRevealOnHover);
        });

        button.addEventListener('mouseout', function () {
            if (panelIsPinned) return;
            clearTimeout(timeoutToRevealPanel);

            timerToRemovePanel = setTimeout(function () {
                if (!panel) return;
                if (panelIsHovered) return;

                hidePanel();
                if (revealAfterDelay) showHoverIndicator(hoverIndicator);
            }, 100);
        });
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