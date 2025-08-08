function setDragHandles(selStartDimensions, selEndDimensions) {
    /// Hide existing drag handles
    //hideDragHandles();

    /// Dont add drag handles if they are already added
    // let existingDragHandle = document.querySelector('.selecton-tooltip-draghandle');
    // if (existingDragHandle !== null && existingDragHandle !== undefined) return;

    let existingDragHandle = document.getElementById('selecton-draghandle-0');
    if (existingDragHandle == null || existingDragHandle == undefined)
        addDragHandle(0, selStartDimensions, selEndDimensions);

    existingDragHandle = document.getElementById('selecton-draghandle-1');
    if (existingDragHandle == null || existingDragHandle == undefined)
        addDragHandle(1, selStartDimensions, selEndDimensions);
}

/// Cache basic components of drag handles
let handleLine, handleCircle;

/// 0 for first (left) drag handle, 1 for second (right)
function addDragHandle(dragHandleIndex, selStartDimensions, selEndDimensions) {
    if (configs.debugMode)
        console.log('Adding drag handle ' + dragHandleIndex.toString() + '...');

    if (selection == null || selection == undefined) return;

    const lineWidth = 2.25, circleHeight = 10, verticalOffsetCorrection = -1;

    /// Try to adapt handle height to selected text's line-height
    try {
        selectionHandleLineHeight = (dragHandleIndex == 0 ? selStartDimensions.lineHeight : selEndDimensions.lineHeight) + 3;

        if (!selectionHandleLineHeight) {
            const selectedTextLineHeight = window.getComputedStyle(selection.anchorNode.parentElement, null).getPropertyValue('line-height');
            if (selectedTextLineHeight !== null && selectedTextLineHeight !== undefined && selectedTextLineHeight.includes('px'))
                selectionHandleLineHeight = parseInt(selectedTextLineHeight.replaceAll('px', '')) + 3;
        }

    } catch (e) {
        if (configs.debugMode)
            console.log('Selecton failed to compute font size of selected text');
    }

    try {
        var currentWindowSelection;

        /// When returned dimensions are 0;0, place the handle where it was left by user
        if (selEndDimensions.dx == 0 && selEndDimensions.dy == 0) selEndDimensions = { dx: lastMouseUpEvent.clientX, dy: lastMouseUpEvent.clientY - (selectionHandleLineHeight / 2) - circleHeight };
        if (selStartDimensions.dx == 0 && selStartDimensions.dy == 0) selStartDimensions = { dx: lastMouseUpEvent.clientX, dy: lastMouseUpEvent.clientY - (selectionHandleLineHeight / 2) - circleHeight };

        if (selStartDimensions == null || selEndDimensions == null) { return; }

        /// When tooltip is on bottom, revert drag handle by placing circleDiv on top of handle (to avoid overlaps)
        let dragHandleIsReverted = tooltipOnBottom;

        let dragHandle = document.createElement('div');
        dragHandle.className = 'selecton-tooltip-draghandle';
        dragHandle.id = `selecton-draghandle-${dragHandleIndex}`;
        dragHandle.style.transform = `translate(${dragHandleIndex == 0 ? selStartDimensions.dx - 2.5 : selEndDimensions.dx}px, ${(dragHandleIndex == 0 ? selStartDimensions.dy : selEndDimensions.dy) + verticalOffsetCorrection}px)`;
        dragHandle.style.transition = `opacity ${configs.animationDuration}ms ease-out`;

        let line;
        if (!handleLine){
            line = document.createElement('div');
            line.className = 'selecton-tooltip-draghandle-line';
            line.style.width = `${lineWidth}px`;
            handleLine = line.cloneNode(false);
        } else {
            line = handleLine.cloneNode(false);
        }
        line.style.height = `${selectionHandleLineHeight}px`;
        dragHandle.appendChild(line);

        let circleDiv;
        if (!handleCircle){
            circleDiv = document.createElement('div');
            circleDiv.className = 'selecton-tooltip-draghandle-circle';
            circleDiv.style.cursor = 'grab';
            circleDiv.style.transition = `opacity ${configs.animationDuration}ms ease-out, top 200ms ease, bottom 200ms ease`;
            handleCircle = circleDiv.cloneNode(false);
        } else {
            circleDiv = handleCircle.cloneNode(false);
        }
        
        // circleDiv.style.right = `${(circleHeight / 2) - (lineWidth / 2)}px`;

        if (dragHandleIsReverted)
            circleDiv.style.top = `-${circleHeight - 1}px`;
        else circleDiv.style.bottom = `-${selectionHandleLineHeight - 1}px`;

        /// Set the handle style
        if (configs.dragHandleStyle == 'triangle') {
            circleDiv.classList.add('draghandle-triangle');

            if (dragHandleIndex == 0) {
                circleDiv.style.clipPath = 'polygon(0% 0%, 100% 100%, 0% 100%)';
                circleDiv.style.right = `${-lineWidth}px`;
            } else
                circleDiv.style.clipPath = 'polygon(0% 0%, 100% 100%, 100% 0%)';
        } else if (configs.dragHandleStyle == 'square') {
            circleDiv.classList.add('draghandle-square');
            circleDiv.style.right = `${(circleHeight / 2) - (lineWidth / 2)}px`;
        } else if (configs.dragHandleStyle == 'rhombus') {
            circleDiv.classList.add('draghandle-rhombus');
            circleDiv.style.right = `${(circleHeight / 2) - (lineWidth / 2)}px`;
        } else {
            circleDiv.style.right = `${(circleHeight / 2) - (lineWidth / 2)}px`;
        }

        dragHandle.appendChild(circleDiv);

        setTimeout(function () {
            dragHandle.style.opacity = configs.useCustomStyle ? configs.tooltipOpacity : 1.0;
        }, 1);

        if (configs.useCustomStyle && configs.tooltipOpacity != 1.0 && configs.tooltipOpacity != 1 && configs.fullOpacityOnHover) {
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
            draggingHandleIndex = dragHandleIndex;
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

            let edgeScrollInterval = null;

            document.onmousemove = function (e) {
                try {
                    e.preventDefault();

                    /// Dynamically adapt handler height to last selected word
                    // var lastWordLineHeight = window.getComputedStyle(dragHandleIndex == 0 ? selection.anchorNode.parentElement : selection.focusNode.parentElement, null).getPropertyValue('line-height');
                    // lastWordLineHeight = parseInt(lastWordLineHeight.replaceAll('px', '')) + 5;
                    // lineHeight = lastWordLineHeight;
                    // dragHandle.style.height = `${lastWordLineHeight}px`;
                    // circleDiv.style.bottom = `${-lastWordLineHeight - 1}px;`;

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
                            if (dragHandleIndex == 0) {
                                /// Left handle
                                createSelectionFromPoint(
                                    selEndDimensions.dx - 2, /// DX end of selection (anchorX) - needs to be < than selEndDimensions.dx to work
                                    selEndDimensions.dy + (selectionHandleLineHeight / 2), /// DY end of selection (anchorY)
                                    selStartDimensions.dx - deltaXFromInitial - 0.05, /// DX beginning of selection (focusX)
                                    selStartDimensions.dy - deltaYFromInitial - (selectionHandleLineHeight), /// DY beginning of selection (focusY)
                                    dragHandleIndex
                                );

                            } else {
                                /// Right handle
                                createSelectionFromPoint(
                                    selStartDimensions.dx + 3, /// DX beginning of selection (focusX) - needs to be > than selStartDimensions.dx to work
                                    selStartDimensions.dy,  /// DY beginning of selection (focusY)
                                    selEndDimensions.dx - deltaXFromInitial - 0.05, /// DX end of selection (anchorX)
                                    selEndDimensions.dy + deltaYFromInitial - (dragHandleIsReverted ? - (selectionHandleLineHeight / 2) : selectionHandleLineHeight / 2),  /// DY end of selection (anchorY)
                                    dragHandleIndex
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

                /// Scroll page on top and bottom
                let clientY = e.clientY;
                let sizeOfDetectingZone = 20, scrollStep = 3;

                if (clientY > window.innerHeight - sizeOfDetectingZone) {
                    if (edgeScrollInterval == null)
                        edgeScrollInterval = setInterval(function () {
                            window.scrollTo({ top: window.scrollY + scrollStep, behavior: 'smooth' });
                        }, 1);
                } else if (clientY < sizeOfDetectingZone) {
                    if (edgeScrollInterval == null)
                        edgeScrollInterval = setInterval(function () {
                            window.scrollTo({ top: window.scrollY - scrollStep, behavior: 'smooth' });
                        }, 1);
                } else {
                    clearInterval(edgeScrollInterval);
                    edgeScrollInterval = null;
                }
            };

            document.onmouseup = function (e) {
                e.preventDefault();
                document.onmousemove = null;
                document.onmouseup = null;
                document.body.style.cursor = 'unset';
                circleDiv.style.cursor = 'grab';

                clearInterval(edgeScrollInterval);
                edgeScrollInterval = null;

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
                        draggingHandleIndex = null;

                        let selStartDimensions = getSelectionCoordinates(true);
                        let selEndDimensions = getSelectionCoordinates(false);

                        /// Update selection handle height
                        const newSelectionHandleLineHeight = (dragHandleIndex == 0 ? selStartDimensions.lineHeight : selEndDimensions.lineHeight) + 6;
                        if (newSelectionHandleLineHeight) {
                            selectionHandleLineHeight = newSelectionHandleLineHeight;
                            line.style.height = `${selectionHandleLineHeight}px`;
                        }

                        if (selStartDimensions == null || selEndDimensions == null) { hideDragHandles(); return; }
                        if (selEndDimensions.dx == 0 && selEndDimensions.dy == 0) selEndDimensions = { dx: lastMouseUpEvent.clientX, dy: lastMouseUpEvent.clientY - (selectionHandleLineHeight / 2) - circleHeight };
                        if (selStartDimensions.dx == 0 && selStartDimensions.dy == 0) selStartDimensions = { dx: lastMouseUpEvent.clientX, dy: lastMouseUpEvent.clientY - (selectionHandleLineHeight / 2) - circleHeight };

                        /// Sometimes end handle goes off-screen here - fix this
                        if (selEndDimensions.dx > window.innerWidth - 25) selEndDimensions.dx = lastMouseUpEvent.clientX;

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
                        if (dragHandleIndex == 1 && tooltipOnBottom) {
                            circleDiv.style.bottom = "unset";
                            circleDiv.style.top = `-${circleHeight - 1}px`;
                        } else {
                            circleDiv.style.bottom = `-${selectionHandleLineHeight - 1}px`;
                            circleDiv.style.top = "unset";
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

let dragHandles;
function hideDragHandles(animated = true, shouldIgnoreDragged = false) {
    /// Remove all drag handles
    if (configs.addDragHandles) {
        if (!dragHandles) dragHandles = document.getElementsByClassName('selecton-tooltip-draghandle');

        for (let i = 0, l = dragHandles.length; i < l; i++) {
            const dragHandle = dragHandles[i];

            /// Don't hide currently dragged drag handle
            if (shouldIgnoreDragged && draggingHandleIndex !== null && draggingHandleIndex !== undefined) {
                try {
                    let id = dragHandle.id;
                    let handleIndex = parseInt(id.split('-')[2]);
                    if (handleIndex == draggingHandleIndex) continue;
                } catch (e) {
                    console.log(e);
                }
            }

            if (!animated) dragHandle.style.transition = '';
            dragHandle.style.opacity = 0.0;

            setTimeout(function () {
                dragHandle.remove();
                //dragHandles.splice(i, 1);
            }, animated ? configs.animationDuration : 0);
        }
    }
}