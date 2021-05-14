function createTooltip(e) {
    if (isDraggingTooltip) return;

    if (dontShowTooltip !== true)
        setTimeout(
            function () {
                if ("buttons" in evt) {
                    if (evt.buttons == 1) {

                        hideTooltip();

                        if (configs.snapSelectionToWord) {
                            if (configs.disableWordSnappingOnCtrlKey && e.ctrlKey == true) {
                                if (configs.debugMode)
                                    console.log('Word snapping was rejected due to pressed CTRL key');
                            } else {

                                if (document.querySelector(`[class*='selection-tooltip-draghandle'`) == null)
                                    snapSelectionByWords(selection);
                            }
                        }

                        /// Clear previously stored selection value
                        if (window.getSelection) {
                            selection = window.getSelection();
                        } else if (document.selection) {
                            selection = document.selection.createRange();
                        }

                        selectedText = selection.toString().trim();

                        /// Special tooltip for text fields
                        if (
                            document.activeElement.tagName === "INPUT" ||
                            document.activeElement.tagName === "TEXTAREA" ||
                            document.activeElement.getAttribute('contenteditable') !== null
                        ) {
                            if (configs.addActionButtonsForTextFields == false) return;

                            /// Special handling for Firefox (https://stackoverflow.com/questions/20419515/window-getselection-of-textarea-not-working-in-firefox)
                            if (selectedText == '') {
                                var ta = document.querySelector(':focus');
                                selectedText = ta.value.substring(ta.selectionStart, ta.selectionEnd);
                                selection = ta.value.substring(ta.selectionStart, ta.selectionEnd);

                                if (selection == null || selection == undefined || selection.toString().trim() == '') return;
                            }

                            /// Ignore single click on text field with inputted value
                            try {
                                if (document.activeElement.value.trim() !== '' && selectedText == '') return;
                            } catch (e) { }

                            /// Create text field tooltip
                            setUpNewTooltip('textfield');

                            /// Check resulting DY to be out of view
                            var resultDy = e.clientY + window.scrollY - tooltip.clientHeight - arrow.clientHeight - 7.5;
                            var vertOutOfView = resultDy <= window.scrollY;
                            if (vertOutOfView) resultDy = resultDy + (window.scrollY - resultDy);

                            showTooltip(e.clientX - (tooltip.clientWidth / 2), resultDy);

                            return;
                        }

                        if (tooltip !== null && tooltip !== undefined) {
                            hideTooltip();
                        }

                        if (selectedText == '') {
                            hideDragHandles();
                        }

                        setUpNewTooltip();

                        if (dontShowTooltip == false && selectedText !== null && selectedText.trim() !== '' && tooltip.style.opacity !== 0.0) {
                            addContextualButtons();
                        }
                        else hideTooltip();
                    }
                }
            }, 1
        );
}

function setUpNewTooltip(type) {

    /// Create tooltip and it's arrow
    tooltip = document.createElement('div');
    tooltip.setAttribute('class', `selection-tooltip`);
    tooltip.setAttribute('style', `opacity: 0.0;position: absolute; transition: opacity ${configs.animationDuration}ms ease-in-out, transform ${configs.animationDuration}ms ease-out; transform:${returnTooltipRevealTransform(false)};transform-origin: 50% 100% 0;`);

    if (configs.useCustomStyle && configs.tooltipOpacity !== 1.0 && configs.tooltipOpacity !== 1) {
        tooltip.onmouseover = function (event) {
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
    var arrowChild = document.createElement('div');
    arrowChild.setAttribute('class', 'selection-tooltip-arrow-child');

    arrowChild.setAttribute('style', `background: ${configs.useCustomStyle ? configs.tooltipBackground : defaultBackgroundColor}`);
    arrow.appendChild(arrowChild);
    tooltip.appendChild(arrow);

    document.body.appendChild(tooltip);

    // Make the tooltip draggable by arrow
    if (configs.draggableTooltip) {
        arrowChild.style.cursor = 'move';
        arrowChild.onmousedown = function (e) {
            isDraggingTooltip = true;
            e.preventDefault();
            if (configs.debugMode)
                console.log('Started dragging tooltip...');

            document.onmousemove = function (e) {
                e.preventDefault();

                /// Move main tooltip
                tooltip.style.left = `0px`;
                tooltip.style.top = `0px`;
                tooltip.style.transform = `translate(${e.clientX - tooltip.clientWidth / 2}px, ${e.clientY + window.scrollY - tooltip.clientHeight - (arrow.clientHeight / 2)}px)`;
                tooltip.style.transition = `opacity ${configs.animationDuration}ms ease-in-out`;

                document.body.style.cursor = 'move';
            };

            document.onmouseup = function (e) {
                e.preventDefault();
                document.onmousemove = null;
                document.onmouseup = null;
                isDraggingTooltip = false;
                document.body.style.cursor = 'unset';

                /// Move secondary tooltip
                if (configs.secondaryTooltipEnabled) {
                    var secondaryTooltipDx = parseInt(secondaryTooltip.style.left.replaceAll('px', ''));
                    var secondaryTooltipDy = parseInt(secondaryTooltip.style.top.replaceAll('px', ''));
                    secondaryTooltip.style.transform = `translate(${e.clientX - tooltip.clientWidth / 2 - secondaryTooltipDx}px, ${e.clientY + window.scrollY - tooltip.clientHeight - (arrow.clientHeight / 2) - secondaryTooltipDy}px )`;
                    // secondaryTooltip.style.left = `${e.clientX - tooltip.clientWidth / 2 - secondaryTooltipDx}px;`;
                    // secondaryTooltip.style.top = ` ${e.clientY + window.scrollY - tooltip.clientHeight - (arrow.clientHeight / 2) - secondaryTooltipDy}px`;
                }

                if (configs.debugMode)
                    console.log('Dragging tooltip finished');
            };
        }
    }

    /// Apply custom stylings
    if (configs.useCustomStyle) {
        tooltip.style.borderRadius = `${configs.borderRadius}px`;
        tooltip.style.background = configs.tooltipBackground;
        arrow.style.background = configs.tooltipBackground;

        if (configs.addTooltipShadow) {
            tooltip.style.boxShadow = `0 2px 7px rgba(0,0,0,${configs.shadowOpacity})`;
            arrow.style.boxShadow = `1px 1px 3px rgba(0,0,0,${configs.shadowOpacity / 1.5})`;
        }
        /// Set rounded corners for buttons
        firstButtonBorderRadius = `${configs.borderRadius - 3}px 0px 0px ${configs.borderRadius - 3}px`;
        lastButtonBorderRadius = `0px ${configs.borderRadius - 3}px ${configs.borderRadius - 3}px 0px`;
    }

    if (configs.debugMode)
        console.log('Selecton tooltip was created');

    /// Add basic buttons (Copy, Search, etc)
    addBasicTooltipButtons(type);
}

function addBasicTooltipButtons(layout) {
    if (layout == 'textfield') {
        var textField = document.activeElement;

        if (selection.toString() !== '') {

            try {
                /// Add a cut button 
                var cutButton = document.createElement('button');
                cutButton.setAttribute('class', `selection-popup-button`);
                if (configs.buttonsStyle == 'onlyicon' && configs.showButtonLabelOnHover)
                    cutButton.setAttribute('title', cutLabel);

                if (addButtonIcons)
                    cutButton.innerHTML = createImageIcon(cutButtonIcon, 0.5) + (configs.buttonsStyle == 'onlyicon' ? '' : cutLabel);
                else
                    cutButton.textContent = cutLabel;
                cutButton.style.borderRadius = firstButtonBorderRadius;
                cutButton.addEventListener("mousedown", function (e) {
                    document.execCommand('cut');
                    hideTooltip();
                    removeSelectionOnPage();
                });
                tooltip.appendChild(cutButton);

                /// Add copy button 
                var copyButton = document.createElement('button');
                copyButton.setAttribute('class', `selection-popup-button button-with-border`);
                if (configs.buttonsStyle == 'onlyicon' && configs.showButtonLabelOnHover)
                    copyButton.setAttribute('title', copyLabel);
                if (addButtonIcons)
                    copyButton.innerHTML = createImageIcon(copyButtonIcon, 0.8) + (configs.buttonsStyle == 'onlyicon' ? '' : copyLabel);
                else
                    copyButton.textContent = copyLabel;
                // copyButton.style.borderRadius = lastButtonBorderRadius;

                copyButton.addEventListener("mousedown", function (e) {
                    try {
                        textField.focus();
                        document.execCommand('copy');
                        removeSelectionOnPage();

                    } catch (e) { console.log(e); }
                });
                if (configs.reverseTooltipButtonsOrder)
                    tooltip.insertBefore(copyButton, cutButton);
                else
                    tooltip.appendChild(copyButton);

                /// support for cyrillic alphabets
                /// source: https://stackoverflow.com/a/40503617/11381400
                const cyrillicPattern = /^[\u0400-\u04FF]+$/;
                if (!cyrillicPattern.test(selection.toString().replaceAll(' ', ''))) {
                    /// Add 'bold' button 
                    var boldButton = document.createElement('button');
                    boldButton.setAttribute('class', `selection-popup-button button-with-border`);
                    if (configs.buttonsStyle == 'onlyicon' && configs.showButtonLabelOnHover)
                        boldButton.setAttribute('title', boldLabel);

                    if (addButtonIcons)
                        boldButton.innerHTML = createImageIcon(boldTextIcon, 0.5) + (configs.buttonsStyle == 'onlyicon' ? '' : boldLabel);
                    else
                        boldButton.textContent = boldLabel;
                    boldButton.addEventListener("mousedown", function (e) {
                        formatSelectedTextForInput(textField, selection, 'bold')

                        hideTooltip();
                        removeSelectionOnPage();
                    });
                    tooltip.appendChild(boldButton);

                    /// Add 'italic' button 
                    var italicButton = document.createElement('button');
                    italicButton.setAttribute('class', `selection-popup-button button-with-border`);
                    if (configs.buttonsStyle == 'onlyicon' && configs.showButtonLabelOnHover)
                        italicButton.setAttribute('title', italicLabel);

                    if (addButtonIcons)
                        italicButton.innerHTML = createImageIcon(italicTextIcon, 0.5) + (configs.buttonsStyle == 'onlyicon' ? '' : italicLabel);
                    else
                        italicButton.textContent = italicLabel;
                    italicButton.style.borderRadius = lastButtonBorderRadius;
                    italicButton.addEventListener("mousedown", function (e) {
                        formatSelectedTextForInput(textField, selection, 'italic');

                        hideTooltip();
                        removeSelectionOnPage();
                    });
                    tooltip.appendChild(italicButton);
                }



            } catch (e) { if (configs.debugMode) console.log(e) }

            /// Set border radius for buttons
            tooltip.children[1].style.borderRadius = firstButtonBorderRadius;
            tooltip.children[tooltip.children.length - 1].style.borderRadius = lastButtonBorderRadius;

        } else {
            try {
                /// Add only paste button 
                var pasteButton = document.createElement('button');
                pasteButton.setAttribute('class', `selection-popup-button`);
                if (configs.buttonsStyle == 'onlyicon' && configs.showButtonLabelOnHover)
                    pasteButton.setAttribute('title', pasteLabel);
                pasteButton.style.borderRadius = `${configs.borderRadius - 3}px`;

                if (addButtonIcons)
                    pasteButton.innerHTML = createImageIcon(pasteButtonIcon, 0.7) + (configs.buttonsStyle == 'onlyicon' ? '' : pasteLabel);
                else
                    pasteButton.textContent = pasteLabel;
                pasteButton.addEventListener("mousedown", function (e) {
                    textField.focus();
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
        if (addButtonIcons)
            searchButton.innerHTML = createImageIcon(searchButtonIcon) + (configs.buttonsStyle == 'onlyicon' ? '' : searchLabel);
        else
            searchButton.textContent = searchLabel;

        searchButton.addEventListener("mousedown", function (e) {
            var selectedText = selection.toString();
            onTooltipButtonClick(e, returnSearchUrl(selectedText.trim()));
        });

        tooltip.appendChild(searchButton);


        /// Add copy button 
        var copyButton = document.createElement('button');
        copyButton.setAttribute('class', `selection-popup-button button-with-border`);
        if (configs.buttonsStyle == 'onlyicon' && configs.showButtonLabelOnHover)
            copyButton.setAttribute('title', copyLabel);
        if (addButtonIcons)
            copyButton.innerHTML = createImageIcon(copyButtonIcon, 0.8) + (configs.buttonsStyle == 'onlyicon' ? '' : copyLabel);
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
    var wordsCount = selectedText.split(' ').length;

    if (convertWhenOnlyFewWordsSelected == false || wordsCount <= wordsLimitToProccessText) {

        var numberToConvert;

        /// Unit conversion button
        if (configs.convertMetrics)
            outerloop: for (const [key, value] of Object.entries(convertionUnits)) {
                var nonConvertedUnit = configs.preferredMetricsSystem == 'metric' ? key : value['convertsTo'];
                if (selectedText.includes(nonConvertedUnit)) {

                    numberToConvert = extractAmountFromSelectedText(selectedText);

                    if (numberToConvert !== null && numberToConvert !== '' && numberToConvert !== NaN && numberToConvert !== undefined) {
                        var fromUnit = configs.preferredMetricsSystem == 'metric' ? key : value['convertsTo'];
                        var convertedUnit = configs.preferredMetricsSystem == 'metric' ? value['convertsTo'] : key;
                        var convertedNumber;

                        if (fromUnit.includes('°')) {
                            convertedNumber = value['convertFunction'](numberToConvert);
                        } else {
                            convertedNumber = configs.preferredMetricsSystem == 'metric' ? numberToConvert * value['ratio'] : numberToConvert / value['ratio'];
                        }

                        /// Round doubles to the first 2 symbols after dot
                        convertedNumber = convertedNumber.toFixed(2);

                        /// Add unit converter button
                        if (convertedNumber !== null && convertedNumber !== undefined && convertedNumber !== 0 && convertedNumber !== NaN) {
                            var interactiveButton = document.createElement('button');
                            interactiveButton.setAttribute('class', `selection-popup-button button-with-border open-link-button`);
                            if (configs.showUnconvertedValue)
                                interactiveButton.textContent = numberToConvert + ' ' + fromUnit + ' →';

                            var converted = document.createElement('span');
                            converted.textContent = ` ${convertedNumber} ${convertedUnit}`;
                            converted.setAttribute('style', `color: ${secondaryColor}`);
                            interactiveButton.appendChild(converted);

                            interactiveButton.addEventListener("mousedown", function (e) {
                                let url = returnSearchUrl(`${numberToConvert + ' ' + fromUnit} to ${convertedUnit}`);
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
                            break outerloop;
                        }
                    }
                }
            }

        /// Phone number button
        if (configs.addPhoneButton && selectedText.includes('+') && !selectedText.trim().includes(' ') && selectedText.trim().length == 13 && selectedText[0] == '+') {
            var phoneButton = document.createElement('button');
            phoneButton.setAttribute('class', `selection-popup-button button-with-border`);
            phoneButton.innerHTML = createImageIcon(phoneIcon, 0.7) + selectedText;
            phoneButton.addEventListener("mousedown", function (e) {
                hideTooltip();
                removeSelectionOnPage();

                /// Open system handler
                window.open(`tel:${selectedText.trim()}`);
            });
            if (configs.reverseTooltipButtonsOrder)
                tooltip.insertBefore(phoneButton, tooltip.children[1]);
            else
                tooltip.appendChild(phoneButton);
        }

        /// Do simple math calculations
        if (numberToConvert == null && configs.performSimpleMathOperations) {
            if (selectedText.includes('+') || selectedText.includes('-') || selectedText.includes('*') || selectedText.includes('/') || selectedText.includes('^'))
                try {
                    var calculatedExpression = calculateString(selectedText.trim().replaceAll(' ', ''));
                    if (calculatedExpression !== null && calculatedExpression !== undefined && calculatedExpression !== '' && calculatedExpression !== NaN) {

                        var number;
                        var numbersArray = calculatedExpression.toString().match(/[+-]?\d+(\.\d)?/g);
                        number = numbersArray[0];

                        // number = calculatedExpression;

                        if (number !== null) {
                            var interactiveButton = document.createElement('button');
                            interactiveButton.setAttribute('class', `selection-popup-button button-with-border open-link-button`);
                            if (configs.showUnconvertedValue)
                                interactiveButton.textContent = selectedText + ' →';

                            var converted = document.createElement('span');
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
                } catch (e) {
                    if (configs.debugMode)
                        console.log(e);
                }
        }

        /// Add "open on map" button
        if (configs.showOnMapButtonEnabled) {
            var containsAddress = false;

            addressKeywords.forEach(function (address) {
                if (selectedText.toLowerCase().includes(address))
                    containsAddress = true;
            });

            if (containsAddress) {
                var mapButton = document.createElement('button');
                mapButton.setAttribute('class', `selection-popup-button button-with-border`);
                if (configs.buttonsStyle == 'onlyicon' && configs.showButtonLabelOnHover)
                    mapButton.setAttribute('title', showOnMapLabel);

                if (addButtonIcons)
                    mapButton.innerHTML = createImageIcon(mapButtonIcon, 1.0) + (configs.buttonsStyle == 'onlyicon' ? '' : showOnMapLabel);
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
        if (configs.showEmailButton && selectedText.includes('@') && !selectedText.trim().includes(' ')) {
            try {
                var emailText = selectedText.trim().toLowerCase();
                var emailButton = document.createElement('button');
                emailButton.setAttribute('class', `selection-popup-button button-with-border`);
                // if (addButtonIcons)
                emailButton.innerHTML = createImageIcon(emailButtonIcon, configs.buttonsStyle == 'onlyicon' ? 0.4 : 0.65) + (configs.buttonsStyle == 'onlyicon' ? '  ' : '') + (emailText.length > linkSymbolsToShow ? emailText.substring(0, linkSymbolsToShow) + '...' : emailText);
                // emailButton.style.color = secondaryColor;

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
        if (configs.addColorPreviewButton && ((selectedText.includes('#') && !selectedText.trim().includes(' ')) || (selectedText.includes('rgb') && selectedText.includes('(')))) {
            try {
                var colorText;
                if (selectedText.includes('rgb') && selectedText.includes('(')) {
                    /// Try to convert rgb value to hex
                    try {
                        var string = selectedText.trim().toUpperCase().split('(')[1].split(')')[0];
                        var colors = string.replaceAll(' ', '').split(',');
                        console.log(colors);
                        for (i in colors) {
                            colors[i] = parseInt(colors[i], 10);
                        }
                        colorText = rgbToHex(colors[0], colors[1], colors[2]).toUpperCase();
                    } catch (e) {
                        console.log(e);
                        colorText = selectedText.trim().toUpperCase();
                    }

                } else
                    colorText = selectedText.trim().toUpperCase().replaceAll(',', '').replaceAll('.', '').replaceAll("'", "").replaceAll('"', '');

                colorText = colorText.toLowerCase();
                var colorButton = document.createElement('button');
                colorButton.setAttribute('class', `selection-popup-button button-with-border`);

                var colorCircle = document.createElement('div');
                colorCircle.setAttribute('class', `selection-popup-color-preview-circle`);
                colorCircle.style.background = colorText;

                /// Add red/green/blue tooltip on hover
                var rgbColor = hexToRgb(colorText);
                colorButton.setAttribute('title', `red: ${rgbColor.red}, green: ${rgbColor.green}, blue: ${rgbColor.blue}`);

                colorButton.appendChild(colorCircle);
                colorButton.innerHTML += ' ' + (colorText.length > linkSymbolsToShow ? colorText.substring(0, linkSymbolsToShow) + '...' : colorText);
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

        /// Convert currency button
        if (configs.convertCurrencies) {
            var currency;
            var amount;
            var currencyRate;
            var currencySymbol;

            for (const [key, value] of Object.entries(currenciesList)) {
                var match = false;
                if (selectedText.includes(value["id"]) || selectedText.includes(value["currencySymbol"])) {
                    match = true;
                } else {
                    var currencyKeywords = value["currencyKeywords"];
                    if (currencyKeywords !== null && currencyKeywords !== undefined && currencyKeywords !== [])
                        for (i in currencyKeywords) {
                            if (selectedText.toLowerCase().includes(currencyKeywords[i])) {
                                match = true;
                            }
                        }
                }

                if (match) {
                    currency = value["id"];
                    currencyRate = value["rate"];
                    currencySymbol = value["currencySymbol"];

                    /// Special handling for prices where coma separates fractional digits instead of thousandths
                    if (selectedText.includes(',')) {
                        var parts = selectedText.split(',');
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

            if (currency !== undefined && currency !== configs.convertToCurrency && amount !== null) {

                /// Update currency rates in case they are old (will be used for next conversions)
                if (ratesLastFetchedDate !== null && ratesLastFetchedDate !== undefined && ratesLastFetchedDate !== '') {
                    var today = new Date();
                    var dayOfNextFetch = new Date(ratesLastFetchedDate);
                    dayOfNextFetch.setDate(dayOfNextFetch.getDate() + configs.updateRatesEveryDays);

                    if (today >= dayOfNextFetch) {
                        fetchCurrencyRates();
                    }
                }

                /// Rates are already locally stored (should be initially)
                if (currencyRate !== null && currencyRate !== undefined) {
                    if (configs.debugMode)
                        console.log(`Found local rate for currency ${currency}`);

                    for (const [key, value] of Object.entries(currenciesList)) {
                        if (value["id"] == configs.convertToCurrency && value['rate'] !== null && value['rate'] !== undefined) {
                            var rateOfDesiredCurrency = value['rate'];
                            if (configs.debugMode)
                                console.log(`Rate is: ${rateOfDesiredCurrency}`);

                            var resultingRate = rateOfDesiredCurrency / currencyRate;
                            var convertedAmount = amount * resultingRate;

                            if (convertedAmount !== null && convertedAmount !== undefined && convertedAmount.toString() !== 'NaN' && convertedAmount.toString() !== '') {
                                /// Round result
                                try {
                                    convertedAmount = parseFloat(convertedAmount);
                                    convertedAmount = convertedAmount.toFixed(2);
                                } catch (e) { console.log(e); }

                                /// Separate resulting numbers in groups of 3 digits
                                var convertedAmountString = convertedAmount.toString();
                                var parts = convertedAmountString.split('.');
                                parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, " ");
                                convertedAmountString = parts.join('.');

                                /// Create and add currency button with result of conversion
                                let currencyButton = document.createElement('button');
                                currencyButton.setAttribute('class', `selection-popup-button button-with-border open-link-button`);

                                /// Show value before convertion
                                if (configs.showUnconvertedValue) {
                                    if (configs.preferCurrencySymbol && currencySymbol !== undefined)
                                        currencyButton.textContent = ` ${amount} ${currencySymbol} →`;
                                    else
                                        currencyButton.textContent = ` ${amount} ${currency} →`;
                                }

                                /// Show value after converion
                                var converted = document.createElement('span');
                                var userCurrencySymbol = currenciesList[configs.convertToCurrency]['currencySymbol'];

                                if (configs.preferCurrencySymbol && userCurrencySymbol !== undefined)
                                    converted.textContent = ` ${convertedAmountString} ${userCurrencySymbol}`;
                                else
                                    converted.textContent = ` ${convertedAmountString} ${configs.convertToCurrency}`;

                                converted.setAttribute('style', `color: ${secondaryColor}`);
                                currencyButton.appendChild(converted);

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

                                break;
                            }
                        }
                    }

                    /// Fetch rates from server
                } else
                    fetchCurrencyRates();

            } else {

                /// Add 'open link' button
                if (configs.addOpenLinks)
                    // if (tooltip.children.length < 4 && !selectedText.trim().includes(' ') && (selectedText.includes('.') || selectedText.includes('/'))) {
                    if (tooltip.children.length < 4 && !selectedText.trim().includes(' ') && (selectedText.includes('.'))) {
                        var words = selectedText.split(' ');
                        for (i in words) {
                            var link = words[i];
                            if ((link.includes('.') || link.includes('/')) && !link.trim().includes(' ') && !link.includes('@') && !link.includes('<') && link.length > 4) {
                                link = link.replaceAll(',', '').replaceAll(')', '').replaceAll('(', '').replaceAll(`\n`, ' ');
                                var lastSymbol = link[link.length - 1];

                                if (lastSymbol == '.' || lastSymbol == ',')
                                    link = link.substring(0, link.length - 1);

                                /// Remove '/' on the end of link, just for better looks in pop-up
                                var lastSymbol = link[link.length - 1];
                                if (lastSymbol == '/')
                                    link = link.substring(0, link.length - 1);

                                /// Remove quotes in start and end of the link
                                var firstSymbol = link[0];
                                var lastSymbol = link[link.length - 1];
                                if (firstSymbol == "'" || firstSymbol == "'" || firstSymbol == '«' || firstSymbol == '“')
                                    link = link.substring(1, link.length);
                                if (lastSymbol == "'" || lastSymbol == "'" || lastSymbol == "»" || lastSymbol == '”')
                                    link = link.substring(0, link.length - 1);

                                /// Handle when resulting link has spaces
                                if (link.includes(' ')) {
                                    var urlWords = link.split(' ');
                                    for (i in urlWords) {
                                        var word = urlWords[i];
                                        if (word.includes('.') || word.includes('/')) {
                                            link = word;
                                        }
                                    }
                                }

                                try {
                                    link = link.trim();

                                    /// Filtering out non-links
                                    var splittedByDots = link.split('.');
                                    var lastWordAfterDot = splittedByDots[splittedByDots.length - 1];

                                    if ((lastWordAfterDot.length == 2 || lastWordAfterDot.length == 3) || lastWordAfterDot.includes('/') || link.includes('://')) {
                                        /// Adding button
                                        var interactiveButton = document.createElement('button');
                                        interactiveButton.setAttribute('class', `selection-popup-button button-with-border open-link-button`);
                                        var linkText = document.createElement('span');

                                        var linkToDisplay = link.length > linkSymbolsToShow ? link.substring(0, linkSymbolsToShow) + '...' : link;
                                        linkText.textContent = (addButtonIcons ? '' : ' ') + linkToDisplay;
                                        linkText.setAttribute('style', `color: ${secondaryColor}`);

                                        /// Add tooltip with full website on hover
                                        if (link.length > linkSymbolsToShow)
                                            interactiveButton.setAttribute('title', link);

                                        if (addButtonIcons) {
                                            if (configs.buttonsStyle == 'onlyicon') {
                                                interactiveButton.innerHTML = createImageIcon(openLinkButtonIcon, 0.5) + ' ';
                                            } else {
                                                interactiveButton.innerHTML = createImageIcon(openLinkButtonIcon, 0.65);
                                            }
                                        }
                                        else
                                            interactiveButton.innerHTML = openLinkLabel + ' ';

                                        interactiveButton.appendChild(linkText);
                                        interactiveButton.addEventListener("mousedown", function (e) {

                                            // if (!link.includes('http://') && !link.includes('https://') && !link.includes('chrome://') && !link.includes('about:'))
                                            if (!link.includes('://') && !link.includes('about:'))
                                                link = 'https://' + link;

                                            onTooltipButtonClick(e, link);
                                        });

                                        if (configs.reverseTooltipButtonsOrder)
                                            tooltip.insertBefore(interactiveButton, tooltip.children[1]);
                                        else
                                            tooltip.appendChild(interactiveButton);
                                        break;
                                    }
                                } catch (e) { console.log(e) }

                            }
                        }
                    }

            }
        }
    }

    /// Show Translate button when enabled, and no other contextual buttons were added 

    // if (tooltip.children.length < 4 && configs.showTranslateButton && (document.getElementById('selecton-translate-button') == null || document.getElementById('selecton-translate-button') == undefined)) {
    if (tooltip.children.length < 4 && configs.showTranslateButton) {
        addTranslateButton();
    }

    setTimeout(function () {
        /// Set border radius for first and last buttons
        tooltip.children[1].style.borderRadius = firstButtonBorderRadius;
        tooltip.children[tooltip.children.length - 1].style.borderRadius = lastButtonBorderRadius;

        calculateTooltipPosition();
    }, 1);
}

function calculateTooltipPosition() {
    var selDimensions = getSelectionRectDimensions();

    /// Calculating DY
    var resultingDy = selDimensions.dy - tooltip.clientHeight - arrow.clientHeight + window.scrollY;

    /// If tooltip is going off-screen on top, make it visible by manually placing on top of screen
    var vertOutOfView = resultingDy <= window.scrollY;
    if (vertOutOfView) resultingDy = resultingDy + (window.scrollY - resultingDy);

    /// Calculating DX
    var resultingDx;
    try {
        /// New approach - place tooltip in horizontal center between two selection handles
        var selStartDimensions = getSelectionCoordinates(true);
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
        resultingDx = selDimensions.dx + (selDimensions.width / 2) - (tooltip.clientWidth / 2);
    }

    /// Show tooltip on top of selection
    showTooltip(resultingDx, resultingDy + 4);

    if (configs.addDragHandles)
        setDragHandles();

    setTimeout(function () {
        checkTooltipForCollidingWithSideEdges();
    }, 1);
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
        }, configs.animationDuration / 2);
    }

    /// Set reveal animation type
    tooltip.style.transform = returnTooltipRevealTransform(true);

    if (configs.debugMode)
        console.log('Selecton tooltip shown');

    if (configs.shiftTooltipWhenWebsiteHasOwn)
        setTimeout(function () {
            /// Experimental code to determine website's own selection tooltip
            var websiteTooltips = document.querySelectorAll(`[style*='position: absolute'][style*='transform'],[class^='popup popup_warning']`);

            var websiteTooltip;
            if (websiteTooltips !== null && websiteTooltips !== undefined)
                for (i in websiteTooltips) {
                    var el = websiteTooltips[i];

                    let elementClass;
                    try {
                        elementClass = el.getAttribute('class');
                    } catch (e) { }

                    if (elementClass !== null && elementClass !== undefined && elementClass.toString().includes('selection-tooltip')) {

                    } else if (el.style !== undefined) {
                        var transformStyle;

                        try {
                            transformStyle = el.style.transform.toString();
                            var elementStyle = el.getAttribute('style').toString();
                        } catch (e) { }


                        // if (elStyle !== null && elStyle !== undefined && elStyle.includes('translate3d')) {
                        // if (!el.getAttribute('class').toString().includes('selection-tooltip'))
                        if (elementStyle == undefined) continue;
                        if ((elementStyle.includes('position: absolute') && transformStyle !== null && transformStyle !== undefined && transformStyle.includes('translate') && transformStyle !== 'translateY(0px)' && transformStyle !== 'translate(0px, 0px)')
                            || (elementStyle.includes('left:') && elementStyle.includes('top:'))
                        ) {
                            if (el.getAttribute('id') !== 'cmg-fullscreen-image' && el.clientHeight < 100) {
                                if (configs.debugMode) {
                                    console.log('Detected selection tooltip on the website with following style:');
                                    console.log(elementStyle);
                                    console.log(el.getAttribute('id'));
                                }

                                websiteTooltip = el;
                                break;
                            }
                        }
                    }
                };

            if (websiteTooltip !== null && websiteTooltip !== undefined && websiteTooltip.clientHeight > 1) {
                tooltip.style.transition = `top 200ms ease-out, opacity ${configs.animationDuration}ms ease-in-out, transform 200ms ease-out`;
                tooltip.style.top = `${dy - websiteTooltip.clientHeight}px`;

                arrow.style.transition = ` opacity 100ms ease-in-out`;
                arrow.style.opacity = 0.0;

                setTimeout(function () {
                    tooltip.style.transition = `opacity ${configs.animationDuration}ms ease-in-out, transform 200ms ease-out`;
                    arrow.parentNode.removeChild(arrow);
                }, 200);
            } else {
                arrow.style.opacity = 1.0;
                if (configs.debugMode) {
                    console.log('Selection didnt found any website tooltips');
                }
            }

        }, 300);

    /// Create secondary tooltip (for custom search options)
    /// Add a delay to be sure currency and translate buttons were already added
    if (configs.secondaryTooltipEnabled && configs.customSearchButtons !== null && configs.customSearchButtons !== undefined && configs.customSearchButtons !== [])
        setTimeout(function () {
            try {
                createSecondaryTooltip();
            } catch (e) {
                console.log(e);
            }
        }, configs.animationDuration);
}

function checkTooltipForCollidingWithSideEdges() {
    if (configs.debugMode)
        console.log('Checking Selecton tooltip to colliding with side edges...');

    var dx = parseInt(tooltip.style.left.replaceAll('px', ''));

    var tooltipWidth = 12.0;
    tooltip.querySelectorAll('.selection-popup-button').forEach(function (el) {
        tooltipWidth += el.offsetWidth;
    });

    /// Tooltip is off-screen on the left
    if (dx < 0) {

        if (configs.debugMode)
            console.log('Tooltip is colliding with left edge. Fixing...');

        tooltip.style.left = '5px';

        /// Shift the arrow to match new position
        var newLeftPercentForArrow = ((dx * -1) + 5) / tooltipWidth * 100;
        if (arrow !== null && arrow !== undefined)
            arrow.style.left = `${50 - newLeftPercentForArrow}%`;

    } else {
        var screenWidth = window.innerWidth
            || document.documentElement.clientWidth
            || document.body.clientWidth;

        var offscreenAmount = (dx + tooltipWidth) - screenWidth + 10;

        /// Tooltip is off-screen on the right
        if (offscreenAmount > 0) {
            if (configs.debugMode)
                console.log('Tooltip is colliding with right edge. Fixing...');

            tooltip.style.left = `${dx - offscreenAmount - 5}px`;

            /// Shift the arrow to match new position
            var newLeftPercentForArrow = (dx - (dx - offscreenAmount - 5)) / tooltipWidth * 100;
            arrow.style.left = `${50 + newLeftPercentForArrow}%`;
        } else {
            if (configs.debugMode)
                console.log('Tooltip is not colliding with side edges');
        }
    }
}

function hideTooltip() {
    if (tooltip == null || tooltip == undefined) return;

    if (configs.debugMode)
        console.log('Checking for existing Selecton tooltips...')

    /// Hide all main tooltips
    var oldTooltips = document.querySelectorAll('.selection-tooltip');
    if (configs.debugMode) {
        console.log(`Found ${oldTooltips.length} Selecton tooltips:`);
        if (oldTooltips.length !== 0)
            console.log(oldTooltips);
    }

    if (oldTooltips !== null && oldTooltips.length !== 0) {
        oldTooltips.forEach(function (oldTooltip) {
            oldTooltip.style.opacity = 0.0;

            setTimeout(function () {
                // if (oldTooltip.parentNode !== null)
                //   oldTooltip.parentNode.removeChild(oldTooltip);

                if (configs.debugMode)
                    console.log('Selecton tooltip hidden');

                if (oldTooltip.parentNode !== null)
                    oldTooltip.parentNode.removeChild(oldTooltip);

            }, configs.animationDuration);
        });
    }

    // if (shouldHideDragHandles)
    //   hideDragHandles();

    /// Hide all secondary tooltips
    var oldSecondaryTooltips = document.querySelectorAll('.secondary-selection-tooltip');
    if (oldSecondaryTooltips !== null && oldSecondaryTooltips.length !== 0)
        oldSecondaryTooltips.forEach(function (oldSecondaryTooltip) {
            oldSecondaryTooltip.style.opacity = 0.0;

            setTimeout(function () {
                if (oldSecondaryTooltip.parentNode !== null)
                    oldSecondaryTooltip.parentNode.removeChild(oldSecondaryTooltip);

                // if (configs.debugMode)
                //   console.log('Selecton secondary secondary tooltip hidden');

            }, configs.animationDuration);
        });

    tooltip = null;
}

function createImageIcon(url, opacity = 0.5) {
    return `<img src="${url}" style="all: revert; opacity: ${configs.buttonsStyle == 'onlyicon' ? opacity * 1.5 : opacity}; filter: invert(${isDarkBackground ? '100' : '0'}%);vertical-align: top !important;  max-height:16px !important;display: unset !important;${configs.buttonsStyle == 'onlyicon' ? '' : 'padding-right: 5px;'}"" />`;
}



