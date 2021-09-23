function createTooltip(e) {
    if (isDraggingTooltip) return;

    if (dontShowTooltip !== true)
        setTimeout(
            function () {
                if (e !== undefined && e !== null && e.button !== 0) return;
                lastMouseUpEvent = e;
                //hideTooltip();

                if (configs.snapSelectionToWord) {
                    if (isTextFieldFocused == true && configs.dontSnapTextfieldSelection == true) {
                        if (configs.debugMode)
                            console.log('Word snapping rejected while textfield is focused');
                    } else if (configs.disableWordSnappingOnCtrlKey && e !== undefined && e.ctrlKey == true) {
                        if (configs.debugMode)
                            console.log('Word snapping rejected due to pressed CTRL key');
                    } else {
                        if (document.querySelector('.selection-tooltip-draghandle') == null) {
                            let domainIsBlacklistedForSnapping = false;
                            if (configs.wordSnappingBlacklist !== null && configs.wordSnappingBlacklist !== undefined && configs.wordSnappingBlacklist !== '')
                                configs.wordSnappingBlacklist.split(',').forEach(function (domain) {
                                    if (window.location.href.includes(domain.trim())) {
                                        domainIsBlacklistedForSnapping = true;
                                    }
                                });

                            if (domainIsBlacklistedForSnapping == false && e.detail < 3 && (timerToRecreateOverlays == null || timerToRecreateOverlays == undefined))
                                snapSelectionByWords(selection);
                        }
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

                if (tooltip !== null && tooltip !== undefined) hideTooltip();


                if (selectedText == '') {
                    hideDragHandles();
                    return;
                }

                setUpNewTooltip();

                if (dontShowTooltip == false && selectedText !== null && selectedText !== '' && tooltip.style.opacity !== 0.0) {
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
            }, 1
        );
}

function setUpNewTooltip(type) {

    /// Create tooltip and it's arrow
    tooltip = document.createElement('div');
    tooltip.className = 'selection-tooltip selecton-entity';
    tooltip.style.opacity = 0.0;
    tooltip.style.position = 'fixed';
    tooltip.style.transition = `opacity ${configs.animationDuration}ms ease-out, transform ${configs.animationDuration}ms ease-out`;
    tooltip.style.transform = returnTooltipRevealTransform(false);
    tooltip.style.transformOrigin = '50% 100% 0';

    if (configs.useCustomStyle && configs.tooltipOpacity != 1.0 && configs.tooltipOpacity != 1) {
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
    arrow.setAttribute('class', `selection-tooltip-arrow`);
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
                let cutButton = document.createElement('button');
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
                let copyButton = document.createElement('button');
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

                if (configs.addPasteButton && !configs.addPasteOnlyEmptyField) {
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

                /// support for cyrillic alphabets
                /// source: https://stackoverflow.com/a/40503617/11381400
                const cyrillicPattern = /^[\u0400-\u04FF]+$/;
                if (configs.addFontFormatButtons && !cyrillicPattern.test(selection.toString().replaceAll(' ', ''))) {
                    /// Add 'bold' button 
                    var boldButton = document.createElement('button');
                    boldButton.setAttribute('class', `selection-popup-button button-with-border`);
                    if (configs.buttonsStyle == 'onlyicon' && configs.showButtonLabelOnHover)
                        boldButton.setAttribute('title', boldLabel);

                    if (addButtonIcons)
                        boldButton.appendChild(createImageIconNew(boldTextIcon, configs.buttonsStyle == 'onlyicon' ? '' : boldLabel));
                    else
                        boldButton.textContent = boldLabel;
                    boldButton.addEventListener("mousedown", function (e) {
                        formatSelectedTextForInput(textField, selection, 'bold')

                        hideTooltip();
                        removeSelectionOnPage();
                    });
                    if (configs.reverseTooltipButtonsOrder)
                        tooltip.insertBefore(boldButton, copyButton);
                    else
                        tooltip.appendChild(boldButton);

                    /// Add 'italic' button 
                    var italicButton = document.createElement('button');
                    italicButton.setAttribute('class', `selection-popup-button button-with-border`);
                    if (configs.buttonsStyle == 'onlyicon' && configs.showButtonLabelOnHover)
                        italicButton.setAttribute('title', italicLabel);

                    if (addButtonIcons)
                        italicButton.appendChild(createImageIconNew(italicTextIcon, configs.buttonsStyle == 'onlyicon' ? '' : italicLabel));
                    else
                        italicButton.textContent = italicLabel;
                    italicButton.style.borderRadius = lastButtonBorderRadius;
                    italicButton.addEventListener("mousedown", function (e) {
                        formatSelectedTextForInput(textField, selection, 'italic');

                        hideTooltip();
                        removeSelectionOnPage();
                    });
                    if (configs.reverseTooltipButtonsOrder)
                        tooltip.insertBefore(italicButton, boldButton);
                    else
                        tooltip.appendChild(italicButton);
                }

            } catch (e) { if (configs.debugMode) console.log(e) }

            /// Set border radius for buttons
            tooltip.children[1].style.borderRadius = firstButtonBorderRadius;
            tooltip.children[tooltip.children.length - 1].style.borderRadius = lastButtonBorderRadius;

        } else {
            if (configs.addPasteButton)
                try {
                    /// Add only paste button 
                    let pasteButton = document.createElement('button');
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

        // if (configs.buttonsStyle == 'onlyicon' && configs.showButtonLabelOnHover)
        if (configs.showButtonLabelOnHover)
            // searchButton.setAttribute('title', searchLabel + ` (${configs.preferredSearchEngine})`);
            // else
            searchButton.setAttribute('title', configs.preferredSearchEngine);

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
        let copyButton = document.createElement('button');
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
    var selectedText = selection.toString().trim();
    const loweredSelectedText = selectedText.toLowerCase();
    var wordsCount = selectedText.split(' ').length;
    let isFileName = false;

    if (convertWhenOnlyFewWordsSelected == false || wordsCount <= wordsLimitToProccessText) {
        var numberToConvert;
        var unitLabelColor = isDarkTooltip ? 'rgba(255, 255, 255, 0.75)' : 'rgba(0, 0, 0, 0.75)';
        var selectionContainsSpaces = selectedText.includes(' ');

        /// Convert currency button
        if (configs.convertCurrencies) {
            var currency;
            var amount;
            var currencyRate;
            var currencySymbol;

            let match = false;

            // const keys = Object.keys(currenciesList);
            // for (let i = 0, l = keys.length; i < l; i++) {
            //     let key = keys[i];
            //     let value = currenciesList[key];

            for (const [key, value] of Object.entries(currenciesList)) {
                if (selectedText.includes(key) || (value["currencySymbol"] !== undefined && selectedText.includes(value["currencySymbol"]))) {
                    if (configs.debugMode) console.log('found currency match for: ' + (selectedText.includes(key) ? key : value['currencySymbol']));
                    match = true;
                } else {
                    let currencyKeywords = value["currencyKeywords"];
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
                    if (configs.debugMode)
                        console.log(`Found local rate for currency ${currency}`);

                    // for (const [key, value] of Object.entries(currenciesList)) {
                    // if (key == configs.convertToCurrency && value['rate'] !== null && value['rate'] !== undefined) {
                    let value = currenciesList[configs.convertToCurrency];

                    if (value && value['rate'] !== null && value['rate'] !== undefined) {

                        let rateOfDesiredCurrency = value['rate'];
                        if (configs.debugMode)
                            console.log(`Rate is: ${rateOfDesiredCurrency}`);

                        /// Check for literal multipliers (million, billion and so on)
                        for (i in billionMultipliers) { if (loweredSelectedText.includes(billionMultipliers[i])) { amount *= 1000000000; break; } }
                        for (i in millionMultipliers) { if (loweredSelectedText.includes(millionMultipliers[i].toLowerCase())) { amount *= 1000000; break; } }
                        for (i in thousandMultipliers) { if (loweredSelectedText.includes(thousandMultipliers[i].toLowerCase())) { amount *= 1000; break; } }

                        let resultingRate = rateOfDesiredCurrency / currencyRate;
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
                            let currencyButton = document.createElement('button');
                            currencyButton.setAttribute('class', `selection-popup-button button-with-border`);

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

                            converted.setAttribute('style', `color: ${secondaryColor}`);
                            currencyButton.appendChild(converted);

                            /// Add currency symbol with different color
                            const currencyLabel = document.createElement('span');
                            currencyLabel.textContent = ` ${configs.preferCurrencySymbol ? currencySymbolToUse : configs.convertToCurrency}`;
                            currencyLabel.setAttribute('style', `color: ${unitLabelColor}`);
                            currencyButton.appendChild(currencyLabel);

                            currencyButton.addEventListener("mousedown", function (e) {
                                let url = returnSearchUrl(`${amount + ' ' + currency} to ${configs.convertToCurrency}`);
                                onTooltipButtonClick(e, url);
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
            var convertedNumber;
            var fromUnit;
            var convertedUnit;

            /// Feet ' and inches " handling
            if (!selectionContainsSpaces && configs.preferredMetricsSystem == 'metric' && !/[a-zA-Z]/g.test(selectedText) && !/[а-яА-Я]/g.test(selectedText)) /// don't proccess if text includes letters
                if ((selectedText.includes("'"))) {
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
            outerloop: for (const [key, value] of Object.entries(convertionUnits)) {

                let nonConvertedUnit = configs.preferredMetricsSystem == 'metric' ? key : value['convertsTo'];
                if (selectedText.includes(nonConvertedUnit)) {
                    if ((nonConvertedUnit == 'pound' || nonConvertedUnit == 'фунтов') && tooltip.children.length == 4) return;

                    numberToConvert = extractAmountFromSelectedText(selectedText);

                    if (numberToConvert !== null && numberToConvert !== '' && numberToConvert !== NaN && numberToConvert !== undefined) {

                        /// Check selected text for literal multipliers
                        for (i in billionMultipliers) { if (loweredSelectedText.includes(billionMultipliers[i])) { numberToConvert *= 1000000000; break; } }
                        for (i in millionMultipliers) { if (loweredSelectedText.includes(millionMultipliers[i].toLowerCase())) { numberToConvert *= 1000000; break; } }
                        for (i in thousandMultipliers) { if (loweredSelectedText.includes(thousandMultipliers[i].toLowerCase())) { numberToConvert *= 1000; break; } }

                        fromUnit = configs.preferredMetricsSystem == 'metric' ? key : value['convertsTo'];
                        convertedUnit = configs.preferredMetricsSystem == 'metric' ? value['convertsTo'] : key;

                        if (fromUnit.includes('°')) {
                            convertedNumber = value['convertFunction'](numberToConvert);
                        } else {
                            convertedNumber = configs.preferredMetricsSystem == 'metric' ? numberToConvert * value['ratio'] : numberToConvert / value['ratio'];
                        }

                        break outerloop;
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
                converted.setAttribute('style', `color: ${secondaryColor}`);
                interactiveButton.appendChild(converted);

                const unitLabelEl = document.createElement('span');
                unitLabelEl.textContent = ` ${convertedUnit}`;
                unitLabelEl.setAttribute('style', `color: ${unitLabelColor}`);
                interactiveButton.appendChild(unitLabelEl);

                interactiveButton.addEventListener("mousedown", function (e) {
                    let url = returnSearchUrl(`${numberToConvert + ' ' + fromUnit.trim()} to ${convertedUnit}`);
                    onTooltipButtonClick(e, url);
                });

                if (configs.reverseTooltipButtonsOrder)
                    tooltip.insertBefore(interactiveButton, tooltip.children[1]);
                else
                    tooltip.appendChild(interactiveButton);
                // try {
                //     tooltip.style.left = `${(parseInt(tooltip.style.left.replaceAll('px', ''), 10) - interactiveButton.clientWidth - 5) * 2}px`;
                // } catch (e) {
                //     if (configs.debugMode)
                //         console.log(e);
                // }
            }
        }

        /// Phone number button
        if (configs.addPhoneButton && selectedText.includes('+') && !selectionContainsSpaces && selectedText.length == 13 && selectedText[0] == '+') {
            let phoneButton = document.createElement('button');
            phoneButton.setAttribute('class', `selection-popup-button button-with-border`);
            phoneButton.appendChild(createImageIconNew(phoneIcon, selectedText));
            phoneButton.style.color = secondaryColor;
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
                        let calculatedExpression = calculateString(selectedText.replaceAll(' ', ''));
                        if (calculatedExpression !== null && calculatedExpression !== undefined && calculatedExpression !== '' && calculatedExpression !== NaN) {

                            let number;
                            let numbersArray = calculatedExpression.toString().match(/[+-]?\d+(\.\d)?/g);
                            number = numbersArray[0];

                            if (number !== null) {
                                let interactiveButton = document.createElement('button');
                                interactiveButton.setAttribute('class', 'selection-popup-button button-with-border');
                                if (configs.showUnconvertedValue)
                                    interactiveButton.textContent = selectedText + ' →';

                                let converted = document.createElement('span');
                                converted.textContent = ` ${calculatedExpression}`;
                                converted.setAttribute('style', `color: ${secondaryColor}`);
                                interactiveButton.appendChild(converted);

                                interactiveButton.addEventListener("mousedown", function (e) {
                                    let url = returnSearchUrl(selectedText.replaceAll('+', '%2B'));
                                    onTooltipButtonClick(e, url);
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
            var containsAddress = false;

            for (i in addressKeywords) {
                if (loweredSelectedText.includes(addressKeywords[i])) {
                    containsAddress = true;
                    break;
                }
            }

            if (containsAddress) {
                var mapButton = document.createElement('button');
                mapButton.setAttribute('class', `selection-popup-button button-with-border`);
                if (configs.buttonsStyle == 'onlyicon' && configs.showButtonLabelOnHover)
                    mapButton.setAttribute('title', showOnMapLabel);

                if (addButtonIcons)
                    mapButton.appendChild(createImageIconNew(mapButtonIcon, configs.buttonsStyle == 'onlyicon' ? '' : showOnMapLabel));
                else
                    mapButton.textContent = showOnMapLabel;
                mapButton.addEventListener("mousedown", function (e) {
                    /// Open maps service set by user (defaults to Google Maps)
                    let url = returnShowOnMapUrl(selectedText.trim());
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
                    var emailText = loweredSelectedText;
                    const emailButton = document.createElement('button');
                    emailButton.setAttribute('class', `selection-popup-button button-with-border`);
                    emailButton.appendChild(createImageIconNew(emailButtonIcon, (emailText.length > linkSymbolsToShow ? emailText.substring(0, linkSymbolsToShow) + '...' : emailText)));
                    emailButton.style.color = secondaryColor;

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
        if (configs.addColorPreviewButton && ((selectedText.includes('#') && !selectionContainsSpaces) || (selectedText.includes('rgb') && selectedText.includes('(')))) {
            try {
                var colorText;
                if (selectedText.includes('rgb') && selectedText.includes('(')) {
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
                let colorButton = document.createElement('button');
                colorButton.setAttribute('class', `selection-popup-button button-with-border`);

                let colorCircle = document.createElement('div');
                colorCircle.setAttribute('class', `selection-popup-color-preview-circle`);
                colorCircle.style.background = colorText;

                /// Add red/green/blue tooltip on hover
                let rgbColor = hexToRgb(colorText);
                colorButton.setAttribute('title', `red: ${rgbColor.red}, green: ${rgbColor.green}, blue: ${rgbColor.blue}`);

                colorButton.appendChild(colorCircle);
                colorButton.insertAdjacentHTML('beforeend', ' ' + (colorText.length > linkSymbolsToShow ? colorText.substring(0, linkSymbolsToShow) + '...' : colorText));
                colorButton.style.color = secondaryColor;

                colorButton.addEventListener("mousedown", function (e) {
                    let url = returnSearchUrl(colorText.replaceAll('#', '%23'), false);
                    onTooltipButtonClick(e, url);
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
            let textToProccess = selectedText;

            /// 12H - 24H conversion
            let numbers = extractAmountFromSelectedText(textToProccess);   /// Check if selected text contains numbers

            if (numbers !== null) {
                if (configs.preferredMetricsSystem == 'metric') {
                    if (textToProccess.includes(' PM') || textToProccess.includes(' AM')) {
                        if (configs.debugMode)
                            console.log('converting from 12h to 24...');
                        textToProccess = textToProccess.replaceAll(numbers + (textToProccess.includes('PM') ? ' PM' : ' AM'), convertTime12to24(textToProccess))
                        if (configs.debugMode)
                            console.log('result: ' + textToProccess);
                    }
                } else {
                    if (textToProccess.includes(':') && !textToProccess.includes(' ') && !textToProccess.includes('AM') && !textToProccess.includes('PM')) {
                        if (configs.debugMode)
                            console.log('converting from 12h to 24...');
                        textToProccess = textToProccess.replaceAll(numbers.join(':'), convertTime24to12(textToProccess))

                        if (configs.debugMode)
                            console.log('result: ' + textToProccess);
                    }
                }
            }

            let convertedTime;
            let timeZoneKeywordsKeys = Object.keys(timeZoneKeywords);
            let timeWord;
            let marker;

            for (let i = 0, l = timeZoneKeywordsKeys.length; i < l; i++) {
                marker = timeZoneKeywordsKeys[i];

                if (textToProccess.includes(' ' + marker)) {
                    let words = textToProccess.trim().split(' ');


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

                            let modifier = textToProccess.includes(' PM') ? ' PM' : textToProccess.includes(' AM') ? ' AM' : '';

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
                var timeButton = document.createElement('button');
                timeButton.setAttribute('class', `selection-popup-button button-with-border`);
                timeButton.style.color = secondaryColor;

                if (addButtonIcons)
                    timeButton.appendChild(createImageIconNew(clockIcon, convertedTime ?? textToProccess.match(/[+-]?\d+(\.\d)?/g).slice(0, 2).join(':')));
                else
                    timeButton.textContent = convertedTime ?? textToProccess.match(/[+-]?\d+(\.\d)?/g).slice(0, 2).join(':');

                timeButton.addEventListener("mousedown", function (e) {
                    hideTooltip();
                    removeSelectionOnPage();

                    /// Open system handler
                    if (convertedTime !== null && convertedTime !== undefined && convertedTime !== '' && convertedTime !== 'Inval')
                        onTooltipButtonClick(e, returnSearchUrl(`${timeWord} ${marker}`))
                    else
                        onTooltipButtonClick(e, returnSearchUrl(`${timeWord} ${marker}`))

                });
                if (configs.reverseTooltipButtonsOrder)
                    tooltip.insertBefore(timeButton, tooltip.children[1]);
                else
                    tooltip.appendChild(timeButton);
            }
        }

        /// Add 'open link' button
        if (configs.addOpenLinks)
            if (tooltip.children.length < 4 && !selectionContainsSpaces && (selectedText.includes('.'))) {
                let link = selectedText;
                let splittedByDots = link.split('.');
                let domain = splittedByDots[1];
                let domainLength = splittedByDots[1].length;

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
                        let firstSymbol = link[0];
                        linkLength = link.length;
                        lastSymbol = link[linkLength - 1];
                        if (firstSymbol == "'" || firstSymbol == '"' || firstSymbol == '«' || firstSymbol == '“')
                            link = link.substring(1, linkLength);
                        if (lastSymbol == "'" || lastSymbol == '"' || lastSymbol == "»" || lastSymbol == '”')
                            link = link.substring(0, linkLength - 1);

                        try {
                            /// Filtering out non-links
                            let lastWordAfterDot = splittedByDots[splittedByDots.length - 1];

                            if ((1 < lastWordAfterDot.length < 4) || lastWordAfterDot.includes('/') || link.includes('://')) {
                                /// Adding  open link button
                                let interactiveButton = document.createElement('button');
                                interactiveButton.setAttribute('class', 'selection-popup-button button-with-border');
                                let linkText = document.createElement('span');

                                let linkToDisplay = link.length > linkSymbolsToShow ? link.substring(0, linkSymbolsToShow) + '...' : link;
                                linkText.textContent = linkToDisplay;
                                linkText.style.color = secondaryColor;

                                /// Add tooltip with full website on hover
                                if (link.length > linkSymbolsToShow)
                                    interactiveButton.setAttribute('title', link);

                                if (addButtonIcons)
                                    interactiveButton.appendChild(createImageIconNew(openLinkButtonIcon));
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

    // setTimeout(function () {
    //     /// Set border radius for first and last buttons
    //     tooltip.children[1].style.borderRadius = firstButtonBorderRadius;
    //     tooltip.children[tooltip.children.length - 1].style.borderRadius = lastButtonBorderRadius;

    //     calculateTooltipPosition();
    // }, 1);
}

function calculateTooltipPosition(e) {
    var selStartDimensions = getSelectionCoordinates(true);
    tooltipOnBottom = false;

    if (configs.tooltipPosition == 'overCursor' && e.clientX < window.innerWidth - 30) {

        /// Show it on top of selection, dx aligned to cursor
        // showTooltip(e.clientX - tooltip.clientWidth / 2, selStartDimensions.dy - tooltip.clientHeight - (arrow.clientHeight / 1.5) - 2);

        let dyToShowTooltip = selStartDimensions.dy - tooltip.clientHeight - (arrow.clientHeight / 1.5) - 2;
        let vertOutOfView = dyToShowTooltip <= 0;
        const selEndDimensions = getSelectionCoordinates(false);

        // if (vertOutOfView) {
        if (vertOutOfView || (selStartDimensions.dy < selEndDimensions.dy && selEndDimensions.backwards !== true)) {

            if (selStartDimensions.dy < selEndDimensions.dy && selEndDimensions.backwards !== true)
                tooltipOnBottom = true;

            /// display tooltip under selection
            // dyToShowTooltip = selEndDimensions.dy + tooltip.clientHeight + arrow.clientHeight;
            dyToShowTooltip = selEndDimensions.dy + tooltip.clientHeight + 5;
            // arrow.style.bottom = '';
            // arrow.style.top = '-50%';
            // arrow.style.transform = 'rotate(180deg) translate(12.5px, 0px)';
            arrow.classList.add('arrow-on-bottom');
        }

        showTooltip(e.clientX - tooltip.clientWidth / 2, dyToShowTooltip);
    } else {
        /// Calculating DY
        // var resultingDy = selStartDimensions.dy - tooltip.clientHeight - arrow.clientHeight + window.scrollY;
        var resultingDy = selStartDimensions.dy - tooltip.clientHeight - arrow.clientHeight;

        /// If tooltip is going off-screen on top...
        var vertOutOfView = resultingDy <= 0;
        if (vertOutOfView) {

            /// ...display tooltip below text selection
            var selEndDimensions = getSelectionCoordinates(false);
            resultingDy = selEndDimensions.dy + tooltip.clientHeight + arrow.clientHeight;
            // arrow.style.bottom = '';
            // arrow.style.top = '-50%';
            // arrow.style.transform = 'rotate(180deg) translate(12.5px, 0px)';
            arrow.classList.add('arrow-on-bottom');
            tooltipOnBottom = true;
        }

        /// Calculating DX
        var resultingDx;

        try {
            /// New approach - place tooltip in horizontal center between two selection handles
            var selEndDimensions = getSelectionCoordinates(false);
            var delta = selEndDimensions.dx > selStartDimensions.dx ? selEndDimensions.dx - selStartDimensions.dx : selStartDimensions.dx - selEndDimensions.dx;

            if (selEndDimensions.dx > selStartDimensions.dx)
                resultingDx = selStartDimensions.dx + (delta / 2) - (tooltip.clientWidth / 2);
            else
                resultingDx = selEndDimensions.dx + (delta / 2) - (tooltip.clientWidth / 2);

        } catch (e) {
            if (configs.debugMode)
                console.log(e);

            /// Fall back to old approach - place tooltip in horizontal center selection rect,
            /// which may be in fact bigger than visible selection
            var selDimensions = getSelectionRectDimensions();
            resultingDx = selDimensions.dx + (selDimensions.width / 2) - (tooltip.clientWidth / 2);
        }

        /// Show tooltip on top of selection
        showTooltip(resultingDx, resultingDy + 2);
    }

    setTimeout(function () {
        if (configs.addDragHandles)
            setDragHandles(tooltipOnBottom);
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
            let websiteTooltips = document.querySelectorAll(`[style*='position: absolute'][style*='transform'],[class^='popup popup_warning']`);

            let websiteTooltip;
            if (websiteTooltips !== null && websiteTooltips !== undefined)
                for (let i = 0, l = websiteTooltips.length; i < l; i++) {
                    let el = websiteTooltips[i];
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
                            if (el.getAttribute('id') !== 'cmg-fullscreen-image' && el.clientHeight < 100 && el.clientHeight > 5 && el.clientWidth > 20) {
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
                tooltip.style.transition = `top 200ms ease-out, opacity ${configs.animationDuration}ms ease-in-out, transform 200ms ease-out`;
                tooltip.style.top = `${dy - websiteTooltip.clientHeight}px`;

                arrow.style.transition = ` opacity 100ms ease-in-out`;
                arrow.style.opacity = 0.0;

                setTimeout(function () {
                    tooltip.style.transition = `opacity ${configs.animationDuration}ms ease-in-out, transform 200ms ease-out`;
                    arrow.remove();
                }, 200);
            } else {
                arrow.style.opacity = 1.0;
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

    if (configs.debugMode)
        console.log('Checking for existing Selecton tooltips...')

    /// Hide all tooltips
    let oldTooltips = document.querySelectorAll(`.selecton-entity`);
    // if (configs.debugMode) {
    //     console.log(`Found ${oldTooltips.length} Selecton tooltips:`);
    //     if (oldTooltips.length !== 0)
    //         console.log(oldTooltips);
    // }

    if (oldTooltips !== null && oldTooltips.length !== 0) {
        tooltipIsShown = false;

        for (let i = 0, l = oldTooltips.length; i < l; i++) {
            let oldTooltip = oldTooltips[i];
            if (!animated)
                oldTooltip.style.transition = '';
            oldTooltip.style.opacity = 0.0;

            setTimeout(function () {
                oldTooltip.remove();
            }, animated ? configs.animationDuration : 0);
        }
    }

    tooltip = null;
    secondaryTooltip = null;
    timerToRecreateOverlays = null;
    isTextFieldFocused = false;
}

function createImageIconNew(url, title) {
    let container = document.createDocumentFragment();

    let img = document.createElement('img');
    img.setAttribute('src', url);
    img.setAttribute('class', 'selecton-button-img-icon');

    const onlyIconStyle = configs.buttonsStyle == 'onlyicon';
    img.style.opacity = configs.buttonsStyle == 'onlylabel' ? 0.65 : onlyIconStyle ? 0.75 : 0.5;
    if (!onlyIconStyle) img.style.marginRight = '4px';
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



