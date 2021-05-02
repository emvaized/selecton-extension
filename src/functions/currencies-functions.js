function fetchCurrencyRates() {
    fetch(urlToLoadCurrencyRates).then(function (val) {
        return val.json();
    }).then(function (jsonObj) {
        var date = jsonObj['date'];
        var val = jsonObj['rates'];
        var ratesObject = {};

        Object.keys(currenciesList).forEach(function (key) {
            currenciesList[key]['rate'] = val[currenciesList[key]['id']];
            ratesObject[key] = val[currenciesList[key]['id']];
        });

        /// Save rates to memory
        chrome.storage.local.set({
            'ratesLastFetchedDate': date,
            'rates': ratesObject
        });

        if (configs.debugMode)
            console.log('Updated currency rates for Selecton');
    });
}

function loadCurrencyRatesFromMemory() {
    chrome.storage.local.get('rates', function (val) {
        var loadedRates = val['rates'];

        Object.keys(currenciesList).forEach(function (key) {
            var id = currenciesList[key]['id'];
            var rate = loadedRates[id];
            if (rate !== null && rate !== undefined)
                currenciesList[key]['rate'] = rate;
        });

        if (configs.debugMode) {
            console.log('Selecton currency rates were successfully loaded from memory:');
            console.log(loadedRates);
        }
    });
}