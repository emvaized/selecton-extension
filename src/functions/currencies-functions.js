const urlToLoadCurrencyRates = 'https://api.exchangerate.host/latest?base=USD';
const urlToLoadCryptoCurrencies = 'https://api.exchangerate.host/latest?&source=crypto';

async function fetchCurrencyRates() {
    if (currencyRatesWereLoaded) return;
    if (configs.debugMode) console.log('Selecton needs to update currency rates...');

    let urlToFetch = urlToLoadCurrencyRates;

    let today = new Date();
    const offset = today.getTimezoneOffset()
    today = new Date(today.getTime() - (offset * 60 * 1000))
    today = today.toISOString().split('T')[0];

    if (today != null && today !== undefined && today != '')
        urlToFetch += `&v=${today}`;

    const ratesObject = {};

    try {
        /// Fetch regular currencies
        const response = await fetch(urlToFetch);
        if (!response.ok) throw new Error(`An error has occured: ${response.status}`);
        const jsonObj = await response.json();
        const success = jsonObj['success'];
        if (!success) {
            if (configs.debugMode) console.log('Error while fetching currency rates from network');
            return;
        }

        const date = jsonObj['date'];
        const val = jsonObj['rates'];

        let keys = Object.keys(currenciesList);
        for (let i = 0, l = keys.length; i < l; i++) {
            try {
                let key = keys[i];
                if (val[key] == null || val[key] == undefined) continue;
                currenciesList[key]['rate'] = val[key];
                ratesObject[key] = val[key];
            } catch (e) { }
        }

        if (configs.debugMode) console.log('fetched regular currencies');

        /// Fetch crypto currencies
        urlToFetch = urlToLoadCryptoCurrencies;
        urlToFetch += `&v=${today}`;

        console.log(urlToFetch);

        const response2 = await fetch(urlToFetch);
        if (!response2.ok) throw new Error(`An error has occured: ${response2.status}`);
        const responseObj = await response2.json();
        const val2 = responseObj['rates'];

        if (val2 !== undefined)
            for (let i = 0, l = cryptoCurrencies.length; i < l; i++) {
                try {
                    let currency = cryptoCurrencies[i];
                    if (val2[currency] == null || val2[currency] == undefined) continue;
                    currenciesList[currency]['rate'] = val2[currency];
                    ratesObject[currency] = val2[currency];
                } catch (e) { console.log(e); }
            }

        if (configs.debugMode) console.log('fetched crypto currencies');

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

    } catch (error) {
        if (configs.debugMode) {
            console.log('Error while loading currencies from network:');
            console.log(error);
        }
    }

    // fetch(urlToFetch).then(function (val) {
    //     return val.json();
    // }).then(function (jsonObj) {
    //     const success = jsonObj['success'];
    //     if (!success) {
    //         if (configs.debugMode) console.log('Error while fetching currency rates from network');
    //         return;
    //     }

    //     const date = jsonObj['date'];
    //     const val = jsonObj['rates'];

    //     let keys = Object.keys(currenciesList);
    //     for (let i = 0, l = keys.length; i < l; i++) {
    //         try {
    //             let key = keys[i];
    //             if (val[key] == null || val[key] == undefined) continue;

    //             currenciesList[key]['rate'] = val[key];
    //             ratesObject[key] = val[key];
    //         } catch (e) { }
    //     }

    //     /// Save rates to memory
    //     chrome.storage.local.set({
    //         'ratesLastFetchedDate': date,
    //         'rates': ratesObject
    //     });

    //     currencyRatesWereLoaded = true;

    //     if (configs.debugMode) {
    //         console.log('Updated currency rates from network:');
    //         console.log(ratesObject);
    //         console.log('Saved date of last fetch:');
    //         console.log(date);
    //     }
    // }).catch(function (e) {
    //     if (configs.debugMode) {
    //         console.log('Error while loading currencies from network:');
    //         console.log(e);
    //     }
    // });
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
                if (rate !== undefined && rate !== null)
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