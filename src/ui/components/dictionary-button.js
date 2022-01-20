function addDictionaryButton() {
    function proccessButton(languageOfSelectedText) {
        const wikiButton = document.createElement('button');
        wikiButton.setAttribute('class', 'selection-popup-button button-with-border');
        if (configs.reverseTooltipButtonsOrder)
            tooltip.insertBefore(wikiButton, tooltip.children[1]);
        else
            tooltip.appendChild(wikiButton);

        wikiButton.onmousedown = function (e) {
            let url = `https://wikipedia.org/w/index.php?search=${encodeURIComponent(selectedText)}`;
            onTooltipButtonClick(e, url);
        }

        setRegularWikiButton(wikiButton, languageOfSelectedText);
    }

    try {
        if (!chrome.i18n.detectLanguage) proccessButton();
        else
            chrome.i18n.detectLanguage(selectedText, function (result) {
                let detectedLanguages = result;
                let languageOfSelectedText;

                // if (detectedLanguages !== null && detectedLanguages !== undefined) {
                //     const langs = detectedLanguages.languages;

                //     console.log(detectedLanguages);

                //     if (langs.length > 0) {
                //         languageOfSelectedText = langs[0].language;
                //         if (configs.debugMode) console.log('Detected language: ' + languageOfSelectedText);

                //         // if (configs.debugMode)
                //         //     console.log(`Detection is reliable: ${detectedLanguages.isReliable}`);
                //     } else {
                //         if (configs.debugMode) console.log('Selecton failed to detect language of selected text');
                //         shouldTranslate = configs.showTranslateIfLanguageUnknown ?? false;
                //     }
                // } else {
                //     if (configs.debugMode) console.log('Selecton failed to detect language of selected text');
                //     shouldTranslate = configs.showTranslateIfLanguageUnknown ?? false;
                // }

                proccessButton(languageOfSelectedText);

            });
    } catch (e) {
        if (configs.debugMode)
            console.log(e);
    }
}


function setRegularWikiButton(wikiButton, languageOfSelectedText) {
    if (configs.buttonsStyle == 'onlyicon' && configs.showButtonLabelOnHover)
        wikiButton.setAttribute('title', dictionaryLabel);
    wikiButton.setAttribute('id', 'selecton-translate-button');

    if (configs.buttonsStyle == 'onlyicon' && configs.showButtonLabelOnHover)
        wikiButton.setAttribute('title', dictionaryLabel);

    if (addButtonIcons)
        wikiButton.appendChild(createImageIconNew(dictionaryButtonIcon, configs.buttonsStyle == 'onlyicon' ? '' : dictionaryLabel));
    else
        wikiButton.innerHTML = dictionaryLabel;


    /// Correct tooltip's dx
    correctTooltipPosition();

    /// set fetch on hover listeners
    // if (configs.liveTranslation && configs.preferredTranslateService == 'google' && selectedText.length < 500) {
    if (selectedText.length < 500) {
        setLiveWikiButton(selectedText, languageOfSelectedText, wikiButton);
    }

}

function setLiveWikiButton(word, lang, wikiButton) {
    let timerToRemovePanel, timeoutToRevealPanel, definitionPanel, fetched = false;
    let hoverIndicator = addAstrixToHoverButton(wikiButton);

    wikiButton.addEventListener('mouseover', function () {
        try {
            clearTimeout(timerToRemovePanel);
            clearTimeout(timeoutToRevealPanel);
        } catch (e) { }
        timerToRemovePanel = null;

        timeoutToRevealPanel = setTimeout(function () {
            hideHoverIndicator(hoverIndicator);

            if (fetched == false) {
                definitionPanel = document.createElement('div');
                definitionPanel.className = 'translation-selection-tooltip selecton-entity';
                definitionPanel.style.borderRadius = `${configs.useCustomStyle ? configs.borderRadius : 3}px`;
                definitionPanel.style.pointerEvents = 'none';
                // definitionPanel.style.textAlign = 'start';
                definitionPanel.innerHTML = `${chrome.i18n.getMessage("searchingDefinitions") ?? 'Searching'}...`;
                definitionPanel.style.color = 'var(--selection-button-foreground)';

                /// Add shadow
                if (configs.addTooltipShadow) {
                    definitionPanel.style.boxShadow = `0 1px 5px rgba(0,0,0,${configs.shadowOpacity / 1.5})`;
                }
            }

            setTimeout(function () {
                if (fetched == false) {
                    definitionPanel.style.opacity = 0;
                    definitionPanel.style.position = 'absolute';
                    if (tooltipOnBottom)
                        definitionPanel.style.top = '125%';
                    else
                        definitionPanel.style.bottom = '125%';
                    definitionPanel.style.pointerEvents = 'auto';
                    if (configs.reverseTooltipButtonsOrder)
                        definitionPanel.style.left = '0px';
                    else
                        definitionPanel.style.right = '0px';
                    wikiButton.appendChild(definitionPanel);

                    setTimeout(function () {
                        /// check if panel goes off-screen on top
                        checkHoverPanelToOverflowOnTop(definitionPanel);
                    }, 3);

                    /// Fetch definition from Wikipedia
                    fetched = true;
                    fetchDefinition(word, lang, definitionPanel, wikiButton);
                }

                setTimeout(function () {
                    definitionPanel.style.opacity = 1;
                    // definitionPanel.style.transform = 'scale(1.0)';
                    definitionPanel.style.transform = 'scale(1.0) translate(25%, 0)';
                }, 15);

            }, 1);

        }, (configs.delayToRevealTranslateTooltip ?? 500) - 15);
    });

    wikiButton.addEventListener('mouseout', function () {
        clearTimeout(timeoutToRevealPanel);
        if (!definitionPanel) return;

        // if (isTranslateButtonHovered == false) {
        definitionPanel.style.opacity = 0.0;
        definitionPanel.style.pointerEvents = 'none';
        showHoverIndicator(hoverIndicator);

        setTimeout(function () {
            if (definitionPanel == null) return;
            definitionPanel.style.transform = 'scale(0.0)';
        }, 300);
        // }
    });
}

async function fetchDefinition(text, lang, definitionPanel, wikiButton) {
    let resultDefinition;
    let nothingFoundLabel = chrome.i18n.getMessage("noDefinitionFound") ?? 'No definition found';
    let locale = lang == null || lang == undefined || lang == '' ? configs.languageToTranslate : lang;
    let textToSearch = encodeURIComponent(text.replaceAll(' ', '_'));

    await fetchFromWikipedia(locale);

    if (resultDefinition == null || resultDefinition == undefined || resultDefinition == '') {
        /// try to fetch from english Wiki
        await fetchFromWikipedia('en');
    }

    if (resultDefinition == null || resultDefinition == undefined || resultDefinition == '') {
        /// no results found
        definitionPanel.innerHTML = nothingFoundLabel;
        return;
    }

    /// Set translation view
    definitionPanel.innerText = resultDefinition;
    setTimeout(function () {
        /// check if panel goes off-screen on top
        checkHoverPanelToOverflowOnTop(definitionPanel);
    }, 3);

    /// Create origin language label
    let originLabelWidth = configs.fontSize / 1.5;
    let originLabelPadding = 3.5;
    let langLabel;
    if (lang !== null && lang !== undefined && lang !== '') {
        langLabel = document.createElement('span');
        langLabel.textContent = lang;
        langLabel.setAttribute('style', `opacity: 0.7; position: relative; right: -${originLabelPadding}px; bottom: -2.5px; font-size: ${originLabelWidth}px;color: var(--selection-button-foreground) !important`)
        definitionPanel.appendChild(langLabel);
    }


    async function fetchFromWikipedia(locale) {
        try {
            /// exclude local language variations, such as ru-RU
            let langToFetch = locale;
            if (langToFetch.includes('-')) langToFetch = langToFetch.split('-')[0];
            if (langToFetch.includes('_')) langToFetch = langToFetch.split('_')[0];

            // console.log(`Selecton Browser Extension ${chrome.runtime.getManifest().version}`);

            /// Fetch data from Wiktionary
            const res = await fetch(`https://${langToFetch}.wikipedia.org/w/api.php?action=query&exsectionformat=plain&prop=extracts&origin=*&exchars=500&exlimit=1&explaintext=0&formatversion=2&format=json&titles=${textToSearch}`, {
                method: 'GET',
                headers: {
                    // 'User-Agent': 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:95.0) Gecko/20100101 Firefox/95.0',
                    'User-Agent': `Selecton Browser Extension ${chrome.runtime.getManifest().version}`,
                },
            });
            if (!res.ok) throw new Error(`An error has occured: ${res.status}`);

            let jsoned = await res.json();
            let extract = jsoned.query.pages[0].extract;

            if (extract && extract != '') {
                resultDefinition = extract;
            }

            if (jsoned.query.pages[0].pageid)
                wikiButton.onmousedown = function (e) {
                    let url = languageOfSelectedText = `https://${locale}.wikipedia.org/?curid=${jsoned.query.pages[0].pageid}`;
                    onTooltipButtonClick(e, url);
                }
        } catch (e) { console.log(e); }
    }
}