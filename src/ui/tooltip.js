function createTooltip(e, recreated = false) {
    if (isDraggingTooltip) return;

    if (dontShowTooltip !== true)
        setTimeout(
            function () {
                if (e !== undefined && e !== null && e.button !== 0) return;
                if (selection == null) return;

                lastMouseUpEvent = e;
                // hideTooltip();

                if (configs.snapSelectionToWord) {
                    if (isTextFieldFocused == true && configs.dontSnapTextfieldSelection == true) {
                        if (configs.debugMode)
                            console.log('Word snapping rejected while textfield is focused');
                    } else if (configs.disableWordSnappingOnCtrlKey && e !== undefined && (e.ctrlKey == true || e.metaKey == true)) {
                        if (configs.debugMode)
                            console.log('Word snapping rejected due to pressed CTRL key');
                    } else {

                        selectedText = selection.toString();

                        let selectedTextIsCode = false;
                        if (configs.disableWordSnapForCode)
                            for (let i = 0, l = codeMarkers.length; i < l; i++) {
                                if (selectedText.includes(codeMarkers[i])) {
                                    selectedTextIsCode = true; break;
                                }
                            }

                        if (isDraggingDragHandle == false && selectedTextIsCode == false) /// dont snap if selection is modified by drag handle
                            if (domainIsBlacklistedForSnapping == false && e.detail < 3 && (timerToRecreateOverlays == null || timerToRecreateOverlays == undefined))
                                snapSelectionByWords(selection);
                    }
                }

                /// Special tooltip for text fields
                if (isTextFieldFocused) {
                    if (configs.addActionButtonsForTextFields == false) return;

                    /// Create text field tooltip
                    setUpNewTooltip('textfield');
                    if (tooltip.children.length < 2) return;

                    document.body.appendChild(tooltip);

                    /// Check resulting DY to be out of view
                    let resultDy = e.clientY - tooltip.clientHeight - arrow.clientHeight - 9;
                    let vertOutOfView = resultDy <= 0;
                    if (vertOutOfView) {
                        resultDy = e.clientY + arrow.clientHeight;
                        arrow.classList.add('arrow-on-bottom');
                    }

                    showTooltip(e.clientX - (tooltip.clientWidth / 2), resultDy);
                    return;
                }

                /// Hide previous tooltip if exists
                if (tooltip !== null && tooltip !== undefined) hideTooltip();

                /// Check text selection again
                /// Fix for recreating tooltip when clicked inside selected area (noticed only in Firefox)
                selection = window.getSelection();
                selectedText = selection.toString().trim();

                if (selectedText == '') {
                    hideDragHandles();
                    return;
                }

                setUpNewTooltip(null, recreated);

                if (dontShowTooltip == false && selectedText !== null && selectedText !== '') {
                    addContextualButtons();

                    setTimeout(function () {
                        /// Set border radius for first and last buttons
                        tooltip.children[1].style.borderRadius = firstButtonBorderRadius;
                        tooltip.children[tooltip.children.length - 1].style.borderRadius = lastButtonBorderRadius;

                        //oldTooltips.push(tooltip);
                        document.body.appendChild(tooltip);
                        calculateTooltipPosition(e);
                    }, 1);
                } else hideTooltip();

            }, 2
        );
}

function setUpNewTooltip(type, recreated = false) {

    /// Create tooltip and it's arrow
    tooltip = document.createElement('div');
    tooltip.className = 'selection-tooltip selecton-entity';
    if (configs.buttonsStyle == 'onlyicon' || configs.buttonsStyle == 'iconlabel') tooltip.classList.add('tooltip-with-icons');
    tooltip.style.opacity = 0.0;
    tooltip.style.position = 'fixed';
    tooltip.style.transition = `opacity ${configs.animationDuration}ms ease-out, transform ${configs.animationDuration}ms ease-out`;
    if (recreated) tooltip.style.transition = `opacity ${configs.animationDuration}ms ease-out`;
    tooltip.style.transform = returnTooltipRevealTransform(false);
    tooltip.style.transformOrigin = '50% 100% 0';

    if (configs.useCustomStyle && configs.tooltipOpacity != 1.0 && configs.tooltipOpacity != 1 && configs.fullOpacityOnHover) {
        tooltip.onmouseover = function () {
            setTimeout(function () {
                if (dontShowTooltip == true) return;
                try {
                    tooltip.style.opacity = 1.0;
                } catch (e) { }
            }, 1);
        }
        tooltip.onmouseout = function () {
            setTimeout(function () {
                if (dontShowTooltip == true) return;
                try {
                    tooltip.style.opacity = configs.tooltipOpacity;
                } catch (e) { }
            }, 1);
        }
        if (configs.debugMode) {
            console.log('Selecton tooltip inactive opacity: ' + configs.tooltipOpacity.toString());
            console.log('Set tooltip opacity listeners');
        }
    }

    arrow = document.createElement('div');
    arrow.setAttribute('class', 'selection-tooltip-arrow');
    let arrowChild = document.createElement('div');
    arrowChild.setAttribute('class', 'selection-tooltip-arrow-child');

    arrow.appendChild(arrowChild);
    tooltip.appendChild(arrow);

    // Make the tooltip draggable by arrow
    if (configs.draggableTooltip) {
        arrowChild.style.cursor = 'move';
        arrowChild.onmousedown = function (e) {
            isDraggingTooltip = true;
            e.preventDefault();
            if (configs.debugMode)
                console.log('Started dragging tooltip...');

            tooltip.style.left = `0px`;
            tooltip.style.top = `0px`;
            tooltip.style.transition = `opacity ${configs.animationDuration}ms ease-in-out`;
            document.body.style.cursor = 'move';

            const tooltipOnBottom = arrow.classList.contains('arrow-on-bottom');
            tooltip.style.transform = `translate(${e.clientX - tooltip.clientWidth / 2}px, ${tooltipOnBottom ? (e.clientY + (arrow.clientHeight / 3)) : (e.clientY - tooltip.clientHeight - (arrow.clientHeight / 2))}px)`;
            tooltip.style.pointerEvents = 'none';

            document.onmousemove = function (e) {
                e.preventDefault();

                /// Move main tooltip
                tooltip.style.transform = `translate(${e.clientX - tooltip.clientWidth / 2}px, ${tooltipOnBottom ? (e.clientY + (arrow.clientHeight / 3)) : (e.clientY - tooltip.clientHeight - (arrow.clientHeight / 2))}px)`;
            };

            document.onmouseup = function (e) {
                e.preventDefault();
                document.onmousemove = null;
                document.onmouseup = null;
                isDraggingTooltip = false;
                document.body.style.cursor = 'unset';

                tooltip.style.left = `${e.clientX - tooltip.clientWidth / 2}px`;
                tooltip.style.top = `${tooltipOnBottom ? (e.clientY + (arrow.clientHeight / 3)) : (e.clientY - tooltip.clientHeight - (arrow.clientHeight / 2))}px`;
                tooltip.style.transform = null;
                tooltip.style.pointerEvents = 'auto';

                /// Recreate secondary tooltip
                if (configs.secondaryTooltipEnabled) {
                    if (secondaryTooltip !== null && secondaryTooltip !== undefined) {
                        secondaryTooltip.parentNode.removeChild(secondaryTooltip);
                        createSecondaryTooltip();
                    }
                }

                if (configs.debugMode)
                    console.log('Dragging tooltip finished');
            };
        }
    }

    /// Apply custom stylings
    if (configs.useCustomStyle) {
        if (configs.addTooltipShadow) {
            tooltip.style.boxShadow = `0 2px 7px rgba(0,0,0,${configs.shadowOpacity})`;
            arrow.style.boxShadow = `1px 1px 3px rgba(0,0,0,${configs.shadowOpacity / 1.5})`;
        }
        /// Set rounded corners for buttons
        firstButtonBorderRadius = `${configs.borderRadius / 1.5}px 0px 0px ${configs.borderRadius / 1.5}px`;
        lastButtonBorderRadius = `0px ${configs.borderRadius / 1.5}px ${configs.borderRadius / 1.5}px 0px`;
    } else {
        /// Set default corners for buttons
        firstButtonBorderRadius = '3px 0px 0px 3px';
        lastButtonBorderRadius = '0px 3px 3px 0px';
    }

    if (configs.debugMode)
        console.log('Selecton tooltip was created');

    /// Add basic buttons (Copy, Search, etc)
    addBasicTooltipButtons(type);
}

function addBasicTooltipButtons(layout) {
    if (layout == 'textfield') {
        const textField = document.activeElement;

        if (selection.toString() !== '') {
            try {
                /// Add a cut button 
                const cutButton = document.createElement('button');
                cutButton.setAttribute('class', `selection-popup-button`);
                if (configs.buttonsStyle == 'onlyicon' && configs.showButtonLabelOnHover)
                    cutButton.setAttribute('title', cutLabel);

                if (addButtonIcons)
                    cutButton.appendChild(createImageIconNew(cutButtonIcon, configs.buttonsStyle == 'onlyicon' ? '' : cutLabel));
                else
                    cutButton.textContent = cutLabel;
                cutButton.style.borderRadius = firstButtonBorderRadius;
                cutButton.addEventListener("mousedown", function (e) {
                    document.execCommand('cut');
                    hideTooltip();
                    // removeSelectionOnPage();
                });
                tooltip.appendChild(cutButton);

                /// Add copy button 
                const copyButton = document.createElement('button');
                copyButton.setAttribute('class', `selection-popup-button button-with-border`);
                if (configs.buttonsStyle == 'onlyicon' && configs.showButtonLabelOnHover)
                    copyButton.setAttribute('title', copyLabel);
                if (addButtonIcons)
                    copyButton.appendChild(createImageIconNew(copyButtonIcon, configs.buttonsStyle == 'onlyicon' ? '' : copyLabel));
                else
                    copyButton.textContent = copyLabel;

                copyButton.addEventListener("mousedown", function (e) {
                    try {
                        textField.focus();
                        document.execCommand('copy');
                        hideTooltip();
                        removeSelectionOnPage();

                    } catch (e) { console.log(e); }
                });
                if (configs.reverseTooltipButtonsOrder)
                    tooltip.insertBefore(copyButton, cutButton);
                else
                    tooltip.appendChild(copyButton);

                if (configs.addPasteButton) {
                    /// Add paste button 
                    const pasteButton = document.createElement('button');
                    pasteButton.setAttribute('class', `selection-popup-button button-with-border`);
                    if (configs.buttonsStyle == 'onlyicon' && configs.showButtonLabelOnHover)
                        pasteButton.setAttribute('title', pasteLabel);
                    if (addButtonIcons)
                        pasteButton.appendChild(createImageIconNew(pasteButtonIcon, configs.buttonsStyle == 'onlyicon' ? '' : pasteLabel));
                    else
                        pasteButton.textContent = pasteLabel;

                    pasteButton.addEventListener("mousedown", function (e) {
                        textField.focus();

                        if (textField.getAttribute('contenteditable') !== null) {
                            let currentClipboardContent = getCurrentClipboard();

                            if (currentClipboardContent !== null && currentClipboardContent !== undefined && currentClipboardContent != '')
                                document.execCommand("insertHTML", false, currentClipboardContent);
                        } else
                            document.execCommand('paste');

                        removeSelectionOnPage();
                    });
                    if (configs.reverseTooltipButtonsOrder)
                        tooltip.insertBefore(pasteButton, copyButton);
                    else
                        tooltip.appendChild(pasteButton);
                }
            } catch (e) { if (configs.debugMode) console.log(e) }

            /// Set border radius for buttons
            tooltip.children[1].style.borderRadius = firstButtonBorderRadius;
            tooltip.children[tooltip.children.length - 1].style.borderRadius = lastButtonBorderRadius;

        } else {
            if (configs.addPasteButton)
                try {
                    /// Add only paste button 
                    const pasteButton = document.createElement('button');
                    pasteButton.setAttribute('class', `selection-popup-button`);
                    pasteButton.style.borderRadius = configs.useCustomStyle ? `${configs.borderRadius}px` : '3px';

                    if (configs.buttonsStyle == 'onlyicon' && configs.showButtonLabelOnHover)
                        pasteButton.setAttribute('title', pasteLabel);

                    if (addButtonIcons)
                        pasteButton.appendChild(createImageIconNew(pasteButtonIcon, configs.buttonsStyle == 'onlyicon' ? '' : pasteLabel));
                    else
                        pasteButton.textContent = pasteLabel;

                    pasteButton.addEventListener("mousedown", function (e) {
                        textField.focus();

                        if (textField.getAttribute('contenteditable') !== null) {
                            let currentClipboardContent = getCurrentClipboard();

                            if (currentClipboardContent !== null && currentClipboardContent !== undefined && currentClipboardContent != '')
                                document.execCommand("insertHTML", false, currentClipboardContent);
                        } else
                            document.execCommand('paste');

                        removeSelectionOnPage();
                    });
                    tooltip.appendChild(pasteButton);
                } catch (e) { if (configs.debugMode) console.log(e); }
        }

    } else {
        /// Add search button
        searchButton = document.createElement('button');
        searchButton.setAttribute('class', 'selection-popup-button');

        // if (configs.showButtonLabelOnHover)
        //     searchButton.setAttribute('title', configs.preferredSearchEngine);
        if (configs.buttonsStyle == 'onlyicon' && configs.showButtonLabelOnHover)
            searchButton.setAttribute('title', searchLabel);

        if (addButtonIcons)
            searchButton.appendChild(createImageIconNew(searchButtonIcon, configs.buttonsStyle == 'onlyicon' ? '' : searchLabel));
        else
            searchButton.textContent = searchLabel;

        searchButton.addEventListener("mousedown", function (e) {
            let selectedText = selection.toString();
            onTooltipButtonClick(e, returnSearchUrl(selectedText.trim()));
        });
        tooltip.appendChild(searchButton);

        /// Add copy button 
        const copyButton = document.createElement('button');
        copyButton.setAttribute('class', `selection-popup-button button-with-border`);
        if (configs.buttonsStyle == 'onlyicon' && configs.showButtonLabelOnHover)
            copyButton.setAttribute('title', copyLabel);
        if (addButtonIcons)
            copyButton.appendChild(createImageIconNew(copyButtonIcon, configs.buttonsStyle == 'onlyicon' ? '' : copyLabel));
        else
            copyButton.textContent = copyLabel;
        copyButton.addEventListener("mousedown", function (e) {
            document.execCommand('copy');
            removeSelectionOnPage();
        });

        if (configs.reverseTooltipButtonsOrder)
            tooltip.insertBefore(copyButton, searchButton);
        else
            tooltip.appendChild(copyButton);
    }
}

function addContextualButtons() {
    if (configs.debugMode)
        console.log('Checking to add contextual buttons...');

    if (selection == null) return;

    var selectedText = selection.toString().trim();
    const loweredSelectedText = selectedText.toLowerCase();
    var wordsCount = selectedText.split(' ').length;
    let isFileName = false;

    if (convertWhenOnlyFewWordsSelected == false || wordsCount <= wordsLimitToProccessText) {
        var numberToConvert;
        var unitLabelColor = isDarkTooltip ? 'rgba(255, 255, 255, 0.75)' : 'rgba(0, 0, 0, 0.75)';
        const selectionContainsSpaces = selectedText.includes(' ');

        /// Convert currency button
        if (configs.convertCurrencies) {
            let currency, amount, currencyRate, currencySymbol;
            // var amount;
            // var currencyRate;
            // var currencySymbol;

            let match = false;

            // const keys = Object.keys(currenciesList);
            // for (let i = 0, l = keys.length; i < l; i++) {
            //     let key = keys[i];
            //     let value = currenciesList[key];

            for (const [key, value] of Object.entries(currenciesList)) {
                if (selectedText.includes(' ' + key) || (value["currencySymbol"] !== undefined && selectedText.includes(value["currencySymbol"]))) {
                    if (configs.debugMode) console.log('found currency match for: ' + (selectedText.includes(key) ? key : value['currencySymbol']));
                    match = true;
                } else {
                    const currencyKeywords = value["currencyKeywords"];
                    if (currencyKeywords !== null && currencyKeywords !== undefined)
                        for (i in currencyKeywords) {
                            if (loweredSelectedText.includes(currencyKeywords[i])) {
                                if (configs.debugMode) console.log('found currency match for: ' + currencyKeywords[i]);
                                match = true;
                            }
                        }
                }

                if (match) {
                    currency = key;
                    currencyRate = value["rate"];
                    currencySymbol = value["currencySymbol"];

                    /// Special handling for prices where coma separates fractional digits instead of thousandths
                    if (selectedText.includes(',')) {
                        let parts = selectedText.split(',');
                        if (parts.length == 2) {
                            if (parts[1].match(/[+-]?\d+(\.\d)?/g).join('').length < 3) {
                                selectedText = selectedText.replaceAll(',', '.');
                            }
                        }
                    }

                    /// Find the amount
                    amount = extractAmountFromSelectedText(selectedText);
                    break;
                }
            }

            if (currency !== undefined && currency !== configs.convertToCurrency && amount !== null && amount !== undefined) {

                /// Rates are already locally stored (should be initially)
                if (currencyRate !== null && currencyRate !== undefined) {
                    if (configs.debugMode) {
                        console.log(`Found rate for currency ${currency}: ${currencyRate}`);
                        console.log('User currency is: ' + configs.convertToCurrency);
                    }

                    // for (const [key, value] of Object.entries(currenciesList)) {
                    // if (key == configs.convertToCurrency && value['rate'] !== null && value['rate'] !== undefined) {
                    const value = currenciesList[configs.convertToCurrency];
                    if (value && value['rate'] !== null && value['rate'] !== undefined) {

                        let rateOfDesiredCurrency = value['rate'];

                        /// Check for literal multipliers (million, billion and so on)
                        for (i in billionMultipliers) { if (loweredSelectedText.includes(billionMultipliers[i])) { amount *= 1000000000; break; } }
                        for (i in millionMultipliers) { if (loweredSelectedText.includes(millionMultipliers[i].toLowerCase())) { amount *= 1000000; break; } }
                        for (i in thousandMultipliers) { if (loweredSelectedText.includes(thousandMultipliers[i].toLowerCase())) { amount *= 1000; break; } }

                        let resultingRate = rateOfDesiredCurrency / currencyRate;
                        if (configs.debugMode) console.log('conversion rate: ' + resultingRate);
                        let convertedAmount = amount * resultingRate;

                        if (convertedAmount !== null && convertedAmount !== undefined && convertedAmount.toString() !== 'NaN' && convertedAmount.toString() !== '') {
                            /// Round result
                            try {
                                convertedAmount = parseFloat(convertedAmount);
                                convertedAmount = convertedAmount.toFixed(2);
                            } catch (e) { console.log(e); }

                            /// Separate resulting numbers in groups of 3 digits
                            let convertedAmountString = convertedAmount.toString();
                            convertedAmountString = splitNumberInGroups(convertedAmountString);

                            /// Create and add currency button with result of conversion
                            const currencyButton = document.createElement('button');
                            currencyButton.setAttribute('class', 'selection-popup-button button-with-border');

                            /// Show value before convertion
                            if (configs.showUnconvertedValue) {
                                if (configs.preferCurrencySymbol && currencySymbol !== undefined)
                                    currencyButton.textContent = ` ${amount} ${currencySymbol} →`;
                                else
                                    currencyButton.textContent = ` ${amount} ${currency} →`;
                            }

                            /// Show value after converion
                            const converted = document.createElement('span');
                            const currencySymbolToUse = currenciesList[configs.convertToCurrency]['currencySymbol'];

                            if (configs.preferCurrencySymbol && currencySymbolToUse !== undefined)
                                converted.textContent = ` ${convertedAmountString}`;
                            else
                                converted.textContent = ` ${convertedAmountString}`;

                            converted.classList.add('color-highlight');
                            currencyButton.appendChild(converted);

                            /// Add currency symbol with different color
                            const currencyLabel = document.createElement('span');
                            currencyLabel.textContent = ` ${configs.preferCurrencySymbol ? currencySymbolToUse : configs.convertToCurrency}`;
                            currencyLabel.style.color = unitLabelColor;
                            currencyButton.appendChild(currencyLabel);

                            currencyButton.addEventListener("mousedown", function (e) {
                                let url = returnSearchUrl(`${amount + ' ' + currency} to ${configs.convertToCurrency}`);
                                onTooltipButtonClick(e, url, convertedAmountString + ` ${configs.convertToCurrency}`);
                            });

                            if (configs.reverseTooltipButtonsOrder)
                                tooltip.insertBefore(currencyButton, tooltip.children[1]);
                            else
                                tooltip.appendChild(currencyButton);

                            /// Correct tooltip's dx
                            tooltip.style.left = `${(parseFloat(tooltip.style.left.replaceAll('px', ''), 10) - (currencyButton.clientWidth / 2))}px`;

                            /// Correct last button's border radius
                            tooltip.children[tooltip.children.length - 2].style.borderRadius = '0px';
                            tooltip.children[tooltip.children.length - 1].style.borderRadius = lastButtonBorderRadius;
                        }
                    }
                }
            }
        }

        /// Unit conversion button
        if (configs.convertMetrics) {
            let convertedNumber;
            let fromUnit;
            let convertedUnit;

            /// Feet ' and inches " handling
            if (!selectionContainsSpaces && configs.preferredMetricsSystem == 'metric' && /['||"]/.test(selectedText)) /// don't proccess if text includes letters
                // if (!/[a-zA-Z]/g.test(selectedText) && !/[а-яА-Я]/g.test(selectedText))
                if (!/[a-zA-Z]/g.test(selectedText))
                    if (selectedText.includes("'")) {
                        let feet;
                        let inches;

                        let parts = selectedText.split("'");
                        if (parts.length == 2 || parts.length == 4) {
                            feet = extractAmountFromSelectedText(parts[0]);
                            inches = extractAmountFromSelectedText(parts[1].split('"')[0])
                        } else if (parts.length == 1) {
                            /// Only feet available
                            feet = extractAmountFromSelectedText(parts[0]);
                        }

                        if (feet !== null) {
                            if (inches == null) inches = 0.0;
                            convertedNumber = (feet * convertionUnits['feet']['ratio'] * 100) + (inches * convertionUnits['inch']['ratio']);
                            fromUnit = '';
                            convertedUnit = 'cm';
                            numberToConvert = selectedText;
                        }

                    } else if (selectedText.includes('"')) {
                        /// Only inches present
                        let parts = selectedText.split('"')

                        if (parts.length == 2) {
                            inches = extractAmountFromSelectedText(selectedText);
                            convertedNumber = inches * convertionUnits['inch']['ratio'];
                            fromUnit = '';
                            convertedUnit = 'cm';
                            numberToConvert = selectedText;
                        }
                    }

            /// Basic unit conversion
            // outerloop: for (const [key, value] of Object.entries(convertionUnits)) {

            /// Check for keywords in text
            let includesKeyword = false;

            const unitsKeywords = configs.preferredMetricsSystem == 'metric' ? convertionUnits : imprerialConvertionUnits;
            const unitKeys = Object.keys(unitsKeywords);

            for (let i = 0, l = unitKeys.length; i < l; i++) {
                const key = unitKeys[i];

                let nonConvertedUnit = key;
                if (selectedText.includes(nonConvertedUnit)) {
                    if ((nonConvertedUnit == 'pound') && tooltip.children.length == 4) return;
                    if (configs.debugMode) console.log('found key: ' + nonConvertedUnit);
                    includesKeyword = i; break;
                } else if (unitsKeywords[key]['variations']) {
                    const keyVariations = unitsKeywords[key]['variations'];

                    for (let i2 = 0, l2 = keyVariations.length; i2 < l2; i2++) {
                        if (selectedText.includes(keyVariations[i2])) {
                            if (configs.debugMode) console.log('found key: ' + keyVariations[i2]);
                            includesKeyword = i; break;
                        }
                    }
                }
            }

            /// Calculate value
            if (includesKeyword !== false) {
                /// Special handling for prices where coma separates fractional digits instead of thousandths
                if (selectedText.includes(',')) {
                    let parts = selectedText.split(',');
                    if (parts.length == 2)
                        selectedText = selectedText.replaceAll(',', '.');
                }

                numberToConvert = extractAmountFromSelectedText(selectedText);

                if (numberToConvert !== null && numberToConvert !== '' && numberToConvert !== NaN && numberToConvert !== undefined) {
                    let key = unitKeys[includesKeyword];
                    let value = unitsKeywords[key];

                    /// Check selected text for literal multipliers
                    for (i in billionMultipliers) { if (loweredSelectedText.includes(billionMultipliers[i])) { numberToConvert *= 1000000000; break; } }
                    for (i in millionMultipliers) { if (loweredSelectedText.includes(millionMultipliers[i].toLowerCase())) { numberToConvert *= 1000000; break; } }
                    for (i in thousandMultipliers) { if (loweredSelectedText.includes(thousandMultipliers[i].toLowerCase())) { numberToConvert *= 1000; break; } }

                    fromUnit = key;
                    convertedUnit = value['convertsTo'];

                    if (fromUnit.includes('°')) {
                        convertedNumber = value['convertFunction'](numberToConvert);
                    } else {
                        convertedNumber = configs.preferredMetricsSystem == 'metric' ? numberToConvert * value['ratio'] : numberToConvert / value['ratio'];
                    }
                }
            }

            /// Show result button
            if (convertedNumber !== null && convertedNumber !== undefined && convertedNumber !== 0 && !isNaN(convertedNumber)) {
                /// Round doubles to the first 2 symbols after dot
                convertedNumber = convertedNumber.toFixed(2);

                /// Separate resulting numbers in groups of 3 digits
                convertedNumber = splitNumberInGroups(convertedNumber.toString());

                const interactiveButton = document.createElement('button');
                interactiveButton.setAttribute('class', 'selection-popup-button button-with-border');
                if (configs.showUnconvertedValue)
                    interactiveButton.textContent = numberToConvert + ' ' + fromUnit + ' →';

                const converted = document.createElement('span');
                // converted.textContent = ` ${convertedNumber} ${convertedUnit}`;
                converted.textContent = ` ${convertedNumber}`;
                converted.classList.add('color-highlight');
                interactiveButton.appendChild(converted);

                const unitLabelEl = document.createElement('span');
                unitLabelEl.textContent = ` ${convertedUnit}`;
                // unitLabelEl.setAttribute('style', `color: ${unitLabelColor}`);
                unitLabelEl.style.color = unitLabelColor;
                interactiveButton.appendChild(unitLabelEl);

                interactiveButton.addEventListener("mousedown", function (e) {
                    let url = returnSearchUrl(`${numberToConvert + ' ' + fromUnit.trim()} to ${convertedUnit}`);
                    onTooltipButtonClick(e, url, `${convertedNumber} ${convertedUnit}`);
                });

                if (configs.reverseTooltipButtonsOrder)
                    tooltip.insertBefore(interactiveButton, tooltip.children[1]);
                else
                    tooltip.appendChild(interactiveButton);
            }
        }

        /// Phone number button
        if (configs.addPhoneButton && selectedText.includes('+') && !selectionContainsSpaces && selectedText.length == 13 && selectedText[0] == '+') {
            const phoneButton = document.createElement('button');
            phoneButton.setAttribute('class', `selection-popup-button button-with-border`);
            phoneButton.appendChild(createImageIconNew(phoneIcon, selectedText));
            phoneButton.classList.add('color-highlight');
            phoneButton.addEventListener("mousedown", function (e) {
                hideTooltip();
                removeSelectionOnPage();

                /// Open system handler
                window.open(`tel:${selectedText}`);
                // onTooltipButtonClick(e, `tel:${selectedText.trim()}`);
            });
            if (configs.reverseTooltipButtonsOrder)
                tooltip.insertBefore(phoneButton, tooltip.children[1]);
            else
                tooltip.appendChild(phoneButton);
        }

        /// Do simple math calculations
        if (numberToConvert == null && configs.performSimpleMathOperations && selectedText[0] !== '+' && !selectedText.includes('{')) {
            if (selectedText.includes('+') || selectedText.includes('-') || selectedText.includes('*') || selectedText.includes('^'))
                try {
                    let numbersFromString = selectedText.match(/[+-]?\d+(\.\d)?/g);

                    if (numbersFromString != null && numbersFromString.length > 0) {
                        let calculatedExpression = calculateString(selectedText.replaceAll(' ', '').replaceAll('}', ''));
                        if (calculatedExpression !== null && calculatedExpression !== undefined && calculatedExpression !== '' && calculatedExpression !== NaN) {

                            let number;
                            let numbersArray = calculatedExpression.toString().match(/[+-]?\d+(\.\d)?/g);
                            number = numbersArray[0];

                            if (number !== null) {
                                const interactiveButton = document.createElement('button');
                                interactiveButton.setAttribute('class', 'selection-popup-button button-with-border');
                                if (configs.showUnconvertedValue)
                                    interactiveButton.textContent = selectedText + ' →';

                                const converted = document.createElement('span');
                                converted.textContent = ` ${calculatedExpression}`;
                                converted.classList.add('color-highlight');
                                interactiveButton.appendChild(converted);

                                interactiveButton.addEventListener("mousedown", function (e) {
                                    let url = returnSearchUrl(selectedText.replaceAll('+', '%2B'));
                                    onTooltipButtonClick(e, url, calculatedExpression);
                                });

                                if (configs.reverseTooltipButtonsOrder)
                                    tooltip.insertBefore(interactiveButton, tooltip.children[1]);
                                else
                                    tooltip.appendChild(interactiveButton);
                                try {
                                    tooltip.style.left = `${(parseInt(tooltip.style.left.replaceAll('px', ''), 10) - interactiveButton.clientWidth - 5) * 2}px`;
                                } catch (e) {
                                    if (configs.debugMode)
                                        console.log(e);
                                }
                            }
                        }
                    }
                } catch (e) {
                    if (configs.debugMode)
                        console.log(e);
                }
        }

        /// Add "open on map" button
        if (configs.showOnMapButtonEnabled) {
            let containsAddress = false;

            for (let i = 0, l = addressKeywords.length; i < l; i++) {
                if (loweredSelectedText.includes(addressKeywords[i])) {
                    containsAddress = true; break;
                }
            }

            if (containsAddress) {
                const mapButton = document.createElement('button');
                mapButton.setAttribute('class', `selection-popup-button button-with-border`);
                if (configs.buttonsStyle == 'onlyicon' && configs.showButtonLabelOnHover)
                    mapButton.setAttribute('title', showOnMapLabel);

                if (addButtonIcons)
                    mapButton.appendChild(createImageIconNew(mapButtonIcon, configs.buttonsStyle == 'onlyicon' ? '' : showOnMapLabel));
                else
                    mapButton.textContent = showOnMapLabel;
                mapButton.addEventListener("mousedown", function (e) {
                    /// Open maps service set by user (defaults to Google Maps)
                    let url = returnShowOnMapUrl(selectedText);
                    onTooltipButtonClick(e, url);
                });

                if (configs.reverseTooltipButtonsOrder)
                    tooltip.insertBefore(mapButton, tooltip.children[1]);
                else
                    tooltip.appendChild(mapButton);

                /// Correct tooltip's dx
                tooltip.style.left = `${(parseFloat(tooltip.style.left.replaceAll('px', ''), 10) - (mapButton.clientWidth / 2))}px`;

                /// Correct last button's border radius
                tooltip.children[tooltip.children.length - 2].style.borderRadius = '0px';
                tooltip.children[tooltip.children.length - 1].style.borderRadius = lastButtonBorderRadius;
            }
        }

        /// Add email button
        if (configs.showEmailButton && selectedText.includes('@') && !selectionContainsSpaces) {
            const splitedByAt = selectedText.split('@');
            if (splitedByAt.length == 2 && splitedByAt[1].includes('.'))
                try {
                    const emailText = loweredSelectedText;
                    const emailButton = document.createElement('button');
                    emailButton.setAttribute('class', 'selection-popup-button button-with-border');

                    if (configs.buttonsStyle == 'onlylabel') {
                        emailButton.textContent = chrome.i18n.getMessage('email') + ' ';

                        let emailLabel = document.createElement('div');
                        emailLabel.style.display = 'inline';
                        emailLabel.textContent = emailText.length > linkSymbolsToShow ? emailText.substring(0, linkSymbolsToShow) + '...' : emailText;
                        emailLabel.classList.add('color-highlight');

                        /// Add tooltip with full website on hover
                        if (emailText.length > linkSymbolsToShow)
                            emailButton.setAttribute('title', emailText);
                        emailButton.appendChild(emailLabel);
                    }
                    else {
                        emailButton.appendChild(createImageIconNew(emailButtonIcon, (emailText.length > linkSymbolsToShow ? emailText.substring(0, linkSymbolsToShow) + '...' : emailText), true));
                        emailButton.classList.add('color-highlight');
                    }


                    emailButton.addEventListener("mousedown", function (e) {
                        let url = returnNewEmailUrl(emailText);
                        onTooltipButtonClick(e, url);
                    });

                    if (configs.reverseTooltipButtonsOrder)
                        tooltip.insertBefore(emailButton, tooltip.children[1]);
                    else
                        tooltip.appendChild(emailButton);

                    /// Correct tooltip's dx
                    tooltip.style.left = `${(parseFloat(tooltip.style.left.replaceAll('px', ''), 10) - (emailButton.clientWidth / 2))}px`;

                    /// Correct last button's border radius
                    tooltip.children[tooltip.children.length - 2].style.borderRadius = '0px';
                    tooltip.children[tooltip.children.length - 1].style.borderRadius = lastButtonBorderRadius;
                } catch (error) {
                    console.log(error);
                }
        }

        /// Add HEX color preview button
        if (configs.addColorPreviewButton && ((selectedText.includes('#') && !selectionContainsSpaces && selectedText.length == 7) || (selectedText.includes('rgb') && selectedText.includes('(')))) {
            try {
                let colorText;
                if (selectedText.includes('rgb')) {
                    /// Try to convert rgb value to hex
                    try {
                        let string = selectedText.toUpperCase().split('(')[1].split(')')[0];
                        let colors = string.replaceAll(' ', '').split(',');
                        for (i in colors) {
                            colors[i] = parseInt(colors[i], 10);
                        }
                        colorText = rgbToHex(colors[0], colors[1], colors[2]).toUpperCase();
                    } catch (e) {
                        colorText = selectedText.toUpperCase();
                    }
                } else
                    colorText = selectedText.toUpperCase().replaceAll(',', '').replaceAll('.', '').replaceAll("'", "").replaceAll('"', '');

                colorText = colorText.toLowerCase();
                const colorButton = document.createElement('button');
                colorButton.setAttribute('class', 'selection-popup-button button-with-border');

                const colorCircle = document.createElement('div');
                colorCircle.setAttribute('class', `selection-popup-color-preview-circle`);
                colorCircle.style.background = colorText;

                /// Add red/green/blue tooltip on hover
                const rgbColor = hexToRgb(colorText);
                colorButton.setAttribute('title', `red: ${rgbColor.red}, green: ${rgbColor.green}, blue: ${rgbColor.blue}`);

                colorButton.appendChild(colorCircle);
                colorButton.insertAdjacentHTML('beforeend', ' ' + (colorText.length > linkSymbolsToShow ? colorText.substring(0, linkSymbolsToShow) + '...' : colorText));
                colorButton.classList.add('color-highlight');

                colorButton.addEventListener("mousedown", function (e) {
                    let url = returnSearchUrl(colorText.replaceAll('#', '%23'), false);
                    onTooltipButtonClick(e, url, colorText);
                });

                if (configs.reverseTooltipButtonsOrder)
                    tooltip.insertBefore(colorButton, tooltip.children[1]);
                else
                    tooltip.appendChild(colorButton);

                /// Correct tooltip's dx
                tooltip.style.left = `${(parseFloat(tooltip.style.left.replaceAll('px', ''), 10) - (colorButton.clientWidth / 2))}px`;

                /// Correct last button's border radius
                tooltip.children[tooltip.children.length - 2].style.borderRadius = '0px';
                tooltip.children[tooltip.children.length - 1].style.borderRadius = lastButtonBorderRadius;
            } catch (error) {
                console.log(error);
            }
        }

        /// Time convert button
        if (configs.convertTime) {
            try {
                let textToProccess = selectedText;

                /// 12H - 24H conversion
                // let numbers = extractAmountFromSelectedText(textToProccess);   /// Check if selected text contains numbers

                // if (numbers !== null) {
                if (configs.preferredMetricsSystem == 'metric') {
                    if (textToProccess.includes(' PM') || textToProccess.includes(' AM')) {
                        if (configs.debugMode)
                            console.log('converting from 12h to 24...');
                        // textToProccess = textToProccess.replaceAll(numbers + (textToProccess.includes('PM') ? ' PM' : ' AM'), convertTime12to24(textToProccess))
                        textToProccess = convertTime12to24(textToProccess);
                        if (configs.debugMode)
                            console.log('result: ' + textToProccess);
                    }
                } else {
                    if (textToProccess.includes(':') && !textToProccess.includes(' ') && !textToProccess.includes('AM') && !textToProccess.includes('PM')) {
                        if (configs.debugMode)
                            console.log('converting from 12h to 24...');
                        // textToProccess = textToProccess.replaceAll(numbers.join(':'), convertTime24to12(textToProccess))
                        textToProccess = convertTime24to12(textToProccess);

                        if (configs.debugMode)
                            console.log('result: ' + textToProccess);
                    }
                }
                // }

                const timeZoneKeywordsKeys = Object.keys(timeZoneKeywords);
                let convertedTime, timeWord, marker;

                for (let i = 0, l = timeZoneKeywordsKeys.length; i < l; i++) {
                    marker = timeZoneKeywordsKeys[i];

                    if (selectedText.includes(' ' + marker)) {
                        let words = selectedText.trim().split(' ');

                        for (i in words) {
                            let word = words[i];

                            if (word.includes(':')) {
                                timeWord = word;
                                break;
                            }
                        }


                        if (timeWord !== null && timeWord !== undefined && timeWord !== '') {
                            let numbers = timeWord.split(':');

                            if (numbers.length == 2 || numbers.length == 3) {

                                let today = new Date();
                                if (configs.debugMode) {
                                    console.log('today:');
                                    console.log(today);
                                }

                                let modifier = selectedText.includes(' PM') ? ' PM' : selectedText.includes(' AM') ? ' AM' : '';
                                let dateStringWithTimeReplaced = `${today.getMonth() + 1}/${today.getDate()}/${today.getFullYear()} ${numbers[0]}:${numbers[1]}${modifier} ${timeZoneKeywords[marker]}`;

                                if (configs.debugMode) {
                                    console.log('setting date from:');
                                    console.log(dateStringWithTimeReplaced);
                                }

                                let d = new Date(dateStringWithTimeReplaced); /// '6/29/2011 4:52:48 PM UTC'
                                if (configs.debugMode) {
                                    console.log('setted date:');
                                    console.log(d.toString())
                                }

                                convertedTime = d.toLocaleTimeString().substring(0, 5);
                                if (configs.debugMode) {
                                    console.log('converted time:');
                                    console.log(convertedTime);
                                }
                            }
                        }
                        break;
                    }
                }

                if ((convertedTime !== null && convertedTime !== undefined && convertedTime !== '' && convertedTime !== 'Inval') || textToProccess !== selectedText) {
                    const timeButton = document.createElement('button');
                    timeButton.setAttribute('class', `selection-popup-button button-with-border`);
                    timeButton.classList.add('color-highlight');

                    const timeStringToShow = textToProccess.match(/[+-]?\d+(\.\d)?/g).slice(0, 2).join(':');

                    if (addButtonIcons)
                        timeButton.appendChild(createImageIconNew(clockIcon, convertedTime ?? timeStringToShow, true));
                    else
                        timeButton.textContent = convertedTime ?? timeStringToShow;

                    timeButton.addEventListener("mousedown", function (e) {
                        hideTooltip();
                        removeSelectionOnPage();

                        /// Open system handler
                        if (convertedTime !== null && convertedTime !== undefined && convertedTime !== '' && convertedTime !== 'Inval')
                            onTooltipButtonClick(e, returnSearchUrl(timeWord ? `${timeWord} ${marker}` : textToProccess), convertedTime ?? timeStringToShow)
                        else
                            onTooltipButtonClick(e, returnSearchUrl(timeWord ? `${timeWord} ${marker}` : textToProccess), convertedTime ?? timeStringToShow)

                    });
                    if (configs.reverseTooltipButtonsOrder)
                        tooltip.insertBefore(timeButton, tooltip.children[1]);
                    else
                        tooltip.appendChild(timeButton);
                }

            } catch (e) { if (configs.debugMode) console.log(e); }
        }

        /// Add 'open link' button
        if (configs.addOpenLinks)
            if (!selectionContainsSpaces && selectedText.includes('.') && tooltip.children.length < 4) {
                let link = selectedText;
                const splittedByDots = link.split('.');
                let domain = splittedByDots[1], domainLength = splittedByDots[1].length;

                if (selectedText.includes('://') || (splittedByDots.length == 2 && domainLength > 1 && domainLength < 4 && !isStringNumeric(domain))) {

                    /// Don't recognize if selected text looks like filename
                    for (let i = 0, l = filetypesToIgnoreAsDomains.length; i < l; i++) {
                        if (domain.includes(filetypesToIgnoreAsDomains[i])) {
                            isFileName = true;
                            break;
                        }
                    }

                    if (isFileName == false) {
                        link = link.replaceAll(',', '').replaceAll(')', '').replaceAll('(', '').replaceAll(`\n`, ' ');
                        let linkLength = link.length;
                        let lastSymbol = link[linkLength - 1];

                        if (lastSymbol == '.' || lastSymbol == ',')
                            link = link.substring(0, linkLength - 1);

                        /// Remove '/' on the end of link, just for better looks in pop-up
                        lastSymbol = link[link.length - 1];
                        if (lastSymbol == '/')
                            link = link.substring(0, link.length - 1);

                        /// Remove quotes in start and end of the link
                        const firstSymbol = link[0];
                        linkLength = link.length;
                        lastSymbol = link[linkLength - 1];
                        if (firstSymbol == "'" || firstSymbol == '"' || firstSymbol == '«' || firstSymbol == '“')
                            link = link.substring(1, linkLength);
                        if (lastSymbol == "'" || lastSymbol == '"' || lastSymbol == "»" || lastSymbol == '”')
                            link = link.substring(0, linkLength - 1);

                        try {
                            /// Filtering out non-links
                            const lastWordAfterDot = splittedByDots[splittedByDots.length - 1];

                            if ((1 < lastWordAfterDot.length < 4) || lastWordAfterDot.includes('/') || link.includes('://')) {
                                /// Adding  open link button
                                const interactiveButton = document.createElement('button');
                                interactiveButton.setAttribute('class', 'selection-popup-button button-with-border');
                                let linkText = document.createElement('div');
                                linkText.style.display = 'inline';
                                linkText.textContent = link.length > linkSymbolsToShow ? link.substring(0, linkSymbolsToShow) + '...' : link;
                                linkText.classList.add('color-highlight');

                                /// Add tooltip with full website on hover
                                if (link.length > linkSymbolsToShow)
                                    interactiveButton.setAttribute('title', link);

                                if (addButtonIcons)
                                    interactiveButton.appendChild(createImageIconNew(openLinkButtonIcon, undefined, true));
                                else interactiveButton.textContent = openLinkLabel + ' ';

                                interactiveButton.appendChild(linkText);
                                interactiveButton.addEventListener("mousedown", function (e) {
                                    if (!link.includes('://') && !link.includes('about:'))
                                        link = 'https://' + link;

                                    onTooltipButtonClick(e, link);
                                });

                                if (configs.reverseTooltipButtonsOrder)
                                    tooltip.insertBefore(interactiveButton, tooltip.children[1]);
                                else
                                    tooltip.appendChild(interactiveButton);
                            }
                        } catch (e) { console.log(e) }
                    }

                }
            }
    }

    /// Add Translate button when enabled, and no other contextual buttons were added 
    if (configs.showTranslateButton && tooltip.children.length < 4 && isFileName == false) {
        addTranslateButton();
    }

}

function calculateTooltipPosition(e) {
    const selStartDimensions = getSelectionCoordinates(true);
    const selEndDimensions = getSelectionCoordinates(false);

    tooltipOnBottom = false;
    let canAddDragHandles = true;
    if (selStartDimensions.dontAddDragHandles) canAddDragHandles = false;
    let dyForFloatingTooltip = 15;
    let dyWhenOffscreen = window.innerHeight / 3;

    let dxToShowTooltip, dyToShowTooltip;

    if (configs.tooltipPosition == 'overCursor' && e.clientX < window.innerWidth - 30) {

        /// Show it on top of selection, dx aligned to cursor
        // showTooltip(e.clientX - tooltip.clientWidth / 2, selStartDimensions.dy - tooltip.clientHeight - (arrow.clientHeight / 1.5) - 2);

        dyToShowTooltip = selStartDimensions.dy - tooltip.clientHeight - (arrow.clientHeight / 1.5) - 2;
        let vertOutOfView = dyToShowTooltip <= 0;

        if (vertOutOfView || (selStartDimensions.dy < selEndDimensions.dy && selEndDimensions.backwards !== true)) {
            /// show tooltip under selection

            let possibleDyToShowTooltip = selEndDimensions.dy + tooltip.clientHeight + 5;

            if (possibleDyToShowTooltip < window.innerHeight) {
                dyToShowTooltip = possibleDyToShowTooltip;
                tooltipOnBottom = true;
                arrow.classList.add('arrow-on-bottom');
            }
        }

        /// Check to be off-screen on top
        if (dyToShowTooltip < 0 && tooltipOnBottom == false) dyToShowTooltip = dyWhenOffscreen;

        /// Calculating DX
        dxToShowTooltip = e.clientX - tooltip.clientWidth / 2;

    } else {
        /// Calculating DY
        dyToShowTooltip = selStartDimensions.dy - tooltip.clientHeight - arrow.clientHeight;

        /// If tooltip is going off-screen on top...
        let vertOutOfView = dyToShowTooltip <= 0;
        if (vertOutOfView) {
            /// check to display on bottom
            let resultingDyOnBottom = selEndDimensions.dy + tooltip.clientHeight + arrow.clientHeight;
            if (resultingDyOnBottom < window.innerHeight) {
                dyToShowTooltip = resultingDyOnBottom;
                arrow.classList.add('arrow-on-bottom');
                tooltipOnBottom = true;
            } else {
                /// if it will be off-screen as well, use off-screen dy
                dyToShowTooltip = dyWhenOffscreen;
            }
        }

        /// Add small padding
        dyToShowTooltip = dyToShowTooltip + 2;

        /// Calculating DX
        try {
            /// New approach - place tooltip in horizontal center between two selection handles
            const delta = selEndDimensions.dx > selStartDimensions.dx ? selEndDimensions.dx - selStartDimensions.dx : selStartDimensions.dx - selEndDimensions.dx;

            if (selEndDimensions.dx > selStartDimensions.dx)
                dxToShowTooltip = selStartDimensions.dx + (delta / 2) - (tooltip.clientWidth / 2);
            else
                dxToShowTooltip = selEndDimensions.dx + (delta / 2) - (tooltip.clientWidth / 2);
        } catch (e) {
            if (configs.debugMode)
                console.log(e);

            /// Fall back to old approach - place tooltip in horizontal center selection rect,
            /// which may be in fact bigger than visible selection
            const selDimensions = getSelectionRectDimensions();
            dxToShowTooltip = selDimensions.dx + (selDimensions.width / 2) - (tooltip.clientWidth / 2);
        }
    }

    if (configs.floatingOffscreenTooltip) {
        /// Keep panel floating when off-screen
        floatingTooltipTop = false; floatingTooltipBottom = false;
        if (dyToShowTooltip < 0) {
            dyToShowTooltip = dyForFloatingTooltip;
            floatingTooltipTop = window.scrollY;
            tooltip.children[2].setAttribute('title', selectedText.length < 300 ? selectedText : selectedText.substring(0, 300) + ' ...');
        } else if (dyToShowTooltip > window.innerHeight) {
            dyToShowTooltip = window.innerHeight - (tooltip.clientHeight ?? 50) - dyForFloatingTooltip;
            floatingTooltipBottom = window.scrollY;
            tooltip.children[2].setAttribute('title', selectedText.length < 300 ? selectedText : selectedText.substring(0, 300) + ' ...');
        }
    }

    showTooltip(dxToShowTooltip, dyToShowTooltip);

    if (configs.addDragHandles && canAddDragHandles)
        setDragHandles(selStartDimensions, selEndDimensions);

    setTimeout(function () {
        checkTooltipForCollidingWithSideEdges();
    }, 2);
}

function showTooltip(dx, dy) {
    tooltip.style.pointerEvents = 'auto';
    tooltip.style.top = `${dy}px`;
    tooltip.style.left = `${dx}px`;
    tooltip.style.opacity = configs.useCustomStyle ? configs.tooltipOpacity : 1.0;

    if (configs.tooltipRevealEffect == 'moveUpTooltipEffect') {
        /// Make tooltip not-interactive in first half of animation
        tooltip.style.pointerEvents = 'none';
        setTimeout(function () {
            if (tooltip !== null)
                tooltip.style.pointerEvents = 'all';
        }, configs.animationDuration);
    }

    /// Set reveal animation type
    tooltip.style.transform = returnTooltipRevealTransform(true);

    /// Selection change listener
    setTimeout(function () {
        document.addEventListener("selectionchange", selectionChangeListener);
    }, 300)

    if (configs.debugMode)
        console.log('Selecton tooltip is shown');
    tooltipIsShown = true;

    /// Check for website existing tooltip
    if (configs.shiftTooltipWhenWebsiteHasOwn && configs.tooltipPosition !== 'overCursor')
        setTimeout(function () {

            /// Experimental code to determine website's own selection tooltip
            const websiteTooltips = document.querySelectorAll(`[style*='position: absolute'][style*='transform'],[class^='popup popup_warning']`);

            let websiteTooltip;
            if (websiteTooltips !== null && websiteTooltips !== undefined)
                for (let i = 0, l = websiteTooltips.length; i < l; i++) {
                    const el = websiteTooltips[i];
                    let elementClass;
                    try {
                        elementClass = el.getAttribute('class');
                    } catch (e) { }

                    if (elementClass !== null && elementClass !== undefined && elementClass.toString().includes('selection-tooltip')) {

                    } else if (el.style !== undefined) {
                        let transformStyle;
                        let elementStyle;

                        try {
                            transformStyle = el.style.transform.toString();
                            elementStyle = el.getAttribute('style').toString();
                        } catch (e) { }

                        // if (elStyle !== null && elStyle !== undefined && elStyle.includes('translate3d')) {
                        // if (!el.getAttribute('class').toString().includes('selection-tooltip'))
                        if (elementStyle == undefined) continue;
                        if ((elementStyle.includes('position: absolute') && transformStyle !== null && transformStyle !== undefined && transformStyle.includes('translate') && transformStyle !== 'translateY(0px)' && transformStyle !== 'translate(0px, 0px)')
                            || (elementStyle.includes('left:') && elementStyle.includes('top:'))
                        ) {
                            if (el.clientHeight < 100 && el.clientHeight > 5 && el.clientWidth > 20 && el.getAttribute('id') !== 'cmg-fullscreen-image') {
                                if (configs.debugMode) {
                                    console.log('Detected selection tooltip on the website with following style:');
                                    console.log(elementStyle);
                                }

                                websiteTooltip = el;
                                break;
                            }
                        }
                    }
                };

            if (websiteTooltip !== null && websiteTooltip !== undefined) {
                tooltip.style.transition = `top 200ms ease-out, opacity ${configs.animationDuration}ms ease-out, transform 200ms ease-out`;
                tooltip.style.top = `${dy - websiteTooltip.clientHeight}px`;

                arrow.style.opacity = 1.0;
                arrow.style.transition = 'opacity 200ms ease-out';
                arrow.style.opacity = 0.0;

                setTimeout(function () {
                    tooltip.style.transition = `opacity ${configs.animationDuration}ms ease-out, transform 200ms ease-out`;
                    arrow.remove();
                }, 200);
            } else {
                // arrow.style.opacity = 1.0;
                if (configs.debugMode) console.log('Selecton didnt found any website tooltips');
            }

        }, configs.animationDuration);

    /// Create secondary tooltip (for custom search options)
    /// Add a delay to be sure currency and translate buttons were already added
    if (configs.secondaryTooltipEnabled && configs.customSearchButtons !== null && configs.customSearchButtons !== undefined && configs.customSearchButtons !== [])
        setTimeout(function () {
            try {
                createSecondaryTooltip();
            } catch (e) { console.log(e); }
        }, 3);
}

function hideTooltip(animated = true) {
    if (tooltip == null || tooltip == undefined) return;

    document.removeEventListener("selectionchange", selectionChangeListener);

    if (configs.debugMode) {
        console.log('--- Hiding Selecton tooltips ---');
        console.log('Checking for existing tooltips...');
    }

    /// Hide all tooltips
    let oldTooltips = document.querySelectorAll('.selecton-entity');
    // if (configs.debugMode) {
    //     console.log(`Found ${oldTooltips.length} Selecton tooltips:`);
    //     if (oldTooltips.length !== 0)
    //         console.log(oldTooltips);
    // }

    if (oldTooltips !== null && oldTooltips.length !== 0) {
        tooltipIsShown = false;

        if (configs.debugMode)
            console.log(`Found ${oldTooltips.length} tooltips to hide`);

        for (let i = 0, l = oldTooltips.length; i < l; i++) {
            let oldTooltip = oldTooltips[i];
            if (!animated)
                oldTooltip.style.transition = '';
            oldTooltip.style.opacity = 0.0;

            setTimeout(function () {
                oldTooltip.remove();
            }, animated ? configs.animationDuration : 0);
        }
    } else {
        if (configs.debugMode)
            console.log('No existing tooltips found');
    }


    tooltip = null;
    secondaryTooltip = null;
    timerToRecreateOverlays = null;
    isTextFieldFocused = false;
}

function createImageIconNew(url, title, shouldAlwaysAddSpacing = false) {
    let container = document.createDocumentFragment();

    let img = document.createElement('img');
    img.setAttribute('src', url);
    img.setAttribute('class', 'selecton-button-img-icon');

    const onlyIconStyle = configs.buttonsStyle == 'onlyicon';
    img.style.opacity = configs.buttonsStyle == 'onlylabel' ? 0.65 : onlyIconStyle ? 0.75 : 0.5;
    // if (!onlyIconStyle) img.style.marginRight = '4px';
    if (!onlyIconStyle || shouldAlwaysAddSpacing) img.style.marginRight = '3px';
    container.appendChild(img);

    if (title != undefined && title != '') {
        let label = document.createElement('span');
        label.textContent = title;
        container.appendChild(label);
    }

    return container;
}

function splitNumberInGroups(stringNumber) {
    const parts = stringNumber.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    if (parts[1] == '00') parts[1] = ''; /// Remove empty .00 on end
    return parts[1] == '' ? parts[0] : parts.join('.');
}