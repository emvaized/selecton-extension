/// List of currencies with various keywords to look for
/// 'rate' should be provided in comparison to United States Dollars (USD) 
/// 
/// New rates will be downloaded automatically with from network by looking for each currency key in server response
/// Period of update specified in configs.updateRatesEveryDays
/// Currently used url can be found in: src/functions/currencies-functions.js -> urlToLoadCurrencyRates
const currenciesList = {
    "AUD": { currencyName: "Australian Dollar", currencySymbol: "A$", rate: 1.29009, currencyKeywords: ['australian dollar', 'австралийских доллар'] },
    "BGN": { currencyName: "Bulgarian Lev", currencySymbol: "лв", rate: 1.640562 },
    "BRL": { currencyName: "Brazilian real", currencySymbol: "R$", rate: 5.616101 },
    "BTC": { currencyName: "Bitcoin", rate: 0.000018, currencyKeywords: ['bitcoins', 'биткоин'] },
    "BYN": { currencyName: "Belarussian Ruble", rate: 2.596137, currencyKeywords: ['белорусских рублей'] },
    "CAD": { currencyName: "Canadian Dollar", currencySymbol: "C$", rate: 1.269384, currencyKeywords: ['canadian dollar', 'канадских доллар'] },
    "CHF": { currencyName: "Swiss Franc", currencySymbol: "CHF", rate: 0.926525 },
    "CNY": { currencyName: "Chinese Yuan", currencySymbol: "¥", rate: 6.497301, currencyKeywords: ['yuan', 'юаней'] },
    "CRC": { currencyName: "Costa Rican Colon", currencySymbol: "₡", rate: 610.339772 },
    "CZK": { currencyName: "Czech Koruna", currencySymbol: "Kč", rate: 21.936455 },
    "DKK": { currencyName: "Danish Krone", currencySymbol: " kr", rate: 6.229502 },
    "EUR": { currencyName: "Euro", currencySymbol: "€", rate: 0.8378, currencyKeywords: ['euro', 'евро'], },
    "GBP": { currencyName: "British Pound", currencySymbol: "£", rate: 0.721124, currencyKeywords: ['фунтов стерлингов', 'british pound'], },
    "HKD": { currencyName: "Hong Kong dollar", currencySymbol: "HK$", rate: 7.765632 },
    "ILS": { currencyName: "Israeli New Sheqel", currencySymbol: "₪", rate: 3.310401 },
    "INR": { currencyName: "Indian Rupee", currencySymbol: "₹", rate: 72.452006, currencyKeywords: ['rupees', 'рупий'], },
    "IRR": { currencyName: "Iranian Rial", currencySymbol: "﷼", rate: 42105.017329 },
    "JPY": { currencyName: "Japanese Yen", currencySymbol: "¥", rate: 109.188027, currencyKeywords: ['yen', 'йен'] },
    "KPW": { currencyName: "North Korean Won", currencySymbol: "₩", rate: 900.00022 },
    "KZT": { currencyName: "Kazakhstani Tenge", currencySymbol: "₸", rate: 418.821319, currencyKeywords: ['тенге'] },
    "MNT": { currencyName: "Mongolian Tugrik", currencySymbol: "₮", rate: 2849.930035 },
    "MXN": { currencyName: "Mexican Peso", currencySymbol: "peso", rate: 20.655212, currencyKeywords: ['peso', 'песо'] },
    "NGN": { currencyName: "Nigerian Naira", currencySymbol: "₦", rate: 410.317377 },
    "NOK": { currencyName: "Norwegian Krone", currencySymbol: " kr", rate: 8.51191 },
    "PLN": { currencyName: "Polish złoty", currencySymbol: "zł", rate: 3.845051 },
    "RUB": { currencyName: "Russian Ruble", currencySymbol: "₽", rate: 72.880818, currencyKeywords: ['rubles', 'рублей', 'руб', ' р.'] },
    "SAR": { currencyName: "Saudi Riyal", currencySymbol: "﷼", rate: 3.750694 },
    "SEK": { currencyName: "Swedish Krona", currencySymbol: " kr", rate: 8.514027 },
    "TRY": { currencyName: "Turkish Lira", currencySymbol: "₺", rate: 0.14 },
    "UAH": { currencyName: "Ukrainian Hryvnia", currencySymbol: "₴", rate: 27.852288, currencyKeywords: ['hryvnia', 'гривен', 'грн', 'р.'] },
    "USD": { currencyName: "United States Dollar", currencySymbol: "$", rate: 1, currencyKeywords: ['dollar', 'доллар'] },
    "VND": { currencyName: "Vietnamese Dong", currencySymbol: "₫", rate: 23054.385489 },
    "ZAR": { currencyName: "Rand", rate: 14.856969 },
}