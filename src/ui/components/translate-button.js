function addTranslateButton() {
    if (configs.debugMode)
        console.log('Checking if its needed to add Translate button...');

    var selectedText = selection.toString().trim();

    if (configs.debugMode)
        console.log(`Selected text is: ${selectedText}`);

    try {
        chrome.i18n.detectLanguage(selectedText, function (result) {
            var detectedLanguages = result;

            /// Show Translate button when language was not detected
            let isFirefox = navigator.userAgent.indexOf("Firefox") > -1;
            var shouldTranslate = isFirefox;

            if (configs.debugMode)
                console.log(`User language is: ${configs.languageToTranslate}`);

            if (detectedLanguages !== null && detectedLanguages !== undefined) {
                var langs = detectedLanguages.languages;

                if (langs !== []) {
                    if (configs.debugMode)
                        console.log(`Detection is reliable: ${detectedLanguages.isReliable}`);
                    langs.forEach(function (lang) {
                        if (configs.debugMode) {
                            console.log('Detected language: ' + langs[0].language);
                        }
                        /// Don't show translate button if selected language is the same as desired
                        if (lang.language == configs.languageToTranslate) shouldTranslate = false;
                        else shouldTranslate = true;
                    })
                } else {
                    if (configs.debugMode) {
                        console.log('Selecton failed to detect selected text language');
                    }
                }
            }

            if (configs.debugMode)
                console.log(`Should translate: ${shouldTranslate}`);

            if (shouldTranslate == true) {
                var translateButton = document.createElement('button');
                translateButton.setAttribute('class', `selection-popup-button button-with-border open-link-button`);
                if (configs.reverseTooltipButtonsOrder)
                    tooltip.insertBefore(translateButton, tooltip.children[1]);
                else
                    tooltip.appendChild(translateButton);

                translateButton.addEventListener("mousedown", function (e) {
                    let url = `https://translate.google.com/?sl=auto&tl=${configs.languageToTranslate}&text=${encodeURI(selectedText.trim())}`;
                    onTooltipButtonClick(e, url);
                });

                if (configs.liveTranslation && selectedText.split(' ').length <= 3) {
                    try {
                        setLiveTranslatedButton(selectedText, 'auto', configs.languageToTranslate, translateButton);
                    } catch (e) {
                        console.log(e);
                        setRegularTranslateButton(translateButton);
                    }
                } else {
                    setRegularTranslateButton(translateButton);
                }

            } else {
                checkTooltipForCollidingWithSideEdges();
            }

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
    if (addButtonIcons)
        translateButton.innerHTML = createImageIcon(translateButtonIcon, 0.75) + (configs.buttonsStyle == 'onlyicon' ? '' : translateLabel);
    else
        translateButton.textContent = translateLabel;

    /// Correct tooltip's dx
    tooltip.style.left = `${(parseFloat(tooltip.style.left.replaceAll('px', ''), 10) - (translateButton.clientWidth / 2))}px`;

    /// Correct last button's border radius
    tooltip.children[tooltip.children.length - 2].style.borderRadius = '0px';
    tooltip.children[tooltip.children.length - 1].style.borderRadius = lastButtonBorderRadius;

    checkTooltipForCollidingWithSideEdges();
}


async function setLiveTranslatedButton(word, sourceLang, targetLang, translateButton) {

    /// Fetch translation from Google Translate
    /// Simplified version of Simple Translate extension request (as per 4 May 21) 
    /// https://github.com/sienori/simple-translate/blob/f8ec34e1b17635c0b03d8fbbc64562ca5534acca/src/common/translate.js#L26

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

    let resultOfLiveTranslation;
    let originLanguage;

    try {
        resultOfLiveTranslation = result.response.dict[0].terms[0];
    } catch (e) {
        resultOfLiveTranslation = result.response.sentences[0].trans;
    }

    try {
        originLanguage = result.response.src;
    } catch (e) { }

    /// Set translated button
    if (resultOfLiveTranslation !== null && resultOfLiveTranslation !== undefined && resultOfLiveTranslation !== '') {
        if (configs.debugMode) {
            console.log('Result of live translation:');
            console.log(resultOfLiveTranslation);
        }

        translateButton.style.color = secondaryColor;
        translateButton.innerHTML = resultOfLiveTranslation;

        /// Create origin language label

        let originLabelWidth = configs.fontSize / 1.5;
        let originLabelPadding = 3.5;

        if (originLanguage !== null && originLanguage !== undefined && originLanguage !== '') {
            let langLabel = document.createElement('span');
            langLabel.textContent = originLanguage;
            langLabel.setAttribute('style', `opacity: 0.7; position: relative; right: -${originLabelPadding}px; bottom: -2.5px; font-size: ${originLabelWidth}px;`)
            langLabel.style.color = getTextColorForBackground(configs.tooltipBackground.toLowerCase());
            translateButton.appendChild(langLabel);
        }

        /// Correct tooltip's dx
        setTimeout(function () {
            let correctionForOriginLabel = originLanguage !== null && originLanguage !== undefined && originLanguage !== '' ? originLabelWidth - originLabelPadding : 0.0;
            tooltip.style.left = `${(parseFloat(tooltip.style.left.replaceAll('px', ''), 10) - (translateButton.clientWidth / 2) + correctionForOriginLabel)}px`;

            /// Correct last button's border radius
            tooltip.children[tooltip.children.length - 2].style.borderRadius = '0px';
            tooltip.children[tooltip.children.length - 1].style.borderRadius = lastButtonBorderRadius;

            checkTooltipForCollidingWithSideEdges();
        }, 1);


    } else {
        /// if no translation found, set regular translate button
        setRegularTranslateButton(translateButton);
    }

}