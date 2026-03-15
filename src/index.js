function initConfigs(callback) {
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
      configs.ratesLastFetchedDate = loadedConfigs.ratesLastFetchedDate;

      /// Check for domain to be in black list
      configs.excludedDomains = loadedConfigs.excludedDomains || '';

      if (configs.excludedDomains !== null && configs.excludedDomains !== undefined && configs.excludedDomains !== '')
        configs.excludedDomains.split(',').forEach(function (domain) {
          if (window.location.href.includes(domain.trim().toLowerCase())) configs.enabled = false;
        });

      if (configs.enabled) {
        if (configs.changeTextSelectionColor)
          setTimeout(function () {
            setTextSelectionColor();
          }, 1);

        /// Assign loaded values to config variable
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

        /// Check for incorrect values
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
          setTimeout(function () {
            if (configs.addActionButtonsForTextFields)
              initMouseListeners();
            else {
              document.addEventListener('selectionchange', selectionChangeInitListener);
            }

            if (configs.addMarkerButton)
              initMarkersRestore();
          }, 1);

          configsWereLoaded = true;

          /// Fix for older browsers which don't support String.replaceAll (used here in a lot of places)
          if (!String.prototype.replaceAll) {
            String.prototype.replaceAll = function (find, replace) {
              return this.replace(new RegExp(find.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g'), replace);
            };
          }
        }

        /// Check browser locales on first launch (language and metric system)
        if (loadedConfigs.preferredMetricsSystem == null || loadedConfigs.preferredMetricsSystem == undefined)
          try { setDefaultLocales(); } catch (e) { }

        /// Check if word snapping is allowed on page
        domainIsBlacklistedForSnapping = false;
        if (configs.snapSelectionToWord && configs.wordSnappingBlacklist !== null && configs.wordSnappingBlacklist !== undefined && configs.wordSnappingBlacklist !== '')
          configs.wordSnappingBlacklist.split(',').forEach(function (domain) {
            if (window.location.href.includes(domain.trim().toLowerCase())) domainIsBlacklistedForSnapping = true;
          });


        // /// Set CSS rules for tooltip style
        // setDocumentStyles();

        // /// Fetch or load currency rates from storage
        // loadCurrencyRates()

        if (callback) callback();
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
}

function setDocumentStyles(){
  /// Set font-size
  document.documentElement.style.setProperty('--selecton-font-size', `${configs.useCustomStyle ? configs.fontSize : 12.5}px`);

  /// styles of tooltip button icon
  /// Set icon height to match font size (natural scale)
  document.documentElement.style.setProperty('--selecton-button-icon-height', '1.2em');

  /// Set border radius
  document.documentElement.style.setProperty('--selecton-border-radius', `${configs.useCustomStyle ? configs.borderRadius : 4}px`);

  /// pop-up buttons border
  document.documentElement.style.setProperty('--selecton-button-border-left', '1px solid var(--selection-button-background-hover)');

  /// pop-up inner and button inner paddings
  document.documentElement.style.setProperty('--selecton-tooltip-inner-padding', '2px');

  switch (configs.buttonsStyle) {
    case 'onlylabel': {
      document.documentElement.style.setProperty('--selecton-button-padding', '4px 10px');
    } break;
    case 'onlyicon': {
      document.documentElement.style.setProperty('--selecton-button-padding', '3px 10px');
    } break;
    case 'iconlabel': {
      document.documentElement.style.setProperty('--selecton-button-padding', '3px 8px');
    } break;
    default: {
      document.documentElement.style.setProperty('--selecton-button-padding', '4px 10px');
    } break;
  }

  /// selection handle circle radius
  document.documentElement.style.setProperty('--selecton-handle-circle-radius', '10px');

  /// search tooltip icon size
  document.documentElement.style.setProperty('--selecton-search-tooltip-icon-size', `${configs.secondaryTooltipIconSize}px`);

  /// Anim duration
  document.documentElement.style.setProperty('--selecton-anim-duration', `${configs.animationDuration}ms`);
}

function loadCurrencyRates(){
  if (configs.convertCurrencies) {
    let updateRatesEveryDays = configs.updateRatesEveryDays;
    if (updateRatesEveryDays < 7) updateRatesEveryDays = 7;

    ratesLastFetchedDate = configs.ratesLastFetchedDate;

    if (ratesLastFetchedDate == null || ratesLastFetchedDate == undefined || ratesLastFetchedDate == '')
      fetchCurrencyRates();
    else {
      let today = new Date();
      let dayOfNextFetch = new Date(ratesLastFetchedDate);
      const oneDayInMilliseconds = 1000 * 60 * 60 * 24;

      today = today.getTime();
      dayOfNextFetch = new Date(dayOfNextFetch.getTime() + (updateRatesEveryDays * oneDayInMilliseconds));

      if (configs.debugMode) {
        console.log('Rates update interval: ' + updateRatesEveryDays);
        console.log('Date of next fetch: ' + dayOfNextFetch);
        console.log('--- Finished checking dates ---');
      }

      loadCurrencyRatesFromMemory();
      if (today >= dayOfNextFetch) {
        fetchCurrencyRates(); /// update rates from server
      } 
    }
  }
}

function loadTranslatedLabels(){
  copyLabel = chrome.i18n.getMessage("copyLabel");
  searchLabel = chrome.i18n.getMessage("searchLabel");
  translateLabel = chrome.i18n.getMessage("translateLabel");
  openLinkLabel = chrome.i18n.getMessage("openLinkLabel");
  showOnMapLabel = chrome.i18n.getMessage("showOnMap");
  cutLabel = chrome.i18n.getMessage("cutLabel");
  pasteLabel = chrome.i18n.getMessage("pasteLabel");
  dictionaryLabel = chrome.i18n.getMessage("dictionaryLabel");
  markerLabel = chrome.i18n.getMessage("markerLabel");
  italicLabel = chrome.i18n.getMessage("italicLabel");
  boldLabel = chrome.i18n.getMessage("boldLabel");
  strikeLabel = chrome.i18n.getMessage("strikeLabel");
  clearLabel = chrome.i18n.getMessage("clearLabel");
}

function initMouseListeners() {
  document.addEventListener("mousedown", function (e) {
    if (tooltipIsShown == false || isTextFieldFocused == false) return;
    if (isDraggingTooltip || isDraggingDragHandle) return;

    if (e.button == 0) {
        hideTooltip();
        if (configs.addDragHandles) hideDragHandles()

      /// Remove text selection when clicked on link, to prevent creating new tooltip over link
      /// Probably no longer needed
      // try {
      //   if (document.elementFromPoint(e.clientX, e.clientY).tagName == 'A') removeSelectionOnPage();
      // } catch (e) { }
    }
  });

  document.addEventListener("mouseup", function (e) {
    if (!configs.enabled) return;
    if (isDraggingTooltip) return;

    /// Don't recreate tooltip when some text selected on page — and user clicked a button
    const activeEl = document.activeElement;
    if (activeEl.tagName == 'BUTTON') return;

    setTimeout(function () {
      if (e.detail == 3) hideDragHandles(false);

      /// Get page selection
      selection = window.getSelection();
      selectedText = selection.toString().trim();

      /// Fix for recreating tooltip when clicked on <a> link with active text selection on the screen
      try {
        if (activeEl.tagName == 'A') {
          let selectionNode = selection.focusNode.parentNode;
          if (selectionNode !== activeEl && selectionNode.parentNode !== activeEl) return;
        }
      } catch (e) { }

      /// Check if clicked on text field
      checkTextField(activeEl);

      if (selectedText.length > 0) {
        /// create tooltip for selection
        setCssStyles();
        initTooltip(e);
      } else {
        /// no selection on page - check if textfield is focused to create 'Paste' tooltip
        if (configs.addActionButtonsForTextFields && isTextFieldFocused) {
          setCssStyles();
          initTooltip(e);
        }
      }

    }, e.detail == 3 ? 200 : 0) /// special handling for triple mouse click (paragraph selection)
  });

  function setCssStyles() {
    if (configs.debugMode)
      console.log('--- Creating Selecton tooltip ---');

    /// Check page to have dark background
    setTimeout(function () {
      let isDarkPage = false;

      if (configs.invertColorOnDarkWebsite)
        try {
            isDarkPage = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
          } catch (e) { }

      /// Set css styles
      if (configs.useCustomStyle) {
        /// Custom style from settings
        const bgColor = isDarkPage ? configs.tooltipInvertedBackground : configs.tooltipBackground;
        document.documentElement.style.setProperty('--selecton-background-color', bgColor);
        // document.documentElement.style.setProperty('--selecton-background-color', 'rgba(0,0,0,0.5)');
        getTextColorForBackground(bgColor);

        document.documentElement.style.setProperty('--selection-button-foreground', isDarkTooltip ? 'rgb(255,255,255)' : 'rgb(0,0,0)');
        document.documentElement.style.setProperty('--selection-button-background-hover', isDarkTooltip ? 'rgba(255,255,255, 0.3)' : 'rgba(0,0,0, 0.5)');
        document.documentElement.style.setProperty('--selecton-outline-color', isDarkTooltip ? 'rgba(255,255,255, 0.2)' : 'rgba(0,0,0, 0.2)');
        document.documentElement.style.setProperty('--selecton-info-panel-color', isDarkTooltip ? 'rgba(255,255,255, 0.7)' : 'rgba(0,0,0, 0.7)');
        secondaryColor = isDarkTooltip ? 'lightBlue' : 'royalBlue';
      } else {
        /// Default style
        document.documentElement.style.setProperty('--selecton-background-color', isDarkPage ? '#bfbfbf' : '#333232');
        document.documentElement.style.setProperty('--selection-button-foreground', isDarkPage ? '#000000' : '#ffffff');
        document.documentElement.style.setProperty('--selection-button-background-hover', isDarkPage ? 'rgba(0, 0, 0, 0.5)' : 'rgba(255, 255, 255, 0.3)');
        document.documentElement.style.setProperty('--selecton-outline-color', isDarkPage ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.2)');
        document.documentElement.style.setProperty('--selecton-info-panel-color', isDarkPage ? 'rgba(0,0,0, 0.7)' : 'rgba(255,255,255, 0.7)');
        secondaryColor = isDarkPage ? 'royalBlue' : 'lightBlue';
        isDarkTooltip = !isDarkPage;
      }

      /// Invert buttons icons when dark tooltip
      document.documentElement.style.setProperty('--selecton-button-icon-invert', `invert(${isDarkTooltip ? '100' : '0'}%)`);

      /// Accent color for convert result buttons
      document.documentElement.style.setProperty('--selecton-secondary-color', secondaryColor);
    }, 0);
  }

  function checkTextField(target) {
    /// check if textfield is focused

    // const target = e.target;
    isTextFieldFocused = (
      target.tagName === "INPUT" && (
          target.type == 'text' || 
          target.type == 'email' || 
          target.type == 'search' || 
          target.type == 'text'
      )) || (target.tagName === "TEXTAREA" && !target.hasAttribute('aria-readonly')) || target.hasAttribute('contenteditable');

    if (isTextFieldFocused && configs.addActionButtonsForTextFields) {
      /// Special handling for Firefox 
      /// (https://stackoverflow.com/questions/20419515/window-getselection-of-textarea-not-working-in-firefox)
      if (selectedText == '' && navigator.userAgent.indexOf("Firefox") > -1) {
        const ta = document.querySelector(':focus');
        if (ta != null && ta.value != undefined) {
          selectedText = ta.value.substring(ta.selectionStart, ta.selectionEnd);
          selection = ta.value.substring(ta.selectionStart, ta.selectionEnd);
        }
      }

      /// Hide previous 'paste' button
      // if (selectedText == '') hideTooltip(); 

      /// Ignore single click on text field with inputted value
      try {
        isTextFieldEmpty = true;
        if (target.getAttribute('contenteditable') != null && target.innerHTML != '' && selectedText == '' && target.innerHTML != '<br>') {
          isTextFieldEmpty = false;
          if (configs.addPasteOnlyEmptyField) isTextFieldFocused = false;
        } else if (target.value && target.value.trim() !== '' && selectedText == '') {
          isTextFieldEmpty = false;
          if (configs.addPasteOnlyEmptyField) isTextFieldFocused = false;
        }
      } catch (e) { console.log(e); }
    }
  }

  function initTooltip(e) {
    createTooltip(e);

    /// check if CSS variables were set correctly
    setTimeout(function(){
      if (!document.documentElement.style.getPropertyValue('--selecton-font-size')) {
        setDocumentStyles();
      }
    }, 0)

    /// Listener to hide tooltip when cursor moves away
    if (configs.hideTooltipWhenCursorMovesAway && configs.tooltipPosition == 'overCursor') {
      window.addEventListener('mousemove', mouseMoveToHideListener);
    }

  }

  try {
    window.addEventListener('popstate', function () {
      hideTooltip();
      hideDragHandles();
    });
  } catch (error) {
    if (configs.debugMode)
      console.log(error);
  }

  /// Hide tooltip on scroll
  // document.addEventListener('wheel', hideOnScrollListener);
  document.addEventListener('scroll', hideOnScrollListener);

  function hideOnScrollListener(e) {
    if (tooltipIsShown == false) return;
    if (isDraggingDragHandle)
      hideDragHandles(true, true);

    if (configs.floatingOffscreenTooltip) /// dont hide tooltip if it's floating
      if (floatingTooltipTop != false) {
        if (window.scrollY >= floatingTooltipTop) return;
      } else if (floatingTooltipBottom != false) {
        if (window.scrollY <= floatingTooltipBottom) return;
      }

    hideTooltip(!configs.recreateTooltipAfterScroll);
    hideDragHandles(!configs.recreateTooltipAfterScroll);
    recreateTooltip();
  }

  /// Hide tooltip on window resize
  window.addEventListener('resize', function (e) {
    if (tooltipIsShown == false) return;

    hideTooltip(false);
    hideDragHandles(false);
    recreateTooltip();
  });

  /// Hide tooltip on drag start
  document.addEventListener('dragstart', function (e) {
    if (tooltipIsShown == false) return;
    if (e.target.classList && e.target.classList.contains('selection-popup-button')) return;

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

  /// Hide tooltip on context menu open (right click)
  if (configs.hideTooltipOnContextMenuOpen)
    document.addEventListener("contextmenu",(function(e) {
      if (!tooltipIsShown || tooltip.contains(e.target)) return;
      hideTooltip(); 
      hideDragHandles();
    }));

  /// Lazy loading

  /// Fetch or load currency rates from storage
  loadCurrencyRates()

  /// Set CSS rules for tooltip style
  setDocumentStyles();

  /// Get translated button labels
  loadTranslatedLabels()

  /// Recreate shown tooltip on settings change
  chrome.storage.onChanged.addListener((c) => { 
    if (!c.expandedSettingsSections) {
      initConfigs(() => {
        setDocumentStyles();
        setCssStyles();
        if (tooltipIsShown) {
          hideDragHandles(false);
          initTooltip(lastMouseUpEvent);
        }
      });
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
    selection = window.getSelection();
    selectedText = selection.toString().trim();

    if (selection && selectedText.length > 0) {
      createTooltip(lastMouseUpEvent, true);
    }
  }, 650);
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

initConfigs();