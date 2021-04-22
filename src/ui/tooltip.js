function createTooltip(e) {
    if (isDraggingTooltip) return;

    if (dontShowTooltip !== true)
        setTimeout(
            function () {
                // var evt = e || window.event;
                if ("buttons" in evt) {
                    if (evt.buttons == 1) {

                        hideTooltip();

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
                            if (addActionButtonsForTextFields == false) return;

                            /// Special handling for Firefox (https://stackoverflow.com/questions/20419515/window-getselection-of-textarea-not-working-in-firefox)
                            if (selectedText == '') {
                                var ta = document.querySelector(':focus');
                                selectedText = ta.value.substring(ta.selectionStart, ta.selectionEnd);
                                selection = ta.value.substring(ta.selectionStart, ta.selectionEnd);

                                if (selection == null || selection == undefined || selection.toString().trim() == '') return;
                            }

                            /// Ignore single click on text field with inputted value
                            if (document.activeElement.value.trim() !== '' && selectedText == '') return;

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
    // tooltip.setAttribute('style', `opacity: 0.0;position: absolute; transition: opacity ${animationDuration}ms ease-in-out, transform ${animationDuration}ms ease-out; ${addScaleUpEffect ? `transform: scale(0.0);transform-origin: 50% 125% 0;` : ''}`);
    tooltip.setAttribute('style', `opacity: 0.0;position: absolute; transition: opacity ${animationDuration}ms ease-in-out, transform ${animationDuration}ms ease-out; transform:${returnTooltipRevealTransform(false)};transform-origin: 50% 100% 0;`);

    if (useCustomStyle && tooltipOpacity !== 1.0 && tooltipOpacity !== 1) {
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
                    tooltip.style.opacity = tooltipOpacity;
                } catch (e) { }
            }, 1);
        }
        if (debugMode) {
            console.log('Selecton tooltip inactive opacity: ' + tooltipOpacity.toString());
            console.log('Set tooltip opacity listeners');
        }
    }

    arrow = document.createElement('div');
    arrow.setAttribute('class', `selection-tooltip-arrow`);
    var arrowChild = document.createElement('div');
    arrowChild.setAttribute('class', 'selection-tooltip-arrow-child');
    arrow.appendChild(arrowChild);
    tooltip.appendChild(arrow);

    document.body.appendChild(tooltip);

    // Make the tooltip draggable by arrow
    if (draggableTooltip) {
        arrowChild.style.cursor = 'move';
        arrowChild.onmousedown = function (e) {
            isDraggingTooltip = true;
            e.preventDefault();
            if (debugMode)
                console.log('Started dragging tooltip...');

            document.onmousemove = function (e) {
                e.preventDefault();

                /// Move main tooltip
                tooltip.style.left = `0px`;
                tooltip.style.top = `0px`;
                tooltip.style.transform = `translate(${e.clientX - tooltip.clientWidth / 2}px, ${e.clientY + window.scrollY - tooltip.clientHeight - (arrow.clientHeight / 2)}px)`;
                tooltip.style.transition = `opacity ${animationDuration}ms ease-in-out`;

                document.body.style.cursor = 'move';
            };

            document.onmouseup = function (e) {
                e.preventDefault();
                document.onmousemove = null;
                document.onmouseup = null;
                isDraggingTooltip = false;
                document.body.style.cursor = 'unset';

                /// Move secondary tooltip
                if (secondaryTooltipEnabled) {
                    var secondaryTooltipDx = parseInt(secondaryTooltip.style.left.replaceAll('px', ''));
                    var secondaryTooltipDy = parseInt(secondaryTooltip.style.top.replaceAll('px', ''));
                    secondaryTooltip.style.transform = `translate(${e.clientX - tooltip.clientWidth / 2 - secondaryTooltipDx}px, ${e.clientY + window.scrollY - tooltip.clientHeight - (arrow.clientHeight / 2) - secondaryTooltipDy}px )`;
                }

                if (debugMode)
                    console.log('Dragging tooltip finished');
            };
        }
    }

    /// Apply custom stylings
    if (useCustomStyle) {
        tooltip.style.borderRadius = `${borderRadius}px`;
        tooltip.style.background = tooltipBackground;
        arrow.style.background = tooltipBackground;

        if (addTooltipShadow) {
            tooltip.style.boxShadow = `0 2px 7px rgba(0,0,0,${shadowOpacity})`;
            arrow.style.boxShadow = `1px 1px 3px rgba(0,0,0,${shadowOpacity / 1.5})`;
        }
        /// Set rounded corners for buttons
        firstButtonBorderRadius = `${borderRadius - 3}px 0px 0px ${borderRadius - 3}px`;
        lastButtonBorderRadius = `0px ${borderRadius - 3}px ${borderRadius - 3}px 0px`;
    }

    if (debugMode)
        console.log('Selecton tooltip was created');

    /// Add basic buttons (Copy, Search, etc)
    addBasicTooltipButtons(type);
}

function addBasicTooltipButtons(layout) {
    if (layout == 'textfield') {
        var textField = document.activeElement;
        if (selection.toString() !== '') {

            try { /// Add a cut button 
                var cutButton = document.createElement('button');
                cutButton.setAttribute('class', `selection-popup-button`);
                if (buttonsStyle == 'onlyicon' && showButtonLabelOnHover)
                    cutButton.setAttribute('title', cutLabel);

                if (addButtonIcons)
                    cutButton.innerHTML = createImageIcon(cutButtonIcon, 0.7) + (buttonsStyle == 'onlyicon' ? '' : cutLabel);
                else
                    cutButton.textContent = cutLabel;
                cutButton.setAttribute('style', `border-radius: ${firstButtonBorderRadius}`);
                cutButton.addEventListener("mousedown", function (e) {
                    document.execCommand('cut');
                    hideTooltip();
                    removeSelectionOnPage();
                });
                tooltip.appendChild(cutButton);

                /// Add copy button 
                var copyButton = document.createElement('button');
                copyButton.setAttribute('class', `selection-popup-button button-with-border`);
                if (buttonsStyle == 'onlyicon' && showButtonLabelOnHover)
                    copyButton.setAttribute('title', copyLabel);
                if (addButtonIcons)
                    copyButton.innerHTML = createImageIcon(copyButtonIcon, 0.8) + (buttonsStyle == 'onlyicon' ? '' : copyLabel);
                else
                    copyButton.textContent = copyLabel;
                copyButton.setAttribute('style', `border-radius: ${lastButtonBorderRadius}`);

                copyButton.addEventListener("mousedown", function (e) {
                    try {
                        textField.focus();
                        document.execCommand('bold');

                    } catch (e) { console.log(e); }

                    // document.execCommand('copy');
                    // hideTooltip();
                    // removeSelection();
                });
                tooltip.appendChild(copyButton);
            } catch (e) { console.log(e) }

            /// Set border radius for buttons
            // tooltip.children[1].style.borderRadius = firstButtonBorderRadius;
            // tooltip.children[tooltip.children.length - 1].style.borderRadius = lastButtonBorderRadius;

        } else {
            /// Add only paste button 
            var pasteButton = document.createElement('button');
            pasteButton.setAttribute('class', `selection-popup-button`);
            if (buttonsStyle == 'onlyicon' && showButtonLabelOnHover)
                pasteButton.setAttribute('title', pasteLabel);
            pasteButton.setAttribute('style', `border-radius: ${borderRadius - 3}px`);
            if (addButtonIcons)
                pasteButton.innerHTML = createImageIcon(pasteButtonIcon, 0.7) + (buttonsStyle == 'onlyicon' ? '' : pasteLabel);
            else
                pasteButton.textContent = pasteLabel;
            pasteButton.addEventListener("mousedown", function (e) {
                textField.focus();
                document.execCommand('paste');
                removeSelectionOnPage();

            });
            tooltip.appendChild(pasteButton);
        }


    } else {
        /// Add search button
        searchButton = document.createElement('button');
        searchButton.setAttribute('class', `selection-popup-button`);

        if (addButtonIcons)
            searchButton.innerHTML = createImageIcon(searchButtonIcon) + (buttonsStyle == 'onlyicon' ? '' : searchLabel);
        else
            searchButton.textContent = searchLabel;

        /// TODO:
        /// Implement 'open in background tab on middle click'
        searchButton.addEventListener("mousedown", function (e) {
            var selectedText = selection.toString();
            onTooltipButtonClick(e, returnSearchUrl(selectedText.trim()));

            /// Search text
            // window.open(returnSearchUrl(selectedText.trim()), '_blank');
        });

        tooltip.appendChild(searchButton);


        /// Add copy button 
        var copyButton = document.createElement('button');
        copyButton.setAttribute('class', `selection-popup-button button-with-border`);
        if (buttonsStyle == 'onlyicon' && showButtonLabelOnHover)
            copyButton.setAttribute('title', copyLabel);
        if (addButtonIcons)
            copyButton.innerHTML = createImageIcon(copyButtonIcon, 0.8) + (buttonsStyle == 'onlyicon' ? '' : copyLabel);
        else
            copyButton.textContent = copyLabel;
        copyButton.addEventListener("mousedown", function (e) {
            document.execCommand('copy');
            // hideTooltip();
            removeSelectionOnPage();
        });
        tooltip.appendChild(copyButton);
    }
}

function addContextualButtons() {
    if (debugMode)
        console.log('Checking to add contextual buttons...');
    var selectedText = selection.toString().trim();
    var wordsCount = selectedText.split(' ').length;

    if (convertWhenOnlyFewWordsSelected == false || wordsCount <= wordsLimitToProccessText) {

        var numberToConvert;

        /// Math calculation of selected string
        function calculateString(fn) {
            return new Function('return ' + fn)();
        }

        /// Unit conversion button
        if (convertMetrics)
            outerloop: for (const [key, value] of Object.entries(convertionUnits)) {
                var nonConvertedUnit = preferredMetricsSystem == 'metric' ? key : value['convertsTo'];
                if (selectedText.includes(nonConvertedUnit)) {

                    var words = selectedText.split(' ');
                    for (i in words) {
                        var word = words[i];

                        /// Feet/inches ' " handling
                        // if (word.includes("'") && word.includes("''")) {
                        //   var numbers = word.split("'");
                        //   return;
                        //   // var feets  = calculateString(numbers[0]);
                        //   // var inches = calculateString(numbers[1]);
                        // }

                        // numberToConvert = word.match(/[+-]?\d+(\.\d) ? /g);
                        try {
                            numberToConvert = calculateString(word.trim());
                        } catch (e) { }

                        if (numberToConvert == null || numberToConvert == undefined || numberToConvert == '' || numberToConvert == NaN) {
                            var previousWord = words[i - 1];
                            if (previousWord !== undefined)
                                // numberToConvert = previousWord.match(/[+-]?\d+(\.\d) ? /g);
                                try {
                                    numberToConvert = calculateString(selectedText.trim());
                                    // numberToConvert = calculateString(previousWord.trim());
                                } catch (e) { }
                        }

                        if (numberToConvert == undefined) {
                            numberToConvert = selectedText.match(/[+-]?\d+(\.\d)?/g);
                            if (previousWord !== undefined && (numberToConvert == null || numberToConvert == undefined))
                                numberToConvert = previousWord.match(/[+-]?\d+(\.\d)?/g);
                            if (numberToConvert !== undefined && numberToConvert !== null)
                                numberToConvert = numberToConvert.join("");
                        }

                        if (numberToConvert !== null && numberToConvert !== '' && numberToConvert !== NaN && numberToConvert !== undefined) {

                            var fromUnit = preferredMetricsSystem == 'metric' ? key : value['convertsTo'];
                            var convertedUnit = preferredMetricsSystem == 'metric' ? value['convertsTo'] : key;
                            var convertedNumber;

                            if (fromUnit.includes('°')) {
                                convertedNumber = value['convertFunction'](numberToConvert);
                            } else {
                                convertedNumber = preferredMetricsSystem == 'metric' ? numberToConvert * value['ratio'] : numberToConvert / value['ratio'];
                            }

                            /// Round doubles to the first 2 symbols after dot
                            convertedNumber = convertedNumber.toFixed(2);

                            /// Add unit converter button
                            if (convertedNumber !== null && convertedNumber !== undefined && convertedNumber !== 0 && convertedNumber !== NaN) {
                                var interactiveButton = document.createElement('button');
                                interactiveButton.setAttribute('class', `selection-popup-button button-with-border open-link-button`);
                                if (showUnconvertedValue)
                                    interactiveButton.textContent = numberToConvert + ' ' + fromUnit + ' →';

                                var converted = document.createElement('span');
                                converted.textContent = ` ${convertedNumber} ${convertedUnit}`;
                                converted.setAttribute('style', `color: ${secondaryColor}`);
                                interactiveButton.appendChild(converted);

                                interactiveButton.addEventListener("mousedown", function (e) {
                                    let url = returnSearchUrl(`${numberToConvert + ' ' + fromUnit} to ${convertedUnit}`);
                                    onTooltipButtonClick(e, url);
                                });

                                tooltip.appendChild(interactiveButton);
                                try {
                                    tooltip.style.left = `${(parseInt(tooltip.style.left.replaceAll('px', ''), 10) - interactiveButton.clientWidth - 5) * 2}px`;
                                } catch (e) {
                                    if (debugMode)
                                        console.log(e);
                                }
                                break outerloop;
                            }
                        }
                    }
                }
            }

        /// Phone number button
        if (addPhoneButton && selectedText.includes('+') && !selectedText.trim().includes(' ') && selectedText.trim().length == 13 && selectedText[0] == '+') {
            var phoneButton = document.createElement('button');
            phoneButton.setAttribute('class', `selection-popup-button button-with-border`);
            phoneButton.innerHTML = createImageIcon(phoneIcon, 0.7) + selectedText;
            phoneButton.addEventListener("mousedown", function (e) {
                hideTooltip();
                removeSelectionOnPage();

                /// Open system handler
                window.open(`tel:${selectedText.trim()}`);
            });
            tooltip.appendChild(phoneButton);
        }

        /// Do simple math calculations
        if (numberToConvert == null && performSimpleMathOperations) {
            if (selectedText.includes('+') || selectedText.includes('-') || selectedText.includes('*') || selectedText.includes('/') || selectedText.includes('^'))
                try {
                    // var calculatedExpression = calculateString(selectedText.trim());
                    var calculatedExpression = calculateString(selectedText.trim().replaceAll(' ', ''));
                    if (calculatedExpression !== null && calculatedExpression !== undefined && calculatedExpression !== '' && calculatedExpression !== NaN) {

                        var number;
                        var numbersArray = calculatedExpression.toString().match(/[+-]?\d+(\.\d)?/g);
                        number = numbersArray[0];

                        // number = calculatedExpression;

                        if (number !== null) {
                            var interactiveButton = document.createElement('button');
                            interactiveButton.setAttribute('class', `selection-popup-button button-with-border open-link-button`);
                            if (showUnconvertedValue)
                                interactiveButton.textContent = selectedText + ' →';

                            var converted = document.createElement('span');
                            converted.textContent = ` ${calculatedExpression}`;
                            converted.setAttribute('style', `color: ${secondaryColor}`);
                            interactiveButton.appendChild(converted);

                            interactiveButton.addEventListener("mousedown", function (e) {
                                let url = returnSearchUrl(selectedText.replaceAll('+', '%2B'));
                                onTooltipButtonClick(e, url);
                            });

                            tooltip.appendChild(interactiveButton);
                            try {
                                tooltip.style.left = `${(parseInt(tooltip.style.left.replaceAll('px', ''), 10) - interactiveButton.clientWidth - 5) * 2}px`;
                            } catch (e) {
                                if (debugMode)
                                    console.log(e);
                            }
                        }
                    }
                } catch (e) {
                    if (debugMode)
                        console.log(e);
                }
        }

        /// Add "open on map" button
        if (showOnMapButtonEnabled) {
            var containsAddress = false;

            addressKeywords.forEach(function (address) {
                if (selectedText.toLowerCase().includes(address))
                    containsAddress = true;
            });

            if (containsAddress) {
                var mapButton = document.createElement('button');
                mapButton.setAttribute('class', `selection-popup-button button-with-border`);
                if (buttonsStyle == 'onlyicon' && showButtonLabelOnHover)
                    mapButton.setAttribute('title', showOnMapLabel);

                if (addButtonIcons)
                    mapButton.innerHTML = createImageIcon(mapButtonIcon, 1.0) + (buttonsStyle == 'onlyicon' ? '' : showOnMapLabel);
                else
                    mapButton.textContent = showOnMapLabel;
                mapButton.addEventListener("mousedown", function (e) {
                    /// Open maps service set by user (defaults to Google Maps)
                    let url = returnShowOnMapUrl(selectedText.trim());
                    onTooltipButtonClick(e, url);
                });
                tooltip.appendChild(mapButton);
                /// Correct tooltip's dx
                tooltip.style.left = `${(parseFloat(tooltip.style.left.replaceAll('px', ''), 10) - (mapButton.clientWidth / 2))}px`;

                /// Correct last button's border radius
                tooltip.children[tooltip.children.length - 2].style.borderRadius = '0px';
                tooltip.children[tooltip.children.length - 1].style.borderRadius = lastButtonBorderRadius;
            }
        }

        /// Add email button
        if (showEmailButton && selectedText.includes('@') && !selectedText.trim().includes(' ')) {
            try {
                var emailText = selectedText.trim().toLowerCase();
                var emailButton = document.createElement('button');
                emailButton.setAttribute('class', `selection-popup-button button-with-border`);
                // if (addButtonIcons)
                emailButton.innerHTML = createImageIcon(emailButtonIcon, buttonsStyle == 'onlyicon' ? 0.4 : 0.65) + (buttonsStyle == 'onlyicon' ? '  ' : '') + (emailText.length > linkSymbolsToShow ? emailText.substring(0, linkSymbolsToShow) + '...' : emailText);
                // emailButton.style.color = secondaryColor;

                emailButton.addEventListener("mousedown", function (e) {
                    let url = returnNewEmailUrl(emailText);
                    onTooltipButtonClick(e, url);
                });

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
        if (addColorPreviewButton && ((selectedText.includes('#') && !selectedText.trim().includes(' ')) || (selectedText.includes('rgb') && selectedText.includes('(')))) {
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
        if (convertCurrencies) {
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

                    var text = selectedText;

                    /// Special handling for prices where coma separates fractional digits instead of thousandths
                    if (text.includes(',')) {
                        var parts = text.split(',');
                        if (parts.length == 2) {
                            if (parts[1].match(/[+-]?\d+(\.\d)?/g).join('').length < 3) {
                                text = text.replaceAll(',', '.');
                            }
                        }
                    }

                    /// Remove all non-number symbols (except dots)
                    amount = text.match(/[+-]?\d+(\.\d)?/g);
                    if (amount !== null)
                        amount = amount.join("");
                    break;
                }
            }

            if (currency !== undefined && currency !== convertToCurrency && amount !== null) {

                /// Update currency rates in case they are old (will be used for next conversions)
                if (ratesLastFetchedDate !== null) {
                    var today = new Date();
                    var dayOfNextFetch = new Date(ratesLastFetchedDate);
                    dayOfNextFetch.setDate(dayOfNextFetch.getDate() + updateRatesEveryDays);

                    if (today >= dayOfNextFetch) {
                        fetchCurrencyRates();
                    }
                }

                /// Rates are already locally stored (should be initially)
                if (currencyRate !== null && currencyRate !== undefined) {
                    if (debugMode)
                        console.log(`Found local rate for currency ${currency}`);

                    for (const [key, value] of Object.entries(currenciesList)) {
                        if (value["id"] == convertToCurrency && value['rate'] !== null && value['rate'] !== undefined) {
                            var rateOfDesiredCurrency = value['rate'];
                            if (debugMode)
                                console.log(`Rate is: ${rateOfDesiredCurrency}`);

                            var resultingRate = rateOfDesiredCurrency / currencyRate;
                            var convertedAmount = amount * resultingRate;

                            if (convertedAmount !== null && convertedAmount !== undefined && convertedAmount.toString() !== 'NaN') {
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
                                var interactiveButton = document.createElement('button');
                                interactiveButton.setAttribute('class', `selection-popup-button button-with-border open-link-button`);

                                /// Show value before convertion
                                if (showUnconvertedValue) {
                                    if (preferCurrencySymbol && currencySymbol !== undefined)
                                        interactiveButton.textContent = ` ${amount} ${currencySymbol} →`;
                                    else
                                        interactiveButton.textContent = ` ${amount} ${currency} →`;
                                }

                                /// Show value after converion
                                var converted = document.createElement('span');
                                var userCurrencySymbol = currenciesList[convertToCurrency]['currencySymbol'];

                                if (preferCurrencySymbol && userCurrencySymbol !== undefined)
                                    converted.textContent = ` ${convertedAmountString} ${userCurrencySymbol}`;
                                else
                                    converted.textContent = ` ${convertedAmountString} ${convertToCurrency}`;

                                converted.setAttribute('style', `color: ${secondaryColor}`);
                                interactiveButton.appendChild(converted);

                                interactiveButton.addEventListener("mousedown", function (e) {
                                    let url = returnSearchUrl(`${amount + ' ' + currency} to ${convertToCurrency}`);
                                    onTooltipButtonClick(e, url);
                                });

                                tooltip.appendChild(interactiveButton);

                                /// Correct tooltip's dx
                                tooltip.style.left = `${(parseFloat(tooltip.style.left.replaceAll('px', ''), 10) - (interactiveButton.clientWidth / 2))}px`;

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
                if (addOpenLinks)
                    if (tooltip.children.length < 4 && !selectedText.trim().includes(' ') && (selectedText.includes('.') || selectedText.includes('/'))) {
                        var words = selectedText.split(' ');
                        for (i in words) {
                            var link = words[i];
                            // if (link.includes('.') || link.includes('/')) {
                            if ((link.includes('.') || link.includes('/')) && !link.trim().includes(' ') && !link.includes('@') && link.length > 4) {
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
                                            if (buttonsStyle == 'onlyicon') {
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

    // if (tooltip.children.length < 4 && showTranslateButton && (document.getElementById('selecton-translate-button') == null || document.getElementById('selecton-translate-button') == undefined)) {
    if (tooltip.children.length < 4 && showTranslateButton) {
        addTranslateButton();
    }

    setTimeout(function () {
        /// Set border radius for first and last buttons
        tooltip.children[1].style.borderRadius = firstButtonBorderRadius;
        tooltip.children[tooltip.children.length - 1].style.borderRadius = lastButtonBorderRadius;

        calculateTooltipPosition();
    }, 1);
}

function addTranslateButton() {
    if (debugMode)
        console.log('Checking if its needed to add Translate button...');

    var selectedText = selection.toString();

    if (debugMode)
        console.log(`Selected text is: ${selectedText}`);
    try {
        chrome.i18n.detectLanguage(selectedText, function (result) {
            var detectedLanguages = result;

            /// Show Translate button when language was not detected
            var shouldTranslate = true;

            if (debugMode)
                console.log(`User language is: ${languageToTranslate}`);

            if (detectedLanguages !== null && detectedLanguages !== undefined) {
                var langs = detectedLanguages.languages;

                if (langs !== []) {
                    if (debugMode)
                        console.log(`Detection is reliable: ${detectedLanguages.isReliable}`);
                    langs.forEach(function (lang) {
                        if (debugMode) {
                            console.log('Detected language: ' + langs[0].language);
                        }
                        /// Don't show translate button if selected language is the same as desired
                        if (lang.language == languageToTranslate) shouldTranslate = false;
                    })
                } else {
                    if (debugMode) {
                        console.log('Selecton failed to detect selected text language');
                    }
                }
            }

            if (debugMode)
                console.log(`Should translate: ${shouldTranslate}`);

            if (shouldTranslate == true) {
                var translateButton = document.createElement('button');
                translateButton.setAttribute('class', `selection-popup-button button-with-border open-link-button`);
                if (buttonsStyle == 'onlyicon' && showButtonLabelOnHover)
                    translateButton.setAttribute('title', translateLabel);
                translateButton.setAttribute('id', 'selecton-translate-button');
                if (addButtonIcons)
                    translateButton.innerHTML = createImageIcon(translateButtonIcon, 0.75) + (buttonsStyle == 'onlyicon' ? '' : translateLabel);
                else
                    translateButton.textContent = translateLabel;
                translateButton.addEventListener("mousedown", function (e) {
                    let url = `https://translate.google.com/?sl=auto&tl=${languageToTranslate}&text=${encodeURI(selectedText.trim())}`;
                    onTooltipButtonClick(e, url);
                });
                tooltip.appendChild(translateButton);
                /// Correct tooltip's dx
                tooltip.style.left = `${(parseFloat(tooltip.style.left.replaceAll('px', ''), 10) - (translateButton.clientWidth / 2))}px`;

                /// Correct last button's border radius
                tooltip.children[tooltip.children.length - 2].style.borderRadius = '0px';
                tooltip.children[tooltip.children.length - 1].style.borderRadius = lastButtonBorderRadius;

                checkTooltipForCollidingWithSideEdges();
            } else {
                checkTooltipForCollidingWithSideEdges();
            }
        });
    } catch (e) {
        if (debugMode)
            console.log(e);
    }
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
        if (debugMode)
            console.log(e);

        /// Fall back to old approach - place tooltip in horizontal center selection rect,
        /// which may be in fact bigger than visible selection
        resultingDx = selDimensions.dx + (selDimensions.width / 2) - (tooltip.clientWidth / 2);
    }

    /// Show tooltip on top of selection
    showTooltip(resultingDx, resultingDy + 4);

    if (addDragHandles)
        setDragHandles();

    setTimeout(function () {
        checkTooltipForCollidingWithSideEdges();
    }, 1);
}

function showTooltip(dx, dy) {
    tooltip.style.pointerEvents = 'auto';
    tooltip.style.top = `${dy}px`;
    tooltip.style.left = `${dx}px`;
    tooltip.style.opacity = useCustomStyle ? tooltipOpacity : 1.0;

    if (tooltipRevealEffect == 'moveUpTooltipEffect') {
        /// Make tooltip not-interactive in first half of animation
        tooltip.style.pointerEvents = 'none';
        setTimeout(function () {
            tooltip.style.pointerEvents = 'all';
        }, animationDuration / 2);
    }

    /// Set reveal animation type
    tooltip.style.transform = returnTooltipRevealTransform(true);

    if (debugMode)
        console.log('Selecton tooltip shown');

    if (shiftTooltipWhenWebsiteHasOwn)
        setTimeout(function () {
            /// Experimental code to determine website's own selection tooltip
            var websiteTooltips = document.querySelectorAll(`[style*='position: absolute'][style*='transform'],[class^='popup popup_warning']`);

            var websiteTooltip;
            if (websiteTooltips !== null && websiteTooltips !== undefined)
                for (i in websiteTooltips) {
                    var el = websiteTooltips[i];

                    if (el.style !== undefined && !el.getAttribute('class').toString().includes('selection-tooltip')) {
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
                            if (el.clientHeight < 100) {
                                if (debugMode) {
                                    console.log('Detected selection tooltip on the website with following style:');
                                    console.log(elementStyle);
                                }

                                websiteTooltip = el;
                                break;
                            }
                        }
                    }
                };

            if (websiteTooltip !== null && websiteTooltip !== undefined && websiteTooltip.clientHeight > 1) {
                tooltip.style.transition = `top 200ms ease-out, opacity ${animationDuration}ms ease-in-out, transform 200ms ease-out`;
                tooltip.style.top = `${dy - websiteTooltip.clientHeight}px`;

                arrow.style.transition = ` opacity 100ms ease-in-out`;
                arrow.style.opacity = 0.0;

                setTimeout(function () {
                    tooltip.style.transition = `opacity ${animationDuration}ms ease-in-out, transform 200ms ease-out`;
                    arrow.parentNode.removeChild(arrow);
                }, 200);
            } else {
                arrow.style.opacity = 1.0;
                if (debugMode) {
                    console.log('Selection didnt found any website tooltips');
                }
            }

        }, 300);

    /// Create secondary tooltip (for custom search options)
    /// Add a delay to be sure currency and translate buttons were already added
    if (secondaryTooltipEnabled && customSearchButtons !== null && customSearchButtons !== undefined && customSearchButtons !== [])
        setTimeout(function () {
            try {
                createSecondaryTooltip();
            } catch (e) {
                console.log(e);
            }
        }, 300);
}

function checkTooltipForCollidingWithSideEdges() {
    if (debugMode)
        console.log('Checking Selecton tooltip to colliding with side edges...');

    var dx = parseInt(tooltip.style.left.replaceAll('px', ''));

    var tooltipWidth = 12.0;
    tooltip.querySelectorAll('.selection-popup-button').forEach(function (el) {
        tooltipWidth += el.offsetWidth;
    });

    /// Tooltip is off-screen on the left
    if (dx < 0) {

        if (debugMode)
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
            if (debugMode)
                console.log('Tooltip is colliding with right edge. Fixing...');

            tooltip.style.left = `${dx - offscreenAmount - 5}px`;

            /// Shift the arrow to match new position
            var newLeftPercentForArrow = (dx - (dx - offscreenAmount - 5)) / tooltipWidth * 100;
            arrow.style.left = `${50 + newLeftPercentForArrow}%`;
        } else {
            if (debugMode)
                console.log('Tooltip is not colliding with side edges');
        }
    }
}

function hideTooltip() {

    if (debugMode)
        console.log('Checking for existing Selecton tooltips...')

    /// Hide all main tooltips
    var oldTooltips = document.querySelectorAll('.selection-tooltip');
    if (debugMode) {
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

                if (debugMode)
                    console.log('Selecton tooltip hidden');

                if (oldTooltip.parentNode !== null)
                    oldTooltip.parentNode.removeChild(oldTooltip);

            }, animationDuration);
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

                // if (debugMode)
                //   console.log('Selecton secondary secondary tooltip hidden');

            }, animationDuration);
        })
}

function createImageIcon(url, opacity = 0.5) {
    return `<img src="${url}" style="all: revert; opacity: ${buttonsStyle == 'onlyicon' ? opacity * 1.5 : opacity}; filter: invert(${isDarkBackground ? '100' : '0'}%);vertical-align: top !important;  max-height:16px !important;display: unset !important;${buttonsStyle == 'onlyicon' ? '' : 'padding-right: 5px;'}"" />`;
}

function returnTooltipRevealTransform(onEnd = true) {
    switch (tooltipRevealEffect) {
        case 'noTooltipEffect': return ``;
        case 'moveUpTooltipEffect': return onEnd ? `translate(0,0)` : `translate(0, 100%)`;
        case 'moveDownTooltipEffect': return onEnd ? `translate(0,0)` : `translate(0, -100%)`;
        case 'scaleUpTooltipEffect': return onEnd ? `scale(1.0)` : `scale(0.0)`;
    }
}

function onTooltipButtonClick(e, url) {
    hideTooltip();
    removeSelectionOnPage();
    if (addDragHandles)
        hideDragHandles();

    /// Open new tab with passed url
    try {
        var evt = e || window.event;

        if ("buttons" in evt) {
            if (evt.buttons == 1) {
                /// Left button click
                chrome.runtime.sendMessage({ type: 'selecton-open-new-tab', url: url, focused: true });
            } else if (evt.buttons == 4) {
                /// Middle button click
                evt.preventDefault();
                chrome.runtime.sendMessage({ type: 'selecton-open-new-tab', url: url, focused: false });
            }
        }
    } catch (e) {
        window.open(url, '_blank');
    }
}