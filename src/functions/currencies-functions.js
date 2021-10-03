const urlToLoadCurrencyRates = 'https://api.exchangerate.host/latest?base=USD';
const urlToLoadCryptoCurrencies = 'https://min-api.cryptocompare.com/data/price?fsym=USD';

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

        if (configs.debugMode) console.log('Fetched regular currencies successfully');

        /// Fetch crypto currencies
        urlToFetch = urlToLoadCryptoCurrencies;
        const listOfParams = cryptoCurrencies.join(',');
        urlToFetch += '&tsyms=' + listOfParams;

        try {
            // await fetchCryptoRates(urlToFetch, ratesObject);
            const cryptoResponse = await fetch(urlToFetch);
            if (!cryptoResponse.ok) throw new Error(`An error has occured: ${cryptoResponse.status}`);
            const cryptoVal = await cryptoResponse.json();

            for (let i = 0, l = cryptoCurrencies.length; i < l; i++) {
                try {
                    let currency = cryptoCurrencies[i];
                    if (cryptoVal[currency] == null || cryptoVal[currency] == undefined) continue;
                    currenciesList[currency]['rate'] = cryptoVal[currency];
                    ratesObject[currency] = cryptoVal[currency];
                } catch (e) { console.log(e); }
            }

            if (configs.debugMode) console.log('Fetched crypto currencies successfully');
        } catch (e) { if (configs.debugMode) console.log('Failed to fetch crypto currencies'); }

        /// Save rates to memory
        if (ratesObject != {})
            chrome.storage.local.set({
                //'ratesLastFetchedDate': date,
                'ratesLastFetchedDate': today,
                'rates': ratesObject
            });

        currencyRatesWereLoaded = true;

        if (configs.debugMode) {
            console.log('Updated currency rates from network:');
            console.log(ratesObject);
            console.log('Saved date of last rates fetch:');
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
        if (val == null || val == undefined || val == {}) return;

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