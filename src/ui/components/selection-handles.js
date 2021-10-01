function setDragHandles(tooltipOnBottom) {
    /// Hide existing drag handles
    //hideDragHandles();

    /// Dont add drag handles if they are already added
    let existingDragHandles = document.querySelectorAll('.selection-tooltip-draghandle');
    if (existingDragHandles !== null && existingDragHandles !== undefined && existingDragHandles.length > 0) return;

    addDragHandle(0);
    addDragHandle(1);
}

/// 0 for first (left) drag handle, 1 for second (right)
function addDragHandle(dragHandleIndex) {
    if (configs.debugMode)
        console.log('Adding drag handle ' + dragHandleIndex.toString() + '...');

    if (selection == null || selection == undefined) return;

    var lineWidth = 2.25;
    var circleHeight = 12.5;
    var verticalOffsetCorrection = -1.5;

    /// Try to adapt handle height to selected text's line-height
    try {
        const selectedTextLineHeight = window.getComputedStyle(selection.anchorNode.parentElement, null).getPropertyValue('line-height');

        if (selectedTextLineHeight !== null && selectedTextLineHeight !== undefined && selectedTextLineHeight.includes('px')) {
            selectionHandleLineHeight = parseInt(selectedTextLineHeight.replaceAll('px', '')) + 5;
        }

    } catch (e) {
        if (configs.debugMode)
            console.log('Selecton failed to compute font size of selected text');
    }

    try {
        var currentWindowSelection;
        var selStartDimensions = getSelectionCoordinates(true);
        var selEndDimensions = getSelectionCoordinates(false);

        /// When returned dimensions are 0;0, place the handle where it was left by user
        if (selEndDimensions.dx == 0 && selEndDimensions.dy == 0) selEndDimensions = { dx: lastMouseUpEvent.clientX, dy: lastMouseUpEvent.clientY - (selectionHandleLineHeight / 2) - circleHeight };
        if (selStartDimensions.dx == 0 && selStartDimensions.dy == 0) selStartDimensions = { dx: lastMouseUpEvent.clientX, dy: lastMouseUpEvent.clientY - (selectionHandleLineHeight / 2) - circleHeight };

        if (selStartDimensions == null || selEndDimensions == null) { return; }

        let dragHandleIsReverted = dragHandleIndex == 1 && tooltipOnBottom;

        let dragHandle = document.createElement('div');
        dragHandle.className = 'selection-tooltip-draghandle';
        dragHandle.style.transform = `translate(${dragHandleIndex == 0 ? selStartDimensions.dx - 2.5 : selEndDimensions.dx}px, ${(dragHandleIndex == 0 ? selStartDimensions.dy : selEndDimensions.dy) + verticalOffsetCorrection}px)`;
        dragHandle.style.transition = `opacity ${configs.animationDuration}ms ease-out`;
        dragHandle.style.height = `${selectionHandleLineHeight}px`;
        dragHandle.style.width = `${lineWidth}px`;

        let circleDiv = document.createElement('div');
        circleDiv.className = 'selection-tooltip-draghandle-circle';
        circleDiv.style.cursor = 'grab';
        circleDiv.style.transition = `opacity ${configs.animationDuration}ms ease-out`;
        circleDiv.style.right = `${(circleHeight / 2) - (lineWidth / 2)}px`;

        if (dragHandleIsReverted)
            circleDiv.style.top = `-${circleHeight - 1}px`;
        else circleDiv.style.bottom = `-${selectionHandleLineHeight - 1}px`;

        dragHandle.appendChild(circleDiv);

        setTimeout(function () {
            dragHandle.style.opacity = configs.useCustomStyle ? configs.tooltipOpacity : 1.0;
        }, 1);

        if (configs.useCustomStyle && configs.tooltipOpacity != 1.0 && configs.tooltipOpacity != 1) {
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
            isDraggingDragHandle = true;
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
            dragHandle.style.transition = '';

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
                    // document.body.style.cursor = 'grabbing';
                    // circleDiv.style.cursor = 'grabbing';

                    /// Calculate deltas
                    const deltaXFromInitial = dragHandleIndex == 0 ? (selStartDimensions.dx - e.clientX) : (selEndDimensions.dx - e.clientX);
                    const deltaYFromInitial = dragHandleIndex == 0 ? (selStartDimensions.dy - e.clientY) : (e.clientY - selEndDimensions.dy);

                    /// Move drag handle
                    if (dragHandleIndex == 0) {
                        dragHandle.style.transform = `translate(${e.clientX}px, ${selStartDimensions.dy - selectionHandleLineHeight - deltaYFromInitial + verticalOffsetCorrection}px)`;
                    } else {
                        dragHandle.style.transform = `translate(${e.clientX}px, ${selEndDimensions.dy - (dragHandleIsReverted ? - (circleHeight / 2) : selectionHandleLineHeight) + deltaYFromInitial + verticalOffsetCorrection}px)`;
                    }

                    /// Create selection from rect
                    if (currentWindowSelection !== null && currentWindowSelection !== undefined && currentWindowSelection !== '') {
                        try {
                            if (configs.debugMode)
                                console.log(`Creating selection range at: anchorX ${selStartDimensions.dx - deltaXFromInitial - 0.05}, anchorY ${selEndDimensions.dy + deltaYFromInitial}, focusX ${selStartDimensions.dx - 4}, focusY ${selStartDimensions.dy}`);

                            if (dragHandleIndex == 0) {
                                /// Left handle
                                createSelectionFromPoint(
                                    selEndDimensions.dx - 2, /// DX end of selection (anchorX) - needs to be < than selEndDimensions.dx to work
                                    selEndDimensions.dy + (selectionHandleLineHeight / 2), /// DY end of selection (anchorY)
                                    selStartDimensions.dx - deltaXFromInitial - 0.05, /// DX beginning of selection (focusX)
                                    selStartDimensions.dy - deltaYFromInitial - (selectionHandleLineHeight), /// DY beginning of selection (focusY)
                                );
                            } else {
                                /// Right handle
                                createSelectionFromPoint(
                                    selStartDimensions.dx + 3, /// DX beginning of selection (focusX) - needs to be > than selStartDimensions.dx to work
                                    selStartDimensions.dy,  /// DY beginning of selection (focusY)
                                    selEndDimensions.dx - deltaXFromInitial - 0.05, /// DX end of selection (anchorX)
                                    selEndDimensions.dy + deltaYFromInitial - (dragHandleIsReverted ? - (selectionHandleLineHeight / 2) : selectionHandleLineHeight / 2),  /// DY end of selection (anchorY)
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
                // isDraggingDragHandle = false;
                document.body.style.cursor = 'unset';
                circleDiv.style.cursor = 'grab';

                /// If selection not changed (single click on handle), increase selection by one word
                setTimeout(function () {
                    let windowSelection = window.getSelection();

                    /// Single click to expand selection by one word
                    if (windowSelection.toString() == currentWindowSelection.toString()) {
                        if (configs.debugMode)
                            console.log('Single click on drag handle');

                        extendSelectionByWord(windowSelection, dragHandleIndex)
                    }

                    /// old fix - left it here in case needed in future
                    // if (configs.applyConfigsImmediately == false)
                    //     createTooltip(e);

                    setTimeout(function () {
                        isDraggingDragHandle = false;

                        let selStartDimensions = getSelectionCoordinates(true);
                        let selEndDimensions = getSelectionCoordinates(false);

                        if (selStartDimensions == null || selEndDimensions == null) { hideDragHandles(); return; }
                        if (selEndDimensions.dx == 0 && selEndDimensions.dy == 0) selEndDimensions = { dx: lastMouseUpEvent.clientX, dy: lastMouseUpEvent.clientY - (selectionHandleLineHeight / 2) - circleHeight };
                        if (selStartDimensions.dx == 0 && selStartDimensions.dy == 0) selStartDimensions = { dx: lastMouseUpEvent.clientX, dy: lastMouseUpEvent.clientY - (selectionHandleLineHeight / 2) - circleHeight };

                        /// Animate drag handle to the new place
                        dragHandle.style.transition = `transform 200ms ease-in-out, opacity ${configs.animationDuration}ms ease-in-out`;

                        if (dragHandleIndex == 0) {
                            /// Left handle
                            dragHandle.style.transform = `translate(${selStartDimensions.dx - 1}px, ${selStartDimensions.dy + verticalOffsetCorrection}px)`;
                        } else {
                            /// Right handle
                            dragHandle.style.transform = `translate(${selEndDimensions.dx}px, ${selEndDimensions.dy + verticalOffsetCorrection}px)`;
                        }

                        /// Vertically revert the drag handle if tooltip is located on bottom
                        if (configs.tooltipPosition == 'overCursor') {
                            if (selStartDimensions.dy < selEndDimensions.dy && selEndDimensions.backwards !== true) {
                                circleDiv.style.bottom = "unset";
                                circleDiv.style.top = `-${circleHeight - 1}px`;
                            } else {
                                circleDiv.style.bottom = `-${selectionHandleLineHeight - 1}px`;
                                circleDiv.style.top = "unset";
                            }
                        }

                        setTimeout(function () {
                            dragHandle.style.transition = `opacity ${configs.animationDuration}ms ease-in-out`;
                        }, 200);
                    }, 2);

                }, 1);


                if (configs.debugMode)
                    console.log('Changing selection finished');
            };
        }

        //dragHandles.push(dragHandle);
        document.body.appendChild(dragHandle);

        if (configs.debugMode) {
            console.log('Successfully added drag handle ' + dragHandleIndex.toString());
        }
    } catch (e) {
        if (configs.debugMode) {
            console.log('Failed to configure drag handle ' + dragHandleIndex.toString() + '. Error is: ' + e.toString());
        }
    }
}

function hideDragHandles(animated = true) {
    /// Remove all drag handles
    if (configs.addDragHandles) {
        let dragHandles = document.querySelectorAll('.selection-tooltip-draghandle');

        for (let i = 0, l = dragHandles.length; i < l; i++) {
            let dragHandle = dragHandles[i];

            if (!animated)
                dragHandle.style.transition = '';
            dragHandle.style.opacity = 0.0;

            setTimeout(function () {
                dragHandle.remove();
                //dragHandles.splice(i, 1);
            }, animated ? configs.animationDuration : 0);
        }
    }
}