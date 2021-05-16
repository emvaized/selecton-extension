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


const timeZoneKeywords = {
    'PST': '-0800',
    'PDT': '-0700',
    'MST': '-0700',
    'MDT': '-0600',
    'ACST': '+0930',
    'AEST': '+1000',
    'AKST': '-0900',
    'AST': '-0400',
    'AWST': '+0800',
    'CAT': '+0200',
    'CET': '+0100',
    'CST': '-0600',
    'EAT': '+0300',
    'EET': '+0200',
    'EST': '-0500',
    'GMT': 'GMT',
    'HAST': '-1000',
    'MSK': '+0300',
    'MST': '-0700',
    'NST': '-0330',
    'PST': '-0800',
    'UTC': 'UTC',
    'WAT': '+0100',
    'WET': 'UTC',
    'по Московскому времени': '+0300',
    'по московскому времени': '+0300',
    'по Москве': '+0300',
    'по центральноевропейскому времени': '+0100',
    'по европейскому времени': '+0100',
};
