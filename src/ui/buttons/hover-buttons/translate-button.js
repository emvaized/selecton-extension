function addTranslateButton(onFinish, selectionLength) {
    try {
        if (!chrome.i18n.detectLanguage) proccessButton(true);
        else
            chrome.i18n.detectLanguage(selectedText, function (result) {
                if (configs.debugMode)
                    console.log('Checking if its needed to add Translate button...');

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
                        if (configs.debugMode) console.log('Selecton failed to detect language of selected text');
                        shouldTranslate = configs.showTranslateIfLanguageUnknown ?? false;
                    }
                } else {
                    if (configs.debugMode) console.log('Selecton failed to detect language of selected text');
                    shouldTranslate = configs.showTranslateIfLanguageUnknown ?? false;
                }

                if (configs.debugMode)
                    console.log(`Should translate: ${shouldTranslate}`);

                proccessButton(shouldTranslate, languageOfSelectedText);

            });
    } catch (e) {
        if (configs.debugMode)
            console.log(e);
    }

    function proccessButton(shouldTranslate, languageOfSelectedText) {
        if (shouldTranslate == true) {
            setRegularTranslateButton(languageOfSelectedText, selectionLength);
        }
        if (onFinish) onFinish();
    }
}


function setRegularTranslateButton(languageOfSelectedText, selectionLength) {

    const translateButton = addBasicTooltipButton(translateLabel, translateButtonIcon, function (e) {
        let url = languageOfSelectedText == configs.languageToTranslate && !configs.hideTranslateButtonForUserLanguage ?
            returnTranslateUrl(selectedText, 'en') :
            returnTranslateUrl(selectedText);
        onTooltipButtonClick(e, url);
    });

    translateButton.setAttribute('id', 'selecton-translate-button');

    /// set live tranlsation listeners
    // if (configs.liveTranslation && configs.preferredTranslateService == 'google' && selectedText.length < 500) {
    if (configs.liveTranslation && selectionLength < 500) {
        setTimeout(function () {
            setLiveTranslateOnHoverButton(selectedText, 'auto', configs.languageToTranslate, translateButton);
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
            fetchTranslation(word, sourceLang, targetLang, liveTranslationPanel)
        }
    }
}

async function fetchTranslation(word, sourceLang, targetLang, liveTranslationPanel) {
    // let maxLengthForResult = 100;
    let noTranslationLabel = chrome.i18n.getMessage("noTranslationFound");

    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&dt=bd&dj=1&q=${encodeURIComponent(word)}`;
    const xhr = new XMLHttpRequest();
    xhr.responseType = "json";
    xhr.open("GET", url);
    xhr.send();

    let result = await new Promise((resolve, reject) => {
        xhr.onload = () => {
            resolve(xhr);
        };
        xhr.onerror = () => {
            resolve(xhr);
        };
    });

    if (configs.debugMode) {
        console.log('Response from Google Translate:');
        console.log(result);
    }

    if (result.response == null) {
        liveTranslationPanel.innerText = noTranslationLabel;
        return;
    }

    let resultOfLiveTranslation;
    let originLanguage;

    try {
        resultOfLiveTranslation = result.response.dict[0].terms[0];
    } catch (e) {
        // resultOfLiveTranslation = result.response.sentences[0].trans;
        resultOfLiveTranslation = '';
        result.response.sentences.forEach(function (sentenceObj) {
            resultOfLiveTranslation += sentenceObj.trans;
        })
    }

    try {
        originLanguage = result.response.src;
    } catch (e) { }

    /// Set translation view
    if (resultOfLiveTranslation !== null && resultOfLiveTranslation !== undefined && resultOfLiveTranslation !== '' && resultOfLiveTranslation.replaceAll(' ', '') !== word.replaceAll(' ', '')) {
        // if (resultOfLiveTranslation.length > maxLengthForResult)
        //     resultOfLiveTranslation = resultOfLiveTranslation.substring(0, maxLengthForResult - 3) + '...';

        liveTranslationPanel.innerText = resultOfLiveTranslation;
        liveTranslationPanel.classList.add('selecton-live-translation');

        // setTimeout(function () {
        //     /// check if panel goes off-screen on top
        //     checkHoverPanelToOverflowOnTop(liveTranslationPanel);
        // }, 3);

        /// Create origin language label
        let originLabelWidth = configs.fontSize / 1.5;
        let originLabelPadding = 3.5;
        let langLabel;
        if (originLanguage !== null && originLanguage !== undefined && originLanguage !== '') {
            langLabel = document.createElement('span');
            langLabel.textContent = originLanguage;
            langLabel.setAttribute('style', `opacity: 0.7; position: relative; right: -${originLabelPadding}px; bottom: -2.5px; font-size: ${originLabelWidth}px;color: var(--selection-button-foreground) !important`)
            liveTranslationPanel.appendChild(langLabel);
        }
    } else {
        /// no translation found
        liveTranslationPanel.innerHTML = noTranslationLabel;
    }
}