/// TODO: 
/// 1. On Firefox, using options page as a popup causes a bug - color picker closes the popup on init, and therefore selected color isn't saved
/// Those are used on settings page

let userConfigs;
const expandedSettingsSections = [];

var keys = Object.keys(configs);

function loadSettings() {

    /// Load expanded sections list
    chrome.storage.local.get(['expandedSettingsSections'], function (val) {
        console.log(val.expandedSettingsSections);
        if (val.expandedSettingsSections !== null && val.expandedSettingsSections !== undefined)
            val.expandedSettingsSections.forEach(function (v) {
                expandedSettingsSections.push(v);
            })
    });

    // var ids = [];
    // keys.forEach(function (key) {
    //     ids.push('#' + key);
    // });

    /// Load configs
    chrome.storage.local.get(keys, setInputs);

    function setInputs(result) {
        userConfigs = result;

        keys.forEach(function (key) {
            // const input = document.getElementById(key);
            var input = document.querySelector('#' + key.toString());

            /// Set input value
            if (input !== null && input !== undefined) {
                if (input.type == 'checkbox') {
                    if ((result[key] !== null && result[key] == true) || (result[key] == null && configs[key] == true))
                        input.setAttribute('checked', 0);
                    else input.removeAttribute('checked', 0);
                } else if (input.tagName == 'SELECT') {
                    var options = input.querySelectorAll('option');
                    if (options !== null)
                        options.forEach(function (option) {
                            var selectedValue = result[key] ?? configs[key];
                            if (chrome.i18n.getMessage(option.innerHTML) !== (null || undefined || ''))
                                option.innerHTML = chrome.i18n.getMessage(option.innerHTML);
                            else if (chrome.i18n.getMessage(option['value']) !== (null || undefined || ''))
                                option.innerHTML = chrome.i18n.getMessage(option['value']);
                            if (option.value == selectedValue) option.setAttribute('selected', true);
                        });
                } else {
                    input.setAttribute('value', result[key] ?? configs[key]);
                }

                /// Set translated label for input
                if (!input.parentNode.innerHTML.includes(chrome.i18n.getMessage(key))) {
                    if (input.tagName == 'SELECT' || input.id == 'excludedDomains' || input.id == 'wordSnappingBlacklist')
                        input.parentNode.innerHTML = chrome.i18n.getMessage(key) + ': <br />' + input.parentNode.innerHTML;
                    else
                        input.parentNode.innerHTML += chrome.i18n.getMessage(key);
                }

                input = document.querySelector('#' + key.toString());

                /// Set event listener
                input.addEventListener("input", function (e) {
                    let id = input.getAttribute('id');
                    let inputValue = input.getAttribute('type') == 'checkbox' ? input.checked : input.value;
                    userConfigs[id] = inputValue;

                    saveAllSettings();
                    updateDisabledOptions();
                });

            }
        });

        /// Set event listeners
        // var inputs = document.querySelectorAll(ids.join(','));
        // inputs.forEach(function (input) {
        //     input.addEventListener("input", function (e) {
        //         let id = input.getAttribute('id');
        //         let inputValue = input.getAttribute('type') == 'checkbox' ? input.checked : input.value;
        //         userConfigs[id] = inputValue;

        //         saveAllSettings();
        //         updateDisabledOptions();
        //     });
        // });

        /// Set custom style for 'Excluded domains' textfields
        var excludedDomainsTextfields = document.querySelectorAll("#excludedDomains, #wordSnappingBlacklist");
        excludedDomainsTextfields.forEach(function (excludedDomainsTextfield) {
            excludedDomainsTextfield.setAttribute('placeholder', 'example.com, another.example.com');
            excludedDomainsTextfield.style.maxWidth = '200px';
        })


        setTranslatedLabels();

        updateDisabledOptions();

        loadCustomSearchButtons();

        setCurrenciesDropdown();

        setLanguagesDropdown();

        setCollapsibleHeaders();

        setVersionLabel();
    }
}

function setTranslatedLabels() {
    /// Set translated headers
    document.querySelector("#appearanceHeader").innerHTML = chrome.i18n.getMessage("appearanceHeader");
    document.querySelector("#behaviorHeader").innerHTML = chrome.i18n.getMessage("behaviorHeader");
    document.querySelector("#convertionHeader").innerHTML = chrome.i18n.getMessage("convertionHeader");
    document.querySelector("#actionButtonsHeader").innerHTML = chrome.i18n.getMessage("contextualButtonsHeader");
    document.querySelector("#customSearchTooltip").innerHTML = chrome.i18n.getMessage("customSearchTooltip");
    document.querySelector("#customSearchTooltipHint").innerHTML = chrome.i18n.getMessage("customSearchTooltipHint").replaceAll('<br/>', '<br/> •  ');
    document.querySelector("#selectionHeader").innerHTML = chrome.i18n.getMessage("selectionHeader");
    document.querySelector("#customSearchButtonsHeader").innerHTML = chrome.i18n.getMessage("customSearchButtonsHeader");

    /// "All changes saved automatically" block
    // var infoCircle = document.createElement('div');
    // infoCircle.textContent = '🛈';
    // infoCircle.setAttribute('style', 'display: inline;position: relative; top: 3px; left: 3px; color: grey; font-size: 18px;');

    let hintEl = document.querySelector("#allChangesSavedAutomaticallyHeader");
    hintEl.innerHTML = chrome.i18n.getMessage("allChangesSavedAutomatically");
    // hintEl.appendChild(infoCircle);
    hintEl.innerHTML += '.<br />';
    hintEl.innerHTML += chrome.i18n.getMessage("updatePageToSeeChanges");

    /// Translate footer buttons
    // document.querySelector("#resetButton").innerHTML = chrome.i18n.getMessage("resetDefaults");
    //document.querySelector("#writeAReviewButton").innerHTML = chrome.i18n.getMessage("writeAReview") + ' (Chrome Web Store)';
    document.querySelector("#writeAReviewButton").innerHTML = chrome.i18n.getMessage("writeAReview");
    document.querySelector("#githubButton").innerHTML = chrome.i18n.getMessage("visitGithub") + document.querySelector("#githubButton").innerHTML;
    document.querySelector("#donateButton").innerHTML = chrome.i18n.getMessage("buyMeCoffee") + document.querySelector("#donateButton").innerHTML;
}

function setVersionLabel() {
    let label = document.getElementById('selecton-version');
    var manifestData = chrome.runtime.getManifest();
    label.innerHTML = 'Selecton ' + manifestData.version + ` (<a target='_blank' href='https://github.com/emvaized/selecton-extension/blob/master/CHANGELOG.md'>${chrome.i18n.getMessage("whatsNew") ?? "What's new"}</a>)`;
}

function updateDisabledOptions() {
    /// Grey out unavailable optoins
    document.querySelector("#all-options-container").className = document.querySelector("#enabled").checked ? 'enabled-option' : 'disabled-option';
    document.querySelector("#convertToCurrencyDropdown").parentNode.className = document.querySelector("#convertCurrencies").checked ? 'enabled-option' : 'disabled-option';
    document.querySelector("#preferredMetricsSystem").parentNode.className = document.querySelector("#convertMetrics").checked ? 'enabled-option' : 'disabled-option';
    document.querySelector("#languageToTranslate").parentNode.className = document.querySelector("#showTranslateButton").checked ? 'enabled-option' : 'disabled-option';
    document.querySelector("#customStylesSection").className = document.querySelector("#useCustomStyle").checked ? 'enabled-option' : 'disabled-option';
    document.querySelector("#shadowOpacity").parentNode.className = document.querySelector("#addTooltipShadow").checked ? 'enabled-option' : 'disabled-option';
    document.querySelector("#textSelectionBackground").parentNode.className = document.querySelector("#changeTextSelectionColor").checked ? 'enabled-option' : 'disabled-option';
    document.querySelector("#textSelectionColor").parentNode.className = document.querySelector("#changeTextSelectionColor").checked ? 'enabled-option' : 'disabled-option';
    document.querySelector("#shouldOverrideWebsiteSelectionColor").parentNode.className = document.querySelector("#changeTextSelectionColor").checked ? 'enabled-option' : 'disabled-option';
    document.querySelector("#preferredNewEmailMethod").parentNode.className = document.querySelector("#showEmailButton").checked ? 'enabled-option' : 'disabled-option';
    document.querySelector("#preferredMapsService").parentNode.className = document.querySelector("#showOnMapButtonEnabled").checked ? 'enabled-option' : 'disabled-option';
    document.querySelector("#secondaryTooltipIconSize").parentNode.className = document.querySelector("#secondaryTooltipEnabled").checked ? 'enabled-option' : 'disabled-option';
    document.querySelector("#showSecondaryTooltipTitleOnHover").parentNode.className = document.querySelector("#secondaryTooltipEnabled").checked ? 'enabled-option' : 'disabled-option';
    document.querySelector("#preferCurrencySymbol").parentNode.className = document.querySelector("#convertCurrencies").checked ? 'enabled-option' : 'disabled-option';
    document.querySelector("#disableWordSnappingOnCtrlKey").parentNode.className = document.querySelector("#snapSelectionToWord").checked ? 'enabled-option' : 'disabled-option';
    document.querySelector("#dontSnapTextfieldSelection").parentNode.className = document.querySelector("#snapSelectionToWord").checked ? 'enabled-option' : 'disabled-option';
    document.querySelector("#secondaryTooltipLayout").parentNode.className = document.querySelector("#secondaryTooltipEnabled").checked ? 'enabled-option' : 'disabled-option';
    document.querySelector("#wordSnappingBlacklist").parentNode.className = document.querySelector("#snapSelectionToWord").checked ? 'enabled-option' : 'disabled-option';
    document.querySelector("#showSecondaryTooltipTitleOnHover").parentNode.className = document.querySelector("#secondaryTooltipLayout").value == 'verticalLayout' ? 'hidden-option' : 'visible-option';
    document.querySelector("#liveTranslation").parentNode.className = document.querySelector("#showTranslateButton").checked ? 'enabled-option' : 'disabled-option';
    document.querySelector("#addFontFormatButtons").parentNode.className = document.querySelector("#addActionButtonsForTextFields").checked ? 'enabled-option' : 'disabled-option';
    document.querySelector("#addPasteButton").parentNode.className = document.querySelector("#addActionButtonsForTextFields").checked ? 'enabled-option' : 'disabled-option';
    document.querySelector("#updateRatesEveryDays").parentNode.className = document.querySelector("#convertCurrencies").checked ? 'enabled-option' : 'disabled-option';
    document.querySelector("#preferredTranslateService").parentNode.className = document.querySelector("#showTranslateButton").checked ? 'enabled-option' : 'disabled-option';
    document.querySelector("#liveTranslation").parentNode.className = document.querySelector("#preferredTranslateService").value == 'google' ? 'enabled-option' : 'disabled-option';
    document.querySelector("#shiftTooltipWhenWebsiteHasOwn").parentNode.className = document.querySelector("#tooltipPosition").value == 'overCursor' ? 'disabled-option' : 'enabled-option';

    /// Fully hide options unless condition is met
    document.querySelector("#customSearchUrl").parentNode.parentNode.className = document.querySelector("#preferredSearchEngine").value == 'custom' ? 'option visible-option' : 'option hidden-option';
    document.querySelector("#customSearchButtonsContainer").className = document.querySelector("#secondaryTooltipEnabled").checked ? 'visible-option' : 'hidden-option';
    document.querySelector("#showButtonLabelOnHover").parentNode.parentNode.className = document.querySelector("#buttonsStyle").value == 'onlyicon' ? 'option visible-option' : 'option hidden-option';
}

function setCollapsibleHeaders() {
    var coll = document.getElementsByClassName("collapsible-header");
    var i;

    for (i = 0; i < coll.length; i++) {

        /// Make section initially expanded
        if (expandedSettingsSections.includes(coll[i].id)) {
            const it = coll[i];
            setTimeout(function (e) {
                it.classList.toggle("active");
                var content = it.nextElementSibling;
                content.style.maxHeight = content.scrollHeight + "px";
            }, 50);

        }

        coll[i].addEventListener("click", function () {
            this.classList.toggle("active");
            var content = this.nextElementSibling;
            if (content.style.maxHeight) {
                /// Collapse
                content.style.maxHeight = null;
                var indexInArray = expandedSettingsSections.indexOf(this.id);
                if (indexInArray > -1) {
                    expandedSettingsSections.splice(indexInArray, 1);
                }
            } else {
                /// Expand
                content.style.maxHeight = content.scrollHeight + "px";
                if (!expandedSettingsSections.includes(this.id))
                    expandedSettingsSections.push(this.id);
                // content.scrollIntoView({ block: 'nearest', inline: "end", behavior: "smooth" });
            }
            saveExpandedSections();
        });
    }
}

/// Configure additional elements

function setCurrenciesDropdown() {
    chrome.storage.local.get(['convertToCurrency'], function (result) {
        let initialValue = result.convertToCurrency || 'USD';
        let select = document.getElementById('convertToCurrencyDropdown');

        Object.keys(currenciesList).forEach((function (key) {
            let option = document.createElement('option');
            let currencySymbol = currenciesList[key]['currencySymbol'];
            option.innerHTML = key + (currencySymbol == undefined ? '' : ` (${currencySymbol})`) + ' — ' + currenciesList[key]['currencyName'];
            option.setAttribute('value', key);
            select.appendChild(option);

            if (option.value == initialValue) option.setAttribute('selected', true);
        }));

        select.parentNode.innerHTML = chrome.i18n.getMessage('convertToCurrency') + '<br />' + select.parentNode.innerHTML;

        setTimeout(function () {
            document.getElementById('convertToCurrencyDropdown').addEventListener("input", function (e) {
                let selectInput = document.getElementById('convertToCurrencyDropdown');
                chrome.storage.local.set({ 'convertToCurrency': selectInput.value.split(' — ')[0] });
            });
        }, 300);
    });
}

function setLanguagesDropdown() {
    chrome.storage.local.get(['languageToTranslate'], function (result) {
        let initialValue = result.languageToTranslate || configs.languageToTranslate;
        let select = document.getElementById('languageToTranslateDropdown');

        Object.keys(currenciesList).forEach((function (key) {
            let option = document.createElement('option');
            let currencySymbol = currenciesList[key]['currencySymbol'];
            option.innerHTML = key + (currencySymbol == undefined ? '' : ` (${currencySymbol})`) + ' — ' + currenciesList[key]['currencyName'];
            option.setAttribute('value', key);
            select.appendChild(option);

            if (option.value == initialValue) option.setAttribute('selected', true);
        }));

        select.parentNode.innerHTML = chrome.i18n.getMessage('convertToCurrency') + '<br />' + select.parentNode.innerHTML;

        setTimeout(function () {
            document.getElementById('convertToCurrencyDropdown').addEventListener("input", function (e) {
                let selectInput = document.getElementById('convertToCurrencyDropdown');
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
                // 'url': 'https://wikipedia.org/wiki/SpecialSearch?search=%s',
                'url': 'https://wikipedia.org/w/index.php?search=%s',
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

function generateCustomSearchButtonsList() {
    var container = document.getElementById('customSearchButtonsContainer');
    container.innerHTML = '';

    for (var i = 0; i < customSearchButtonsList.length; i++) {
        var item = customSearchButtonsList[i];

        let entry = document.createElement('div');
        entry.setAttribute('class', 'option');
        entry.setAttribute('style', 'margin: 8px 0px;');

        if (item['enabled'] == false)
            entry.style.opacity = 0.7;
        else
            entry.style.opacity = 1.0;

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

            if (this.checked)
                entry.style.opacity = 1.0;
            else
                entry.style.opacity = 0.7;
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
        var title = document.createElement('input');
        title.setAttribute('type', 'text');
        title.setAttribute('placeholder', returnDomainFromUrl(item['url']));
        title.setAttribute('style', 'margin-left: 3px; margin-bottom: 3px; display: inline;');
        title.value = item['title'];
        title.setAttribute('id', 'title' + i.toString());
        title.addEventListener("input", function (e) {
            customSearchButtonsList[parseInt(this.id.replaceAll('title', ''))]['title'] = this.value;
            saveCustomSearchButtons();
        });
        entry.appendChild(title);

        /// 'Use google icon' switch
        let useGoogleIconSwitch = document.createElement('input');
        useGoogleIconSwitch.setAttribute('type', 'checkbox');
        useGoogleIconSwitch.setAttribute('id', 'useCustomIcon' + i.toString());

        let switched = item['icon'] !== null && item['icon'] !== undefined;
        if (switched == false)
            useGoogleIconSwitch.setAttribute('checked', 0);

        let label = document.createElement('label');
        label.appendChild(useGoogleIconSwitch);

        setTimeout(function () {
            label.addEventListener('change', function (e) {
                let currentIcon = customSearchButtonsList[parseInt(this.firstChild.id.replaceAll('useCustomIcon', ''))]['icon'];

                if (currentIcon !== null && currentIcon !== undefined) {
                    customSearchButtonsList[parseInt(this.firstChild.id.replaceAll('useCustomIcon', ''))]['icon'] = null;
                } else {
                    customSearchButtonsList[parseInt(this.firstChild.id.replaceAll('useCustomIcon', ''))]['icon'] = '';
                }
                saveCustomSearchButtons();
                generateCustomSearchButtonsList();
            });
        }, 1);

        label.innerHTML += chrome.i18n.getMessage("useIconFromGoogle");
        label.setAttribute('style', 'padding-right: 3px; display: inline; float: right; max-width: 60%;');
        entry.appendChild(label);

        /// URL field
        let urlInputDiv = document.createElement('div');

        let urlLabel = document.createElement('label');
        urlLabel.setAttribute('style', 'display: inline; opacity: 0.5;');
        urlLabel.textContent = 'URL ';
        urlInputDiv.appendChild(urlLabel);

        var urlInput = document.createElement('input');
        urlInput.setAttribute('type', 'text');
        urlInput.setAttribute('placeholder', 'URL');
        urlInput.setAttribute('style', 'display: inline; min-width: 92%; max-width: 92% !important;  margin: 0px 0px;');
        urlInput.value = item['url'];
        urlInput.setAttribute('id', 'url' + i.toString());
        urlInput.addEventListener("input", function (e) {
            customSearchButtonsList[parseInt(this.id.replaceAll('url', ''))]['url'] = this.value;
            saveCustomSearchButtons();
        });
        urlInputDiv.appendChild(urlInput);

        entry.appendChild(urlInputDiv);

        /// Custom icon URL field
        if (item['icon'] !== null && item['icon'] !== undefined) {
            var iconInputDiv = document.createElement('div');

            let iconLabel = document.createElement('span');
            iconLabel.setAttribute('style', 'display: inline;opacity: 0.5;');
            iconLabel.textContent = 'Icon ';
            iconInputDiv.appendChild(iconLabel);

            /// Custom icon URL field
            var iconInput = document.createElement('input');
            iconInput.setAttribute('type', 'text');
            iconInput.setAttribute('placeholder', chrome.i18n.getMessage("customIconUrl"));
            iconInput.setAttribute('style', 'min-width: 90%; max-width: 90% !important; margin-top: 3px;');
            iconInput.setAttribute('id', 'icon' + i.toString());
            iconInput.value = item['icon'];
            iconInput.addEventListener("input", function (e) {
                customSearchButtonsList[parseInt(this.id.replaceAll('icon', ''))]['icon'] = this.value;
                saveCustomSearchButtons();

                generateCustomSearchButtonsList();
            });
            iconInputDiv.appendChild(iconInput);

            /// Remove custom icon button
            // var removeCustomIconButton = document.createElement('button');
            // removeCustomIconButton.textContent = '✕';
            // removeCustomIconButton.setAttribute('title', chrome.i18n.getMessage("removeCustomIcon"));
            // removeCustomIconButton.setAttribute('style', ' max-width: 1px !important;  margin: 0px 6px;padding: 1px; align-items: center');
            // removeCustomIconButton.setAttribute('id', 'useCustomIcon' + i.toString());
            // removeCustomIconButton.onmouseup = function () {
            //     customSearchButtonsList[parseInt(this.id.replaceAll('useCustomIcon', ''))]['icon'] = null;
            //     saveCustomSearchButtons();
            //     generateCustomSearchButtonsList();
            // };
            // iconInputDiv.appendChild(removeCustomIconButton);

            entry.appendChild(iconInputDiv);
        }

        /// Move up/down buttons
        var moveButtonsContainer = document.createElement('div');
        moveButtonsContainer.setAttribute('style', ' display: inline;');

        var moveUpButton = document.createElement('button');
        moveUpButton.textContent = 'ᐱ';
        moveUpButton.setAttribute('style', 'max-width: 25px; padding: 1px; align-items: center');
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
        moveDownButton.setAttribute('style', 'max-width: 25px; padding: 1px; align-items: center');
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

        /// Delete button
        var deleteButton = document.createElement('button');
        deleteButton.textContent = chrome.i18n.getMessage("deleteLabel");
        deleteButton.setAttribute('style', ' float: right;display: inline-block; max-width: 100px;');
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
    addButton.setAttribute('style', 'max-width: 99%;')
    addButton.onmouseup = function () {
        customSearchButtonsList.push({
            'url': '',
            'title': '',
            'enabled': true,
            // 'icon': ''
        });
        saveCustomSearchButtons();
        generateCustomSearchButtonsList();

        /// Increase max height of collapsible section
        let customSearchConfigs = document.getElementById('customSearchTooltip');
        let content = customSearchConfigs.nextElementSibling;
        content.style.maxHeight = content.scrollHeight + "px";

    };
    container.appendChild(addButton);
}

function saveCustomSearchButtons() {
    chrome.storage.local.set({ 'customSearchButtons': customSearchButtonsList });
}

function saveExpandedSections() {
    chrome.storage.local.set({ 'expandedSettingsSections': expandedSettingsSections });
}

function saveAllSettings() {
    chrome.storage.local.set(userConfigs);
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
    defaultConfigs.forEach(function (value, key) {
        dataToSave[key] = value;
    });

    chrome.storage.local.set(dataToSave);

    defaultConfigs.forEach(function (value, key) {
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


document.addEventListener("DOMContentLoaded", loadSettings);

// document.querySelector("form").addEventListener("reset", resetSettings);
document.querySelector("#donateButton").addEventListener("click", function (val) {
    window.open('https://emvaized.diaka.ua/donate', '_blank');
});
document.querySelector("#githubButton").addEventListener("click", function (val) {
    window.open('https://github.com/emvaized/selecton-extension', '_blank');
});
document.querySelector("#writeAReviewButton").addEventListener("click", function (val) {
    let isFirefox = navigator.userAgent.indexOf("Firefox") > -1;
    window.open(isFirefox ? 'https://addons.mozilla.org/ru/firefox/addon/selection-actions/' : 'https://chrome.google.com/webstore/detail/selecton/pemdbnndbdpbelmfcddaihdihdfmnadi/reviews', '_blank');
});
