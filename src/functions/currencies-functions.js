const urlToLoadCurrencyRates = 'https://api.exchangerate.host/latest?base=USD';

function fetchCurrencyRates() {
    if (currencyRatesWereLoaded) return;

    let urlToFetch = urlToLoadCurrencyRates;

    let today = new Date();
    const offset = today.getTimezoneOffset()
    today = new Date(today.getTime() - (offset * 60 * 1000))
    today = today.toISOString().split('T')[0];

    if (configs.debugMode) {
        console.log('Today:');
        console.log(today);
    }

    if (today != null && today !== undefined && today != '')
        urlToFetch += `&v=${today}`;

    fetch(urlToFetch).then(function (val) {
        return val.json();
    }).then(function (jsonObj) {
        var date = jsonObj['date'];
        var val = jsonObj['rates'];
        var ratesObject = {};

        Object.keys(currenciesList).forEach(function (key) {
            currenciesList[key]['rate'] = val[key];
            ratesObject[key] = val[key];
        });

        /// Save rates to memory
        chrome.storage.local.set({
            'ratesLastFetchedDate': date,
            'rates': ratesObject
        });

        currencyRatesWereLoaded = true;

        if (configs.debugMode) {
            console.log('Updated currency rates from network:');
            console.log(ratesObject);

            console.log('Saved date of last fetch:');
            console.log(date);
        }
    }).catch(function (e) {
        if (configs.debugMode) {
            console.log('Error while loading currencies from network:');
            console.log(e);
        }
    });
}

function loadCurrencyRatesFromMemory() {
    if (currencyRatesWereLoaded) return;

    chrome.storage.local.get('rates', function (val) {
        var loadedRates = val['rates'];

        Object.keys(currenciesList).forEach(function (key) {
            let rate = loadedRates[key];
            if (rate !== null && rate !== undefined)
                currenciesList[key]['rate'] = rate;
        });

        currencyRatesWereLoaded = true;

        if (configs.debugMode) {
            console.log('Selecton currency rates loaded from memory:');
            console.log(loadedRates);
        }
    });
}