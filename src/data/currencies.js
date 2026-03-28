/// List of currencies with various keywords to look for
/// 'rate' should be provided in comparison to United States Dollars (USD) 
/// 
/// New rates will be downloaded automatically with from network by looking for each currency key in server response
/// Period of update specified in configs.updateRatesEveryDays

/** URLs for loading currency rates
 * Currencies are fetched in {@link fetchCurrencyRates} in src/function/background.js
 * {@link urlToLoadCurrencyRates}.
 * {@link urlToLoadCryptoCurrencies}.
 */

const currenciesList = {
    "AUD": { name: "Australian Dollar", symbol: "A$", rate: 1.29009, keywords: ['australian dollar', 'австралийских доллар'] },
    "BGN": { name: "Bulgarian Lev", symbol: "лв", rate: 1.640562 },
    "BRL": { name: "Brazilian real", symbol: "R$", rate: 5.616101 },
    "BYN": { name: "Belarussian Ruble", rate: 2.596137, keywords: ['белорусских рублей'] },
    "CAD": { name: "Canadian Dollar", symbol: "C$", rate: 1.269384, keywords: ['canadian dollar', 'канадских доллар'] },
    "CHF": { name: "Swiss Franc", symbol: "CHF", rate: 0.926525 },
    "CNY": { name: "Chinese Yuan", symbol: "¥", rate: 6.497301, keywords: ['yuan', 'юаней'] },
    "CRC": { name: "Costa Rican Colon", symbol: "₡", rate: 610.339772 },
    "CZK": { name: "Czech Koruna", symbol: "Kč", rate: 21.936455 },
    "DKK": { name: "Danish Krone", symbol: " kr", rate: 6.229502 },
    "EUR": { name: "Euro", symbol: "€", rate: 0.8378, keywords: ['euro', 'евро'], },
    "GBP": { name: "British Pound", symbol: "£", rate: 0.721124, keywords: ['фунтов стерлингов', 'british pound'], },
    "HKD": { name: "Hong Kong dollar", symbol: "HK$", rate: 7.765632 },
    "HUF": { name: "Hungarian forint", rate: 316.005504 },
    "IDR": { name: "Indonesian Rupiah", symbol: "Rp", rate: 15711.86182839, keywords: ['Rp', 'Rupiah'] },
    "ILS": { name: "Israeli New Sheqel", symbol: "₪", rate: 3.310401 },
    "INR": { name: "Indian Rupee", symbol: "₹", rate: 72.452006, keywords: ['rupees', 'рупий'], },
    "IRR": { name: "Iranian Rial", symbol: "﷼", rate: 42105.017329 },
    "JPY": { name: "Japanese Yen", symbol: "¥", rate: 109.188027, keywords: [' yen', ' йен', '円'] },
    "KRW": { name: "South Korean Won", symbol: "₩", rate: 1193.057307 },
    "KPW": { name: "North Korean Won", symbol: "₩", rate: 900.00022 },
    "KZT": { name: "Kazakhstani Tenge", symbol: "₸", rate: 418.821319, keywords: ['тенге'] },
    "MNT": { name: "Mongolian Tugrik", symbol: "₮", rate: 2849.930035 },
    "MXN": { name: "Mexican Peso", symbol: "peso", rate: 20.655212, keywords: ['peso', 'песо'] },
    "MYR": { name: "Malaysian Ringgit", symbol: "RM", rate: 4.208613, keywords: ['myr'] },
    "NGN": { name: "Nigerian Naira", symbol: "₦", rate: 410.317377 },
    "NOK": { name: "Norwegian Krone", symbol: " kr", rate: 8.51191 },
    "PHP": { name: "Philippine Peso", symbol: "₱", rate: 56.012, keywords: ['pesos', 'php'], searchInText: false},
    "PLN": { name: "Polish złoty", symbol: "zł", rate: 3.845051 },
    "RON": { name: "Romanian leu", symbol: "leu", rate: 5.058587 },
    "RUB": { name: "Russian Ruble", symbol: "₽", rate: 72.880818, keywords: ['rubles', 'рублей', 'руб', ' р.'] },
    "SAR": { name: "Saudi Riyal", symbol: "﷼", rate: 3.750694 },
    "SEK": { name: "Swedish Krona", symbol: " kr", rate: 8.514027 },
    "THB": { name: "Thai Baht", symbol: "฿", rate: 34.700854, keywords: ['THB', 'Baht', 'baht'] },
    "TRY": { name: "Turkish Lira", symbol: "₺", rate: 43.96, keywords: ['TL', 'tl', 'Lira', 'lira']  },
    "TWD": { name: "New Taiwan dollar", symbol: "NT$", rate: 31.99368752 },
    "UAH": { name: "Ukrainian Hryvnia", symbol: "₴", rate: 27.852288, keywords: ['hryvnia', 'гривен', 'грн'] },
    "USD": { name: "United States Dollar", symbol: "$", rate: 1, keywords: ['dollar', 'dolar', 'доллар'] },
    "VND": { name: "Vietnamese Dong", symbol: "₫", rate: 23054.385489 },
    "ZAR": { name: "Rand", rate: 14.856969 },

    /// Crypto
    "BTC": { name: "Bitcoin", rate: 0.000018, symbol: "₿", keywords: ['bitcoins', 'биткоин'] },
    "ETH": { name: "Ethereum", rate: 0.0003208, crypto: true },
    "LTC": { name: "Litecoin", rate: 0.006242, crypto: true },
    "ADA": { name: "Cardano", rate: 0.4492, crypto: true },
    "MIOTA": { name: "MIOTA", rate: 0.7418, crypto: true },
    "EOS": { name: "EOS", rate: 0.2336, crypto: true },
    "BCH": { name: "BCH", rate: 0.001843, crypto: true },
    "XRP": { name: "XRP", rate: 1.016, crypto: true },
    "ZEC": { name: "ZEC", rate: 0.008209, crypto: true },
    "XMR": { name: "XMR", rate: 0.004037, crypto: true },
    "ZCL": { name: "XMR", rate: 7.348, crypto: true },
    "DOGE": { name: "DOGE", rate: 4.537, crypto: true },
}
