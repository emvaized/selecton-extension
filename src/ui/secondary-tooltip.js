/// Create secondary tooltip for custom search engines
function createSecondaryTooltip() {
    secondaryTooltip = document.createElement('div');
    secondaryTooltip.setAttribute('class', 'secondary-selection-tooltip');
    secondaryTooltip.style.backgroundColor = tooltipBackground;
    secondaryTooltip.style.minWidth = `${searchButton.clientWidth}px`;
    secondaryTooltip.style.borderRadius = `${borderRadius}px`;
    secondaryTooltip.style.pointerEvents = 'none';

    document.body.appendChild(secondaryTooltip);

    /// Add shadow
    // if (addTooltipShadow) {
    //   secondaryTooltip.style.boxShadow = `0 1px 5px rgba(0,0,0,${shadowOpacity / 1.5})`;
    //   // secondaryTooltip.style.boxShadow = `1px 1px 3px rgba(0,0,0,${shadowOpacity / 1.5})`;
    // }

    var dx = tooltip.style.left;
    var dy = tooltip.style.top;
    secondaryTooltip.style.left = dx;
    secondaryTooltip.style.top = dy;

    /// Add search buttons
    for (var i = 0; i < customSearchButtons.length; i++) {
        var item = customSearchButtons[i];

        const url = item['url'];
        const optionEnabled = item['enabled'];
        const title = item['title'];
        const icon = item['icon'];

        if (optionEnabled) {
            var imgButton = document.createElement('img');
            imgButton.setAttribute('class', 'custom-search-image-button');
            imgButton.setAttribute('src', icon !== null && icon !== undefined && icon !== '' ? icon : 'https://www.google.com/s2/favicons?domain=' + url.split('/')[2])
            imgButton.setAttribute('width', `${secondaryTooltipIconSize}px`);
            imgButton.setAttribute('height', `${secondaryTooltipIconSize}px`);
            imgButton.style.maxHeight = `${secondaryTooltipIconSize}px`;

            /// Add title tooltip on hover
            if (showSecondaryTooltipTitleOnHover && url !== null && url !== undefined && url !== '') {
                var titleText;
                var domainContent = url.split('.');

                if (domainContent.length == 2) {
                    titleText = domainContent[0];
                } else if (domainContent.length == 3) {
                    titleText = domainContent[1];

                } else {
                    titleText = domain.textContent.replace(/.+\/\/|www.|\..+/g, '');
                }
                titleText = titleText.replaceAll('https://', '');
                imgButton.setAttribute('title', titleText.charAt(0).toUpperCase() + titleText.slice(1));
            }

            /// Set border radius for first and last buttons
            if (i == 0) {
                imgButton.style.borderRadius = firstButtonBorderRadius;
            } else if (i == customSearchButtons.length - 1) {
                imgButton.style.borderRadius = lastButtonBorderRadius;
            }

            /// Set click listeners
            imgButton.addEventListener("mousedown", function (e) {
                hideTooltip();
                var selectedText = selection.toString();
                removeSelectionOnPage();
                setTimeout(
                    function () {
                        window.open(url.replaceAll('%s', selectedText), '_blank');
                    }, 1
                );
            });
            secondaryTooltip.appendChild(imgButton);
        }
    }

    var paddingOnBottom = 3;

    var isSecondaryTooltipHovered = false;

    searchButton.onmouseover = function (event) {
        secondaryTooltip.style.pointerEvents = 'auto';
        secondaryTooltip.style.top = `${parseInt(dy.replaceAll('px', '')) - secondaryTooltip.clientHeight - paddingOnBottom}px`;
        secondaryTooltip.style.opacity = 1.0;
    }
    searchButton.onmouseout = function () {
        if (isSecondaryTooltipHovered == false) {
            secondaryTooltip.style.top = dy;
            secondaryTooltip.style.opacity = 0.0;
        }
    }
    secondaryTooltip.onmouseover = function (event) {
        secondaryTooltip.style.pointerEvents = 'auto';
        secondaryTooltip.style.top = `${parseInt(dy.replaceAll('px', '')) - secondaryTooltip.clientHeight - paddingOnBottom}px`;
        secondaryTooltip.style.opacity = 1.0;
        isSecondaryTooltipHovered = true;
    }
    secondaryTooltip.onmouseout = function () {
        isSecondaryTooltipHovered = false;
        secondaryTooltip.style.top = dy;
        secondaryTooltip.style.opacity = 0.0;
        secondaryTooltip.style.pointerEvents = 'none';
    }


    /// Add some bottom space to prevent unwanted jumping on moving cursor
    var space = document.createElement('div');
    space.setAttribute('class', `secondary-selection-tooltip-bottom-div`);
    space.style.width = `${secondaryTooltip.clientWidth}px`;
    space.style.height = `${paddingOnBottom * 2}px`;
    space.style.bottom = `-${paddingOnBottom * 2}px`;
    secondaryTooltip.appendChild(space);
}