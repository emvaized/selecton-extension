
function setHoverForSearchButton(searchButton) {
    /// Create search options panel
    let searchPanel = createHoverPanelForButton(searchButton, undefined, undefined, true);
    searchPanel.classList.add('no-padding-tooltip');
    searchPanel.style.textAlign = 'start';

    /// Generate buttons for panel
    const searchButtons = configs.customSearchButtons.filter((item, idx) => item['enabled']);
    const searchButtonsLength = searchButtons.length;
    if (searchButtonsLength == 0) return;

    const buttonPrototype = document.createElement('a');
    buttonPrototype.style.display = verticalSecondaryTooltip ? 'block' : 'inline-block';
    buttonPrototype.style.textAlign = 'start';
    buttonPrototype.className = 'custom-search-image-button';
    if (!verticalSecondaryTooltip) buttonPrototype.style.padding = '0px';
    const maxIconsInRow = configs.maxIconsInRow;

    for (var i = 0; i < searchButtonsLength; i++) {
        const item = searchButtons[i];

        const optionEnabled = item['enabled'];
        const url = item['url'];

        if (optionEnabled && url) {
            const title = item['title'];
            const icon = item['icon'];

            const button = createSearchOptionButton(icon, title, url, buttonPrototype);
            searchPanel.appendChild(button);

            /// Set click listeners
            button.addEventListener("mousedown", function (e) {
                e.stopPropagation();
                // onSearchButtonClick(e, url);
            });
            button.href = returnSearchButtonUrl(url);
            button.target = '_blank';
        }
    }

    /// Search on website button (draft)
    /*
    const searchOnWebsiteButton = createSearchOptionButton(searchButtonIcon, 'Search on website', null, buttonPrototype);
    searchOnWebsiteButton.addEventListener("mousedown", function (e) {
        e.stopPropagation();
    });
    searchOnWebsiteButton.href = undefined;
    searchOnWebsiteButton.title = 'Search for the selected text on this website';
    searchOnWebsiteButton.firstChild.classList.add('selecton-button-img-icon');
    searchOnWebsiteButton.addEventListener("mousedown", function (e) {
        e.preventDefault();
        e.stopPropagation();
    });
    searchOnWebsiteButton.addEventListener("click", async function (e) {
        e.preventDefault();
        e.stopPropagation();

        /// Try to fetch url for search on website
        let searchUrl;
        const linkTag = document.querySelector('head link[rel="search"][type="application/opensearchdescription+xml"]');
        if (linkTag) {
            let href = linkTag.getAttribute('href');
            if (href) {
                const openSearchUrl = new URL(href, window.location.origin).href;
                if (configs.debugMode) console.log('Found search URL: ' + openSearchUrl);
                try {
                    let response = await fetch(openSearchUrl);
                    if (response.ok) {
                        let text = await response.text();
                        let parser = new DOMParser();
                        let xml = parser.parseFromString(text, "application/xml");
                        let urlElement = xml.querySelector('Url[type="text/html"]');
                        if (urlElement) {
                            let template = urlElement.getAttribute('template');
                            if (template) 
                                searchUrl = template;
                        }
                    }
                } catch(e){}
            }
        }

        if (searchUrl) 
            window.open(searchUrl.replace("{searchTerms}", encodeURI(selectedText)), '_blank');
        else 
            window.open('https://google.com/search?q=site:' + window.location.hostname + ' ' + selectedText, '_blank');
    });

    searchPanel.appendChild(searchOnWebsiteButton);
    searchOnWebsiteButton.style.borderTop = '1px solid var(--selection-button-background-hover)';
    */

    /// Remove prototype
    buttonPrototype.remove();

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

function createSearchOptionButton(icon, title, url, buttonPrototype) {
    const imgButton = document.createElement('img');
    imgButton.setAttribute('class', 'selecton-search-tooltip-icon');
    imgButton.setAttribute('loading', 'lazy');

    if (configs.debugMode)
        imgButton.addEventListener('error', function () {
                console.log('error loading favicon for: ' + url + ' because of security policies of website');
        });

    imgButton.setAttribute('src', icon !== null && icon !== undefined && icon !== '' ? icon : 'https://www.google.com/s2/favicons?domain=' + url.split('/')[2])

    /// Set title
    let titleText = title !== null && title !== undefined && title !== '' ? title : returnDomainFromUrl(url);
    const button = buttonPrototype.cloneNode(true);

    /// Add label in vertical style
    if (verticalSecondaryTooltip) {
        button.appendChild(imgButton);

        const labelSpan = document.createElement('span');
        labelSpan.textContent = titleText.charAt(0).toUpperCase() + titleText.slice(1);
        button.appendChild(labelSpan);
    } else {
        /// No label in horizontal style
        imgButton.style.margin = '3px 6px';
        imgButton.title = titleText;
        button.appendChild(imgButton);
    }

    return button;
}

function returnSearchButtonUrl(url){
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

    return urlToOpen;   
}

function onSearchButtonClick(e, url) {
    let urlToOpen = returnSearchButtonUrl(url)

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