
var options = new Map([
    ['animationDuration', 300],
    ['convertToCurrency', 'USD'],
    ['hideOnScroll', true],
    ['convertMetrics', true],
    ['addOpenLinks', true],
    ['convertCurrencies', true],
    ['performSimpleMathOperations', true],
    ['preferredMetricsSystem', 'metric'],
    ['showTranslateButton', true],
    ['languageToTranslate', navigator.language || navigator.userLanguage || 'en'],
    ['useCustomStyle', false],
    ['tooltipBackground', '#3B3B3B'],
    ['tooltipOpacity', 1.0],
    ['addTooltipShadow', false],
    ['shadowOpacity', 0.5],
    ['borderRadius', 3],
    ['changeTextSelectionColor', false],
    ['textSelectionBackground', '#338FFF'],
    ['textSelectionColor', '#ffffff'],
    ['shiftTooltipWhenWebsiteHasOwn', true],
    ['addActionButtonsForTextFields', false],
    ['removeSelectionOnActionButtonClick', true],
    ['draggableTooltip', true],
    ['addButtonIcons', false],
    ['enabled', true],
    ['hideOnKeypress', true],
    ['preferredSearchEngine', 'google'],
]);

var keys = [...options.keys()];

function loadSettings() {
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
                        input.setAttribute('checked', 0);
                    else input.removeAttribute('checked', 0);
                } else if (input.tagName == 'SELECT') {
                    var options = input.querySelectorAll('option');
                    if (options !== null)
                        options.forEach(function (option) {
                            var selectedValue = result[key] ?? value;
                            if (chrome.i18n.getMessage(option.innerHTML) !== (null || undefined || ''))
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
                saveAllSettings();
                updateDisabledOptions();
            });
        });

        /// Set translated headers
        document.querySelector("#appearanceHeader").innerHTML = chrome.i18n.getMessage("appearanceHeader");
        document.querySelector("#behaviorHeader").innerHTML = chrome.i18n.getMessage("behaviorHeader");
        document.querySelector("#convertionHeader").innerHTML = chrome.i18n.getMessage("convertionHeader");
        document.querySelector("#actionButtonsHeader").innerHTML = chrome.i18n.getMessage("actionButtonsHeader");
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
    document.querySelector("#preferredMetricsSystem").parentNode.className = document.querySelector("#convertMetrics").checked ? 'enabled-option' : 'disabled-option';
    document.querySelector("#languageToTranslate").parentNode.className = document.querySelector("#showTranslateButton").checked ? 'enabled-option' : 'disabled-option';
    document.querySelector("#customStylesSection").className = document.querySelector("#useCustomStyle").checked ? 'enabled-option' : 'disabled-option';
    document.querySelector("#shadowOpacity").parentNode.className = document.querySelector("#addTooltipShadow").checked ? 'enabled-option' : 'disabled-option';
    document.querySelector("#textSelectionBackground").parentNode.className = document.querySelector("#changeTextSelectionColor").checked ? 'enabled-option' : 'disabled-option';
    document.querySelector("#textSelectionColor").parentNode.className = document.querySelector("#changeTextSelectionColor").checked ? 'enabled-option' : 'disabled-option';
}

function saveAllSettings() {
    var dataToSave = {};

    keys.forEach(function (key) {
        var input = document.querySelector(`#${key}`);
        dataToSave[key] = input.type == 'checkbox' ? input.checked : input.value;
    });

    chrome.storage.local.set(dataToSave);
}

function resetSettings() {
    var dataToSave = {};
    options.forEach(function (value, key) {
        dataToSave[key] = value;
    });

    chrome.storage.local.set(dataToSave);

    options.forEach(function (value, key) {
        var input = document.getElementById(key);

        /// Set input value
        if (input !== null && input !== undefined) {
            if (input.type == 'checkbox') {
                if ((result[key] !== null && result[key] == true) || (result[key] == null && value == true))
                    input.setAttribute('checked', 0);
                else input.removeAttribute('checked', 0);
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
        }
    });
}

document.addEventListener("DOMContentLoaded", loadSettings);
document.querySelector("form").addEventListener("reset", resetSettings);
document.querySelector("#donateButton").addEventListener("click", function (val) {
    window.open('https://emvaized.diaka.ua/donate', '_blank');
});
document.querySelector("#githubButton").addEventListener("click", function (val) {
    window.open('https://github.com/emvaized/selecton-extension', '_blank');
});
