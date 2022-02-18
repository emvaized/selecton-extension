const convertTime12to24 = (time12h) => {
    const [time, modifier] = time12h.split(' ');

    let [hours, minutes] = time.split(':');

    if (hours === '12') {
        hours = '00';
    }

    if (modifier === 'PM') {
        hours = parseInt(hours, 10) + 12;
        if (hours > 24 || hours < 0) return time12h;
    } else if (modifier !== 'AM') return time12h;

    if (isNaN(hours)) return time12h;

    return `${hours}:${minutes ?? '00'}`;
}

const convertTime24to12 = (time24h) => {

    let [hours, minutes] = time24h.split(':');

    if (hours === '00') {
        hours = '12';
    }

    let modifier = 'AM';
    hours = parseInt(hours, 10);

    if (hours > 12) {
        hours = hours - 12;
        modifier = 'PM';
    }

    if (isNaN(hours)) return time24h;

    return `${hours}:${minutes ?? '00'} ${modifier}`;
}

function splitNumberInGroups(stringNumber) {
    const parts = stringNumber.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    if (parts[1] == '00') parts[1] = ''; /// Remove empty .00 on end
    return parts[1] == '' ? parts[0] : parts.join('.');
}

function returnDomainFromUrl(url, firstLetterIsCapital = true) {
    if (url == null || url == undefined || url == '') return '';

    try {
        let domainContent = url.split('.');
        let titleText;

        if (domainContent.length == 2) {
            titleText = domainContent[0];
        } else if (domainContent.length == 3) {
            if (domainContent[1].includes('/'))
                titleText = domainContent[0];
            else
                titleText = domainContent[1];
        } else {
            titleText = url.textContent.split('/')[2].split('.')[0];
        }
        titleText = titleText.replaceAll('https://', '');

        if (titleText == null || titleText == undefined) return '';

        return firstLetterIsCapital == false ? titleText : titleText.charAt(0).toUpperCase() + titleText.slice(1);
    } catch (error) {
        return '';
    }
}


/// Math calculation of selected string (potentially unsafe)
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
    //         if (isStringNumeric(word)) {
    //             amount = extractNumber(word);
    //             if (amount !== null && amount !== undefined && amount !== '' && amount !== NaN && amount !== 0 && amount !== 0.0) break;
    //         }
    //     } catch (e) { }
    // }

    return amount;
}