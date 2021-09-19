function initConfigs(shouldCreateTooltip = false, e) {
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

      if (configs.excludedDomains !== null && configs.excludedDomains !== undefined && configs.excludedDomains !== '')
        configs.excludedDomains.split(',').forEach(function (domain) {
          if (window.location.href.includes(domain.trim())) {
            configs.enabled = false;
          }
        });

      if (configs.enabled) {
        configs.debugMode = loadedConfigs.debugMode ?? false;
        configs.applyConfigsImmediately = loadedConfigs.applyConfigsImmediately ?? false;

        if (configs.changeTextSelectionColor && selectionColorWasApplied == false)
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
        if (configsWereLoaded == false) {
          copyLabel = chrome.i18n.getMessage("copyLabel");
          searchLabel = chrome.i18n.getMessage("searchLabel");
          translateLabel = chrome.i18n.getMessage("translateLabel");
          openLinkLabel = chrome.i18n.getMessage("openLinkLabel");
          showOnMapLabel = chrome.i18n.getMessage("showOnMap");
          cutLabel = chrome.i18n.getMessage("cutLabel");
          pasteLabel = chrome.i18n.getMessage("pasteLabel");
          boldLabel = chrome.i18n.getMessage("boldLabel");
          italicLabel = chrome.i18n.getMessage("italicLabel");

          configsWereLoaded = true;
        }

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

        /// Set pop-up inner padding
        document.body.style.setProperty('--selecton-tooltip-inner-padding', addButtonIcons ? "2px 2px 3px" : "2px");

        /// Check to fetch currency rates
        configs.convertCurrencies = loadedConfigs.convertCurrencies ?? true;


        if (configs.convertCurrencies) {
          ratesLastFetchedDate = loadedConfigs.ratesLastFetchedDate;

          if (ratesLastFetchedDate == null || ratesLastFetchedDate == undefined || ratesLastFetchedDate == '')
            fetchCurrencyRates();
          else {
            let today = new Date();
            let dayOfNextFetch = new Date(ratesLastFetchedDate);

            dayOfNextFetch.setDate(dayOfNextFetch.getDate() + configs.updateRatesEveryDays);

            if (today >= dayOfNextFetch) {
              fetchCurrencyRates(); /// fetch rates from server
            } else
              loadCurrencyRatesFromMemory();
          }
        }

        if (shouldCreateTooltip)
          createTooltip(e);
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

  selectionColorWasApplied = true;

  if (configs.debugMode)
    console.log('Selecton applied custom selection color')
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
    if (tooltipIsShown == false) return;

    hideTooltip();
    hideDragHandles(false);
    recreateTooltip();
  });

  /// Hide tooltip on window resize
  window.addEventListener('resize', function (e) {
    if (tooltipIsShown == false) return;

    if (configs.debugMode)
      console.log('hiding all Selecton overlays on window resize...');

    hideTooltip(false);
    hideDragHandles(false);
    recreateTooltip();
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
    if (tooltipIsShown == false) return;

    if ("buttons" in e) {
      if (e.button == 1) {
        selection = null;
        hideTooltip();
        hideDragHandles();
      }
    }
  });

  document.addEventListener("mouseup", function (e) {
    if (!configs.enabled) return;

    /// Don't recreate tooltip when some text selected on page — and user clicked on link or button
    const documentActiveElTag = document.activeElement.tagName;
    if (documentActiveElTag == 'A' || documentActiveElTag == 'BUTTON') return;

    /// Special handling for triple mouse click
    if (e.detail == 3) {
      hideDragHandles(false);
      return;
    }

    if (window.getSelection) {
      selection = window.getSelection();
    } else if (document.selection) {
      selection = document.selection.createRange();
    }

    // if (configs.addActionButtonsForTextFields || (selection !== null && selection !== undefined && selection.toString().trim().length > 0)) {
    if (selection.toString().trim().length > 0 || configs.addActionButtonsForTextFields) {
      if (configs.applyConfigsImmediately)
        initConfigs(true, e);
      else
        createTooltip(e);
    }
  });
}

function recreateTooltip() {
  if (configs.recreateTooltipAfterScroll == false) return;

  if (timerToRecreateOverlays !== null) {
    clearTimeout(timerToRecreateOverlays);
    timerToRecreateOverlays = null;
  }

  timerToRecreateOverlays = setTimeout(function () {
    if (window.getSelection) {
      selection = window.getSelection();
    } else if (document.selection) {
      selection = document.selection.createRange();
    }

    if ((selection !== null && selection !== undefined && selection.toString().trim().length > 0)) {
      createTooltip(lastMouseUpEvent);
    }
  }, 650);
}


function domLoadedListener() {
  initConfigs(false);

  document.removeEventListener('DOMContentLoaded', domLoadedListener);
  document.addEventListener('selectionchange', selectionChangeInitListener);
}

function selectionChangeInitListener() {
  if (!configs.enabled) return;
  if (document.getSelection().toString().length < 1) return;
  document.removeEventListener('selectionchange', selectionChangeInitListener);

  try {
    setPageListeners();
  } catch (e) {
    if (configs.debugMode)
      console.log('Error while setting Selecton page listeners: ' + e);
  }
}

document.addEventListener('DOMContentLoaded', domLoadedListener);