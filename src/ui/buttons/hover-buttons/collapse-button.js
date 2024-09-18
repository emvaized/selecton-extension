function collapseButtons() {
    const maxButtons = configs.maxTooltipButtonsToShow ?? 3;
    const buttonsCount = tooltip.children.length - 1; /// subtract the arrow

    if (buttonsCount > maxButtons) {
       
        let collapsedButtonsPanel, moreButton;
        if (configs.collapseAsSecondPanel){
            /// Show as secondary panel
            collapsedButtonsPanel = createHoverPanelForButton(undefined, undefined, undefined, false, false, true, false, true);
            collapsedButtonsPanel.style.right = '2px';
            
            setTimeout(()=> {
                collapsedButtonsPanel.style.transform = returnTooltipRevealTransform(false, false);
                tooltip.appendChild(collapsedButtonsPanel);
            }, 2)

        } else {
            /// Create 'more' button
            moreButton = document.createElement('button');
            moreButton.setAttribute('class', configs.showButtonBorders ? 'selection-popup-button button-with-border' : 'selection-popup-button');
            moreButton.classList.add('more-button');
            moreButton.innerText = configs.verticalLayoutTooltip ? '⋯' : '⋮';

            /// Show as hover button
            if (configs.reverseTooltipButtonsOrder)
                tooltip.insertBefore(moreButton, tooltip.children[2]);
            else
                tooltip.appendChild(moreButton);
            collapsedButtonsPanel = createHoverPanelForButton(moreButton, undefined, undefined, false, true, true, false);

            /// Show buttons count
            const buttonsCountSpan = moreButton.querySelector('.selecton-hover-button-indicator');
            if (buttonsCountSpan){
                buttonsCountSpan.innerText = buttonsCount - maxButtons;
                buttonsCountSpan.classList.add('selecton-more-button-child-count')
            }
        }
        
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

        if (!configs.collapseAsSecondPanel)
            moreButton.appendChild(collapsedButtonsPanel);
        setBorderRadiusForSideButtons(collapsedButtonsPanel, false);
    }
}