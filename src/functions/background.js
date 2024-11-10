/// Listener to open url in new tab
chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {

        /// Open url in new tab next to current one
        if (request.type == 'selecton-open-new-tab') {
            chrome.tabs.create({
                url: request.url, active: request.focused, index: sender.tab.index + 1
            });
            return true;
        } else if (request.type == 'selecton-no-clipboard-permission-message') {
            displayNotification('Clipboard access was not granted', 'Could not paste to this field without clipboard access');
            return true;
        } else if (request.type == 'check_currencies') {
            fetchCurrencyRates(request.debugMode, request.currenciesList);
        } else if (request.type == 'background_fetch') {
            backgroundFetch(request.url, function(result){
                sendResponse(result);
            });
            return true;
        }
    }
);

/// Show notification on extension update
chrome.runtime.onInstalled.addListener(function (details) {
    if (details.reason == 'update' && !details.temporary) {
        // show notification on extension update
        let shouldShowNotification = true;
        const storageKey = 'showUpdateNotification';

        chrome.storage.local.get([storageKey], function (val) {
            if (val[storageKey] !== null && val[storageKey] !== undefined)
                shouldShowNotification = val[storageKey];

            if (shouldShowNotification) {
                // get manifest for new version number
                const manifest = chrome.runtime.getManifest();

                // show update notification and open changelog on click
                displayNotification(
                    chrome.i18n.getMessage('updateNotificationTitle', manifest.version),
                    chrome.i18n.getMessage('updateNotificationMessage'),
                    "https://github.com/emvaized/selecton-extension/blob/master/CHANGELOG.md"
                );
            }
        });
    }
});

/**
 * displays a browser notification
 * opens an URL on click if specified
 **/
function displayNotification(title, message, link, image) {
    chrome.notifications.create({
        "type": "basic",
        "iconUrl": image ?? "./assets/icons/logo-new.png",
        "title": title,
        "message": message,
    }, function (notificationId) {
        // if an URL is specified register an onclick listener
        if (link)
            chrome.notifications.onClicked.addListener(function handleNotificationClick(id) {
                if (id === notificationId) {
                    chrome.tabs.create({
                        url: link,
                        active: true
                    });
                    // remove event listener
                    chrome.notifications.onClicked.removeListener(handleNotificationClick);
                }
            });
    });
}


/// Load currencies rates in background
const urlToLoadCurrencyRates = 'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json';
const urlToLoadCryptoCurrencies = 'https://min-api.cryptocompare.com/data/price?fsym=USD';
let isUpdating = false;

async function fetchCurrencyRates(debugMode, currenciesList) {
    if (!currenciesList) return;
    if (isUpdating) return;
    if (debugMode) console.log('Selecton needs to update currency rates...');
    if (debugMode) console.log(currenciesList);
    isUpdating = true;

    let urlToFetch = urlToLoadCurrencyRates;

    let today = new Date();
    const offset = today.getTimezoneOffset()
    today = new Date(today.getTime() - (offset * 60 * 1000))
    today = today.toISOString().split('T')[0];

    const ratesObject = {};

    try {
        /// Fetch regular currencies
        const response = await fetch(urlToFetch,{
            method: "GET",
            // mode: "cors"
        })

        if (!response.ok) throw new Error(`An error has occured: ${response.status}`);
        const jsonObj = await response.json();
        const date = jsonObj['date'];

        if (!date) {
            if (debugMode) console.log('Error while fetching currency rates from network');
            return;
        }

        const val = jsonObj['usd'];
        const cryptoCurrencies = [];

        let keys = Object.keys(currenciesList);
        for (let i = 0, l = keys.length; i < l; i++) {
            let key = keys[i], lowerCaseKey = keys[i].toLowerCase();

            if (currenciesList[key]['crypto'] == true)
                cryptoCurrencies.push(key);

            try {
                if (val[lowerCaseKey] == null || val[lowerCaseKey] == undefined) continue;
                currenciesList[key]['rate'] = val[lowerCaseKey];
                ratesObject[key] = val[lowerCaseKey];
            } catch (e) {
                if (debugMode) console.log(e);
            }
        }

        if (debugMode) console.log('Fetched regular currencies successfully');

        /// Fetch crypto currencies
        urlToFetch = urlToLoadCryptoCurrencies;

        const listOfParams = cryptoCurrencies.join(',');
        urlToFetch += '&tsyms=' + listOfParams;

        if (listOfParams.length > 0)
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

                if (debugMode) console.log('Fetched crypto currencies successfully');
            } catch (e) { if (debugMode) console.log('Failed to fetch crypto currencies: ' + e.toString()); }

        /// Save rates to memory
        if (Object.keys(ratesObject).length > 0)
            chrome.storage.local.set({
                //'ratesLastFetchedDate': date,
                'ratesLastFetchedDate': today,
                'rates': ratesObject
            });

        if (debugMode) {
            console.log('Updated currency rates from network:');
            console.log(ratesObject);
            console.log('Saved date of last rates fetch:');
            console.log(date);
        }


    } catch (error) {
        if (debugMode) {
            console.log('Error while loading currencies from network:');
            console.log(error);
        }
    }

    isUpdating = false;
}

async function backgroundFetch(url, callback){
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        callback(data);
    } catch (error) {
        console.error('Fetch error:', error);
    }
}