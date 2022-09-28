
function setHoverForSearchButton(searchButton) {
    /// Create search options panel
    let searchPanel = createHoverPanelForButton(searchButton, undefined, undefined, true);
    searchPanel.classList.add('no-padding-tooltip');
    searchPanel.style.textAlign = configs.reverseTooltipButtonsOrder ? 'end' : 'start';

    /// Generate buttons for panel
    let searchButtons = configs.customSearchButtons.filter((item, idx) => item['enabled']);

    const searchButtonsLength = searchButtons.length;
    if (searchButtonsLength == 0) return;

    const containerPrototype = document.createElement('div');
    containerPrototype.style.display = verticalSecondaryTooltip ? 'block' : 'inline-block';
    containerPrototype.style.textAlign = configs.reverseTooltipButtonsOrder ? 'end' : 'start';
    containerPrototype.className = 'custom-search-image-button';
    if (!verticalSecondaryTooltip) containerPrototype.style.padding = '0px';
    const maxIconsInRow = configs.maxIconsInRow;

    for (var i = 0; i < searchButtonsLength; i++) {
        const item = searchButtons[i];

        const url = item['url'];
        const optionEnabled = item['enabled'];
        const title = item['title'];
        const icon = item['icon'];

        if (optionEnabled && url !== '') {
            let imgButton = document.createElement('img');
            imgButton.setAttribute('class', 'selecton-search-tooltip-icon');

            imgButton.addEventListener('error', function () {
                if (configs.debugMode) {
                    console.log('error loading favicon for: ' + url + ' because of security policies of website');
                }
            });

            imgButton.setAttribute('src', icon !== null && icon !== undefined && icon !== '' ? icon : 'https://www.google.com/s2/favicons?domain=' + url.split('/')[2])

            /// Set title
            let titleText = title !== null && title !== undefined && title !== '' ? title : returnDomainFromUrl(url);
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
                imgButton.style.margin = '3px 6px';
                imgButton.title = titleText;
                container.appendChild(imgButton);
            }

            searchPanel.appendChild(container);

            /// Set click listeners
            container.addEventListener("mousedown", function (e) {
                e.stopPropagation();
                onSearchButtonClick(e, url);
            });
        }
    }

    containerPrototype.remove();

    /// Create grid style to horizontal panel, to limit amount of icons in row
    if (!verticalSecondaryTooltip && searchButtonsLength > maxIconsInRow) {
        searchPanel.style.display = 'grid';
        searchPanel.style.gridTemplateColumns = `repeat(${maxIconsInRow}, 1fr)`;
    }

    /// Set border radius for first and last buttons
    // const borderRadiusForButton = configs.useCustomStyle ? configs.borderRadius : 3;
    // const firstSearchButtonBorderRadius = verticalSecondaryTooltip ?
    //     `${borderRadiusForButton}px ${borderRadiusForButton}px 0px 0px`
    //     : firstButtonBorderRadius;
    // const lastSearchButtonBorderRadius = verticalSecondaryTooltip ?
    //     `0px 0px ${borderRadiusForButton}px ${borderRadiusForButton}px`
    //     : lastButtonBorderRadius;

    // let buttons = searchPanel.children;
    // buttons[0].style.borderRadius = firstSearchButtonBorderRadius;
    // buttons[buttons.length - 1].style.borderRadius = lastSearchButtonBorderRadius;

    /// Append panel
    searchButton.appendChild(searchPanel);
}

function onSearchButtonClick(e, url) {
    let selectedText = selection.toString();
    selectedText = encodeURI(selectedText);
    selectedText = selectedText.replaceAll('&', '%26').replaceAll('+', '%2B');
    let urlToOpen = url.replaceAll('%s', selectedText);

    if (urlToOpen.includes('%w'))
        try {
            let currentDomain = window.location.href.split('/')[2];
            urlToOpen = urlToOpen.replaceAll('%w', currentDomain);
        } catch (e) {
            if (configs.debugMode) console.log(e);
        }

    try {
        let evt = e || window.event;

        if ("buttons" in evt) {
            if (evt.button == 0) {
                /// Left button click
                hideTooltip();
                removeSelectionOnPage();
                chrome.runtime.sendMessage({ type: 'selecton-open-new-tab', url: urlToOpen, focused: true });
            } else if (evt.button == 1) {
                /// Middle button click
                evt.preventDefault();
                if (configs.middleClickHidesTooltip) {
                    hideTooltip();
                    removeSelectionOnPage();
                }

                chrome.runtime.sendMessage({ type: 'selecton-open-new-tab', url: urlToOpen, focused: false });
            }
        }

    } catch (e) {
        window.open(urlToOpen, '_blank');
    }
}