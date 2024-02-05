// URLs and requests moved to background.js

function fetchCurrencyRates() {
    chrome.runtime.sendMessage({ type: 'check_currencies', currenciesList: currenciesList, debugMode: configs.debugMode });
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