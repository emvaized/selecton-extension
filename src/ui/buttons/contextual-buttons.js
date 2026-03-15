function addContextualButtons(callbackOnFinish) {
    if (selection == null) return;

    const loweredSelectedText = selectedText.toLowerCase();
    const wordsCount = selectedText.split(' ').length;
    const selectionContainsSpaces = selectedText.includes(' ');
    const selectionLength = selectedText.length;
    let isFileName = false;

    if (convertWhenOnlyFewWordsSelected == false || wordsCount <= wordsLimitToProccessText) {
        let numberToConvert;

        /// Convert currency button
        if (configs.convertCurrencies) {
            let currency, amount, currencyRate, currencySymbol;
            let match = false;

            for (const [key, value] of Object.entries(currenciesList)) {
                if (selectedText.includes(' ' + key) || 
                    (value["currencySymbol"] && selectedText.includes(value["currencySymbol"])) || 
                    (value["symbol"] && selectedText.includes(value["symbol"]))
                ) {
                    match = true;
                } else {
                    const currencyKeywords = value["currencyKeywords"] || value["keywords"];
                    if (currencyKeywords !== null && currencyKeywords !== undefined)
                        for (i in currencyKeywords) {
                            if (loweredSelectedText.includes(currencyKeywords[i])) {
                                match = true;
                            }
                        }
                }

                /// Check if found currency is searchable
                if (value['searchInText'] == false) match = false;

                if (match) {
                    currency = key;
                    currencyRate = value["rate"];
                    currencySymbol = value["currencySymbol"] || value["symbol"];

                    /// Fix currency formats (thousand/decimal separators)
                    let textToParse = selectedText;
                    let lastDot = textToParse.lastIndexOf('.');
                    let lastComma = textToParse.lastIndexOf(',');

                    // Case 1: Both dot and comma exist (e.g., 25.000,00 or 25,000.00)
                    if (lastDot > -1 && lastComma > -1) {
                        if (lastDot > lastComma) {
                            textToParse = textToParse.replaceAll(',', ''); // Comma is a thousand separator, remove it.
                        } else {
                            textToParse = textToParse.replaceAll('.', '').replaceAll(',', '.'); // Dot is a thousand separator, remove it and convert comma to decimal.
                        }
                    } 
                    // Case 2: Only comma exists (e.g., 25,000 or 25,00)
                    else if (lastComma > -1) {
                        let parts = textToParse.split(',');
                        if (parts.length === 2) {
                            let fractionMatch = parts[1].match(/\d+/);
                            if (fractionMatch && fractionMatch[0].length < 3) {
                                textToParse = textToParse.replaceAll(',', '.'); // It' a decimal separator
                            } else {
                                textToParse = textToParse.replaceAll(',', ''); // It's a thousand separator
                            }
                        } else {
                            textToParse = textToParse.replaceAll(',', '');
                        }
                    } 
                    // Case 3: Only dot exists (e.g., 25.000 or 25.00)
                    else if (lastDot > -1) {
                        let parts = textToParse.split('.');
                        if (parts.length > 2) {
                            textToParse = textToParse.replaceAll('.', '');
                        } else if (parts.length === 2) {
                            let fractionMatch = parts[1].match(/\d+/);
                            if (fractionMatch && fractionMatch[0].length === 3) {
                                textToParse = textToParse.replaceAll('.', ''); // It's a thousand separator, remove it.
                            }
                        }
                    }

                    /// Find the amount
                    amount = extractAmountFromSelectedText(textToParse);
                    break;
                }
            }

            /// NEW LOGIC: Determine the target currency
            let targetCurrency = configs.convertToCurrency;
            
            // If the currency in the selected text is the same as the primary currency, set target to secondary.
            if (currency === configs.convertToCurrency && configs.convertToCurrencySecondary) {
                targetCurrency = configs.convertToCurrencySecondary;
            }

            // Using 'targetCurrency' instead of 'configs.convertToCurrency' in the condition below.
            // Also checking that the selected currency is not the same as targetCurrency (currency !== targetCurrency)
            if (currency !== undefined && currency !== targetCurrency && amount !== null && amount !== undefined) {

                /// Rates are already locally stored (should be initially)
                if (currencyRate !== null && currencyRate !== undefined) {
                    if (configs.debugMode) {
                        console.log(`Found rate for currency ${currency}: ${currencyRate}`);
                        console.log('Target currency is: ' + targetCurrency);
                    }

                    // Rate is now calculated based on 'targetCurrency' instead of 'configs.convertToCurrency'
                    const value = currenciesList[targetCurrency];
                    if (value && value['rate'] !== null && value['rate'] !== undefined) {

                        let rateOfDesiredCurrency = value['rate'];

                        /// Check for literal multipliers (million, billion and so on)
                        for (i in billionMultipliers) { if (loweredSelectedText.includes(billionMultipliers[i])) { amount *= 1000000000; break; } }
                        for (i in millionMultipliers) { if (loweredSelectedText.includes(millionMultipliers[i].toLowerCase())) { amount *= 1000000; break; } }
                        for (i in thousandMultipliers) { if (loweredSelectedText.includes(thousandMultipliers[i].toLowerCase())) { amount *= 1000; break; } }

                        let resultingRate = rateOfDesiredCurrency / currencyRate;
                        if (configs.debugMode) console.log('conversion rate: ' + resultingRate);
                        let convertedAmount = amount * resultingRate;

                        if (convertedAmount !== null && convertedAmount !== undefined && !isNaN(convertedAmount) && convertedAmount.toString() !== '') {
                            /// Round result
                            try {
                                convertedAmount = parseFloat(convertedAmount);
                                convertedAmount = convertedAmount.toFixed(2);
                            } catch (e) { console.log(e); }

                            /// Separate resulting numbers in groups of 3 digits
                            let convertedAmountString = convertedAmount.toString();
                            convertedAmountString = splitNumberInGroups(convertedAmountString);

                            /// Create and add currency button with result of conversion
                            const currencyButton = addContextualTooltipButton(function (e) {
                                let url = returnSearchUrl(`${amount + ' ' + currency} to ${targetCurrency}`);
                                onTooltipButtonClick(e, url, convertedAmountString + ` ${targetCurrency}`);
                            })

                            /// Show value before convertion
                            if (configs.showUnconvertedValue) {
                                if (configs.preferCurrencySymbol && currencySymbol !== undefined)
                                    currencyButton.textContent = ` ${amount} ${currencySymbol} →`;
                                else
                                    currencyButton.textContent = ` ${amount} ${currency} →`;
                            }

                            /// Show value after converion
                            const converted = document.createElement('span');
                            
                            // Using 'targetCurrency' here as well instead of 'configs.convertToCurrency'
                            const currencySymbolToUse = currenciesList[targetCurrency]['currencySymbol'] || currenciesList[targetCurrency]['symbol'];

                            if (configs.preferCurrencySymbol && currencySymbolToUse !== undefined)
                                converted.textContent = ` ${convertedAmountString}`;
                            else
                                converted.textContent = ` ${convertedAmountString}`;

                            converted.classList.add('color-highlight');
                            currencyButton.appendChild(converted);

                            /// Add currency symbol with different color
                            const currencyLabel = document.createElement('span');
                            currencyLabel.textContent = ` ${configs.preferCurrencySymbol ? currencySymbolToUse : targetCurrency}`;
                            currencyLabel.style.color = 'var(--selection-button-foreground)';
                            currencyButton.appendChild(currencyLabel);
                        }
                    }
                }
            }
        }

        /// Unit conversion button
        if (configs.convertMetrics) {
            let convertedNumber, fromUnit, convertedUnit;

            /// Feet ' and inches " handling
            if (!selectionContainsSpaces && configs.preferredMetricsSystem == 'metric' && /['||"]/.test(selectedText))
                /// don't proccess if text includes letters
                if (!/[a-zA-Z]/g.test(selectedText))
                    if (selectedText.includes("'")) {
                        let feet, inches;
                        const parts = selectedText.split("'");
                        const partsL = parts.length;

                        if (partsL == 2 || partsL == 4) {
                            feet = extractAmountFromSelectedText(parts[0]);
                            inches = extractAmountFromSelectedText(parts[1].split('"')[0])
                        } else if (partsL == 1) {
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
                        /// Only inches are present
                        const parts = selectedText.split('"')

                        if (parts.length == 2) {
                            inches = extractAmountFromSelectedText(selectedText);
                            convertedNumber = inches * convertionUnits['inch']['ratio'];
                            fromUnit = '';
                            convertedUnit = 'cm';
                            numberToConvert = selectedText;
                        }
                    }

            /// Check for keywords in text
            let includesKeyword = false;
            const unitsKeywords = configs.preferredMetricsSystem == 'metric' ? convertionUnits : imprerialConvertionUnits;
            const unitKeys = Object.keys(unitsKeywords);

            for (let i = 0, l = unitKeys.length; i < l; i++) {
                const key = unitKeys[i];

                let nonConvertedUnit = key;
                if (selectedText.includes(nonConvertedUnit)) {
                    /// don't duplicate when found 'pound' (as it's also a currency)
                    if (nonConvertedUnit == 'pound' && tooltip.children.length == 4) return;
                    includesKeyword = i; break;
                } else if (unitsKeywords[key]['variations']) {
                    const keyVariations = unitsKeywords[key]['variations'];

                    for (let i2 = 0, l2 = keyVariations.length; i2 < l2; i2++) {
                        if (selectedText.includes(keyVariations[i2])) {
                            includesKeyword = i; break;
                        }
                    }
                }
            }

            /// Calculate value
            if (includesKeyword !== false) {
                /// Special handling for values where coma separates fractional digits instead of thousandths
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

                const convertButton = addContextualTooltipButton(function (e) {
                    let url = returnSearchUrl(`${numberToConvert + ' ' + fromUnit.trim()} to ${convertedUnit}`);
                    onTooltipButtonClick(e, url, `${convertedNumber} ${convertedUnit}`);
                });

                if (configs.showUnconvertedValue)
                    convertButton.textContent = numberToConvert + ' ' + fromUnit + ' →';

                const converted = document.createElement('span');
                converted.textContent = ` ${convertedNumber}`;
                converted.classList.add('color-highlight');
                convertButton.appendChild(converted);

                const unitLabelEl = document.createElement('span');
                unitLabelEl.textContent = ` ${convertedUnit}`;
                unitLabelEl.style.color = 'var(--selection-button-foreground)';
                convertButton.appendChild(unitLabelEl);
            }
        }

        /// Phone number button
        if (configs.addPhoneButton && !selectionContainsSpaces && selectedText[0] == '+' && selectionLength == 13) {
            const phoneButton = addContextualTooltipButton(function (e) {
                hideTooltip();
                removeSelectionOnPage();

                /// Open system handler
                window.open(`tel:${selectedText}`, '_self');
            });

            let phoneText = selectedText;

            if (configs.buttonsStyle == 'onlylabel') {
                let phoneSymbolsToShow = 8;
                phoneButton.textContent = chrome.i18n.getMessage('callLabel') + ' ';

                let phoneLabel = document.createElement('div');
                phoneLabel.style.display = 'inline';
                phoneLabel.textContent = phoneText.length > phoneSymbolsToShow ? phoneText.substring(0, phoneSymbolsToShow) + '...' : phoneText;
                phoneLabel.classList.add('color-highlight');

                /// Add tooltip with full text on hover
                if (phoneLabel.length > phoneSymbolsToShow)
                    phoneButton.setAttribute('title', phoneText);
                phoneButton.appendChild(phoneLabel);
            }
            else {
                phoneButton.appendChild(createImageIconForButton(phoneIcon, phoneText, true));
                phoneButton.classList.add('color-highlight');
            }
        }

        /// Perform simple math calculations
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
                                const mathButton = addContextualTooltipButton(function (e) {
                                    let url = returnSearchUrl(selectedText.replaceAll('+', '%2B'));
                                    onTooltipButtonClick(e, url, calculatedExpression);
                                });

                                if (configs.showUnconvertedValue)
                                    mathButton.textContent = selectedText + ' →';

                                const converted = document.createElement('span');
                                if (!configs.showUnconvertedValue) converted.textContent = '=';
                                converted.textContent += ` ${calculatedExpression}`;
                                converted.classList.add('color-highlight');
                                mathButton.appendChild(converted);
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
                const mapUrl = returnShowOnMapUrl(selectedText);
                addLinkTooltipButton(
                    showOnMapLabel,
                    createImageIconForButton(mapButtonIcon, configs.buttonsStyle == 'onlyicon' ? '' : showOnMapLabel),
                    mapUrl
                );

            }
        }

        /// Add email button
        if (configs.showEmailButton && !selectionContainsSpaces && selectedText.includes('@')) {
            const splitedByAt = selectedText.split('@');
            if (splitedByAt.length == 2 && splitedByAt[1].includes('.'))
                try {
                    const emailText = loweredSelectedText;

                    const emailButton = addContextualTooltipButton(function (e) {
                        let url = returnNewEmailUrl(emailText);
                        onTooltipButtonClick(e, url);
                    })

                    if (configs.buttonsStyle == 'onlylabel') {
                        emailButton.textContent = chrome.i18n.getMessage('email') + ' ';

                        let emailLabel = document.createElement('div');
                        emailLabel.style.display = 'inline';
                        emailLabel.textContent = emailText.length > linkSymbolsToShow ? emailText.substring(0, linkSymbolsToShow) + '...' : emailText;
                        emailLabel.classList.add('color-highlight');

                        /// Add tooltip with full text on hover
                        if (emailText.length > linkSymbolsToShow)
                            emailButton.setAttribute('title', emailText);
                        emailButton.appendChild(emailLabel);
                    }
                    else {
                        emailButton.appendChild(createImageIconForButton(emailButtonIcon, (emailText.length > linkSymbolsToShow ? emailText.substring(0, linkSymbolsToShow) + '...' : emailText), true));
                        if (emailText.length > linkSymbolsToShow) emailButton.setAttribute('title', emailText);
                        emailButton.classList.add('color-highlight');
                    }

                } catch (error) {
                    console.log(error);
                }
        }

        /// Add HEX color preview button
        if (configs.addColorPreviewButton) {
            if ((!selectionContainsSpaces && selectionLength == 7 && selectedText.includes('#')) ||
                (selectedText.includes('rgb') && selectedText.includes('('))) {
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

                    const colorButton = addContextualTooltipButton(function (e) {
                        const url = returnSearchUrl(colorText.replaceAll('#', '%23'), false);
                        onTooltipButtonClick(e, url, colorText);
                    })

                    // const colorButton = document.createElement('button');
                    // colorButton.setAttribute('class', 'selection-popup-button button-with-border');

                    const colorCircle = document.createElement('div');
                    colorCircle.setAttribute('class', 'selection-popup-color-preview-circle');
                    colorCircle.style.background = colorText;
                    colorCircle.style.marginRight = '4.5px';

                    /// Add red/green/blue tooltip on hover
                    const rgbColor = hexToRgb(colorText);
                    colorButton.setAttribute('title', `red: ${rgbColor.red}, green: ${rgbColor.green}, blue: ${rgbColor.blue}`);

                    colorButton.appendChild(colorCircle);
                    colorButton.insertAdjacentHTML('beforeend', ' ' + (colorText.length > linkSymbolsToShow ? colorText.substring(0, linkSymbolsToShow) + '...' : colorText));
                    colorButton.classList.add('color-highlight');

                } catch (error) {
                    console.log(error);
                }
            }
        }

        /// Time convert button
        if (configs.convertTime) {
            try {
                let textToProccess = selectedText;

                /// 12H - 24H conversion
                // let numbers = extractAmountFromSelectedText(textToProccess);   /// Check if selected text contains numbers
                if (configs.preferredMetricsSystem == 'metric') {
                    if (textToProccess.includes(' PM') || textToProccess.includes(' AM')) {
                        textToProccess = convertTime12to24(textToProccess);
                    }
                } else {
                    if (textToProccess.includes(':') && !textToProccess.includes(' ') && !textToProccess.includes('AM') && !textToProccess.includes('PM')) {
                        textToProccess = convertTime24to12(textToProccess);
                    }
                }

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

                                /// correct timezone to dst
                                function isDST(d) {
                                    let jan = new Date(d.getFullYear(), 0, 1).getTimezoneOffset();
                                    let jul = new Date(d.getFullYear(), 6, 1).getTimezoneOffset();
                                    return Math.max(jan, jul) !== d.getTimezoneOffset();
                                }

                                const isDst = isDST(today);
                                if (marker == 'EST' && isDst) marker = 'EDT';
                                if (marker == 'CET' && isDst) marker = 'CEST';

                                let modifier = selectedText.includes(' PM') ? ' PM' : selectedText.includes(' AM') ? ' AM' : '';
                                let dateStringWithTimeReplaced = `${today.getMonth() + 1}/${today.getDate()}/${today.getFullYear()} ${numbers[0]}:${numbers[1]}${modifier} ${timeZoneKeywords[marker]}`;
                                let d = new Date(dateStringWithTimeReplaced); /// '6/29/2011 4:52:48 PM UTC'

                                convertedTime = d.toLocaleTimeString().substring(0, 5);
                            }
                        }
                        break;
                    }
                }

                if ((convertedTime !== null && convertedTime !== undefined && convertedTime !== '' && convertedTime !== 'Inval') || textToProccess !== selectedText) {
                    const timeStringToShow = textToProccess.match(/[+-]?\d+(\.\d)?/g).slice(0, 2).join(':');

                    const timeButton = addContextualTooltipButton(function (e) {
                        // hideTooltip();
                        // removeSelectionOnPage();

                        onTooltipButtonClick(e, returnSearchUrl(timeWord ? `${timeWord} ${marker}` : textToProccess), convertedTime ?? timeStringToShow)
                    });

                    timeButton.classList.add('color-highlight');

                    if (addButtonIcons)
                        timeButton.appendChild(createImageIconForButton(clockIcon, convertedTime ?? timeStringToShow, true));
                    else
                        timeButton.textContent = convertedTime ?? timeStringToShow;
                }

            } catch (e) { if (configs.debugMode) console.log(e); }
        }

        /// Calendar button for dates
        if (configs.addCalendarButton)
            checkToAddCalendarButton(selectedText);

        /// Add 'open link' button
        if (configs.addOpenLinks)
            if (!selectionContainsSpaces && selectedText.includes('.') && !tooltip.children[3]) {
                let link = selectedText;
                const splittedByDots = link.split('.');
                if (splittedByDots[0].length > 1) {
                    const splittedByDotsLength = splittedByDots.length;
                    const domain = splittedByDots[splittedByDotsLength - 1].split('/')[0], domainLength = domain.length;
                    const includesUrlMarker = selectedText.includes('://');

                    if (includesUrlMarker || ((splittedByDotsLength == 2 || splittedByDotsLength == 3) && domainLength > 1 && domainLength < 4 && !isStringNumeric(domain))) {

                        /// Don't recognize if selected text looks like filename
                        for (let i = 0, l = filetypesToIgnoreAsDomains.length; i < l; i++) {
                            if (domain.includes(filetypesToIgnoreAsDomains[i])) {
                                isFileName = true;
                                break;
                            }
                        }

                        if (isFileName == false || includesUrlMarker) {
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

                            /// Add open link button
                            const linkToOpen = !link.includes('://') && !link.includes('about:') ? 'https://' + link : link;
                            const linkButton = addLinkTooltipButton(undefined, undefined, linkToOpen)

                            let linkText = document.createElement('div');
                            linkText.style.display = 'inline';
                            let linkToShow = link.replaceAll('http://', '').replaceAll('https://', '');
                            linkText.textContent = linkToShow.length > linkSymbolsToShow ? linkToShow.substring(0, linkSymbolsToShow) + '...' : linkToShow;
                            linkText.classList.add('color-highlight');

                            /// Add tooltip with full website on hover
                            if (link.length > linkSymbolsToShow)
                                linkButton.setAttribute('title', link);

                            if (addButtonIcons)
                                linkButton.appendChild(createImageIconForButton(openLinkButtonIcon, undefined, true));
                            else linkButton.textContent = openLinkLabel + ' ';

                            linkButton.appendChild(linkText);

                            /// try fetching link favicon
                            let openLinkIcon = linkButton.querySelector('.selecton-button-img-icon');
                            if (openLinkIcon) {
                                openLinkIcon.style.backgroundImage = 'url(' + openLinkButtonIcon + ')';
                                const onFaviconLoadListener = (e) => {
                                    if (openLinkIcon.src == openLinkButtonIcon) return;
                                    openLinkIcon.style.backgroundImage = 'none';

                                    if (openLinkIcon.naturalHeight == 16) {
                                        /// Google returns standard 'globe' icon
                                        openLinkIcon.removeEventListener('load', onFaviconLoadListener);
                                        openLinkIcon.src = openLinkButtonIcon;
                                    } else {
                                        openLinkIcon.classList.add('no-filter-icon');
                                    }
                                }

                                openLinkIcon.addEventListener('load', onFaviconLoadListener);
                                // openLinkIcon.onload = onFaviconLoadListener

                                openLinkIcon.onerror = function (e) {
                                    openLinkIcon.removeEventListener('load', onFaviconLoadListener);
                                    openLinkIcon.src = openLinkButtonIcon;
                                    openLinkIcon.classList.remove('no-filter-icon');
                                    openLinkIcon.style.backgroundImage = 'none';
                                }

                                openLinkIcon.src = 'https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&size=24&url=https://' + linkToShow.split('/')[0];
                            }
                        }

                    }
                }

            } else if (!selectionContainsSpaces && selectedText[0] == 'r' && selectedText[1] == '/') {
                /// Add Reddit button
                let redditButton = addLinkTooltipButton(chrome.i18n.getMessage('openLinkLabel'), 'https://www.redditstatic.com/desktop2x/img/favicon/apple-icon-57x57.png', 'https://www.reddit.com/' + selectedText, false, 1.0);

                let highlightedText = document.createElement('span');
                highlightedText.style.display = 'inline';
                highlightedText.textContent = ' reddit';
                highlightedText.classList.add('color-highlight');
                redditButton.appendChild(highlightedText);

                let redditFavicon = redditButton.querySelector('.selecton-button-img-icon');
                if (redditFavicon) redditFavicon.classList.add('no-filter-icon');
            }
    }

    const containsSpecialSymbols = /[`#$^*_\\[\]{}=|<>~]/.test(selectedText) || isFileName || (selectionLength == 1 && /[,.()]/.test(selectedText));
    const contextButtonWasAdded = tooltip.children[3] && 
        configs.customSearchOptionsDisplay !== 'panelCustomSearchStyle';

    /// Add hover buttons when enabled, and no other contextual buttons were added
    if (configs.showTranslateButton && !containsSpecialSymbols && !contextButtonWasAdded) {
        addTranslateButton(addStaticButtons, selectionLength, wordsCount);
    } else addStaticButtons();

    function addStaticButtons() {
        /// Add quote reply button
        /// TODO: False detections, needs further improvement and translations
        if (configs.addQuoteButton){
            // const textareas = document.body.querySelectorAll('textarea:not([readonly]):not([aria-readonly]),div[contenteditable]');
            const textareas = document.body.querySelectorAll('textarea:not([readonly]):not([aria-readonly])');
            let textArea, areaRect;
            for (i in textareas){
                const t = textareas[i];
                if (!t || !t.getBoundingClientRect) continue;
                areaRect = t.getBoundingClientRect();
                if (areaRect.height == 0 || areaRect.width == 0) continue;
                // if (rect.height < 50 || rect.width == 0) continue;
                // if (t.rows == 1) continue;
                textArea = t;
                break;
            }
            if (textArea){
                const quoteButton = addBasicTooltipButton(chrome.i18n.getMessage('quote'), quoteIcon, function () {
                    textArea.scrollIntoView({block: "nearest", inline: "nearest", behavior: "smooth"});
                    textArea.focus();

                    let val;
                    // if (textArea.value){
                        /// textarea
                        val = textArea.value;
                        textArea.value = '';
                        textArea.value = val;
                        document.execCommand(
                            'insertText', false, 
                            areaRect.height < 50 || textArea.rows == 1 ? ' ' + selectedText :
                                (val.length == 0 ? '' : '\n\n') + '> ' + selectedText + '\n\n'
                        );
                    // } else {
                    //     /// contenteditable
                    //     textArea.innerHTML += `<blockquote>` + selectedText + '</blockquote>';
                    // }
    
                    setTimeout(()=> textArea.focus(), 50)
                });
            }
        }

        /// Add dictionary button
        if (configs.showDictionaryButton && !containsSpecialSymbols && !contextButtonWasAdded && wordsCount <= configs.dictionaryButtonWordsAmount) {
            addDictionaryButton(selectionLength);
        }

        /// Add marker button
        if (configs.addMarkerButton)
            addMarkerButton();

        /// Add button to copy link to selected text
        if (configs.addButtonToCopyLinkToText) {
            const copyTextLinkBtn = addBasicTooltipButton(chrome.i18n.getMessage('linkToTextLabel'), linkIcon, function () {
                let urlWithText = window.location.href + '#:~:text=' + encodeURIComponent(selectedText);
                copyManuallyToClipboard(urlWithText);
                // removeSelectionOnPage();
            });
            copyTextLinkBtn.title = chrome.i18n.getMessage('linkToTextDescription');
        }

        /// Add button to expand text selection
        if (configs.addExtendSelectionButton){
            const extendSelectionBtn = addBasicTooltipButton(chrome.i18n.getMessage('extendSelection'), extendSelectionIcon, extendSelectionToParentEl);
            extendSelectionBtn.title = chrome.i18n.getMessage('extendSelectionTooltip');
            extendSelectionBtn.id = 'selecton-extend-selection-button';
        }

        /// Collapse exceeding buttons under 'more' hover button
        if (configs.collapseButtons)
            collapseButtons();

        /// Set info panel & title for the Copy button
        setCopyButtonTitle(copyButton, selectionLength, wordsCount);

        callbackOnFinish();
    }
}