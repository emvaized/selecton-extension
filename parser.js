var copyLabel = 'Copy';
var searchLabel = 'Search';
var openLinkLabel = 'Open';
var translateLabel = 'Translate';
var animationDuration = 300;

/// API key for https://www.currencyconverterapi.com/
var currencyConversionApiKey = '3af8bf98aa005167fd3d';
var convertToCurrency = 'USD';
var hideOnScroll;

// Possible values: 'imperial', 'metric';
var preferredMetricsSystem;
var showTranslateButton;
var languageToTranslate;
var convertMetrics = true;
var addOpenLinks = true;
var convertCurrencies = true;
var performSimpleMathOperations = true;

/// Appearance configs
var useCustomStyle = true;
var tooltipBackground = '3B3B3B';
var tooltipOpacity = 1.0;
var addTooltipShadow = false;
var shadowOpacity = 0.5;
var borderRadius = 3;

var convertOnlyFewWordsSelected = true;
var secondaryColor = 'lightBlue';
var tooltipMaxWidth = 700;

var tooltip;
var arrow;
var selection;
var tooltipIsShown = false;

function init() {
  /// Restore user's settings
  chrome.storage.local.get(
    [
      'currencyConversionApiKey',
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
    ], function (value) {
      currencyConversionApiKey = value.currencyConversionApiKey || '3af8bf98aa005167fd3d';
      animationDuration = value.animationDuration || 300;
      convertToCurrency = value.convertToCurrency || 'USD';
      hideOnScroll = value.hideOnScroll ?? true;
      convertMetrics = value.convertMetrics ?? true;
      addOpenLinks = value.addOpenLinks ?? true;
      convertCurrencies = value.convertCurrencies ?? true;
      performSimpleMathOperations = value.performSimpleMathOperations ?? true;
      preferredMetricsSystem = value.preferredMetricsSystem || 'metric';
      showTranslateButton = value.showTranslateButton ?? true;
      languageToTranslate = value.languageToTranslate || 'en';

    });


  copyLabel = chrome.i18n.getMessage("copyLabel");
  searchLabel = chrome.i18n.getMessage("searchLabel");
  openLinkLabel = chrome.i18n.getMessage("openLinkLabel");

  arrow = document.createElement('div');
  arrow.setAttribute('class', `selection-tooltip-arrow`);

  var arrowChild = document.createElement('div');
  arrowChild.setAttribute('class', 'selection-tooltip-arrow-child');
  arrow.appendChild(arrowChild);

  tooltip = document.createElement('div');
  tooltip.appendChild(arrow);
  document.body.appendChild(tooltip);
  tooltip.setAttribute('style', `opacity: 0.0;position: absolute; transition: opacity ${animationDuration}ms ease-in-out;`);
  tooltip.setAttribute('class', `selection-tooltip`);

  if (useCustomStyle) {
    tooltip.style.borderRadius = `${borderRadius}px`;

    tooltip.style.background = tooltipBackground;
    arrowChild.style.background = tooltipBackground;

    tooltip.style.opacity = tooltipOpacity;
    arrowChild.style.opacity = tooltipOpacity;

    if (addTooltipShadow) {
      tooltip.style.boxShadow = `0 0 7px rgba(0,0,0,${shadowOpacity})`;
      arrowChild.style.boxShadow = `6px 5px 9px -9px rgba(0,0,0,${shadowOpacity}),5px 6px 9px -9px rgba(0,0,0,${shadowOpacity})`;
    }
  }

  /// Search button creation
  var searchButton = document.createElement('button');
  searchButton.setAttribute('class', `selection-popup-button`);
  searchButton.textContent = searchLabel;
  searchButton.addEventListener("mouseup", function (e) {
    hideTooltip();
    var selectedText = selection.toString();
    /// Search text
    window.open(`https://www.google.com/search?q=${selectedText.trim()}`, '_blank');
  });

  tooltip.appendChild(searchButton);

  /// Copy button creation 
  var copyButton = document.createElement('button');
  copyButton.setAttribute('class', `selection-popup-button button-with-border`);
  copyButton.textContent = copyLabel;
  copyButton.addEventListener("mouseup", function (e) {
    document.execCommand('copy');
    hideTooltip();
  });
  tooltip.appendChild(copyButton);

  document.addEventListener("scroll", function (e) {
    if (hideOnScroll)
      hideTooltip();
  });

  document.addEventListener("mousedown", function (e) {
    hideTooltip();
  });
}

init();


function calculateString(fn) {
  return new Function('return ' + fn)();
}


document.addEventListener("mouseup", function (e) {
  // if (tooltip == null) init();

  if (window.getSelection) {
    selection = window.getSelection();
  } else if (document.selection) {
    selection = document.selection.createRange();
  }

  var selDimensions = getSelectionDimensions();
  var selectedText = selection.toString();

  if (tooltipIsShown == false && selectedText !== null && selectedText !== '' && tooltip.style.opacity !== 0.0) {

    var selectedText = selection.toString();
    var wordsCount = selectedText.split(' ').length;

    if (convertOnlyFewWordsSelected == false || wordsCount < 3) {
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
              // if (word.includes("'") || word.includes('"')) {
              //   var numbers = word.split("'");
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

                  interactiveButton.addEventListener("mouseup", function (e) {
                    hideTooltip();
                    /// Search for conversion on Google
                    window.open(`https://www.google.com/search?q=${numberToConvert + ' ' + fromUnit} to ${convertedUnit}`, '_blank');
                    ;
                  });

                  tooltip.appendChild(interactiveButton);
                  try {
                    tooltip.style.left = `${(parseInt(tooltip.style.left.replaceAll('px', ''), 10) - interactiveButton.clientWidth - 5) * 2}px`;
                  } catch (e) { console.log(e) }
                  break outerloop;
                }
              }
            }
          }
        }

      /// Do simple math calculations
      if (numberToConvert == null && performSimpleMathOperations) {
        try {
          var calculatedExpression = calculateString(selectedText.trim());
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

              interactiveButton.addEventListener("mouseup", function (e) {
                hideTooltip();
                /// Search for conversion on Google
                window.open(`https://www.google.com/search?q=${selectedText}`, '_blank');
                ;
              });

              tooltip.appendChild(interactiveButton);
              try {
                tooltip.style.left = `${(parseInt(tooltip.style.left.replaceAll('px', ''), 10) - interactiveButton.clientWidth - 5) * 2}px`;
              } catch (e) { console.log(e) }
            }
          }
        } catch (e) { }
      }

      /// Convert currencies
      if (convertCurrencies) {
        var currency;
        var amount;

        for (const [key, value] of Object.entries(currenciesList['results'])) {
          if (selectedText.includes(value["id"]) || selectedText.includes(value["currencySymbol"])) {
            // if (selectedText.includes(value["currencySymbol"])) {
            // currency = key;
            currency = value["id"];
            amount = selectedText.match(/[+-]?\d+(\.\d)?/g);
            if (amount !== null)
              amount = amount.join("");
            break;
          }
        }

        // if (currency !== undefined && currency !== convertToCurrency && amount !== null && amount.split('.').length < 3) {
        if (currency !== undefined && currency !== convertToCurrency && amount !== null) {
          convertCurrency(amount, currency, convertToCurrency, function (err, convertedAmount) {
            if (convertedAmount !== 'NaN' && convertedAmount !== undefined) {

              /// Separate resulting numbers in groups of 3 digits
              var convertedAmountString = convertedAmount.toString();
              var parts = convertedAmountString.split('.');
              parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, " ");
              convertedAmountString = parts.join('.');

              /// Create and add button with result
              var interactiveButton = document.createElement('button');
              interactiveButton.setAttribute('class', `selection-popup-button button-with-border open-link-button`);
              interactiveButton.textContent = amount + ' ' + currency + ' →';
              var converted = document.createElement('span');
              converted.textContent = ` ${convertedAmountString} ${convertToCurrency}`;
              converted.setAttribute('style', `color: ${secondaryColor}`);
              interactiveButton.appendChild(converted);

              interactiveButton.addEventListener("mouseup", function (e) {
                hideTooltip();
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

            }

          });
        } else {

          /// Add 'open link' button for each found link
          if (addOpenLinks)
            if (tooltip.children.length < 4 && selectedText.includes('.')) {
              var words = selectedText.split(' ');
              for (i in words) {
                var link = words[i];
                // if (tooltip.clientWidth < tooltipMaxWidth && !link.includes(' ') && link.length > 6 && (link.includes('http') || link.includes('www.') || (link.includes('.') && link.includes('/')))) {
                if (link.includes('.')) {
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

                  /// Adding button
                  var interactiveButton = document.createElement('button');
                  interactiveButton.setAttribute('class', `selection-popup-button button-with-border open-link-button`);
                  var linkText = document.createElement('span');
                  // linkText.textContent = ' ' + link;
                  linkText.textContent = ' ' + (link.length > 33 ? link.substring(0, 33) + '...' : link);
                  linkText.setAttribute('style', `color: ${secondaryColor}`);
                  interactiveButton.innerHTML = openLinkLabel + '';
                  interactiveButton.appendChild(linkText);
                  interactiveButton.addEventListener("mouseup", function (e) {
                    hideTooltip();
                    /// Open link
                    var url = link.trim();

                    if (!url.includes('http://') && !url.includes('https://'))
                      url = 'https://' + url;
                    window.open(`${url}`, '_blank');
                  });

                  tooltip.appendChild(interactiveButton);
                  break;
                }
              }
            }

        }
      }
    }


    /// Show Translate button when enabled, and no other buttons were added 
    if (tooltip.children.length < 4 && showTranslateButton) {
      try {
        addTranslateButton();
      } catch (e) { }
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
    showTooltip(resultingDx, resultingDy);

  }
  else hideTooltip();
});

var firstButtonBorderRadius = `${borderRadius - 3}px 0px 0px ${borderRadius - 3}px`;
var lastButtonBorderRadius = `0px ${borderRadius - 3}px ${borderRadius - 3}px 0px`;

async function addTranslateButton() {
  var detectingLanguages;
  try {
    detectingLanguages = await chrome.i18n.detectLanguage(
      selection.toString()                  // string
    );
  } catch (e) { }


  if (detectingLanguages !== null && detectingLanguages !== undefined) {
    var langs = detectingLanguages.languages;
    var shouldTranslate = true;
    if (langs !== []) {
      langs.forEach(function (lang) {
        /// Don't show translate button if selected language is the same as desired
        if (lang.language == languageToTranslate) shouldTranslate = false;
      })
    }

    if (shouldTranslate) {
      translateLabel = chrome.i18n.getMessage("translateLabel");
      var translateButton = document.createElement('button');
      translateButton.setAttribute('class', `selection-popup-button button-with-border open-link-button`);
      translateButton.textContent = translateLabel;
      translateButton.addEventListener("mouseup", function (e) {
        hideTooltip();

        var selectedText = selection.toString();
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
  }
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


async function copyText() {
  try {
    await navigator.clipboard.writeText(selection);
    console.log(selection + ' copied');
  }
  catch (err) {
    console.error('Failed to copy: ', err);
  }
  hideTooltip();
}

function hideTooltip() {
  if (tooltipIsShown) {
    tooltip.style.opacity = 0.0;
    setTimeout(function () {
      tooltipIsShown = false;

      /// Ignore clicks on tooltip
      tooltip.style.pointerEvents = 'none';

      /// Remove all added link button
      var linkButtons = tooltip.querySelectorAll('.open-link-button');
      if (linkButtons !== null)
        linkButtons.forEach(function (button) {
          button.remove();
        });
    }, animationDuration);
  }
}

function showTooltip(dx, dy) {
  tooltipIsShown = true;
  tooltip.style.pointerEvents = 'auto';
  tooltip.style.top = `${dy}px`;
  tooltip.style.left = `${dx}px`;
  tooltip.style.opacity = 1.0;
}


async function convertCurrency(amount, fromCurrency, toCurrency, cb) {
  fromCurrency = encodeURIComponent(fromCurrency);
  toCurrency = encodeURIComponent(toCurrency);
  var query = fromCurrency + '_' + toCurrency;

  var url = 'https://free.currconv.com/api/v7/convert?q='
    + query + '&compact=ultra&apiKey=' + currencyConversionApiKey;

  console.log(url);

  try {
    const apiCall = await fetch(
      url
    );
    const jsonObj = await apiCall.json();

    var val = jsonObj[query];
    if (val) {
      var total = val * amount;
      cb(null, Math.round(total * 100) / 100);
    } else {
      var err = new Error("Value not found for " + query);
      console.log(err);
      // cb(err);
    }
  } catch (e) {
    console.log("Currency conversion error: ", e);
    if (e instanceof NetworkError) {
      console.log(e.message);
      console.log(e.getMessage);
    }
    // cb(e);
  }
}


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


var currenciesList = {
  "results":
  {
    "USD": { "currencyName": "United States Dollar", "currencySymbol": "$", "id": "USD" },
    "USD1": { "currencyName": "United States Dollar", "currencySymbol": "dollar", "id": "USD" },
    "EUR": { "currencyName": "Euro", "currencySymbol": "€", "id": "EUR" },
    "EUR1": { "currencyName": "Euro", "currencySymbol": "euro", "id": "EUR" },
    "CNY": { "currencyName": "Chinese Yuan", "currencySymbol": "¥", "id": "CNY" },
    "CNY1": { "currencyName": "Chinese Yuan", "currencySymbol": "yuan", "id": "CNY" },
    "JPY": { "currencyName": "Japanese Yen", "currencySymbol": "¥", "id": "JPY" },
    "JPY1": { "currencyName": "Japanese Yen", "currencySymbol": "yen", "id": "JPY" },
    "RUB": { "currencyName": "Russian Ruble", "currencySymbol": "₽", "id": "RUB" },
    "RUB1": { "currencyName": "Russian Ruble", "currencySymbol": "rubles", "id": "RUB" },
    "UAH": { "currencyName": "Ukrainian Hryvnia", "currencySymbol": "₴", "id": "UAH" },
    "BTC": { "currencyName": "Bitcoin", "currencySymbol": "BTC", "id": "BTC" },
    "BTC1": { "currencyName": "Bitcoin", "currencySymbol": "bitcoins", "id": "BTC" },
    "GBP": { "currencyName": "British Pound", "currencySymbol": "£", "id": "GBP" },
    "INR": { "currencyName": "Indian Rupee", "currencySymbol": "₹", "id": "INR" },
    "INR1": { "currencyName": "Indian Rupee", "currencySymbol": "rupees", "id": "INR" },
    "IRR": { "currencyName": "Iranian Rial", "currencySymbol": "﷼", "id": "IRR" },
    "ILS": { "currencyName": "Israeli New Sheqel", "currencySymbol": "₪", "id": "ILS" },
    "CZK": { "currencyName": "Czech Koruna", "currencySymbol": "Kč", "id": "CZK" },
    "NGN": { "currencyName": "Nigerian Naira", "currencySymbol": "₦", "id": "NGN" },
    "KZT": { "currencyName": "Kazakhstani Tenge", "currencySymbol": "лв", "id": "KZT" },
    "ANG": { "currencyName": "Netherlands Antillean Gulden", "currencySymbol": "ƒ", "id": "ANG" },
    "CRC": { "currencyName": "Costa Rican Colon", "currencySymbol": "₡", "id": "CRC" },
    "DKK": { "currencyName": "Danish Krone", "currencySymbol": "kr", "id": "DKK" },
    "MNT": { "currencyName": "Mongolian Tugrik", "currencySymbol": "₮", "id": "MNT" },
    "VND": { "currencyName": "Vietnamese Dong", "currencySymbol": "₫", "id": "VND" },
    "KPW": { "currencyName": "North Korean Won", "currencySymbol": "₩", "id": "KPW" },
    "SAR": { "currencyName": "Saudi Riyal", "currencySymbol": "﷼", "id": "SAR" },
    "BGN": { "currencyName": "Bulgarian Lev", "currencySymbol": "лв", "id": "BGN" },

    /// Russian labels
    "EUR3": { "currencyName": "Euro", "currencySymbol": "евро", "id": "EUR" },
    "USD3": { "currencyName": "United States Dollar", "currencySymbol": "доллар", "id": "USD" },
    "CNY3": { "currencyName": "Chinese Yuan", "currencySymbol": "юаней", "id": "CNY" },
    "RUB2": { "currencyName": "Russian Ruble", "currencySymbol": "рублей", "id": "RUB" },
    "UAH2": { "currencyName": "Ukrainian Hryvnia", "currencySymbol": "гривен", "id": "UAH" },
    "KZT1": { "currencyName": "Kazakhstani Tenge", "currencySymbol": "тенге", "id": "KZT" },
    "JPY2": { "currencyName": "Japanese Yen", "currencySymbol": "йен", "id": "JPY" },
  }
}

// async function updateCurrencies() {
//   var keys = [...currenciesList['results'].keys()];
// }





