/// Unit conversion units
/// Each key is a keyword, which will be searched for in the selected text
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
            if (preferredMetricsSystem == 'metric')
                return (value - 32) * (5 / 9);
            return (value * 9 / 5) + 32;
        },
    },
    "°K": {
        "convertsTo": "°C",
        "ratio": -272.15,
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
};