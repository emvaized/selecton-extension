const convertTime12to24 = (time12h) => {
    const [time, modifier] = time12h.split(' ');

    let [hours, minutes] = time.split(':');

    if (hours === '12') {
        hours = '00';
    }

    if (modifier === 'PM') {
        hours = parseInt(hours, 10) + 12;
    }

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

function getCurrentClipboard() {
    const activeElemenet = document.activeElement;

    let clipboardContent;
    const input = document.createElement('input');
    input.setAttribute('style', 'position: fixed; top: 0px; left: 0px; opacity: 0;')
    document.body.appendChild(input);
    input.focus();
    document.execCommand('paste');
    clipboardContent = input.value;
    document.execCommand('undo');
    input.blur();
    document.body.removeChild(input);
    activeElemenet.focus();

    return clipboardContent;
}