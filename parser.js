/// Configs
var animationDuration = 300;
var convertToCurrency = 'USD';
var hideOnScroll;
var preferredMetricsSystem; /// Possible values: 'imperial', 'metric';
var showTranslateButton;
var languageToTranslate;
var convertMetrics = true;
var addOpenLinks = true;
var convertCurrencies = true;
var performSimpleMathOperations = true;

var useCustomStyle = false;
var tooltipBackground = '3B3B3B';
var tooltipOpacity = 1.0;
var addTooltipShadow = false;
var shadowOpacity = 0.5;
var borderRadius = 3;

var changeTextSelectionColor = false;
var textSelectionBackground;
var textSelectionColor;
var shiftTooltipWhenWebsiteHasOwn = true;
var addActionButtonsForTextFields = true;
var removeSelectionOnActionButtonClick = true;
var draggableTooltip = true;
var addButtonIcons = false;

/// Non user-configurable settings 
var ignoreWhenTextFieldFocused = true;
var debugMode = false;
var convertWhenOnlyFewWordsSelected = true;
var loadTooltipOnPageLoad = false;
var secondaryColor = 'lightBlue';
var urlToLoadCurrencyRates = 'https://api.exchangerate.host/latest?base=USD';
var updateRatesEveryDays = 14;
var wordsLimitToProccessText = 3;

var addSelectionTextShadow = false;
var selectionTextShadowOpacity = 0.75;

/// Variables for work
var copyLabel = 'Copy';
var searchLabel = 'Search';
var openLinkLabel = 'Open';
var translateLabel = 'Translate';
var cutLabel = 'Cut';
var pasteLabel = 'Paste';
var ratesLastFetchedDate;
var tooltip;
var arrow;
var selection;
var selectedText;
var dontShowTooltip = false;
var isDraggingTooltip = false;
var firstButtonBorderRadius = `3px 0px 0px 3px`;;
var lastButtonBorderRadius = `0px 3px 3px 0px`;

var browserLanguage;
var browserCurrency;
var browserMetricSystem;


function init() {
  /// Restore user settings
  chrome.storage.local.get(
    [
      'animationDuration',
      'convertToCurrency',
      'hideOnScroll',
      'convertMetrics',
      'addOpenLinks',
      'convertCurrencies',
      'performSimpleMathOperations',
      'preferredMetricsSystem',
      'showTranslateButton',
      'languageToTranslate',
      'ratesLastFetchedDate',

      'useCustomStyle',
      'tooltipBackground',
      'tooltipOpacity',
      'addTooltipShadow',
      'shadowOpacity',
      'borderRadius',

      'changeTextSelectionColor',
      'textSelectionBackground',
      'textSelectionColor',

      'shiftTooltipWhenWebsiteHasOwn',
      'addActionButtonsForTextFields',
      'removeSelectionOnActionButtonClick',
      'draggableTooltip',
      'addButtonIcons',
    ], function (value) {

      if (debugMode) {
        console.log('Loaded SelectionActions settings from memory:');
        console.log(value);
      }

      if (value.preferredMetricsSystem == null || value.preferredMetricsSystem == undefined) {
        setDefaultLocales();
      }

      animationDuration = value.animationDuration || 300;
      convertToCurrency = value.convertToCurrency || browserCurrency || 'USD';
      hideOnScroll = value.hideOnScroll ?? true;
      convertMetrics = value.convertMetrics ?? true;
      addOpenLinks = value.addOpenLinks ?? true;
      convertCurrencies = value.convertCurrencies ?? true;
      performSimpleMathOperations = value.performSimpleMathOperations ?? true;
      preferredMetricsSystem = value.preferredMetricsSystem || browserMetricSystem || 'metric';
      showTranslateButton = value.showTranslateButton ?? true;
      languageToTranslate = value.languageToTranslate || browserLanguage || 'en';
      ratesLastFetchedDate = value.ratesLastFetchedDate;

      useCustomStyle = value.useCustomStyle ?? false;
      tooltipBackground = value.tooltipBackground || '#3B3B3B';
      tooltipOpacity = value.tooltipOpacity || 1.0;
      addTooltipShadow = value.addTooltipShadow ?? false;
      shadowOpacity = value.shadowOpacity || 0.5;
      borderRadius = value.borderRadius || 3;
      shiftTooltipWhenWebsiteHasOwn = value.shiftTooltipWhenWebsiteHasOwn ?? true;
      addActionButtonsForTextFields = value.addActionButtonsForTextFields ?? false;
      removeSelectionOnActionButtonClick = value.removeSelectionOnActionButtonClick ?? true;
      draggableTooltip = value.draggableTooltip ?? true;
      addButtonIcons = value.addButtonIcons ?? false;

      changeTextSelectionColor = value.changeTextSelectionColor ?? false;
      // textSelectionBackground = value.textSelectionBackground || '#808080';
      textSelectionBackground = value.textSelectionBackground || '#338FFF';
      textSelectionColor = value.textSelectionColor || '#ffffff';

      /// Get translated button labels
      copyLabel = chrome.i18n.getMessage("copyLabel");
      searchLabel = chrome.i18n.getMessage("searchLabel");
      openLinkLabel = chrome.i18n.getMessage("openLinkLabel");
      translateLabel = chrome.i18n.getMessage("translateLabel");
      cutLabel = chrome.i18n.getMessage("cutLabel");
      pasteLabel = chrome.i18n.getMessage("pasteLabel");


      /// If initial launch, update currency rates
      if (convertCurrencies) {
        if (ratesLastFetchedDate == null)
          fetchCurrencyRates();
        else loadCurrencyRatesFromMemory();
      }

      if (loadTooltipOnPageLoad)
        createTooltip();


      /// Change text selection color
      if (changeTextSelectionColor) {
        document.body.style.setProperty('--selection-background', textSelectionBackground);
        document.body.style.setProperty('--selection-text-color', textSelectionColor);

        document.body.style.setProperty('--selection-text-shadow', addSelectionTextShadow ? `1.5px 1.5px 2px rgba(0,0,0,${selectionTextShadowOpacity})` : 'none');
      }
      else {
        /// Set the default blue-white colors
        /// Not a great solution, since it will override any website's custom selection colors
        document.body.style.setProperty('--selection-background', '#338FFF');
        document.body.style.setProperty('--selection-text-color', '#ffffff');
      }
      // document.body.style.setProperty('--selection-button-padding', addButtonIcons ? '6px 12px 0px 12px' : '6px 12px');
      document.body.style.setProperty('--selection-button-padding', '6px 12px');


    });
}

init();

function setDefaultLocales() {

  /// Set default currency and language according to browser's locale
  var browserLocale = navigator.language || navigator.userLanguage;
  var browserCountry;

  if (debugMode) {
    console.log('Browser locale is: ' + browserLocale);
    console.log('Configuring default locale settings...');
  }

  if (browserLocale.includes('-')) {
    var parts = browserLocale.split('-');
    browserLanguage = parts[0];
    browserCountry = parts[1];
  } else {
    browserLanguage = browserLocale;
    browserCountry = browserLocale.toUpperCase();
  }

  if (browserCountry !== null && browserCountry !== undefined && browserCountry !== '') {

    /// Set default metric system
    if (browserCountry == 'US')
      browserMetricSystem = 'imperial';
    else browserMetricSystem = 'metric';


    /// Set default currency
    Object.keys(currenciesList).forEach(function (key) {
      var id = currenciesList[key]['id'];
      if (id.includes(browserCountry)) {
        browserCurrency = id;
      }
    });
    if (debugMode) {
      console.log(`Default browser language: ${browserLanguage}`);
      console.log(`Default browser metrics: ${browserMetricSystem}`);
      console.log(`Default browser currency: ${browserCurrency}`);
      console.log('Saved default locales to memory');
    }
  }


  /// Save rates to memory
  chrome.storage.local.set({
    'convertToCurrency': browserCurrency || 'USD',
    'languageToTranslate': browserLanguage || 'en',
    'preferredMetricsSystem': browserMetricSystem || 'metric',
  });

}


document.addEventListener("scroll", function (e) {
  if (hideOnScroll)
    hideTooltip();
});

document.addEventListener("mousedown", function (e) {
  if (isDraggingTooltip) return;
  selection = null;
  removeSelection();

  hideTooltip();
});


document.onkeyup = hideTooltip;

document.addEventListener("mouseup", async function (e) {
  if (isDraggingTooltip) return;

  hideTooltip();

  /// Old text input handling
  /// Don't open tooltip when any textfield is focused
  // if (ignoreWhenTextFieldFocused &&
  //   (
  //     document.activeElement.tagName === "INPUT" ||
  //     document.activeElement.tagName === "TEXTAREA"
  //   )
  // )
  //   return;
  // if (tooltip == null) createTooltip();

  /// Clear previously stored selection value

  if (window.getSelection) {
    selection = window.getSelection();
  } else if (document.selection) {
    selection = document.selection.createRange();
  }

  var selDimensions = getSelectionDimensions();
  selectedText = selection.toString();
  console.log('selectedText:');
  console.log(selectedText);

  /// Experimental handling of text fields
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
    }

    /// Ignore single click on text field with inputted value
    if (document.activeElement.value.trim() !== '' && selectedText == '') return;

    /// Create text field tooltip
    createTooltip('textfield');

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
  createTooltip();
  // console.log(selection.clientWidth);

  if (dontShowTooltip == false && selectedText !== null && selectedText.trim() !== '' && tooltip.style.opacity !== 0.0) {
    // if (selectedText !== null && selectedText !== '' && tooltip.style.opacity !== 0.0) {

    if (debugMode)
      console.log('Creating regular tooltip...');
    var selectedText = selection.toString();
    var wordsCount = selectedText.split(' ').length;

    if (convertWhenOnlyFewWordsSelected == false || wordsCount <= wordsLimitToProccessText) {
      /// Convert units
      var numberToConvert;

      if (convertMetrics)
        outerloop: for (const [key, value] of Object.entries(convertionUnits)) {
          var nonConvertedUnit = preferredMetricsSystem == 'metric' ? key : value['convertsTo'];
          if (selectedText.includes(nonConvertedUnit)) {

            var words = selectedText.split(' ');
            for (i in words) {
              var word = words[i];

              /// Feet/inches ' "" handling
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
                  interactiveButton.textContent = numberToConvert + ' ' + fromUnit + ' →';

                  var converted = document.createElement('span');
                  converted.textContent = ` ${convertedNumber} ${convertedUnit}`;
                  converted.setAttribute('style', `color: ${secondaryColor}`);
                  interactiveButton.appendChild(converted);

                  interactiveButton.addEventListener("mousedown", function (e) {
                    hideTooltip();
                    removeSelection();
                    /// Search for conversion on Google
                    window.open(`https://www.google.com/search?q=${numberToConvert + ' ' + fromUnit} to ${convertedUnit}`, '_blank');
                    ;
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

              if (number !== null) {
                var interactiveButton = document.createElement('button');
                interactiveButton.setAttribute('class', `selection-popup-button button-with-border open-link-button`);
                interactiveButton.textContent = selectedText + ' →';

                var converted = document.createElement('span');
                converted.textContent = ` ${calculatedExpression}`;
                converted.setAttribute('style', `color: ${secondaryColor}`);
                interactiveButton.appendChild(converted);

                interactiveButton.addEventListener("mousedown", function (e) {
                  hideTooltip();
                  removeSelection();
                  /// Do calculation on Google
                  window.open(`https://www.google.com/search?q=${selectedText.replaceAll('+', '%2B')}`, '_blank');
                  ;
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

      /// Convert currencies
      if (convertCurrencies) {
        var currency;
        var amount;
        var currencyRate;

        for (const [key, value] of Object.entries(currenciesList)) {
          if (selectedText.includes(value["id"]) || selectedText.includes(value["currencySymbol"])) {
            // if (selectedText.includes(value["currencySymbol"])) {
            // currency = key;

            currency = value["id"];
            currencyRate = value["rate"];

            amount = selectedText.match(/[+-]?\d+(\.\d)?/g);
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

                var resultingRate = rateOfDesiredCurrency / currencyRate;
                var convertedAmount = amount * resultingRate;

                if (convertedAmount !== null && convertedAmount !== undefined && convertedAmount.toString() !== 'NaN') {
                  console.log(convertedAmount);
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
                  // if (addButtonIcons)
                  //   interactiveButton.innerHTML = createImageIcon(currencyButtonIcon, 0.7) + `${amount + ' ' + currency + ' →'}`;
                  // else
                  interactiveButton.textContent = amount + ' ' + currency + ' →';
                  var converted = document.createElement('span');

                  converted.textContent = ` ${convertedAmountString} ${convertToCurrency}`;
                  converted.setAttribute('style', `color: ${secondaryColor}`);
                  interactiveButton.appendChild(converted);

                  interactiveButton.addEventListener("mouseup", function (e) {
                    hideTooltip();
                    removeSelection();
                    /// Search for conversion on Google
                    window.open(`https://www.google.com/search?q=${amount + ' ' + currency} to ${convertToCurrency}`, '_blank');
                    ;
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

          /// Add 'open link' button for each found link
          if (addOpenLinks)
            // if (tooltip.children.length < 4 && selectedText.includes('.')) {
            if (tooltip.children.length < 4 && (selectedText.includes('.') || selectedText.includes('/'))) {
              var words = selectedText.split(' ');
              for (i in words) {
                var link = words[i];
                // if (link.includes('.')) {
                if (link.includes('.') || link.includes('/')) {
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
                      // linkText.textContent = ' ' + link;

                      var linkToDisplay = link.length > 30 ? link.substring(0, 30) + '...' : link;
                      linkText.textContent = (addButtonIcons ? '' : ' ') + linkToDisplay;
                      linkText.setAttribute('style', `color: ${secondaryColor}`);

                      /// Add tooltip with full website on hover
                      if (link.length > 30)
                        interactiveButton.setAttribute('title', link);

                      if (addButtonIcons)
                        interactiveButton.innerHTML = createImageIcon(openLinkButtonIcon, 0.7);
                      else
                        interactiveButton.innerHTML = openLinkLabel + ' ';

                      interactiveButton.appendChild(linkText);
                      interactiveButton.addEventListener("mousedown", function (e) {
                        hideTooltip();
                        /// Open link

                        if (!link.includes('http://') && !link.includes('https://'))
                          link = 'https://' + link;
                        window.open(`${link}`, '_blank');
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

    /// Show Translate button when enabled, and no other buttons were added 
    if (tooltip.children.length < 4 && showTranslateButton) {
      addTranslateButton();
    }

    /// If tooltip is going to be placed too much on top, make it visible
    var resultingDy = selDimensions.dy - tooltip.clientHeight - arrow.clientHeight + window.scrollY;
    var vertOutOfView = resultingDy <= window.scrollY;
    if (vertOutOfView) resultingDy = resultingDy + (window.scrollY - resultingDy);

    /// Check if resulting tooltip's dx is out of view (doesn't work because of postpone added translate and currency buttons)
    var resultingDx = selDimensions.dx + (selDimensions.width / 2) - (tooltip.clientWidth / 2);

    /// Set border radius for buttons
    tooltip.children[1].style.borderRadius = firstButtonBorderRadius;
    tooltip.children[tooltip.children.length - 1].style.borderRadius = lastButtonBorderRadius;


    /// Show tooltip on top of selection
    showTooltip(resultingDx, resultingDy + (addButtonIcons ? 2.5 : 5));
  }
  else hideTooltip();
});


// function addTooltipButton(label, icon, callback) {
//   var button = document.createElement('button');
//   button.setAttribute('class', `selection-popup-button button-with-border`);
//   if (icon)
//     button.innerHTML = createImageIcon(copyButtonIcon, 0.7) + label;
//   else
//     button.textContent = label;
//   button.addEventListener("mousedown", callback);
//   tooltip.appendChild(button);
// }

/// Service methods

function createTooltip(type) {
  init();

  /// Create tooltip and it's arrow
  tooltip = document.createElement('div');
  tooltip.setAttribute('style', `opacity: 0.0;position: absolute; transition: opacity ${animationDuration}ms ease-in-out !important;`);
  tooltip.setAttribute('class', `selection-tooltip`);

  arrow = document.createElement('div');
  arrow.setAttribute('class', `selection-tooltip-arrow`);
  var arrowChild = document.createElement('div');
  arrowChild.setAttribute('class', 'selection-tooltip-arrow-child');
  arrow.appendChild(arrowChild);

  tooltip.appendChild(arrow);
  document.body.appendChild(tooltip);

  // Make the DIV element draggable:
  // tooltip.addEventListener('onmousemove', function (e) {
  //   console.log('dragging panel...');
  //   console.log(e);
  // });

  if (draggableTooltip) {
    arrowChild.style.cursor = 'move';
    arrowChild.onmousedown = function (e) {
      isDraggingTooltip = true;
      e.preventDefault();
      if (debugMode)
        console.log('Started dragging tooltip...');

      document.onmousemove = function (e) {
        e.preventDefault();

        /// More slow top/left approach
        // tooltip.style.left = `${e.clientX - tooltip.clientWidth / 2}px`;
        // tooltip.style.top = `${e.clientY + window.scrollY - tooltip.clientHeight - arrow.clientHeight}px`;
        tooltip.style.left = `0px`;
        tooltip.style.top = `0px`;
        tooltip.style.transform = `translate(${e.clientX - tooltip.clientWidth / 2}px, ${e.clientY + window.scrollY - tooltip.clientHeight - (arrow.clientHeight / 2)}px )`;


        document.body.style.cursor = 'move';
      };

      document.onmouseup = function (e) {
        e.preventDefault();
        document.onmousemove = null;
        document.onmouseup = null;
        isDraggingTooltip = false;
        document.body.style.cursor = 'unset';

        if (debugMode)
          console.log('Dragging tooltip finished');
      };
    }
  }

  /// Apply custom stylings
  if (useCustomStyle) {
    tooltip.style.borderRadius = `${borderRadius}px`;
    tooltip.style.background = tooltipBackground;
    arrowChild.style.background = tooltipBackground;

    if (addTooltipShadow) {
      tooltip.style.boxShadow = `0 2px 7px rgba(0,0,0,${shadowOpacity})`;
      // arrowChild.style.boxShadow = `6px 5px 9px -9px rgba(0,0,0,${shadowOpacity}),5px 6px 9px -9px rgba(0,0,0,${shadowOpacity})`;
      arrowChild.style.boxShadow = `1px 1px 3px rgba(0,0,0,${shadowOpacity / 1.5})`;
    }
    /// Set rounded corners for buttons
    firstButtonBorderRadius = `${borderRadius - 3}px 0px 0px ${borderRadius - 3}px`;
    lastButtonBorderRadius = `0px ${borderRadius - 3}px ${borderRadius - 3}px 0px`;
  }

  if (type == 'textfield') {
    var textField = document.activeElement;
    if (selection.toString() !== '') {

      try { /// Add a cut button 
        var cutButton = document.createElement('button');
        cutButton.setAttribute('class', `selection-popup-button`);
        if (addButtonIcons)
          cutButton.innerHTML = createImageIcon(cutButtonIcon, 0.7) + cutLabel;
        else
          cutButton.textContent = cutLabel;
        cutButton.setAttribute('style', `border-radius: ${firstButtonBorderRadius}`);
        cutButton.addEventListener("mousedown", function (e) {
          document.execCommand('cut');
          hideTooltip();
          removeSelection();
        });
        tooltip.appendChild(cutButton);

        /// Add copy button 
        var copyButton = document.createElement('button');
        copyButton.setAttribute('class', `selection-popup-button button-with-border`);
        if (addButtonIcons)
          copyButton.innerHTML = createImageIcon(copyButtonIcon, 0.7) + copyLabel;
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
      pasteButton.setAttribute('style', `border-radius: ${borderRadius - 3}px`);
      if (addButtonIcons)
        pasteButton.innerHTML = createImageIcon(pasteButtonIcon, 0.7) + pasteLabel;
      else
        pasteButton.textContent = pasteLabel;
      pasteButton.addEventListener("mousedown", function (e) {
        textField.focus();
        document.execCommand('paste');
        removeSelection();

      });
      tooltip.appendChild(pasteButton);
    }


  } else {
    /// Add search button
    var searchButton = document.createElement('button');
    searchButton.setAttribute('class', `selection-popup-button`);

    if (addButtonIcons)
      searchButton.innerHTML = createImageIcon(searchButtonIcon) + searchLabel;
    else
      searchButton.textContent = searchLabel;

    searchButton.addEventListener("mousedown", function (e) {
      hideTooltip();
      var selectedText = selection.toString();
      removeSelection();
      /// Search text
      window.open(`https://www.google.com/search?q=${selectedText.trim()}`, '_blank');
    });

    tooltip.appendChild(searchButton);

    /// Add copy button 
    var copyButton = document.createElement('button');
    copyButton.setAttribute('class', `selection-popup-button button-with-border`);
    if (addButtonIcons)
      copyButton.innerHTML = createImageIcon(copyButtonIcon, 0.7) + copyLabel;
    else
      copyButton.textContent = copyLabel;
    copyButton.addEventListener("mousedown", function (e) {
      document.execCommand('copy');
      hideTooltip();
      removeSelection();
    });
    tooltip.appendChild(copyButton);
  }


  if (debugMode)
    console.log('SelectionActions tooltip was created');
}

function createImageIcon(url, opacity = 0.5) {
  return `<img src="${url}" style="all: revert; opacity: ${opacity}; filter: invert(100%);    vertical-align: top !important;  transform: translate(0px,-1px);  max-height:18px !important;display: unset !important;  padding-right: 5px;"" />`;
}

function removeSelection() {
  if (removeSelectionOnActionButtonClick) {
    var sel = window.getSelection ? window.getSelection() : document.selection;
    if (sel) {
      if (sel.removeAllRanges) {
        sel.removeAllRanges();
      } else if (sel.empty) {
        sel.empty();
      }
    }
  } else {
    dontShowTooltip = true;
    setTimeout(function () {
      dontShowTooltip = false;
    }, animationDuration);
  }


}

function showTooltip(dx, dy) {
  // dontShowTooltip = true;
  tooltip.style.pointerEvents = 'auto';
  tooltip.style.top = `${dy}px`;
  tooltip.style.left = `${dx}px`;
  tooltip.style.opacity = useCustomStyle ? tooltipOpacity : 1.0;
  if (debugMode)
    console.log('SelectionActions tooltip shown');

  if (shiftTooltipWhenWebsiteHasOwn)
    setTimeout(function () {
      /// Experimental code to determine website's own selection tooltip
      /// Implemented as a fix for Medium.com article view, and all websites that use the same styles tooltip

      // var websiteTooltips = document.querySelectorAll(`[style*='position: absolute']`);
      var websiteTooltips = document.querySelectorAll(`[style*='position: absolute'][style*='transform']`);

      var websiteTooltip;
      if (websiteTooltips !== null && websiteTooltips !== undefined)
        for (i in websiteTooltips) {
          var el = websiteTooltips[i];
          if (el.style !== undefined) {
            var elStyle = el.style.transform.toString();
            if (elStyle !== null && elStyle !== undefined && elStyle.includes('translate3d')) {
              if (debugMode)
                console.log('Detected selection tooltip on the website');
              websiteTooltip = el;
              break;
            }
          }
        };

      if (websiteTooltip !== null && websiteTooltip !== undefined) {
        tooltip.style.top = `${dy - websiteTooltip.clientHeight + 7.5}px`;
        arrow.style.opacity = 0.0;
      } else {
        arrow.style.opacity = 1.0;
      }

    }, 50);
}

function hideTooltip() {
  /// Old approach
  // if (tooltip !== null) {
  //   /// Ignore clicks on tooltip
  //   tooltip.style.pointerEvents = 'none';

  //   /// Remove all added link button
  //   var linkButtons = tooltip.querySelectorAll('.open-link-button');
  //   if (linkButtons !== null)
  //     linkButtons.forEach(function (button) {
  //       button.remove();
  //     })
  // }

  var oldTooltips = document.querySelectorAll('.selection-tooltip');
  if (debugMode) {
    console.log('All found tooltips:');
    console.log(oldTooltips);
  }
  if (oldTooltips !== null)
    oldTooltips.forEach(function (oldTooltip) {
      tooltip.style.opacity = 0.0;

      setTimeout(function () {
        // dontShowTooltip = false;

        // if (oldTooltip !== null) {
        //   /// Ignore clicks on tooltip
        //   oldTooltip.style.pointerEvents = 'none';

        //   /// Remove all added link button
        //   var linkButtons = oldTooltip.querySelectorAll('.open-link-button');
        //   if (linkButtons !== null)
        //     linkButtons.forEach(function (button) {
        //       button.remove();
        //     })
        // }

        oldTooltip.parentNode.removeChild(oldTooltip);
        // oldTooltip = null;

        if (debugMode)
          console.log('SelectionActions tooltip hidden');

      }, animationDuration);
    })

}

function fetchCurrencyRates() {
  fetch(urlToLoadCurrencyRates).then(function (val) {
    return val.json();
  }).then(function (jsonObj) {
    var date = jsonObj['date'];
    var val = jsonObj['rates'];
    var ratesObject = {};

    Object.keys(currenciesList).forEach(function (key) {
      currenciesList[key]['rate'] = val[currenciesList[key]['id']];
      ratesObject[key] = val[currenciesList[key]['id']];
    });

    /// Save rates to memory
    chrome.storage.local.set({
      'ratesLastFetchedDate': date,
      'rates': ratesObject
    });

    if (debugMode)
      console.log('Updated currency rates for SelectionActions');
  });
}

function loadCurrencyRatesFromMemory() {
  chrome.storage.local.get('rates', function (val) {
    var loadedRates = val['rates'];

    Object.keys(currenciesList).forEach(function (key) {
      var id = currenciesList[key]['id'];
      var rate = loadedRates[id];
      if (rate !== null && rate !== undefined)
        currenciesList[key]['rate'] = rate;
    });

    if (debugMode)
      console.log('SelectionActions currency rates were successfully loaded from memory');
  });
}

function addTranslateButton() {
  if (debugMode)
    console.log('Checking if its needed to add Translate button...');

  var selectedText = selection.toString();

  // fetch(`https://translation.googleapis.com/language/translate/v2/detect`, {
  //   method: 'POST',
  //   body: {
  //     'q': selectedText
  //   }
  // }).then(function (res) {
  //   console.log('server response');
  //   console.log(res);
  // })

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

        if (debugMode)
          console.log(`Detection is reliable: ${detectedLanguages.isReliable}`);

        if (langs !== []) {
          langs.forEach(function (lang) {
            if (debugMode) {
              console.log('Detected language:');
              console.log(langs[0]);
            }
            /// Don't show translate button if selected language is the same as desired
            if (lang.language == languageToTranslate) shouldTranslate = false;
          })
        }
      }

      if (debugMode)
        console.log(`Should translate: ${shouldTranslate}`);

      if (shouldTranslate == true) {
        var translateButton = document.createElement('button');
        translateButton.setAttribute('class', `selection-popup-button button-with-border open-link-button`);
        if (addButtonIcons)
          translateButton.innerHTML = createImageIcon(translateButtonIcon, 0.75) + translateLabel;
        else
          translateButton.textContent = translateLabel;
        translateButton.addEventListener("mouseup", function (e) {
          hideTooltip();

          // var selectedText = selection.toString();
          removeSelection();

          /// Open google translator
          window.open(`https://translate.google.com/?sl=auto&tl=${languageToTranslate}&text=${selectedText.trim()}`, '_blank');
        });
        tooltip.appendChild(translateButton);
        /// Correct tooltip's dx
        tooltip.style.left = `${(parseFloat(tooltip.style.left.replaceAll('px', ''), 10) - (translateButton.clientWidth / 2))}px`;

        /// Correct last button's border radius
        tooltip.children[tooltip.children.length - 2].style.borderRadius = '0px';
        tooltip.children[tooltip.children.length - 1].style.borderRadius = lastButtonBorderRadius;
      }
    });
  } catch (e) {
    if (debugMode)
      console.log(e);
  }
}

function calculateString(fn) {
  return new Function('return ' + fn)();
}

function getSelectionDimensions() {
  var sel = document.selection, range;
  var width = 0, height = 0;
  var dx = 0, dy = 0;
  if (sel) {
    if (sel.type != "Control") {
      range = sel.createRange();
      var rect = range.getBoundingClientRect();
      width = range.boundingWidth;
      height = range.boundingHeight;
      dx = rect.left;
      dy = rect.top;
    }
  } else if (window.getSelection) {
    sel = window.getSelection();
    if (sel.rangeCount) {
      range = sel.getRangeAt(0).cloneRange();
      if (range.getBoundingClientRect) {
        var rect = range.getBoundingClientRect();
        width = rect.right - rect.left;
        height = rect.bottom - rect.top;
        dx = rect.left;
        dy = rect.top;
      }
    }
  }
  return { width: width, height: height, dx: dx, dy: dy };
}



/// Big variables

// var translateButtonIcon = 'https://icons-for-free.com/iconfiles/png/512/brands+google+logo+logos+translate+icon-1320184730729535400.png';
var translateButtonIcon = 'https://cdn0.iconfinder.com/data/icons/web-apps/128/11-512.png';
var searchButtonIcon = 'https://cdn2.iconfinder.com/data/icons/font-awesome/1792/search-512.png';
var copyButtonIcon = 'https://image.flaticon.com/icons/png/512/88/88026.png';
var cutButtonIcon = 'https://cdn2.iconfinder.com/data/icons/mosaicon-11/512/cut-512.png';
var pasteButtonIcon = 'https://icons-for-free.com/iconfiles/png/512/content+paste+48px-131985189900342274.png';
var openLinkButtonIcon = 'https://nbtas.no/wp-content/themes/nbt/assets/icons/iu.png';
var currencyButtonIcon = 'https://img2.freepng.ru/20180406/izq/kisspng-currency-exchange-rate-foreign-exchange-market-uni-rate-5ac76a4c1cd464.6574766915230183161181.jpg';


const convertionUnits = {
  "inch": {
    "convertsTo": "cm",
    "ratio": 2.54,
    "type": "imperial"
  },
  "feet": {
    "convertsTo": "meters",
    "ratio": 0.3048,
    "type": "imperial"
  },
  " ft": {
    "convertsTo": "meter",
    "ratio": 0.3048,
    "type": "imperial"
  },
  "foot": {
    "convertsTo": "meter",
    "ratio": 0.3048,
    "type": "imperial"
  },
  "lb": {
    "convertsTo": "kg",
    "ratio": 0.453592,
  },
  "pound": {
    "convertsTo": "kilogram",
    "ratio": 0.453592,
  },
  "mph": {
    "convertsTo": "km/h",
    "ratio": 1.60934,
  },
  "miles": {
    "convertsTo": "km",
    "ratio": 1.60934,
  },
  "mile": {
    "convertsTo": "km",
    "ratio": 1.60934,
  },
  "yard": {
    "convertsTo": "m",
    "ratio": 0.9144,
  },
  " oz": {
    "convertsTo": "gr",
    "ratio": 28.3495,
  },
  "°F": {
    "convertsTo": "°C",
    "convertFunction": function (value) {
      if (preferredMetricsSystem == 'metric')
        return (value - 32) * (5 / 9);
      return (value * 9 / 5) + 32;
    },
  },
  "°K": {
    "convertsTo": "°C",
    "ratio": -272.15,
  },

  /// Russian variants
  " миль": {
    "convertsTo": "км",
    "ratio": 1.60934,
  },
  " ярдов": {
    "convertsTo": "метров",
    "ratio": 0.9144,
  },
  "футов": {
    "convertsTo": "метров",
    "ratio": 0.3048,
  },
  " фута": {
    "convertsTo": "метров",
    "ratio": 0.3048,
  },
  "дюймов": {
    "convertsTo": "см",
    "ratio": 2.54,
  },
  "дюйма": {
    "convertsTo": "см",
    "ratio": 2.54,
  },
  "фунтов": {
    "convertsTo": "кг",
    "ratio": 0.453592,
  },
  " унций": {
    "convertsTo": "грамм",
    "ratio": 28.3495,
  },
  " унции": {
    "convertsTo": "грамм",
    "ratio": 28.3495,
  },
};


/// List of currencies with various literal labels on English and russians
var currenciesList = {
  "ANG": { currencyName: "Netherlands Antillean Gulden", currencySymbol: "ƒ", id: "ANG", rate: 1.79495 },
  "AUD": { currencyName: "Australian Dollar", currencySymbol: "A$", id: "AUD", rate: 0.78 },
  "BGN": { currencyName: "Bulgarian Lev", currencySymbol: "лв", id: "BGN", rate: 1.617811 },
  "BRL": { currencyName: "Brazilian real", currencySymbol: "R$", id: "BRL", rate: 0.18 },
  "BTC": { currencyName: "Bitcoin", currencySymbol: "BTC", id: "BTC", rate: 0.00002 },
  "BTC1": { currencyName: "Bitcoin", currencySymbol: "bitcoins", id: "BTC", rate: 0.00002 },
  "AUD": { currencyName: "Canadian Dollar", currencySymbol: "C$", id: "AUD", rate: 0.79 },
  "CHF": { currencyName: "Swiss Franc", currencySymbol: "CHF", id: "CHF", rate: 1.11 },
  "CNY": { currencyName: "Chinese Yuan", currencySymbol: "¥", id: "CNY", rate: 6.458503 },
  "CNY1": { currencyName: "Chinese Yuan", currencySymbol: "yuan", id: "CNY", rate: 6.458503 },
  "CNY3": { currencyName: "Chinese Yuan", currencySymbol: "юаней", id: "CNY", rate: 6.458503 },
  "CRC": { currencyName: "Costa Rican Colon", currencySymbol: "₡", id: "CRC", rate: 609.471406 },
  "CZK": { currencyName: "Czech Koruna", currencySymbol: "Kč", id: "CZK", rate: 21.377709 },
  "DKK": { currencyName: "Danish Krone", currencySymbol: "kr", id: "DKK", rate: 6.149902 },
  "EUR": { currencyName: "Euro", currencySymbol: "€", id: "EUR", rate: 0.827006 },
  "EUR1": { currencyName: "Euro", currencySymbol: "euro", id: "EUR", rate: 0.827006 },
  "EUR3": { currencyName: "Euro", currencySymbol: "евро", id: "EUR", rate: 0.827006 },
  "GBP": { currencyName: "British Pound", currencySymbol: "£", id: "GBP", rate: 0.719877 },
  "HKD": { currencyName: "Hong Kong dollar", currencySymbol: "HK$", id: "HKD", rate: 0.13 },
  "ILS": { currencyName: "Israeli New Sheqel", currencySymbol: "₪", id: "ILS", rate: 3.239771 },
  "INR": { currencyName: "Indian Rupee", currencySymbol: "₹", id: "INR", rate: 72.87103 },
  "INR1": { currencyName: "Indian Rupee", currencySymbol: "rupees", id: "INR", rate: 72.87103 },
  "IRR": { currencyName: "Iranian Rial", currencySymbol: "﷼", id: "IRR", rate: 42105.017329 },
  "JPY": { currencyName: "Japanese Yen", currencySymbol: "¥", id: "JPY", rate: 105.857044 },
  "JPY1": { currencyName: "Japanese Yen", currencySymbol: "yen", id: "JPY", rate: 105.857044 },
  "JPY2": { currencyName: "Japanese Yen", currencySymbol: "йен", id: "JPY", rate: 105.857044 },
  "KPW": { currencyName: "North Korean Won", currencySymbol: "₩", id: "KPW", rate: 900.00037 },
  "KZT": { currencyName: "Kazakhstani Tenge", currencySymbol: "лв", id: "KZT", rate: 419.32476 },
  "KZT1": { currencyName: "Kazakhstani Tenge", currencySymbol: "тенге", id: "KZT", rate: 419.32476 },
  "MNT": { currencyName: "Mongolian Tugrik", currencySymbol: "₮", id: "MNT", rate: 2854.959219 },
  "MXN": { currencyName: "Mexican Peso", currencySymbol: "peso", id: "MXN", rate: 0.050 },
  "NGN": { currencyName: "Nigerian Naira", currencySymbol: "₦", id: "NGN", rate: 380.000156 },
  "PLN": { currencyName: "Polish złoty", currencySymbol: "zł", id: "PLN", rate: 0.27 },
  "RUB": { currencyName: "Russian Ruble", currencySymbol: "₽", id: "RUB", rate: 73.68413 },
  "RUB1": { currencyName: "Russian Ruble", currencySymbol: "rubles", id: "RUB", rate: 73.68413 },
  "RUB2": { currencyName: "Russian Ruble", currencySymbol: "рублей", id: "RUB", rate: 73.68413 },
  "SAR": { currencyName: "Saudi Riyal", currencySymbol: "﷼", id: "SAR", rate: 3.750694 },
  "SEK": { currencyName: "Swedish Krona", currencySymbol: " kr", id: "SEK", rate: 0.12 },
  "TRY": { currencyName: "Turkish Lira", currencySymbol: "₺", id: "TRY", rate: 0.14 },
  "UAH": { currencyName: "Ukrainian Hryvnia", currencySymbol: "₴", id: "UAH", rate: 27.852288 },
  "UAH2": { currencyName: "Ukrainian Hryvnia", currencySymbol: "гривен", id: "UAH", rate: 27.852288 },
  "USD": { currencyName: "United States Dollar", currencySymbol: "$", id: "USD", rate: 1 },
  "USD1": { currencyName: "United States Dollar", currencySymbol: "dollar", id: "USD", rate: 1 },
  "USD3": { currencyName: "United States Dollar", currencySymbol: "доллар", id: "USD", rate: 1 },
  "VND": { currencyName: "Vietnamese Dong", currencySymbol: "₫", id: "VND", rate: 23155.531116 },
}


/// Deprecated currency fetch methods from CurrConv

// convertCurrency(amount, currency, convertToCurrency, function (err, convertedAmount) {
//   console.log('fetched currency rates from currconv server');
//   if (convertedAmount !== 'NaN' && convertedAmount !== undefined) {

//     /// Separate resulting numbers in groups of 3 digits
//     var convertedAmountString = convertedAmount.toString();
//     var parts = convertedAmountString.split('.');
//     parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, " ");
//     convertedAmountString = parts.join('.');

//     /// Create and add button with result
//     var interactiveButton = document.createElement('button');
//     interactiveButton.setAttribute('class', `selection-popup-button button-with-border open-link-button`);
//     interactiveButton.textContent = amount + ' ' + currency + ' →';
//     var converted = document.createElement('span');
//     converted.textContent = ` ${convertedAmountString} ${convertToCurrency}`;
//     converted.setAttribute('style', `color: ${secondaryColor}`);
//     interactiveButton.appendChild(converted);

//     interactiveButton.addEventListener("mouseup", function (e) {
//       hideTooltip();
//       /// Search for conversion on Google
//       window.open(`https://www.google.com/search?q=${amount + ' ' + currency} to ${convertToCurrency}`, '_blank');
//       ;
//     });

//     tooltip.appendChild(interactiveButton);
//     /// Correct tooltip's dx
//     tooltip.style.left = `${(parseFloat(tooltip.style.left.replaceAll('px', ''), 10) - (interactiveButton.clientWidth / 2))}px`;

//     /// Correct last button's border radius
//     tooltip.children[tooltip.children.length - 2].style.borderRadius = '0px';
//     tooltip.children[tooltip.children.length - 1].style.borderRadius = lastButtonBorderRadius;
//   }
// });

// async function convertCurrency(amount, fromCurrency, toCurrency, cb) {
//   fromCurrency = encodeURIComponent(fromCurrency);
//   toCurrency = encodeURIComponent(toCurrency);
//   var query = fromCurrency + '_' + toCurrency;

//   var url = 'https://free.currconv.com/api/v7/convert?q='
//     + query + '&compact=ultra&apiKey=' + currencyConversionApiKey;

//   console.log(url);

//   try {
//     const apiCall = await fetch(
//       url
//     );
//     const jsonObj = await apiCall.json();

//     var val = jsonObj[query];
//     if (val) {
//       var total = val * amount;
//       cb(null, Math.round(total * 100) / 100);
//     } else {
//       var err = new Error("Value not found for " + query);
//       console.log(err);
//       // cb(err);
//     }
//   } catch (e) {
//     console.log("Currency conversion error: ", e);
//     if (e instanceof NetworkError) {
//       console.log(e.message);
//       console.log(e.getMessage);
//     }
//   }
// }
