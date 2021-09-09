const urlToLoadCurrencyRates = 'https://api.exchangerate.host/latest?base=USD';

function fetchCurrencyRates() {
    fetch(urlToLoadCurrencyRates).then(function (val) {
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

        if (configs.debugMode) {
            console.log('Updated currency rates from network:');
            console.log(ratesObject);
        }
    }).catch(function (e) {
        if (configs.debugMode) {
            console.log('Error while loading currencies from network:');
            console.log(e);
        }
    });
}

function loadCurrencyRatesFromMemory() {
    chrome.storage.local.get('rates', function (val) {
        var loadedRates = val['rates'];

        Object.keys(currenciesList).forEach(function (key) {
            var rate = loadedRates[key];
            if (rate !== null && rate !== undefined)
                currenciesList[key]['rate'] = rate;
        });

        if (configs.debugMode) {
            console.log('Selecton currency rates were successfully loaded from memory:');
            console.log(loadedRates);
        }
    });
}