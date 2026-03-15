
function addBasicTooltipButtons(layout) {
    // TODO: Provide option to use regular butttons instead; add text format buttons as one button 
    if (layout == 'textfield') {
        const textField = document.activeElement;
        const isContentEditable = textField.getAttribute('contenteditable') !== null;

        if (selection.toString() !== '') {

            /// Prevent showing when clicked a readonly cell in Google spreadsheet
            if (selection.toString().trim().length == 0) return;

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

                /// Add 'clear' button
                addBasicTooltipButton(clearLabel, clearIcon, function () {
                    removeSelectionOnPage();
                    textField.focus();

                    if (textField.getAttribute('contenteditable') !== null)
                        textField.innerHTML = '';
                    else {
                        textField.value = '';
                    }
                });

                if (configs.addFontFormatButtons) {

                    /// Italic button
                    let italicBtn = addBasicTooltipButton(italicLabel, italicTextIcon, function() {
                        textField.focus();
                        document.execCommand(isContentEditable ? "insertHTML" : "insertText", false, '<i>' + selectedText + '</i>');
                        hideTooltip();
                    });

                    /// Bold button
                    let boldBtn = addBasicTooltipButton(boldLabel, boldTextIcon, function() {
                        textField.focus();
                        document.execCommand(isContentEditable ? "insertHTML" : "insertText", false, '<b>' + selectedText + '</b>');
                        hideTooltip();
                    });

                    /// Strikethrough button
                    let strikeBtn = addBasicTooltipButton(strikeLabel, strikeTextIcon, function() {
                        textField.focus();
                        document.execCommand(isContentEditable ? "insertHTML" : "insertText", false, '<strike>' + selectedText + '</strike>');
                        hideTooltip();
                    });

                    // /// Create text format button
                    // const formatButton = document.createElement('button');
                    // formatButton.setAttribute('class', configs.showButtonBorders ? 'selection-popup-button button-with-border' : 'selection-popup-button');
                    // formatButton.classList.add('more-button');
                    // formatButton.innerText = 'Text format';

                    // /// Show as hover button
                    // let collapsedPanel = createHoverPanelForButton(formatButton, undefined, undefined, false, true, true, false);
                    // collapsedPanel.style.maxWidth = 'unset';
                    // collapsedPanel.style.zIndex = '2';
                    // collapsedPanel.classList.add('default-padding-tooltip');

                    // collapsedPanel.appendChild(italicBtn);
                    // collapsedPanel.appendChild(boldBtn);
                    // collapsedPanel.appendChild(strikeBtn);

                    // formatButton.appendChild(collapsedPanel);
                    // tooltip.appendChild(formatButton);
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
                    let pasteButton = addBasicTooltipButton(pasteLabel, pasteButtonIcon, function () {
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

                    if (configs.showPasteContentPreview)
                        navigator.clipboard
                            .readText()
                            .then(function(clipText) {
                                if (clipText && clipText.length > 0) {
                                    const t = clipText.length > 18 ? clipText.substring(0, 18) + '…' : clipText;
                                    const span = pasteButton.querySelector('span');
                                    if (span) {
                                        span.innerHTML += ` '<span class='color-highlight'>${t}</span>'`;
                                    } else {
                                        pasteButton.innerHTML += ` '<span class='color-highlight'>${t}</span>'`;
                                    } 

                                }
                            });

                } catch (e) { if (configs.debugMode) console.log(e); }

            /// Add 'clear' button
            if (configs.addClearButton && isTextFieldEmpty == false)
                addBasicTooltipButton(clearLabel, clearIcon, function () {
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
        // let selectedText = selection.toString();
        searchButton = addLinkTooltipButton(searchLabel, searchButtonIcon, returnSearchUrl(selectedText.trim()), true);

        /// Populate panel with custom search buttons, when enabled
        if (configs.customSearchOptionsDisplay == 'panelCustomSearchStyle') {
            if (configs.customSearchButtons)
                for (var i = 0, l = configs.customSearchButtons.length; i < l; i++) {
                    const item = configs.customSearchButtons[i];

                    const url = item['url'].replace('%s', selectedText);
                    const optionEnabled = item['enabled'];
                    const domain = url.split('/')[2];
                    const title = item['title'] ?? domain;
                    const icon = item['icon'] ?? 'https://www.google.com/s2/favicons?domain=' + domain;

                    if (optionEnabled) {
                        let b = addLinkTooltipButton(title ?? url, icon, url);
                        b.classList.add('custom-search-image-button')
                    }
                }
        }

        /// Add copy button
        /// TODO: Add option to copy plain text 
        copyButton = addBasicTooltipButton(copyLabel, copyButtonIcon, function() {
            document.execCommand('copy');
            // removeSelectionOnPage();
            // if (configs.hideTooltipOnActionButtonClick){
            //     hideDragHandles();
            //     hideTooltip();
            // }
        });
    }
}