/// TODO: 
/// 1. Collapsible sections
/// 2. On Firefox, using options page as a popup causes a bug - color picker closes the popup on init, and therefore selected color isn't saved

var options = new Map([
    // ['animationDuration', 300],
    // ['convertToCurrency', 'USD'],
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
    ['enabled', true],
    ['hideOnKeypress', true],
    ['preferredSearchEngine', 'google'],
    ['showOnMapButtonEnabled', true],
    ['showEmailButton', true],
    ['preferredNewEmailMethod', 'mailto'],
    ['customSearchUrl', ''],
    ['addColorPreviewButton', true],
    ['preferredMapsService', 'google'],
    ['secondaryTooltipEnabled', true],
    ['secondaryTooltipIconSize', 15],
    ['showSecondaryTooltipTitleOnHover', false],
    ['excludedDomains', ''],
    ['addPhoneButton', true],
    ['showUnconvertedValue', true],
    ['addScaleUpEffect', true],
    ['debugMode', false],
    ['addDragHandles', false],
    // ['addButtonIcons', false],
    ['buttonsStyle', 'onlylabel'],
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
                            else if (chrome.i18n.getMessage(option['value']) !== (null || undefined || ''))
                                option.innerHTML = chrome.i18n.getMessage(option['value']);
                            if (option.value == selectedValue) option.setAttribute('selected', true);
                        });
                }
                else {
                    input.setAttribute('value', result[key] ?? value);
                }

                /// Set translated label for input
                if (!input.parentNode.innerHTML.includes(chrome.i18n.getMessage(key))) {
                    if (input.tagName == 'SELECT' || input.id == 'excludedDomains')
                        input.parentNode.innerHTML = chrome.i18n.getMessage(key) + ': <br />' + input.parentNode.innerHTML;
                    else
                        input.parentNode.innerHTML += chrome.i18n.getMessage(key);

                }
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
        document.querySelector("#actionButtonsHeader").innerHTML = chrome.i18n.getMessage("contextualButtonsHeader");
        document.querySelector("#customSearchTooltip").innerHTML = chrome.i18n.getMessage("customSearchTooltip");
        document.querySelector("#customSearchTooltipHint").innerHTML = chrome.i18n.getMessage("customSearchTooltipHint");
        document.querySelector("#allChangesSavedAutomaticallyHeader").innerHTML = chrome.i18n.getMessage("allChangesSavedAutomatically");

        /// Translate footer buttons
        document.querySelector("#resetButton").innerHTML = chrome.i18n.getMessage("resetDefaults");
        document.querySelector("#githubButton").innerHTML = chrome.i18n.getMessage("visitGithub") + document.querySelector("#githubButton").innerHTML;
        document.querySelector("#donateButton").innerHTML = chrome.i18n.getMessage("buyMeCoffee") + document.querySelector("#donateButton").innerHTML;

        /// Set custom style for 'Excluded domains' textfield
        var excludedDomainsTextfield = document.querySelector("#excludedDomains");
        excludedDomainsTextfield.setAttribute('placeholder', 'example.com, another.example.com');
        excludedDomainsTextfield.style.maxWidth = '200px';


        /// Reduce opacity for not available options
        updateDisabledOptions();

        loadCustomSearchButtons();

        setCurrenciesDropdown();

        setCollapsibleHeaders();
    }

}

function setCurrenciesDropdown() {
    chrome.storage.local.get(['convertToCurrency'], function (result) {

        var initialValue = result.convertToCurrency || 'USD';

        var select = document.getElementById('convertToCurrencyDropdown');

        Object.keys(availableCurrencies).forEach((function (key) {
            var option = document.createElement('option');
            option.innerHTML = key + ' — ' + availableCurrencies[key]['currencyName'];
            option.setAttribute('value', key);
            select.appendChild(option);

            if (option.value == initialValue) option.setAttribute('selected', true);
        }));

        select.parentNode.innerHTML = chrome.i18n.getMessage('convertToCurrency') + '<br />' + select.parentNode.innerHTML;


        setTimeout(function () {
            document.getElementById('convertToCurrencyDropdown').addEventListener("input", function (e) {
                var selectInput = document.getElementById('convertToCurrencyDropdown');
                chrome.storage.local.set({ 'convertToCurrency': selectInput.value.split(' — ')[0] });
            });
        }, 300);
    });


}

var customSearchButtonsList;

function loadCustomSearchButtons() {
    chrome.storage.local.get(['customSearchButtons'], function (value) {
        customSearchButtonsList = value.customSearchButtons ?? [
            {
                'url': 'https://www.youtube.com/results?search_query=%s',
                'title': 'YouTube',
                'enabled': true,
            },
            {
                'url': 'https://open.spotify.com/search/%s',
                'title': 'Spotify',
                'enabled': true,
            },
            {
                'url': 'https://aliexpress.com/wholesale?SearchText=%s',
                'title': 'Aliexpress',
                // 'icon': 'https://symbols.getvecta.com/stencil_73/76_aliexpress-icon.a7d3b2e325.png',
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

        generateCustomSearchButtonsList();
    });
}

function updateDisabledOptions() {
    document.querySelector("#all-options-container").className = document.querySelector("#enabled").checked ? 'enabled-option' : 'disabled-option';
    // document.querySelector("#convertToCurrency").parentNode.className = document.querySelector("#convertCurrencies").checked ? 'enabled-option' : 'disabled-option';
    document.querySelector("#convertToCurrencyDropdown").parentNode.className = document.querySelector("#convertCurrencies").checked ? 'enabled-option' : 'disabled-option';
    document.querySelector("#preferredMetricsSystem").parentNode.className = document.querySelector("#convertMetrics").checked ? 'enabled-option' : 'disabled-option';
    document.querySelector("#languageToTranslate").parentNode.className = document.querySelector("#showTranslateButton").checked ? 'enabled-option' : 'disabled-option';
    document.querySelector("#customStylesSection").className = document.querySelector("#useCustomStyle").checked ? 'enabled-option' : 'disabled-option';
    document.querySelector("#shadowOpacity").parentNode.className = document.querySelector("#addTooltipShadow").checked ? 'enabled-option' : 'disabled-option';
    document.querySelector("#textSelectionBackground").parentNode.className = document.querySelector("#changeTextSelectionColor").checked ? 'enabled-option' : 'disabled-option';
    document.querySelector("#textSelectionColor").parentNode.className = document.querySelector("#changeTextSelectionColor").checked ? 'enabled-option' : 'disabled-option';
    document.querySelector("#preferredNewEmailMethod").parentNode.className = document.querySelector("#showEmailButton").checked ? 'enabled-option' : 'disabled-option';
    document.querySelector("#preferredMapsService").parentNode.className = document.querySelector("#showOnMapButtonEnabled").checked ? 'enabled-option' : 'disabled-option';
    document.querySelector("#customSearchUrl").parentNode.parentNode.className = document.querySelector("#preferredSearchEngine").value == 'custom' ? 'option visible-option' : 'option hidden-option';
    document.querySelector("#customSearchButtonsContainer").className = document.querySelector("#secondaryTooltipEnabled").checked ? 'visible-option' : 'hidden-option';
    document.querySelector("#secondaryTooltipIconSize").parentNode.className = document.querySelector("#secondaryTooltipEnabled").checked ? 'enabled-option' : 'disabled-option';
    document.querySelector("#showSecondaryTooltipTitleOnHover").parentNode.className = document.querySelector("#secondaryTooltipEnabled").checked ? 'enabled-option' : 'disabled-option';
}

function setCollapsibleHeaders() {
    var coll = document.getElementsByClassName("collapsible-header");
    var i;

    for (i = 0; i < coll.length; i++) {
        coll[i].addEventListener("click", function () {
            this.classList.toggle("active");
            var content = this.nextElementSibling;
            if (content.style.maxHeight) {
                content.style.maxHeight = null;
                // content.style.border = 'none';
            } else {
                content.style.maxHeight = content.scrollHeight + "px";
                // content.style.border = '1px solid #444';
            }
        });
    }
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
    /// Reset custom search engines
    customSearchButtonsList = [
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
            'icon': 'https://symbols.getvecta.com/stencil_73/76_aliexpress-icon.a7d3b2e325.png',
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
    saveCustomSearchButtons();
    setTimeout(function () {
        generateCustomSearchButtonsList();
    }, 50);


    /// Reset regular options
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
                if ((value !== null && value == true) || (value == null && value == true))
                    input.setAttribute('checked', 0);
                else input.removeAttribute('checked', 0);
            } else if (input.tagName == 'SELECT') {
                var options = input.querySelectorAll('option');
                if (options !== null)
                    options.forEach(function (option) {
                        var selectedValue = value;
                        if (chrome.i18n.getMessage(option.innerHTML) !== (null || undefined || ''))
                            option.innerHTML = chrome.i18n.getMessage(option.innerHTML);
                        if (option.value == selectedValue) option.setAttribute('selected', true);
                        else option.setAttribute('selected', false);
                    });
            }
            else {
                input.setAttribute('value', value);
            }
        }
    });

}

function generateCustomSearchButtonsList() {
    var container = document.getElementById('customSearchButtonsContainer');
    container.innerHTML = '';

    for (var i = 0; i < customSearchButtonsList.length; i++) {
        var item = customSearchButtonsList[i];

        var entry = document.createElement('div');
        entry.setAttribute('class', 'option');

        /// Enabled checkbox
        var checkbox = document.createElement('input');
        checkbox.setAttribute('type', 'checkbox');
        checkbox.setAttribute('style', 'pointer: cursor; vertical-align: middle !important;');
        checkbox.value = item['enabled'];
        if (item['enabled'])
            checkbox.setAttribute('checked', 0);
        else checkbox.removeAttribute('checked', 0);
        checkbox.setAttribute('id', 'checkbox' + i.toString());
        checkbox.addEventListener("input", function (e) {
            customSearchButtonsList[parseInt(this.id.replaceAll('checkbox', ''))]['enabled'] = this.checked;
            saveCustomSearchButtons();
        });
        entry.appendChild(checkbox);

        /// Create favicon preview
        var imgButton = document.createElement('img');
        var icon = item['icon'];
        imgButton.setAttribute('src', icon !== null && icon !== undefined && icon !== '' ? icon : 'https://www.google.com/s2/favicons?domain=' + item['url'].split('/')[2])
        imgButton.setAttribute('width', '18px');
        imgButton.setAttribute('height', '18px');
        imgButton.setAttribute('style', 'margin-left: 3px; padding: 1px; vertical-align: middle !important;');
        entry.appendChild(imgButton);

        /// Title field
        // var title = document.createElement('input');
        // title.setAttribute('type', 'text');
        // title.setAttribute('placeholder', 'Title');
        // title.setAttribute('style', 'max-width: 90px; margin: 0px 6px;');
        // title.value = item['title'];
        // title.setAttribute('id', 'title' + i.toString());
        // title.addEventListener("input", function (e) {
        //     // alert(this.id.replaceAll('title', ''));
        //     customSearchButtonsList[parseInt(this.id.replaceAll('title', ''))]['title'] = this.value;
        //     saveCustomSearchButtons();
        // });
        // entry.appendChild(title);

        /// URL field
        var urlInput = document.createElement('input');
        urlInput.setAttribute('type', 'text');
        urlInput.setAttribute('placeholder', 'URL');
        // urlInput.setAttribute('style', 'min-width: 320px; max-width: 320px !important;  margin: 0px 6px;');
        urlInput.setAttribute('style', 'display: block; min-width: 99%; max-width: 99% !important;  margin: 0px 3px;');
        urlInput.value = item['url'];
        urlInput.setAttribute('id', 'url' + i.toString());
        urlInput.addEventListener("input", function (e) {
            customSearchButtonsList[parseInt(this.id.replaceAll('url', ''))]['url'] = this.value;
            saveCustomSearchButtons();
        });
        entry.appendChild(urlInput);

        /// Custom icon URL field
        if (item['icon'] !== null && item['icon'] !== undefined) {

            var iconInputDiv = document.createElement('div');

            /// Custom icon URL field
            var iconInput = document.createElement('input');
            iconInput.setAttribute('type', 'text');
            iconInput.setAttribute('placeholder', chrome.i18n.getMessage("customIconUrl"));
            iconInput.setAttribute('style', 'min-width: 80%; max-width: 80% !important;  margin: 0px 3px;');
            iconInput.setAttribute('id', 'icon' + i.toString());
            iconInput.value = item['icon'];
            iconInput.addEventListener("input", function (e) {
                customSearchButtonsList[parseInt(this.id.replaceAll('icon', ''))]['icon'] = this.value;
                saveCustomSearchButtons();
            });
            iconInputDiv.appendChild(iconInput);

            /// Remove custom icon button
            var removeCustomIconButton = document.createElement('button');
            removeCustomIconButton.textContent = '✕';
            removeCustomIconButton.setAttribute('title', chrome.i18n.getMessage("removeCustomIcon"));
            removeCustomIconButton.setAttribute('style', ' max-width: 1px !important;  margin: 0px 6px;padding: 1px; align-items: center');
            removeCustomIconButton.setAttribute('id', 'useCustomIcon' + i.toString());
            removeCustomIconButton.onmouseup = function () {
                customSearchButtonsList[parseInt(this.id.replaceAll('useCustomIcon', ''))]['icon'] = null;
                saveCustomSearchButtons();
                generateCustomSearchButtonsList();
            };
            iconInputDiv.appendChild(removeCustomIconButton);

            entry.appendChild(iconInputDiv);
        }

        /// Move up/down buttons
        var moveButtonsContainer = document.createElement('div');
        moveButtonsContainer.setAttribute('style', 'display: inline');

        var moveUpButton = document.createElement('button');
        moveUpButton.textContent = 'ᐱ';
        moveUpButton.setAttribute('style', 'max-width: 1px; padding: 1px; align-items: center');
        moveUpButton.setAttribute('id', 'moveup' + i.toString());
        moveUpButton.setAttribute('title', chrome.i18n.getMessage("moveUpLabel"));
        moveUpButton.onmouseup = function () {
            var currentIndex = parseInt(this.id.replaceAll('moveup', ''), 10);
            if (currentIndex > 0) {
                var movedItem = customSearchButtonsList[currentIndex];
                customSearchButtonsList.splice(currentIndex, 1);
                customSearchButtonsList.splice(currentIndex - 1, 0, movedItem);
                saveCustomSearchButtons();
                generateCustomSearchButtonsList();
            }
        };

        var moveDownButton = document.createElement('button');
        moveDownButton.textContent = 'ᐯ';
        moveDownButton.setAttribute('style', 'max-width: 1px; padding: 1px; align-items: center');
        moveDownButton.setAttribute('id', 'movedown' + i.toString());
        moveDownButton.setAttribute('title', chrome.i18n.getMessage("moveDownLabel"));
        moveDownButton.onmouseup = function () {
            var currentIndex = parseInt(this.id.replaceAll('movedown', ''), 10);
            if (currentIndex < customSearchButtonsList.length) {
                var movedItem = customSearchButtonsList[currentIndex];
                customSearchButtonsList.splice(currentIndex, 1);
                customSearchButtonsList.splice(currentIndex + 1, 0, movedItem);
                saveCustomSearchButtons();
                generateCustomSearchButtonsList();
            }
        };
        moveButtonsContainer.appendChild(moveUpButton);
        moveButtonsContainer.appendChild(moveDownButton);
        entry.appendChild(moveButtonsContainer);

        /// 'Use custom icon' button
        if (item['icon'] == null || item['icon'] == undefined) {
            var useCustomIconButton = document.createElement('button');
            useCustomIconButton.textContent = chrome.i18n.getMessage("customIcon");
            useCustomIconButton.setAttribute('style', 'display: inline-block; max-width: 150px;');
            useCustomIconButton.setAttribute('id', 'useCustomIcon' + i.toString());
            useCustomIconButton.onmouseup = function () {
                customSearchButtonsList[parseInt(this.id.replaceAll('useCustomIcon', ''))]['icon'] = '';
                // saveCustomSearchButtons();
                generateCustomSearchButtonsList();
            };
            entry.appendChild(useCustomIconButton);
        }

        /// Delete button
        var deleteButton = document.createElement('button');
        deleteButton.textContent = chrome.i18n.getMessage("deleteLabel");
        deleteButton.setAttribute('style', 'display: inline-block; max-width: 100px;');
        deleteButton.setAttribute('id', 'delete' + i.toString());
        deleteButton.onmouseup = function () {
            var index = parseInt(this.id.replaceAll('delete', ''));
            if (customSearchButtonsList[index] !== null && customSearchButtonsList[index] !== undefined) {
                customSearchButtonsList.splice(parseInt(this.id.replaceAll('delete', ''), 10), 1);
                saveCustomSearchButtons();
                generateCustomSearchButtonsList();
            }

        };
        entry.appendChild(deleteButton);

        container.appendChild(entry);
    }

    var addButton = document.createElement('button');
    addButton.textContent = chrome.i18n.getMessage("addNewSearchOption") + ' ＋';
    addButton.onmouseup = function () {
        customSearchButtonsList.push({
            'url': '',
            'title': '',
            'enabled': true,
            // 'icon': ''
        });
        saveCustomSearchButtons();
        generateCustomSearchButtonsList();
    };
    container.appendChild(addButton);
}

function saveCustomSearchButtons() {
    chrome.storage.local.set({ 'customSearchButtons': customSearchButtonsList });
}

document.addEventListener("DOMContentLoaded", loadSettings);
document.querySelector("form").addEventListener("reset", resetSettings);
document.querySelector("#donateButton").addEventListener("click", function (val) {
    window.open('https://emvaized.diaka.ua/donate', '_blank');
});
document.querySelector("#githubButton").addEventListener("click", function (val) {
    window.open('https://github.com/emvaized/selecton-extension', '_blank');
});





var availableCurrencies = {
    "AUD": { currencyName: "Australian Dollar", currencySymbol: "A$", id: "AUD", rate: 1.29009 },
    "BGN": { currencyName: "Bulgarian Lev", currencySymbol: "лв", id: "BGN", rate: 1.640562 },
    "BRL": { currencyName: "Brazilian real", currencySymbol: "R$", id: "BRL", rate: 5.616101 },
    "BTC": { currencyName: "Bitcoin", currencySymbol: "BTC", id: "BTC", rate: 0.000018 },
    "BYN": { currencyName: "Belarussian Ruble", currencySymbol: "белорусских рублей", id: "BYN", rate: 2.596137 },
    "CAD": { currencyName: "Canadian Dollar", currencySymbol: "C$", id: "CAD", rate: 1.269384 },
    "CHF": { currencyName: "Swiss Franc", currencySymbol: "CHF", id: "CHF", rate: 0.926525 },
    "CNY": { currencyName: "Chinese Yuan", currencySymbol: "¥", id: "CNY", rate: 6.497301 },
    "CRC": { currencyName: "Costa Rican Colon", currencySymbol: "₡", id: "CRC", rate: 610.339772 },
    "CZK": { currencyName: "Czech Koruna", currencySymbol: "Kč", id: "CZK", rate: 21.936455 },
    "DKK": { currencyName: "Danish Krone", currencySymbol: "kr", id: "DKK", rate: 6.229502 },
    "EUR": { currencyName: "Euro", currencySymbol: "€", id: "EUR", rate: 0.8378 },
    "GBP": { currencyName: "British Pound", currencySymbol: "£", id: "GBP", rate: 0.721124 },
    "HKD": { currencyName: "Hong Kong dollar", currencySymbol: "HK$", id: "HKD", rate: 7.765632 },
    "ILS": { currencyName: "Israeli New Sheqel", currencySymbol: "₪", id: "ILS", rate: 3.310401 },
    "INR": { currencyName: "Indian Rupee", currencySymbol: "₹", id: "INR", rate: 72.452006 },
    "IRR": { currencyName: "Iranian Rial", currencySymbol: "﷼", id: "IRR", rate: 42105.017329 },
    "JPY": { currencyName: "Japanese Yen", currencySymbol: "¥", id: "JPY", rate: 109.188027 },
    "KPW": { currencyName: "North Korean Won", currencySymbol: "₩", id: "KPW", rate: 900.00022 },
    "KZT": { currencyName: "Kazakhstani Tenge", currencySymbol: "лв", id: "KZT", rate: 418.821319 },
    "MNT": { currencyName: "Mongolian Tugrik", currencySymbol: "₮", id: "MNT", rate: 2849.930035 },
    "MXN": { currencyName: "Mexican Peso", currencySymbol: "peso", id: "MXN", rate: 20.655212 },
    "NGN": { currencyName: "Nigerian Naira", currencySymbol: "₦", id: "NGN", rate: 410.317377 },
    "NOK": { currencyName: "Norwegian Krone", currencySymbol: " kr", id: "NOK", rate: 8.51191 },
    "PLN": { currencyName: "Polish złoty", currencySymbol: "zł", id: "PLN", rate: 3.845051 },
    "RUB": { currencyName: "Russian Ruble", currencySymbol: "₽", id: "RUB", rate: 72.880818 },
    "SAR": { currencyName: "Saudi Riyal", currencySymbol: "﷼", id: "SAR", rate: 3.750694 },
    "SEK": { currencyName: "Swedish Krona", currencySymbol: " kr", id: "SEK", rate: 8.514027 },
    "TRY": { currencyName: "Turkish Lira", currencySymbol: "₺", id: "TRY", rate: 0.14 },
    "UAH": { currencyName: "Ukrainian Hryvnia", currencySymbol: "₴", id: "UAH", rate: 27.852288 },
    "USD": { currencyName: "United States Dollar", currencySymbol: "$", id: "USD", rate: 1 },
    "VND": { currencyName: "Vietnamese Dong", currencySymbol: "₫", id: "VND", rate: 23054.385489 },
    "ZAR": { currencyName: "Rand", currencySymbol: "ZAR", id: "ZAR", rate: 14.856969 },
}