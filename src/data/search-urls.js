function returnSearchUrl(query, shouldEncode = true) {
    let encodedQuery = query;
    if (shouldEncode)
        encodedQuery = encodeURI(query);

    encodedQuery = encodedQuery.replaceAll('&', '%26').replaceAll('+', '%2B');

    switch (configs.preferredSearchEngine) {
        case 'google': return `https://www.google.com/search?q=${encodedQuery}`; break;
        case 'duckduckgo': return `https://duckduckgo.com/?q=${encodedQuery}`; break;
        case 'bing': return `https://www.bing.com/search?q=${encodedQuery}`; break;
        case 'yandex': return `https://yandex.ru/search/?text=${encodedQuery}`; break;
        case 'baidu': return `http://www.baidu.com/s?wd=${encodedQuery}`; break;
        case 'yahoo': return `https://search.yahoo.com/search?p=${encodedQuery}`; break;
        case 'custom': return configs.customSearchUrl.replaceAll('%s', encodedQuery); break;
    }
}

function returnNewEmailUrl(query, shouldEncode = true) {
    let encodedQuery = query;

    if (shouldEncode)
        encodedQuery = encodeURI(query);

    encodedQuery = encodedQuery.replaceAll('&', '%26').replaceAll('+', '%2B');

    switch (configs.preferredNewEmailMethod) {
        case 'mailto': return `mailto:${query}`; break;
        case 'gmail': return `https://mail.google.com/mail/?view=cm&fs=1&to=${encodedQuery}`; break;
        case 'yahoo': return `https://compose.mail.yahoo.com/?to=${encodedQuery}`; break;
        case 'outlook': return `https://outlook.com/?path=/mail/action/compose&to=${encodedQuery}`; break;
    }
}

function returnShowOnMapUrl(query, shouldEncode = true) {
    let encodedQuery = query;

    if (shouldEncode)
        encodedQuery = encodeURI(query);

    encodedQuery = encodedQuery.replaceAll('&', '%26').replaceAll('+', '%2B');

    switch (configs.preferredMapsService) {
        case 'google': return `https://www.google.com/maps/place/${encodedQuery}`; break;
        case '2gis': return `https://2gis.ua/search/${encodedQuery}`; break;
        case '2gisRU': return `https://2gis.ru/search/${encodedQuery}`; break;
        case '2gisUA': return `https://2gis.ua/search/${encodedQuery}`; break;
        case 'yandexmaps': return `https://yandex.ru/maps/geo/${encodedQuery}`; break;
        case 'waze': return `https://www.waze.com/ru/live-map?q=${encodedQuery}`; break;
        case 'mapquest': return `https://www.mapquest.com/search/results?query=${encodedQuery}`; break;
    }
}

function returnTranslateUrl(query, languageToTranslateTo) {
    let textToPass = encodeURI(query.trim());

    switch (configs.preferredTranslateService) {
        case 'google': return `https://translate.google.com/?sl=auto&tl=${languageToTranslateTo ?? configs.languageToTranslate}&text=${textToPass}`; break;
        case 'yandex': return `https://translate.yandex.ru/?lang=auto-${languageToTranslateTo ?? configs.languageToTranslate}&text=${textToPass}`; break;
        case 'bing': return `https://www.bing.com/translator?from=auto&to=${languageToTranslateTo ?? configs.languageToTranslate}&text=${textToPass}`; break;
        case 'deepl': return `https://www.deepl.com/translator#auto/${languageToTranslateTo ?? configs.languageToTranslate}/${textToPass}`; break;
    }
}