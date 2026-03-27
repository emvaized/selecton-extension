/// Selection methods

/// Returns dx and dy of text selection
/// Source: https://stackoverflow.com/a/66618280/11381400
// atStart: if true, returns coord of the beginning of the selection,
//          if false, returns coord of the end of the selection
function getSelectionCoordinates(atStart) {
    const sel = selection ?? window.getSelection();

    // check if selection exists
    if (!sel.rangeCount) return null;

    // get range
    const range = sel.getRangeAt(0).cloneRange();
    if (!range.getClientRects) return null;

    // get client rect
    range.collapse(atStart);

    const rect = range.getBoundingClientRect();

    // Detect if selection is backwards
    let isBackwards;
    try {
        let range = document.createRange();
        range.setStart(sel.anchorNode, sel.anchorOffset);
        range.setEnd(sel.focusNode, sel.focusOffset);
        isBackwards = range.collapsed;
        range.detach();
    } catch (e) { console.log(e); }

    let coordsToReturn = { dx: rect.x, dy: rect.y, backwards: isBackwards, lineHeight: rect.height };

    if (rect.x == 0 && rect.y == 0) {
        let rectCoords = getSelectionRectDimensions();
        if (atStart)
            coordsToReturn = { dx: rectCoords.dx, dy: rectCoords.dy, backwards: isBackwards };
        else
            coordsToReturn = { dx: rectCoords.dx + rectCoords.width, dy: rectCoords.dy + rectCoords.height - (selectionHandleLineHeight - 7.5), backwards: isBackwards };
    }

    if (coordsToReturn.dx == 0 && coordsToReturn.dy == 0)
        coordsToReturn = { dx: lastMouseUpEvent.clientX, dy: lastMouseUpEvent.clientY - 8, backwards: isBackwards, dontAddDragHandles: true };

    return coordsToReturn;
}

/// When word is selected only partially, this methods selects whole word 
/// (also trims empty spaces at the start and in the end)
function snapSelectionByWords(sel) {

    /// TODO: Don't extend selection if next/prev word is: ' '
    if (sel && !sel.isCollapsed) {
        let selString = sel.toString();
        const initialStringLength = selString.length;
        let firstSymbolOfSelection = selString[0];
        let lastSymbolOfSelection = selString[initialStringLength - 1];
        let symbolToCheck;

        const endNode = sel.focusNode, endOffset = sel.focusOffset;
        const initialAnchorNode = sel.anchorNode;

        // Detect if selection is backwards
        const range = document.createRange();
        range.setStart(sel.anchorNode, sel.anchorOffset);
        range.setEnd(sel.focusNode, sel.focusOffset);
        const backwards = range.collapsed;
        range.detach();

        // For more correct modifications it's better to collapse the selection first
        sel.collapse(sel.anchorNode, sel.anchorOffset);

        /// When selection was made from right to left, need to invert the directions
        let direction;
        if (backwards) direction = ['backward', 'forward'];
            else direction = ['forward', 'backward'];

        /// Trim empty space in the beginning of selection
        sel.modify("move", direction[0], "character");
        symbolToCheck = backwards ? lastSymbolOfSelection : firstSymbolOfSelection;
        if (symbolToCheck == ' ') sel.modify("move", direction[0], "character");

        /// Snap selection to word backwards
        sel.modify("move", direction[1], "word");

        /// Extend selection to the end
        sel.extend(endNode, endOffset);

        /// Check 1st symbol after modification
        selString = sel.toString();
        firstSymbolOfSelection = selString[0];
        lastSymbolOfSelection = selString[selString.length - 1];
        symbolToCheck = backwards ? lastSymbolOfSelection : firstSymbolOfSelection;
        if (symbolToCheck == ' ' || 
            (symbolToCheck == '(' && !selString.includes(')')) ||
            (symbolToCheck == ')' && !selString.includes('(') )
        ) {
            /// First char turned out to be ' '. Need to redo selection start
            sel.collapse(sel.anchorNode, sel.anchorOffset);
            sel.modify("move", direction[0], "character");
            sel.extend(endNode, endOffset);
        }

        /// Selection included unwanted html element at the start - trim it
        const maxCharIterations = 15, maxCharsToCheckNodes = 50;
        if (sel.anchorNode != initialAnchorNode && initialStringLength < maxCharsToCheckNodes) {
            let iteratorCounter = 0;

            sel.collapse(sel.anchorNode, sel.anchorOffset);
            while (sel.anchorNode != initialAnchorNode) {
                if (iteratorCounter >= maxCharIterations) break;
                iteratorCounter += 1;
                sel.modify("move", direction[0], "character");
            }
            sel.modify("move", direction[1], "character");
            sel.extend(endNode, endOffset);
        }

        /// Snap selection by word in the end (if it doesn't end with empty space)
        sel.modify("extend", direction[1], "character");
        symbolToCheck = backwards ? firstSymbolOfSelection : lastSymbolOfSelection;
        if (symbolToCheck !== ' ' && symbolToCheck !== '')
            sel.modify("extend", direction[0], "word");

        /// Selection included unwanted html element at the end - trim it
        if (sel.focusNode != endNode && initialStringLength < maxCharsToCheckNodes) {
            let iteratorCounter = 0; 

            // sel.collapse(sel.anchorNode, sel.anchorOffset);
            while (sel.focusNode != endNode) {
                if (iteratorCounter >= maxCharIterations) break;
                iteratorCounter += 1;
                sel.modify("extend", direction[1], "character");
            }
            sel.modify("extend", direction[0], "character");
        }

        /// Check last symbol after modification
        /// If last symbol is undesirable, trim it
        selString = sel.toString();
        const selStringLength = selString.length;
        firstSymbolOfSelection = selString[0];
        lastSymbolOfSelection = selString[selStringLength - 1];
        symbolToCheck = backwards ? firstSymbolOfSelection : lastSymbolOfSelection;
        let shouldUntrimLastCh = false;
        switch (symbolToCheck) {
            case ' ': shouldUntrimLastCh = true; break;
            case '(': shouldUntrimLastCh = true; break;
            case ')': if (!selString.includes('(')) shouldUntrimLastCh = true; break;
            case "»": if (!selString.includes('«')) shouldUntrimLastCh = true; break;
            case "”": if (!selString.includes('“')) shouldUntrimLastCh = true; break;
            case ',': {
                /// untrim if symbol before "," is " ")
                if (selString[selStringLength - 2] == ')') sel.modify("extend", direction[1], "character");
                shouldUntrimLastCh = true; break;
            }
            case ':': {
                /// special handling for json keys (like "key": )
                /// untrim if symbol before : is "
                if (selString[selStringLength - 2] == '"') sel.modify("extend", direction[1], "character");
                shouldUntrimLastCh = true; break;
            }
            /// TODO: these 2 doesn't work, because browser also selects the space after the symbol
            // case '"': if (!selString.includes('"')) shouldUntrimLastCh = true; break;
            // case "'": if (!selString.includes("'")) shouldUntrimLastCh = true; break;
        }

        if (shouldUntrimLastCh) sel.modify("extend", direction[1], "character");
    }
}

function getSelectionRectDimensions() {
    let sel, range;
    let width = 0, height = 0;
    let dx = 0, dy = 0;
    sel = selection ?? window.getSelection();
    if (sel.rangeCount) {
        range = sel.getRangeAt(0).cloneRange();
        if (range.getBoundingClientRect) {
            const rect = range.getBoundingClientRect();
            width = rect.right - rect.left;
            height = rect.bottom - rect.top;
            dx = rect.left;
            dy = rect.top;
        }
    }
    return { width: width, height: height, dx: dx, dy: dy };
}

/// Gets called when single click on any selection handle, with no dragging
function extendSelectionByWord(sel, dragHandleIndex) {

    /// "Forward" and "backward" relate to direction of selection
    function extendForward() {
        sel.modify("extend", backwards ? 'backward' : 'forward', "word");
    }

    function extendBackward() {
        var endNode = sel.focusNode, endOffset = sel.focusOffset;
        sel.collapse(sel.anchorNode, sel.anchorOffset);

        if (backwards)
            sel.modify("move", 'forward', "word");
        else
            sel.modify("move", 'backward', "word");

        sel.extend(endNode, endOffset);
    }

    // Detect if selection is backwards
    var range = document.createRange();
    range.setStart(sel.anchorNode, sel.anchorOffset);
    range.setEnd(sel.focusNode, sel.focusOffset);
    var backwards = range.collapsed;
    range.detach();

    /// On-click handlers for handles
    if (dragHandleIndex == 0) {
        if (backwards) extendForward();
        else
            extendBackward();
    } else {
        if (backwards) extendBackward();
        else
            extendForward();
    }
}

function removeSelectionOnPage() {
    if (configs.removeSelectionOnActionButtonClick) {
        const sel = window.getSelection ? window.getSelection() : document.selection;

        if (sel) {
            if (sel.removeAllRanges) {
                sel.removeAllRanges();
            } else if (sel.empty) {
                sel.empty();
            }

            if (configs.addDragHandles)
                hideDragHandles();
        }
    } else {
        dontShowTooltip = true;
        setTimeout(function () {
            dontShowTooltip = false;
        }, configs.animationDuration);
    }
}

/// Set selection from offset (used for drag handles)
//// Source: https://stackoverflow.com/a/11336426/11381400
function createSelectionFromPoint(anchorX, anchorY, focusX, focusY, handleIndex) {
    /// handleIndex 0 for left handle, 1 for right handle

    var doc = document;
    var start, end, range = null;
    var startX, startY, endX, endY;
    // var backward = focusY < anchorY || (anchorY == focusY && focusX < anchorX);

    const sel = selection ?? window.getSelection();
    let r = document.createRange();
    r.setStart(sel.anchorNode, sel.anchorOffset);
    r.setEnd(sel.focusNode, sel.focusOffset);
    let backward = r.collapsed;
    r.detach();

    if (backward) {
        startX = focusX;
        startY = focusY;
        endX = anchorX;
        endY = anchorY;
    } else {
        startX = anchorX;
        startY = anchorY;
        endX = focusX;
        endY = focusY;
    }

    if (typeof doc.body.createTextRange != "undefined") {
        range = doc.body.createTextRange();
        range.moveToPoint(startX, startY);
        const endRange = range.duplicate();
        endRange.moveToPoint(endX, endY);
        range.setEndPoint("EndToEnd", endRange);
        range.select();
    } else {
        if (typeof doc.caretPositionFromPoint != "undefined") {
            start = doc.caretPositionFromPoint(startX - 2, startY);
            end = doc.caretPositionFromPoint(endX - 2, endY);
            range = doc.createRange();
            // range.setStart(start.offsetNode, start.offset);
            // range.setEnd(end.offsetNode, end.offset);
            if (handleIndex == 0) {
                if (backward) {
                    range.setStart(start.offsetNode, start.offset);
                    range.setEnd(sel.anchorNode, sel.anchorOffset);
                } else {
                    range.setStart(end.offsetNode, end.offset);
                    range.setEnd(sel.focusNode, sel.focusOffset);
                }
            } else {
                if (backward) {
                    range.setStart(sel.focusNode, sel.focusOffset);
                    range.setEnd(start.offsetNode, start.offset);
                } else {
                    range.setStart(sel.anchorNode, sel.anchorOffset);
                    range.setEnd(end.offsetNode, end.offset);
                }
            }
        } else
            if (typeof doc.caretRangeFromPoint != "undefined") {

                const screenHeight = window.innerHeight || document.documentElement.clientHeight ||
                    document.body.clientHeight;

                /// When scrolling page, startY and endY are bounded to visible screen
                /// So when one of the handles go off-screen, startY or endY are considered negative or bigger than screen height, and the selection may fail
                if (startY < 0.0) startY = 0.0;
                if (endY > screenHeight) endY = screenHeight - 15;

                start = doc.caretRangeFromPoint(startX, startY);
                end = doc.caretRangeFromPoint(endX, endY);
                range = doc.createRange();
                // range.setStart(start.startContainer, start.startOffset);
                // range.setEnd(end.startContainer, end.startOffset);

                if (handleIndex == 0) {
                    if (backward) {
                        range.setStart(start.startContainer, start.startOffset);
                        range.setEnd(sel.anchorNode, sel.anchorOffset);
                    } else {
                        range.setStart(end.startContainer, end.startOffset);
                        range.setEnd(sel.focusNode, sel.focusOffset);
                    }
                } else {
                    if (backward) {
                        range.setStart(sel.focusNode, sel.focusOffset);
                        range.setEnd(start.startContainer, start.startOffset);
                    } else {
                        range.setStart(sel.anchorNode, sel.anchorOffset);
                        range.setEnd(end.startContainer, end.startOffset);
                    }
                }
            }
            else if (typeof doc.elementFromPoint != "undefined" && "getClientRects" in doc.createRange()) {

                start = positionFromPoint(doc, startX, startY);
                end = positionFromPoint(doc, endX, endY);
                range = doc.createRange();
                // range.setStart(start.offsetNode, start.offset);
                // range.setEnd(end.offsetNode, end.offset);
                if (handleIndex == 0) {
                    if (backward) {
                        range.setStart(start.offsetNode, start.offset);
                        range.setEnd(sel.anchorNode, sel.anchorOffset);
                    } else {
                        range.setStart(end.offsetNode, end.offset);
                        range.setEnd(sel.focusNode, sel.focusOffset);
                    }
                } else {
                    if (backward) {
                        range.setStart(sel.focusNode, sel.focusOffset);
                        range.setEnd(start.offsetNode, start.offset);
                    } else {
                        range.setStart(sel.anchorNode, sel.anchorOffset);
                        range.setEnd(end.offsetNode, end.offset);
                    }
                }
            }

        if (range !== null && typeof window.getSelection != "undefined") {
            sel.removeAllRanges();
            if (backward && sel.extend) {
                const endRange = range.cloneRange();
                endRange.collapse(false);
                sel.addRange(endRange);
                sel.extend(range.startContainer, range.startOffset);
            } else {
                sel.addRange(range);
            }
            range.detach();
        }
    }
}

function getNodeIndex(node) {
    var i = 0;
    while ((node = node.previousSibling)) {
        i++;
    }
    return i;
}

function getLastRangeRect(range) {
    var rects = range.getClientRects();
    return (rects.length > 0) ? rects[rects.length - 1] : null;
}

function pointIsInOrAboveRect(x, y, rect) {
    return y < rect.bottom && x >= rect.left && x <= rect.right;
}

function positionFromPoint(doc, x, y, favourPrecedingPosition) {
    var el = doc.elementFromPoint(x, y);

    var range = doc.createRange();
    range.selectNodeContents(el);
    range.collapse(true);

    var offsetNode = el.firstChild, offset, position, rect;

    if (!offsetNode) {
        offsetNode = el.parentNode;
        offset = getNodeIndex(el);
        if (!favourPrecedingPosition) {
            ++offset;
        }
    } else {
        // Search through the text node children of el
        main: while (offsetNode) {
            if (offsetNode.nodeType == 3) {
                // Go through the text node character by character
                for (offset = 0, textLen = offsetNode.length; offset <= textLen; ++offset) {
                    range.setEnd(offsetNode, offset);
                    rect = getLastRangeRect(range);
                    if (rect && pointIsInOrAboveRect(x, y, rect)) {
                        // We've gone past the point. Now we check which side (left or right) of the character the point is nearer to
                        if (rect.right - x > x - rect.left) {
                            --offset;
                        }
                        break main;
                    }
                }
            } else {
                // Handle elements
                range.setEndAfter(offsetNode);
                rect = getLastRangeRect(range);
                if (rect && pointIsInOrAboveRect(x, y, rect)) {
                    offset = getNodeIndex(offsetNode);
                    offsetNode = el.parentNode;
                    if (!favourPrecedingPosition) {
                        ++offset;
                    }
                    break main;
                }
            }

            offsetNode = offsetNode.nextSibling;
        }
        if (!offsetNode) {
            offsetNode = el;
            offset = el.childNodes.length;
        }
    }

    return {
        offsetNode: offsetNode,
        offset: offset
    };
}

function selectionChangeListener(e) {
    /// Handler when selection changed while tooltip is shown

    if (tooltipIsShown == true) {
        selection = null;
        hideTooltip();
        hideDragHandles();

        document.removeEventListener("selectionchange", selectionChangeListener);
    }
}

function extendSelectionToParentEl(){
    /// Extends text selection one level up in the elements hierarchy

    const s = selection ?? window.getSelection(), range = document.createRange();
    const prevSelection = s.toString().trim();
    const parentNode = s.anchorNode !== s.focusNode ? s.anchorNode.parentNode.parentNode : s.anchorNode.parentNode;
    range.selectNodeContents(parentNode);
    setTimeout(function(){
        s.removeAllRanges();
        s.addRange(range);

        const newSelection = s.toString().trim();
        if (prevSelection === newSelection && extendParentSelectionCounter < 5) {
            extendParentSelectionCounter += 1;
            extendSelectionToParentEl();
        } else {
            extendParentSelectionCounter = 0;
        }
    }, 0)
}
let extendParentSelectionCounter = 0;