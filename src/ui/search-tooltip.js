/// Create secondary tooltip for additional search engines
function createSecondaryTooltip() {
    if (searchButton == null || searchButton == undefined) return;

    secondaryTooltip = document.createElement('div');
    secondaryTooltip.className = 'secondary-selection-tooltip selecton-entity';
    secondaryTooltip.style.minWidth = `${searchButton.clientWidth}px`;
    secondaryTooltip.style.borderRadius = `${configs.useCustomStyle ? configs.borderRadius : 3}px`;
    secondaryTooltip.style.pointerEvents = 'none';
    secondaryTooltip.style.transformOrigin = configs.reverseTooltipButtonsOrder ? '100% 100% 0' : '0% 100% 0';

    /// Add shadow
    if (configs.addTooltipShadow) {
        secondaryTooltip.style.boxShadow = `0 1px 5px rgba(0,0,0,${configs.shadowOpacity / 1.5})`;
    }

    /// Add search buttons
    const searchButtonsLength = configs.customSearchButtons.length;
    if (searchButtonsLength == 0) return;

    const containerPrototype = document.createElement('div');
    containerPrototype.style.display = verticalSecondaryTooltip ? 'block' : 'inline-block';
    containerPrototype.style.textAlign = configs.reverseTooltipButtonsOrder ? 'end' : 'start';
    containerPrototype.className = 'custom-search-image-button';
    if (!verticalSecondaryTooltip) containerPrototype.style.padding = '0px';
    const maxIconsInRow = configs.maxIconsInRow;

    for (var i = 0; i < searchButtonsLength; i++) {
        var item = configs.customSearchButtons[i];

        const url = item['url'];
        const optionEnabled = item['enabled'];
        const title = item['title'];
        const icon = item['icon'];

        if (optionEnabled && url !== '') {
            let imgButton = document.createElement('img');
            imgButton.setAttribute('class', 'selecton-search-tooltip-icon');

            imgButton.addEventListener('error', function () {
                if (configs.debugMode) {
                    console.log('error loading favicon for: ' + url);
                    console.log('switching to fallback icon: ' + `https://api.faviconkit.com/${url.split('/')[2]}/16`);
                }

                /// Reserve service to load favicon
                imgButton.setAttribute("src", `https://api.faviconkit.com/${url.split('/')[2]}/16`);
            });

            imgButton.setAttribute('src', icon !== null && icon !== undefined && icon !== '' ? icon : 'https://www.google.com/s2/favicons?domain=' + url.split('/')[2])

            /// Set title
            let titleText = title !== null && title !== undefined && title !== '' ? title : returnDomainFromUrl(url);
            if (configs.showSecondaryTooltipTitleOnHover && url !== null && url !== undefined && url !== '')
                imgButton.setAttribute('title', titleText);

            const container = containerPrototype.cloneNode(true);

            /// Add label in vertical style
            if (verticalSecondaryTooltip) {
                container.appendChild(imgButton);

                const labelSpan = document.createElement('span');
                labelSpan.textContent = titleText.charAt(0).toUpperCase() + titleText.slice(1);
                if (configs.reverseTooltipButtonsOrder)
                    container.insertBefore(labelSpan, imgButton);
                else
                    container.appendChild(labelSpan);
            } else {
                /// No label in horizontal style
                imgButton.style.padding = '3px 6px';
                // container.style.padding = '0px';
                container.appendChild(imgButton);
            }

            if (!verticalSecondaryTooltip && (i % (maxIconsInRow) == 0) && i > 0) {
                secondaryTooltip.insertAdjacentHTML('beforeend', '<br />');
            }

            secondaryTooltip.appendChild(container);

            /// Set click listeners
            container.addEventListener("mousedown", function (e) {
                hideTooltip();
                let selectedText = selection.toString();
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
                    let evt = e || window.event;

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
    containerPrototype.remove();

    /// Set border radius for first and last buttons
    const borderRadiusForButton = configs.useCustomStyle ? configs.borderRadius : 3;

    const firstSearchButtonBorderRadius = verticalSecondaryTooltip ?
        `${borderRadiusForButton}px ${borderRadiusForButton}px 0px 0px`
        : firstButtonBorderRadius;

    const lastSearchButtonBorderRadius = verticalSecondaryTooltip ?
        `0px 0px ${borderRadiusForButton}px ${borderRadiusForButton}px`
        : lastButtonBorderRadius;


    let buttons = secondaryTooltip.children;
    buttons[0].style.borderRadius = firstSearchButtonBorderRadius;
    buttons[buttons.length - 1].style.borderRadius = lastSearchButtonBorderRadius;

    // if (i == 0) {
    //     (verticalSecondaryTooltip ? container : imgButton).style.borderRadius = firstSearchButtonBorderRadius;
    // } else if (i == searchButtonsLength - 1) {
    //     (verticalSecondaryTooltip ? container : imgButton).style.borderRadius = lastSearchButtonBorderRadius;
    // }

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
        // dy = tooltip.style.top;
        endDy = parseInt(dy.replaceAll('px', '')) - secondaryTooltip.clientHeight - paddingOnBottom;

        /// If tooltip is going off-screen on top, make it visible by manually placing on top of screen
        vertOutOfView = endDy <= 0;
        if (vertOutOfView || tooltipOnBottom) {
            /// Show secondary tooltip beneath the main one
            endDy = parseInt(dy.replaceAll('px', '')) + tooltip.clientHeight + paddingOnBottom;
            initialDy = verticalSecondaryTooltip ? endDy : dy;

            secondaryTooltip.style.transformOrigin = configs.reverseTooltipButtonsOrder ? '75% 0% 0' : '25% 0% 0';
            // secondaryTooltip.setAttribute('style', secondaryTooltip.getAttribute('style') + 'z-index: 10001 !important;');

            if (vertOutOfView)
                setTimeout(function () {
                    if (secondaryTooltip != null)
                        secondaryTooltip.classList.add('higher-z-index');
                }, 300)
        }

        initialDy = verticalSecondaryTooltip ? endDy : dy;
    }
    calculateEndDy();


    /// Set mouse listeners
    let timerToRemoveTooltip;

    // var timeoutToRevealSearchTooltip;
    searchButton.onmouseover = function (event) {
        if (secondaryTooltip == null) return;
        secondaryTooltip.style.transform = 'scale(1.0)';

        // timeoutToRevealSearchTooltip = timeout(function () {
        secondaryTooltip.style.pointerEvents = 'auto';
        calculateEndDy();
        secondaryTooltip.style.top = `${endDy}px`;
        secondaryTooltip.style.opacity = 1.0;
        searchButton.classList.add("hovered-tooltip-button");
        // }, 150);
        clearTimeout(timerToRemoveTooltip);
    }

    searchButton.onmouseout = function () {
        // clearTimeout(timeoutToRevealSearchTooltip);
        timerToRemoveTooltip = setTimeout(function () {
            if (isSecondaryTooltipHovered == false) {
                if (secondaryTooltip == null) return;
                calculateEndDy();
                secondaryTooltip.style.top = verticalSecondaryTooltip ? endDy : dy;
                secondaryTooltip.style.opacity = 0.0;
                secondaryTooltip.style.pointerEvents = 'none';
                searchButton.classList.remove("hovered-tooltip-button");

                setTimeout(function () {
                    if (secondaryTooltip == null) return;

                    if (isSecondaryTooltipHovered == false)
                        secondaryTooltip.style.transform = 'scale(0.0)';
                }, 300);
            }
        }, 100);
    }

    secondaryTooltip.onmouseover = function (event) {
        if (secondaryTooltip == null) return;
        secondaryTooltip.style.pointerEvents = 'auto';
        calculateEndDy();
        secondaryTooltip.style.top = `${endDy}px`;
        secondaryTooltip.style.opacity = 1.0;
        isSecondaryTooltipHovered = true;
        searchButton.classList.add("hovered-tooltip-button");
    }

    secondaryTooltip.onmouseout = function () {
        if (secondaryTooltip == null) return;
        isSecondaryTooltipHovered = false;
        calculateEndDy();
        secondaryTooltip.style.top = verticalSecondaryTooltip ? endDy : dy;
        secondaryTooltip.style.opacity = 0.0;
        secondaryTooltip.style.pointerEvents = 'none';
        searchButton.classList.remove("hovered-tooltip-button");
    }

    secondaryTooltip.style.transform = 'scale(0.0)';
    secondaryTooltip.style.top = initialDy;
    document.body.appendChild(secondaryTooltip);
    secondaryTooltip.style.left = configs.reverseTooltipButtonsOrder ? `${parseInt(dx.replaceAll('px', '')) + tooltip.clientWidth - secondaryTooltip.clientWidth}px` : dx;
}