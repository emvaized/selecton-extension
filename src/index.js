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
          if (window.location.href.includes(domain.trim())) configs.enabled = false;
        });

      if (configs.enabled) {
        // configs.debugMode = loadedConfigs.debugMode ?? false;
        // configs.applyConfigsImmediately = loadedConfigs.applyConfigsImmediately ?? false;

        if (configs.changeTextSelectionColor && selectionColorWasApplied == false)
          setTextSelectionColor();

        /// Assign loaded values to config variable
        // Object.keys(configs).forEach(function (key) {
        //   if (loadedConfigs[key] !== null && loadedConfigs[key] !== undefined)
        //     configs[key] = loadedConfigs[key];
        // });

        let keys = Object.keys(configs);
        for (let i = 0, l = keys.length; i < l; i++) {
          let key = keys[i];
          if (loadedConfigs[key] !== null && loadedConfigs[key] !== undefined)
            configs[key] = loadedConfigs[key];
        }

        addButtonIcons = configs.buttonsStyle == 'onlyicon' || configs.buttonsStyle == 'iconlabel';
        verticalSecondaryTooltip = configs.secondaryTooltipLayout == 'verticalLayout';

        if (configs.debugMode) {
          console.log('Loaded Selecton settings from memory:');
          console.log(configs);
        }

        /// Run only on first load
        if (configsWereLoaded == false) {

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

          if (configs.addActionButtonsForTextFields)
            initMouseListeners();
          else
            document.addEventListener('selectionchange', selectionChangeInitListener);

          configsWereLoaded = true;
        }

        /// Check page to have dark background
        let isDarkPage = false;

        if (configs.invertColorOnDarkWebsite)
          try {
            let pageBgColor = window.getComputedStyle(document.body).backgroundColor;
            if (pageBgColor == 'rgba(0, 0, 0, 0)') pageBgColor = window.getComputedStyle(document.body.querySelector('div')).backgroundColor;

            // if (configs.debugMode) console.log('website background color: ' + pageBgColor);
            pageBgColor = pageBgColor.replaceAll('rgb(', '').replaceAll('rgba(', '').replaceAll(')', '').split(',');

            let colorLuminance =
              (0.299 * pageBgColor[0] + 0.587 * pageBgColor[1] + 0.114 * pageBgColor[2]) / 255;
            if (colorLuminance <= 0.5) isDarkPage = true;

            if (configs.debugMode)
              console.log('Check page has dark background: ' + isDarkPage);

          } catch (e) { if (configs.debugMode) console.log(e); }


        /// Set css styles
        if (configs.useCustomStyle) {
          /// Custom style from settings
          const bgColor = isDarkPage ? configs.tooltipInvertedBackground : configs.tooltipBackground;
          document.body.style.setProperty('--selecton-background-color', bgColor);
          getTextColorForBackground(bgColor);

          document.body.style.setProperty('--selection-button-foreground', isDarkBackground ? 'rgb(255,255,255)' : 'rgb(0,0,0)');
          document.body.style.setProperty('--selection-button-background-hover', isDarkBackground ? 'rgba(255,255,255, 0.3)' : 'rgba(0,0,0, 0.5)');
          document.body.style.setProperty('--selecton-outline-color', isDarkBackground ? 'rgba(255,255,255, 0.2)' : 'rgba(0,0,0, 0.2)');
          secondaryColor = isDarkBackground ? 'lightBlue' : 'dodgerBlue';

        } else {
          /// Default style
          document.body.style.setProperty('--selecton-background-color', isDarkPage ? '#bfbfbf' : '#4c4c4c');
          document.body.style.setProperty('--selection-button-foreground', isDarkPage ? '#000000' : '#ffffff');
          document.body.style.setProperty('--selection-button-background-hover', isDarkPage ? 'rgba(0, 0, 0, 0.5)' : 'rgba(255, 255, 255, 0.3)');
          document.body.style.setProperty('--selecton-outline-color', isDarkPage ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.2)');
          secondaryColor = isDarkPage ? 'dodgerBlue' : 'lightBlue';
          isDarkBackground = !isDarkPage;
        }

        /// Set font-size
        document.body.style.setProperty('--selecton-font-size', `${configs.useCustomStyle ? configs.fontSize : 12.5}px`);

        /// Set border radius
        document.body.style.setProperty('--selecton-border-radius', `${configs.useCustomStyle ? configs.borderRadius : 3}px`);

        /// pop-up buttons border
        document.body.style.setProperty('--selecton-button-border-left', configs.reverseTooltipButtonsOrder ? 'none' : '1px solid var(--selection-button-background-hover)');
        document.body.style.setProperty('--selecton-button-border-right', configs.reverseTooltipButtonsOrder ? '1px solid var(--selection-button-background-hover)' : 'none');

        /// pop-up inner padding
        document.body.style.setProperty('--selecton-tooltip-inner-padding', addButtonIcons ? '2px 2px 3px' : '2px');

        /// selection handle circle radius
        document.body.style.setProperty('--selecton-handle-circle-radius', '12.5px');

        /// Check browser locales on first launch (language and metric system)
        if (loadedConfigs.preferredMetricsSystem == null || loadedConfigs.preferredMetricsSystem == undefined)
          try { setDefaultLocales(); } catch (e) { }

        /// Fetch or load currency rates from storage
        if (configs.convertCurrencies) {
          ratesLastFetchedDate = loadedConfigs.ratesLastFetchedDate;

          if (ratesLastFetchedDate == null || ratesLastFetchedDate == undefined || ratesLastFetchedDate == '')
            fetchCurrencyRates();
          else {
            let today = new Date();
            let dayOfNextFetch = new Date(ratesLastFetchedDate);

            dayOfNextFetch.setDate(dayOfNextFetch.getDate() + configs.updateRatesEveryDays);

            if (today >= dayOfNextFetch) fetchCurrencyRates(); /// fetch rates from server
            else loadCurrencyRatesFromMemory();
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
  let selectionBackgroundRgb = hexToRgb(configs.textSelectionBackground);

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

function initMouseListeners() {
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
    if (isDraggingTooltip || isDraggingDragHandle) return;
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
    if (isDraggingTooltip) return;

    /// Don't recreate tooltip when some text selected on page — and user clicked on link or button
    const documentActiveElTag = document.activeElement.tagName;
    if (documentActiveElTag == 'A' || documentActiveElTag == 'BUTTON') return;

    /// Special handling for triple mouse click (paragraph selection)
    if (e.detail == 3) {
      hideDragHandles(false);
      return;
    }

    if (window.getSelection) {
      selection = window.getSelection();
    } else if (document.selection) {
      selection = document.selection.createRange();
    }

    if (selection.toString().trim().length > 0 || configs.addActionButtonsForTextFields) {
      if (configs.applyConfigsImmediately)
        initConfigs(true, e); /// createTooltip will be called after checking for updated configs
      else
        createTooltip(e); /// create tooltip immediately
    }
  });

  if (configs.debugMode)
    console.log('Selection initiated mouse listeners');
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
}

function selectionChangeInitListener() {
  if (!configs.enabled) return;
  if (document.getSelection().toString().length < 1) return;
  document.removeEventListener('selectionchange', selectionChangeInitListener);

  try {
    initMouseListeners();
  } catch (e) {
    if (configs.debugMode)
      console.log('Error while setting Selecton mouse listeners: ' + e);
  }
}

document.addEventListener('DOMContentLoaded', domLoadedListener);