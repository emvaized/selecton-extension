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
            console.log('isFirefox');
            console.log(isFirefox);
            var shouldTranslate = isFirefox;

            if (configs.debugMode)
                console.log(`User language is: ${configs.languageToTranslate}`);

            if (detectedLanguages !== null && detectedLanguages !== undefined) {
                const langs = detectedLanguages.languages;

                if (langs !== []) {
                    if (configs.debugMode) console.log('Detected language: ' + langs[0].language);

                    // if (configs.debugMode)
                    // console.log(`Detection is reliable: ${detectedLanguages.isReliable}`);

                    /// Don't show translate button if selected language is the same as desired
                    if (langs[0].language == configs.languageToTranslate) shouldTranslate = false;
                    else shouldTranslate = true;
                } else
                    if (configs.debugMode) console.log('Selecton failed to detect language of selected text');
            }

            if (configs.debugMode)
                console.log(`Should translate: ${shouldTranslate}`);

            if (shouldTranslate == true) {
                const translateButton = document.createElement('button');
                translateButton.setAttribute('class', 'selection-popup-button button-with-border');
                if (configs.reverseTooltipButtonsOrder)
                    tooltip.insertBefore(translateButton, tooltip.children[1]);
                else
                    tooltip.appendChild(translateButton);

                translateButton.addEventListener("mousedown", function (e) {
                    // let url = `https://translate.google.com/?sl=auto&tl=${configs.languageToTranslate}&text=${encodeURI(selectedText.trim())}`;
                    let url = returnTranslateUrl(selectedText);
                    onTooltipButtonClick(e, url);
                });

                if (configs.liveTranslation && selectedText.split(' ').length <= 3 && configs.preferredTranslateService == 'google') {
                    try {
                        setLiveTranslatedButton(selectedText, 'auto', configs.languageToTranslate, translateButton);
                    } catch (e) {
                        if (configs.debugMode) console.log(e);
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
        translateButton.appendChild(createImageIconNew(translateButtonIcon, configs.buttonsStyle == 'onlyicon' ? '' : translateLabel));
    else
        translateButton.textContent = translateLabel;

    /// Correct tooltip's dx
    correctTooltipPosition();

    if (configs.liveTranslation && selectedText.split(' ').length <= 4 && configs.preferredTranslateService == 'google') {
        translateButton.addEventListener("mouseover", function (e) {
            setLiveTranslatedButton(selectedText, 'auto', configs.languageToTranslate, translateButton);
        });
    }

}

async function setLiveTranslatedButton(word, sourceLang, targetLang, translateButton) {

    /// Placeholder while loading
    translateButton.innerHTML = translateLabel;

    let maxLengthForResult = 30;

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
    if (resultOfLiveTranslation !== null && resultOfLiveTranslation !== undefined && resultOfLiveTranslation !== '' && resultOfLiveTranslation.replaceAll(' ', '') !== word.replaceAll(' ', '')) {
        if (configs.debugMode) {
            console.log('Result of live translation:');
            console.log(resultOfLiveTranslation);
        }

        translateButton.style.color = secondaryColor;

        if (resultOfLiveTranslation.length > maxLengthForResult)
            resultOfLiveTranslation = resultOfLiveTranslation.substring(0, maxLengthForResult - 3) + '...';

        translateButton.innerHTML = resultOfLiveTranslation;
        // translateButton.setAttribute('title', resultOfLiveTranslation);

        /// Create origin language label
        let originLabelWidth = configs.fontSize / 1.5;
        let originLabelPadding = 3.5;
        let langLabel;
        if (originLanguage !== null && originLanguage !== undefined && originLanguage !== '') {
            langLabel = document.createElement('span');
            langLabel.textContent = originLanguage;
            langLabel.setAttribute('style', `opacity: 0.7; position: relative; right: -${originLabelPadding}px; bottom: -2.5px; font-size: ${originLabelWidth}px;`)
            langLabel.style.color = getTextColorForBackground(configs.tooltipBackground.toLowerCase());
            translateButton.appendChild(langLabel);
        }

        setTimeout(function () {
            /// Correct tooltip's dx
            correctTooltipPosition()
        }, 2);


    } else {
        /// if no translation found, set regular translate button
        translateButton.style.color = getTextColorForBackground(configs.tooltipBackground.toLowerCase());
        setRegularTranslateButton(translateButton);
    }

}

function correctTooltipPosition() {
    if (configs.tooltipPosition == 'overCursor') {

        /// Show tooltip over cursor
        tooltip.style.left = `${lastMouseUpEvent.clientX - tooltip.clientWidth / 2}px`;

    } else {
        let resultingDx;
        try {
            /// New approach - place tooltip in horizontal center between two selection handles
            let selStartDimensions = getSelectionCoordinates(true);
            let selEndDimensions = getSelectionCoordinates(false);
            let delta = selEndDimensions.dx > selStartDimensions.dx ? selEndDimensions.dx - selStartDimensions.dx : selStartDimensions.dx - selEndDimensions.dx;

            if (selEndDimensions.dx > selStartDimensions.dx)
                resultingDx = selStartDimensions.dx + (delta / 2) - (tooltip.clientWidth / 2);
            else
                resultingDx = selEndDimensions.dx + (delta / 2) - (tooltip.clientWidth / 2);

        } catch (e) {
            if (configs.debugMode) console.log(e);

            /// Fall back to old approach - place tooltip in horizontal center selection rect,
            /// which may be in fact bigger than visible selection
            resultingDx = selDimensions.dx + (selDimensions.width / 2) - (tooltip.clientWidth / 2);
        }

        tooltip.style.left = `${resultingDx}px`;
    }

    /// Correct last button's border radius
    tooltip.children[tooltip.children.length - 2].style.borderRadius = '0px';
    tooltip.children[tooltip.children.length - 1].style.borderRadius = lastButtonBorderRadius;

    if (configs.reverseTooltipButtonsOrder)
        tooltip.children[1].style.borderRadius = firstButtonBorderRadius;

    checkTooltipForCollidingWithSideEdges();
}