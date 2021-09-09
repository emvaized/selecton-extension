/// Look for these words to find that selected text is address, in order to show "Show on map" button
const addressKeywords = [
    ' street',
    'broadway',
    ' st.',
    ' city',

    /// Russian keywords
    'ул.',
    'пр.',
    'г.',
    'город ',
    'проспект ',
    'улица ',
    'переулок ',

    /// Ukrainian keywords
    'вулиця ',
    'вул. ',
    'м. ',
    'місто ',

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


/// Unit conversion units
/// Each key is a keyword, which will be searched for in the selected text
/// 'ratio' is the ratio to multiply, in order to get the value in 'covertsTo'
/// Temperature units provide "convertFunction" instead - code will look for this if selected value contains "°"
const convertionUnits = {
    "inch": {
        "convertsTo": "cm",
        "ratio": 2.54,
        "type": "imperial"
    },
    "feet": {
        "convertsTo": "meters",
        "ratio": 0.3048,
        "type": "imperial"
    },
    " ft": {
        "convertsTo": "meter",
        "ratio": 0.3048,
        "type": "imperial"
    },
    "foot": {
        "convertsTo": "meter",
        "ratio": 0.3048,
        "type": "imperial"
    },
    "lb": {
        "convertsTo": "kg",
        "ratio": 0.453592,
    },
    "pound": {
        "convertsTo": "kilogram",
        "ratio": 0.453592,
    },
    "mph": {
        "convertsTo": "km/h",
        "ratio": 1.60934,
    },
    "miles": {
        "convertsTo": "km",
        "ratio": 1.60934,
    },
    "mile": {
        "convertsTo": "km",
        "ratio": 1.60934,
    },
    "yard": {
        "convertsTo": "m",
        "ratio": 0.9144,
    },
    " oz": {
        "convertsTo": "gr",
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

    /// Russian variants
    " миль": {
        "convertsTo": "км",
        "ratio": 1.60934,
    },
    " ярдов": {
        "convertsTo": "метров",
        "ratio": 0.9144,
    },
    "футов": {
        "convertsTo": "метров",
        "ratio": 0.3048,
    },
    " фута": {
        "convertsTo": "метров",
        "ratio": 0.3048,
    },
    "дюймов": {
        "convertsTo": "см",
        "ratio": 2.54,
    },
    "дюйма": {
        "convertsTo": "см",
        "ratio": 2.54,
    },
    "фунтов": {
        "convertsTo": "кг",
        "ratio": 0.453592,
    },
    " унций": {
        "convertsTo": "грамм",
        "ratio": 28.3495,
    },
    " унции": {
        "convertsTo": "грамм",
        "ratio": 28.3495,
    },
    " унция": {
        "convertsTo": "грамм",
        "ratio": 28.3495,
    },
};