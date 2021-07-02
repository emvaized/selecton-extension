function init() {

  let userSettingsKeys = Object.keys(configs);

  /// Load user settings
  chrome.storage.local.get(
    userSettingsKeys, function (loadedConfigs) {
      configs.changeTextSelectionColor = loadedConfigs.changeTextSelectionColor ?? false;
      configs.textSelectionBackground = loadedConfigs.textSelectionBackground || '#338FFF';
      configs.textSelectionColor = loadedConfigs.textSelectionColor || '#ffffff';
      configs.textSelectionBackgroundOpacity = loadedConfigs.textSelectionBackgroundOpacity || 1.0;
      configs.shouldOverrideWebsiteSelectionColor = loadedConfigs.shouldOverrideWebsiteSelectionColor ?? false;
      configs.enabled = loadedConfigs.enabled ?? true;

      /// Check for domain to be in black list
      configs.excludedDomains = loadedConfigs.excludedDomains || '';

      var domainIsBlacklisted = false;
      if (configs.excludedDomains !== null && configs.excludedDomains !== undefined && configs.excludedDomains !== '')
        configs.excludedDomains.split(',').forEach(function (domain) {
          if (window.location.href.includes(domain.trim())) {
            domainIsBlacklisted = true;
          }
        });

      document.body.style.setProperty('--selection-button-padding', '6px 12px');

      if (configs.enabled && domainIsBlacklisted == false) {
        configs.debugMode = loadedConfigs.debugMode ?? false;

        if (configs.changeTextSelectionColor)
          setTextSelectionColor();

        if (loadedConfigs.preferredMetricsSystem == null || loadedConfigs.preferredMetricsSystem == undefined) {
          setDefaultLocales();
        }

        /// Assign loaded values to a config file
        Object.keys(configs).forEach(function (key) {
          if (loadedConfigs[key] !== null && loadedConfigs[key] !== undefined)
            configs[key] = loadedConfigs[key];
        });

        addButtonIcons = configs.buttonsStyle == 'onlyicon' || configs.buttonsStyle == 'iconlabel';

        verticalSecondaryTooltip = configs.secondaryTooltipLayout == 'verticalLayout';

        if (configs.debugMode) {
          console.log('Loaded Selecton settings from memory:');
          console.log(configs);
        }

        /// Get translated button labels
        copyLabel = chrome.i18n.getMessage("copyLabel");
        searchLabel = chrome.i18n.getMessage("searchLabel");
        translateLabel = chrome.i18n.getMessage("translateLabel");
        openLinkLabel = chrome.i18n.getMessage("openLinkLabel");
        showOnMapLabel = chrome.i18n.getMessage("showOnMap");
        cutLabel = chrome.i18n.getMessage("cutLabel");
        pasteLabel = chrome.i18n.getMessage("pasteLabel");
        boldLabel = chrome.i18n.getMessage("boldLabel");
        italicLabel = chrome.i18n.getMessage("italicLabel");

        /// Set dynamic color for foreground (text and icons)
        document.body.style.setProperty('--selection-button-foreground', configs.useCustomStyle == false ? '#ffffff' : getTextColorForBackground(configs.tooltipBackground.toLowerCase()));
        document.body.style.setProperty('--selection-button-background-hover', configs.useCustomStyle == false || isDarkBackground ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.5)');
        document.body.style.setProperty('--selecton-outline-color', configs.useCustomStyle == false || isDarkBackground ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)');
        secondaryColor = configs.useCustomStyle == false || isDarkBackground ? 'lightBlue' : 'dodgerBlue';

        /// Set font-size
        document.body.style.setProperty('--selecton-font-size', `${configs.useCustomStyle ? configs.fontSize : 12.5}px`);

        /// Set pop-up buttons border
        document.body.style.setProperty('--selecton-button-border-left', configs.reverseTooltipButtonsOrder ? 'none' : '1px solid var(--selection-button-background-hover)');
        document.body.style.setProperty('--selecton-button-border-right', configs.reverseTooltipButtonsOrder ? '1px solid var(--selection-button-background-hover)' : 'none');

        ratesLastFetchedDate = loadedConfigs.ratesLastFetchedDate;

        /// If initial launch, update currency rates
        if (configs.convertCurrencies) {
          if (ratesLastFetchedDate == null || ratesLastFetchedDate == undefined || ratesLastFetchedDate == '')
            fetchCurrencyRates();
          else loadCurrencyRatesFromMemory();
        }

        if (loadTooltipOnPageLoad)
          setUpNewTooltip();

        try {
          setPageListeners();
        } catch (e) {
          if (configs.debugMode)
            console.log('Error while setting Selecton page listeners: ' + e);
        }
      }
    });
}

function setTextSelectionColor() {
  let importance = configs.shouldOverrideWebsiteSelectionColor ? '!important' : '';

  // CSS rules
  var selectionBackgroundRgb = hexToRgb(configs.textSelectionBackground);

  let rule = `::selection {background-color: rgba(${selectionBackgroundRgb.red}, ${selectionBackgroundRgb.green}, ${selectionBackgroundRgb.blue}, ${configs.textSelectionBackgroundOpacity}) ${importance}; color: ${configs.textSelectionColor} ${importance}; }`;
  rule += `::-moz-selection {background-color: rgba(${selectionBackgroundRgb.red}, ${selectionBackgroundRgb.green}, ${selectionBackgroundRgb.blue}, ${configs.textSelectionBackgroundOpacity}) ${importance}; color: ${configs.textSelectionColor} ${importance};}`;

  let css = document.createElement('style');
  css.type = 'text/css';
  css.appendChild(document.createTextNode(rule)); // Support for the rest
  document.getElementsByTagName("head")[0].appendChild(css);
}

function setPageListeners() {
  try {
    window.addEventListener('popstate', function () {
      hideTooltip();
      hideDragHandles();
      if (configs.debugMode) console.log('Selecton tooltip was hidden on url change');
    });
  } catch (error) {
    if (configs.debugMode)
      console.log(error);
  }


  /// Hide tooltip on scroll
  document.addEventListener("scroll", function (e) {
    hideTooltip();
    hideDragHandles();
  });

  /// Hide tooltip when any key is pressed
  if (configs.hideOnKeypress)
    document.addEventListener("keydown", function (e) {
      if (tooltipIsShown == false) return;
      if (e.key == 'Control') return;
      if (e.shiftKey) return;

      hideTooltip();
      hideDragHandles();
    });

  document.addEventListener("mousedown", function (e) {
    if (isDraggingTooltip) return;

    evt = e || window.event;

    if (tooltipIsShown == false) return;

    if ("buttons" in evt) {
      if (evt.button == 1) {
        selection = null;
        hideTooltip();
        hideDragHandles();
      }
    }
  });

  document.addEventListener("mouseup", async function (e) {

    /// Don't recreate tooltip when some text selected on page — and user clicked on link or button
    const documentActiveElTag = document.activeElement.tagName;
    if (documentActiveElTag == 'A' || documentActiveElTag == 'BUTTON') return;

    /// Special handling for triple mouse click
    if (e.detail == 3) {
      hideDragHandles();
      return;
    }

    if (window.getSelection) {
      selection = window.getSelection();
    } else if (document.selection) {
      selection = document.selection.createRange();
    }

    if (configs.addActionButtonsForTextFields || (selection !== null && selection !== undefined && selection.toString().trim() !== ''))
      createTooltip(e);

  });

  window.addEventListener('resize', function (e) {
    /// TODO: 
    /// Recaclulate dx/dy for tooltip, secondary tooltip and drag handles
    if (configs.debugMode)
      console.log('hiding all Selecton overlays on window resize...');

    hideTooltip();
    hideDragHandles();
  });
}

function domLoadedListener() {
  init();
  document.removeEventListener('DOMContentLoaded', domLoadedListener);
}

document.addEventListener('DOMContentLoaded', domLoadedListener);
