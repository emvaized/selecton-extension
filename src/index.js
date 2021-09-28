function initConfigs(shouldCreateTooltip = false, e) {
  const userSettingsKeys = Object.keys(configs);

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
        if (configs.changeTextSelectionColor)
          setTextSelectionColor();

        /// Assign loaded values to config variable
        // Object.keys(configs).forEach(function (key) {
        //   if (loadedConfigs[key] !== null && loadedConfigs[key] !== undefined)
        //     configs[key] = loadedConfigs[key];
        // });

        const keys = Object.keys(configs);
        for (let i = 0, l = keys.length; i < l; i++) {
          try {
            let key = keys[i];
            if (loadedConfigs[key] !== null && loadedConfigs[key] !== undefined)
              configs[key] = loadedConfigs[key];
          } catch (e) {
            console.log('Selecton failed to restore config: ' + keys[i].toString());
            console.log('Error: ' + e.toString());
          }
        }

        /// Check for faulty values
        if (configs.animationDuration < 0) configs.animationDuration = 0;
        if (configs.updateRatesEveryDays < 0) configs.updateRatesEveryDays = 14;

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
          // boldLabel = chrome.i18n.getMessage("boldLabel");
          // italicLabel = chrome.i18n.getMessage("italicLabel");

          if (configs.addActionButtonsForTextFields)
            initMouseListeners();
          else
            document.addEventListener('selectionchange', selectionChangeInitListener);

          configsWereLoaded = true;
        }

        /// Check page to have dark background
        let isDarkPage = false;
        if (configs.invertColorOnDarkWebsite)
          try { isDarkPage = checkPageToHaveDarkBg(); } catch (e) { isDarkPage = false; if (configs.debugMode) console.log(e); }

        /// Set css styles
        if (configs.useCustomStyle) {
          /// Custom style from settings
          const bgColor = isDarkPage ? configs.tooltipInvertedBackground : configs.tooltipBackground;
          document.body.style.setProperty('--selecton-background-color', bgColor);
          getTextColorForBackground(bgColor);

          document.body.style.setProperty('--selection-button-foreground', isDarkTooltip ? 'rgb(255,255,255)' : 'rgb(0,0,0)');
          document.body.style.setProperty('--selection-button-background-hover', isDarkTooltip ? 'rgba(255,255,255, 0.3)' : 'rgba(0,0,0, 0.5)');
          document.body.style.setProperty('--selecton-outline-color', isDarkTooltip ? 'rgba(255,255,255, 0.2)' : 'rgba(0,0,0, 0.2)');
          secondaryColor = isDarkTooltip ? 'lightBlue' : 'dodgerBlue';

        } else {
          /// Default style
          document.body.style.setProperty('--selecton-background-color', isDarkPage ? '#bfbfbf' : '#4c4c4c');
          document.body.style.setProperty('--selection-button-foreground', isDarkPage ? '#000000' : '#ffffff');
          document.body.style.setProperty('--selection-button-background-hover', isDarkPage ? 'rgba(0, 0, 0, 0.5)' : 'rgba(255, 255, 255, 0.3)');
          document.body.style.setProperty('--selecton-outline-color', isDarkPage ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.2)');
          secondaryColor = isDarkPage ? 'dodgerBlue' : 'lightBlue';
          isDarkTooltip = !isDarkPage;
        }

        /// Set font-size
        document.body.style.setProperty('--selecton-font-size', `${configs.useCustomStyle ? configs.fontSize : 12.5}px`);

        /// styles of tooltip button icon
        document.body.style.setProperty('--selecton-button-icon-height', `${configs.fontSize * 1.35}px`);
        document.body.style.setProperty('--selecton-button-icon-invert', `invert(${isDarkTooltip ? '100' : '0'}%)`);

        /// Set border radius
        document.body.style.setProperty('--selecton-border-radius', `${configs.useCustomStyle ? configs.borderRadius : 3}px`);

        /// pop-up buttons border
        document.body.style.setProperty('--selecton-button-border-left', configs.reverseTooltipButtonsOrder ? 'none' : '1px solid var(--selection-button-background-hover)');
        document.body.style.setProperty('--selecton-button-border-right', configs.reverseTooltipButtonsOrder ? '1px solid var(--selection-button-background-hover)' : 'none');

        /// pop-up innder and button inner paddings
        // document.body.style.setProperty('--selecton-tooltip-inner-padding', addButtonIcons ? '2px 2px 3px' : '2px');
        document.body.style.setProperty('--selecton-tooltip-inner-padding', '2px');
        document.body.style.setProperty('--selecton-button-padding', addButtonIcons ? '3px 10px' : '4px 10px');

        /// selection handle circle radius
        document.body.style.setProperty('--selecton-handle-circle-radius', '12.5px');

        /// search tooltip icon size
        document.body.style.setProperty('--selecton-search-tooltip-icon-size', `${configs.secondaryTooltipIconSize}px`);

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

            if (today >= dayOfNextFetch) fetchCurrencyRates(); /// update rates from server
            else loadCurrencyRatesFromMemory();
          }
        }
        // fetchCurrencyRates(); /// enforce fetch for testing

        if (shouldCreateTooltip)
          createTooltip(e);
      }
    });
}

function checkPageToHaveDarkBg() {
  let isDarkPage = false;
  let pageBgColor;

  try {
    /// Check body background
    const bodyStyle = window.getComputedStyle(document.body);
    pageBgColor = bodyStyle.backgroundColor;

    if (pageBgColor.includes('rgba(0, 0, 0, 0)') || pageBgColor == '') {
      /// Check fist div background
      const firstDivChild = document.body.querySelector('div');
      const firstDivChildStyle = window.getComputedStyle(firstDivChild);
      pageBgColor = firstDivChildStyle.backgroundColor;
      if (pageBgColor.includes('rgba(0, 0, 0, 0)') || pageBgColor == '') pageBgColor = firstDivChildStyle.background;

      if (pageBgColor.includes('rgba(0, 0, 0, 0)') || pageBgColor == '') {
        /// Check first div's first div child background
        const firstDivChildBelow = firstDivChild.querySelector('div');
        const firstDivChildBelowStyle = window.getComputedStyle(firstDivChildBelow);
        pageBgColor = firstDivChildBelowStyle.backgroundColor;
        if (pageBgColor.includes('rgba(0, 0, 0, 0)') || pageBgColor == '') pageBgColor = firstDivChildBelowStyle.background;
      }
    }

  } catch (e) { console.log(e); }

  /// False negative is preferred to false positive
  if (pageBgColor.includes('rgba(0, 0, 0, 0)') || pageBgColor == '' || pageBgColor == undefined) {
    isDarkPage = false;
    return;
  }

  if (configs.debugMode) console.log('Page background color: ' + pageBgColor);

  if (!pageBgColor.includes('(')) return isDarkPage;
  pageBgColor = pageBgColor.replace('rgb(', '').replace('rgba(', '').replace(')', '').replace(' ', '').split(',');
  console.log(pageBgColor);

  let colorLuminance =
    (0.299 * pageBgColor[0] + 0.587 * pageBgColor[1] + 0.114 * pageBgColor[2]) / 255;
  if (colorLuminance <= 0.5) isDarkPage = true;

  if (configs.debugMode)
    console.log('Check page has dark background: ' + isDarkPage);

  return isDarkPage;
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

    if (e.button == 1) {
      selection = null;
      hideTooltip();
      hideDragHandles();
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

    if (window.getSelection) selection = window.getSelection();
    else if (document.selection) selection = document.selection.createRange();

    selectedText = selection.toString().trim();

    if (configs.addActionButtonsForTextFields && e.detail == 1) checkTextField();

    if (selectedText.length > 0) {
      /// create tooltip anyway
      initTooltip(e);
    } else {
      /// check if textfield is focused
      if (configs.addActionButtonsForTextFields && isTextFieldFocused) initTooltip(e);
    }
  });

  function checkTextField() {
    /// check if textfield is focused

    const activeEl = document.activeElement;
    isTextFieldFocused = (activeEl.tagName === "INPUT" && (activeEl.getAttribute('type') == 'text') || activeEl.getAttribute('name') == 'text') ||
      activeEl.tagName === "TEXTAREA" ||
      activeEl.getAttribute('contenteditable') !== null;

    /// Special handling for Firefox 
    /// (https://stackoverflow.com/questions/20419515/window-getselection-of-textarea-not-working-in-firefox)
    if (selectedText == '' && navigator.userAgent.indexOf("Firefox") > -1) {
      const ta = document.querySelector(':focus');
      if (ta != null && ta.value != undefined) {
        selectedText = ta.value.substring(ta.selectionStart, ta.selectionEnd);
        selection = ta.value.substring(ta.selectionStart, ta.selectionEnd);
      }
    }

    if (selectedText == '') hideTooltip(); /// Hide previous 'paste' button

    if (isTextFieldFocused && configs.addPasteOnlyEmptyField) {
      /// Ignore single click on text field with inputted value
      try {
        if (activeEl.getAttribute('contenteditable') != null && activeEl.innerHTML != '' && selectedText == '' && activeEl.innerHTML != '<br>')
          isTextFieldFocused = false;
        else
          if (activeEl.value.trim() !== '' && selectedText == '') isTextFieldFocused = false;
      } catch (e) { console.log(e); }
    }
  }

  function initTooltip(e) {
    if (configs.applyConfigsImmediately)
      initConfigs(true, e); /// createTooltip will be called after checking for updated configs
    else
      createTooltip(e);
  }

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