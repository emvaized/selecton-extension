function addBasicTooltipButtons(layout) {
    if (layout == 'textfield') {
        const textField = document.activeElement;
        const isContentEditable = textField.getAttribute('contenteditable') !== null;

        if (selection.toString() !== '') {
            try {
                /// Add a cut button 
                addBasicTooltipButton(cutLabel, cutButtonIcon, function () {
                    document.execCommand('cut');
                }, true);

                /// Add copy button 
                copyButton = addBasicTooltipButton(copyLabel, copyButtonIcon, function () {
                    try {
                        textField.focus();
                        document.execCommand('copy');
                        removeSelectionOnPage();
                    } catch (e) { console.log(e); }
                });

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
                    hideTooltip();
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

                setCopyButtonTitle(copyButton);

            } catch (e) { if (configs.debugMode) console.log(e) }

        } else {
            if (configs.addPasteButton)
                try {
                    /// Add paste button 
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

            /// Add 'clear' button
            if (configs.addClearButton && isTextFieldEmpty == false)
                addBasicTooltipButton(clearLabel, clearIcon, function (e) {
                    removeSelectionOnPage();
                    textField.focus();

                    if (textField.getAttribute('contenteditable') !== null)
                        textField.innerHTML = '';
                    else {
                        textField.value = '';
                    }
                });
        }

        setBorderRadiusForSideButtons(tooltip);

    } else {
        /// Add search button
        searchButton = addBasicTooltipButton(searchLabel, searchButtonIcon, function (e) {
            let selectedText = selection.toString();
            onTooltipButtonClick(e, returnSearchUrl(selectedText.trim()));
        }, true);

        /// Populate panel with custom search buttons, when enabled
        if (configs.customSearchOptionsDisplay == 'panelCustomSearchStyle') {
            if (configs.customSearchButtons !== null && configs.customSearchButtons !== undefined && configs.customSearchButtons !== [])
                for (var i = 0, l = configs.customSearchButtons.length; i < l; i++) {
                    const item = configs.customSearchButtons[i];

                    const url = item['url'];
                    const optionEnabled = item['enabled'];
                    const title = item['title'];
                    const icon = item['icon'];

                    if (optionEnabled)
                        addBasicTooltipButton(title ?? url, icon, function (e) {
                            // onTooltipButtonClick(e, url);
                            onSearchButtonClick(e, url);
                        });
                }
        }

        /// Add copy button
        copyButton = addBasicTooltipButton(copyLabel, copyButtonIcon, function () {
            document.execCommand('copy');
            removeSelectionOnPage();
        });
    }
}