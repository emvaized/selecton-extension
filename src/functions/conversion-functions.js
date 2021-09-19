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
    let words = selectedText.split(' ');

    for (i in words) {
        let word = words[i].replaceAll('$', '');

        try {
            //amount = extractNumber(word.replaceAll('$', ''));
            if (isStringNumeric(word)) {
                amount = extractNumber(word);
                if (amount !== null && amount !== undefined && amount !== '' && amount !== NaN && amount !== 0 && amount !== 0.0) {
                    break;
                }
            }
        } catch (e) { }
    }

    // if (amount == null || amount == undefined || amount == '' || amount == NaN) {
    //     try {
    //         amount = extractNumber(selectedText.trim());
    //     } catch (e) { }
    // } else {
    //     /// Remove all non-number symbols (except dots)
    //     amount = selectedText.match(/[+-]?\d+(\.\d)?/g);
    //     if (amount !== null)
    //         amount = amount.join("");
    // }

    return amount;
}