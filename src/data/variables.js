/// Currently non user-configurable settings 
var convertWhenOnlyFewWordsSelected = true;
var wordsLimitToProccessText = 5;
var secondaryColor = 'lightBlue';
var linkSymbolsToShow = 20;
var selectionHandleLineHeight = 25;

/// Button labels – translations assigned in code
var copyLabel = 'Copy';
var searchLabel = 'Search';
var openLinkLabel = 'Open';
var translateLabel = 'Translate';
var showOnMapLabel = 'Show on map';
var cutLabel = 'Cut';
var pasteLabel = 'Paste';
var dictionaryLabel = 'Dictionary';
var markerLabel = 'Highlight';
var italicLabel = 'Italic';
var boldLabel = 'Bold';
var strikeLabel = 'Strike';
var clearLabel = 'Clear';

/// Dynammically assigned variables
var selection, selectedText;
var tooltip, secondaryTooltip, arrow, infoPanel, searchButton, copyButton, verticalSecondaryTooltip;
var tooltipIsShown = false, dontShowTooltip = false, isDraggingTooltip = false, isDraggingDragHandle = false, isDarkTooltip = true;
var draggingHandleIndex, lastMouseUpEvent, ratesLastFetchedDate;
var firstButtonBorderRadius = '3px 0px 0px 3px', lastButtonBorderRadius = '0px 3px 3px 0px', onlyButtonBorderRadius = '3px';
var browserLanguage, browserCurrency, browserMetricSystem;
var tooltipOnBottom = false, configsWereLoaded = false, currencyRatesWereLoaded = false, isTextFieldFocused = false;
var isTextFieldEmpty = true, domainIsBlacklistedForSnapping, selectedTextIsCode, addButtonIcons;
var timerToRecreateOverlays, delayToRecreateOverlays = 150;
var floatingTooltipTop = false, floatingTooltipBottom = false;