/// TODO: 
/// 1. On Firefox, using options page as a popup causes a bug - color picker closes the popup on init, and therefore selected color isn't saved
/// Those are used on settings page

let userConfigs, importedConfigs, isSafari = false;
const settingsHeaders = [];
const expandedSettingsSections = [];
let exportFileName = 'selecton-settings.json';
var keys = Object.keys(configs);
let markersData;

function loadSettings() {

    /// Load expanded sections list
    chrome.storage.local.get(['expandedSettingsSections'], function (val) {
        if (val.expandedSettingsSections !== null && val.expandedSettingsSections !== undefined)
            val.expandedSettingsSections.forEach(function (v) {
                expandedSettingsSections.push(v);
            })
    });

    /// Fix for older browsers
    if (!String.prototype.replaceAll) {
        String.prototype.replaceAll = function (search, replacement) {
            return this.replace(new RegExp(search, 'g'), replacement);
        };
    }

    isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    if (isSafari) {
        document.querySelector("#donateButton").style.display = 'none';
        document.querySelector("#showUpdateNotification").parentNode.parentNode.style.display = 'none';
    }

    /// Load configs
    chrome.storage.local.get(keys, setInputs);

    /// Set options page
    setVersionLabel();
    setImportExportButtons();

    setTimeout(function () {
        chrome.storage.local.get(['websiteMarkers'], function (value) {
            setMarkerSection(value);
        });
    }, 15)
}

function setInputs(result) {
    userConfigs = result;

    keys.forEach(function (key) {
        // let input = document.querySelector('#' + key.toString());
        let input = document.getElementById(key.toString());

        /// Set input value
        if (input !== null && input !== undefined) {
            if (input.type == 'checkbox') {
                if ((result[key] !== null && result[key] == true) || (result[key] == null && configs[key] == true))
                    input.setAttribute('checked', 0);
                else input.removeAttribute('checked', 0);
            } else if (input.tagName == 'SELECT') {
                let options = input.querySelectorAll('option');
                if (options !== null)
                    options.forEach(function (option) {
                        let selectedValue = result[key] ?? configs[key];
                        if (option.value == selectedValue) option.setAttribute('selected', true);

                        try {
                            if (chrome.i18n.getMessage(option.innerHTML) != '')
                                option.innerHTML = chrome.i18n.getMessage(option.innerHTML);
                            else if (chrome.i18n.getMessage(option['value']) != '')
                                option.innerHTML = chrome.i18n.getMessage(option['value']);
                        } catch (e) { }

                    });
            } else {
                input.setAttribute('value', result[key] ?? configs[key]);
            }

            /// Set translated label for input
            if (!input.parentNode.innerHTML.includes(chrome.i18n.getMessage(key))) {
                if (input.tagName == 'SELECT' || input.id == 'excludedDomains' || input.id == 'wordSnappingBlacklist')
                    input.parentNode.innerHTML = chrome.i18n.getMessage(key) + ':   ' + input.parentNode.innerHTML;
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
    });

    setTranslatedLabels();

    updateDisabledOptions();

    setCurrenciesDropdown();

    setTimeout(function () {
        loadCustomSearchButtons();

        setTimeout(function (e) {
            setCollapsibleHeaders();
        }, 100);

    }, 1);

}

function setImportExportButtons() {
    /// Export settings
    const exportNameInput = document.getElementById('exportName');

    if (isSafari) {
        exportNameInput.style.visibility = 'hidden';
        exportNameInput.style.width = '1px';

        let exportNote = document.createElement('span');
        exportNote.innerText = chrome.i18n.getMessage('fallbackExportLabel');
        exportNameInput.parentNode.prepend(exportNote);
    } else {
        exportNameInput.onchange = function () {
            exportFileName = exportNameInput.value;
        }
    }

    document.getElementById('exportSettings').onclick = function () {
        if (markersData) userConfigs['websiteMarkers'] = markersData;
        // chrome.runtime.sendMessage({ type: 'selecton-export-configs', configs: !userConfigs ? {} : userConfigs, name: exportFileName });
        const filename = exportFileName ?? 'selecton-settings.json';
        const jsonStr = JSON.stringify(!userConfigs ? {} : userConfigs);

        if (/^((?!chrome|android).)*safari/i.test(navigator.userAgent)) {
            /// Safari-specific method, until 'download' attribute is properly supported
            window.open('data:text/plain;charset=utf-8,' + encodeURIComponent(jsonStr));
        } else {
            let element = document.createElement('a');
            element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(jsonStr));
            element.setAttribute('download', filename);
            element.style.display = 'none';
            element.style.position = 'absolute';
            document.body.appendChild(element);
            element.click();
            element.remove();
        }
    }

    /// Import settings
    const fileSelector = document.getElementById('importSettings');
    const importSettingsConfirmButton = document.getElementById('importSettingsButton');
    disableImportButton();

    importedConfigs = null;

    fileSelector.addEventListener('change', (event) => {
        const reader = new FileReader();
        reader.addEventListener('load', (event) => {
            const result = event.target.result;
            importedConfigs = JSON.parse(result);

            if (importedConfigs != null && importedConfigs !== undefined) {
                enableImportButton();
            }
        });
        reader.readAsText(event.target.files[0]);
    });

    importSettingsConfirmButton.addEventListener('click', function () {

        /// Confirm prompt is disabled here, as on Chrome-based browsers, when options page is open fullscreen,
        /// it doesn't work due to the Chromium bug:
        /// https://bugs.chromium.org/p/chromium/issues/detail?id=476350
        /// and I was too lazy to come up with other way to display warning prompt

        // if (window.confirm(chrome.i18n.getMessage("importAlert"))) {

        /// restore configs
        userConfigs = importedConfigs;
        setInputs(importedConfigs);
        saveAllSettings();

        /// disable import button
        const fileSelector = document.getElementById('importSettings');
        fileSelector.value = null;
        disableImportButton();

        /// restore markers
        let restoredMarkers = importedConfigs['websiteMarkers'];
        if (restoredMarkers) {
            chrome.storage.local.set({ 'websiteMarkers': restoredMarkers });
            setMarkerSection({ 'websiteMarkers': restoredMarkers });
        }

        // }
    });

    function enableImportButton() {
        importSettingsConfirmButton.disabled = false;
        importSettingsConfirmButton.title = '';
    }

    function disableImportButton() {
        importSettingsConfirmButton.disabled = true;
        importSettingsConfirmButton.title = chrome.i18n.getMessage('chooseFileFirst');
    }
}

function setTranslatedLabels() {
    /// Set translated headers
    document.querySelector("#importSettingsLabel").innerHTML = chrome.i18n.getMessage("importSettingsLabel");
    document.querySelector("#exportSettingsLabel").innerHTML = chrome.i18n.getMessage("exportSettingsLabel");
    document.querySelector("#exportSettingsNote").innerHTML = chrome.i18n.getMessage("exportSettingsNote");
    document.querySelector("#dictionaryButtonRemark").innerHTML = chrome.i18n.getMessage("dictionaryButtonRemark");
    document.querySelector("#quoteButtonRemark").innerHTML = chrome.i18n.getMessage("quoteButtonRemark");

    document.querySelector("#appearanceHeader").innerHTML += chrome.i18n.getMessage("appearanceHeader");
    document.querySelector("#behaviorHeader").innerHTML += chrome.i18n.getMessage("behaviorHeader");
    document.querySelector("#highlightHeader").innerHTML += chrome.i18n.getMessage("markersLabel");
    document.querySelector("#textFieldsHeader").innerHTML += chrome.i18n.getMessage("textFieldsHeader");
    document.querySelector("#convertionHeader").innerHTML += chrome.i18n.getMessage("convertionHeader");
    document.querySelector("#actionButtonsHeader").innerHTML += chrome.i18n.getMessage("contextualButtonsHeader");
    document.querySelector("#selectionHeader").innerHTML += chrome.i18n.getMessage("selectionHeader");
    document.querySelector("#customSearchTooltip").innerHTML += chrome.i18n.getMessage("customSearchTooltip");
    document.querySelector("#exportImportSettings").innerHTML += chrome.i18n.getMessage("exportImportSettings");

    // document.querySelector("#customSearchTooltipHint").innerHTML = chrome.i18n.getMessage("customSearchTooltipHint").replaceAll('<br/>', '<br/> •  ');
    document.querySelector("#customSearchTooltipHint").innerHTML = chrome.i18n.getMessage("customSearchTooltipHint");
    document.querySelector("#customSearchButtonsHeader").innerText = chrome.i18n.getMessage("customSearchButtonsHeader");
    document.querySelector("#addActionButtonsForTextFields").parentNode.parentNode.setAttribute('title', chrome.i18n.getMessage("disableForBetterPerformance"));
    document.querySelector("#liveTranslation").parentNode.parentNode.setAttribute('title', chrome.i18n.getMessage("disableForBetterPerformance"));
    document.getElementById('recentMarkersLabel').innerText = chrome.i18n.getMessage('recentMarkersLabel');
    document.getElementById('testPageButton').innerText = chrome.i18n.getMessage('testPageButton');
    // document.getElementById('markerHintHeader').innerText = chrome.i18n.getMessage('markerHint');

    /// Change CTRL key label on macs
    if (isSafari) {
        let k = document.querySelector("#disableWordSnappingOnCtrlKey");
        k.parentNode.innerHTML = k.parentNode.innerHTML.replaceAll('CTRL', '⌘cmd');
    }

    // try {
    //     const span = document.createElement('span');
    //     span.style.opacity = 0.5;
    //     span.id = 'applyConfigsImmediatelyPerformanceTip';
    //     const disableForBetterPerformanceLabel = chrome.i18n.getMessage("disableForBetterPerformance");
    //     span.innerHTML = '<br/>' + disableForBetterPerformanceLabel[0].toLowerCase() + disableForBetterPerformanceLabel.substring(1, disableForBetterPerformanceLabel.length);
    //     document.querySelector("#applyConfigsImmediately").parentNode.appendChild(span);
    // } catch (e) { }

    /// "All changes saved automatically" block
    let hintEl = document.querySelector("#allChangesSavedAutomaticallyHeader");
    hintEl.innerHTML = chrome.i18n.getMessage("allChangesSavedAutomatically");
    hintEl.innerHTML += '.<br />';
    hintEl.innerHTML += chrome.i18n.getMessage("updatePageToSeeChanges");

    /// Translate footer buttons
    document.querySelector("#writeAReviewButton").innerHTML = chrome.i18n.getMessage("writeAReview") + document.querySelector("#writeAReviewButton").innerHTML;
    document.querySelector("#githubButton").innerHTML = chrome.i18n.getMessage("visitGithub") + document.querySelector("#githubButton").innerHTML;
    document.querySelector("#donateButton").innerHTML = chrome.i18n.getMessage("buyMeCoffee") + document.querySelector("#donateButton").innerHTML;

    document.querySelector("#exportSettings").innerHTML = chrome.i18n.getMessage("export");
    document.querySelector("#importSettingsButton").innerHTML = chrome.i18n.getMessage("import");
}

function setVersionLabel() {
    let label = document.getElementById('selecton-version');
    var manifestData = chrome.runtime.getManifest();
    label.innerHTML = 'Selecton ' + manifestData.version + ` (<a target='_blank' href='https://github.com/emvaized/selecton-extension/blob/master/CHANGELOG.md'>${chrome.i18n.getMessage("whatsNew") ?? "What's new"}</a>)`;
}

function updateDisabledOptions() {
    /// Grey out unavailable optoins
    document.getElementById("all-options-container").className = document.getElementById("enabled").checked ? 'enabled-option' : 'disabled-option';
    document.getElementById("convertToCurrencyDropdown").parentNode.className = document.getElementById("convertCurrencies").checked ? 'enabled-option' : 'disabled-option';
    document.getElementById("convertToCurrencySecondaryDropdown").parentNode.className = document.getElementById("convertCurrencies").checked ? 'enabled-option' : 'disabled-option';
    document.getElementById("preferredMetricsSystem").parentNode.className = document.getElementById("convertMetrics").checked ? 'enabled-option' : 'disabled-option';
    document.getElementById("languageToTranslate").parentNode.className = document.getElementById("showTranslateButton").checked ? 'enabled-option' : 'disabled-option';
    document.getElementById("customStylesSection").className = document.getElementById("useCustomStyle").checked ? 'enabled-option' : 'disabled-option';
    document.getElementById("fullOpacityOnHover").parentNode.className = document.getElementById("tooltipOpacity").value < 1.0 ? 'enabled-option' : 'disabled-option';
    document.getElementById("shadowOpacity").parentNode.className = document.getElementById("addTooltipShadow").checked ? 'enabled-option' : 'disabled-option';
    document.getElementById("textSelectionBackground").parentNode.className = document.getElementById("changeTextSelectionColor").checked ? 'enabled-option' : 'disabled-option';
    document.getElementById("textSelectionColor").parentNode.className = document.getElementById("changeTextSelectionColor").checked ? 'enabled-option' : 'disabled-option';
    document.getElementById("textSelectionBackgroundOpacity").parentNode.className = document.getElementById("changeTextSelectionColor").checked ? 'enabled-option' : 'disabled-option';
    document.getElementById("shouldOverrideWebsiteSelectionColor").parentNode.className = document.getElementById("changeTextSelectionColor").checked ? 'enabled-option' : 'disabled-option';
    document.getElementById("preferredNewEmailMethod").parentNode.className = document.getElementById("showEmailButton").checked ? 'enabled-option' : 'disabled-option';
    document.getElementById("preferredMapsService").parentNode.className = document.getElementById("showOnMapButtonEnabled").checked ? 'enabled-option' : 'disabled-option';
    document.getElementById("secondaryTooltipIconSize").parentNode.className = document.getElementById("secondaryTooltipEnabled").checked ? 'enabled-option' : 'disabled-option';
    document.getElementById("showSecondaryTooltipTitleOnHover").parentNode.className = document.getElementById("secondaryTooltipEnabled").checked ? 'enabled-option' : 'disabled-option';
    document.getElementById("preferCurrencySymbol").parentNode.className = document.getElementById("convertCurrencies").checked ? 'enabled-option' : 'disabled-option';
    document.getElementById("disableWordSnappingOnCtrlKey").parentNode.className = document.getElementById("snapSelectionToWord").checked ? 'enabled-option' : 'disabled-option';
    // document.getElementById("dontSnapTextfieldSelection").parentNode.className = document.getElementById("snapSelectionToWord").checked ? 'enabled-option' : 'disabled-option';
    document.getElementById("secondaryTooltipLayout").parentNode.className = document.getElementById("secondaryTooltipEnabled").checked ? 'enabled-option' : 'disabled-option';
    document.getElementById("wordSnappingBlacklist").parentNode.className = document.getElementById("snapSelectionToWord").checked ? 'enabled-option' : 'disabled-option';
    document.getElementById("disableWordSnapForCode").parentNode.className = document.getElementById("snapSelectionToWord").checked ? 'enabled-option' : 'disabled-option';
    document.getElementById("addPasteOnlyEmptyField").parentNode.className = document.getElementById("addPasteButton").checked && document.getElementById("addActionButtonsForTextFields").checked ? 'enabled-option' : 'disabled-option';
    document.getElementById("addFontFormatButtons").parentNode.className = document.getElementById("addActionButtonsForTextFields").checked ? 'enabled-option' : 'disabled-option';
    // document.getElementById("liveTranslation").parentNode.className = document.getElementById("showTranslateButton").checked && document.getElementById("preferredTranslateService").value == 'google' ? 'enabled-option' : 'disabled-option';
    document.getElementById("liveTranslation").parentNode.className = document.getElementById("showTranslateButton").checked ? 'enabled-option' : 'disabled-option';
    document.getElementById("hideTranslateButtonForUserLanguage").parentNode.className = document.getElementById("showTranslateButton").checked ? 'enabled-option' : 'disabled-option';
    // document.getElementById("delayToRevealTranslateTooltip").parentNode.className = document.getElementById("showTranslateButton").checked && document.getElementById("liveTranslation").checked ? 'enabled-option' : 'disabled-option';
    document.getElementById("showTranslateIfLanguageUnknown").parentNode.className = document.getElementById("showTranslateButton").checked && document.getElementById("hideTranslateButtonForUserLanguage").checked ? 'enabled-option' : 'disabled-option';
    document.getElementById("addPasteButton").parentNode.className = document.getElementById("addActionButtonsForTextFields").checked ? 'enabled-option' : 'disabled-option';
    document.getElementById("updateRatesEveryDays").parentNode.className = document.getElementById("convertCurrencies").checked ? 'enabled-option' : 'disabled-option';
    document.getElementById("preferredTranslateService").parentNode.className = document.getElementById("showTranslateButton").checked ? 'enabled-option' : 'disabled-option';
    // document.getElementById("shiftTooltipWhenWebsiteHasOwn").parentNode.className = document.getElementById("tooltipPosition").value == 'overCursor' ? 'disabled-option' : 'enabled-option';
    document.getElementById("customSearchButtonsContainer").className = document.getElementById("secondaryTooltipEnabled").checked ? 'enabled-option' : 'disabled-option';
    document.getElementById("dictionaryButtonWordsAmount").parentNode.className = document.getElementById("showDictionaryButton").checked ? 'enabled-option' : 'disabled-option';
    document.getElementById("dictionaryButtonResponseCharsAmount").parentNode.className = document.getElementById("showDictionaryButton").checked ? 'enabled-option' : 'disabled-option';
    document.getElementById("maxTooltipButtonsToShow").parentNode.className = document.getElementById("collapseButtons").checked ? 'enabled-option' : 'disabled-option';
    document.getElementById("correctTooltipPositionByMoreButtonWidth").parentNode.className = document.getElementById("collapseButtons").checked ? 'enabled-option' : 'disabled-option';
    document.getElementById("correctTooltipPositionByMoreButtonWidth").parentNode.className = document.getElementById("collapseAsSecondPanel").checked ? 'disabled-option' : 'enabled-option';
    document.getElementById("collapseAsSecondPanel").parentNode.className = document.getElementById("collapseButtons").checked ? 'enabled-option' : 'disabled-option';
    document.getElementById("addClearButton").parentNode.className = document.getElementById("addPasteOnlyEmptyField").checked || !document.getElementById("addPasteButton").checked || !document.getElementById("addActionButtonsForTextFields").checked ? 'disabled-option' : 'enabled-option';
    document.getElementById("hideTooltipWhenCursorMovesAway").parentNode.className = document.getElementById("tooltipPosition").value == 'overCursor' ? 'enabled-option' : 'disabled-option';
    document.getElementById("dragHandleStyle").parentNode.className = document.getElementById("addDragHandles").checked ? 'enabled-option' : 'disabled-option';
    document.getElementById("floatingOffscreenTooltip").parentNode.className = document.getElementById("recreateTooltipAfterScroll").checked ? 'enabled-option' : 'disabled-option';

    /// Fully hide options unless condition is met
    document.getElementById("customSearchUrl").parentNode.parentNode.className = document.getElementById("preferredSearchEngine").value == 'custom' ? 'option visible-option' : 'option hidden-option';
    document.getElementById("showButtonLabelOnHover").parentNode.parentNode.className = document.getElementById("buttonsStyle").value == 'onlyicon' ? 'option visible-option' : 'option hidden-option';
    document.getElementById("tooltipInvertedBackground").parentNode.parentNode.className = document.getElementById("invertColorOnDarkWebsite").checked ? 'option visible-option' : 'option hidden-option';
    // document.getElementById("applyConfigsImmediatelyPerformanceTip").className = document.getElementById("applyConfigsImmediately").checked ? 'visible-option' : 'hidden-option';
    document.getElementById("showSecondaryTooltipTitleOnHover").parentNode.parentNode.className = document.getElementById("secondaryTooltipLayout").value == 'verticalLayout' ? 'hidden-option' : 'option visible-option';
    document.getElementById("maxIconsInRow").parentNode.parentNode.className = document.getElementById("secondaryTooltipLayout").value == 'verticalLayout' ? 'hidden-option' : 'option visible-option';
    document.getElementById("hoverSearchPanelOptions").className = document.getElementById("customSearchOptionsDisplay").value == 'panelCustomSearchStyle' ? 'hidden-option' : 'visible-option';

    /// Hide language detection option if current browser doesn't support it
    if (!chrome.i18n.detectLanguage) {
        document.getElementById('hideTranslateButtonForUserLanguage').parentNode.parentNode.className = 'hidden-option';
        document.getElementById('showTranslateIfLanguageUnknown').parentNode.parentNode.className = 'hidden-option';
    }
}

function setCollapsibleHeaders() {
    let coll = document.getElementsByClassName("collapsible-header");

    for (let i = 0, l = coll.length; i < l; i++) {
        const c = coll[i];

        /// Make section initially expanded
        if (expandedSettingsSections.includes(c.id)) {
            const it = coll[i];
            it.classList.toggle("active");
            let content = it.nextElementSibling;
            content.style.maxHeight = content.scrollHeight + "px";
        }

        c.onclick = function () {
            this.classList.toggle("active");
            let content = this.nextElementSibling;
            if (content.style.maxHeight) {
                /// Collapse
                content.style.maxHeight = null;
                let indexInArray = expandedSettingsSections.indexOf(this.id);
                if (indexInArray > -1) {
                    expandedSettingsSections.splice(indexInArray, 1);
                }
            } else {
                /// Expand
                content.style.maxHeight = content.scrollHeight + "px";
                if (!expandedSettingsSections.includes(this.id))
                    expandedSettingsSections.push(this.id);
            }
            saveExpandedSections();
        }
    }
}

/// Configure additional elements
function setCurrenciesDropdown() {
    // Fetch both primary and secondary values from storage
    chrome.storage.local.get(['convertToCurrency', 'convertToCurrencySecondary'], function (result) {
        let initialValue = result.convertToCurrency || 'USD';
        let initialSecondaryValue = result.convertToCurrencySecondary || '';

        let select = document.getElementById('convertToCurrencyDropdown');
        let selectSecondary = document.getElementById('convertToCurrencySecondaryDropdown');

        Object.keys(currenciesList).forEach((function (key) {
            const currencySymbol = currenciesList[key]['currencySymbol'] || currenciesList[key]['symbol'];
            let optionText = key + (currencySymbol == undefined ? '' : ` (${currencySymbol})`) + ' — ' + (currenciesList[key]['currencyName'] || currenciesList[key]['name']);

            // Add to primary menu
            let option = document.createElement('option');
            option.innerHTML = optionText;
            option.setAttribute('value', key);
            select.appendChild(option);
            if (option.value == initialValue) option.setAttribute('selected', true);

            // Add to secondary menu
            let optionSecondary = document.createElement('option');
            optionSecondary.innerHTML = optionText;
            optionSecondary.setAttribute('value', key);
            selectSecondary.appendChild(optionSecondary);
            if (optionSecondary.value == initialSecondaryValue) optionSecondary.setAttribute('selected', true);
        }));

        // Adding labels
        select.parentNode.innerHTML = (chrome.i18n.getMessage('convertToCurrency') || 'Convert to') + ' (Primary)<br />' + select.parentNode.innerHTML;
        selectSecondary.parentNode.innerHTML = 'Convert to (Secondary)<br />' + selectSecondary.parentNode.innerHTML;

        setTimeout(function () {
            // Save when primary currency changes
            document.getElementById('convertToCurrencyDropdown').addEventListener("input", function (e) {
                let selectInput = document.getElementById('convertToCurrencyDropdown');
                chrome.storage.local.set({ 'convertToCurrency': selectInput.value.split(' — ')[0] });
            });

            // Save when secondary currency changes
            document.getElementById('convertToCurrencySecondaryDropdown').addEventListener("input", function (e) {
                let selectSecondaryInput = document.getElementById('convertToCurrencySecondaryDropdown');
                chrome.storage.local.set({ 'convertToCurrencySecondary': selectSecondaryInput.value.split(' — ')[0] });
            });
        }, 300);
    });
}

var customSearchButtonsList;

function loadCustomSearchButtons() {
    chrome.storage.local.get(['customSearchButtons'], function (value) {
        customSearchButtonsList = value.customSearchButtons ?? configs.customSearchButtons;

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
        let checkbox = document.createElement('input');
        checkbox.setAttribute('type', 'checkbox');
        checkbox.setAttribute('title', 'On/off');
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
        let imgButton = document.createElement('img');
        let icon = item['icon'];
        imgButton.setAttribute('src', icon !== null && icon !== undefined && icon !== '' ? icon : 'https://www.google.com/s2/favicons?domain=' + item['url'].split('/')[2])
        imgButton.setAttribute('width', '18px');
        imgButton.setAttribute('height', '18px');
        imgButton.setAttribute('loading', 'lazy');
        imgButton.setAttribute('style', 'margin-left: 3px; padding: 1px; vertical-align: middle !important;min-width:18px !important;');
        entry.appendChild(imgButton);

        /// Title field
        let title = document.createElement('input');
        title.setAttribute('type', 'text');
        // title.setAttribute('placeholder', returnDomainFromUrl(item['url']));
        title.setAttribute('placeholder', 'Title');
        title.setAttribute('style', 'margin-left: 3px; min-width: 100px; margin-bottom: 3px; display: inline;');
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

        // let urlLabel = document.createElement('label');
        // urlLabel.setAttribute('class', 'custom-search-option-url-label');
        // urlLabel.textContent = 'URL ';
        // urlInputDiv.appendChild(urlLabel);

        var urlInput = document.createElement('input');
        urlInput.setAttribute('type', 'text');
        urlInput.setAttribute('placeholder', 'URL');
        urlInput.setAttribute('title', 'URL');
        urlInput.setAttribute('class', 'custom-search-option-url-input');
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

            // let iconLabel = document.createElement('span');
            // iconLabel.setAttribute('style', 'display: inline;opacity: 0.5;');
            // iconLabel.textContent = 'Icon ';
            // iconInputDiv.appendChild(iconLabel);

            /// Custom icon URL field
            var iconInput = document.createElement('input');
            iconInput.setAttribute('type', 'text');
            iconInput.setAttribute('placeholder', chrome.i18n.getMessage("customIconUrl"));
            iconInput.setAttribute('class', 'custom-search-option-icon-input');
            iconInput.setAttribute('title', chrome.i18n.getMessage("customIconUrl"));
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
        moveUpButton.setAttribute('id', 'moveup' + i.toString());
        moveUpButton.className = 'custom-search-option-move-button';
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
        moveDownButton.setAttribute('id', 'movedown' + i.toString());
        moveDownButton.className = 'custom-search-option-move-button';
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

// function resetSettings() {
//     /// Reset custom search engines
//     customSearchButtonsList = [
//         {
//             'url': 'https://www.youtube.com/results?search_query=%s',
//             'title': 'YouTube',
//             'enabled': true
//         },
//         {
//             'url': 'https://open.spotify.com/search/%s',
//             'title': 'Spotify',
//             'enabled': true
//         },
//         {
//             'url': 'https://aliexpress.com/wholesale?SearchText=%s',
//             'title': 'Aliexpress',
//             'icon': 'https://symbols.getvecta.com/stencil_73/76_aliexpress-icon.a7d3b2e325.png',
//             'enabled': true
//         },
//         {
//             'url': 'https://www.amazon.com/s?k=%s',
//             'title': 'Amazon',
//             'enabled': true
//         },
//         {
//             'url': 'https://wikipedia.org/wiki/SpecialSearch?search=%s',
//             'title': 'Wikipedia',
//             'enabled': false
//         },
//         {
//             'url': 'https://www.imdb.com/find?s=alt&q=%s',
//             'title': 'IMDB',
//             'enabled': false
//         },
//     ];
//     saveCustomSearchButtons();
//     setTimeout(function () {
//         generateCustomSearchButtonsList();
//     }, 50);

//     /// Reset regular options
//     var dataToSave = {};
//     defaultConfigs.forEach(function (value, key) {
//         dataToSave[key] = value;
//     });

//     chrome.storage.local.set(dataToSave);

//     defaultConfigs.forEach(function (value, key) {
//         var input = document.getElementById(key);

//         /// Set input value
//         if (input !== null && input !== undefined) {
//             if (input.type == 'checkbox') {
//                 if ((value !== null && value == true) || (value == null && value == true))
//                     input.setAttribute('checked', 0);
//                 else input.removeAttribute('checked', 0);
//             } else if (input.tagName == 'SELECT') {
//                 var options = input.querySelectorAll('option');
//                 if (options !== null)
//                     options.forEach(function (option) {
//                         var selectedValue = value;
//                         if (chrome.i18n.getMessage(option.innerHTML) !== (null || undefined || ''))
//                             option.innerHTML = chrome.i18n.getMessage(option.innerHTML);
//                         if (option.value == selectedValue) option.setAttribute('selected', true);
//                         else option.setAttribute('selected', false);
//                     });
//             }
//             else {
//                 input.setAttribute('value', value);
//             }
//         }
//     });
// }

const expandedMarkerSections = [];

function setMarkerSection(value) {
    if (!value) return;
    let container = document.getElementById('website-markers-list');

    markersData = value['websiteMarkers'];
    if (!markersData) return;
    let markerKeys = Object.keys(markersData);

    if (!markersData || markerKeys.length == 0) {
        container.innerText = '—';
        return;
    }

    container.innerText = null;

    /// sort pages by timeUpdated
    markerKeys.sort(function (a, b) {
        return a.timeUpdated > b.timeUpdated ? 1 : -1;
    });

    markerKeys.forEach(function (url) {
        /// create website tile
        let tile = document.createElement('div');
        tile.className = 'option marker-website-tile';

        let favicon = document.createElement('img');
        favicon.className = 'marker-website-favicon';
        favicon.height = '15px';
        favicon.width = '15px';
        favicon.src = 'https://www.google.com/s2/favicons?domain=' + url.split('/')[2];
        tile.appendChild(favicon);

        let link = document.createElement('span');
        let title = markersData[url]['title'];
        link.innerText = title ?? url;
        if (title)
            link.title = url;
        // if (url == window.location.href) link.style.color = 'blue';
        tile.appendChild(link);

        container.appendChild(tile);

        /// expand if previously expanded
        if (expandedMarkerSections.includes(url)) {
            setTimeout(function () {
                let content = tile.nextElementSibling;
                content.style.maxHeight = content.scrollHeight + "px";
            }, 50)
        }

        /// create markers
        let markersContainer = document.createElement('div');
        markersContainer.className = 'collapsible-content';
        markersContainer.style.marginLeft = '20px';
        markersContainer.style.marginBottom = '10px';

        let websiteMarkers = markersData[url]['markers'];

        /// add counter
        let counter = document.createElement('div');
        counter.className = 'markers-counter-circle';
        counter.textContent = websiteMarkers.length;
        tile.appendChild(counter);

        /// sort markers by dateAdded
        websiteMarkers.sort(function (a, b) {
            return a.dateAdded > b.dateAdded ? -1 : 1;
        });

        /// append tiles for each marker
        for (let i = 0, websiteMarkersLength = websiteMarkers.length; i < websiteMarkersLength; i++) {
            const marker = websiteMarkers[i], tile = document.createElement('div');
            tile.className = 'option marker-tile';

            /// color preview
            const colorCircle = document.createElement('div');
            colorCircle.setAttribute('class', 'marker-color-preview');
            colorCircle.style.background = marker.background;
            tile.appendChild(colorCircle);

            /// set text
            tile.innerHTML += marker.text;

            /// show time added on hover
            if (marker.timeAdded)
                tile.title = new Date(marker.timeAdded).toLocaleString();

            /// append delete button
            let deleteButton = document.createElement('div');
            deleteButton.className = 'marker-highlight-delete';
            deleteButton.innerText = '✕';
            deleteButton.title = chrome.i18n.getMessage('deleteLabel');
            tile.appendChild(deleteButton);

            deleteButton.onclick = async function (e) {
                e.stopPropagation();

                // remove data
                const indexOfMarker = websiteMarkers.indexOf(marker);
                if (indexOfMarker > -1) websiteMarkers.splice(indexOfMarker, 1);
                markersData[url]['markers'] = websiteMarkers;
                if (websiteMarkers.length <= 0)
                    delete markersData[url];

                /// save updated markers
                try {
                    chrome.storage.local.set({ 'websiteMarkers': markersData });
                } catch (e) {
                    alert(e);
                }

                /// Recreate the view
                setTimeout(function () {
                    container.innerHTML = '';
                    setMarkerSection({ 'websiteMarkers': markersData });
                }, 5);
            }

            markersContainer.appendChild(tile);

            if (i !== websiteMarkersLength - 1)
                markersContainer.appendChild(document.createElement('hr'));

            /// add click listener
            tile.onclick = function () {
                /// open page, and scroll to selected marker

                // let w = window.open(url, '_blank');
                // setTimeout(function () {
                //     w.postMessage("selecton-scroll-to-marker-message:" + marker.hintDy.toString(), url);
                // }, 1500);

                chrome.tabs.create({ url: url, active: true }, async tab => {
                    let timeoutToDispatch, isTabLoaded = false, timeout = 5000;

                    chrome.tabs.onUpdated.addListener(onTabLoad);

                    timeoutToDispatch = setTimeout(function () {
                        if (isTabLoaded) return;
                        chrome.tabs.onUpdated.removeListener(onTabLoad);
                    }, timeout);

                    function onTabLoad(tabId, info) {
                        if (info.status === 'complete' && tabId === tab.id) {
                            chrome.tabs.onUpdated.removeListener(onTabLoad);
                            isTabLoaded = true;
                            clearTimeout(timeoutToDispatch);

                            chrome.tabs.sendMessage(
                                tabId,
                                { command: "selecton-scroll-to-marker-message:" + marker.hintDy.toString() }
                            ).then(response => { }).catch(error => { });
                        }
                    }
                });
            }
        }
        // );

        container.appendChild(markersContainer);

        /// set expand/collapse on hover
        tile.onclick = function () {
            // this.classList.toggle("active");
            let content = markersContainer;
            if (content.style.maxHeight) {
                /// Collapse
                content.style.maxHeight = null;

                let indexInArray = expandedMarkerSections.indexOf(url);
                if (indexInArray > -1) {
                    expandedMarkerSections.splice(indexInArray, 1);
                }
            } else {
                if (!expandedMarkerSections.includes(url))
                    expandedMarkerSections.push(url);

                /// Expand
                content.style.maxHeight = content.scrollHeight + "px";
                setTimeout(function () {
                    tile.parentNode.parentNode.style.maxHeight = tile.parentNode.parentNode.scrollHeight + "px";
                }, 201)
            }
        }
    })
}



document.addEventListener("DOMContentLoaded", loadSettings);

document.querySelector("#donateButton").addEventListener("click", function() {
    window.open('https://github.com/emvaized/emvaized.github.io/wiki/Donate-Page', '_blank');
});

document.querySelector("#githubButton").addEventListener("click", function() {
    window.open('https://github.com/emvaized/selecton-extension', '_blank');
});
document.querySelector("#writeAReviewButton").addEventListener("click", function() {
    if (/^((?!chrome|android).)*safari/i.test(navigator.userAgent)) {
        window.open('mailto:maximtsyba@gmail.com'); return;
    }

    let isFirefox = navigator.userAgent.indexOf("Firefox") > -1;
    window.open(isFirefox ? 'https://addons.mozilla.org/firefox/addon/selection-actions/' : 'https://chrome.google.com/webstore/detail/selecton/pemdbnndbdpbelmfcddaihdihdfmnadi/reviews', '_blank');
});

document.querySelector('#testPageButton').addEventListener('click', function (e) {
    window.open(chrome.runtime.getURL('options/test-page.html'));
});



/// Experiments to add search field
// document.getElementById('searchOptionsField').addEventListener('input', function (e) {
//     let allInputs = document.getElementsByClassName('option');

//     for (let i = 0, l = allInputs.length; i < l; i++) {
//         let opt = allInputs[i];

//         if (opt.innerText.toLowerCase().includes(e.target.value.toLowerCase()))
//             opt.style.display = 'block';
//         else
//             opt.style.display = 'none';
//     }
// })


/// Experiments to restore previous scroll position when window is re-opened
// var timerToSaveScrollPosition;

// window.onscroll = function (e) {
//     clearTimeout(timerToSaveScrollPosition);

//     timerToSaveScrollPosition = setTimeout(function () {
//         chrome.storage.local.set({ 'optionsScrollProgress': window.scrollY });
//     }, 50);
// };

// setTimeout(function () {
//     chrome.storage.local.get(['optionsScrollProgress'], function (val) {
//         if (val.optionsScrollProgress !== null && val.optionsScrollProgress !== undefined)
//             window.scrollTo(0, val.optionsScrollProgress);
//     });
// }, 100)