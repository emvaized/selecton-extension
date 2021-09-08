/// Create secondary tooltip for additional search engines
function createSecondaryTooltip() {
    if (searchButton == null || searchButton == undefined) return;

    secondaryTooltip = document.createElement('div');
    secondaryTooltip.className = 'secondary-selection-tooltip selecton-entity';
    // secondaryTooltip.setAttribute('style', `background: ${configs.useCustomStyle ? configs.tooltipBackground : defaultBackgroundColor} !important`);
    secondaryTooltip.style.background = configs.useCustomStyle ? configs.tooltipBackground : defaultBackgroundColor;
    secondaryTooltip.style.minWidth = `${searchButton.clientWidth}px`;
    secondaryTooltip.style.borderRadius = `${configs.useCustomStyle ? configs.borderRadius : 3}px`;
    secondaryTooltip.style.pointerEvents = 'none';
    secondaryTooltip.style.transformOrigin = configs.reverseTooltipButtonsOrder ? '100% 100% 0' : '0% 100% 0';

    /// Add shadow
    if (configs.addTooltipShadow) {
        secondaryTooltip.style.boxShadow = `0 1px 5px rgba(0,0,0,${configs.shadowOpacity / 1.5})`;
    }

    /// Add search buttons
    for (var i = 0; i < configs.customSearchButtons.length; i++) {
        var item = configs.customSearchButtons[i];

        const url = item['url'];
        const optionEnabled = item['enabled'];
        const title = item['title'];
        const icon = item['icon'];

        if (optionEnabled && url !== '') {
            var imgButton = document.createElement('img');
            imgButton.addEventListener('error', function () {
                if (configs.debugMode) {
                    console.log('error loading favicon for: ' + url);
                    console.log('switching to fallback icon: ' + `https://api.faviconkit.com/${url.split('/')[2]}/16`);
                }

                /// Reserve service to load favicon
                favicon.setAttribute("src", `https://api.faviconkit.com/${url.split('/')[2]}/16`);
            });
            imgButton.setAttribute('src', icon !== null && icon !== undefined && icon !== '' ? icon : 'https://www.google.com/s2/favicons?domain=' + url.split('/')[2])
            imgButton.setAttribute('width', `${configs.secondaryTooltipIconSize}px`);
            imgButton.setAttribute('height', `${configs.secondaryTooltipIconSize}px`);
            imgButton.style.maxHeight = `${configs.secondaryTooltipIconSize}px`;
            imgButton.style.filter = 'none';

            /// Set title
            if (url !== null && url !== undefined && url !== '') {
                var titleText = title !== null && title !== undefined && title !== '' ? title : returnDomainFromUrl(url);
                imgButton.setAttribute('title', titleText);
            }

            let container = document.createElement('div');

            /// Add label in vertical style
            if (verticalSecondaryTooltip) {
                container.setAttribute('style', `display: ${verticalSecondaryTooltip ? 'block' : 'inline'};`);
                container.style.textAlign = configs.reverseTooltipButtonsOrder ? 'end' : 'start';
                container.setAttribute('class', 'custom-search-image-button');
                container.appendChild(imgButton);

                let labelSpan = document.createElement('span');
                labelSpan.innerHTML = titleText.charAt(0).toUpperCase() + titleText.slice(1);
                labelSpan.setAttribute('style', 'display: inline; vertical-align: top; opacity: 0.75; padding: 2px 5px;');
                if (configs.reverseTooltipButtonsOrder)
                    container.insertBefore(labelSpan, imgButton);
                else
                    container.appendChild(labelSpan);

                secondaryTooltip.appendChild(container);

            } else {
                imgButton.setAttribute('class', 'custom-search-image-button');
                secondaryTooltip.appendChild(imgButton);
            }

            /// Set border radius for first and last buttons
            let borderRadiusForButton = configs.useCustomStyle ? configs.borderRadius : 3;

            let firstSearchButtonBorderRadius = verticalSecondaryTooltip ?
                `${borderRadiusForButton}px ${borderRadiusForButton}px 0px 0px`
                : firstButtonBorderRadius;

            let lastSearchButtonBorderRadius = verticalSecondaryTooltip ?
                ` 0px 0px ${borderRadiusForButton}px ${borderRadiusForButton}px`
                : lastButtonBorderRadius;

            if (i == 0) {
                (verticalSecondaryTooltip ? container : imgButton).style.borderRadius = firstSearchButtonBorderRadius;
            } else if (i == configs.customSearchButtons.length - 1) {
                (verticalSecondaryTooltip ? container : imgButton).style.borderRadius = lastSearchButtonBorderRadius;
            }

            /// Set click listeners
            (verticalSecondaryTooltip ? container : imgButton).addEventListener("mousedown", function (e) {
                hideTooltip();
                var selectedText = selection.toString();

                selectedText = encodeURI(selectedText);
                selectedText = selectedText.replaceAll('&', '%26');

                let urlToOpen = url.replaceAll('%s', selectedText);

                try {
                    let currentDomain = window.location.href.split('/')[2];
                    urlToOpen = urlToOpen.replaceAll('%w', currentDomain);
                } catch (e) {
                    if (configs.debugMode) console.log(e);
                }

                removeSelectionOnPage();

                try {
                    var evt = e || window.event;

                    if ("buttons" in evt) {
                        if (evt.buttons == 1) {
                            /// Left button click
                            chrome.runtime.sendMessage({ type: 'selecton-open-new-tab', url: urlToOpen, focused: true });
                        } else if (evt.buttons == 4) {
                            /// Middle button click
                            evt.preventDefault();
                            chrome.runtime.sendMessage({ type: 'selecton-open-new-tab', url: urlToOpen, focused: false });
                        }
                    }
                } catch (e) {
                    window.open(urlToOpen, '_blank');
                }
            });
        }
    }

    setTimeout(function () {
        appendSecondaryTooltip();
    }, configs.animationDuration / 2);
}

function appendSecondaryTooltip() {
    if (tooltip == null) return;

    var isSecondaryTooltipHovered = false;

    let paddingOnBottom = 5;
    let dx = tooltip.style.left;
    let dy = tooltip.style.top;
    let endDy, initialDy, vertOutOfView;

    function calculateEndDy() {
        endDy = parseInt(dy.replaceAll('px', '')) - secondaryTooltip.clientHeight - paddingOnBottom;

        /// If tooltip is going off-screen on top, make it visible by manually placing on top of screen
        vertOutOfView = endDy <= 0;
        if (vertOutOfView) {
            /// Show secondary tooltip beneath the main one
            endDy = parseInt(dy.replaceAll('px', '')) + tooltip.clientHeight + paddingOnBottom;
            initialDy = verticalSecondaryTooltip ? endDy : dy;

            secondaryTooltip.style.transformOrigin = configs.reverseTooltipButtonsOrder ? '75% 0% 0' : '25% 0% 0';
            // secondaryTooltip.setAttribute('style', secondaryTooltip.getAttribute('style') + 'z-index: 10001 !important;');
            secondaryTooltip.classList.add('higher-z-index');
        }

        initialDy = verticalSecondaryTooltip ? endDy : dy;
    }
    calculateEndDy();

    secondaryTooltip.style.top = initialDy;
    secondaryTooltip.style.left = configs.reverseTooltipButtonsOrder ? `${parseInt(dx.replaceAll('px', '')) + tooltip.clientWidth - secondaryTooltip.clientWidth}px` : dx;
    secondaryTooltip.style.transform = 'scale(0.0)';

    // var timeoutToRevealSearchTooltip;

    searchButton.onmouseover = function (event) {
        secondaryTooltip.style.transform = 'scale(1.0)';

        // timeoutToRevealSearchTooltip = timeout(function () {
        secondaryTooltip.style.pointerEvents = 'auto';
        calculateEndDy();
        secondaryTooltip.style.top = `${endDy}px`;
        secondaryTooltip.style.opacity = 1.0;
        searchButton.classList.add("hovered-tooltip-button");
        // }, 150);
    }

    searchButton.onmouseout = function () {
        // clearTimeout(timeoutToRevealSearchTooltip);

        setTimeout(function () {
            if (isSecondaryTooltipHovered == false) {
                calculateEndDy();
                secondaryTooltip.style.top = verticalSecondaryTooltip ? endDy : dy;
                secondaryTooltip.style.opacity = 0.0;

                searchButton.classList.remove("hovered-tooltip-button");

                setTimeout(function () {
                    if (isSecondaryTooltipHovered == false)
                        secondaryTooltip.style.transform = 'scale(0.0)';
                }, 300);
            }
        }, 50);

    }
    /// Add some bottom space to prevent unwanted jumping on moving cursor
    var space = document.createElement('div');
    space.setAttribute('class', `secondary-selection-tooltip-bottom-div`);
    space.style.width = `${secondaryTooltip.clientWidth}px`;
    space.style.height = `${paddingOnBottom * 2}px`;
    if (vertOutOfView)
        space.style.top = `-${paddingOnBottom * 2}px`;
    else
        space.style.bottom = `-${paddingOnBottom * 2}px`;
    secondaryTooltip.appendChild(space);

    secondaryTooltip.onmouseover = function (event) {
        secondaryTooltip.style.pointerEvents = 'auto';
        calculateEndDy();
        secondaryTooltip.style.top = `${endDy}px`;
        secondaryTooltip.style.opacity = 1.0;
        isSecondaryTooltipHovered = true;

        searchButton.classList.add("hovered-tooltip-button");
    }

    secondaryTooltip.onmouseout = function () {
        isSecondaryTooltipHovered = false;
        calculateEndDy();
        secondaryTooltip.style.top = verticalSecondaryTooltip ? endDy : dy;
        secondaryTooltip.style.opacity = 0.0;
        secondaryTooltip.style.pointerEvents = 'none';

        searchButton.classList.remove("hovered-tooltip-button");
    }

    //oldSecondaryTooltips.push(secondaryTooltip)
    document.body.appendChild(secondaryTooltip);
}