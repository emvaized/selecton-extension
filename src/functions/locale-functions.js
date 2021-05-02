function setDefaultLocales() {

    /// Set default currency and language according to browser's locale
    var browserLocale = navigator.language || navigator.userLanguage;
    var browserCountry;

    if (configs.debugMode) {
        console.log('Browser locale is: ' + browserLocale);
        console.log('Configuring default locale settings...');
    }

    if (browserLocale.includes('-')) {
        var parts = browserLocale.split('-');
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
        Object.keys(currenciesList).forEach(function (key) {
            var id = currenciesList[key]['id'];
            if (id.includes(browserCountry)) {
                browserCurrency = id;
            }
        });
        if (configs.debugMode) {
            console.log(`Default browser language: ${browserLanguage}`);
            console.log(`Default browser metrics: ${browserMetricSystem}`);
            console.log(`Default browser currency: ${browserCurrency}`);
            console.log('Saved default locales to memory');
        }
    }


    /// Save rates to memory
    chrome.storage.local.set({
        'convertToCurrency': browserCurrency || 'USD',
        'languageToTranslate': browserLanguage || 'en',
        'preferredMetricsSystem': browserMetricSystem || 'metric',
    });

}