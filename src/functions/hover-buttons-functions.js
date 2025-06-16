/// Functions used for buttons with on-hover functionality
/// First of all, Live translate and Dictionary buttons

function addAstrixToHoverButton(button) {
    if (configs.showDotForHoverButtons == false) return;

    /// add astrix indicator when hover enabled
    const astrix = document.createElement('span');
    astrix.className = 'selecton-hover-button-indicator';
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


function createHoverPanelForButton(button, initialHtml, onHoverCallback, reverseOrder = false, revealAfterDelay = true, pinOnClick = false, unknownHeight = true, staticPanelMode = false) {
    let timerToRemovePanel, timeoutToRevealPanel;
    let hoverIndicator = revealAfterDelay ? addAstrixToHoverButton(button) : undefined;
    const staticPanelVerticalShift = configs.showInfoPanel ? '107%' : '112%';

    /// Set panel
    let panel = document.createElement('div');
    panel.className = 'hover-vertical-tooltip selecton-entity';
    panel.style.borderRadius = `${configs.useCustomStyle ? configs.borderRadius : 3}px`;
    panel.style.opacity = 0;
    panel.style.visibility = 'collapse';
    panel.style.width = '0px';
    // panel.style.display = 'none';
    panel.style.pointerEvents = 'none';
    panel.style.width = 'max-content';

    if (initialHtml)
        panel.innerHTML = initialHtml;

    if (tooltipOnBottom)
        panel.style.top = staticPanelMode ? staticPanelVerticalShift : '125%';
    else
        panel.style.bottom = staticPanelMode ? staticPanelVerticalShift : '125%';

    if (reverseOrder) {
        /// specially for the Search button
        panel.style.left = '0px';
    } else {
        panel.style.right = '0px';
    }

    /// Add panel shadow
    if (configs.addTooltipShadow) {
        panel.style.boxShadow = `0 1px 5px rgba(0,0,0,${configs.shadowOpacity / 1.5})`;
    }

    /// Checks to execute after panel was added to the DOM
    let dxTransformValue = configs.verticalLayoutTooltip ? '2px' :
        (reverseOrder ? '-2px' : '2px');
    let panelOnBottom = false;

    setTimeout(function () {
        // if (!tooltipIsShown) return;
        if (!panel.isConnected) return;

        /// Check if panel will go off-screen
        /// TODO: Refactor to work with display: none on panel attached to DOM
        if (!configs.verticalLayoutTooltip) {
            if (tooltipOnBottom) {
                panelOnBottom = true;
                movePanelToBottom(panel, button);
            } else {
                panelOnBottom = checkHoverPanelToOverflowOnTop(panel, button);
            }

            /// Clip content on edge for better looking animation
            if (unknownHeight && button)
                button.classList.add(panelOnBottom ? 'button-with-bottom-hover-panel' : 'button-with-top-hover-panel');
        }

        /// Set initial transform position for panel
        panel.style.transform = configs.verticalLayoutTooltip ? `translate(-100%, 0)` : `translate(${dxTransformValue}, ${panelOnBottom ? -100 : 100}%)`;
    }, configs.animationDuration);

    /// Show panel initially
    if (staticPanelMode)
        setTimeout(()=>{
            if (button) button.classList.toggle('highlighted-popup-button');
            revealHoverPanel(panel, dxTransformValue);
            if (revealAfterDelay) hideHoverIndicator(hoverIndicator);
            if (onHoverCallback) onHoverCallback();
        }, configs.animationDuration)

    /// Set mouse listeners
    if (button) {
        const delayToRevealOnHover = revealAfterDelay ? (configs.delayToRevealHoverPanels ?? 700) : 3;
        let panelIsPinned = false;

        if (pinOnClick)
            button.addEventListener('mousedown', function (e) {
                e.stopPropagation();
                panelIsPinned = !panelIsPinned;
                button.classList.toggle('highlighted-popup-button');
            });

        button.addEventListener('mouseover', function () {
            try {
                clearTimeout(timerToRemovePanel);
                clearTimeout(timeoutToRevealPanel);
            } catch (e) { }
            timerToRemovePanel = null;

            timeoutToRevealPanel = setTimeout(function () {
                revealHoverPanel(panel, dxTransformValue);
                if (revealAfterDelay) hideHoverIndicator(hoverIndicator);
                if (onHoverCallback) onHoverCallback();
            }, delayToRevealOnHover);
        });

        button.addEventListener('mouseout', function () {
            if (panelIsPinned) return;
            clearTimeout(timeoutToRevealPanel);

            timerToRemovePanel = setTimeout(function () {
                if (!panel) return;

                hideHoverPanel(panel, dxTransformValue, panelOnBottom);
                if (revealAfterDelay) showHoverIndicator(hoverIndicator);
            }, 150);
        });

        button.addEventListener('mousedown', function (e) {
            try {
                clearTimeout(timeoutToRevealPanel);
            } catch (e) { }
        })
    }

    function checkHoverPanelToOverflowOnTop(panel, button) {
        /// check to hover panel overflow on screen top
        try {
            if (panel.getBoundingClientRect().top < 0) {
                movePanelToBottom(panel, button);
                return true;
            } else return false;
        } catch (e) { return false; }
    }
    
    function movePanelToBottom(panel, button) {
        panel.style.bottom = 'unset';
        panel.style.top = staticPanelMode ? staticPanelVerticalShift : '125%';
    
        if (button)
            button.classList.add('higher-z-index');
        else if (panel.parentNode)
            panel.parentNode.classList.add('higher-z-index');
    }
    
    function checkHoverPanelHorizontalOverflow(panel) {
        try {
            const panRect = panel.getBoundingClientRect();
            /// check overflow on right screen edge
            const rightOverflow = window.innerWidth - panRect.left - (panRect.width * 2);
            if (rightOverflow < 0) {
                if (configs.verticalLayoutTooltip){
                    panel.style.transform = 'translate(-215%, 0)';
                }
                return true;
            } else if(panRect.left < 0){
                /// check overflow on left screen edge
                panel.style.right = `${panRect.left}px`;
            } else return false;
        } catch (e) { return false; }
    }
    
    
    function revealHoverPanel(panel, dxTransformValue) {
        if (panel.style.opacity > 0) return;
        panel.style.width = 'max-content';
        panel.style.visibility = 'visible';
        // panel.style.display = 'block';
    
        setTimeout(function () {
            panel.style.opacity = 1;
            panel.style.transform = `translate(${dxTransformValue},0)`;
    
            // if (configs.verticalLayoutTooltip || staticPanelMode) 
                checkHoverPanelHorizontalOverflow(panel);

            setTimeout(function () {
                if (!panel || !tooltipIsShown) return;
                panel.style.pointerEvents = 'all';
            }, configs.animationDuration);
        }, 3);
    }
    
    function hideHoverPanel(panel, dxTransformValue, panelOnBottom) {
        panel.style.transform = configs.verticalLayoutTooltip ? `translate(-100%, 0)` : `translate(${dxTransformValue}, ${panelOnBottom ? -100 : 100}%)`;
        panel.style.opacity = 0.0;
        panel.style.pointerEvents = 'none';
       
        setTimeout(function () {
            if (!panel || !tooltipIsShown) return;
            panel.style.width = '0';
            panel.style.visibility = 'collapse';
            // panel.style.display = 'none';
        }, configs.animationDuration);
    }

    return panel;
}