let possibleMarkerColors = [
    {
        'color': 'red',
        'foreground': 'white'
    },
    {
        'color': 'lightgreen',
        'foreground': 'black'
    },
    {
        'color': 'lightblue',
        'foreground': 'black'
    },
    {
        'color': 'yellow',
        'foreground': 'black'
    },
];

function addMarkerButton() {
    /// Create button
    const markerButton = addBasicTooltipButton(markerLabel, markerIcon, function () {
        markTextSelection(undefined, undefined, selection.toString());
        saveAllMarkers();
        removeSelectionOnPage();
    });

    /// Create color chooser panel
    // const colorChooserPanel = createHorizontalHoverPanelForButton(markerButton);
    setTimeout(function () {
        let colorChooserPanel = createVerticalHoverPanelForButton(markerButton, undefined, undefined, false, true);
        colorChooserPanel.style.maxWidth = '500%';
        // colorChooserPanel.classList.add('no-padding-tooltip');
        colorChooserPanel.classList.add('default-padding-tooltip');

        /// Reverse color buttons
        if (configs.reverseTooltipButtonsOrder) possibleMarkerColors = possibleMarkerColors.reverse();

        /// Generate buttons to panel
        for (let i = 0, l = possibleMarkerColors.length; i < l; i++) {
            let selectedColor = possibleMarkerColors[i];

            const button = document.createElement('button');
            button.className = 'selection-popup-button';
            if (configs.showButtonBorders && (!configs.reverseTooltipButtonsOrder && i != 0) || (configs.reverseTooltipButtonsOrder && i != l - 1))
                button.classList.add('button-with-border');

            const colorCircle = document.createElement('div');
            colorCircle.setAttribute('class', 'selection-popup-color-preview-circle');
            colorCircle.style.background = selectedColor.color;
            button.appendChild(colorCircle);

            button.addEventListener("mousedown", function (e) {
                e.stopPropagation();
                markTextSelection(selectedColor.color, selectedColor.foreground, selection.toString());
                saveAllMarkers();
                removeSelectionOnPage();
            });

            colorChooserPanel.appendChild(button);
        }

        setBorderRadiusForSideButtons(colorChooserPanel, 0);

        /// Append panel
        markerButton.appendChild(colorChooserPanel);
    }, 5)
}