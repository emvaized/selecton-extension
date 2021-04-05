/// TODOs:
/// 1. Refactor the code for creating new buttons for main tooltip, so that it will not be duplicated everywhere but has one consistent method 
/// 2. Split index.js in multiple files - especially big image variables on the bottom
/// 3. Refactor tooltip creation proccess, so that it will be shown in the browser, and not appended to the website's DOM (if it's possible)
/// 4. Ability to open link in a background tab on middle click (for search buttons, translate, convertion result buttons etc.)


/// Configs
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
var enabled = true;
var preferredSearchEngine = 'google'; /// Possible values listed in 'returnSearchUrl' method
var hideOnKeypress = true;
var showOnMapButtonEnabled = true;
var showEmailButton = true;
var preferredNewEmailMethod = 'mailto'; /// Possible values listed in 'returnEmailUrl' method
var customSearchUrl;
var preferredMapsService = 'google'; /// Possible values listed in 'returnOpenMapsUrl' method
var addColorPreviewButton = true;
var secondaryTooltipEnabled = true;
var secondaryTooltipIconSize = 15;
var showSecondaryTooltipTitleOnHover = false;
var addPhoneButton = true;
var excludedDomains = '';
var showUnconvertedValue = true;
var addScaleUpEffect = true;
var customSearchButtons = [
  {
    'url': 'https://www.youtube.com/results?search_query=%s',
    'title': 'YouTube',
    'enabled': true
  },
  {
    'url': 'https://open.spotify.com/search/%s',
    'title': 'Spotify',
    'enabled': true
  },
  {
    'url': 'https://aliexpress.com/wholesale?SearchText=%s',
    'title': 'Aliexpress',
    'enabled': true
  },
  {
    'url': 'https://www.amazon.com/s?k=%s',
    'title': 'Amazon',
    'enabled': true
  },
  {
    'url': 'https://wikipedia.org/wiki/SpecialSearch?search=%s',
    'title': 'Wikipedia',
    'enabled': false
  },
  {
    'url': 'https://www.imdb.com/find?s=alt&q=%s',
    'title': 'IMDB',
    'enabled': false
  },
];

/// Currently non user-configurable settings 
var debugMode = true;
var updateRatesEveryDays = 14;
var wordsLimitToProccessText = 5;
var secondaryColor = 'lightBlue';
var ignoreWhenTextFieldFocused = true;
var convertWhenOnlyFewWordsSelected = true;
var loadTooltipOnPageLoad = false;
var urlToLoadCurrencyRates = 'https://api.exchangerate.host/latest?base=USD';
var addSelectionTextShadow = false;
var selectionTextShadowOpacity = 0.75;
var animationDuration = 300;
var allowWebsitesOverrideSelectionColor = true;

/// Service variables
var copyLabel = 'Copy';
var searchLabel = 'Search';
var openLinkLabel = 'Open';
var translateLabel = 'Translate';
var showOnMapLabel = 'Translate';
var cutLabel = 'Cut';
var pasteLabel = 'Paste';
var ratesLastFetchedDate;
var tooltip;
var secondaryTooltip;
var arrow;
var selection;
var selectedText;
var dontShowTooltip = false;
var isDraggingTooltip = false;
var firstButtonBorderRadius = `3px 0px 0px 3px`;
var lastButtonBorderRadius = `0px 3px 3px 0px`;
var isDarkBackground = true;
var linkSymbolsToShow = 20;
var searchButton;
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
      'enabled',
      'preferredSearchEngine',
      'hideOnKeypress',
      'showOnMapButtonEnabled',
      'showEmailButton',
      'preferredNewEmailMethod',
      'customSearchUrl',
      'preferredMapsService',
      'addColorPreviewButton',
      'customSearchButtons',
      'secondaryTooltipEnabled',
      'secondaryTooltipIconSize',
      'showSecondaryTooltipTitleOnHover',
      'excludedDomains',
      'addPhoneButton',
      'showUnconvertedValue',
      'addScaleUpEffect',
    ], function (value) {

      changeTextSelectionColor = value.changeTextSelectionColor ?? false;
      textSelectionBackground = value.textSelectionBackground || '#338FFF';
      textSelectionColor = value.textSelectionColor || '#ffffff';

      enabled = value.enabled ?? true;

      /// Check for domain to be in black list
      excludedDomains = value.excludedDomains || '';
      var domainIsBlacklisted = false;

      if (excludedDomains !== null && excludedDomains !== undefined && excludedDomains !== '')
        excludedDomains.split(',').forEach(function (domain) {
          if (window.location.href.includes(domain.trim())) {
            domainIsBlacklisted = true;
          }
        });

      /// Change text selection color
      if (changeTextSelectionColor && enabled && domainIsBlacklisted == false) {
        // document.body.style.setProperty('--selection-background', textSelectionBackground + (allowWebsitesOverrideSelectionColor ? ' !important' : ''));
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
      document.body.style.setProperty('--selection-button-padding', '6px 12px');

      if (enabled && domainIsBlacklisted == false) {
        if (debugMode) {
          console.log('Loaded Selecton settings from memory:');
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
        hideOnKeypress = value.hideOnKeypress ?? true;
        addButtonIcons = value.addButtonIcons ?? false;
        preferredSearchEngine = value.preferredSearchEngine || 'google';
        showOnMapButtonEnabled = value.showOnMapButtonEnabled ?? true;
        showEmailButton = value.showEmailButton ?? true;
        preferredNewEmailMethod = value.preferredNewEmailMethod ?? 'mailto';
        customSearchUrl = value.customSearchUrl || '';
        preferredMapsService = value.preferredMapsService || 'google';
        addColorPreviewButton = value.addColorPreviewButton ?? true;
        customSearchButtons = value.customSearchButtons ?? customSearchButtons;
        secondaryTooltipEnabled = value.secondaryTooltipEnabled ?? true;
        secondaryTooltipIconSize = value.secondaryTooltipIconSize || 15;
        showSecondaryTooltipTitleOnHover = value.showSecondaryTooltipTitleOnHover ?? false;
        addPhoneButton = value.addPhoneButton ?? true;
        showUnconvertedValue = value.showUnconvertedValue ?? true;
        addScaleUpEffect = value.addScaleUpEffect ?? true;

        /// Get translated button labels
        copyLabel = chrome.i18n.getMessage("copyLabel");
        searchLabel = chrome.i18n.getMessage("searchLabel");
        openLinkLabel = chrome.i18n.getMessage("openLinkLabel");
        translateLabel = chrome.i18n.getMessage("translateLabel");
        showOnMapLabel = chrome.i18n.getMessage("showOnMap");
        cutLabel = chrome.i18n.getMessage("cutLabel");
        pasteLabel = chrome.i18n.getMessage("pasteLabel");

        /// Set dynamic color for foreground
        document.body.style.setProperty('--selection-button-foreground', useCustomStyle == false ? '#ffffff' : getTextColor(tooltipBackground.toLowerCase()));
        document.body.style.setProperty('--selection-button-background-hover', useCustomStyle == false || isDarkBackground ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.5)');
        secondaryColor = useCustomStyle == false || isDarkBackground ? 'lightBlue' : 'dodgerBlue';

        /// If initial launch, update currency rates
        if (convertCurrencies) {
          if (ratesLastFetchedDate == (null || undefined))
            fetchCurrencyRates();
          else loadCurrencyRatesFromMemory();
        }

        if (loadTooltipOnPageLoad)
          createTooltip();

        setPageListeners();
      }
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

function setPageListeners() {

  document.addEventListener("scroll", function (e) {
    if (hideOnScroll)
      hideTooltip();
  });

  document.addEventListener("mousedown", function (e) {
    evt = e || window.event;
    if ("buttons" in evt) {
      if (evt.buttons == 1) {
        if (isDraggingTooltip) return;
        selection = null;
        hideTooltip();
      }
    }
  });

  /// Hide tooltip when any key is pressed
  if (hideOnKeypress)
    document.onkeydown = hideTooltip;

  document.addEventListener("mouseup", async function (e) {

    if (isDraggingTooltip) return;

    if (dontShowTooltip !== true)
      setTimeout(
        function () {
          if ("buttons" in evt) {
            if (evt.buttons == 1) {

              hideTooltip();

              /// Clear previously stored selection value
              if (window.getSelection) {
                selection = window.getSelection();
              } else if (document.selection) {
                selection = document.selection.createRange();
              }

              var selDimensions = getSelectionDimensions();
              selectedText = selection.toString().trim();

              /// Special handling for non UTF-8 ecoded websites
              // if (selectedText.includes('�')) {
              selectedText = encodeURI(selectedText);
              selectedText = decodeURI(selectedText);
              // }

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

              if (dontShowTooltip == false && selectedText !== null && selectedText.trim() !== '' && tooltip.style.opacity !== 0.0) {
                if (debugMode)
                  console.log('Creating regular tooltip...');
                var selectedText = selection.toString().trim();
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
                              if (showUnconvertedValue)
                                interactiveButton.textContent = numberToConvert + ' ' + fromUnit + ' →';

                              var converted = document.createElement('span');
                              converted.textContent = ` ${convertedNumber} ${convertedUnit}`;
                              converted.setAttribute('style', `color: ${secondaryColor}`);
                              interactiveButton.appendChild(converted);

                              interactiveButton.addEventListener("mousedown", function (e) {
                                hideTooltip();
                                removeSelection();
                                /// Search for conversion on Google
                                // window.open(`https://www.google.com/search?q=${numberToConvert + ' ' + fromUnit} to ${convertedUnit}`, '_blank');
                                window.open(returnSearchUrl(`${numberToConvert + ' ' + fromUnit} to ${convertedUnit}`), '_blank');
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


                  /// Phone number button
                  if (addPhoneButton && selectedText.includes('+') && !selectedText.trim().includes(' ') && selectedText.trim().length == 13 && selectedText[0] == '+') {
                    var phoneButton = document.createElement('button');
                    phoneButton.setAttribute('class', `selection-popup-button button-with-border`);
                    // phoneButton.textContent = selectedText;
                    phoneButton.innerHTML = createImageIcon(phoneIcon, 0.7) + selectedText;
                    phoneButton.addEventListener("mouseup", function (e) {
                      hideTooltip();
                      removeSelection();

                      /// Send email
                      window.open(`tel:${selectedText.trim()}`);
                    });
                    tooltip.appendChild(phoneButton);

                  } else
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
                              if (showUnconvertedValue)
                                interactiveButton.textContent = selectedText + ' →';

                              var converted = document.createElement('span');
                              converted.textContent = ` ${calculatedExpression}`;
                              converted.setAttribute('style', `color: ${secondaryColor}`);
                              interactiveButton.appendChild(converted);

                              interactiveButton.addEventListener("mousedown", function (e) {
                                hideTooltip();
                                removeSelection();
                                /// Do calculation on Google
                                // window.open(`https://www.google.com/search?q=${selectedText.replaceAll('+', '%2B')}`, '_blank');
                                window.open(returnSearchUrl(selectedText.replaceAll('+', '%2B')), '_blank');
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

                  /// Add open on map button
                  if (showOnMapButtonEnabled) {
                    var containsAddress = false;

                    addressMarkers.forEach(function (address) {
                      if (selectedText.toLowerCase().includes(address))
                        containsAddress = true;
                    });

                    if (containsAddress) {
                      var mapButton = document.createElement('button');
                      mapButton.setAttribute('class', `selection-popup-button button-with-border`);
                      if (addButtonIcons)
                        mapButton.innerHTML = createImageIcon(mapButtonIcon, 1.0) + showOnMapLabel;
                      else
                        mapButton.textContent = showOnMapLabel;
                      mapButton.addEventListener("mouseup", function (e) {
                        hideTooltip();

                        // var selectedText = selection.toString();
                        removeSelection();

                        /// Open google maps
                        // window.open(`https://www.google.com/maps/place/${selectedText.trim()}`, '_blank');
                        window.open(returnShowOnMapUrl(selectedText.trim()), '_blank');
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
                      emailButton.innerHTML = createImageIcon(emailButtonIcon, 0.65) + (emailText.length > linkSymbolsToShow ? emailText.substring(0, linkSymbolsToShow) + '...' : emailText);
                      // else
                      //   emailButton.textContent = emailText.length > linkSymbolsToShow ? emailText.substring(0, linkSymbolsToShow) + '...' : emailText;
                      emailButton.addEventListener("mouseup", function (e) {
                        hideTooltip();
                        removeSelection();

                        /// Send email
                        window.open(returnNewEmailUrl(emailText), '_blank');
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

                      colorButton.addEventListener("mouseup", function (e) {
                        hideTooltip();
                        removeSelection();

                        /// Send email
                        window.open(returnSearchUrl(colorText.replaceAll('#', '%23')), '_blank');
                      });

                      /// Hover listeners for 'copy' on click action
                      // var buttonContent = colorButton.innerHTML;
                      // colorButton.style.transition = 'all 300ms ease-in-out';
                      // colorButton.style.minWidth = `${colorButton.clientWidth}px`;
                      // colorButton.addEventListener("mouseover", function (e) {
                      //   colorButton.innerHTML = chrome.i18n.getMessage("copyLabel");
                      // });

                      // colorButton.addEventListener("mouseout", function (e) {
                      //   colorButton.innerHTML = buttonContent;
                      // });

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

                  /// Convert currencies
                  if (convertCurrencies) {
                    var currency;
                    var amount;
                    var currencyRate;

                    for (const [key, value] of Object.entries(currenciesList)) {
                      // if (selectedText.includes(value["id"]) || selectedText.includes(value["currencySymbol"])) {
                      if (selectedText.includes(value["id"]) || selectedText.toLowerCase().includes(value["currencySymbol"]) || selectedText.includes(value["currencySymbol"])) {

                        currency = value["id"];
                        currencyRate = value["rate"];

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
                            console.log(`Rate is: ${rateOfDesiredCurrency}`);

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

                              if (showUnconvertedValue)
                                interactiveButton.textContent = amount + ' ' + currency + ' →';
                              var converted = document.createElement('span');

                              converted.textContent = ` ${convertedAmountString} ${convertToCurrency}`;
                              converted.setAttribute('style', `color: ${secondaryColor}`);
                              interactiveButton.appendChild(converted);

                              interactiveButton.addEventListener("mouseup", function (e) {
                                hideTooltip();
                                removeSelection();
                                /// Search for conversion result
                                window.open(returnSearchUrl(`${amount + ' ' + currency} to ${convertToCurrency}`), '_blank');
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
                                  // linkText.textContent = ' ' + link;

                                  var linkToDisplay = link.length > linkSymbolsToShow ? link.substring(0, linkSymbolsToShow) + '...' : link;
                                  linkText.textContent = (addButtonIcons ? '' : ' ') + linkToDisplay;
                                  linkText.setAttribute('style', `color: ${secondaryColor}`);

                                  /// Add tooltip with full website on hover
                                  if (link.length > linkSymbolsToShow)
                                    interactiveButton.setAttribute('title', link);

                                  if (addButtonIcons)
                                    interactiveButton.innerHTML = createImageIcon(openLinkButtonIcon, 0.65);
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
                // if (tooltip.children.length < 4 && showTranslateButton && document.getElementById('selecton-translate-button') == null) {
                // if (tooltip.children.length < 4 && showTranslateButton && (document.getElementById('selecton-translate-button') == null || document.getElementById('selecton-translate-button') == undefined)) {
                if (tooltip.children.length < 4 && showTranslateButton) {
                  addTranslateButton();
                } else {
                  setTimeout(function () {
                    checkTooltipForBeingOffScreen();
                  }, 1);
                }

                /// Set border radius for buttons
                tooltip.children[1].style.borderRadius = firstButtonBorderRadius;
                tooltip.children[tooltip.children.length - 1].style.borderRadius = lastButtonBorderRadius;

                /// If tooltip is going off-screen on top, make it visible by manuallyplacing on top of screen
                var resultingDy = selDimensions.dy - tooltip.clientHeight - arrow.clientHeight + window.scrollY;
                var vertOutOfView = resultingDy <= window.scrollY;
                if (vertOutOfView) resultingDy = resultingDy + (window.scrollY - resultingDy);

                var resultingDx = selDimensions.dx + (selDimensions.width / 2) - (tooltip.clientWidth / 2);

                /// Show tooltip on top of selection
                // showTooltip(resultingDx, resultingDy + 2.7);
                showTooltip(resultingDx, resultingDy + 4);
              }
              else hideTooltip();
            }
          }
        }, 1
      );
  });
}


/// Service methods

function createTooltip(type) {
  // init();

  /// Create tooltip and it's arrow
  tooltip = document.createElement('div');
  tooltip.setAttribute('style', `opacity: 0.0;position: absolute; transition: opacity ${animationDuration}ms ease-in-out, transform 200ms ease-out; ${addScaleUpEffect ? `transform: scale(0.0);transform-origin: bottom;` : ''}`);
  tooltip.setAttribute('class', `selection-tooltip`);

  tooltip.onmouseover = function (event) {
    this.style.opacity = 1.0;
  }
  tooltip.onmouseout = function () {
    this.style.opacity = tooltipOpacity;
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
          copyButton.innerHTML = createImageIcon(copyButtonIcon, 0.8) + copyLabel;
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
    searchButton = document.createElement('button');
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
      window.open(returnSearchUrl(selectedText.trim()), '_blank');

      /// TODO:
      /// Attempt to implement 'open background tab on middle click'
      // var evt = e || window.event;
      // if ("buttons" in evt) {
      //   if (evt.buttons == 1) {
      //     console.log('leftt click!');
      //     window.open(returnSearchUrl(selectedText.trim()), '_blank');
      //   } else if (evt.buttons == 2) {
      //     console.log('middle click!');
      //     try {
      //       evt.preventDefault();
      //       // window.open(returnSearchUrl(selectedText.trim()), '_blank');
      //       // window.focus();
      //       browser.tabs.create({ url: returnSearchUrl(selectedText.trim()), active: false }, tab => {
      //         setTimeout(function () {
      //           chrome.tabs.remove(tab.id);
      //         }, 1000);
      //       });
      //     } catch (e) { console.log(e); }
      //   }
      // }

    });

    tooltip.appendChild(searchButton);


    /// Add copy button 
    var copyButton = document.createElement('button');
    copyButton.setAttribute('class', `selection-popup-button button-with-border`);
    if (addButtonIcons)
      copyButton.innerHTML = createImageIcon(copyButtonIcon, 0.8) + copyLabel;
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
    console.log('Selecton tooltip was created');
}

function createImageIcon(url, opacity = 0.5) {
  return `<img src="${url}" style="all: revert; opacity: ${opacity}; filter: invert(${isDarkBackground ? '100' : '0'}%);vertical-align: top !important;  max-height:16px !important;display: unset !important;  padding-right: 5px;"" />`;
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
  }

  dontShowTooltip = true;
  setTimeout(function () {
    dontShowTooltip = false;
  }, animationDuration);
}

function showTooltip(dx, dy) {
  // dontShowTooltip = true;
  tooltip.style.pointerEvents = 'auto';
  tooltip.style.top = `${dy}px`;
  tooltip.style.left = `${dx}px`;
  tooltip.style.opacity = useCustomStyle ? tooltipOpacity : 1.0;

  if (addScaleUpEffect)
    tooltip.style.transform = 'scale(1.0)';

  if (debugMode)
    console.log('Selecton tooltip shown');

  if (shiftTooltipWhenWebsiteHasOwn)
    setTimeout(function () {
      /// Experimental code to determine website's own selection tooltip
      var websiteTooltips = document.querySelectorAll(`[style*='position: absolute'][style*='transform'],[style*='left'][style*='top']`);

      var websiteTooltip;
      if (websiteTooltips !== null && websiteTooltips !== undefined)
        for (i in websiteTooltips) {
          var el = websiteTooltips[i];
          if (el.style !== undefined) {
            var transformStyle;

            try {
              transformStyle = el.style.transform.toString();
            } catch (e) { }


            var elementStyle = el.getAttribute('style').toString();

            // if (elStyle !== null && elStyle !== undefined && elStyle.includes('translate3d')) {
            if ((elementStyle.includes('position: absolute') && transformStyle !== null && transformStyle !== undefined && transformStyle.includes('translate')) ||
              (!el.className.includes('selection-tooltip') && el.style.visibility !== 'hidden' && el.style.width !== '100%' && el.style.width !== '0px'
                && el.style.top !== '0px' && el.style.top !== '0' && !elementStyle.includes('margin') && !elementStyle.includes('padding')
                && elementStyle.includes('left:') && elementStyle.includes('top:'))) {
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
        tooltip.style.top = `${dy - websiteTooltip.clientHeight}px`;

        /// Animated approach
        // tooltip.style.left = `0px`;
        // tooltip.style.top = `0px`;
        // tooltip.style.transform = `translate(${dx}px, ${dy - websiteTooltip.clientHeight + 5}px)`;
        // arrow.style.opacity = 0.0;
        arrow.parentNode.removeChild(arrow);
      } else {
        arrow.style.opacity = 1.0;
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

function hideTooltip() {

  /// Hide all main tooltips
  var oldTooltips = document.querySelectorAll('.selection-tooltip');
  if (debugMode) {
    console.log(`Found ${oldTooltips.length} Selecton tooltips:`);
    console.log(oldTooltips);
  }

  if (oldTooltips !== null && oldTooltips.length !== 0) {
    oldTooltips.forEach(function (oldTooltip) {
      // tooltip.style.opacity = 0.0;
      oldTooltip.style.opacity = 0.0;

      setTimeout(function () {
        // dontShowTooltip = false;

        if (oldTooltip.parentNode !== null)
          oldTooltip.parentNode.removeChild(oldTooltip);
        // oldTooltip = null;

        if (debugMode)
          console.log('Selecton tooltip hidden');

      }, animationDuration);
    });
  }

  /// Remove all translate buttons
  // setTimeout(function () {
  //   var translateButtons = document.querySelectorAll('#selecton-translate-button');
  //   translateButtons.forEach(function (button) {
  //     button.parentNode.removeChild(button);
  //   });
  // }, animationDuration);


  /// Hide all secondary tooltips
  var oldSecondaryTooltips = document.querySelectorAll('.secondary-selection-tooltip');
  if (debugMode) {
    console.log(`Found ${oldSecondaryTooltips.length} secondary Selecton tooltips:`);
    console.log(oldSecondaryTooltips);
  }
  if (oldSecondaryTooltips !== null && oldSecondaryTooltips.length !== 0)
    oldSecondaryTooltips.forEach(function (oldSecondaryTooltip) {
      oldSecondaryTooltip.style.opacity = 0.0;

      setTimeout(function () {
        if (oldSecondaryTooltip.parentNode !== null)
          oldSecondaryTooltip.parentNode.removeChild(oldSecondaryTooltip);

        if (debugMode)
          console.log('Selecton secondary secondary tooltip hidden');

      }, animationDuration);
    })
}

function checkTooltipForBeingOffScreen() {
  if (debugMode)
    console.log('Checking Selecton tooltip to be off-screen...');

  var dx = parseInt(tooltip.style.left.replaceAll('px', ''));

  var tooltipWidth = 12.0;
  tooltip.querySelectorAll('.selection-popup-button').forEach(function (el) {
    tooltipWidth += el.offsetWidth;
  });

  /// Tooltip is off-screen on the left
  if (dx < 0) {
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
      tooltip.style.left = `${dx - offscreenAmount - 5}px`;

      /// Shift the arrow to match new position
      var newLeftPercentForArrow = (dx - (dx - offscreenAmount - 5)) / tooltipWidth * 100;
      arrow.style.left = `${50 + newLeftPercentForArrow}%`;
    }
  }
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
      console.log('Updated currency rates for Selecton');
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

    if (debugMode) {
      console.log('Selecton currency rates were successfully loaded from memory');
      console.log(loadedRates);
    }
  });
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
        translateButton.setAttribute('id', 'selecton-translate-button');
        if (addButtonIcons)
          translateButton.innerHTML = createImageIcon(translateButtonIcon, 0.75) + translateLabel;
        else
          translateButton.textContent = translateLabel;
        translateButton.addEventListener("mousedown", function (e) {
          hideTooltip();
          removeSelection();

          /// Open google translator
          // window.open(`https://translate.google.com/?sl=auto&tl=${languageToTranslate}&text=${selectedText.trim()}`, '_blank');

          try {
            window.open(`https://translate.google.com/?sl=auto&tl=${languageToTranslate}&text=${encodeURI(selectedText.trim())}`, '_blank');
          } catch (e) {
            console.log(e);
          }
        });
        tooltip.appendChild(translateButton);
        /// Correct tooltip's dx
        tooltip.style.left = `${(parseFloat(tooltip.style.left.replaceAll('px', ''), 10) - (translateButton.clientWidth / 2))}px`;

        /// Correct last button's border radius
        tooltip.children[tooltip.children.length - 2].style.borderRadius = '0px';
        tooltip.children[tooltip.children.length - 1].style.borderRadius = lastButtonBorderRadius;

        checkTooltipForBeingOffScreen();
      } else {
        checkTooltipForBeingOffScreen();
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

function getTextColor(color) {
  var c = hexToRgb(color);

  var d = 0;
  var luminance =
    (0.299 * c.red + 0.587 * c.green + 0.114 * c.blue) / 255;
  if (luminance > 0.5) {
    isDarkBackground = false;
    d = 0; // bright colors - black font
  }
  else {
    d = 255; // dark colors - white font
    isDarkBackground = true;
  }

  return rgbToHex(d, d, d);
}

function hexToRgb(hex) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    red: parseInt(result[1], 16),
    green: parseInt(result[2], 16),
    blue: parseInt(result[3], 16)
  } : null;
}

function rgbToHex(r, g, b) {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

function returnSearchUrl(query) {
  var encodedQuery = encodeURI(query);

  switch (preferredSearchEngine) {
    case 'google': return `https://www.google.com/search?q=${encodedQuery}`; break;
    case 'duckduckgo': return `https://duckduckgo.com/?q=${encodedQuery}`; break;
    case 'bing': return `https://www.bing.com/search?q=${encodedQuery}`; break;
    case 'yandex': return `https://yandex.ru/search/?text=${encodedQuery}`; break;
    case 'baidu': return `http://www.baidu.com/s?wd=${encodedQuery}`; break;
    case 'yahoo': return `https://search.yahoo.com/search?p=${encodedQuery}`; break;
    case 'custom': return customSearchUrl.replaceAll('%s', encodedQuery); break;
  }
}

function returnNewEmailUrl(query) {
  var encodedQuery = encodeURI(query);

  switch (preferredNewEmailMethod) {
    case 'mailto': return `mailto:${query}`; break;
    case 'gmail': return `https://mail.google.com/mail/?view=cm&fs=1&to=${encodedQuery}`; break;
    case 'yahoo': return `https://compose.mail.yahoo.com/?to=${encodedQuery}`; break;
    case 'outlook': return `https://outlook.com/?path=/mail/action/compose&to=${encodedQuery}`; break;
  }
}

function returnShowOnMapUrl(query) {
  var encodedQuery = encodeURI(query);

  switch (preferredMapsService) {
    case 'google': return `https://www.google.com/maps/place/${encodedQuery}`; break;
    case 'waze': return `https://www.waze.com/ru/live-map?q=kharkiv${encodedQuery}`; break;
    case 'mapquest': return `https://www.mapquest.com/search/results?query=${encodedQuery}`; break;
    case '2gis': return `https://2gis.ua/kharkov/search/${encodedQuery}`; break;
    case 'yandexmaps': return `https://yandex.ru/maps/geo/${encodedQuery}`; break;
  }
}


/// Create secondary tooltip for custom search engines
function createSecondaryTooltip() {
  secondaryTooltip = document.createElement('div');
  secondaryTooltip.setAttribute('class', 'secondary-selection-tooltip');
  secondaryTooltip.style.backgroundColor = tooltipBackground;
  secondaryTooltip.style.minWidth = `${searchButton.clientWidth}px`;
  secondaryTooltip.style.borderRadius = `${borderRadius}px`;

  document.body.appendChild(secondaryTooltip);

  /// Add shadow
  // if (addTooltipShadow) {
  //   secondaryTooltip.style.boxShadow = `0 1px 5px rgba(0,0,0,${shadowOpacity / 1.5})`;
  //   // secondaryTooltip.style.boxShadow = `1px 1px 3px rgba(0,0,0,${shadowOpacity / 1.5})`;
  // }

  var dx = tooltip.style.left;
  var dy = tooltip.style.top;
  secondaryTooltip.style.left = dx;
  secondaryTooltip.style.top = dy;

  /// Add search buttons
  for (var i = 0; i < customSearchButtons.length; i++) {
    var item = customSearchButtons[i];

    const url = item['url'];
    const optionEnabled = item['enabled'];
    const title = item['title'];
    const icon = item['icon'];

    if (optionEnabled) {
      var imgButton = document.createElement('img');
      imgButton.setAttribute('src', icon !== null && icon !== undefined && icon !== '' ? icon : 'https://www.google.com/s2/favicons?domain=' + url.split('/')[2])
      imgButton.setAttribute('class', 'image-button');
      imgButton.setAttribute('width', `${secondaryTooltipIconSize}px`);
      imgButton.setAttribute('height', `${secondaryTooltipIconSize}px`);
      imgButton.style.maxHeight = `${secondaryTooltipIconSize}px`;

      /// Add title tooltip on hover

      /// Manual title approach
      // if (showSecondaryTooltipTitleOnHover && title !== null && title !== undefined)
      //   imgButton.setAttribute('title', title);

      /// Automatic title based on url
      if (showSecondaryTooltipTitleOnHover && url !== null && url !== undefined && url !== '') {
        var titleText;
        var domainContent = url.split('.');

        if (domainContent.length == 2) {
          titleText = domainContent[0];
        } else if (domainContent.length == 3) {
          titleText = domainContent[1];

        } else {
          titleText = domain.textContent.replace(/.+\/\/|www.|\..+/g, '');
        }
        titleText = titleText.replaceAll('https://', '');
        imgButton.setAttribute('title', titleText.charAt(0).toUpperCase() + titleText.slice(1));
      }

      /// Set border radius for first and last buttons
      if (i == 0) {
        imgButton.style.borderRadius = firstButtonBorderRadius;
      } else if (i == customSearchButtons.length - 1) {
        imgButton.style.borderRadius = lastButtonBorderRadius;
      }

      /// Set click listeners
      imgButton.addEventListener("mousedown", function (e) {
        hideTooltip();
        var selectedText = selection.toString();
        removeSelection();
        setTimeout(
          function () {
            window.open(url.replaceAll('%s', selectedText), '_blank');
          }, 1
        );
      });
      secondaryTooltip.appendChild(imgButton);
    }
  }

  var paddingOnBottom = 3;

  var isSecondaryTooltipHovered = false;

  searchButton.onmouseover = function (event) {
    secondaryTooltip.style.top = `${parseInt(dy.replaceAll('px', '')) - secondaryTooltip.clientHeight - paddingOnBottom}px`;
    secondaryTooltip.style.opacity = 1.0;
  }
  searchButton.onmouseout = function () {
    if (isSecondaryTooltipHovered == false) {
      secondaryTooltip.style.top = dy;
      secondaryTooltip.style.opacity = 0.0;
    }
  }
  secondaryTooltip.onmouseover = function (event) {
    secondaryTooltip.style.top = `${parseInt(dy.replaceAll('px', '')) - secondaryTooltip.clientHeight - paddingOnBottom}px`;
    secondaryTooltip.style.opacity = 1.0;
    isSecondaryTooltipHovered = true;
  }
  secondaryTooltip.onmouseout = function () {
    isSecondaryTooltipHovered = false;
    secondaryTooltip.style.top = dy;
    secondaryTooltip.style.opacity = 0.0;
  }


  /// Add some bottom space to prevent unwanted jumping on moving cursor
  var space = document.createElement('div');
  space.setAttribute('class', `secondary-selection-tooltip-bottom-div`);
  space.style.width = `${secondaryTooltip.clientWidth}px`;
  space.style.height = `${paddingOnBottom * 2}px`;
  space.style.bottom = `-${paddingOnBottom * 2}px`;
  secondaryTooltip.appendChild(space);
}


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


/// Big variables
// var currencyButtonIcon = 'https://img2.freepng.ru/20180406/izq/kisspng-currency-exchange-rate-foreign-exchange-market-uni-rate-5ac76a4c1cd464.6574766915230183161181.jpg';

/// base64 encoded icons (to avoid restriction for embedded external content on some websites)
const searchButtonIcon = 'data:image/png;base64,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';
const copyButtonIcon = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAgAAAAIACAMAAADDpiTIAAAAA3NCSVQICAjb4U/gAAAACXBIWXMAACG7AAAhuwHNHJyeAAAAGXRFWHRTb2Z0d2FyZQB3d3cuaW5rc2NhcGUub3Jnm+48GgAAArhQTFRF////HR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bHR0bBx9pVQAAAOd0Uk5TAAECAwQFBgcICQoLDA0ODxAREhMUFRYXGBkaGxwdHh8gISIjJCUmJygpKistLi8xMjM0NTY4OTo8PT4/QEFCQ0RFRkdISUpLTE1OT1BR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';
const translateButtonIcon = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAgAAAAIACAYAAAD0eNT6AABhoUlEQVR42u29CZwdVZn3353uTne6m0C6k5Debi/pztKEhEBCIICiIyiICxpcCY6OIOO8f8VlHMd9wGVeHTccQMdtxg1wrphgo4iKMsK44aiDjo6ICAiyyiKbkOT9P6e7qrv69l1qO6fqnPr253M+IaHvt26d5znP71dVp85pauKHH3744YcffviJ+vOUpxzbLG1RoDXDgwcPHjx48OziRT14S2WDBw8ePHjw4NnFi+o6WqW1BVprHPdx4IEHdg0M9B86ODj44v7+vrf29/e/X9rHVq1a9Xn5f5fIn7vitL6+vt2VLS4LHjx45nhq3EsN+KIw/tWrB2+Q9nypEZsmJycXZ1mv4MFzjRfn4OqAiwOtLezBBwYGBmWQn6YGt7TfStsng/v/VTb599gNHjx4zvIeE4PwY6khH5H/Prm3t3c/nfUKHjyXeXEO3i6tI9DaGx18+fLlfTJo/1YG7H9T3ODBg5ci7zFpX5P68pcrVqzoTqNepV3/4MHLIy/OwdUBlwRaR72Di0t/mgzMy2WA7qk12OX2/2xLo3jAgwevsLwHpF0gn1sbp16lXf/gwcsrz2eG/UU1u7BTWlegqb8vqvLrzSL8z5GBeG29wTozyAcCLVnxgAcPHjyv7VNzEIaHS4eHqFdp1z948PLOa/YmDS4Ke3B1wO5A66r2Ybna36aezzUe7AMLWrLiAQ8ePHgLePtk4uDnx8dXjyUsvqHqHzx4FvD8CYSNDUDg4EsDrbvygzLIekT4P+Y5b4oRPHjw8sS7X+5KvlLdnYxRfLsb1T948CzhNQfeGqhvALxf7gx8gf29PxdVXPU/WQbYH8IOzsHBuZbGYIcHDx68kLwr1VtIEYqvX/f2r1X/IhZzePCy4vkTCBcHDEBzowkHXRUOJHjwRTKg/kHaXooRPHjwbODJBcs9anIy4gCvYDz/rYFZA9DIKSypePYwe/Cenp6lMoi+QTGCBw+ehTx10fJ3iAO8gvA6A28NKAPQ2ugZQUfAAMybcLBy5Uox0Qf+hGIEDx48m3lq3pK6k4nYwHOY52u4bwDa6t36b/Ucgm8AOivEf0wGzm8oHvDgwXOBJ3cyL5LS1orYwHOQF3xrYEndRYO8SQFtAQPQETz40NBQvwyY31E84MGD5xjvoqOPPuIAxAaeY7ylAQPQ0WjSX9AAzHMKpVJpmQyS6yge8ODBc5En7dOIDTzHeL4B6Ky76p/3oZbAO4Kzvzw+Pt4uz8qupnjAgwfPZZ5c6LwdsYHnEG9pqEWDAgZgwZaCMkjOo3jAgwevALy9so/ACYgNPEd43VGW+12wMIBMkDmF4gEPHryi8NQ6AbKy6QBiA68wvGrPB7wZ//dTPODBg1cknlz4fLMp5LLBiA08l3izP942vhQPePDgFY4nJuAViAO8Qop/2Fv/FA948OA5yrtPLXqGOMArlPivWLGiW67+f0/xgAcPXpF5ciH0CcQBXmHE37v6fwvFAx48ePD69ko9nERs4BVC/OXKv0va3RQPePDgwZtuX0Rs4Dkv/t7V/+soHvDgwYM3dxdAPjeB2MBzTfwr3/5rFQNwK8UDHjx48OaaLA50PmIDzyGev/T/ouDt/6cz2OHBgwdvAe+BLVs29yE28BwR/9YFBkAS/eI6G2WYHJx7xIzcJH9+X+5IXCptV63W17dqt3x+SjiX+U39Xf17vc/Bgwcv17xLZfx/R+rALXkxEyMjw6cjNvAcEH9/v585AzA8PHyADLZHFiZ//zwDoFH898rxL5E/X6x2HiR48ODBUz9qG3IxC2dKffhxxncSvkY84Fku/u3ebr9t85b+l2dcL6jy3GtW/P2mSfy/Jv+9keDBgwevwVtKJ0m9+E0WjxHk3x6Vi5P9iAc8S3kdXps1AMHZ/x9fKP79usV/j7RXEzx48OCF5alXlaVefT6LOQRSF59BPOBZyOuUtiRgAFrn/ZIk9w1B8a80AGkPJhnEf5ZB/DSCBw8evDg8qS3vz2AC4QeIBzzLeF1e8w1A27zX/ySpS5XiP2cA+rUMJhH/lxA8ePDgJeFJfbrY8NsDPyAe8CzidXvNNwDtC3b+FbF/ZjUDoJqmwXQ+wYMHD15S3qGHbuqXunKDqVcH5c7lo3L4FuIBzxLe0oAB6Fgg/t4dgDfMiH+fCfG/T9i9BA8ePHhp8OT1vFNMrhtQuTcA8YCXY55vADqrir/6kYT+ZKUB0DWY5FhvJnjw4MFLkye15UemFg1Sd0yJBzxLeEu9q//aPLmt9d2gAdDspEsEDx48eGny5MLiFQZXDHw18YBnCa+7IU8MwC+TiH7YwSTH+QnBgwcPXtq8QSk4plYMFLPxbuIBzxmeCPPvdYu/184jePDgwdPBi7JscJJXB+U4HyMe8JzhqYl5JibQhHn+T/DgwYMXhyc15ipDewV8lnjAc4bnrcinfQKNzC94GcGDBw+eDp7aOMzQXgEXEw94zvBMzZ6VAXoqwYMHD54O3szugkY2CioTD3jO8EzNnq1lAAgePHjwkvLqGYA0lwuWt6W+RDzgucJrMjh79lSCBw8ePB28WgYg7b0C5I2DXcQDnhPiH9UAJBlMlQaA4MGDBy8tXjUDoGOjoKGhwd3EA54L4j+9OqAJ8a80AAQPHjx4afIqDYCuXQIDBoB4wLOV1yytZfrzhl6dmTUABA8ePHhp84IGQOcWwZ4BIB7wbBb/1tAGQCV/cADEHUzKABA8ePDg6eD5BkCn+M+06TkAxAOereLf5rXGBkD2255nABIOpp0EDx48eDp4fX2rdusWf/V39RYA8YBnqfi3S1scMAC15wCojYF88fdbksFUKg2dTvDgVftRO6xJjrzDb/L3fxgaGnqP5Mw/+k39Xf178PfqtOXEo1g8qU9TusXfXweAeMCzkNfhtVkD4DnnWuLfn5r4q88PD5fOIHjwaty+/UTKc07WEY9i8SRPLjMg/pENAPGFlwNep7QlAQPQGrh1tlD8Kw1AGoMpYAAIHryaBiCl27jriEexeL4B0Cz+kQwA8YWXA16X13wD0DZ967+aAfDFf84A9Kc2mDwDQPDg1TQAKT7DXUc8isVTBsCA+Ic2AMQXXg543V7zDUD7PPGvZwBUS3MweXMACB68BT+SL59McwKXfHaSeBSLp+YAmNjVNIwBIB7wcsJbGjAAHQvEP2gAZHarNvH3BtNOggevGk9y5N/SnMA1Pr56C/EoFk+9BWBoY7My8YBnCc83AJ1Vxb+WAdDhpOvtBkjwis2Td6s/k+YEromJ8a3Eo1i8RrsBprjIWZl4wLOEt9S7+l9U7/brPAOg6zZaVANA8Io0gWvGAKT1DDdgAIhHQXhxDEDMx05l4gHPEl53Q16SghtlMEUxAASvaBO4Bj+T5gQuzwAQjwLxohqABHNOysQDnjM8E+IfxQAQvOLx1ByANPPPmwNAPArEi2IAEk44LRMPeM7wTIh/WANA8Io6gavvk2nmn3oLgHgUixfWAKTwtkmZeMBzhmfo1ZmGBoDgFXoC1ydSzr91xKNYvDAGIKVXTcvEA54zPEOvztQ1AASv8BO4PpFy/q0jHsXiNTIAKa4zUSYe8JzhGXp1pqYBIHjwohqAEPm3jngUi1fPAKS5yJTaDZB4wHOF12To1ZmqBoDgwYtqAELm3zriUSxeLQOQ9hbB8sbKLuIBzwnxj2oAkgymSgNA8OBFNQAR8m8d8SgWr5oBSFv81eeHhgZ3Ew94Loj/9OqAhl6dmWcACB68qAYgYv6tIx7F4lUaAB3irzgBA0A84NnKa5bWMv15Q6/OzBoAggcvqgGIkX/riEexeEEDoEv8AwaAeMCzWfxbQxsA773qxINJGQCCBy+qAYhZzNcRj8JtKb1Lt/jPtOk5AMQDnq3i3+a1xgZgYKB/ngFIOJh2Ejx4UQxAgmK+jngUbUvpVbt1i7/6u3oLgHjAs1T826UtDhiA2nMA1MZAvvj7LclgKpWGTid48MIagITFfB3xKBZP8mNKt/iH2Q6YeMDLKa/Da7MGwHPOtcS/PzXxV58fHi6dQfDghTEAKVzJrSMeRdtSeuAyA+If2QAQX3g54HVKWxIwAK2BW2cLxb/SAKQxmAIGgODBq2kAUrqNu454FG1L6RkDoFn8IxkA4gsvB7wur/kGoG361n81A+CL/5wB6E9tMHkGgODBq2kAUnyGu454FG1L6YHLDIh/aANAfOHlgNftNd8AtM8T/3oGQLU0B5M3B4DgwVvwo3YDTHMCl9oNkHgUi6fmABja2KxMPOBZwlsaMAAdC8Q/aABkdqs28fcG006CB68aT3Lk39KcwDU+vnoL8SjaltKrdhva2KxMPOBZwvMNQGdV8a9lAHQ46UbbARO8Ik/gGvxMmhO4JibGtxKPYvHCbAec0qumZeIBzxLeUu/qf1G926/zDICu22hRDQDBK9IErhkDkNYz3IABIB4F4cUxADEfO5WJBzxLeN0NeUkKbpTBFMUAELyiTeAa/EyaE7g8A0A8CsSLagASzDkpEw94zvBMiH8UA0DwisdTcwDSzD9vDgDxKBAvigFIOOG0TDzgOcMzIf5hDUAeO1u++2XS9vhNzm+PnOdsU38P/v+oDd40b1/K+Uc8NPMOPPDAJ+dp/IY1ACm8bVJGbOA5wzP06kxDA5DXzpZCd7mJXcbgwbOJJ/OFnpKn8RvGAKTUf2XEBp4zPFPFo54ByHNn+wYAcYAHr7oByMmW0rsM9V8ZsYHnDM9U8ahlAPLe2atWHfh1xAEevOoGIEdbSu8y0X9qN0DEBp4rvCZTxaOaAbChs6XQfRNxgAdvoQHI2ZbSu0z0n7yxsguxgeeE+Ec1AEkGU6UBsKWzZT+EbyIO8OAtYB2fsy2ld5nov6Ghwd2IDTwXxH96dUBTxSNoAGzqbN8AIA7w4M210dHRZ+ZsS+ldJvovYAAQG3i28pqltUx/3lTx8A2AbZ2tDADiAA/efN7Y2Oizcral9C4T/ecZAMQGns3i3xraAKjkDw6AuINJGQAbO1vNAUAc4MGbzwsYgLxsKb3LRP95cwAQG3i2in+b1xobALn6nWcAEg6mnTZ2tnoLAHGAB28+zzMAOdpSetVuE/2n3gJAbOBZKv7t0hYHDEDtOQBqYyBf/P2WZDCVSkOn29jZwYWAEAd48GaaNwcgN+NXvt+Uof4rIzbwLOR1eG3WANR8C2BG/PtTE3/1+eHh0hk2dnYcA4DYwHOdp94CyNP4le91maH+KyM28CzjdUpbEjAArYFbZwvFv9IApDGYAgbAqs6OagAQB3hF4FUuBZz1+PUNgIH+KyM28CzidXnNNwBt07f+qxkAX/znDEB/aoPJMwDWdXYUA4A4wCsKL6oB0L+l9MBlhvqvjNjAs4TX7TXfALTPE/96BkC1NAeTNwfAus4OawAQB3hF4kUxACbGr5oDYKj/yogNPEt4SwMGoGOB+AcNgMxu1Sb+3mDaaWNnhzEAiAO8ovHCGgBT41e9BWCo/8qIDTxLeL4B6Kwq/rUMgI7i0Wg74Lx2diMDgDjAKyIvjAEwOX7DbAecUv+VERt4lvCWelf/tXmVBkBX8YhqAPLS2fUMAOIAr6i8RgbA9PiNYwBi9l8ZsYFnCa+7IS9JwYgymKIYgDx1di0DgDjAKzKvngHIYvxGNQAJ+q+M2MBzhmdC/KMYgLx1tnzvc+X7XxtsshzoTypb5e9EafCc5d2fpliLGf19Xs5XvsvheRq/UQxAwniUERt4zvBMiH9YA0Dw4LnEk7z/Tcpb8L6QeFTnhTUAKcSjzPiA5wzP1G3DRgaA4MFziSdjYVXat+knJsYPIx7VeWEMQErxKDM+4DnDM/XMsJ4BIHjwXOOVSqWdKT+jf+iYY45cRjxqPqrbZWjORJnxAc8ZnqkJSLUMAMGD5yJvaGjoX9KcoCeT7r5HPGr/1DMAad6JUbsBMj7gucJrMjX7uJoBIHjwXOWJYP86zdn5Yij+mXhENwBpP4aRCZK7GB/wnBD/qAYgyWCqNAAED56rvHXr1m5I+9W84eHhncQjmgHQ8ark0NDgbsYHPBfEf3p1QFPvHQcNAMGD5zJP9r04K+338tesGZ8gHuENgK51EgIGgPEBz1Zes7SW6c+bWnTENwAED57rPLlNfHma4i+PE64nHuENgM5FkjwDwPiAZ7P4t4Y2ACr5gwMg7mBSBoDgwXOdd+ihh8gaOQc+nObbNWIAPko8whkA3SskenMAGB/wbBX/Nq81NgADA/3zDEDCwbST4MFznSd5/lwNG2mdQjzq/6jdAE0sj6zeAmB8wLNU/NulLQ4YgNpzANTGQL74+y3JYJLnoqcTPHiu8yTXP5vyq7V7pS0nHvV50l9ThvZGKDM+4FnI6/DarAHwnHMt8e9PTfzV54eHS2cQPHgu88bHx9v99f9TfLvme8SjMU/67TJDGyOViQc8y3id0pYEDEBr4NbZQvGvNABpDKaAASB48JzkSb4/S8Mumm8hHo15vgEwsCtimXjAs4jX5TXfALRN3/qvZgB88Z8zAP0pvsc8bQAIHjxneZLzF6e9roaMxc3EozFPGQBDWyKXiQc8S3jdXvMNQPs88a9nAFRLczB5cwAIHjwneb29vftFmf0fcgvtW4lHOJ6aA2BoY7My8YBnCW9pwAB0LBD/oAGQ2a3axN8bTDsJHjxXeTJmXqpBbP6ZeITjqbcADG1sViYe8Czh+Qags6r41zIAOpx0o+2ACR48m3mS499OW2zkjsKTiEc4XpjtgFNa5KxMPOBZwlvqXf3X5lUaAF230aIaAIIHzxbeypUrxyTH96UsNncKuoV4hOPFMQAx1w0oEw94lvC6G/KSCH7E2cynEjx4LvIkv89OW2zk6v9fiEd4XlQDkGDRoDLxgOcMz4T4RzEABA+eZbwWEevfaxCb44lHeF4UA5BwxcAy8YDnDM+E+Ic1AAQPnm28Ru/+xxSbP1S7/U88avPCGoAUlgsuEw94zvAMvTrT0AAQPHg28uTq/3INYvN+4hGNF8YApLRXQJl4wHOGZ+jVmboGgODBs5EnOT9Ra/JfErGRybiHEI9ovEYGIMWNgsrEA54zPEOvztQ0AAQPnq08ufr/oAaxuY54ROfVMwBp7hKodgMkHvBc4TUZenWmqgEgePBs5amV/6pt/JOC2LyBeETn1TIAaW8RPDg4uIt4wHNC/KMagCSDqdIAEDx4NvMkp8/SIDaPDw0N9ROP6LxqBiBt8VefHxoa3E084Lkg/tOrAxp6dWaeASB48CzntUhO/zZtsZFHCpcQj3i8SgOgQ/wVJ2AAiAc8W3nN0lqmP2/o1ZlZA0Dw4NnOk0l6z9ckNk8lHvF4QQOgS/wDBoB4wLNZ/FtDGwCV/MEBEHcwKQNA8OC5wJN8vlaD2NywadOGFuIRj+cbAJ3iP9Om5wAQD3i2in+b1xobgIGB/nkGIOFg2knw4Dkg/sfrmV3e//fEIz5P7QaoW/zV39VbAMQDnqXi3y5tccAA1J4DoDYG8sXfb0kGU6k0dDrBy/uWqn0nypXU6+i/ugbgKg1Xmo+tX792jHyOz5P+n9It/mG2AyYe8HLK6/DarAHwC1oN8e9PTfzV54eHS2cQvHzyJDYnyQS0q/2Z6NLW0X9Vxf8YPa+WDZTJ52Q86cPLDIh/ZANAfYGXA16ntCUBA9AaLGoLxL/SAKQxmAIGgODlhDc2NvpUeaZ5VZW4TdF/VQ3AlTpuM4+NjR1LPifj+QZAs/hHMgDUK3g54HV5zTcAbdO3/qsZAF/85wxAf2qDyTMABC8HvNHRkSdLbL/VYO+Gp9F/cz8yJp6o5xnz4DXkc3KeMgAGxD+0AaBewcsBr9trvgFonyf+9QyAamkOJm8OAMHLkDc+vvoYeY3p8pD70f9qcnJyMf03w1N3SnQ8Yx4dHX0h+Zycp+YAGNrYrEw84FnCWxowAB0LxD9oAGR2qzbx9wbTToKXDU+u+I+QGHxFYrEvoni9kf5T/Tf6TB3iL+Ps+mOPPfoA8jk5T70FYGhjszLxgGcJzzcAnVXFv5YB0OGkG20HTPC03LbeIFeuX/aFP4Z4PSitVPR4SB/+WMcEM7kr9hryOR1emO2AU1rkrEw84FnCW+pd/dfmVRoAXbfRohoAghefJ3FcK31+ofT/3hRWcLy0yPEYHh4+VYf4S4zu3rr10JXkczq8OAYg5pyOMvGAZwmvuyEvSUGLMpiiGACCF4+3YsWK1dLXn5G2J+VFap5TxHhs23ZYr7pNr2N2uczFeCf5nB4vqgFIMD7KxAOeMzwT4h/FABC8eDw1YU/6+XY9y6H237Zhw/qhosVDbtG/Tof4y922e2WS5TLyOT1eFAOQcHyUiQc8Z3gmxD+sASB4id9Tf72u5VDlz08XKR4HH3yQPPofvFPTq2VvJ5/T5YU1ACmMjzLxgOcMz9CrMw0NAMFLztu+fdtyEa2bNK2Itm9kZPiEosRDbtF/SIf4y5X/vcuWLduffE6XF8YApGSOy8QDnjM8Q6/O1DUABC/VRX5eqnFFtN9I63Q9HhMT45vkPB/VZI7fQT6nz2tkAFK8M1YmHvCc4Rl6daamASB46fNk4tp/anyb48MF6L9LNfXfffJWwQHkc/q8egYg3QmxfV8iHvBc4TUZenWmqgEgeHp4EpMt0ud7NZm7fRLLJ7jafyMjIydrfCx2Nvmsh1fLAKS/cdPgLuIBzwnxj2oAkgymSgNA8PTypM8/qtHc3SCvHHa71n9HH729V57R/68O8RfuH6Nc/ZPP0XjVDICOCbEyN2Q38YDngvhPrw5o6NWZeQaA4OnnyZVKj4jO3briK+x/ca3/5Nb/GzWug/E68lkfr9IA6HobJmAAiAc8W3nN0lqmP2/o1ZlZA0DwzPGk31+uM75iAp7ukPiPyfk8pOmxyY3j4+Pt5LM+XtAA6BL/gAEgHvBsFv/W0AZAJX9wAMQdTMoAEDzjvGbp92s0mrs/SFvuQv/JeUxpnBD7IvJZL883ADrFf6ZNzwEgHvBsFf82rzU2ALIC3DwDkHAw7SR45nkrV648WPr+cY13dnbb3n9yDs/VKP7XKiNGPuvlqd0AdYu/+rt6C4B4wLNU/NulLQ4YgNpzANTGQL74+y3JYJJlVU8neJlNkHqP5glSf21r/6mJefL9b9M1YVIeKzyJfNbPk/6f0i3+YbYDJh7wcsrr8NqsAfCfE9cQ//7UxF99fni4dAbBy4YnItchJuDXup6RSnt4YmL14ZbuIvcJjW9LXEb+meFJHC4zIP6RDQDxhZcDXqe0JQED0Bq4dbZQ/CsNQBqDKWAACF4GPLkSPVa9w69xr4Drtm8/YqVN/Sd98mSN4r9H+BvIPzM83wBoFv9IBoD4wssBr8trvgFom771X80A+OI/ZwD6UxtMngEgeBnyZAbzp3TeJhX+x23pP7WOgZzDbzXufXEu+WeOpwyAAfEPbQCIL7wc8Lq95huA9nniX88AqJbmYPLmABC8DHkbN24YlLjeovNKSU2os6H/5LteoHERrNvrbfhDPqfPU3MADG1sViYe8CzhLQ0YgI4F4h80ADK7VZv4e4NpJ8HLniebBZ2s+UrpPrn1PZpz8T9O88ZXO8k/szz1FoChjc3KxAOeJTzfAHRWFf9aBkDTleGpBC8vxbLvE5qL5Q8mJycX57H/1Kx/MSg3a1wh8T/IP/O8MNsBp/QqbJl4wLOEt9S7+q/NqzQAGneRO5Xg5YPX29u7X9Tn3zGK5T/nsf8kD7+gURweV+sukH+ZvM2xy9DGZmXiAc8SXndDXsLXv6KshX4qwcsPT+3oF2XHwJjF8oV56j+1Ip/m8/0A+ZdZPu/qM7OxWZl4wHOGZ0L8oxgAgmd0r4D3ay6WD0rcJ3Mi/iW5PX+vxvO9Td1ZIf8yu7Ozq8/MxmZl4gHPGZ4J8Q9rAAieWZ7aoEZic53OjaBEdH/pC2OG59vaaE+EFM73heRfdrywBiCFdTDKxAOeMzxDr840NAAEL7u9AkSkH9G1V4DXvrRp04aWDO90vFOnOEhuX0r+ZcsLYwBSyucy8YDnDM/QqzN1DQDBy5Yn8XmV5r0C1CJBZ2dxvmot/jBzHRJsifzH5cuX95F/2fIaGYAU87lMPOA5wzP06kxNA0Dw8sGTGH1V837qe0dGhk8xeb6y2t8qb8tibVeGktenkX/Z8+oZgDTzWe0GSDzgucJrMvTqTFUDQPDyw5NHAQeqFew0b6l6/9q1E5sNnW+LHP/bmm8Lf4X8ywevlgFIO58HBwd3EQ94Toh/VAOQ8ErpVIKXb97o6Ogz1ZW65l3VflFttryGZ8Lv0pnPlbf+yb/Mt7zepVv81eflUdZu4gHPBfGfXh3Q0Ksz8wwAwcsvTwrcPxnYVW1KDrtI1/mKOD9d7XyoOZ9fQr7kh1dpAHTdyQoYAOIBz1Zes7SW6c8benVm1gAQvHzzjjzy8B5ZEfI/Dbwd8n4d5yvHmlD7EWjO56+QL/niBQ2AzsdYngEgHvBsFv/W0AZAJX9wAMQdTMoAEDw7eCX5kavou3VPEBWj8bI0z9fb4vfnmtc1uHdoaKiffMkXzzcAmuew+HMAiAc8W8W/zWuNDcDAQP88A5BwMO0keFatrf60KEsFx9w458/y5zFpna+w/l33nSz5zs8jX/LHU7sB6hZ/9Xf1FgDxgGep+LdLWxwwALXnAKiNgXzx91uSwVQqDZ1O8OziSdz+QfccERHUu+TKfXXS8xXD8lYDj7E+Tr7kkyfxnNIt/mG2AyYe8HLK6/DarAHwi3wN8e9PTfzV54eHS2cQPOt4i0Sgv25gguivJed6E4j/c+pN+kvpyvB/pHWSL/nkSVwvMyD+kQ0A8YWXA56qW0sCBqA1eJW3QPwrDUAagylgAAieRTwlzGICbta9yIoc47sbNhy0JMb3O0RtOqT5tv8jaslk8iW/PN8AaBb/SAaA+MLLAa/La74BaJu+9V/NAPjiP2cA+lMbTJ4BIHgW8kQAt3nP63W/Z/2lY489+oCw30+9hy/f6ybd5kTuMLySfMk3TxkAA+If2gAQX3g54HV7zTcA7fPEv54BUC3NweTNASB4lvIkpi839J71B8N8PxH+LvnctQbuTFxCvuSfp+YAGNrYrEw84FnCWxowAB0LxD9oAGR2qzbx9wbTToJnN09ieIGJV63kNbuzGny/RWoHPgPif/PY2Fgv+ZJ/nnoLwNDGZmXiAc8Snm8AOquKfy0DoMNJN9oOmODln7diRW+7WiTIwGzrvWpiX63vIf/vXAMbv+yRR2BPIF/s4IXZDjilfCkTD3iW8JZ6V/+L6l3VzTMAum6jRTUABC+fvPXr105Intyme8KVXH0/KjnzxCq3/v/WxK5v0t5Cvli1bsWuPjMbm5WJBzxLeN0NeUkKeJTBFMUAELx888bGRp8kMX3EwDPX++TfNwau/E+t9bpf2lu+ymTE/ckXe3hRDUCCfCkTD3jO8EyIfxQDQPDs4MldgBcZeuZ6m1z1j8ifx0t7zMCV/883bdrQR77YxYtiABLmS5l4wHOGZ0L8wxoAgmcXT+J6tqHbrjdI+5Nu8Vdb/K5ePbaJ+NrHC2sAUsiXMvGA5wzP0KszDQ0AwbOS1yyx/aKpLaU18/aOjIycTHzt5IUxACnlS5l4wHOGZ6r41jMABM9enuyOtkTi+yPLxV+tU/E24msvr5EBSDFfysQDnjM8U8W3lgEgePbz1Pa4cvv897aKv1qBkPjazatnANKeIEo84LnCazJVfKsZAILnDs9bk/8BC8X/ui1bNvcRX7t5tQxA2vkid7x2EQ94Toh/VAOQZDBVGgCC5+RywU+V9rgt4i9Xc/esWTOxkfjaz6tmAHTknyxVvZt4wHNB/KdXBzRVfIMGgOA5vVzwy20Qf2mPynoGJxBfN3iVBkDjXhW7iQc8y3nN0lqmP2+q+PoGgOC5z5M5Ae/L+W3/fbI75UuIrzu8oAHQaT49A0A84Nks/q2hDYBK/uAASLCl6qkErzg8yZOLcyr+asb/m4ivWzzfAOi+8+TNASAe8GwV/zavNTYAshnKPAOQcDDtJHjF4R1zzPYVki9X5k38hXM+8XWPp3YDNPHYSb0FQDzgWSr+7dIWBwxA7TkAamMgX/z9lvA969MJXrF4crUk27T2/TAv4i+3b78sa/wfQHzd40l8pww9dioTD3gW8jq8NmsAPOdcS/z7UxN/9Xl55noGwSseT+K/XNYI+N+sxV9tY7x9+xEria+bPMmTywzNOSkTD3iW8TqlLQkYgNbArbOF4l9pANIYTAEDQPAKxpPns8PSbs3utv/grzZv3jRMPNzl+QbAwJyTMvGAZxGvy2u+AWibvvVfzQD44j9nAPpTG0yeASB4BeWtXLnyYLkTcG8G4v+HtWvXbCAebvOUATA04bRMPOBZwuv2mm8A2ueJfz0DoFqag8mbA0DwCszz1wgwOOFvn7zr/yTi4T5PzQEwNOG0TDzgWcJbGjAAHQvEP2gAZHarNvH3BtNOgldcnjwCeEKtOwA6Z2/LXaypo4/e3ks83OaptwAMvW1SJh7wLOH5BqCzqvjXMgA6nHSj7YAJntNX/ieL+D+S3UZBq74h/6+TeLjLC7MdcEr5VyYe8CzhLfWu/hfVK87zDICu22hRDQDBc+bK/xUS/71Z7xIo3+Oa4eHhA4ivm7w4BiBm/pWJBzxLeN0NeQnXUw89mKIYAILnBK9ZYv6ePG0RLN/npzIZ8UDi6x4vqgFIkH9l4gHPGZ4J8Y9iAAie/bzx8fF2ifcX8iT+gTy8Xh5HjOat/8SYjMl3e458xzdKO0/++0JP1KaCTe7Uyetug5fLokazTf1d/Xvl74ZpDvFuN7TOxB+IBzzNvK+osS916nPy3x+Q9mppx5VKpWWp1ysT4h/WACCu9vNUkkq8r8qj+AfabfJ7G7Psv8nJycXyPZ4t7d/U98l4eWR48ODln7dP2nWipf9X2pZU6pXBK69TEVe3eTKHZI3E+deWDKb75Ls+0XT/yU6Jw3Ls94m7/yPFDR48eHGb3Dn4hbxef9YRR2w9MHa9MnUy9QwA4uqE+P9FPVHL42CS7/uouu1uov/Wr187Jn10nhzzzxQ3ePDgpfeq88Af5M7rq1avHm2NXKxMnUwtA4C42s/zZvo/bulg2itO+nU6+08G59/EueKnuMGDBy8sT2rMj+Ui4xCtBiDuyVQzAIir9bw2NWHNhcEkk3E+6O0UmFr/bdp08IjBFergwYNXcJ66wyha+zotBiDJyVQaAMTVbp7Ec0W9yX42DiZpX9y8+ZCONPpvYmJ8q/BupLjBgwcvg7edLpJ1Tzoa1KzmJlMnEzQAiKvdPLnNtFmc5k2ODqZvV3vdJkr/jY6OPFle67mXYgQPHrwMeVf19vbuV034pbVM13dTJ+MbAMTV+iv/nSL+Dzt+G+2X6r38OP03NjZ2rPAeoBjBgwcva57UsquldVWIf2toA6AOVjHjMNZJKAOAuNrL895bvyCj5H8og8F0p9zp2B6l/9asmdgozDsoRvDgwcsRb0rK1SJP/Nu81tgAyE5q8wxAwpPZibjayZPYlaT9MIvkFxH+/cTE6sPltvzfmx5M6jVB+fNFYfpPvYsrvOsoRvDgwcsbTy3LLnWqXdrigAGoPQdAbQzki7/fkpyMLFhwOuJqH08S5wQRwruzSf7BX05Orp/0v5/k5Om1NhbS/P3Oka5ortd/8hbBJylG8ODByyNPauc+WYTs6UEDUPMtgBnx709N/NXnh4dLZyCuVvFa1ZKT3vKTWVz5f2/z5k3Dld9P/v358juPZTCYympL4Wr9J7l9EsUIHjx4+eTN6Llsi36zvJ3Uo+YA1HwNUIl/pQFI42QCBgBxzTlP4j+kts/NKvnlavrSww8/bFWt7yff7cRGExF1fD855k/Wrl0zGey/rVsPXaYmDVKM4MGDl0feTOv3tf2907f+qxkAX/znDEB/aifjGQDEOv/i/8wwt/z1if/Qecccc+SyRucrv3+0Ws8/g8cSd42NjZ4QeCzxCooRPHjw8iv+cwZAavsjUsMGGhoA1dI8GW8OAGKdU54kxZIws/w1JuteMYlviHK+akc/b3tW04PzMTEqrxkaGlArIf6WYgQPHrz8iv/APD2XO6gfXmAAZOESbeLvncxOxDqfPE9If5Fhsj40MjLyojjnK452VBL6+iwGZ9jHJBQjePDgmeYFr/4rfudPPT09S2saAE3F8lTEOne8ZonNWd7rbhnNTu27dXx89TFJzle+/0ph/YjiAQ8ePHjzDUCN3z29qgHQdTJRDQBirZenJvpJXL6VZbLKY4cfr107sTaN8xWWeh7/TYoHPHjw4DXkfSvyZkBJDh7FACDWenlqOd9GE+gMiP8lgZn+qZzvtm2H9cqz+c8z2OHBgwev7mcem34MYEL8oxgAxFofz9vBr5xxssqCFINne1vvajlfMQHvYbDDgwcPXt3VAU9sMiH+YQ0AYq2PpxbQkWfld2WcrPfLTnnPN3S+L426YBDFAx48eAXind1k6uCNDABirYcnQtgnwn9J1skq3+F/ZbLfFpP9J+f+F1EedVA84MGDVxSe0oUmUwevZwAQaz086ffTJMj3ZJ+sq74yObluMKO9DCbDvKtP8YAHD16ReFIbf9Zk6uC1DABinT5Pds87eNWqA6/IQbLukavwN8vz/v2z7D8190Haf1I84MGDB2+23dFk6uDVDABinS7vyCMP75HZ9W+Rq/6HcpBcd8pnj8tL/42Pj7dLv3yO4gEPHjx4M9udN5k6eKUBQPzT5Y2NjR0rV9s/y0lyfa8kP3nsP/lub+rzdjikeMCDB6+oPFUHm0wdPGgAEP/0eIceekhJXnv7hFpLPwfJpYT1n1as6G3Pc/+JUTpZzu9Bigc8ePAKKv7TrcnUwX0DgPinx5OL7DPllv+deUguNdlQhPUZtvSf7Oi3XfruJooHPHjwisSbWfI/pAHw1xNOenBlABD/dHirV48dKeJ1dY5mk6oJdiXb4nHwwRtGpR+vonjAgwevOOIf0gCoXYSCBiDhwXci/sl4mzZtLIlgfUxisScnybVXxP9d8vVabY2HvC2xWO5efJDiAQ8evGKIfwgDoH6pck/hJAcvlYZOR/zj8VavHm2V5/yvlpjcnaNFJG4R8X+iK/GQc3qxnNPDFA948OC5Lf799ecAzIh/f2rirz4/PFw6A/GP/iP9Nz27P2fJVZb5B8tci4f08yEsGgQPHjy3eDN6HsoA+L8QNABpnEzAACD+IX6k3ybkCntXzpLrT9Je7nI85BFLj5zjVyke8ODBc4E30xaK/wIDEHQIvmtI62Q8A4D4N/hRAiTC/2G1kU2ekktuj39X2mhB4qF2Tny7muNAMYIHD57d4j9nAOq+BljrOUEaJ+PNAUD8a/wMDw93iOi8XkT2j3lKLvk+f5Y/36BEsWhmTM77eH8HRYoRPHjw7BT/gZp63jQn/n3axN87mZ2If9WfFrV1rQjNzXlLLjEkP5Xf3VjkORgy+XJY+uD7FCN48ODZxAte/TdcCChoAHScTKPtgIso/tIvz5L2ixwm12PqFrh8xTbWXTh26bZth/XKHaxzpf/2UYzgwYNnAy/MHL4FBkDXyUQ1AC6LjVztP0n645o8Jpd8tx9XXvWzguNMkzcfnif9czfFCB48eC7wmpIcMMrBoxgAV8VG+uEoaVfmMRnUs36J0ZvVoj6If22e9OOg9NXVFA948ODZzmsyIf5RDICLYiPnvkX64Gt5TQYRtP+QP9ex7kI4nsRzB8UDHjx4tvOaTIh/WAPgmtjIOW+VdmmOk+E+aWfIV21G/MPzohgAihE8ePDyymsydfBGBsCxFeWOlKvqy3OeDP++fPnyPhZdis4LawAoRvDgwcszr8nUwesZAFfEQUR/m5znN3OeDDeqbXtZdCnRnZ0dFA948ODZzmsydfBaBsAlcZDzPD2vyeAt6PNOWWlwCeKfeE7HDooHPHjwbOc1mTp4NQPgmjhMTk6qrWVvyVsyqLsSctW/lkWX0uHVMwAUI3jw4NnCazJ18EoD4PCrfq/OSzIoMyLC/wIWXUqXV8sAUIzgwYNnCy+SAUh68KABcFkc5Fw7pd2ZZTKI8D+qbvfLn12If/q8agaAYgQPHjybxD+0AUjj4L4BKILYyPn+fVbJoLYQXrly5RhirY9XaQAoRvDgwbOFN7Pkf0gD4K8nnPTgygAURWx6enqWytX3vYaT4edq9zrEWj8vaAAoRvDgwbNL/EMaALWLUNAAJDz4ziKJjXTyOYaS4XZvMZ8WxNoMzzcAFCN48ODZJ/4hDID6pco9hZMcXHZTO71IYrNhw+SIBO0hXckg//awxOhdvb29+yHWZnnS96dQjODBg2en+PfXnwMwI/79qYm/+vzwcOmMoomN7CX/EQ3JsHdoaPALap96xDobnuwKuJNiBA8ePDt4M3oeygD4vxA0AGmcTMAAFEZs1q6dWCt98GhaySDCf/no6MgRiHW2PMnl0yhG8ODBs4E30xaK/wIDEHQIvmtI62Q8A1A4sZG+vCBp/8mf3x8bGz0Bsc4HzzcAFCN48ODlX/znDEDd1wBrPSdI42S8OQCFExuZMDYs/fF4vP4b/OXIyMiLEOt88ZQBoBjBgwfPDvEfqKnnTXPi36dN/L2T2VlUsZFz/3TECRu/llv9LzvmmCOXIdb546k5ABQjePDg5ZkXvPpvuBBQ0ADoOJlG2wG7LDbSp2ukD/aG6L/fyJ2SVxx55OE9iHV+eeotAIoRPHjw8swLM4dvgQHQuELdqUUWG+mDi+v03e+k70/fuvXQZYi1FY91dlCM4MGDZzuvKckBoxw8igFwUWykPzZKP+yrvOIX4X/ZqlUHLkZc7eHFMQAUI3jw4OWN12RC/KMYAMd3kbvU26znl15/tCCu9vGiGgCKETx48PLIazIh/mENgOtiI1f7h0h7vvznIsTVXl4UA0AxggcPXl55TaYO3sgAIDbwbOGFNQAUI3jw4OWZ12Tq4PUMAGIDzyZeGANAMYIHD17eeU2mDl7LACA28GzjNTIAFCN48ODZwGsydfBqBgCxgWcjr54BoBjBgwfPFl6TqYNXGgDEBp7Fb3PsoHjAgwfPZl4kA5D04EEDgNjAs5lXzQBQjODBg2eT+Ic2AGkc3DcAiA0823mVBoBiBC8l3mPSbo/ahHGHbBwWaAN3xOHM5xEPV3kzS/6HNAD+esJJD64MAGIDzwVe0ABQjOClyDsvL+NDvtcPiIer4h/SAKhdhIIGIOHBdyI28Fzg+QaAYgQvTZ4U5u15GR+y5fXfEl9XxT+EAVC/VLmncJKDyy53pyM28Fzgqd0AKUbwUubdkKfxMTm5bky+0+PE10Xx768/B2BG/PtTE3/1eXGUZyA28FzglUqlnRQjeCnzzsnb+JDv9DXi6wJvRs9DGQD/F4IGII2TCRgAxAae1TzJ5dMoRvDS5EnNXZu38aHmbRFf+3kzbaH4LzAAQYfgu4a0TsYzAIgNPOt5vgGgGMFLiXdtHsfHihUrumXn0oeIr+3iP2cA6r4GWOs5QRon480BQGzgWc9TBoBiBC9F3ll5HR9yF+BC4mu7+A/U1POmOfHv0yb+3snsRGzgucBTcwAoRvBS4u2RK+1VeR0fcgfgJOJrJy949d9wIaCgAdBxMo22A0Zs4NnCU28BUIzgpbRL6hU5Hx9tYgLuJr728cLM4VtgAHSdTFQDgNjAyysvzHbAFCN4IXdJPS3v40O+5wXE101eU5IDRjl4FAOA2MDLMy+OAaAYwatsaoJdb2/vfnkfH/Jdjya+bvKaTIh/FAOA2MDLOy+qAaAYwatx9X+hJeOjWb7v74ive7wmE+If1gAgNvBs4EUxABQjeHXuAJxky/iQnH8P8XWP12Tq4I0MAGIDzxZeWANAMYJXR/zvklRqtWV8SM5vIr7u8ZpMHbyeAUBs4NnEC2MAKEbwGrTzbBsfstXwL4ivW7wmUwevZQAQG3i28RoZAIoRvBCbs2y3bXzI+hdvJ75u8ZoMTng5FbGB5wKvngGgGMEL0W6wcXysW7d2g5zvPuLrDq/J1MErDQBiA89WXi0DQDGCF7KdY+v4kLkL3yW+bvAiGYCkBw8aAMQGns28agaAYgQvbJNn6estXgTrTOLrhviHNgBpHNw3AIgNPNt5lQaAYgQvQrvW5vEhcxd65RweI7728maW/A9pAPz1hJMeXBkAxAaeC7ygAaAYwYvSZFfUNzqwDsalxNdm8Q9pANQuQkEDkPDgOxEbeC7wfANAMYIXkbdn3bo1a2wfHyIgLyC+Not/CAOgfqlyT+GEzvd0xMY4r0WeNy6h/9Llqd0AKUbwYvCudGF8yPl0SvsT8bVV/PvrzwGYEf/+1MRffX54uHQGYmOU1yp9f7G078h+4930X3o8eR96J8UIXlSe5M2ZrowPOa/PEl9beDN6HsoA+L8QNABpnEzAACA2mnmTk5OL5XWdLwfmX1zT09OzlP5Lhye5fBrFCF4UntTUhzdu3DDo0KuwTyO+dvBm2kLxX2AAgg7Bdw1pnYxnABAbzbzx8fF26fupKvH4webNm4bov+Q83wBQjOCF5w2WHRsfLXKOdxBfG8R/zgDUfQ2w1nOCNE7GmwOA2Gjkqef94syvqBUPienPDj54wyj9l4ynDADFCF60+ld6noNvw3yE+Nog/gM19bxpTvz7tIm/dzI7ERt9PLnl3yV9/O0QVyK/WL9+7Rj9F5+n5gBQjOCF5UltvXvVqgMXuzY+Vq5ceQTxzS8vePXfcCGgoAHQcTKNtgNGbOLz1PN9MQBXR4jH/yxfvryP/ovHU28BUIzgheVJTT3f1fEh53gj+ZJPXpg5fAsMgK6TiWoAEJtwvOHh4QPU8/0Y8fi1/H2QeETnhdkOmGIEz+f5O/+5OD7k0e57yRd7ecoA7EljTeFGB5dB8DLEJl2eWpZTrvz/K0Ey/FY+P0I8ovHiGACKUWF5N7g8PiYmxreSL/by1LPjh3SLv3fF+WbEP9Vn/iulX/87aTII5yZZJ2A18QjPi2oAKEaF5p3j+vhQk4vJFzt5qpjdaujgFyP+6fDU83v1HD+tZFA5IIN4LfEIvRb6DooHvJB3PtcWYE7M68kXO3mqmP3M0MHvkBxahPgn46nn9ur5vYZkuF3uBhxEPBrzwhoAilHhedeazmcZw382PT7kzaIBOde95It9vKYai8boOvjxiH+i2/4j6rm9rmQQ/l3yuU3Eoz4vjAGgGMGTdpbhfG7xjnui6fEhx7ySfLGPp4rZuaYOLgLzdcQ/9iI/49J/N+tOLjnGPWNjY08gHrV5jQwAxQiemlwtc2tWmcxnycuL/O9nenzIcf+KfLGPp5LmTJMHl+OdgPhH3nhjXa25GpqS6/6RkeGnEI/oBoBiBM+rc1eYzufg9zM9PtTryHLx8Cj5YhdvdjUnUweXJLlF/lyO+Ie+7b9BPZ/PILn+NDo68lTiEd4AUIzgBQzAaSbzefXq0dbg91u9euyJpseH1KpLyBd7eNMGQG0eY9q5qVXrtm49dCXi3/A9/0PUc/kMk+tBOf6TiUdjA0Axgheobw/19vbuZzKfh4YGL6z8ftwZg9fQAHjO7WrzJzN4zaZNB48g/jUH01aJyx+zTi75Dg/XmrxZ1AmdlYWOYgSv4ur/QtP5XO37mR4f8higQ457P/mSb97Mkv8BAyAJ+9ZGuwpp2iLzZtlZ7STEf8GV//ZqAymr5FJ3iKSdhPgvNAAUI3hVxstJJvP52GOPPqDa95PHu2MZmONPkS95F/8KAyD/sLn6wfvnGQBdJyNJs0v+PArxnx5AT5S++FMOk+sxaScXXfyDBoBiBK/aq7SSIq0m81kupD5T4/vtMT0+REueQr7kXfwrDIBX1K6v/OXKPYUNnIx6x/2j6s0EGUhPl3ZstSb//8lyu+lEman+dL+pv6t/r/H7k5Zc+T+l1tLMOUmux+U7Pt8WsVbGVvWpnNvxo6OjzxwbG32W39Tf1b+r/x+jnU0xglejnWd6fNT7fhmY7UVy3NvIlzyLf//C/JC/vGO++PebFn+dz+QusuDK/wQR/0csSK49wRnOOb9S/ybFA55JXuXOfybGR4Pvt9z0xY98n/PIlzzxZvS8kQEoqeUc/V8IGgDbO6eWAcjRe/7PUkt4WpRcatnPv8r7bf++vlXfonjAM8i7wXR9kdn//9LgO/3W9MWPLCR2LPmSH95MWyj+C+4QqWfx8w1AvxOdU80A5OjK/xTv+bptybVvaGjotXl+5i/n9x2KBzyDvHNM15fQr3oZrn+iIdeTL3kR/zkDUDM3JGgtMpnkidVuE9jeOZUGIEdX/i9Wt9RtTtZSqfT3eZ3wJ9/vOxQPeKZ4/s5/JutLmO8ldX2J6fonx3w3+ZIX8R+oqed+AJuVAZDWpjZ1cEn8Kw1Ajib8vbTWDlq2JWupNPS2PM729w0AxQOeAd61GYj/B0J+t++Yrn9yYbCGfMmWF7z6r3t3yAvitAGQDxylbu+61Dm+AcjRbf8za/Wxrckq5/S2vL3qpwwAxQOeId5ZputL1BXfMvh+PyRfsuOFmcNXaQBa1d0AmZD2OZc6RxmAHN32f5XDyfrOPL3nr+YAUDzgGeCpx3j9GWzBG/o7Dg0NtGXw/V5NvuSbV2kAmtXfly9fLv+v7z6HOufinGzs87cFSK735WWRH/UWAIMdnn7eqm+Yri9yUfOP0QzA4IWm65+sRHhgrTlO5F8+eLNzAKpcqb7coc75Ug5u+7+1QGuhfzgP6y746wAw2OHp5MkcmFeYri9xzjeL+qe2RSZf8strtJDKpW50zuCXMr7tf04Bk+ujcurNWb59EccAUDzgRZv53/fwxo0bBk3Xlzjnm0X9kzH4EvIlv7wGC6n0LZfb1jfb3zmzBiAL8X9vUZNLbQyilgbNagJmVANA8YAX4+KinIH4nx3nfGXdjveZrn9qW2RLVjgtJC/McqpqW9pH7e6caQOQxW3/Dxc9WdWE0iwmIEU1ABQPeHF4spvp801fXCQ53yxe1ZXjfpF8yScvVAJIEX9e8LU1CzvnS4bFv1ndAidZZxciuWTbtsN6TV8phTUAFA94cXiylsfdXl4bvbhIcr5ZvKorx302+ZJPXoR11Wde6bC0cy42KP5qgY5Pk1yVi1L0Tx1zzPYVhicgfZPBDk8XT26pfzyDZ+pvSXK+8vlXmH5Vd3JycrFcRP6R/MsfL1KyymzXd1i6SM1FhsS/pd4aCkVPVrkT8PW1a9d0GiyW32Sww9PFk01vjstgTlHi881inQ4Zix8n//LFC20Agsmg1n6Xg++zqXOiGoCYya+WUf53kquhGbuicm1yjXMwvkk84OkxswM3ZrH8dRrnm8U6HcPDwyeSf/kS/1AGwEuG7mAyyMSXl1WbGJjXzoliAOIkv7rFJcfYTXKF5n1b8qdLd7GsZQCIB7ykPHn+/84MxP8NaZyvfPdnmF6n49hjjz5Ajnsr+ZeHV1fVZn8hDIAXvK6KhJhOBlnl6Qgp4r+3oXPCGoA4yS/OtkOO8VWSKxpPcufqnp6epTqvRKoZAOIBLw2ev/Of4dn06a4AZ3iRLnmEfC75lwfxD2EAvB0CO72r/6XVkkGK+EqBfC3vnRPGAMScjdsp7G+QXLF5PxADdYCuYlRpAIgHvJR412Y0m17bCnAm1ukYH199FPmXB/FvYAA88e/wrv59A1ArGZql0L5SYA/ktXMaGYA4yb9ixYpuYV9FciXjiYn8sSRkr45iFDQAxANeiryzMhD/V6e8SNfWLFbolGP/gvzLWvz7a98J8sS/XdqSgAHoDrG//VCtSXA5WJv+ojQH57Jly/YX5n+SXKkVo59JW5F2MfINAPGAlyJvj5j/VaZfpdO1CEwGy3O/mfwzzeufbg0NgCf+bd7Vv28AuiLedn2Cer6bp86pZQDiJL+8BbFMmD8iuVLnqSuDVLdUVbsBEg94KU8ovsK0+AcNQJrnm8Xy3KINo+SfWd5MWyj+1QxAq7TFAQPQGTcZ5KDHy8G+lYfOqWYAYj7zV3sj/ITk0nab6vqDDppcn1Yxku/zHeIBL+UJxaeZFn/vEWvq57t69dimLHZJrXf3lPzTIf5zBqDmXBAJVIt39e8bgI40kmHNmoktM7M/+2/LqnMqDUCcwentbX0dyaV946YbZbGgDWkUI+F9h3jAS4sn5v8htbmN6ffodZ5vFrukSj/+DflnUvwHqor/rAHwbv0HDYCaA9CcZjKsXj3aqh4PeLvj/XdwbwEDz5gvSjI4ZcnPfknaX5FcZngyQ/UW+ffxpPnnGwDiAS+lt4kuzGIRHZ3nm9EWwSvkezxO/ulefn3u6r/u2yBeEH0D0Ja2+FdLBvUsXRLhRPkSfy9/fl7+/J40dZfgsbQ7xzcAcZJVTW6Uz19PcpnlqTUmpO/XJMk/ZQCIB7y0eJKTJ5kWf6mT/0fn+U5OrhvLaEXDr5J/enm+AWj4OmjAALSaEP9GP+oVO7nqXjk5uX6ttEm/rV+/bp0MiJKc1GCUJj89cb6fN2HlRpIrM94fxHxNxs2/TZs2ltTEQjVrO2pTn1u7dmJ83bo1a/ym/q7+XdrLiW/hxP8uSbNW0yvo6T5fOa+bsqj38n1eTP5lz6s0AJmLf1540nkTMjhuIbky590p/29jnvJFTMkO4ls43nlZ5J+J882iPqulwNWcCvIvW97sHICmmD8uir8U+PXe4wiSKwc8KRT3yJ+H5SVfohoA4ms/Tx5HbTedf3Kz80xD59uZRX2WcfQF8i9bXlOSHxfFX2b7HywdcwfJlTvefWIEtuUhX6IYAOLrBO+GLOqVwbcbvptFfZZx9AzyL1se4j9/wt9mGQx3k1y55anlpo/OOl/CGgDi6wzvnCzqlcnzzaI+b9166DKpuXeTf9nxEP+5Z1KHS7uX5Mo970ER4L/IMl/CGADi6w6vcuc/E/VKbblu8nzla7RkUZ9lsvcnyL/seIj/3KzUk8UA/GVlk2L/0qGhwb+WxYxe6Tf1d/Xv1X6/yuevKGpyybn/NGn/VY/H0EvU/uIZzhHZQfEoDO/aLOpVBsulfz6L+jw2Nvo08i87HuKvmScD60NFTS5Z0OcyF+NbzwBQjJzbqOo1WeRfHiaEmThfMfL7y7F/R/5lw0OsNfOCBqBoySXrL1zuYnxrGQCKkXO82Z3/TOZfnNdM054QZvh8303+meeFNgCIf6JXXT5U1GSVW/2XuxjfagWaYuQez9/5z3T+ZXi+78nifOXR3kHkn3nxD2UAvOB1I/6xN/L4cFGTNWAAXHuss4NiVIg5LKdlkX9Z9l+Gr9b+jPwztuuqejzb2AB4weuqCCDiH4Ent8HPL2qyegbAxcc6OyhGbvPUKnVSJPfPQPyflWX/ZTXe5Nh/R/6ZEv8QBsDbIbDTu/pfivjH44kBuKCoyerNAXDxsc4OipHzvIuyyL+s+0/e0nltFuNNjl9qtEMs+ZyW+DcwAJ74d3hX/74BQPxj8HwDUMRkVW8BOPpY5xSKkds8WYb3eRldCWfefxm+in0V+WdC/PtrzwHwxL9d2pKAAehG/OPxlAEocLJOuRhfEYedFCOXi2Xf3Vu2bF6ewQqTJ+ah/zJ8u+YV5J8OXv90a2gAPPFv867+fQPQhfjH56k5AAVO1ikX4yurtJ1GMXL57ZWhj2d0Gzwnd+76T85ivKlt2+U7PUY+p8ubaQvFv5oBaJW2OGAAOhH/ZDz1FkCBk3XKxfj6BoBi5CZv9eqx47PIvzz1X4YTbC8ln9MW/zkDUPM1QAlUi3f17xuADsQ/Oa9yJcCCJeuUi/FVBoBi5Cpv8MaMxP/4PPVfVuNNROr55HPa4j9QVfxn4+zd+g8aADUHoBnxT86LYwAcStYpF+Or5gBQjNzkySz492Y0AS5X/SeCcWQW4218fHWXfJ8/kc/JecGr/7oLAXlB9A1AG+KfHi+qAXAsWaccfaxzCsXITd7ExPhhWeRfHvsvq/EmczAuIp+T83wD0HAlwIABaEX80+VFMQAOJuuUo491dlCMnFy34idZ5J8sOnRsHvsvq/E2OjryHPLZDK/SACD+6b/a86ECJ+uUo491dlA8nOS9lvqXPe/IIw/vkZjcST7r583OAWiK+UPy1+eFMQAOJ+uUo491dlA8nOPN7vxH/cvFY7aPkM/mt4AmWVPmNTIAjifrlKOPdXZQPNzi+Tv/Uf/ywZPHItvIZ7NbQJOsGnj1DEABknXK0cc6OygebvHUzn/Uq3zxJC6/IZ/18hB/zbxaBqAgyTrl6GOdHRQPd3hq57/e3t79qFf54klsziaf9fJIVs28agagQMk65ehjnR0UD3d4Es8LqVf540ls1pHPenkkq2ZepQEoUnKp3QAdfayzg+LhDk/uAJxEvconT2LzY/JZH49k1cwLGoCiJZe8V325o491dlA8nBH/uySkbdSr3Jrt15LPenihDQDJGp/nG4Bi7qo2zwC49FhnB8XIGd551Kv88mRVwH6J0V7yOX3xD2UAvOB1k6zxeGo3wKIma8AAuPZYZwfFyA2erHm/nXqVb57E6Vvkc3q8mW2BQxgAL3hdFQEkWSPw5Db4+UVNVs8AuPhYZwfFyAneDdSr/PMkTn9FPqcp/iEMgLdDYKd39b+UZI3HEwNwQYHXVr/c0cc6OyhGTvDOoV7ln7ds2bL9Za7Go+RzWuLfwAB44t/hXf37BoBkjcHzDUARk1W9BeDoY51TKEb286QQrqVeWXMndTf5nJb499eeA+CJf7u0JQED0E2yxuMpA1DgZJ1yMb6lUmknxch63rXUK3t4w8PDO8nnuLz+6dbQAHji3+Zd/fsGoItkjc9TcwAKnKxTbhaj0mlp9p8MyEcpbmZ58hjnNdQre3jbtx+xUuJ7P/kcnTfTFop/NQPQKm1xwAB0kqzJeOotgAIn65SL8R0ZGd4hxu5mOeeb5Rx/F7epz89wBj8qrzt9nuJmjLdg5z/qlQ0XUwOfJZ/jiP+cAaj5GqB0cIt39e8bgA6SNTkvzHbADifrFPkSjnf00UccIP31BYqbfl7lzn/knx08ifFx5HMc8R+oKv6zBsC79R80AGoOQDPJmpwXxwA4lKxT5EskXov02b9T3PTygjv/kX9W8dQF1a3kczhe8Oq/7kJAXqf7BqAN8U+PF9UAOJasU+RLZF6b5MxuipseXnDnP/LPyi2CP0A+h+P5BqDhSoABA9CK+KfLi2IAHEzWKfIlOm9ycnKx9N1XKW7p8/yd/8g/a7cIPox8To9XaQAQ/5R5YQ2Ao8k6Rb7E48lrTx2SO9+guKXLUzv/kX928ySGvyKf0+HNzgFoivlDstbnhTEADifrFPkSnyf91yntKopbauJ/14oVve3kn908qalvI5/T4TUl+SFZQyXrhwqcrFPkSzKevK7WLTl0DcUtOU9mQp9P/tnPkzGxmnxOh4f4a+bVMwAFSNYp8iU5r6enR60n8UOKWzLe2NjYceSfGzyJ5w8Q/+Q8xF8zr5YBKEiyTpEv6fA2bdpYkivYn1Hc4jVh3JhhfFvUnI5abe3aNZ3btm1ZccQRWw/0m/q7+vd6n8uSt337tuUZbxH8KsQ/OY/iq5lXzQAUKFmnyJe6E0RPicI7+OANo7Jq4C8obtF5pdLQe7PKF/kOFzsYj70yp2JlVuNt5cqVB6oVHRH/ZDzEWjOv0gAU65lr32XkS22e9NGdUkT/Mgpv/fq1Y/K5/6G4ReOtWTOxJYt8EcO2RL7Hg47G4/Qsx9uqVQdegfgn4yHWmnlBA1C8266Dl5MvtXki/nerKylpL4zCW758eZ/k1a8pbmF5gz/JcA7QcxyOx9eyHG9yV+cViH+ffgOA+Mfn+QagiMV3aGieASBfqhsA1V+PS548NwpP+ndQPvdbiltjngjFmzKcA/QFV+Mh+fvnZcuW7Z/VeNu4ccOgzIt5BPHXaAC8zu5G/OPx1G6ARS2+AQNAvtQ3AKo9JsXsmVF48vkRaTdR3Ory9qxdOzGeRXzVBDr5Pg84Ho8XZznepMZcgvhHfh1WPZ5tbAC8zu6qCCDFPAJPbj+eX9Ti6xkA8iWcAZi+ohLReE4Unnonut4GKTwjHbgyw1fVnlWAeHwpy/EmW3O/APGPKv4hDIC3Q2Cnd/W/FPGPxxMDcEFRi683B4B8CWkAvG07HxkbG31mFJ58Zq18/nbEvyrvJRm+qvZZ1+OhNldSEx2zGm+bNx/SId/hj4h/FPFvYAA88e/wrv59A4D4x+D5BqCIxVe9BUC+hDMAwf6TAfrw6OjIUyOaiYPUUreI/xwvuPOf6fh6GzrdV5B4nJzleJM4fwzxjyL+/bXnAHjir9bLXhIwAN2IfzyeMgAFfkY1Rb40NgA1+u8Bedf5iCg8GdiHqKshxH9g3s5/GZm7kwokNp/NcrxJnJ+I+Nfj9U+3hgbAE/827+rfNwBdiH98npoDUOBnVFPkS30D0KD/7pPitiXK95PHB08Uzv28GjWz819W8ZXj/2tRxEb6+V455bYMx1uzfIebEf/qvJm2UPyrGYBWaYsDBqAT8U/GU28BFHiCyhT5Upsnj0juCfGqlbqi3xTl+61ePXac8B4suPjfpUQpo/i2Fe1OjAjLCRkvqvVexL+W+M8ZgJqvAUrHtnhX/74B6ED8k/PCbAfscLJOkS+1eTIg7wkTDyVm6hl/lO+n5hCoZ+AFNp/nZRVfOfaJBRSbT2U53pRJRvxrif9AVfGfNQDerf+gAVBzAJoR/+S8OAbAoWSdIl9q83wDEDIet6vZ/lG+n/z+X4gJeKSI+Sfnvj2r+Mp3+kzx5mAM3nHMMUcuy3K8yXf5OeI/xwte/dddCMjrdN8AtCH+qU5Q+VCBJ6hMkS+1ecoARImHet9fvfcf5fvJ59SdgEcLln83ZBXfrVsPXRb2zo5r8ZD5JydkvEXwmxD/+axGvEoD0Ir4p8uLYgAcTNYp8qU2T80BiDHh6ibJqeGIKwaqGemPFSj/zskqvvLo5dkFnoB5XsbraozI99qH+IfnVRoAxD9lXlgD4GiyTpEvtXmVCwFFaDesX79uXZTv521K83gR8q/aoxJT8ZXv9a8FFpvfZT3eJM+vQfzD82bnADTF/KGY1+eFMQAOJ+sU+VKbF9cAeJN6rl+3bs2aiCsGvsDfQ93h/Ls2q/geeeThPfIs/K6Ci81hWY43Of7fIP7heU1JfijmjXnSyWd7y7RWbRKwO9QEmrk2cEe932/Ucsb7LPlSdwWzu5MN9sFfTU6uG4vy/cSQnuZtQexkcZPze01W8ZV16Z9RdLGR/n9XluPtoIPWj8r3ehzx12wAKObw4CXjRTUA1Qa7FNyfiRHoiXiV9HL1rNTB4rZHJkmuyiq+svnVJ4suNpLTv8x6vEkcvo74azQAFHN48JLzohiABoP92jD7sge/39DQ0GtdK25ihq7IKr5HH33EAdU2ZCqi2Egc1mc53uROzMsRf00GgGIOD146vLAGIORg/36YjW+C369UGnqTS8VNPd7IKr5y/CchNrNxeEuW423z5o2r5Hs8SDxSNgAUc3jw0uOFMQBRBrvwviutK8r3ExPwdheKW7Wd/0zGV77DPyM2s7H4r6zHm5iQzxOPFA0AxTwd3po1ExvlFtVzVRseHlavZp0oyfq0qE19Tn3eZ8Gzjyf/734Ng/3KqPuzy3d5u+3FrXLnP8P1oFm+w22IzTwTMJJlfZZ8OJF4pGQAEP/0eBs3bhiU17G+zzMqeBqL79fHx8fbo+SzFMx329x/wZ3/TNcDOf7R5N8CQ/bajOtzq9pDg3gkNABeZ3cj/unxNm3a0Kdu1yJe8DTyvtIUcYtW+cz7LRX/2Z3/WO47N1sEX511fVYbQhGPqgtlSQthALzO7qrocMQ/BZ56VisB+DbiBU/fFq19l6i16SOuGPgRC8/3vAzrgdqL/hbyb0FTa030Z7xF8FHEo5r4hzAA3g6Bnd7V/1LEP32eBKBT2rcoHvA07tJWVivURchnJWgfs+l81c5/WdUDOfaR5F/1Jq+anpVxfVZzM24kHpXi38AAeOLf4V39+wYA8dfAUxO21PvLFA94unhSiC9U76lHyGdVOD9tyfnekPFt5veTfzV5V2Zdn9XKhMSjUvz7a88B8MS/XdqSgAHoRqz18WS2eIdcdV1O8YCnkfcJJewRUnn2Vap8P+bof2fGr3LeRP7V5D22efOm4Szrs+TwJPHon24NDYAn/m3e1b9vALoQa/08NWtbAnIZyQpPI++8KPk8NDTQJneoduX5fMU8v1L2oX+a30ZHR4+XYvcEb2Z+pKY+pz4flifispP8q8+TZXnPMRWPWi04R6OI8ZhpC8W/mgFolbY4YAA6EWtzvMnJycVSVC6leMDTyPtAlHzesmXzcmF9lf6DB89W8Z8zADVfA5TB3uJd/fsGoAOxNs/zTMAukh+exrXa3x0ln485ZvsKuRNwBf0HD56N4j9QVfxnDYB36z9oANQcgGbEOhveYYcd0iO3zi4l+eFp3Djn7VHyee3aNZ3ymW/Qf/Dg2cELXv3XXQjIG/S+AWhD/LPnbdt2WK+YgC+T/PA08t4YccU79drqVfQfPHj55/kGoOFKgAED0Ir454d3xBFbl0mQLiL54eniyVX9a6Lk84oVK7rlM9fQf/Dg2c+rNACIf/54LTKL9XMkKzxdPBH0/xMln3t6etT2tz+k/+DBs5s3OwegKeYPYm2Ep7Yb/TeSH54m3r7h4dL/FyWfS6XSMrXtK/0HD569vKYkP4i1UZ5amOVTJD88Tby9IupnRslnmVncK4zr6D948OzkIf528ZrFBHyc5IenibdH2gui5LHcBVgp7Zf0Hzx49vEQf/t4ap32j5L88DTxHheT+Zwo+TwyMjIorxrdQP/Bg2cXD3G1k6dMwHkkPzxNvMfkqv6kKPm8fv26g2SxoN/Rf/Dg2cNDXC3mSQDPJfnh6eCJAXhU/nxqlHxes2biYNlm9Bb6Dx48O3iIq+U82er1PJIfng6emICHpT0pSj7L44MJabfSf/Dg5ZsX2gAg1vnmlUpD55L88DTxHlQ7qkXJZ3k7YK185nb6Dx68/Ip/KAPgDfZuxDrfPAnmP5L88DTxHpA7Adui5LP8/kHS7qL/4MHLF29mW+AQBsAb7F0VAx6xzilPAvpOkh+eDp6I+b3y2S1R8lkKzSHyuT/Sf/Dg5Un8QxgAb4fATu/qfylibQdPgvoPJD88PcWj748y0e+oKPks8wG2yGfvo//gwcuL+DcwAJ74d3hX/74BQKwt4UnRfRvJD08Pb/Cu8fHV2yKuGHikMP5E/8GDlwfx7689B8AT/3ZpSwIGoBtxtYsnwX0TyQ9PB0/a7fL2ydqIr6weI48DHqL/4MEzzeufbg0NgCf+bd7Vv28AuhBXO3kS4L8j+eHp4ImY37Jy5cqxKPksnz1OPvsI/QcPnjneTFso/tUMQKu0xQED0Im42s2TxwGvZzDB08T7nbRSlHweGRl+rhShR+k/ePBMif+cAaj5GqAMzhbv6t83AB2Iqxs8CfxrGEzwNPF+I/MCBqLk8+jo6AuE9xj9Bw+eCfEfqCr+swbAu/UfNABqDkAz4uoOT/Z7fwODCZ6mFQN/tWLFilUR163YoTYeov/gwdPDC179110IyBukvgFoQ/ydXTHwdZIQ+xhM8DTwfi5tecR1K14obQ/9Bw9e+jzfADRcCTBgAFoRf+dXDDxT2j4GE7y0eXKb8aVR81nmqJwmn91L/8GDZ55XaQAQ/2KsGPjyqCaAwQSvXhMhf0vcfJbP/xPxgAfPPG92DkBTzB/E1U6eulrjygteSrxz4uaz5OH2ykWCiAc8eGZ4TUl+EFfrVwxsePuVwQSvQXtv3PyTyYOHy+fvJx7w4GXDQ/xZMfDFtSZiMZjgNbjt/6EEV/6b1QZDxAMevOx4iD88VYxfUGkCGEzwGrQL4uafrCB4sIj/3cQDHrxseYghPP9xwCn+e9kMJngNrvw/JSnTHPOx03ph3EE84MHLnocYwgs+DniuWqGNwQSvzqI/n5NUWRQn/+RYE8K4jXjAg5cPHmIIr2Kt9pEXySOBPzOY4FVpX5RUaYl5239MbSBEPODBywcvtAFAXIvFk2WDny/J8WcGE7zAbf9dkiqtMd/zL3kbBxEPePByIv6hDIA32LsR18KtGHiSXLE9ymCCJ+2yycnJxXHyT20UpDYMIh7w4OWDN7MtcAgD4A32rooBj7gWZ8XAp4oJeITBVOgr/28MDw93xMk/tUGQ2iiIeMCDlyfxD2EAvB0CO72r/6WIazF5kiTHSRF/mMFUSN5V0jpj3vZf7m0QRDzgwcuV+DcwAJ74d3hX/74BQFwLyhMD8GRpDzGYCnXlf41cwXfHvO3fI5//KfGABy+P4t9few6AJ/7t0pYEDEA3YlhsnhiAYyVhHmQwFYL3w56enqVx8mXZsmX7y+evJR7w4OWF1z/dGhoAT/zbvKt/3wB0IYbwvNu6x1Ru3MLgdO49//8qlUrL4uRLb2/vfsL4HvGABy8/vJm2UPyrGYBWaYsDBqATMYRXYQKOkvYAg9NJ3nVSIHpjPibqkvZd4gEPXt7Ef84A1HwNUAZ2i3f17xuADsQQXvVnvANHSVI9wOB06sr/l9JWxnzmv0QYVxIPePDyKP4DVcV/1gB4t/6DBkDNAWhGDOHV4o2OjjxZEvV+BqcTE/6uHxoa6o+TL+Pj4+1iHL5OPODByxcvePVfdyEgb9D7BqAN8YcXhjc2NnasvE5yL4PTat6NcnUwFDNf2uTzXyEe8ODlj+cbgIYrAQYMQCviDy8KTxJsi1wB3sPgtPK2/83SRmPmS6t89hLiAQ+evbxKA4D4w4vMkyvIQxrt787gzB3vNnl2Px4zX1rkscFFxAMePLt5s3MAmmL+IIbw1I8k3EYxAXcxOK3g3SECvj5mviySz3+GeMCDZz+vKckPYgiv4lWwDUpcGJy5vu1/t2zNe3DMfGkW4/BJ4gEPnhs8xB9eqjwRiElJrNsZnLkU/3vlcc3muPEVxvnEAx48d3iIPzwdKwauU8+YGZy54t0vBuDwuPEVY/ch4gEPnls8xAueFp5caa4R0biVwZkLnlq++agE4v9/iQc8eO7xEC942niypvwaWSfgVgZnprf9H1YbOSW47X828YAHz00e4gVPK29iYnyT3A24hcGZifg/Kn8el+DK/83EAx48N3mhDQBiCC8Jb82aiYMlYW9icBoV/z9Le3oC8X898YAHz13xD2UAvOLRjRjCS7hi4Kgk3G8ZnEZ4j0t7doLb/q8iHvDgucmb2RY4hAHwikdXRQFBDOHFXTFwSK5Kf+K9JhiqScLfISvWBdrAHVE+n3PePg2DfY/08fMSXPmfSbGEB89l8Q9hALwdAju9q/+liCE8eOnyKpdPTmGw7xUBPzXu95PC8LJqpoTiCw+eS+LfwAB44t/hXf37BoBiDg9eirygAUhhsO9TAp7gyv9UZSAolvDguS7+/bXnAHji3y5tScAAdFPM4cFLl+cbgDQGuwj4X8f9fuqRgXp0QLGEB89FXv90a2gAPPFv867+fQPQRTGHBy99njIAKQ32sxJM+Hu2N2mQYgkPnoO8mbZQ/KsZgFZpiwMGoJNiDg+eHp48h7snhcH+dwmu/J+uXhekWMKD57L4zxmAmq8BSqFo8a7+fQPQQTGHB08fTwbkPQlv+78twZX/8d5CQRRLePCcFv+BquI/awC8W/9BA6DmADRTzOHB08fzDUBM8X9Xgiv/J6klgimW8OC5ywte/dddCMgrIr4BaEP84cHTz1MGIOZg/6cEV/5HS3uQYgkPnts83wA0XAkwYABaEX948Mzw1ByAGFf+5ya48t8mjAcolvDgwatmABB/ePAM8SoXAgqxvv/HBNcc88r/UPn8vRRLePDgLZgD0BTzh2IOD148XkQD8K9xxV+KwUY51j0US3jw4MXaDphiDg9eurywBkBu+39Bfn1RzBX+JoVxJ8USHjx4qRkAijk8eMl4IQ1AWX61Neba/mvk83+gWMKDB6/a8uGIPzx4GfEaGQC5et8tv9YW5/utWLFitfB/T7GEBw9ejTlFj1LM4cHLiNfAAHxtcnJycczb/sPCvoliCQ8evDrtdoo5PHgZ8eoYgG8NDw93xJzwNyifv4HiBg8evAZ3AH5CMYcHLyNeNQMg//Yf8mdnzNv+q+Tz/0txgwcPXsj5RRRzePCy4FUxAN/r7e3dL+Zt/xXy+V9Q3ODBgxeurXpH2OLWTTGHBy9dXoUB+NGyZcv2j8MbHBzsEQPwM4obPHjwGrWZbYGn/3xamOLWVVGQKObw4KXA8w2AiPdPS6XSsjg8mStwgHB+THGDBw9eOPHvVzXn0aGhwe56xU2tOtbpXf0vpZjDg5cuzzMAP5e2PA6vp6dnqXz2BxQ3ePDghRV/zwB8veYKwJ74d3hX/74BoJjDg5ciTwbhNWriXswJf91iIK6muMGDBy+K+HsG4GX1xL9d2pKAAeimmMODly5PPbuP+cx/iQzqb1Pc4MGD15jXP90CBuA++feuWuLf5l39+wagi2IOD14+eOPj4+3i3q+guMGDBy8Mb6bNGQD59/fWKkhqzfHFAQPQSfGFBy8fPLUyoAzeyyhu8ODBCy/+cwZA/v1BeXS4slpBavGu/n0D0EHxhQcvN7xWGbhfprjBgwcvmvgP+OKvnv2/vdat/6ABaK85Q5BiDg+eaV6LDN4vUtzgwYMXlhe8+vfE/3q1xHitouQbgDbEHx683PAWyZX/5yhu8ODBi8LzDYD3//ZIO6peYWrx5gAg/vDg5YPXLK79UxQ3ePDgJeS9qVFxakH84cHLD08G7UcpbvDgwUvCk4uIi9TFRL0CFUv4Kebw4OnhyaA9l+IGDx68hOL/DfXqcJOOH4o5PHharvzfR3GDBw9eQt5X1aJhiD88ePaI/zspbvDgwUvCk4nDH5Ny0qpT/IN7BCxNYblgePAKzZPbdW8N+15v2u8Jw4MHz36eCP9D8s7/y5p0/QS2CO4OtKTLBcODV2ieDN43UNzgwYOXgPcd+e8J3eLfGdgjoCuF5YLhwSssTy3LKe2D9TfyWLioR7KNQeDBg+cKT+4c/lpqyPOadP4EtgheEmgdCV4dhAev0DwZ0MdLu7/eFp7+Tl6BtbwTbQkKDx48Z3jfExPwQiklLXFrVpTi1h7YI6Aj4XLB8OAVnifO/bUysB8Ps393GsUDHjx49vKkXvxZ/vtqmfD31rGx0YMS1quWUHc6A1sELw60toQHhwcPnvyUSqVl6k6ADO6/lj/PVu//9/f3fVoc/uflz4ukqT0AvqgW84jb1OcVx2/w4MHLNe9C+cxnpJ0v7R3S/mpoaHD7pk0bl6ZUr1pDGYDAL7cFWmsKB4cHDx48ePDgZcMLZQBaKlvCeQTw4MGDBw8evOx5zY3cwqJAa054cHjw4MGDBw9eTnj/PxD1GSWiTtAYAAAAAElFTkSuQmCC';
const openLinkButtonIcon = 'data:image/png;base64,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BAhUEhAAKlXDWggQIECAQJKAAJAEbRoCBAgQIFBJQACoVA1rIUCAAAECSQICQBK0aQgQIECAQCUBAaBSNayFAAECBAgkCQgASdCmIUCAAAEClQQEgErVsBYCBAgQIJAkIAAkQZuGAAECBAhUEhAAKlXDWggQIECAQJKAAJAEbRoCBAgQIFBJQACoVA1rIUCAAAECSQICQBK0aQgQIECAQCUBAaBSNayFAAECBAgkCQgASdCmIUCAAAEClQQEgErVsBYCBAgQIJAkIAAkQZuGAAECBAhUEhAAKlXDWggQIECAQJKAAJAEbRoCBAgQIFBJQACoVA1rIUCAAAECSQICQBK0aQgQIECAQCUBAaBSNayFAAECBAgkCQgASdCmIUCAAAEClQQEgErVsBYCBAgQIJAkIAAkQZuGAAECBAhUEhAAKlXDWggQIECAQJKAAJAEbRoCBAgQIFBJQACoVA1rIUCAAAECSQICQBK0aQgQIECAQCUBAaBSNayFAAECBAgkCQgASdCmIUCAAAEClQQEgErVsBYCBAgQIJAkIAAkQZuGAAECBAhUEhAAKlXDWggQIECAQJKAAJAEbRoCBAgQIFBJQACoVA1rIUCAAAECSQICQBK0aQgQIECAQCUBAaBSNayFAAECBAgkCQgASdCmIUCAAAEClQQEgErVsBYCBAgQIJAkIAAkQZuGAAECBAhUEhAAKpRMJ8AAAAlTSURBVFXDWggQIECAQJKAAJAEbRoCBAgQIFBJQACoVA1rIUCAAAECSQICQBK0aQgQIECAQCUBAaBSNayFAAECBAgkCQgASdCmIUCAAAEClQQEgErVsBYCBAgQIJAkIAAkQZuGAAECBAhUEhAAKlXDWggQIECAQJKAAJAEbRoCBAgQIFBJQACoVA1rIUCAAAECSQICQBK0aQgQIECAQCUBAaBSNayFAAECBAgkCQgASdCmIUCAAAEClQQEgErVsBYCBAgQIJAkIAAkQZuGAAECBAhUEhAAKlXDWggQIECAQJKAAJAEbRoCBAgQIFBJQACoVA1rIUCAAAECSQICQBK0aQgQIECAQCUBAaBSNayFAAECBAgkCQgASdCmIUCAAAEClQQEgErVsBYCBAgQIJAkIAAkQZuGAAECBAhUEhAAKlXDWggQIECAQJKAAJAEbRoCBAgQIFBJQACoVA1rIUCAAAECSQICQBK0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';
const cutButtonIcon = 'data:image/png;base64,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';
const pasteButtonIcon = 'data:image/png;base64,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an4d746fbc57ZeYJM/1nSo3Np79yOE9qesXmyW3eof++5p3S/kqmXrH5MRaH8zcA9MrNG/Xmj5/Mz+1/6e89z3f7894YH+6jV4/DtbyTeYbKvNGrIZ8Jv7d5xWt+7DVvgPr+v69578D8z/z3tjeP/3vicOkoNjZP0C38TXjpbfP4vycOl45iY54ApHPz+L8nDpeOYmOeAKRz8/i/Jw6XjmJjngCkc/P4vycOl45iY54ApHPz+L8nDpeOYmOeAKRz8/i/Jw6XjmJjngCkc/P4vycOl45iY54ApHPz+L8nDpeOYmOeAKRz8/i/Jw6XjmJjngCkc/P4vycOl45iY54ApHPz+L8nDpeOYmOeAKRz8/i/Jw6XjmJjngCkc/P4vycOl45iY54ApHPz+L8nDpeOYmOeAKRz8/i/Jw6XjmJjngCkc/P4vycOl45iY54ApHPz+L8nDpeOYmOeAKRz8/i/Jw6XjmJjngCkc/P4vycOl45iY54ApHPz+L8nDpeOYmOeAKRz8/i/Jw6XjmJjngCkc/P4vycOl45iY54ApHPz+L8nDpeOYmOeAKRz8/i/Jw6XjmJjngCkc/P4vycOl45iY54ApHPz+L8nDpeOYmOeAKRz8/i/Jw6XjmJjngCkc/P4vycOl45iY54ApHPz+L8nDpeOYmOeAKRz8/i/Jw6XjmJjngCkc/P4vycOl45iY54ApHPz+L8nDpeOYmOeAKRz8/i/Jw6XjmJjngCkc/P4vycOl45iY54ApHPz+L8nDpeOYmOeAKRz8/i/Jw6XjmJjngCkc/P4vycOl45iY54ApHPz+L8nDpeOYmOeAKRz8/i/Jw6XjmJjngCkc/P4vycOl45iY54ApHPz+L8nDpeOYmOeAKRz8/i/Jw6XjmJjngCkc/P4vycOl45iY54ApHPz+L8nDpeOYmOeAKRz8/i/Jw6XjmJjngCkc/P4vycOl45iY54ApHPz+L8nDpeOYmOeAKRz8/i/Jw6XjmJjngCkc/P4vycOl45iY54ApHPz+L8nDpeOYmOeAKRz8/i/Jw6XjmJjngCkc/P4vycOl45iY54ApHPz+L8nDpeOYmOeAKRz8/i/Jw6XjmJjngCkc/P4vycOl45iY54ApHPz+L8nDpeOYmOeAKRz8/i/Jw6XjmJjngCkc/P4vycOl45iY54ApHPz+L8nDpeOYmOeAKRz8/i/Jw6XjmJjngCkc/P4vycOl45iY54ApHPz+L8nDpeOYmOeAKRz8/i/Jw6XjmJjTU8Af776TNKb9fFVCwOAGukoNtY0AIBzGQDUSEexMQMAaGAAUCMdxcYMAKCBAUCNdBQbMwCABgYANdJRbMwAABoYANRIR7ExAwBoYABQIx3FxgwAoIEBQI10FBszAIAGBgA10lFszAAAGhgA1EhHsTEDAGhgAFAjHcXGDACggQFAjXQUGzMAgAYGADXSUWzMAAAaGADUSEexMQMAaGAAUCMdxcYMAKCBAUCNdBQbMwCABgYANdJRbMwAABoYANRIR7ExAwBoYABQIx3FxgwAoIEBQI10FBszAIAGBgA10lFszAAAGhgA1EhHsTEDAGhgAFAjHcXGDACggQFAjXQUGzMAgAYGADXSUWzMAAAaGADUSEexMQMAaGAAUCMdxcYMAKCBAUCNdBQbMwCABgYANdJRbMwAABoYANRIR7ExAwBoYABQIx3FxgwAoIEBQI10FBszAIAGBgA10lFszAAAGhgA1EhHsTEDAGhgAFAjHcXGDACggQFAjXQUGzMAgAYGADXSUWzMAAAaGADUSEexMQMAaGAAUCMdxcYMAKCBAUCNdBQbMwCABgYANdJRbMwAABoYANRIR7ExAwBoYABQIx3FxgwAoIEBQI10FBszAIAGBgA10lFszAAAGhgA1EhHsTEDAGhgAFAjHcXGDACggQFAjXQUGzMAgAYGADXSUWzMAAAaGADUSEexMQMAaGAAUCMdxcYMAKCBAUCNdBQbMwCABgYANdJRbMwAABoYANRIR7ExAwBoYABQIx3FxgwAoIEBQI10FBszAIAGBgA10lFszAAAGhgA1EhHsTEDAGhgAFAjHcXGDACggQFAjXQUGzMAgAYGADXSUWzMAAAaGADUSEexMQMAaGAAUCMdxcYMAKCBAUCNdBQbMwCABgYANdJRbMwAABoYANRIR7ExAwBoYABQIx3FxgwAoIEBQI10FBszAIAGBgA10lFszAAAGhgA1EhHsTEDAGhgAFAjHcXGDACggQFAjXQUGzMAgAYGADXSUWzMAAAaGADUSEexMQMAaGAAUCMdxcYMAKCBAUCNdBQbMwCABgYANdJRbMwAABoYANRIR7ExAwBoYABQIx3FxgwAoIEBQI10FBszAIAGBgA10lFszAAAGhgA1EhHsTEDAGhgAFAjHcXGDACggQFAjXQUGzMAgAYGADXSUWzMAAAaGADUSEexMQMAaGAAUCMdxcYMAKCBAUCNdBQbMwCABgYANdJRbMwAABoYANRIR7ExAwBoYABQIx3FxgwAoIEBQI10FBszAIAGBgA10lFszAAAGhgA1EhHsTEDAGhgAFAjHcXGDACggQFAjXQUGzMAgAYGADXSUWzMAAAaGADUSEexMQMAaGAAUCMdxcYMAKCBAUCNdBQbMwCABgYANdJRbMwAABoYANRIR7ExAwBoYABQIx3FxgwAoIEBQI10FBszAIAGBgA10lFszAAAGhgA1EhHsTEDAGhgAFAjHcXGDACggQFAjXQUGzMAgAYGADXSUWzMAAAaGADUSEexMQMAaGAAUCMdxcYMAKCBAUCNdBQbMwCABgYANdJRbMwAABoYANRIR7ExAwBoYABQIx3FxgwAoIEBQI10FBszAIAGBgA10lFszAAAGhgA1EhHsTEDAGhgAFAjHcXGDACggQFAjXQUGzMAgAYGADXSUWzMAAAaGADUSEexMQMAaGAAUCMdxcYMAKCBAUCNdBQbMwCABgYANdJRbMwAABoYANRIR7ExAwBoYABQIx3FxgwAoIEBQI10FBszAIAGBgA10lFszAAAGhgA1EhHsTEDAGhgAFAjHcXGDACggQFAjXQUGzMAgAYGADXSUWzMAAAaGADUSEexMQMAaGAAUCMdxcYMAKCBAUCNdBQbMwCABgYANdJRbMwAABoYANRIR7ExAwBoYABQIx3FxgwAoIEBQI10FBszAIAGBgA10lFszAAAGhgA1EhHsTEDAGhgAFAjHcXGDACggQFAjXQUGzMAgAYGADXSUWzMAAAaGADUSEexMQMAaGAAUCMdxcYMAKCBAUCNdBQbMwCABgYANdJRbMwAABoYANRIR7ExAwBoYABQIx3FxgwAoIEBQI10FBszAIAGBgA10lFszAAAGhgA1EhHsTEDAGhgAFAjHcXGDACggQFAjXQUGzMAgAYGADXSUWzMAAAaGADUSEexMQMAaGAAUCMdxcYMAKCBAUCNdBQbMwCABgYANdJRbMwAABoYANRIR7ExAwBoYABQIx3FxgwAoIEBQI10FBszAIAGBgA10lFszAAAGhgA1EhHsTEDAGhgAFAjHcXGDACggQFAjXQUGzMAgAYGADXSUWzMAAAaGADUSEexMQMAaGAAUCMdxcYMAKCBAUCNdBQbMwCABgYANdJRbMwAABoYANRIR7ExAwBoYABQIx3FxgwAoIEBQI10FBszAIAGBgA10lFszAAAGhgA1EhHsTEDAGhgAFAjHcXGDACggQFAjXQUGzMAgAYGADXSUWzMAAAaGADUSEexMQMAaGAAUCMdxcYMAKCBAUCNdBQbMwCABgYANdJRbMwAABoYANRIR7ExAwBoYABQIx3FxgwAoIEBQI10FBszAIAGBgA10lFszAAAGhgA1EhHsTEDAGhgAFAjHcXGDACggQFAjXQUGzMAgAYGADXSUWzMAAAaGADUSEexMQMAaGAAUCMdxcYMAKCBAUCNdBQbMwCABgYANdJRbMwAABoYANRIR7ExAwBoYABQIx3FxgwAoIEBQI10FBszAIAGBgA10lFszAAAGhgA1EhHsTEDAGhgAFAjHcXGDACggQFAjXQUGzMAgAYGADXSUWzMAAAaGADUSEexMQMAaGAAUCMdxcYMAKCBAUCNdBQbMwCABgYANdJRbMwAABoYANRIR7ExAwBoYABQIx3FxgwAoIEBQI10FBszAIAGBgA10lFszAAAGhgA1EhHsTEDAGhgAFAjHcXGDACggQFAjXQUGzMAgAYGADXSUWzMAAAaGADUSEexMQMAaGAAUCMdxcYMAKCBAUCNdBQbMwCABgYANdJRbMwAABoYANRIR7ExAwBoYABQIx3FxgwAoIEBQI10FBszAIAGBgA10lFszAAAGhgA1EhHsTEDAGhgAFAjHcXGDACggQFAjXQUGzMAgAYGADXSUWzMAAAaGADUSEexMQMAaGAAUCMdxcYMAKCBAUCNdBQbMwCABgYANdJRbMwAABoYANRIR7ExAwBoYABQIx3FxgwAoIEBQI10FBszAIAGBgA10lFszAAAGhgA1EhHsTEDAGhgAFAjHcXGDACggQFAjXQUGzMAgAYGADXSUWzMAAAaGADUSEexMQMAaGAAUCMdxcYMAKCBAUCNdBQbMwCABgYANdJRbMwAABoYANRIR7ExAwBoYABQIx3FxgwAoIEBQI10FBszAIAGBgA10lFszAAAGhgA1EhHsTEDAGhgAFAjHcXGDACggQFAjXQUGzMAgAYGADXSUWzMAAAaGADUSEexMQMAaGAAUCMdxcYMAKCBAUCNdBQbMwCABgYANdJRbMwAABoYANRIR7ExAwBoYABQIx3FxgwAoIEBQI10FBszAIAGBgA10lFszAAAGhgA1EhHsTEDAGhgAFAjHcXGDACggQFAjXQUGzMAgAYGADXSUWzMAAAaGADUSEexMQMAaGAAUCMdxcYMAKCBAUCNdBQbMwCABgYANdJRbMwAABoYANRIR7ExAwBoYABQIx3FxgwAoIEBQI10FBszAIAGBgA10lFszAAAGhgA1EhHsTEDAGhgAFAjHcXGDACggQFAjXQUGzMAgAYGADX+fZUOY1vfXP1Rkpb31VV6DtsYh/v2Kh2GJOm143AGgCSdGYebn62nw5AkvW7zzR+HMwAk6bwMAD748iodhyTpdfv6isN9dpWOQ5L0us2vK3K4j67ScUiSXrdPrzjcH67ScUiSXrc/X3G4316l45AkvW7zzR9892aQdCCSpNfrn1fwHW8ElKRz8gZA/mM+vzodiSTp9fr4Cr7zm6uWPwokSXq/fn8F/9H0JywlSb8uf1qdH/jTVToWSdLr9MkV/MC8MzQdjCSpv/lR7/zqN/zA51fpaCRJ/c3ffoFolqFXASTp9Zrv/r35j5/031fpeCRJvf3lCn7S/EqgVwEk6XWa7/5/dwU/a/5IRDoiSVJfvvvnnXxzlQ5JktTTvKI7r+zCL+ZVAEnqb97XBe/sb1fpoCRJ+/v2ynf//Crza4FzQOmwJEl7mzf++Zv/vJc5IH8oSJK6mh/jwnvzfgBJ6unTK3gzc1Dp0CRJe/Jxv9zCmwIlaW9fX3nTH7eYw/L5AJK0r3nDtk/741bzmwF/v0oHKEl6fPONmT/0w0PMKwF/vUqHKEl6XPOjWX/jn4f75CodpCTp/j6/gqf549W/rtJxSpLevvlslo+u4OnmZ0/eHChJ9zdv9vMJf6wyP4Oal6N8aqAk3dO898o7/VlrjvOLq3S8kqR3b97o9+EVVJhj9cFBkvTrmw/2mfdZQaU53jnidNySpB82P+f3x3x4GX+6mh8NeI+AJOXmVVPv7udlzYcIfXw1h+7XByWd3HxD9NXVfKaKN/dxnPl1lvlLg/Mg8KMCSa/cP67mo9Q/u/KzfQjmcwXmwTHNqwXzYJGkpua7+u+fx7yDHwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAfsYHH/wvr/v2eOS3A84AAAAASUVORK5CYII=';
const mapButtonIcon = 'data:image/png;base64,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EogQARKIEAESiBABEogQARKIEAESiBABEogQARKIEAESiBABEogQARKIEAESiBABEogQARKIEAESiBABEogQARKIEAESiBABEogQARKIEAESiBABEogQARKIEAESiBABEogQARKIEAESiBABEogQARKIEAESiBABEogQARKIEAESiBABEogQARKIEAESiBABEogQARKIEAESiBABEogQARKIEAESiBABEogQARKIEAESiBABEogQAf0KZBmwqEpHRC0cCow51w5Edd63QM4DtgA3AiuBpZV5JKpkPnA8cBmwHrgPmOd890RU57tRAJN9pm8BFwBH4z+F2sI1dC/jzjqdysS+wGnAZ4DH6L9+R73OO3QvYxH9aJ3zo15pI3AV9tRpY7M8agI5FFgFrAV2UU4Uo1rnHRIEcq7zo0HST2lfs9x2gcwOnaoQxKjVeYcEgcwD/gbY4fx4VJvlNgokZ+iUO7WhzjskCGSafYBTgE8Cmx1DKampzXJbBFJF6DQBfB24CHgbc6fOO5QQyEzmAccAlwL3OEZTUpOa5aYKpKrQ6UngeuwmWdIl37lQ5x0yCWQ2hwBvAW5hdEKxJgmkqtCpAK4AXgPsMaBPo1jnHcenImcmoxKK1S2QKkOndwBHkO8GHJU67zh+FFVl2OZmedgCqSt0yk2b67zj5F1UlN9utKlZHoZAmhg65aZNdd5x8ioy2R+IpjfLVQmkTaFTbppe5x3HflHCZhaa2CznEsiohE65aWKddxybRUoBq6QJzXIZgcyF0Ck3TajzjmOjyFHAqqirWR5UIHM5dMpNXXXecX5X5C5gVQyzWe4lEIVOw2GYdd5xvltUWcAqqbJZ9mYxP41Cpzqpss5vdq4VwyhY1VTVLFeR5mrolJth1XkxpPIMjaqa5TJJoVO1VFnnxfCKUQ9VNcv9/LEKneohZ50Xw3W9XqpslhU6NZOydV4M3eOGkKNZVujULlLq/LZaPG0g/TbLBQqdRoV+6nxFbd41mH2AM4ENwHbgcayJVug0uswMxTZgLYfEIYQQQghRPf8HJ2f8tntggCkAAAAASUVORK5CYII=';
const emailButtonIcon = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAgAAAAIACAYAAAD0eNT6AAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAN1wAADdcBQiibeAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAACAASURBVHic7d13mG13Wbfx+zkEEiAoPSSUJCCgKIgRBEVfaYkUgRBDlSIiRRBFkA7SO4ggIiKgUqQFSIJBIISiiKKUgCgCAtISQkdCCSDP+8eaHeeczJxZM7PXftZav/tzXbmSnMyZ/XCFM987e8+ZicxEkiS1ZU/1AZIkafUMAEmSGmQASJLUIANAkqQGGQCSJDXIAJAkqUEGgCRJDTIAJElqkAEgSVKDDABJkhpkAEiS1CADQJKkBhkAkiQ1yACQJKlBBoAkSQ0yACRJapABIElSgwwASZIaZABIktQgA0CSpAYZAJIkNcgAkCSpQQaAJEkNMgAkSWqQASBJUoMMAEmSGmQASJLUIANAkqQGGQCSJDXIAJAkqUEGgCRJDTIAJElqkAEgSVKDDABJkhpkAEiS1CADQJKkBhkAkiQ1yACQJKlBBoAkSQ0yACRJapABIElSgwwASZIaZABIktQgA0CSpAYZAJIkNcgAkCSpQQaAJEkNMgAkSWqQASBJUoMMAEmSGmQASJLUIANAkqQGGQCSJDXIAJAkqUEGgCRJDTIAJElqkAEgSVKDDABJkhpkAEiS1CADQJKkBh1QfcB6EXF+4EjgUOCwtT8O3efPhwEHV90oSdIGzgbOAM5c+/P6v178+VOZ+f2yC/cRmVl7QMRFgJsAxwI3Ay5aepAkScP4OnAKcCLwpsw8u/KYkgCIiEOBW9CN/g2BA1d+hCRJdb4LvJUuBk7OzC+t+oCVBUBEXBC4F3A74DpArOSBJUkatx8C/wi8CnhhZp6zigcdPAAiYg9wF+DxwOUGfTBJkqbtM8AjgZflwAM9aABExE2BpwJXH+xBJEman9OBh2TmW4Z6gEECICKuBTwNuMHS37kkSe04FXhwZp6+7He81ACIiMOAZ9K9zu9r/JIk7V4CL6cLgTOX9U6XFgARcW26z2Y8bCnvUJIkrXcGcKvMfO8y3tlSvhJgRNwR+Hscf0mShnIY8PcRcftlvLNdBUB0nkT31MRByzhIkiRt6oLAKyLiCRGxq5fad/wSQEQcDLwMuNVuDpAkSTtyInDnnX5FwR0FQEQcAZyMv71PkqRKHwJumZmf3u5P3HYARMThwHuAQ7b7YJIkaenOAq6bmf+9nZ+0rc8BiIgLAyfh+EuSNBaHACetbXRvvQNg7ZMNXgL89DYPkyRJw7oG8NLtfGLgdp4BeAxw3HYvkiRJK3Fr4LF937jX5wBExG3ovkuRX91PkqRxu11mvnqrN9oyACLiZ4B3ARda0mGSJGk43wZ+KTPfv7832m8ARMSlgfcCl1/ubZIkaUCfBa6dmWdt9gZbfQ7AU3H8JUmamssDT9/fG2z6DEBEXAP4AEv6fgGSJGmlEjhqs28lvL9xf/oW/1ySJI1X0D2Tv6ENBz4ijgaOGeoiSZK0Esesbfp5nOclgIjYA7wfv+CPJElzcDrdSwF7Df5GzwDcCcdfkqS5uCbw6/v+4F7PAETEQcDH8DP/JUmak08DV83McxY/sO8zAPfG8ZckaW4OB+65/gf2DYDbre4WSZK0Qrdf/zfnvgQQEYcCn8ev9y9J0hz9EDhs8dUBD1j3D27B9Mf/X4BjMvMb1YdIkuYjIi4AvAa4ZfUtu7CHbutfuPibhWNLzlmunwNOjYiLVh8iSZqHmYz/wrlbH5lJRFwE+BJwYN1NS/U+4OjM/Fr1IZKk6ZrZ+AN8F7hkZn5r8QzATZjP+AP8LPDWiLh49SGSpGma4fgDHES3+ee+BDCHp//3dRRwWkRcovoQSdK0zHT8F46F7pP+zg98EZjr6+YfBG6UmV+pPkSSNH4zH3+ArwGX3gMcyXzHH7ova/y2iLhk9SGSpHFrYPwBLgYcuQc4rPqSFbgG8PaIuFT1IZKkcWpk/BcO2wMcWn3FivwUXQRcuvoQSdK4NDb+sBYALTwDsPCTdBFwSPUhkqRxaHD8AQ5t6RmAhavRRcBlqg+RJNVqdPyhwWcAFn4CeMfa9z+QJDWo4fGHhgMA4Kp0EdDq/35Jalbj4w+NvgSw3lXoIuCy1YdIklbD8QfgsAC+CRxcfUmx/wJukJmfqz5EkjSciDg/cAJtjz/A2QFk9RUj8Ung+pn52epDJEnL5/jvbc/Wb9KMKwLvjIgrVB8iSVoux/+8DIC9HUkXAYdXHyJJWg7Hf2MGwHkdQRcBR9SeIUnaLcd/cwbAxg6ni4ArVh8iSdoZx3//DIDNXYHutwheqfoQSdL2OP5bqwyAZxU+dl+Xp4uAH6s+RJLUz8TG/+SqBy4LgMx8APDMqsffhsvRRcCVqw+RJO3fBMf/NlUPXvoSQGb+AfD0yht6uixdBFyl+hBJ0samOP6Z+b2qA8o/ByAzHww8tfqOHg6ji4Afrz5EkrQ3x3/7ygMAIDMfCjy5+o4eDqX7VsI/UX2IJKnj+O/MKAIAIDMfDjyx+o4eLkMXAVerPkSSWuf479xoAgAgMx8JPK76jh4OoYuAn6w+RJJa5fjvzqgCACAzHw08pvqOHi5NFwFXrz5Eklrj+O/e6AIAIDMfC/xh9R09XAp4W0Rco/oQSWrF2vi/Bsd/V0YZAACZ+XjgkdV39HBJugj46epDJGnu1o3/rapv6WG04w8jDgCAzHwi8PDqO3q4BF0E/Ez1IZI0V47/co06AAAy88nAQ6vv6OHiwGkRcVT1IZI0N47/8o0+AAAy86nAg6vv6OFiwFsj4lrVh0jSXDj+w5hEAABk5tOBP6i+o4eLAadGxLWrD5GkqXP8hzOZAADIzGcCD6i+o4eL0kXAz1UfIklT5fgPa1IBAJCZzwLuX31HDz9KFwHXrT5EkqbG8R/e5AIAIDOfDfxu9R09/Ajw5oj4+epDJGkqHP/VmGQAAGTmnwC/A2T1LVtYRMD1qg+RpLFz/FdnsgEAkJl/CtyX8UfARYA3RcQvVh8iSWPl+K/WpAMAIDP/DPhtxh8BB9NFwP+rPkSSxsbxX73JBwBAZv45cC/GHwEXBt4YEdevPkSSxsLxrzGLAADIzL8A7sE0IuCUiLhB9SGSVM3xrzObAADIzBcBdwd+WH3LFi5EFwE3qj5Ekqo4/rVmFQAAmfmXwG8y/gi4IPCGiLhx9SGStGqOf73ZBQBAZv418BtMJwKOqT5EklbF8R+HWQYAQGa+FLgL8L/Vt2zhIOCkiLhJ9SGSNDTHfzxmGwAAmfly4M5MIwJOjIibVh8iSUNx/Mdl1gEAkJmvAO7E+CPgQOD1EXHz6kMkadkc//GZfQAAZOYrgTsCP6i+ZQsHAq+LiFtUHyJJy+L4j1MTAQCQma8G7sD4I+ACwAkRMYVfKJK0X47/eDUTAACZeQJwO+D71bds4QLAayLi2OpDJGmnHP9xayoAADLzdUwjAs4PvDoijqs+RJK2y/Efv+YCACAzXw/cBhj7v+zzA6+KiOOrD5Gkvhz/aWgyAAAy8yTgeMYfAQcAr4iI21YfIklbcfyno9kAAMjMNwDHMY0I+JuIuH31IZK0Gcd/WpoOAIDMPAW4NXBO9S1bOB/wsoi4Q/UhkrQvx396mg8AgMx8I3As8N3qW7ZwPuClEfHr1YdI0oLjP00GwJrMfBPTiYCXRMSdqw+RJMd/ugyAdTLzzcAtge9U37KFPcBfRcRdqw+R1C7Hf9oMgH1k5qnALZhGBLw4Iu5WfYik9jj+02cAbCAzTwN+Ffh29S1b2AO8KCLuXn2IpHasjf+rcfwnzQDYRGa+Dbg544+AAP4iIu5RfYik+Vs3/lP4UuWO/34YAPuRme8AbgZ8q/iUrQTw5xFxr+pDJM2X4z8vBsAWMvOdwE2Bs6tv2UIAfxYRv119iKT5cfznxwDoITP/gelEwPMi4r7Vh0iaD8d/ngyAnjLzXcCvAN+svqWH50bE/aqPkDR9jv98GQDbkJnvpouA/6m+pYfnRMTvVR8haboc/3kzALYpM/8JOAb4RvUtPfxxRPx+9RGSpsfxnz8DYAcy8z1MJwL+KCIeWH2EpOlw/NtgAOxQZv4LcGPg69W39PCMiHhQ9RGSxs/xb4cBsAuZ+V66CPha9S09PC0iHlp9hKTxcvzbYgDsUma+jy4Cvlp9Sw9PjoiHVx8haXwc//YYAEuQme8HbgR8pfqWHp4YEY+sPkLSeDj+bTIAliQzT2c6EfD4iPjD6iMk1XP822UALFFmfhC4IfDl6lt6eGxEPKb6CEl1HP+2GQBLlpkfAm4AfKn6lh4eHRGPrz5C0uo5/jIABpCZH6aLgC9W39LDIyPiidVHSFodx19gAAwmM/+dLgLOqr6lh4dHxJOrj5A0PMdfCwbAgDLzP+gi4AvVt/Tw0Ih4avURkobj+Gs9A2BgmfkR4PrAmcWn9PHgiHh69RGSls/x174MgBXIzI/SRcAZxaf08QcR8czqIyQtj+OvjRgAK5KZH6OLgM8Xn9LHAyLiWdVHSNo9x1+bMQBWKDM/ThcBnys+pY/7R8Rzqo+QtHOOv/bHAFixzPwvugj4bPEpfdwvIp5bfYSk7XP8tRUDoEBmfoIuAj5TfEof942I50VEVB8iqR/HX30YAEUy85N0EfDp4lP6+G3gz4wAafwcf/VlABTKzE8Bvwz8d/EpfdwL+HMjQBovx1/bYQAUy8xP00XAp6pv6eEewF8YAdL4OP7aLgNgBDLzM3QR8MnqW3q4O/CiiPD/O9JIOP7aCT+Ij0RmfpYuAj5RfUsPdwNebARI9Rx/7ZQfwEckMz9HFwEfr76lh7sCf2kESHUcf+2GH7xHJjM/T/e7Az5WfEofdwH+OiLOV32I1BrHX7tlAIxQZp5BFwEfLT6ljzsBLzECpNVZG/9X4fhrFwyAkcrMM+ki4D+LT+njjsDLjABpeOvG/9bVt/Tg+I+YATBimfkFugj4SPEpfdwe+JuIOKD6EGmuHH8tkwEwcpl5Fl0E/HvxKX3cFniFESAtn+OvZTMAJiAzvwjcEPhw9S09HA+8au2DlaQlcPw1BANgItZFwL9V39LDcRgB0lI4/hqKATAhmfklugj4YPUtPdwaeE1EXKD6EGmqHH8NyQCYmMz8MnAj4PTqW3q4FXCCESBtn+OvoRkAE5SZX6GLgA9U39LDLYDXRcSB1YdIU+H4axUMgInKzK/SRcD7qm/p4eYYAVIvjr9WxQCYsMz8GnBj4L3Vt/RwM+DEiDio+hBprBx/rZIBMHGZ+XXgaOBfq2/p4SbASUaAdF6Ov1bNAJiBdRHwnupbejgGODkiLlh9iDQWjr8qGAAzkZnfoBvXf66+pYejgTcYAZLjrzoGwIxk5v/QRcC7q2/p4UbA30bEhaoPkao4/qpkAMxMZn6T7rX2f6y+pYcbAqdExIWrD5FWzfFXNQNghtZFwD9U39LD9YE3GgFqieOvMTAAZiozzwZuCvx99S09/D/g7yLi4OpDpKE5/hoLA2DGMvNbdL///h3Fp/TxS8CbIuIi1YdIQ3H8NSYGwMytRcDNgbdX39LD9TACNFOOv8bGAGhAZn6bLgJOq76lh18A3hIRP1J9iLQsjr/GyABoRGZ+h+4b87y1+pYerksXAT9afYi0W46/xsoAaMi6CHhL9S09XAc4NSIuWn2ItFOOv8bMAGhMZn4XuBXwpupberg2XQRcrPoQabscf42dAdCgtQg4Fvi76lt6uBbwViNAU+L4awoMgEZl5jl0H5xOqb6lh6OA0yLi4tWHSFtx/DUVBkDD1iLgOOAN1bf08DN0EXCJ6kOkzTj+mhIDoHFrv/iPp/tgMHbXBN4WEZesPkTal+OvqTEAtD4CTqy+pYdr0EXApaoPkRYcf02RASAAMvP7wG2B11Xf0sPV6SLg0tWHSI6/psoA0LnWIuB2wGurb+nhp4C3R8Qh1YeoXY6/pswA0F4y8wfA7YHXVN/Sw9XoIuAy1YeoPY6/ps4A0HmsRcAd6T64jd1P0EXAodWHqB1r4/9KHH9NmAGgDa1FwK8Dr6i+pYcfp4uAw6oP0fytG//jqm/pwfHXpgwAbSoz/xe4M/Dy6lt6uCrwjoi4bPUhmi/HX3NiAGi/1iLgLsDLqm/p4cp0EXC56kM0P46/5sYA0JYy84fAXYGXVN/Sw4/RRcDlqw/RfDj+miMDQL2sRcDdgL8qPqWPK9FFwBWqD9H0Of6aKwNAva1FwN2BF1ff0sMV6SLg8OpDNF2Ov+bMANC2rEXAbwEvrL6lhyPpIuCI4js0QY6/5s4A0LZlZgL3BF5QfUsPRwDvjIgjqw/RdDj+aoEBoB1Zi4B7A8+vvqWHK9BFwBWrD9H4Of5qhQGgHVuLgPsAz6u+pYfL00XAlaoP0Xg5/mqJAaBdyc59gedW39LD5egi4MrVh2h8HH+1xgDQUmTm/YDnVN/Rw2XpPjHwKtWHaDwi4gAcfzXGANDSZObvAX9cfUcPh9FFwFWrD1G9tfF/FY6/GmMAaKky8/eBP6q+o4dD6SLgx6sPUR3HXy0zALR0mflA4BnVd/RwGboIuFr1IVo9x1+tMwA0iMx8EPC06jt6OITuWwn/ZPUhWh3HXzIANKDMfAjwlOo7erg0XQT8VPUhGp7jL3UMAA0qMx8GPKn6jh4uRRcBV68+RMNx/KX/YwBocJn5COAJ1Xf0cEngbRHx09WHaPkcf2lvBoBWIjMfBTy2+o4eLgmcFhHXrD5Ey+P4S+dlAGhlMvMxwKOr7+jhEnQRcFT1Ido9x1/amAGglcrMxwGPqr6jh4sDb42In60+RDvn+EubMwC0cpn5BOAR1Xf0cDG6CLhW9SHaPsdf2j8DQCUy80nAw6rv6OGidBHwc9WHqD/HX9qaAaAymfkU4CHVd/Two8BbIuI61Ydoa46/1I8BoFKZ+TTgQdV39LCIgJ+vPkSbc/yl/gwAlcvMZwAPrL6jhx8B3hwRv1B9iM7L8Ze2xwDQKGTmHwG/X31HDxehi4BfrD5E/8fxl7bPANBoZOYfA79XfUcPBwN/FxG/VH2IHH9ppwwAjUpmPge4X/UdPSwi4JerD2mZ4y/tnAGg0cnM5wL3BbL6li1cGHhjRFy/+pAWOf7S7hgAGqXMfB5wH8YfARcCTomIG1Yf0pK18X8ljr+0YwaARisznw/cm2lEwN9GxI2rD2nBuvH/tepbenD8NVoGgEYtM18A3JPxR8AFgZMj4ujqQ+bM8ZeWxwDQ6GXmC4HfAn5YfcsWFhHwK9WHzJHjLy2XAaBJyMwXA3dn/BFwEHBSRNy0+pA5cfyl5TMANBmZ+VfA3Rh/BBwIvD4iblZ9yBw4/tIwDABNSma+BLgr04mAX60+ZMocf2k4QdEnV2VmVDyupi8iLgC8C7h29S09fI9uFE6uPmRqHH+1IiJKdthnADQpa+P/GqYx/gAXAE6IiGOrD5mSiY2/NEkGgCZj3fjfsvqWbTo/8OqIuHX1IVMw0fG/JfCatf+PSpNgAGgSJjz+C4sImNKordxEx3/BCNCkGAAavRmM/8IBwCsj4jbVh4zRxMd/wQjQZBgAGrUZjf/CAcDfRMTtqg8Zk5mM/4IRoEkwADRaMxz/hQOAl0fEHaoPGYOZjf+CEaDRMwA0SjMe/4XzAS+NiDtWH1JppuO/YARo1AwAjU4D47+wiIA7VR9SYebjv2AEaLQMAI1KQ+O/sAf464i4S/Uhq9TI+C8YARolA0Cj0eD4L+wB/jIifqP6kFVobPwXjACNjgGgUWh4/Bf2AC+KiN+sPmRIjY7/ghGgUTEAVM7xP9ce4IUR8VvVhwyh8fFfMAI0GgaASjn+5xHACyLintWHLJPjvxcjQKNgAKiM47+pAJ4fEfeuPmQZHP8NGQEqZwCohOO/pQCeFxH3qT5kNxz//TICVMoA0Mo5/r0F8KcR8TvVh+yE49+LEaAyBoBWyvHfkT+JiN+tPmI7HP9tMQJUwgDQyjj+u/LsiLh/9RF9OP47YgRo5QwArYTjvxTPiogHVB+xP47/rhgBWikDQINz/JfqmRHxoOojNuL4L4URoJUxADSoiY3/24FvVB/Rw9Mi4iHVR6zn+C+VEaCVMAA0mImN/8nATYCjga8X39LHUyLiYdVHwOTG/+S1P8bOCNDgDAANYoLjf5vM/F5m/itdBHyt+KY+nhQRj6g8YILjf5u1P4wANc8A0NJNdfwXP5CZ7wVuzDQi4AkR8aiKB14b/1cwofFfi7zvYQRIBoCWa+rjv5CZ7wduBHx15Vdt3+Mi4tGrfMB143/8Kh93hzaKPCNAzTMAtDRzGf+FzPwAXQR8ZWVX7dxjIuJxq3igCY7/8ZtEnhGgphkAWoq5jf9CZp4O3BD48uBX7d6jIuIJQz7ARMf/+5u9gRGglhkA2rW5jv9CZn6ILgK+NNhVy/OIiHjSEO94buO/YASoVQaAdmXu47+Qmf9GFwFfXPpVy/ewiHjKMt/hxMb/JHqO/4IRoBYZANqxVsZ/ITM/DNwAOGtpVw3nIRHxtGW8owmO/222M/4LRoBaYwBoR1ob/4XM/A+6CPjCrq8a3oMi4hm7eQetjP+CEaCWGADatlbHfyEzP0IXAWcu630O6IER8ayd/MTWxn/BCFArDABtS+vjv5CZ/0kXAWcs+30P4P4R8ezt/IRWx3/BCFALDAD15vjvLTM/Clwf+PxQj7FEvxsRf9LnDVsf/wUjQHNnAKgXx39jmflxugj43NCPtQS/ExF/GhGx2Rs4/nszAjRnBoC25PjvX2b+F10EfHZVj7kL9wGet1EEOP4bMwI0VwaA9svx7yczP0EXAZ9Z9WPvwL2B56+PgImN/4msaPwXjADNUQBZ8cCZuenTkBoHx3/7IuJI4O3A4ZV39PRC4J7A+ZjW+N92leO/nr8mNISIKNlhA0Ab8gPdzkXEEXQRcETpIf28GPgRHP/e/LWhZTMANBp+gNu9iDicLgKOrL5lJkYx/gv+GtEyVQWAnwOgvfiBbTky89PALwOfrL5lBkY1/uDnBGgeDACdy/Ffrsz8LF0EfKL6lgkb3fgvGAGaOgNAgOM/lMz8HF0EfLz6lgka7fgvGAGaMgNAjv/AMvPzdL9F8GPFp0zJ6Md/wQjQVBkAjXP8VyMzz6CLgI8WnzIFr2ci479gBGiKDICGOf6rlZln0kXAfxafMmavB243pfFfMAI0NQZAoxz/Gpn5BboI+EjxKWM02fFfMAI0JQZAgxz/Wpl5Fl0E/HvxKWMy+fFfMAI0FQZAYxz/ccjMLwI3AD5cfcsIzGb8F4wATYEB0BDHf1wy80vADYF/q76l0OzGf8EI0NgZAI1w/MdpXQR8sPqWArMd/wUjQGNmADTA8R+3zPwycCPg9OpbVuh1zHz8F4wAjZUBMHOO/zRk5lfoIuAD1beswOuA27cw/gtGgMbIAJgxx39aMvOrdBHwvupbBtTc+C8YARobA2CmHP9pysyvATcG3lt9ywCaHf8FI0BjYgDMkOM/bZn5deBo4F+qb1miZl7z34oRoLEwAGbG8Z+HtQg4BnhP9S1LsBj/H1QfMhZGgMbAAJgRx39eMvMbdBHwT9W37ILjvwkjQNUMgJlw/OcpM/8H+BXg3dW37IDjvwUjQJUMgBlw/OctM78J3AR4V/Ut2/BaHP9ejABVMQAmzvFvw1oE3BT4h+pbengt3Wf7O/49GQGqYABMmOPflsw8my4C3ll9y344/jtkBGjVDICJcvzblJnfAm4GvKP4lI04/rtkBGiVDIAJcvzblpnfBm4OvK36lnUc/yUxArQqBsDEOP6CcyPgV4HTqm/B8V86I0CrYABMiOOv9TLzO8AtgFMLz3D8B2IEaGgGwEQ4/trIWgTcEnhzwcM7/gMzAjQkA2ACHH/tT2Z+F7gV8KYVPuwJOP4rYQRoKAbAyDn+6iMzzwGOBd64goc7AbiD4786RoCGYACMmOOv7ViLgFsDfzvgwzj+RYwALZsBMFKOv3Zi7d/BrwGvH+DdvxLHv5QRoGUyAEbI8ddurP27OB540rLeJfAY4I6Ofz0jQMsSdL+4Vy4zo+Jxx87x1zJFxPHAs4HDdvguPg/cLzOHeEZBu+DHivmIiJId9hmAEfEXtJYtM08ArgQ8APjCNn7ql4EHA1d2/MfJZwK0Wz4DMBKOv4YWEXuA69B9GeHr0T0rcCjdfwicAZwJ/DNwCvBun+6fBj92TF/VMwAGwAj4C1jSbvgxZNp8CaBR/sKVtFu+HKCdMAAKOf6SlsUI0HYZAEUcf0nLZgRoOwyAAo6/pKEYAerLAFgxx1/S0IwA9WEArJDjL2lVjABtxQBYEcdf0qoZAdofA2AFHH9JVYwAbcYAGJjjL6maEaCNGAADcvwljYURoH0ZAANx/CWNjRGg9QyAATj+ksbKCNCCAbBkjr+ksTMCBAbAUjn+kqbCCJABsCSOv6SpMQLaZgAsgeMvaaqMgHYZALvk+EuaOiOgTQbALjj+kubCCGiPAbBDjr+kuTEC2mIA7IDjL2mujIB2GADb5PhLmjsjoA0GwDY4/pJaYQTMnwHQk+MvqTVGwLwZAD04/pJaZQTMlwGwBcdfUuuMgHkyAPbD8ZekjhEwPwbAJhx/SdqbETAvBsAGHH9J2pgRMB8GwD4cf0naPyNgHgyAdRx/SerHCJg+A2CN4y9J22METJsBgOMvSTtlBExX8wHg+EvS7hgB09R0ADj+krQcRsD0NBsAjr8kLZcRMC1NBoDjL0nDMAKmo7kAcPwlaVhGwDQ0FQCOvySthhEwfs0EgOMvSatlBIxbEwHg+EtSDSNgvGYfAI6/JNUyAsZp1gHg+EvSOBgB4zPbAHD8JWlcjIBxmWUAOP6SNE5GwHjMLgAcf0kaNyNgHGYVAI6/JE2DEVBvNgHg+EvStBgBtWYRAI6/JE2TEVBn8gHg+EvStBkBNSYdAI6/JM2DEbB6kw0Ax1+S5sUIWK1JBoDjL0nzZASszuQCwPGXpHkzAlZjUgHg+EtSG4yA4U0mABx/SWqLETCsSQSA4y9JbTIChjP6AHD8JaltRsAwRh0Ajr8kCYyACZpQdAAABiFJREFUIYw2ABx/SdJ6RsByjTIAHH9J0kaMgOUZXQA4/pKk/TEClmNUAeD4S5L6MAJ2bzQB4PhLkrbDCNidUQSA4y9J2gkjYOfKA8DxlyTthhGwM6UB4PhLkpbBCNi+ALLosQ/E8ZckLdEU/8MSOKfiwSsD4GQm9C/I8ZekaZhgBJTcWRkAU+D4S9IETSwCSpR/EuCIOf6SNFET+5yAEgbAxhx/SZo4I2D/DIDzcvwlaSaMgM0ZAHtz/CVpZoyAjRkA/8fxl6SZMgLOaw9wdvURI+D4S9LMGQF7OXsPcEb1FcUcf0lqhBFwrjNaDwDHX5IaYwQAcOYe4MzqK4o4/pLUKCOg3WcAHH9JalzjEdBkADj+kiSg6Qho7iUAx1+StJdGI6CpZwAcf0nShhqMgDNbCQDHX5K0X41FwBkBHAB8EbhY8TFDcfwlSb018K2Evw5cek9m/gA4pfqagTj+kqRtaeCZgFMy8/uL7wVwYukpw3D8JUk7MvMIOBEgMpOIuDDwZeCg2puWxvGXJO3aDF8O+C5wqcw8ew9AZn4LOK32pqVx/CVJSzHDZwLemplnw97fDngOLwM4/pKkpZpZBJy79ZGZ3V9EHEL3WwL3bPKTJEnSdP0QuExmfgnWjX1mngX8c9VVkiRpUP+4GH8473/tv3LFx0iSpNV49fq/OfclAICIOBD4KHD4io+SJEnD+Qxwlcw8Z/EDez0DsPYPHrnqqyRJ0qAeuX78YZ9nAAAiIoD3A9dc4WGSJGkYpwNH5T6Df57P+F97gwev6ipJkjSoh+w7/rDJb/nLzFOBtwx+kiRJGtKpmbnhnp/nJYBz/0HENeleCogBD5MkScNIuqf+T9/oH276RX/WfsLLhrpKkiQN6uWbjT/s5xkAOPerA/4rcPkBDpMkScM4A7hWZp652Rvs98v+rn11wGOBby/5MEmSNIzvALfa3/hDj6/7n5nvB+62rKskSdKgfjMz37vVG/X6xj+Z+Wrg8bs+SZIkDemJmdnry/rv93MA9nrD7gsEvRa49S4OkyRJwzgROG6j3/O/kd4BABARFwbeDVxjZ7dJkqQBfAi4Xmae3fcnbCsAACLiCLpvG3zItn6iJEkawlnAdTLz09v5Sb0+B2C9zPxv4Dp0tSFJkup8CLjudscfdhAAAGsPdD261xskSdLqvR74hbX/MN+2HQUAwNrrDMcBT9zp+5AkSTvyeODXMvNbO30H2/4cgA3fScTtgRcDF9z1O5MkSZv5NnC3td+evytLCQCAiLgWcBJw2FLeoSRJWu+zwLFrX6Bv13b8EsC+1r7q0LXovoHQcqpCkiQl8FLg2ssaf1jiMwB7vdPuWwk/DTh66e9ckqR2vAV4yP6+q99ODRIA577ziGOApwLXHOxBJEman9OBB2fmqUM9wNJeAthIZr4FOAq4C/CZIR9LkqQZ+DRwZ+CoIccfBn4GYK8HijgQuAdwW7qvITBofEiSNBE/pPsKu68EXpCZ56ziQVcWAHs9aMSlgFsCxwI3Bg5a+RGSJNX5LnAa3RfUe0NmnrXqA0oCYK8DIg4GbkIXAzcHLlp6kCRJw/gacArd6L9pN1/EZxnKA2C9iDg/cCRwKN3XEzhs3V+v/7GDq26UJGkDZwNnrP1x5iZ//anM/EHZhfsYVQBIkqTV8BPxJElqkAEgSVKDDABJkhpkAEiS1CADQJKkBhkAkiQ1yACQJKlBBoAkSQ0yACRJapABIElSgwwASZIaZABIktQgA0CSpAYZAJIkNcgAkCSpQQaAJEkNMgAkSWqQASBJUoMMAEmSGmQASJLUIANAkqQGGQCSJDXIAJAkqUEGgCRJDTIAJElqkAEgSVKDDABJkhpkAEiS1CADQJKkBhkAkiQ1yACQJKlBBoAkSQ0yACRJapABIElSgwwASZIaZABIktQgA0CSpAYZAJIkNcgAkCSpQQaAJEkNMgAkSWqQASBJUoMMAEmSGmQASJLUIANAkqQGGQCSJDXIAJAkqUEGgCRJDTIAJElqkAEgSVKDDABJkhpkAEiS1CADQJKkBhkAkiQ1yACQJKlBBoAkSQ0yACRJapABIElSgwwASZIaZABIktSg/w/IphSplmVJ2gAAAABJRU5ErkJggg==';
const phoneIcon = 'data:image/png;base64,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';

/// Look for these words to find that selected text is address
const addressMarkers = [
  'ул.',
  'пр.',
  'проспект ',
  'улица',
  'вулиця',
  ' street',
  'broadway',
  ' st.',
];


/// Unit conversion keys
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
  "AUD": { currencyName: "Australian Dollar", currencySymbol: "A$", id: "AUD", rate: 1.29009 },
  "AUD2": { currencyName: "Australian Dollar", currencySymbol: "australian dollar", id: "AUD", rate: 1.29009 },
  "AUD3": { currencyName: "Australian Dollar", currencySymbol: "австралийских доллар", id: "AUD", rate: 1.29009 },
  "BGN": { currencyName: "Bulgarian Lev", currencySymbol: "лв", id: "BGN", rate: 1.640562 },
  "BRL": { currencyName: "Brazilian real", currencySymbol: "R$", id: "BRL", rate: 5.616101 },
  "BTC": { currencyName: "Bitcoin", currencySymbol: "BTC", id: "BTC", rate: 0.000018 },
  "BTC1": { currencyName: "Bitcoin", currencySymbol: "bitcoins", id: "BTC", rate: 0.000018 },
  "BTC2": { currencyName: "Bitcoin", currencySymbol: "биткоин", id: "BTC", rate: 0.000018 },
  "BYN": { currencyName: "Belarussian Ruble", currencySymbol: "белорусских рублей", id: "BYN", rate: 2.596137 },
  "CAD": { currencyName: "Canadian Dollar", currencySymbol: "C$", id: "CAD", rate: 1.269384 },
  "CAD2": { currencyName: "Canadian Dollar", currencySymbol: "canadian dollar", id: "CAD", rate: 1.269384 },
  "CAD3": { currencyName: "Canadian Dollar", currencySymbol: "канадских доллар", id: "CAD", rate: 1.269384 },
  "CHF": { currencyName: "Swiss Franc", currencySymbol: "CHF", id: "CHF", rate: 0.926525 },
  "CNY": { currencyName: "Chinese Yuan", currencySymbol: "¥", id: "CNY", rate: 6.497301 },
  "CNY1": { currencyName: "Chinese Yuan", currencySymbol: "yuan", id: "CNY", rate: 6.497301 },
  "CNY3": { currencyName: "Chinese Yuan", currencySymbol: "юаней", id: "CNY", rate: 6.497301 },
  "CRC": { currencyName: "Costa Rican Colon", currencySymbol: "₡", id: "CRC", rate: 610.339772 },
  "CZK": { currencyName: "Czech Koruna", currencySymbol: "Kč", id: "CZK", rate: 21.936455 },
  "DKK": { currencyName: "Danish Krone", currencySymbol: "kr", id: "DKK", rate: 6.229502 },
  "EUR": { currencyName: "Euro", currencySymbol: "€", id: "EUR", rate: 0.8378 },
  "EUR1": { currencyName: "Euro", currencySymbol: "euro", id: "EUR", rate: 0.8378 },
  "EUR3": { currencyName: "Euro", currencySymbol: "евро", id: "EUR", rate: 0.8378 },
  "GBP": { currencyName: "British Pound", currencySymbol: "£", id: "GBP", rate: 0.721124 },
  "HKD": { currencyName: "Hong Kong dollar", currencySymbol: "HK$", id: "HKD", rate: 7.765632 },
  "ILS": { currencyName: "Israeli New Sheqel", currencySymbol: "₪", id: "ILS", rate: 3.310401 },
  "INR": { currencyName: "Indian Rupee", currencySymbol: "₹", id: "INR", rate: 72.452006 },
  "INR1": { currencyName: "Indian Rupee", currencySymbol: "rupees", id: "INR", rate: 72.452006 },
  "IRR": { currencyName: "Iranian Rial", currencySymbol: "﷼", id: "IRR", rate: 42105.017329 },
  "JPY": { currencyName: "Japanese Yen", currencySymbol: "¥", id: "JPY", rate: 109.188027 },
  "JPY1": { currencyName: "Japanese Yen", currencySymbol: "yen", id: "JPY", rate: 105.857044 },
  "JPY2": { currencyName: "Japanese Yen", currencySymbol: "йен", id: "JPY", rate: 105.857044 },
  "KPW": { currencyName: "North Korean Won", currencySymbol: "₩", id: "KPW", rate: 900.00022 },
  "KZT": { currencyName: "Kazakhstani Tenge", currencySymbol: "лв", id: "KZT", rate: 418.821319 },
  "KZT1": { currencyName: "Kazakhstani Tenge", currencySymbol: "тенге", id: "KZT", rate: 418.821319 },
  "MNT": { currencyName: "Mongolian Tugrik", currencySymbol: "₮", id: "MNT", rate: 2849.930035 },
  "MXN": { currencyName: "Mexican Peso", currencySymbol: "peso", id: "MXN", rate: 20.655212 },
  "MXN1": { currencyName: "Mexican Peso", currencySymbol: "песо", id: "MXN", rate: 20.655212 },
  "NGN": { currencyName: "Nigerian Naira", currencySymbol: "₦", id: "NGN", rate: 410.317377 },
  "PLN": { currencyName: "Polish złoty", currencySymbol: "zł", id: "PLN", rate: 3.845051 },
  "RUB": { currencyName: "Russian Ruble", currencySymbol: "₽", id: "RUB", rate: 72.880818 },
  "RUB1": { currencyName: "Russian Ruble", currencySymbol: "rubles", id: "RUB", rate: 72.880818 },
  "RUB2": { currencyName: "Russian Ruble", currencySymbol: "рублей", id: "RUB", rate: 72.880818 },
  "RUB3": { currencyName: "Russian Ruble", currencySymbol: "руб", id: "RUB", rate: 72.880818 },
  "RUB4": { currencyName: "Russian Ruble", currencySymbol: "р.", id: "RUB", rate: 72.880818 },
  "SAR": { currencyName: "Saudi Riyal", currencySymbol: "﷼", id: "SAR", rate: 3.750694 },
  "SEK": { currencyName: "Swedish Krona", currencySymbol: " kr", id: "SEK", rate: 8.514027 },
  "TRY": { currencyName: "Turkish Lira", currencySymbol: "₺", id: "TRY", rate: 0.14 },
  "UAH": { currencyName: "Ukrainian Hryvnia", currencySymbol: "₴", id: "UAH", rate: 27.852288 },
  "UAH2": { currencyName: "Ukrainian Hryvnia", currencySymbol: "гривен", id: "UAH", rate: 27.852288 },
  "UAH3": { currencyName: "Ukrainian Hryvnia", currencySymbol: "грн", id: "UAH", rate: 27.852288 },
  "USD": { currencyName: "United States Dollar", currencySymbol: "$", id: "USD", rate: 1 },
  "USD1": { currencyName: "United States Dollar", currencySymbol: "dollar", id: "USD", rate: 1 },
  "USD3": { currencyName: "United States Dollar", currencySymbol: "доллар", id: "USD", rate: 1 },
  "VND": { currencyName: "Vietnamese Dong", currencySymbol: "₫", id: "VND", rate: 23054.385489 },
  "ZAR": { currencyName: "Rand", currencySymbol: "ZAR", id: "ZAR", rate: 14.856969 },
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
