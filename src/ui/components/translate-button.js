function addTranslateButton() {
    function proccessButton(shouldTranslate, languageOfSelectedText) {
        if (shouldTranslate == true) {
            const translateButton = document.createElement('button');
            translateButton.setAttribute('class', 'selection-popup-button button-with-border');
            if (configs.reverseTooltipButtonsOrder)
                tooltip.insertBefore(translateButton, tooltip.children[1]);
            else
                tooltip.appendChild(translateButton);

            translateButton.addEventListener("mousedown", function (e) {
                let url = languageOfSelectedText == configs.languageToTranslate && !configs.hideTranslateButtonForUserLanguage ?
                    returnTranslateUrl(selectedText, 'en') :
                    returnTranslateUrl(selectedText);
                onTooltipButtonClick(e, url);
            });

            setRegularTranslateButton(translateButton);

        } else {
            checkTooltipForCollidingWithSideEdges();
        }
    }

    try {
        if (!chrome.i18n.detectLanguage) proccessButton(true);
        else
            chrome.i18n.detectLanguage(selectedText, function (result) {
                if (configs.debugMode)
                    console.log('Checking if its needed to add Translate button...');

                /// Show Translate button when language was not detected
                // let isFirefox = navigator.userAgent.indexOf("Firefox") > -1;
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
}


function setRegularTranslateButton(translateButton) {
    if (configs.buttonsStyle == 'onlyicon' && configs.showButtonLabelOnHover)
        translateButton.setAttribute('title', translateLabel);
    translateButton.setAttribute('id', 'selecton-translate-button');

    if (configs.buttonsStyle == 'onlyicon' && configs.showButtonLabelOnHover)
        translateButton.setAttribute('title', translateLabel);

    if (addButtonIcons)
        translateButton.appendChild(createImageIconNew(translateButtonIcon, configs.buttonsStyle == 'onlyicon' ? '' : translateLabel));
    else
        translateButton.innerHTML = translateLabel;


    /// Correct tooltip's dx
    correctTooltipPosition();

    // if (configs.liveTranslation && selectedText.split(' ').length <= 4 && configs.preferredTranslateService == 'google') {
    //     translateButton.addEventListener("mouseover", function (e) {
    //         setLiveTranslatedButton(selectedText, 'auto', configs.languageToTranslate, translateButton);
    //     });
    // }

    /// set live tranlsation listeners
    if (configs.liveTranslation && configs.preferredTranslateService == 'google' && selectedText.length < 500) {
        setLiveTranslateOnHoverButton(selectedText, 'auto', configs.languageToTranslate, translateButton);
    }

}

function setLiveTranslateOnHoverButton(word, sourceLang, targetLang, translateButton) {
    let timerToRemovePanel;
    let timeoutToRevealPanel;
    let liveTranslationPanel;
    let isTranslateButtonHovered = false;
    let translated = false;

    let hoverIndicator = addAstrixToHoverButton(translateButton);

    translateButton.addEventListener('mouseover', function () {
        try {
            clearTimeout(timerToRemovePanel);
            clearTimeout(timeoutToRevealPanel);
        } catch (e) { }
        timerToRemovePanel = null;

        timeoutToRevealPanel = setTimeout(function () {
            // translateButton.classList.add("hovered-tooltip-button");
            hideHoverIndicator(hoverIndicator);

            if (translated == false) {
                liveTranslationPanel = document.createElement('div');
                liveTranslationPanel.className = 'translation-selection-tooltip selecton-entity clearfix';
                liveTranslationPanel.style.borderRadius = `${configs.useCustomStyle ? configs.borderRadius : 3}px`;
                liveTranslationPanel.style.pointerEvents = 'none';
                liveTranslationPanel.innerHTML = `${chrome.i18n.getMessage("translating")}...`;
                liveTranslationPanel.style.color = 'var(--selection-button-foreground)';

                /// Add shadow
                if (configs.addTooltipShadow) {
                    liveTranslationPanel.style.boxShadow = `0 1px 5px rgba(0,0,0,${configs.shadowOpacity / 1.5})`;
                }
            }

            setTimeout(function () {
                if (translated == false) {
                    liveTranslationPanel.style.opacity = 0;
                    liveTranslationPanel.style.position = 'absolute';
                    if (tooltipOnBottom)
                        liveTranslationPanel.style.top = '120%';
                    else
                        liveTranslationPanel.style.bottom = '120%';
                    liveTranslationPanel.style.pointerEvents = 'auto';
                    if (configs.reverseTooltipButtonsOrder)
                        liveTranslationPanel.style.left = '0px';
                    else
                        liveTranslationPanel.style.right = '0px';
                    translateButton.appendChild(liveTranslationPanel);

                    setTimeout(function () {
                        /// check if panel goes off-screen on top
                        checkHoverPanelToOverflowOnTop(liveTranslationPanel);
                    }, 3);

                    /// Fetch translation from Google Translate
                    translated = true;
                    fetchTranslation(word, sourceLang, targetLang, liveTranslationPanel);
                }

                setTimeout(function () {
                    liveTranslationPanel.style.opacity = 1;
                    // liveTranslationPanel.style.transform = 'scale(1.0)';
                    liveTranslationPanel.style.transform = 'scale(1.0) translate(25%, 0)';
                }, 15);

            }, 1);

        }, (configs.delayToRevealTranslateTooltip ?? 500) - 15);
    });

    translateButton.addEventListener('mouseout', function () {
        clearTimeout(timeoutToRevealPanel);

        if (!liveTranslationPanel) return;

        if (isTranslateButtonHovered == false) {
            liveTranslationPanel.style.opacity = 0.0;
            liveTranslationPanel.style.pointerEvents = 'none';
            showHoverIndicator(hoverIndicator);

            setTimeout(function () {
                if (liveTranslationPanel == null) return;
                liveTranslationPanel.style.transform = 'scale(0.0)';
            }, 300);
        }
    });
}

async function fetchTranslation(word, sourceLang, targetLang, liveTranslationPanel) {
    // let maxLengthForResult = 100;
    let noTranslationLabel = chrome.i18n.getMessage("noTranslationFound");

    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&dt=bd&dj=1&q=${encodeURIComponent(
        word
    )}`;
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
        liveTranslationPanel.innerHTML = noTranslationLabel;
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

        setTimeout(function () {
            /// check if panel goes off-screen on top
            checkHoverPanelToOverflowOnTop(liveTranslationPanel);
        }, 3);

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



// async function setLiveTranslatedButton(word, sourceLang, targetLang, translateButton) {

//     /// Placeholder while loading
//     translateButton.innerHTML = translateLabel;

//     let maxLengthForResult = 30;

//     const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&dt=bd&dj=1&q=${encodeURIComponent(
//         word
//     )}`;
//     const xhr = new XMLHttpRequest();
//     xhr.responseType = "json";
//     xhr.open("GET", url);
//     xhr.send();

//     let result = await new Promise((resolve, reject) => {
//         xhr.onload = () => {
//             resolve(xhr);
//         };
//         xhr.onerror = () => {
//             resolve(xhr);
//         };
//     });

//     if (configs.debugMode) {
//         console.log('Response from Google Translate:');
//         console.log(result);
//     }

//     if (result.response == null) {
//         translateButton.innerHTML = '';
//         setRegularTranslateButton(translateButton);
//         return;
//     }

//     let resultOfLiveTranslation;
//     let originLanguage;

//     try {
//         resultOfLiveTranslation = result.response.dict[0].terms[0];
//     } catch (e) {
//         resultOfLiveTranslation = result.response.sentences[0].trans;
//     }

//     try {
//         originLanguage = result.response.src;
//     } catch (e) { }

//     /// Set translated button
//     if (resultOfLiveTranslation !== null && resultOfLiveTranslation !== undefined && resultOfLiveTranslation !== '' && resultOfLiveTranslation.replaceAll(' ', '') !== word.replaceAll(' ', '')) {
//         if (configs.debugMode) {
//             console.log('Result of live translation:');
//             console.log(resultOfLiveTranslation);
//         }

//         if (resultOfLiveTranslation.length > maxLengthForResult)
//             resultOfLiveTranslation = resultOfLiveTranslation.substring(0, maxLengthForResult - 3) + '...';

//         translateButton.innerHTML = resultOfLiveTranslation;
//         translateButton.classList.add('selecton-live-translation')

//         /// Create origin language label
//         let originLabelWidth = configs.fontSize / 1.5;
//         let originLabelPadding = 3.5;
//         let langLabel;
//         if (originLanguage !== null && originLanguage !== undefined && originLanguage !== '') {
//             langLabel = document.createElement('span');
//             langLabel.textContent = originLanguage;
//             langLabel.setAttribute('style', `opacity: 0.7; position: relative; right: -${originLabelPadding}px; bottom: -2.5px; font-size: ${originLabelWidth}px;color: var(--selection-button-foreground) !important`)
//             translateButton.appendChild(langLabel);
//         }

//         setTimeout(function () {
//             /// Correct tooltip's dx
//             tooltip.style.transition += ', left 100ms ease-out';
//             correctTooltipPosition()
//         }, 2);


//     } else {
//         /// if no translation found, set regular translate button
//         translateButton.style.color = getTextColorForBackground(configs.tooltipBackground.toLowerCase());
//         translateButton.innerHTML = '';
//         setRegularTranslateButton(translateButton);
//     }

// }