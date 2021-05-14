/// Currently non user-configurable settings 
var wordsLimitToProccessText = 5;
var secondaryColor = 'lightBlue';
var ignoreWhenTextFieldFocused = true;
var convertWhenOnlyFewWordsSelected = true;
var loadTooltipOnPageLoad = false;
var addSelectionTextShadow = false;
var selectionTextShadowOpacity = 0.75;
var allowWebsitesOverrideSelectionColor = true;
var defaultBackgroundColor = '#4c4c4c';

/// Service variables
var copyLabel = 'Copy';
var searchLabel = 'Search';
var openLinkLabel = 'Open';
var translateLabel = 'Translate';
var showOnMapLabel = 'Translate';
var cutLabel = 'Cut';
var pasteLabel = 'Paste';
var italicLabel = 'Italic';
var boldLabel = 'Bold';
var ratesLastFetchedDate;
var tooltip;
var secondaryTooltip;
var arrow;
var selection;
var selectedText;
var dontShowTooltip = false;
var isDraggingTooltip = false;
var firstButtonBorderRadius = `3px 0px 0px 3px`;
var lastButtonBorderRadius = `0px 3px 3px 0px`;
var isDarkBackground = true;
var linkSymbolsToShow = 20;
var searchButton;
var browserLanguage;
var browserCurrency;
var browserMetricSystem;
var addButtonIcons;

var previousSelection;



/// Look for these words to find that selected text is address
const addressKeywords = [
    'ул.',
    'пр.',
    'проспект ',
    'улица',
    'вулиця',
    ' street',
    'broadway',
    ' st.',
];
