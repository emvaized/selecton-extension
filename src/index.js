function init() {
  /// Load user settings
  chrome.storage.local.get(
    userSettingsKeys, function (configs) {
      changeTextSelectionColor = configs.changeTextSelectionColor ?? false;
      textSelectionBackground = configs.textSelectionBackground || '#338FFF';
      textSelectionColor = configs.textSelectionColor || '#ffffff';
      textSelectionBackgroundOpacity = configs.textSelectionBackgroundOpacity || 1.0;
      shouldOverrideWebsiteSelectionColor = configs.shouldOverrideWebsiteSelectionColor ?? false;

      enabled = configs.enabled ?? true;

      /// Check for domain to be in black list
      excludedDomains = configs.excludedDomains || '';

      var domainIsBlacklisted = false;
      if (excludedDomains !== null && excludedDomains !== undefined && excludedDomains !== '')
        excludedDomains.split(',').forEach(function (domain) {
          if (window.location.href.includes(domain.trim())) {
            domainIsBlacklisted = true;
          }
        });

      document.body.style.setProperty('--selection-button-padding', '6px 12px');

      if (enabled && domainIsBlacklisted == false) {
        debugMode = configs.debugMode ?? false;

        if (debugMode) {
          console.log('Loaded Selecton settings from memory:');
          console.log(configs);
        }

        if (changeTextSelectionColor)
          setTextSelectionColor();

        if (configs.preferredMetricsSystem == null || configs.preferredMetricsSystem == undefined) {
          setDefaultLocales();
        }

        convertToCurrency = configs.convertToCurrency || browserCurrency || 'USD';
        hideOnScroll = configs.hideOnScroll ?? true;
        convertMetrics = configs.convertMetrics ?? true;
        addOpenLinks = configs.addOpenLinks ?? true;
        convertCurrencies = configs.convertCurrencies ?? true;
        performSimpleMathOperations = configs.performSimpleMathOperations ?? true;
        preferredMetricsSystem = configs.preferredMetricsSystem || browserMetricSystem || 'metric';
        showTranslateButton = configs.showTranslateButton ?? true;
        languageToTranslate = configs.languageToTranslate || browserLanguage || 'en';
        ratesLastFetchedDate = configs.ratesLastFetchedDate;
        useCustomStyle = configs.useCustomStyle ?? false;
        tooltipBackground = configs.tooltipBackground || '#3B3B3B';
        tooltipOpacity = configs.tooltipOpacity || 1.0;
        addTooltipShadow = configs.addTooltipShadow ?? false;
        shadowOpacity = configs.shadowOpacity || 0.5;
        borderRadius = configs.borderRadius || 3;
        shiftTooltipWhenWebsiteHasOwn = configs.shiftTooltipWhenWebsiteHasOwn ?? true;
        addActionButtonsForTextFields = configs.addActionButtonsForTextFields ?? false;
        removeSelectionOnActionButtonClick = configs.removeSelectionOnActionButtonClick ?? true;
        draggableTooltip = configs.draggableTooltip ?? true;
        hideOnKeypress = configs.hideOnKeypress ?? true;
        preferredSearchEngine = configs.preferredSearchEngine || 'google';
        showOnMapButtonEnabled = configs.showOnMapButtonEnabled ?? true;
        showEmailButton = configs.showEmailButton ?? true;
        preferredNewEmailMethod = configs.preferredNewEmailMethod ?? 'mailto';
        customSearchUrl = configs.customSearchUrl || '';
        preferredMapsService = configs.preferredMapsService || 'google';
        addColorPreviewButton = configs.addColorPreviewButton ?? true;
        customSearchButtons = configs.customSearchButtons ?? customSearchButtons;
        secondaryTooltipEnabled = configs.secondaryTooltipEnabled ?? true;
        secondaryTooltipIconSize = configs.secondaryTooltipIconSize || 15;
        showSecondaryTooltipTitleOnHover = configs.showSecondaryTooltipTitleOnHover ?? false;
        addPhoneButton = configs.addPhoneButton ?? true;
        showUnconvertedValue = configs.showUnconvertedValue ?? true;
        buttonsStyle = configs.buttonsStyle || 'onlylabel';
        addButtonIcons = buttonsStyle == 'onlyicon' || buttonsStyle == 'iconlabel';
        addDragHandles = configs.addDragHandles ?? true;
        snapSelectionToWord = configs.snapSelectionToWord ?? true;
        preferCurrencySymbol = configs.preferCurrencySymbol ?? false;
        disableWordSnappingOnCtrlKey = configs.disableWordSnappingOnCtrlKey ?? true;
        showButtonLabelOnHover = configs.showButtonLabelOnHover ?? true;
        animationDuration = configs.animationDuration || 300;
        tooltipRevealEffect = configs.tooltipRevealEffect || 'scaleUpTooltipEffect';

        /// Get translated button labels
        copyLabel = chrome.i18n.getMessage("copyLabel");
        searchLabel = chrome.i18n.getMessage("searchLabel");
        translateLabel = chrome.i18n.getMessage("translateLabel");
        openLinkLabel = chrome.i18n.getMessage("openLinkLabel");
        showOnMapLabel = chrome.i18n.getMessage("showOnMap");
        cutLabel = chrome.i18n.getMessage("cutLabel");
        pasteLabel = chrome.i18n.getMessage("pasteLabel");

        /// Set dynamic color for foreground (text and icons)
        document.body.style.setProperty('--selection-button-foreground', useCustomStyle == false ? '#ffffff' : getTextColorForBackground(tooltipBackground.toLowerCase()));
        document.body.style.setProperty('--selection-button-background-hover', useCustomStyle == false || isDarkBackground ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.5)');
        secondaryColor = useCustomStyle == false || isDarkBackground ? 'lightBlue' : 'dodgerBlue';

        /// If initial launch, update currency rates
        if (convertCurrencies) {
          if (ratesLastFetchedDate == null || ratesLastFetchedDate == undefined)
            fetchCurrencyRates();
          else loadCurrencyRatesFromMemory();
        }

        if (loadTooltipOnPageLoad)
          setUpNewTooltip();

        try {
          setPageListeners();
        } catch (e) {
          if (debugMode)
            console.log('Error while setting Selecton listeners: ' + e);
        }
      }
    });
}

function setTextSelectionColor() {
  let importance = shouldOverrideWebsiteSelectionColor ? '!important' : '';

  // CSS rules
  var selectionBackgroundRgb = hexToRgb(textSelectionBackground);

  let rule = `::selection {background-color: rgba(${selectionBackgroundRgb.red}, ${selectionBackgroundRgb.green}, ${selectionBackgroundRgb.blue}, ${textSelectionBackgroundOpacity}) ${importance}; color: ${textSelectionColor} ${importance}; }`;
  rule += `::-moz-selection {background-color: rgba(${selectionBackgroundRgb.red}, ${selectionBackgroundRgb.green}, ${selectionBackgroundRgb.blue}, ${textSelectionBackgroundOpacity}) ${importance}; color: ${textSelectionColor} ${importance};}`;

  let css = document.createElement('style');
  css.type = 'text/css';
  css.appendChild(document.createTextNode(rule)); // Support for the rest
  document.getElementsByTagName("head")[0].appendChild(css);
}


function setPageListeners() {

  /// Hide tooltip on scroll
  document.addEventListener("scroll", function (e) {
    if (hideOnScroll)
      hideTooltip();
  });

  /// Hide tooltip when any key is pressed
  if (hideOnKeypress)
    document.addEventListener("keydown", function () {
      hideTooltip();
      hideDragHandles();
    });

  document.addEventListener("mousedown", function (e) {
    if (isDraggingTooltip) return;
    evt = e || window.event;
    if ("buttons" in evt) {
      if (evt.buttons == 1) {
        selection = null;
        hideTooltip();
        hideDragHandles();
      }
    }
  });

  document.addEventListener("mouseup", async function (e) {
    if (window.getSelection) {
      selection = window.getSelection();
    } else if (document.selection) {
      selection = document.selection.createRange();
    }

    if (selection !== null && selection !== undefined && selection.toString().trim() !== '') {

      if (snapSelectionToWord) {
        if (disableWordSnappingOnCtrlKey && e.ctrlKey == true) { } else {
          if (debugMode)
            console.log('Word snapping was rejected due to pressed CTRL key')
          snapSelectionByWords(selection);
        }
      }

      createTooltip(e);
    }
  });

  /// Experimental selectionchange listener
  // document.addEventListener('selectionchange', function (e) {
  //   if (isDraggingTooltip) return;
  //   var sel = document.getSelection().toString();

  //   console.log('selection:');
  //   console.log(sel);

  //   if (sel == null || sel == undefined || sel.trim() == '') {
  //     // document.removeEventListener('mouseup');
  //     selection = null;
  //     hideTooltip();
  //     hideDragHandles();
  //   } else {
  //   }
  // });
}

init();
