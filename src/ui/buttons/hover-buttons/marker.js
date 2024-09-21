let possibleMarkerColors = [
    {
        'color': 'yellow',
        'foreground': 'black'
    },
    {
        'color': 'lightblue',
        'foreground': 'black'
    },
    {
        'color': 'lightgreen',
        'foreground': 'black'
    },
    {
        'color': 'red',
        'foreground': 'white'
    },
];

function addMarkerButton() {
    /// Create button
    const markerButton = addBasicTooltipButton(markerLabel, markerIcon, function () {
        markTextSelection(undefined, undefined, selection.toString());
        saveAllMarkers();
        removeSelectionOnPage();
    });
    markerButton.classList.add('higher-z-index');

    /// Create color chooser panel
    setTimeout(function () {
        let colorChooserPanel = createHoverPanelForButton(markerButton, undefined, undefined, false, true, false, false);
        colorChooserPanel.style.maxWidth = '500%';
        colorChooserPanel.classList.add('default-padding-tooltip');

        /// Generate buttons to panel
        for (let i = 0, l = possibleMarkerColors.length; i < l; i++) {
            let selectedColor = possibleMarkerColors[i];

            const button = document.createElement('button');
            button.className = 'selection-popup-button';
            if (configs.showButtonBorders)
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

            colorChooserPanel.prepend(button);
        }

        setBorderRadiusForSideButtons(colorChooserPanel, false);

        /// Append panel
        markerButton.appendChild(colorChooserPanel);
    }, 5)
}