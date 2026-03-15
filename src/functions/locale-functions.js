function setDefaultLocales() {

    /// Set default currency and language according to browser's locale
    let browserLocale = navigator.language || navigator.userLanguage;
    let browserCountry;

    browserLocale.replaceAll(' ', '');
    if (browserLocale.includes('-')) {
        let parts = browserLocale.split('-');
        browserLanguage = parts[0];
        browserCountry = parts[1];
    } else {
        browserLanguage = browserLocale;
        browserCountry = browserLocale.toUpperCase();
    }

    if (browserCountry !== null && browserCountry !== undefined && browserCountry !== '') {

        /// Set default metric system
        if (browserCountry == 'US')
            browserMetricSystem = 'imperial';
        else browserMetricSystem = 'metric';

        /// Set default currency
        let keys = Object.keys(currenciesList);
        for (let i = 0, l = keys.length; i < l; i++) {
            let key = keys[i];
            if (key.includes(browserCountry)) browserCurrency = key;
        }
    }

    /// Save measured locales to memory
    chrome.storage.local.set({
        'convertToCurrency': browserCurrency || 'USD',
        'convertToCurrencySecondary': '',
        'languageToTranslate': browserLanguage || 'en',
        'preferredMetricsSystem': browserMetricSystem || 'metric',
    });
}