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

function copyManuallyToClipboard(text) {
    try {
        const input = document.createElement('input');
        input.setAttribute('style', `position: fixed; top: 0px; left: 0px; opacity: 0.0;`)
        document.body.appendChild(input);
        input.value = text;
        input.focus();
        input.select();
        document.execCommand('Copy');
        // document.body.removeChild(input);
        input.remove();
    } catch (e) {
        navigator.clipboard.writeText(text);
    }
}