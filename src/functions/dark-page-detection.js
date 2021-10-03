function checkPageToHaveDarkBg() {
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