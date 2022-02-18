function addBasicTooltipButtons(layout) {
    if (layout == 'textfield') {
        const textField = document.activeElement;
        const isContentEditable = textField.getAttribute('contenteditable') !== null;

        if (selection.toString() !== '') {
            try {
                /// Add a cut button 
                addBasicTooltipButton(cutLabel, cutButtonIcon, function () {
                    document.execCommand('cut');
                    // hideTooltip();
                }, true);

                /// Add copy button 
                copyButton = addBasicTooltipButton(copyLabel, copyButtonIcon, function () {
                    try {
                        textField.focus();
                        document.execCommand('copy');
                        removeSelectionOnPage();
                    } catch (e) { console.log(e); }
                });
                setCopyButtonTitle(copyButton);

                /// Add paste button 
                addBasicTooltipButton(pasteLabel, pasteButtonIcon, function () {
                    textField.focus();
                    if (isContentEditable) {
                        /// TODO: Rewrite this in order to ask for clipboardRead permission first

                        // chrome.permissions.request({
                        //     permissions: ['clipboardRead'],
                        // }, (granted) => {
                        //     if (granted) {
                        let currentClipboardContent = getCurrentClipboard();
                        if (currentClipboardContent !== null && currentClipboardContent !== undefined && currentClipboardContent != '')
                            document.execCommand("insertHTML", false, currentClipboardContent);
                        //     } else {
                        //         chrome.runtime.sendMessage({ type: 'selecton-no-clipboard-permission-message' });
                        //     }
                        // });

                    } else
                        document.execCommand('paste');

                    removeSelectionOnPage();
                });

                if (configs.addFontFormatButtons) {

                    /// Italic button
                    addBasicTooltipButton(italicLabel, italicTextIcon, function () {
                        textField.focus();
                        document.execCommand(isContentEditable ? "insertHTML" : "insertText", false, '<i>' + selectedText + '</i>');
                        hideTooltip();
                    });

                    /// Bold button
                    addBasicTooltipButton(boldLabel, boldTextIcon, function () {
                        textField.focus();
                        document.execCommand(isContentEditable ? "insertHTML" : "insertText", false, '<b>' + selectedText + '</b>');
                        hideTooltip();
                    });

                    /// Strikethrough button
                    addBasicTooltipButton(strikeLabel, strikeTextIcon, function () {
                        textField.focus();
                        document.execCommand(isContentEditable ? "insertHTML" : "insertText", false, '<strike>' + selectedText + '</strike>');
                        hideTooltip();
                    });
                }

                if (configs.collapseButtons)
                    try {
                        collapseButtons();
                    } catch (e) { if (configs.debugMode) console.log(e); }

            } catch (e) { if (configs.debugMode) console.log(e) }

            setTimeout(function () {
                setBorderRadiusForSideButtons(tooltip);
            }, 0)
        } else {
            if (configs.addPasteButton)
                try {
                    /// Add only paste button 
                    addBasicTooltipButton(pasteLabel, pasteButtonIcon, function (e) {
                        textField.focus();

                        if (textField.getAttribute('contenteditable') !== null) {
                            let currentClipboardContent = getCurrentClipboard();

                            if (currentClipboardContent !== null && currentClipboardContent !== undefined && currentClipboardContent != '')
                                document.execCommand("insertHTML", false, currentClipboardContent);
                        } else
                            document.execCommand('paste');

                        removeSelectionOnPage();
                        // hideTooltip();
                    }, true);
                } catch (e) { if (configs.debugMode) console.log(e); }
        }

    } else {
        /// Add search button
        searchButton = addBasicTooltipButton(searchLabel, searchButtonIcon, function (e) {
            let selectedText = selection.toString();
            onTooltipButtonClick(e, returnSearchUrl(selectedText.trim()));
        }, true);

        /// Add copy button 
        copyButton = addBasicTooltipButton(copyLabel, copyButtonIcon, function () {
            document.execCommand('copy');
            removeSelectionOnPage();
        });
    }
}