function addDictionaryButton(selectionLength) {
    try {

        const locale = configs.languageToTranslate;
        const wikiUrl = 'https://' + 
                (locale ? locale + '.' : '') +
                `wikipedia.org/w/index.php?search=${encodeURIComponent(selectedText)}`;
        // const wikiButton = addBasicTooltipButton(dictionaryLabel, dictionaryButtonIcon, wikiUrl);
        const wikiButton = addLinkTooltipButton(dictionaryLabel, dictionaryButtonIcon, wikiUrl);
        // wikiButton.setAttribute('id', 'selecton-translate-button');

        /// set fetch on hover listener
        if (selectionLength < 500) {
            setLiveWikiButton(selectedText, wikiButton);
        }

    } catch (e) {
        if (configs.debugMode)
            console.log(e);
    }
}


function setLiveWikiButton(word, wikiButton) {
    let fetched = false;
    let definitionPanel = createHoverPanelForButton(wikiButton, `${chrome.i18n.getMessage("searchingDefinitions") ?? 'Searching'}...`, onShow);
    wikiButton.appendChild(definitionPanel);

    function onShow() {
        if (fetched == false) {
            /// Fetch definition from Wikipedia
            fetched = true;
            fetchDefinition(word, definitionPanel, wikiButton);
        }
    }
}

async function fetchDefinition(text, definitionPanel, wikiButton) {
    let resultDefinition;
    let nothingFoundLabel = chrome.i18n.getMessage("noDefinitionFound") ?? 'No definition found';
    let locale = configs.languageToTranslate;
    let textToSearch = encodeURIComponent(text.replaceAll(' ', '_'));

    fetchFromWikipedia(locale, (res) => {
        if (resultDefinition == null || resultDefinition == undefined || resultDefinition == '') {
            /// try to fetch from english Wiki
            locale = 'en';
            fetchFromWikipedia('en', (res2)=>{
                if (resultDefinition == null || resultDefinition == undefined || resultDefinition == '') {
                    /// no results found
                    definitionPanel.innerText = nothingFoundLabel;
                    return;
                } else {
                    onFinish();
                }
            });
        } else {
            onFinish();
        }

        function onFinish(){
            /// Set definition view
            // definitionPanel.innerText = resultDefinition;
            definitionPanel.innerText = '';
            definitionPanel.classList.add('selecton-live-translation');
            definitionPanel.style.maxWidth = '450%';

            /// If text contains line breaks, align by the left side
        //     if (resultDefinition.includes(`
        // `)) definitionPanel.style.textAlign = 'start';
            definitionPanel.style.textAlign = 'start';
        
            /// Create origin language label
            // let originLabelWidth = configs.fontSize / 1.5;
            // let originLabelPadding = 6;
            // let langLabel;
            // if (locale !== null && locale !== undefined && locale !== '') {
            //     langLabel = document.createElement('span');
            //     langLabel.textContent = locale;
            //     langLabel.setAttribute('style', `opacity: 0.7; position: absolute; right: ${originLabelPadding}px; bottom: ${originLabelPadding}px; font-size: ${originLabelWidth}px;color: var(--selection-button-foreground) !important`)
            //     definitionPanel.appendChild(langLabel);
            // }

            if (configs.debugMode) console.log('Dictionary definition fetched:', resultDefinition);
            /// Remove excessive padding
            resultDefinition = resultDefinition.replaceAll(`\n\n\n`, `\n\n`);

            const title = document.createElement('span');
            title.textContent = 'Wikipedia';
            title.className = 'selecton-hover-panel-header';
            if(!tooltipOnBottom) definitionPanel.appendChild(title);

            let container = document.createElement('div');
            container.className = 'selecton-hover-panel-container';
            container.innerText = resultDefinition;

            definitionPanel.appendChild(container);
            definitionPanel.style.padding = '0';
            if(tooltipOnBottom) {
                title.style.paddingBottom = '2px';
                container.style.marginTop = '3px';
                container.style.marginBottom = '0px';
                definitionPanel.appendChild(title);
            }

            /// Create origin language label
            if (locale) title.textContent += ` · ${locale}`;
            
        }
    
    });


    function fetchFromWikipedia(locale, callback, onError) {
        try {
            /// exclude local language variations, such as ru-RU
            let langToFetch = locale;
            if (langToFetch.includes('-')) langToFetch = langToFetch.split('-')[0];
            if (langToFetch.includes('_')) langToFetch = langToFetch.split('_')[0];

            /// Fetch data from Wiktionary

            const wikiUrl = `https://${langToFetch}.wikipedia.org/w/api.php?action=query&exsectionformat=plain&prop=extracts&origin=*&exchars=${configs.dictionaryButtonResponseCharsAmount ?? 300}&exlimit=1&explaintext=0&formatversion=2&format=json&titles=${textToSearch}`;

            if (configs.debugMode) console.log('Fetching from Wikipedia:', wikiUrl);
            chrome.runtime.sendMessage({ type: 'background_fetch', url: wikiUrl }, (res) => {
                // let jsoned = res.json();
                let jsoned = res;
                let extract = jsoned.query.pages[0].extract;
    
                if (extract) {
                    resultDefinition = extract;
                }
    
                if (jsoned.query.pages[0].pageid)
                    // wikiButton.onmousedown = function (e) {
                    //     let url = `https://${locale}.wikipedia.org/?curid=${jsoned.query.pages[0].pageid}`;
                    //     onTooltipButtonClick(e, url);
                    // }
                    wikiButton.href = `https://${locale}.wikipedia.org/?curid=${jsoned.query.pages[0].pageid}`;

                callback(res)
            });
        } catch (e) { console.log(e); onError(e); }
    }
}