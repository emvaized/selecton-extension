/// Look for these words to find that selected text is address, in order to show "Show on map" button
const addressKeywords = [
    /// English keywords
    ' street',
    'broadway',
    ' st.',
    ' str.',
    ' city',

    /// Russian
    'ул.',
    'пр.',
    'г.',
    'улица ',
    'переулок ',
    'город ',
    'проспект ',

    /// Ukrainian
    'вулиця ',
    'вул. ',
    'м. ',
    'місто ',

    /// Belorussian
    'вуліца ',
    'горад ',
    'праспект ',

    /// Spanish
    ' calle',
    'calle ',
    'ciudad ',

    /// French
    'ville ',
    'rue ',

    /// German
    'straße',
    'strasse',
    ' stadt',
];

/// Unit conversion units
/// Each key is a keyword, which will be searched for in the selected text
/// 'ratio' is the ratio to multiply, in order to get the value in 'covertsTo'
/// Temperature units provide "convertFunction" instead - code will look for this if selected value contains "°"
const convertionUnits = {
    "inch": {
        "convertsTo": "cm",
        "ratio": 2.54,
        "type": "imperial",
        "variations": [
            "pouces", /// fr
            "pulgadas", /// sp
        ]
    },
    /// Duplicate only for imperial recognition to recognize " m."
    " ft.": {
        "convertsTo": " m.",
        "ratio": 0.3048,
    },
    "feet": {
        "convertsTo": "meters",
        "ratio": 0.3048,
        "type": "imperial",
        "variations": [
            " ft",
            " foot",
            "pieds", /// fr
            "pies", /// sp
        ]
    },
    "pound": {
        "convertsTo": "kg",
        "ratio": 0.453592,
        "variations": [
            " lb",
            " libras", /// fr
            " livres", /// fr
        ]
    },
    " mph": {
        "convertsTo": "km/h",
        "ratio": 1.60934,
        "variations": [
            "miles per hour",
        ]
    },
    " mile": {
        "convertsTo": "km",
        "ratio": 1.60934,
        "variations": [
            'millas', /// sp
            'milles', /// fr
        ],
    },
    "yard": {
        "convertsTo": "meters",
        "ratio": 0.9144,
    },
    " oz.": {
        "convertsTo": "grams",
        "ratio": 28.3495,
    },
    "°F": {
        "convertsTo": "°C",
        "convertFunction": function (value) {
            if (configs.preferredMetricsSystem == 'metric')
                return (value - 32) * (5 / 9);
            return (value * 9 / 5) + 32;
        },
    },
    "°K": {
        "convertsTo": "°C",
        "convertFunction": function (value) {
            return value - 273.15;
        },
    },

    /// Cyrillic variants
    " миль": {
        "convertsTo": "км",
        "ratio": 1.60934,
        "variations": [
            ' мили',
        ],
    },
    " ярдов": {
        "convertsTo": "метров",
        "ratio": 0.9144,
    },
    "футов": {
        "convertsTo": "метров",
        "ratio": 0.3048,
        "variations": [
            ' фута',
        ],
    },
    "дюймов": {
        "convertsTo": "см",
        "ratio": 2.54,
        "variations": [
            ' дюйма',
        ],
    },
    "фунтов": {
        "convertsTo": "кг",
        "ratio": 0.453592,
        "variations": [
            ' фунта',
        ],
    },
    " унций": {
        "convertsTo": "грамм",
        "ratio": 28.3495,
        "variations": [
            ' унции',
            ' унция',
        ],
    },
};

/// Literal multipliers for numeric values
/// With the help of these, "2 thousand" will be converted to "2000"
const thousandMultipliers = [
    'thousand',
    'тысяч',
    'тыс',
];

const millionMultipliers = [
    'million',
    'millón',
    'millones',
    'млн',
    'миллион',
    'мільйон',
];

const billionMultipliers = [
    'billion',
    'milliard',
    'mil millones',
    'млрд',
    'миллиард',
    'більйон',
    'мільярд',
];


/// Convert timezones
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

    /// Russian keywords
    'по Московскому времени': '+0300',
    'по московскому времени': '+0300',
    'по Москве': '+0300',
    'по центральноевропейскому времени': '+0100',
    'по европейскому времени': '+0100',
    'по тихоокеанскому времени': '-0800',
    'по Гринвичу': 'GMT',
};


/// Those will be ignored when looking for website in selected text
/// So that, for example, when selected "somefile.txt" - it won't be recognized as a website in "Open link" button
const filetypesToIgnoreAsDomains = [
    "txt",
    "zip",
    "rar",
    "7z",
    "mp3",
    "exe",
    "cfg",
    "ini",
    "js",
    "html",
    "css",
    "log",
];

/// Search for these keywords to detect if selected text looks like code
const codeMarkers = [
    'const ',
    'var ',
    'let ',
    'async ',
    'await ',
    '/>',
    '{',
    '}',
    '()',
    ' = ',
    `='`,
    `="`,
    `('`,
    `("`,
    `": "`,
];


/// Keywords to recognize selected text as a website
// const websiteKeywords = [
//     '.com',
//     '.org',
//     '.net',
//     '.int',
//     '.edu',
//     '.gov',
//     '.mil',
//     '.xyz',
//     '.website',
//     '.video',
//     '.travel',
//     '.support',
//     '.store',
//     '.site',
//     '.pub',
//     '.photo',
//     '.info',
//     '.eu',

//     /// Russian/Ukrainian domains
//     '.ru',
//     '.ру',
//     '.ua',
// ];