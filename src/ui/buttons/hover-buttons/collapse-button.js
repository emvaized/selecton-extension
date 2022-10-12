function collapseButtons() {
    const maxButtons = configs.maxTooltipButtonsToShow ?? 3;
    const buttonsCount = tooltip.children.length - 1; /// subtract the arrow

    if (buttonsCount > maxButtons) {
        /// Create button
        const moreButton = document.createElement('button');
        moreButton.setAttribute('class', configs.showButtonBorders ? 'selection-popup-button button-with-border' : 'selection-popup-button');
        moreButton.classList.add('more-button');
        moreButton.innerText = configs.verticalLayoutTooltip ? '⋯' : '⋮';

        if (configs.reverseTooltipButtonsOrder)
            tooltip.insertBefore(moreButton, tooltip.children[2]);
        else
            tooltip.appendChild(moreButton);

        /// Create panel
        const collapsedButtonsPanel = createHoverPanelForButton(moreButton, undefined, undefined, false, false, true, false);
        collapsedButtonsPanel.style.maxWidth = 'unset';
        collapsedButtonsPanel.style.zIndex = '2';
        collapsedButtonsPanel.classList.add('default-padding-tooltip');

        /// Append buttons to panel
        if (configs.reverseTooltipButtonsOrder) {
            for (let i = 1; i <= buttonsCount - maxButtons; i++) {
                if (i == 1) tooltip.children[i].classList.remove('button-with-border');
                collapsedButtonsPanel.prepend(tooltip.children[i]);
            }
        } else {
            for (let i = buttonsCount; i > maxButtons; i--) {
                const button = tooltip.children[i];
                if (!configs.verticalLayoutTooltip && i == (maxButtons * 1) + 1) button.classList.remove('button-with-border');

                // collapsedButtonsPanel.prepend(button);
                if (configs.verticalLayoutTooltip)
                    collapsedButtonsPanel.prepend(button);
                else {
                    collapsedButtonsPanel.appendChild(button);
                }
            }
        }

        moreButton.appendChild(collapsedButtonsPanel);
        setBorderRadiusForSideButtons(collapsedButtonsPanel, false);
    }
}