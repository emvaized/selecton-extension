const urlToLoadCurrencyRates = 'https://api.exchangerate.host/latest?base=USD';

function fetchCurrencyRates() {
    if (currencyRatesWereLoaded) return;
    if (configs.debugMode) console.log('Selecton needs to update currency rates');

    let urlToFetch = urlToLoadCurrencyRates;

    let today = new Date();
    const offset = today.getTimezoneOffset()
    today = new Date(today.getTime() - (offset * 60 * 1000))
    today = today.toISOString().split('T')[0];

    if (today != null && today !== undefined && today != '')
        urlToFetch += `&v=${today}`;

    fetch(urlToFetch).then(function (val) {
        return val.json();
    }).then(function (jsonObj) {
        const success = jsonObj['success'];
        if (!success) {
            if (configs.debugMode) console.log('Error while fetching currency rates from network');
            return;
        }

        const date = jsonObj['date'];
        const val = jsonObj['rates'];
        const ratesObject = {};

        let keys = Object.keys(currenciesList);
        for (let i = 0, l = keys.length; i < l; i++) {
            try {
                let key = keys[i];
                if (val[key] == null || val[key] == undefined) continue;

                currenciesList[key]['rate'] = val[key];
                ratesObject[key] = val[key];
            } catch (e) { }
        }

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
        const loadedRates = val['rates'];
        const keys = Object.keys(currenciesList);

        for (let i = 0, l = keys.length; i < l; i++) {
            try {
                let key = keys[i];
                let rate = loadedRates[key];
                if (rate !== null && rate !== undefined)
                    currenciesList[key]['rate'] = rate;
            } catch (e) { }
        }

        currencyRatesWereLoaded = true;

        if (configs.debugMode) {
            console.log('Selecton currency rates loaded from memory:');
            console.log(loadedRates);
        }
    });
}