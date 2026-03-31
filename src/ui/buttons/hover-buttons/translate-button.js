function addTranslateButton(onFinish, selectionLength, wordsCount) {
    try {
        if (!chrome.i18n.detectLanguage) proccessButton(true);
        else
            chrome.i18n.detectLanguage(selectedText, function (result) {
                /// Show Translate button when language was not detected
                let shouldTranslate = false;

                if (configs.debugMode)
                    console.log(`User language is: ${configs.languageToTranslate}`);

                let detectedLanguages = result;
                let languageOfSelectedText;

                if (detectedLanguages !== null && detectedLanguages !== undefined) {
                    const langs = detectedLanguages.languages;

                    if (langs.length > 0) {
                        languageOfSelectedText = langs[0].language;
                        if (configs.debugMode) console.log('Detected language: ' + languageOfSelectedText);

                        /// Show detected language on info panel
                        if (configs.showInfoPanel && detectedLanguages.isReliable && !configs.verticalLayoutTooltip)
                            setTimeout(function () {
                                if (infoPanel && infoPanel.isConnected) {
                                    infoPanel.innerText += ' · ' + languageOfSelectedText;
                                    // let languageNames = new Intl.DisplayNames([configs.languageToTranslate], { type: 'language' });
                                    // infoPanel.innerText += ' · ' + languageNames.of(languageOfSelectedText);
                                }
                            }, 5)

                        // if (configs.debugMode)
                        //     console.log(`Detection is reliable: ${detectedLanguages.isReliable}`);

                        /// Don't show translate button if selected language is the same as desired
                        if (languageOfSelectedText == configs.languageToTranslate && configs.hideTranslateButtonForUserLanguage)
                            shouldTranslate = false;
                        else shouldTranslate = true;
                    } else {
                        shouldTranslate = configs.showTranslateIfLanguageUnknown ?? false;
                    }
                } else {
                    shouldTranslate = configs.showTranslateIfLanguageUnknown ?? false;
                }
                proccessButton(shouldTranslate, languageOfSelectedText);
            });
    } catch (e) {
        if (configs.debugMode)
            console.log(e);
    }

    function proccessButton(shouldTranslate, languageOfSelectedText) {
        if (shouldTranslate == true) {
            setRegularTranslateButton(languageOfSelectedText, selectionLength, wordsCount);
        }
        if (onFinish) onFinish();
    }
}


function setRegularTranslateButton(languageOfSelectedText, selectionLength, wordsCount) {

    const translateUrl = languageOfSelectedText == configs.languageToTranslate && !configs.hideTranslateButtonForUserLanguage ?
            returnTranslateUrl(selectedText, 'en', languageOfSelectedText) :
            returnTranslateUrl(selectedText, configs.languageToTranslate, languageOfSelectedText);
    const translateButton = addLinkTooltipButton(translateLabel, translateButtonIcon, translateUrl);

    translateButton.setAttribute('id', 'selecton-translate-button');

    /// set live tranlsation listeners
    // if (configs.liveTranslation && configs.preferredTranslateService == 'google' && selectedText.length < 500) {
    if (configs.liveTranslation && selectionLength < 500) {
        setTimeout(function () {
            if (configs.translateSingleWordsImmediately && wordsCount == 1 && !/[:\/"'']/.test(selectedText)) {
                fetchTranslation(selectedText, 'auto', configs.languageToTranslate, undefined, translateButton, true)
            } else {
                setLiveTranslateOnHoverButton(selectedText, 'auto', configs.languageToTranslate, translateButton);
            }
        }, 5);
    }
}

function setLiveTranslateOnHoverButton(word, sourceLang, targetLang, translateButton) {
    let fetched = false;
    let liveTranslationPanel = createHoverPanelForButton(translateButton, `${chrome.i18n.getMessage("translating") ?? 'Translating'}...`, onShow);
    translateButton.appendChild(liveTranslationPanel);

    function onShow() {
        if (fetched == false) {
            /// Fetch definition from Google Translate
            fetched = true;
            // fetchTranslationOG(word, sourceLang, targetLang, liveTranslationPanel, translateButton)
            fetchTranslation(word, sourceLang, targetLang, liveTranslationPanel, translateButton)
        }
    }
}

/// Uses alternative Google Translate API with richer results for single word translations
async function fetchTranslationOG(word, sourceLang, targetLang, liveTranslationPanel, translateButton, showResultInButton = false) {
    // let maxLengthForResult = 100;
    let noTranslationLabel = chrome.i18n.getMessage("noTranslationFound");

    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&dt=bd&dj=1&q=${encodeURIComponent(word)}`;

    chrome.runtime.sendMessage({ type: 'background_fetch', url: url }, (response) => {
        let result = response;

        if (configs.debugMode) {
            console.log('Response from Google Translate:');
            console.log(result);
        }
    
        if (!result) {
            liveTranslationPanel.innerText = noTranslationLabel;
            return;
        }
    
        let resultOfLiveTranslation;
        let originLanguage;
    
        try {
            resultOfLiveTranslation = result.dict[0].terms[0];
        } catch (e) {
            // resultOfLiveTranslation = result.response.sentences[0].trans;
            resultOfLiveTranslation = '';
            result.sentences.forEach(function (sentenceObj) {
                resultOfLiveTranslation += sentenceObj.trans;
            })
        }
    
        try {
            originLanguage = result.src;
        } catch (e) { }
    
        /// Set translation view
        if (resultOfLiveTranslation !== null && resultOfLiveTranslation !== undefined && resultOfLiveTranslation !== '' && resultOfLiveTranslation.replaceAll(' ', '') !== word.replaceAll(' ', '')) {
            // if (resultOfLiveTranslation.length > maxLengthForResult)
            //     resultOfLiveTranslation = resultOfLiveTranslation.substring(0, maxLengthForResult - 3) + '...';

            if (showResultInButton){
                // let span = translateButton.querySelector('span');
                // if (!span) 
                let span = translateButton;
                span.innerText = resultOfLiveTranslation;
                span.classList.add('color-highlight');
                translateButton.title = 'Source: Google Translate';
            } else {
                liveTranslationPanel.innerText = '';

                const title = document.createElement('span');
                title.textContent = 'Google Translate';
                title.className = 'selecton-hover-panel-header';
                if(!tooltipOnBottom) {
                    liveTranslationPanel.appendChild(title);
                } 

                let container = document.createElement('div');
                container.className = 'selecton-hover-panel-container';

                container.innerText = resultOfLiveTranslation;
                container.classList.add('selecton-live-translation');
                liveTranslationPanel.appendChild(container);
                liveTranslationPanel.style.padding = '0';
                if(tooltipOnBottom) {
                    title.style.paddingBottom = '2px';
                    container.style.marginTop = '3px';
                    container.style.marginBottom = '0px';
                    liveTranslationPanel.appendChild(title);
                }

                /// Create origin language label
                if (originLanguage !== null && originLanguage !== undefined && originLanguage !== '') {
                    title.textContent += ` · ${originLanguage}`;
                }
            }
        } else {
            /// no translation found
            liveTranslationPanel.innerHTML = noTranslationLabel;
        }
    });

}

/// alternative Google Translate url
async function fetchTranslation(word, sourceLang, targetLang, liveTranslationPanel, translateButton, showResultInButton = false) {
    let noTranslationLabel = chrome.i18n.getMessage("noTranslationFound");

    const url = `https://clients5.google.com/translate_a/t?client=dict-chrome-ex&sl=${sourceLang}&tl=${targetLang}&q=${encodeURIComponent(word)}`;

    chrome.runtime.sendMessage({ type: 'background_fetch', url: url }, (response) => {
        let result = response;

        if (configs.debugMode) {
            console.log('Response from Google Translate:');
            console.log(result);
        }
    
        if (!result) {
            liveTranslationPanel.innerText = noTranslationLabel;
            return;
        }

        if (result[0]) result = result[0];
    
        let resultOfLiveTranslation;
        let originLanguage;
    
        try {
            resultOfLiveTranslation = result[0];
        } catch (e) {
            liveTranslationPanel.innerText = noTranslationLabel;
            return;
        }
    
        try {
            originLanguage = result[1];
        } catch (e) { }
    
        /// Set translation view
        if (resultOfLiveTranslation !== null && resultOfLiveTranslation !== undefined && resultOfLiveTranslation !== '' && resultOfLiveTranslation.replaceAll(' ', '') !== word.replaceAll(' ', '')) {
            if (showResultInButton){
                let span = translateButton.querySelector('span');
                if (!span) span = translateButton
                span.innerText = resultOfLiveTranslation;
                span.classList.add('selecton-live-translation');
                translateButton.title = 'Source: Google Translate';
            } else {
                liveTranslationPanel.innerText = '';

                const title = document.createElement('span');
                title.textContent = 'Google Translate';
                title.className = 'selecton-hover-panel-header';
                if(!tooltipOnBottom) {
                    liveTranslationPanel.appendChild(title);
                } 

                let container = document.createElement('div');
                container.className = 'selecton-hover-panel-container';
                // container.style.padding = '2px';
                // container.style.position = 'relative';

                container.innerText = resultOfLiveTranslation;
                liveTranslationPanel.classList.add('selecton-hover-panel-content');
                liveTranslationPanel.appendChild(container);
                liveTranslationPanel.style.padding = '0';
                if(tooltipOnBottom) {
                    title.style.paddingBottom = '2px';
                    container.style.marginTop = '3px';
                    container.style.marginBottom = '0px';
                    liveTranslationPanel.appendChild(title);
                }

                /// Create origin language label
                if (originLanguage !== null && originLanguage !== undefined && originLanguage !== '') {
                    title.textContent += ` · ${originLanguage}`;
                }
            }
        } else {
            /// no translation found
            liveTranslationPanel.innerHTML = noTranslationLabel;
        }
    });
}