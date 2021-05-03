/// Create secondary tooltip for custom search engines

var secondaryTooltipHeight;

function createSecondaryTooltip() {
    secondaryTooltip = document.createElement('div');
    secondaryTooltip.setAttribute('class', 'secondary-selection-tooltip');
    secondaryTooltip.style.backgroundColor = configs.useCustomStyle ? configs.tooltipBackground : defaultBackgroundColor;
    secondaryTooltip.style.minWidth = `${searchButton.clientWidth}px`;
    secondaryTooltip.style.borderRadius = `${configs.borderRadius}px`;
    secondaryTooltip.style.pointerEvents = 'none';

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
            imgButton.setAttribute('src', icon !== null && icon !== undefined && icon !== '' ? icon : 'https://www.google.com/s2/favicons?domain=' + url.split('/')[2])
            imgButton.setAttribute('width', `${configs.secondaryTooltipIconSize}px`);
            imgButton.setAttribute('height', `${configs.secondaryTooltipIconSize}px`);
            imgButton.style.maxHeight = `${configs.secondaryTooltipIconSize}px`;

            /// Add title tooltip on hover
            if (url !== null && url !== undefined && url !== '') {
                var domainContent = url.split('.');
                var titleText;

                if (domainContent.length == 2) {
                    titleText = domainContent[0];
                } else if (domainContent.length == 3) {
                    if (domainContent[1].includes('/'))
                        titleText = domainContent[0];
                    else
                        titleText = domainContent[1];
                } else {
                    titleText = domain.textContent.split('/')[2].split('.')[0];
                }
                titleText = titleText.replaceAll('https://', '');

                imgButton.setAttribute('title', titleText.charAt(0).toUpperCase() + titleText.slice(1));
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
                // container.addEventListener("mousedown", function (e) {
                hideTooltip();
                var selectedText = selection.toString();
                let urlToOpen = url.replaceAll('%s', selectedText);
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


    var paddingOnBottom = 3;

    var isSecondaryTooltipHovered = false;

    var dx = tooltip.style.left;
    var dy = tooltip.style.top;

    secondaryTooltip.style.left = dx;
    secondaryTooltip.style.top = configs.verticalSecondaryTooltip ? parseInt(dy.replaceAll('px', '')) - secondaryTooltip.clientHeight - paddingOnBottom : dy;

    if (configs.verticalSecondaryTooltip)
        secondaryTooltip.style.transform = 'scale(0.0, 0.0)';

    searchButton.onmouseover = function (event) {
        secondaryTooltip.style.pointerEvents = 'auto';

        let endDy = parseInt(dy.replaceAll('px', '')) - secondaryTooltip.clientHeight - paddingOnBottom;
        secondaryTooltip.style.top = `${endDy}px`;
        secondaryTooltip.style.opacity = 1.0;

        if (configs.verticalSecondaryTooltip)
            secondaryTooltip.style.transform = 'scale(1.0, 1.0)';
    }
    searchButton.onmouseout = function () {
        if (isSecondaryTooltipHovered == false) {
            // secondaryTooltip.style.top = dy;
            let endDy = parseInt(dy.replaceAll('px', '')) - secondaryTooltip.clientHeight - paddingOnBottom;
            secondaryTooltip.style.top = configs.verticalSecondaryTooltip ? endDy : dy;
            secondaryTooltip.style.opacity = 0.0;

            if (configs.verticalSecondaryTooltip)
                secondaryTooltip.style.transform = 'scale(0.0, 0.0)';
        }
    }
    secondaryTooltip.onmouseover = function (event) {
        secondaryTooltip.style.pointerEvents = 'auto';
        let endDy = parseInt(dy.replaceAll('px', '')) - secondaryTooltip.clientHeight - paddingOnBottom;
        secondaryTooltip.style.top = `${endDy}px`;
        secondaryTooltip.style.opacity = 1.0;
        isSecondaryTooltipHovered = true;

        if (configs.verticalSecondaryTooltip)
            secondaryTooltip.style.transform = 'scale(1.0, 1.0)';
    }

    secondaryTooltip.onmouseout = function () {
        isSecondaryTooltipHovered = false;
        let endDy = parseInt(dy.replaceAll('px', '')) - secondaryTooltip.clientHeight - paddingOnBottom;

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
    space.style.bottom = `-${paddingOnBottom * 2}px`;
    secondaryTooltip.appendChild(space);
}