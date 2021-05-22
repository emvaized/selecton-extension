/// Selection methods

/// Returns dx and dy of text selection
/// Source: https://stackoverflow.com/a/66618280/11381400
// atStart: if true, returns coord of the beginning of the selection,
//          if false, returns coord of the end of the selection
function getSelectionCoordinates(atStart) {
    const sel = window.getSelection();

    // check if selection exists
    if (!sel.rangeCount) return null;

    // get range
    let range = sel.getRangeAt(0).cloneRange();
    if (!range.getClientRects) return null;

    // get client rect
    range.collapse(atStart);
    let rects = range.getClientRects();
    if (rects.length <= 0) return null;

    // return coord
    let rect = rects[0];
    return { dx: rect.x, dy: rect.y };
}

/// When word is selected only partially, this methods selects whole word 
/// (also trims empty spaces at the start and in the end)
function snapSelectionByWords(sel) {
    if (configs.debugMode)
        console.log('Snap selection by word...');

    if (!sel.isCollapsed) {
        var firstSymbolOfSelection = sel.toString()[0];
        var lastSymbolOfSelection = sel.toString()[sel.toString().length - 1];

        // Detect if selection is backwards
        var range = document.createRange();
        range.setStart(sel.anchorNode, sel.anchorOffset);
        range.setEnd(sel.focusNode, sel.focusOffset);
        var backwards = range.collapsed;
        range.detach();

        // modify() works on the focus of the selection
        var endNode = sel.focusNode, endOffset = sel.focusOffset;
        sel.collapse(sel.anchorNode, sel.anchorOffset);

        var direction = [];
        if (backwards) {
            direction = ['backward', 'forward'];
        } else {
            direction = ['forward', 'backward'];
        }

        sel.modify("move", direction[0], "character");

        /// Trim empty space in the beginning of selection
        if ((backwards ? lastSymbolOfSelection : firstSymbolOfSelection) == ' ') {
            sel.modify("move", direction[0], "character");
        }

        sel.modify("move", direction[1], "word");
        sel.extend(endNode, endOffset);
        sel.modify("extend", direction[1], "character");

        /// Trim empty space in the end of selection
        if ((backwards ? firstSymbolOfSelection : lastSymbolOfSelection) == ' ') {

        }
        else
            sel.modify("extend", direction[0], "word");
    }
}

function getSelectionRectDimensions() {
    var sel = document.selection, range;
    var width = 0, height = 0;
    var dx = 0, dy = 0;
    if (sel) {
        if (sel.type != "Control") {
            range = sel.createRange();
            var rect = range.getBoundingClientRect();
            width = range.boundingWidth;
            height = range.boundingHeight;
            dx = rect.left;
            dy = rect.top;
        }
    } else if (window.getSelection) {
        sel = window.getSelection();
        if (sel.rangeCount) {
            range = sel.getRangeAt(0).cloneRange();
            if (range.getBoundingClientRect) {
                var rect = range.getBoundingClientRect();
                width = rect.right - rect.left;
                height = rect.bottom - rect.top;
                dx = rect.left;
                dy = rect.top;
            }
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
        var sel = window.getSelection ? window.getSelection() : document.selection;

        if (sel) {
            if (sel.removeAllRanges) {
                sel.removeAllRanges();
            } else if (sel.empty) {
                sel.empty();
            }

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
function createSelectionFromPoint(anchorX, anchorY, focusX, focusY) {
    var doc = document;
    var start, end, range = null;
    var startX, startY, endX, endY;
    var backward = focusY < anchorY || (anchorY == focusY && focusX < anchorX);

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
        var endRange = range.duplicate();
        endRange.moveToPoint(endX, endY);
        range.setEndPoint("EndToEnd", endRange);
        range.select();
    } else {
        if (typeof doc.caretPositionFromPoint != "undefined") {
            start = doc.caretPositionFromPoint(startX, startY);
            end = doc.caretPositionFromPoint(endX, endY);
            range = doc.createRange();
            range.setStart(start.offsetNode, start.offset);
            range.setEnd(end.offsetNode, end.offset);
        }
        else if (typeof doc.caretRangeFromPoint != "undefined") {
            const screenHeight = window.innerHeight || document.documentElement.clientHeight ||
                document.body.clientHeight;

            /// TODO: It seems that when scrolling page, startY and endY are bounded to visible screen
            /// So when one of the handles go off-screen, startY or endY are considered negative or bigger than screen height, and the selection fails
            /// Following 2 lines prevent such an issue
            if (startY < 0.0) startY = 0.0;
            if (endY > screenHeight) endY = screenHeight - 15;

            start = doc.caretRangeFromPoint(startX, startY);
            end = doc.caretRangeFromPoint(endX, endY);
            range = doc.createRange();
            range.setStart(start.startContainer, start.startOffset);
            range.setEnd(end.startContainer, end.startOffset);
        }
        else if (typeof doc.elementFromPoint != "undefined" && "getClientRects" in doc.createRange()) {
            start = positionFromPoint(doc, startX, startY);
            end = positionFromPoint(doc, endX, endY);
            range = doc.createRange();
            range.setStart(start.offsetNode, start.offset);
            range.setEnd(end.offsetNode, end.offset);
        }

        if (range !== null && typeof window.getSelection != "undefined") {
            var sel = window.getSelection();
            sel.removeAllRanges();
            if (backward && sel.extend) {
                var endRange = range.cloneRange();
                endRange.collapse(false);
                sel.addRange(endRange);
                sel.extend(range.startContainer, range.startOffset);
            } else {
                sel.addRange(range);
            }
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

        // setTimeout(function () {

        //   if (configs.debugMode)
        //     console.log('recreating the tooltip...');

        //   if (window.getSelection) {
        //     selection = window.getSelection();
        //   } else if (document.selection) {
        //     selection = document.selection.createRange();
        //   }

        //   if (selection !== null && selection !== undefined && selection.toString().trim() !== '') {
        //     createTooltip();
        //   }
        // }, configs.animationDuration)


    }
}