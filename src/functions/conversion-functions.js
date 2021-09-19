/// Math calculation of selected string
function calculateString(fn) {
    return new Function('return ' + fn)();
}

function extractNumber(str) {
    return parseFloat(str.replace(/[^\d\.]*/g, ''));
}

function isStringNumeric(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}

function extractAmountFromSelectedText(selectedText) {
    let amount;

    try {
        let extracted = extractNumber(selectedText);
        if (extracted !== null && extracted !== undefined && extracted !== '' && !isNaN(extracted) && extracted !== 0 && extracted !== 0.0)
            amount = extracted;
    } catch (e) { }

    // let words = selectedText.split(' ');

    // for (i in words) {
    //     let word = words[i].replaceAll('$', '');

    //     try {
    //         //amount = extractNumber(word.replaceAll('$', ''));
    //         if (isStringNumeric(word)) {
    //             amount = extractNumber(word);
    //             if (amount !== null && amount !== undefined && amount !== '' && amount !== NaN && amount !== 0 && amount !== 0.0) break;
    //         }
    //     } catch (e) { }
    // }


    return amount;
}