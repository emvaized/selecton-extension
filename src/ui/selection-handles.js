function setDragHandles() {
    /// Dont add drag handles if they are already added
    var existingDragHandles = document.querySelectorAll(`[class*='selection-tooltip-draghandle'`);
    if (existingDragHandles !== null && existingDragHandles !== undefined && existingDragHandles.length > 0) return;

    addDragHandle(0);
    addDragHandle(1);
}

/// 0 for first (left) drag handle, 1 for second (right)
function addDragHandle(dragHandleIndex) {
    if (configs.debugMode)
        console.log('Adding drag handle ' + dragHandleIndex.toString() + '...');

    if (selection == null || selection == undefined) return;

    var lineHeight = 25;
    var lineWidth = 2.5;
    var circleHeight = 15;
    var verticalOffsetCorrection = -1.5;

    /// Try to adapt handle height to selected text's line-height
    try {
        const selectedTextLineHeight = window.getComputedStyle(selection.anchorNode.parentElement, null).getPropertyValue('line-height');

        if (configs.debugMode) {
            console.log('Selected text line height: ' + selectedTextLineHeight.toString());
        }

        if (selectedTextLineHeight !== null && selectedTextLineHeight !== undefined && selectedTextLineHeight.includes('px')) {
            lineHeight = parseInt(selectedTextLineHeight.replaceAll('px', '')) + 5;
        }

    } catch (e) {
        if (configs.debugMode)
            console.log('Selecton failed to compute font size of selected text');
    }

    try {
        var currentWindowSelection;
        var selStartDimensions = getSelectionCoordinates(true);
        var selEndDimensions = getSelectionCoordinates(false);

        if (selStartDimensions == null || selEndDimensions == null) { hideDragHandles(); return; }

        var dragHandle = document.createElement('div');
        dragHandle.setAttribute('class', 'selection-tooltip-draghandle');
        dragHandle.setAttribute('style', ` transform: translate(${dragHandleIndex == 0 ? selStartDimensions.dx - 2.5 : selEndDimensions.dx}px, ${(dragHandleIndex == 0 ? selStartDimensions.dy : selEndDimensions.dy) + window.scrollY + verticalOffsetCorrection}px);transition: opacity ${configs.animationDuration}ms ease-in-out; position: absolute; z-index: 10000; left: 0px; top: 0px;height: ${lineHeight}px; width: ${lineWidth}px; opacity:0; background: ${configs.useCustomStyle ? configs.tooltipBackground : defaultBackgroundColor};`);
        document.body.appendChild(dragHandle);

        var circleDiv = document.createElement('div');
        circleDiv.setAttribute('class', 'selection-tooltip-draghandle-circle');
        // circleDiv.setAttribute('style', `border-radius: 50%;background: ${configs.tooltipBackground}; height: ${circleHeight}px; width: ${circleHeight}px; position: relative; bottom: -${lineHeight - 1}px; left: -6.5px;`);
        circleDiv.setAttribute('style', `transition: opacity ${configs.animationDuration}ms ease-in-out;border-radius: 50%;background: ${configs.useCustomStyle ? configs.tooltipBackground : defaultBackgroundColor}; height: ${circleHeight}px; width: ${circleHeight}px; position: relative; bottom: -${lineHeight - 1}px; left: -${(circleHeight / 2) - (lineWidth / 2)}px;`);
        dragHandle.appendChild(circleDiv);
        circleDiv.style.cursor = 'grab';
        setTimeout(function () {
            dragHandle.style.opacity = configs.useCustomStyle ? configs.tooltipOpacity : 1.0;
        }, 1);

        if (configs.useCustomStyle && configs.tooltipOpacity !== 1.0 && configs.tooltipOpacity !== 1) {
            dragHandle.onmouseover = function (event) {
                setTimeout(function () {
                    if (dontShowTooltip == true) return;
                    try {
                        dragHandle.style.opacity = 1.0;
                    } catch (e) { }
                }, 1);
            }
            dragHandle.onmouseout = function () {
                setTimeout(function () {
                    if (dontShowTooltip == true) return;
                    try {
                        dragHandle.style.opacity = configs.tooltipOpacity;
                    } catch (e) { }
                }, 1);
            }
        }

        circleDiv.onmousedown = function (e) {
            hideTooltip();
            isDraggingTooltip = true;
            e.preventDefault();

            if (window.getSelection) {
                currentWindowSelection = window.getSelection().toString();
            } else if (document.selection) {
                currentWindowSelection = document.selection.createRange().toString();
            }

            selStartDimensions = getSelectionCoordinates(true);
            selEndDimensions = getSelectionCoordinates(false);

            if (selStartDimensions == null || selEndDimensions == null) { hideDragHandles(); return; }

            document.body.style.cursor = 'grabbing';
            circleDiv.style.cursor = 'grabbing';

            document.onmousemove = function (e) {
                try {
                    e.preventDefault();

                    /// Dynamically adapt handler height to last selected word
                    // var lastWordLineHeight = window.getComputedStyle(dragHandleIndex == 0 ? selection.anchorNode.parentElement : selection.focusNode.parentElement, null).getPropertyValue('line-height');
                    // lastWordLineHeight = parseInt(lastWordLineHeight.replaceAll('px', '')) + 5;
                    // lineHeight = lastWordLineHeight;
                    // dragHandle.style.height = `${lastWordLineHeight}px`;
                    // circleDiv.style.bottom = `${-lastWordLineHeight - 1}px;`;

                    /// Change cursor shape
                    document.body.style.cursor = 'grabbing';
                    circleDiv.style.cursor = 'grabbing';

                    /// Calculate deltas
                    var deltaXFromInitial = dragHandleIndex == 0 ? (selStartDimensions.dx - e.clientX) : (selEndDimensions.dx - e.clientX);
                    var deltaYFromInitial = dragHandleIndex == 0 ? (selStartDimensions.dy - e.clientY) : (e.clientY - selEndDimensions.dy);

                    /// Move drag handle
                    dragHandle.style.transition = '';
                    if (dragHandleIndex == 0) {
                        dragHandle.style.transform = `translate(${e.clientX}px, ${selStartDimensions.dy + window.scrollY - lineHeight - deltaYFromInitial + verticalOffsetCorrection}px)`;
                    } else {
                        dragHandle.style.transform = `translate(${e.clientX}px, ${selEndDimensions.dy + window.scrollY - lineHeight + deltaYFromInitial + verticalOffsetCorrection}px)`;
                    }

                    /// Create selection from rect
                    if (currentWindowSelection !== null && currentWindowSelection !== undefined && currentWindowSelection !== '') {

                        try {
                            if (configs.debugMode)
                                console.log(`Creating selection range at: anchorX ${selStartDimensions.dx - deltaXFromInitial - 0.05}, anchorY ${selEndDimensions.dy + deltaYFromInitial}, focusX ${selStartDimensions.dx - 4}, focusY ${selStartDimensions.dy}`);

                            if (dragHandleIndex == 0) {
                                /// Left handle
                                createSelectionFromPoint(
                                    // selEndDimensions.dx + 4, /// DX end of selection (anchorX)
                                    selEndDimensions.dx - 2, /// DX end of selection (anchorX)
                                    selEndDimensions.dy + 4, /// DY end of selection (anchorY)
                                    selStartDimensions.dx - deltaXFromInitial - 0.05, /// DX beginning of selection (focusX)
                                    selStartDimensions.dy - deltaYFromInitial - lineHeight, /// DY beginning of selection (focusY)
                                );
                            } else {
                                /// Right handle
                                createSelectionFromPoint(
                                    selStartDimensions.dx + 4, /// DX beginning of selection (focusX)
                                    selStartDimensions.dy,  /// DY beginning of selection (focusY)
                                    selEndDimensions.dx - deltaXFromInitial - 0.05, /// DX end of selection (anchorX)
                                    selEndDimensions.dy + deltaYFromInitial - lineHeight,  /// DY end of selection (anchorY)
                                );
                            }

                        } catch (e) {
                            if (configs.debugMode) {
                                console.log('Error while creating selection range:');
                                console.log(e);
                            }
                        }

                    }
                } catch (e) {
                    if (configs.debugMode) {
                        console.log('Error while moving the right drag handle:');
                        console.log(e);
                    }
                }
            };

            document.onmouseup = function (e) {
                e.preventDefault();
                document.onmousemove = null;
                document.onmouseup = null;
                isDraggingTooltip = false;
                document.body.style.cursor = 'unset';
                circleDiv.style.cursor = 'grab';

                /// If selection not changed (single click on handle), increase selection by one word
                setTimeout(function () {
                    var windowSelection;
                    if (window.getSelection) {
                        windowSelection = window.getSelection();
                    } else if (document.selection) {
                        windowSelection = document.selection.createRange();
                    }

                    /// Single click to expand selection by one word
                    if (windowSelection.toString() == currentWindowSelection.toString()) {
                        if (configs.debugMode)
                            console.log('Single click on drag handle');

                        extendSelectionByWord(windowSelection, dragHandleIndex)

                    } else {
                    }

                    createTooltip(e);


                    setTimeout(function () {
                        var selStartDimensions = getSelectionCoordinates(true);
                        var selEndDimensions = getSelectionCoordinates(false);

                        if (selStartDimensions == null || selEndDimensions == null) { hideDragHandles(); return; }

                        /// Animate drag handle to the new place
                        dragHandle.style.transition = `transform 200ms ease-in-out, opacity ${configs.animationDuration}ms ease-in-out`;

                        if (dragHandleIndex == 0) {
                            /// Left handle
                            dragHandle.style.transform = `translate(${selStartDimensions.dx - 1}px, ${selStartDimensions.dy + window.scrollY + verticalOffsetCorrection}px)`;
                        } else {
                            /// Right handle
                            dragHandle.style.transform = `translate(${selEndDimensions.dx}px, ${selEndDimensions.dy + window.scrollY + verticalOffsetCorrection}px)`;
                        }

                        setTimeout(function () {
                            dragHandle.style.transition = `opacity ${configs.animationDuration}ms ease-in-out`;
                        }, 200);
                    }, 2);


                    // createTooltip(e);
                }, 1);


                if (configs.debugMode)
                    console.log('Changing selection finished');
            };
        }

        if (configs.debugMode) {
            console.log('Successfully added drag handle ' + dragHandleIndex.toString());
        }
    } catch (e) {
        if (configs.debugMode) {
            console.log('Failed to configure drag handle ' + dragHandleIndex.toString() + '. Error is: ' + e.toString());
        }
    }
}

function hideDragHandles() {
    /// Remove all drag handles
    if (configs.addDragHandles) {
        var dragHandles = document.querySelectorAll(`[class*='selection-tooltip-draghandle']`);
        dragHandles.forEach(function (dragHandle) {
            dragHandle.style.opacity = 0.0;
            setTimeout(function () {
                if (dragHandle.parentNode !== null)
                    dragHandle.parentNode.removeChild(dragHandle);
            }, configs.animationDuration);
        });
    }
}