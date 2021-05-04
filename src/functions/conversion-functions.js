/// Math calculation of selected string
function calculateString(fn) {
    return new Function('return ' + fn)();
}

function extractAmountFromSelectedText(selectedText) {
    let amount;
    let words = selectedText.split(' ');

    for (i in words) {
        let word = words[i].toString();

        try {
            amount = calculateString(word.trim().replaceAll('$', ''));
            console.log('calculated word:');
            console.log(amount);
        } catch (e) {
            console.log('failed to calculate word ' + i.toString());
            console.log(e);
        }

        if (amount == null || amount == undefined || amount == '' || amount == NaN) {
            try {
                amount = calculateString(selectedText.trim());
            } catch (e) { }
        } else break;

        if (amount == null || amount == undefined || amount == '' || amount == NaN) {
            amount = selectedText.match(/[+-]?\d+(\.\d)?/g);
        } else break;
    }

    if (amount == null || amount == undefined || amount == '' || amount == NaN) {
        /// Remove all non-number symbols (except dots)
        amount = selectedText.match(/[+-]?\d+(\.\d)?/g);
        if (amount !== null)
            amount = amount.join("");
    }

    // if (amount == null || amount == undefined || amount == '' || amount == NaN) {
    //     /// Fallback to return the same text
    //     amount = selectedText;
    // }

    return amount;
}