function checkWholePageToHaveDarkBg() {
    let isDarkPage = false;
    let pageBgColor;

    try {
        /// Check body background
        const bodyStyle = window.getComputedStyle(document.body);
        pageBgColor = bodyStyle.backgroundColor;

        if (pageBgColor.includes('rgba(0, 0, 0, 0)') || pageBgColor == '') {
            /// Check fist div background
            const firstDivChild = document.body.querySelector('div');
            const firstDivChildStyle = window.getComputedStyle(firstDivChild);
            pageBgColor = firstDivChildStyle.backgroundColor;
            if (pageBgColor.includes('rgba(0, 0, 0, 0)') || pageBgColor == '') pageBgColor = firstDivChildStyle.background;

            if (pageBgColor.includes('rgba(0, 0, 0, 0)') || pageBgColor == '') {
                /// Check first div's first div child background
                const firstDivChildBelow = firstDivChild.querySelector('div');
                const firstDivChildBelowStyle = window.getComputedStyle(firstDivChildBelow);
                pageBgColor = firstDivChildBelowStyle.backgroundColor;
                if (pageBgColor.includes('rgba(0, 0, 0, 0)') || pageBgColor == '') pageBgColor = firstDivChildBelowStyle.background;
            }
        }

    } catch (e) { console.log(e); }

    /// False negative is preferred to false positive
    if (pageBgColor.includes('rgba(0, 0, 0, 0)') || pageBgColor == '' || pageBgColor == undefined) {
        isDarkPage = false;
        return;
    }

    if (configs.debugMode) console.log('Page background color: ' + pageBgColor);

    if (!pageBgColor.includes('(')) return isDarkPage;
    pageBgColor = pageBgColor.replace('rgb(', '').replace('rgba(', '').replace(')', '').replace(' ', '').split(',');

    let colorLuminance =
        (0.299 * pageBgColor[0] + 0.587 * pageBgColor[1] + 0.114 * pageBgColor[2]) / 255;
    if (colorLuminance <= 0.5) isDarkPage = true;

    if (configs.debugMode)
        console.log('Check page has dark background: ' + isDarkPage);

    return isDarkPage;
}

let parentsCheckedCounter = 0, maxParentsToCheck = 20;

function checkSelectionToHaveDarkBackground(node) {
    let bgColor, isDarkPage = false;
    parentsCheckedCounter = 0;

    if (configs.debugMode)
        console.log('Checking selection background color...');

    try {
        bgColor = getFirstParentWithBackgroundColor(node.parentNode);
    } catch (e) { console.log(e); }

    if (bgColor !== null && bgColor !== undefined) {
        if (!bgColor.includes('(')) return;

        if (bgColor.includes(' ')) {
            const words = bgColor.split(' ');
            bgColor = words[0] + words[1] + words[2];
        }

        if (configs.debugMode) {
            console.log('Detected background color: ');
            console.log(bgColor);
        }


        bgColor = bgColor.replace('rgb(', '').replace('rgba(', '').replace(')', '').replace(' ', '').split(',');
        let colorLuminance =
            (0.299 * bgColor[0] + 0.587 * bgColor[1] + 0.114 * bgColor[2]) / 255;

        if (colorLuminance <= 0.5) isDarkPage = true;

        if (configs.debugMode) {
            console.log('Is dark background:');
            console.log(isDarkPage);
        }
    }

    return isDarkPage;
}

function getFirstParentWithBackgroundColor(node) {
    if (node.tagName == 'HTML') return;
    // console.log('checking parent ' + parentsCheckedCounter);

    parentsCheckedCounter += 1;
    if (parentsCheckedCounter >= maxParentsToCheck) return;

    if (!node || !(node instanceof HTMLElement))
        return getFirstParentWithBackgroundColor(node.parentNode || document.body);

    const computedStyle = window.getComputedStyle(node);

    if (computedStyle.background && !computedStyle.background.includes('rgba(0, 0, 0, 0)'))
        return computedStyle.background;


    if (computedStyle.backgroundColor && !computedStyle.backgroundColor.includes('rgba(0, 0, 0, 0)'))
        return computedStyle.backgroundColor;

    return getFirstParentWithBackgroundColor(node.parentNode || document.body);
}
