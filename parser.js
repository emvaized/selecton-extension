var copyLabel = 'Copy';
var searchLabel = 'Search';
var openLinkLabel = 'Open';
var animationDuration = 300;

/// API key for https://www.currencyconverterapi.com/
var currencyConversionApiKey = '3af8bf98aa005167fd3d';
var convertToCurrency = 'USD';
var hideOnScroll = true;
var tooltipMaxWidth = 700;

// Possible values: 'imperial', 'metric';
var preferredMetricsSystem = 'metric';

var convertMetrics = true;
var addOpenLinks = true;
var convertCurrencies = true;
var performSimpleMathOperations = true;

var secondaryColor = 'lightBlue';

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

    });

  copyLabel = chrome.i18n.getMessage("copyLabel");
  searchLabel = chrome.i18n.getMessage("searchLabel");
  openLinkLabel = chrome.i18n.getMessage("openLinkLabel");

  arrow = document.createElement('div');
  arrow.setAttribute('class', `arrow`);
  tooltip = document.createElement('div');
  tooltip.appendChild(arrow);
  document.body.appendChild(tooltip);
  tooltip.setAttribute('style', `opacity: 0.0;position: absolute; transition: opacity ${animationDuration}ms ease-in-out; `);
  tooltip.setAttribute('class', `selection-tooltip`);

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

  var copyButton = document.createElement('button');
  copyButton.setAttribute('class', `selection-popup-button button-with-border`);
  copyButton.textContent = copyLabel;
  copyButton.addEventListener("mouseup", function (e) {
    document.execCommand('copy');
    hideTooltip();
  });
  tooltip.appendChild(copyButton);
}


init();


function calculateString(fn) {
  return new Function('return ' + fn)();
}

if (hideOnScroll)
  document.addEventListener("scroll", function (e) {
    hideTooltip();
  });

document.addEventListener("mousedown", function (e) {
  hideTooltip();
});

document.addEventListener("mouseup", function (e) {
  if (window.getSelection) {
    selection = window.getSelection();
  } else if (document.selection) {
    selection = document.selection.createRange();
  }

  var selDimensions = getSelectionDimensions();
  var selectedText = selection.toString();

  if (tooltipIsShown == false && selectedText !== null && selectedText !== '' && tooltip.style.opacity !== 0.0) {

    var selectedText = selection.toString();

    /// Add 'open link' button for each found link
    if (addOpenLinks)
      if (selectedText.includes('http') || selectedText.includes('www.') || (selectedText.includes('.') && selectedText.includes('/'))) {
        var words = selectedText.split(' ');
        for (i in words) {
          var link = words[i];
          if (tooltip.clientWidth < tooltipMaxWidth && !link.includes(' ') && link.length > 6 && (link.includes('http') || link.includes('www.') || (link.includes('.') && link.includes('/')))) {
            link = link.replaceAll(',', '').replaceAll(')', '').replaceAll('(', '').replaceAll(`\n`, ' ');
            var lastSymbol = link[link.length - 1];

            if (lastSymbol == '.' || lastSymbol == ',')
              link = link.substring(0, link.length - 1);

            /// Remove '/' on the end of link, just for better looks in pop-up
            var lastSymbol = link[link.length - 1];
            if (lastSymbol == '/')
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
            linkText.textContent = ' ' + link;
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


    /// Convert units
    var numberToConvert;

    if (convertMetrics)
      outerloop: for (const [key, value] of Object.entries(convertionUnits)) {
        // if (selectedText.includes(key) || selectedText.includes(value['convertsTo'])) {
        // if (selectedText.includes(key)) {
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

            console.log('numberToConvert');
            console.log(numberToConvert);

            if (numberToConvert !== null && numberToConvert !== '' && numberToConvert !== NaN && numberToConvert !== undefined) {
              // numberToConvert = numberToConvert.join("");

              var fromUnit = preferredMetricsSystem == 'metric' ? key : value['convertsTo'];
              var convertedUnit = preferredMetricsSystem == 'metric' ? value['convertsTo'] : key;
              var convertedNumber;

              if (fromUnit.includes('°')) {
                convertedNumber = value['convertFunction'](numberToConvert);
              } else {
                convertedNumber = preferredMetricsSystem == 'metric' ? numberToConvert * value['ratio'] : numberToConvert / value['ratio'];
              }

              /// Round doubles to the first 2 symbols after dot
              // if (numberToConvert.toString().includes('.'))
              //   numberToConvert = numberToConvert.foFixed(2);
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
    var currency;
    var amount;

    if (convertCurrencies) {
      for (const [key, value] of Object.entries(currenciesList['results'])) {
        // if (selectedText.toLowerCase().includes(value["id"].toLowerCase()) || selectedText.includes(value["currencySymbol"])) {
        if (selectedText.includes(value["currencySymbol"])) {
          currency = key;
          // try {
          //   amount = calculateString(selectedText);
          // } catch (e) { }
          // amount = selectedText.match(/\d/g);
          amount = selectedText.match(/[+-]?\d+(\.\d)?/g);
          if (amount !== null)
            amount = amount.join("");
          break;
        }
      }

      if (currency !== undefined && currency !== convertToCurrency && amount !== null && amount.split('.').length < 3) {
        convertCurrency(amount, currency, convertToCurrency, function (err, convertedAmount) {
          if (convertedAmount !== 'NaN') {
            var interactiveButton = document.createElement('button');
            interactiveButton.setAttribute('class', `selection-popup-button button-with-border open-link-button`);
            interactiveButton.textContent = amount + ' ' + currency + ' →';

            var converted = document.createElement('span');
            converted.textContent = ` ${convertedAmount} ${convertToCurrency}`;
            converted.setAttribute('style', `color: ${secondaryColor}`);
            interactiveButton.appendChild(converted);

            interactiveButton.addEventListener("mouseup", function (e) {
              hideTooltip();

              /// Search for conversion on Google
              window.open(`https://www.google.com/search?q=${amount + ' ' + currency} to ${convertToCurrency}`, '_blank');
              ;
            });

            tooltip.appendChild(interactiveButton);
            // tooltip.style.left = `${(parseInt(tooltip.style.left.replaceAll('px', ''), 10) - interactiveButton.clientWidth) * 2}px`;

            tooltip.style.left = `${(parseFloat(tooltip.style.left.replaceAll('px', ''), 10) - (interactiveButton.clientWidth / 2))}px`;
          }

        });
      }

    }

    /// Show tooltip
    showTooltip(selDimensions.dx + (selDimensions.width / 2) - (tooltip.clientWidth / 2), selDimensions.dy - tooltip.clientHeight - arrow.clientHeight + window.scrollY);

  }
  else hideTooltip();
});


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
      cb(err);
    }
  } catch (e) {
    console.log("Currency conversion error: ", e);
    cb(e);
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
  "mile": {
    "convertsTo": "km",
    "ratio": 1.60934,
  },
  "yard": {
    "convertsTo": "m",
    "ratio": 0.9144,
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
};


var currenciesList = {
  "results":
  {
    "USD": { "currencyName": "United States Dollar", "currencySymbol": "$", "id": "USD" },
    "EUR": { "currencyName": "Euro", "currencySymbol": "€", "id": "EUR" },
    "CNY": { "currencyName": "Chinese Yuan", "currencySymbol": "¥", "id": "CNY" },
    "UAH": { "currencyName": "Ukrainian Hryvnia", "currencySymbol": "₴", "id": "UAH" },
    "руб": { "currencyName": "Russian Ruble", "currencySymbol": "₽", "id": "RUB" },
    "BTC": { "currencyName": "Bitcoin", "currencySymbol": "BTC", "id": "BTC" },
    "GBP": { "currencyName": "British Pound", "currencySymbol": "£", "id": "GBP" },
    "INR": { "currencyName": "Indian Rupee", "currencySymbol": "₹", "id": "INR" },
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
    "JPY": { "currencyName": "Japanese Yen", "currencySymbol": "¥", "id": "JPY" }, "KPW": { "currencyName": "North Korean Won", "currencySymbol": "₩", "id": "KPW" },
    "SAR": { "currencyName": "Saudi Riyal", "currencySymbol": "﷼", "id": "SAR" },
    "BGN": { "currencyName": "Bulgarian Lev", "currencySymbol": "лв", "id": "BGN" },
  }
}


