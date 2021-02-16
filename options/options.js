
var options = new Map([
    ['currencyConversionApiKey', '3af8bf98aa005167fd3d'],
    ['animationDuration', 300],
    ['convertToCurrency', 'USD'],
    ['hideOnScroll', true],
    ['convertMetrics', true],
    ['addOpenLinks', true],
    ['convertCurrencies', true],
    ['performSimpleMathOperations', true],
    ['preferredMetricsSystem', 'metric'],
    ['showTranslateButton', true],
    ['languageToTranslate', 'en'],
]);

var keys = [...options.keys()];

function restoreOptions() {
    var ids = [];
    keys.forEach(function (key) {
        ids.push('#' + key);
    });

    chrome.storage.local.get(keys, setInputs);

    function setInputs(result) {
        options.forEach(function (value, key) {
            var input = document.getElementById(key);

            /// Set input value
            if (input !== null && input !== undefined) {
                if (input.type == 'checkbox') {
                    if ((result[key] !== null && result[key] == true) || (result[key] == null && value == true))
                        input.setAttribute('checked', 0)
                } else if (input.tagName == 'SELECT') {
                    var options = input.querySelectorAll('option');
                    if (options !== null)
                        options.forEach(function (option) {
                            var selectedValue = result[key] ?? value;
                            option.innerHTML = chrome.i18n.getMessage(option.innerHTML);
                            if (option.value == selectedValue) option.setAttribute('selected', true);
                        });
                }
                else {
                    input.setAttribute('value', result[key] ?? value);
                }

                /// Set translated label for input
                if (!input.parentNode.innerHTML.includes(chrome.i18n.getMessage(key)))
                    input.parentNode.innerHTML += chrome.i18n.getMessage(key);
            }
        });

        var inputs = document.querySelectorAll(ids.join(','));
        inputs.forEach(function (input) {
            input.addEventListener("input", function (e) {
                saveAllOptions();
                updateDisabledOptions();
            });
        });

        /// Set translated headers
        document.querySelector("#appearanceHeader").innerHTML = chrome.i18n.getMessage("appearanceHeader");
        document.querySelector("#convertionHeader").innerHTML = chrome.i18n.getMessage("convertionHeader");
        document.querySelector("#currencyConversionApiKeyDescription").innerHTML = chrome.i18n.getMessage("currencyConversionApiKeyDescription");
        document.querySelector("#allChangesSavedAutomaticallyHeader").innerHTML = chrome.i18n.getMessage("allChangesSavedAutomatically");

        /// Translate footer buttons
        document.querySelector("#resetButton").innerHTML = chrome.i18n.getMessage("resetDefaults");
        document.querySelector("#githubButton").innerHTML = chrome.i18n.getMessage("visitGithub") + document.querySelector("#githubButton").innerHTML;
        document.querySelector("#donateButton").innerHTML = chrome.i18n.getMessage("buyMeCoffee") + document.querySelector("#donateButton").innerHTML;

        updateDisabledOptions();
    }
}

function updateDisabledOptions() {
    document.querySelector("#convertToCurrency").parentNode.className = document.querySelector("#convertCurrencies").checked ? 'enabled-option' : 'disabled-option';
    document.querySelector("#currencyConversionApiKey").parentNode.className = document.querySelector("#convertCurrencies").checked ? 'enabled-option' : 'disabled-option';
    document.querySelector("#currencyConversionApiKeyDescription").parentNode.className = document.querySelector("#convertCurrencies").checked ? 'enabled-option' : 'disabled-option';
    document.querySelector("#preferredMetricsSystem").parentNode.className = document.querySelector("#convertMetrics").checked ? 'enabled-option' : 'disabled-option';
    document.querySelector("#languageToTranslate").parentNode.className = document.querySelector("#showTranslateButton").checked ? 'enabled-option' : 'disabled-option';
}

function saveAllOptions() {
    var dataToSave = {};

    keys.forEach(function (key) {
        var input = document.querySelector(`#${key}`);
        dataToSave[key] = input.type == 'checkbox' ? input.checked : input.value;
    });

    chrome.storage.local.set(dataToSave);
}


function resetOptions() {
    var dataToSave = {};
    options.forEach(function (value, key) {
        dataToSave[key] = value;
    });

    chrome.storage.local.set(dataToSave);
    restoreOptions();
}


document.addEventListener("DOMContentLoaded", restoreOptions);
document.querySelector("form").addEventListener("reset", resetOptions);
document.querySelector("#donateButton").addEventListener("click", function (val) {
    window.open('https://emvaized.diaka.ua/donate', '_blank');
});
document.querySelector("#githubButton").addEventListener("click", function (val) {
    window.open('https://github.com/emvaized/selection-actions-extension', '_blank');
});
