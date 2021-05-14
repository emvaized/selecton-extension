/// Create secondary tooltip for custom search engines

var secondaryTooltipHeight;

function createSecondaryTooltip() {
    secondaryTooltip = document.createElement('div');
    secondaryTooltip.setAttribute('class', 'secondary-selection-tooltip');
    secondaryTooltip.style.backgroundColor = configs.useCustomStyle ? configs.tooltipBackground : defaultBackgroundColor;
    secondaryTooltip.style.minWidth = `${searchButton.clientWidth}px`;
    secondaryTooltip.style.borderRadius = `${configs.borderRadius}px`;
    secondaryTooltip.style.pointerEvents = 'none';
    secondaryTooltip.style.transformOrigin = configs.reverseTooltipButtonsOrder ? '75% 100% 0' : '25% 100% 0';

    document.body.appendChild(secondaryTooltip);

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

        if (optionEnabled) {
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

            /// Set border radius for first and last buttons
            if (i == 0) {
                imgButton.style.borderRadius = firstButtonBorderRadius;
            } else if (i == configs.customSearchButtons.length - 1) {
                imgButton.style.borderRadius = lastButtonBorderRadius;
            }

            let container = document.createElement('div');

            /// Add label in vertical style
            if (configs.verticalSecondaryTooltip) {
                container.setAttribute('style', `display: ${configs.verticalSecondaryTooltip ? 'block' : 'inline'};`);
                container.style.textAlign = configs.reverseTooltipButtonsOrder ? 'end' : 'start';
                container.setAttribute('class', 'custom-search-image-button');
                container.appendChild(imgButton);

                let labelSpan = document.createElement('span');
                labelSpan.innerHTML = titleText.charAt(0).toUpperCase() + titleText.slice(1);
                labelSpan.setAttribute('style', 'display: inline; vertical-align: top; opacity: 0.75; padding: 2px 5px;');
                container.appendChild(labelSpan);
                secondaryTooltip.appendChild(container);

            } else {
                imgButton.setAttribute('class', 'custom-search-image-button');
                secondaryTooltip.appendChild(imgButton);
            }

            /// Set click listeners
            (configs.verticalSecondaryTooltip ? container : imgButton).addEventListener("mousedown", function (e) {
                hideTooltip();
                var selectedText = selection.toString();
                let urlToOpen = url.replaceAll('%s', selectedText);

                try {
                    let currentDomain = window.location.href.split('/')[2];
                    urlToOpen = urlToOpen.replaceAll('%w', currentDomain);
                } catch (e) {
                    if (configs.debugMode) console.log(e);
                }

                urlToOpen = encodeURI(urlToOpen);
                urlToOpen = urlToOpen.replaceAll('&', '%26');

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
    }, 50);
}

function appendSecondaryTooltip() {
    if (tooltip == null) return;

    var paddingOnBottom = 3;
    var isSecondaryTooltipHovered = false;

    var dx = tooltip.style.left;
    var dy = tooltip.style.top;

    let endDy = parseInt(dy.replaceAll('px', '')) - secondaryTooltip.clientHeight - paddingOnBottom;
    let initialDy = configs.verticalSecondaryTooltip ? endDy : dy;

    /// If tooltip is going off-screen on top, make it visible by manually placing on top of screen
    let vertOutOfView = endDy <= window.scrollY;
    if (vertOutOfView) {
        /// Show secondary tooltip beneath the main one
        endDy = parseInt(dy.replaceAll('px', '')) + tooltip.clientHeight + paddingOnBottom;
        initialDy = configs.verticalSecondaryTooltip ? endDy : dy;

        secondaryTooltip.style.transformOrigin = configs.reverseTooltipButtonsOrder ? '75% 0% 0' : '25% 0% 0';

        secondaryTooltip.setAttribute('style', secondaryTooltip.getAttribute('style') + 'z-index: 10001 !important;');
    }

    // secondaryTooltip.style.top = configs.verticalSecondaryTooltip ? parseInt(dy.replaceAll('px', '')) - secondaryTooltip.clientHeight - paddingOnBottom : dy;
    secondaryTooltip.style.top = initialDy;
    secondaryTooltip.style.left = configs.reverseTooltipButtonsOrder ? `${parseInt(dx.replaceAll('px', '')) + tooltip.clientWidth - secondaryTooltip.clientWidth}px` : dx;

    if (configs.verticalSecondaryTooltip)
        secondaryTooltip.style.transform = 'scale(0.0, 0.0)';

    searchButton.onmouseover = function (event) {
        secondaryTooltip.style.pointerEvents = 'auto';

        secondaryTooltip.style.top = `${endDy}px`;
        secondaryTooltip.style.opacity = 1.0;

        if (configs.verticalSecondaryTooltip)
            secondaryTooltip.style.transform = 'scale(1.0, 1.0)';
    }
    searchButton.onmouseout = function () {
        if (isSecondaryTooltipHovered == false) {
            // secondaryTooltip.style.top = dy;
            secondaryTooltip.style.top = configs.verticalSecondaryTooltip ? endDy : dy;
            secondaryTooltip.style.opacity = 0.0;

            if (configs.verticalSecondaryTooltip)
                secondaryTooltip.style.transform = 'scale(0.0, 0.0)';
        }
    }
    secondaryTooltip.onmouseover = function (event) {
        secondaryTooltip.style.pointerEvents = 'auto';

        secondaryTooltip.style.top = `${endDy}px`;
        secondaryTooltip.style.opacity = 1.0;
        isSecondaryTooltipHovered = true;

        if (configs.verticalSecondaryTooltip)
            secondaryTooltip.style.transform = 'scale(1.0, 1.0)';
    }

    secondaryTooltip.onmouseout = function () {
        isSecondaryTooltipHovered = false;

        secondaryTooltip.style.top = configs.verticalSecondaryTooltip ? endDy : dy;
        secondaryTooltip.style.opacity = 0.0;
        secondaryTooltip.style.pointerEvents = 'none';

        if (configs.verticalSecondaryTooltip)
            secondaryTooltip.style.transform = 'scale(0.0, 0.0)';
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
}