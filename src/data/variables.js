/// Configs. Values are being set in init() function of index.js
var convertToCurrency = 'USD';
var hideOnScroll;
var preferredMetricsSystem; /// Possible values: 'imperial', 'metric';
var showTranslateButton;
var languageToTranslate;
var convertMetrics = true;
var addOpenLinks = true;
var convertCurrencies = true;
var performSimpleMathOperations = true;
var useCustomStyle = false;
var tooltipBackground = '3B3B3B';
var tooltipOpacity = 1.0;
var addTooltipShadow = false;
var shadowOpacity = 0.5;
var borderRadius = 3;
var changeTextSelectionColor = false;
var textSelectionBackground;
var textSelectionColor;
var shiftTooltipWhenWebsiteHasOwn = true;
var addActionButtonsForTextFields = true;
var removeSelectionOnActionButtonClick = true;
var draggableTooltip = true;
var addButtonIcons = false;
var enabled = true;
var preferredSearchEngine = 'google'; /// Possible values listed in 'returnSearchUrl' method
var hideOnKeypress = true;
var showOnMapButtonEnabled = true;
var showEmailButton = true;
var preferredNewEmailMethod = 'mailto'; /// Possible values listed in 'returnEmailUrl' method
var customSearchUrl;
var preferredMapsService = 'google'; /// Possible values listed in 'returnOpenMapsUrl' method
var addColorPreviewButton = true;
var secondaryTooltipEnabled = true;
var secondaryTooltipIconSize = 15;
var showSecondaryTooltipTitleOnHover = false;
var addPhoneButton = true;
var excludedDomains = '';
var showUnconvertedValue = true;
var debugMode = false;
var buttonsStyle = 'onlylabel'; /// Possible values: 'onlylabel, onlyicon', iconlabel'
var addDragHandles = true;  /// Experimental drag handles
var snapSelectionToWord = true;
var preferCurrencySymbol = true;
var shouldOverrideWebsiteSelectionColor = false;
var disableWordSnappingOnCtrlKey = true;
var showButtonLabelOnHover = true;
var animationDuration = 300;
var tooltipRevealEffect = 'scaleUpTooltipEffect';
var customSearchButtons = [
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

/// Currently non user-configurable settings 
var updateRatesEveryDays = 14;
var wordsLimitToProccessText = 5;
var secondaryColor = 'lightBlue';
var ignoreWhenTextFieldFocused = true;
var convertWhenOnlyFewWordsSelected = true;
var loadTooltipOnPageLoad = false;
var addSelectionTextShadow = false;
var selectionTextShadowOpacity = 0.75;
var allowWebsitesOverrideSelectionColor = true;

/// Service variables
var copyLabel = 'Copy';
var searchLabel = 'Search';
var openLinkLabel = 'Open';
var translateLabel = 'Translate';
var showOnMapLabel = 'Translate';
var cutLabel = 'Cut';
var pasteLabel = 'Paste';
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

/// Those are used to load configs from memory in index.js
var userSettingsKeys = [
    'convertToCurrency',
    'hideOnScroll',
    'convertMetrics',
    'addOpenLinks',
    'convertCurrencies',
    'performSimpleMathOperations',
    'preferredMetricsSystem',
    'showTranslateButton',
    'languageToTranslate',
    'ratesLastFetchedDate',
    'useCustomStyle',
    'tooltipBackground',
    'tooltipOpacity',
    'addTooltipShadow',
    'shadowOpacity',
    'borderRadius',
    'changeTextSelectionColor',
    'textSelectionBackground',
    'textSelectionColor',
    'shiftTooltipWhenWebsiteHasOwn',
    'addActionButtonsForTextFields',
    'removeSelectionOnActionButtonClick',
    'draggableTooltip',
    'enabled',
    'preferredSearchEngine',
    'hideOnKeypress',
    'showOnMapButtonEnabled',
    'showEmailButton',
    'preferredNewEmailMethod',
    'customSearchUrl',
    'preferredMapsService',
    'addColorPreviewButton',
    'customSearchButtons',
    'secondaryTooltipEnabled',
    'secondaryTooltipIconSize',
    'showSecondaryTooltipTitleOnHover',
    'excludedDomains',
    'addPhoneButton',
    'showUnconvertedValue',
    'debugMode',
    'buttonsStyle',
    'addDragHandles',
    'snapSelectionToWord',
    'preferCurrencySymbol',
    'shouldOverrideWebsiteSelectionColor',
    'disableWordSnappingOnCtrlKey',
    'showButtonLabelOnHover',
    'animationDuration',
    'tooltipRevealEffect',
];

// /// Those are used on settings page
// var defaultConfigs = new Map([
//     ['hideOnScroll', true],
//     ['convertMetrics', true],
//     ['addOpenLinks', true],
//     ['convertCurrencies', true],
//     ['performSimpleMathOperations', true],
//     ['preferredMetricsSystem', 'metric'],
//     ['showTranslateButton', true],
//     ['languageToTranslate', navigator.language || navigator.userLanguage || 'en'],
//     ['useCustomStyle', false],
//     ['tooltipBackground', '#3B3B3B'],
//     ['tooltipOpacity', 1.0],
//     ['addTooltipShadow', false],
//     ['shadowOpacity', 0.5],
//     ['borderRadius', 3],
//     ['changeTextSelectionColor', false],
//     ['textSelectionBackground', '#338FFF'],
//     ['textSelectionColor', '#ffffff'],
//     ['shiftTooltipWhenWebsiteHasOwn', true],
//     ['addActionButtonsForTextFields', false],
//     ['removeSelectionOnActionButtonClick', true],
//     ['draggableTooltip', true],
//     ['enabled', true],
//     ['hideOnKeypress', true],
//     ['preferredSearchEngine', 'google'],
//     ['showOnMapButtonEnabled', true],
//     ['showEmailButton', true],
//     ['preferredNewEmailMethod', 'mailto'],
//     ['customSearchUrl', ''],
//     ['addColorPreviewButton', true],
//     ['preferredMapsService', 'google'],
//     ['secondaryTooltipEnabled', true],
//     ['secondaryTooltipIconSize', 15],
//     ['showSecondaryTooltipTitleOnHover', false],
//     ['excludedDomains', ''],
//     ['addPhoneButton', true],
//     ['showUnconvertedValue', true],
//     ['addScaleUpEffect', true],
//     ['debugMode', false],
//     ['addDragHandles', false],
//     ['snapSelectionToWord', false],
//     // ['preferCurrencySymbol', false],
//     ['buttonsStyle', 'onlylabel'],
// ]);


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
