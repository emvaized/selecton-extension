const markers = [];

function createSelectionHighlightSpan(bg, fg, marker, scrollbarHint) {
    let span = document.createElement("span");
    span.style.backgroundColor = bg ?? "yellow";
    span.style.color = fg ?? "black";
    span.style.position = 'relative';
    span.className = 'selecton-marker-highlight';

    if (configs.debugMode)
        setTimeout(function () {
            console.log('created text marker:');
            console.log(span);
        }, 3);

    /// add delete button, shown on hover
    setTimeout(function () {
        let deleteButton = document.createElement('div');
        deleteButton.className = 'marker-highlight-delete';
        deleteButton.textContent = '✕';
        deleteButton.title = chrome.i18n.getMessage('deleteLabel');
        span.appendChild(deleteButton);

        if (marker.timeAdded) {
            let date = new Date();
            date.setTime(marker.timeAdded);
            span.title = chrome.i18n.getMessage('markedLabel') + ' ' + date.toLocaleString();
        }

        deleteButton.onclick = function () {
            try {
                /// remove scrollbar indicator
                scrollbarHint.remove();

                /// remove highlight
                span.outerHTML = span.innerHTML;

                /// remove data
                const indexOfMarker = markers.indexOf(marker);
                if (indexOfMarker > -1) {
                    markers.splice(indexOfMarker, 1);
                    saveAllMarkers();
                }

            } catch (e) { if (configs.debugMode) console.log(e); }
        }
    }, 100);

    return span;
}

function markTextSelection(bg, fg, text, restoredMarker) {
    /// Add hint next to the scrollbar
    const selectionRect = restoredMarker ? {} : getSelectionRectDimensions();
    const minHintHeight = 10;
    let stringToSave = text;

    let scrollbarHint = document.createElement('div');
    scrollbarHint.className = 'marker-scrollbar-hint';
    scrollbarHint.style.backgroundColor = bg ?? "yellow";

    let dyForHint = restoredMarker ? restoredMarker.hintDy : ((selectionRect.dy + window.scrollY) * window.innerHeight) / document.body.scrollHeight;
    if (dyForHint < 5) dyForHint = 5;
    if (dyForHint > window.innerHeight - 5) dyForHint = window.innerHeight - 5;
    scrollbarHint.style.top = `${dyForHint}px`;

    let hintHeight = restoredMarker ? restoredMarker.hintHeight : (selectionRect.height * window.innerHeight) / document.body.scrollHeight;
    if (hintHeight < minHintHeight) hintHeight = minHintHeight;
    scrollbarHint.style.height = `${hintHeight}px`;

    const markersOnTheSameHeight = markers.filter(marker => marker['hintDy'] === dyForHint);
    const markersOnTheSameHeightLength = markersOnTheSameHeight.length;

    /// Shift to the left when already added marker on this level
    let shift;
    if (markersOnTheSameHeightLength !== 0) {
        shift = 100 * markersOnTheSameHeightLength;
        scrollbarHint.style.transform = `translate(-${shift + 5}%, 0)`;
    }

    /// Add on-hover text display
    let hoverHint = document.createElement('span');
    hoverHint.innerText = text;
    hoverHint.className = 'marker-scrollbar-tooltip';
    hoverHint.style.maxWidth = `${window.innerWidth * 0.3}px`;
    hoverHint.style.maxHeight = `${window.innerHeight * 0.6}px`;
    scrollbarHint.appendChild(hoverHint);
    document.body.appendChild(scrollbarHint);

    /// Check if hover hint overflows
    const hoverHintRect = hoverHint.getBoundingClientRect();
    if (hoverHintRect.top < 0) {
        hoverHint.classList.add('marker-scrollbar-tooltip-bottom');
    }

    /// Store marker
    let containerSelector, range;
    if (restoredMarker) {
        containerSelector = restoredMarker.startContainer;
    } else {
        range = selection.getRangeAt(0);
        // let node = range.commonAncestorContainer;
        let node = range.startContainer;
        let containerElement = node.nodeType == 1 ? node : node.parentNode;

        if (range.startContainer != range.endContainer) {
            /// TODO: Cut text selection if it exceeds it's parent node

            let stringToCheck = '';
            let firstNodeInnerHtml = containerElement.innerHTML;
            let indexToBreakText;

            for (let i = 0, l = text.length; i < l; i++) {
                stringToCheck += text[i];

                if (firstNodeInnerHtml.includes(stringToCheck)) {
                    continue;
                } else {
                    indexToBreakText = i;
                    break;
                }
            }

            if (indexToBreakText && indexToBreakText > 0) {
                stringToSave = stringToSave.substr(0, indexToBreakText);
            }

            /// limit the selection range
            range.setEnd(containerElement, 1);
        }
        containerSelector = getNodeSelector(containerElement);

    }

    let marker = restoredMarker ?? {
        'hintDy': dyForHint,
        'hintHeight': hintHeight,
        'startContainer': containerSelector,
        'background': bg ?? "yellow",
        'foreground': fg ?? "black",
        // 'text': text,
        'text': stringToSave,
        // 'timeAdded': restoredMarker ? (restoredMarker.timeAdded ?? '') : new Date().toISOString()
        'timeAdded': restoredMarker ? (restoredMarker.timeAdded ?? '') : new Date().getTime()
    };
    markers.push(marker);

    /// Add highlight to the marked text
    let span = createSelectionHighlightSpan(bg, fg, marker, scrollbarHint);

    if (restoredMarker) {
        const element = document.querySelector(restoredMarker.startContainer);
        if (!element) return;
        const innerHtml = element.innerHTML;
        let index = innerHtml.indexOf(text);
        // if (index == 0) index = 1;

        if (index !== undefined && index !== null && index > -1) {
            span.innerHTML = innerHtml.substring(index, index + text.length);
            element.innerHTML = innerHtml.substring(0, index);
            element.appendChild(span);
            element.insertAdjacentHTML('beforeend', innerHtml.substring(index + text.length, innerHtml.length));
        }
    } else {
        const selectionContents = range.extractContents();
        span.appendChild(selectionContents);
        range.insertNode(span);
        range.detach();
    }

    /// Add on-click listener for the scrollbar hint
    scrollbarHint.onmousedown = function () {
        span.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'smooth' });
    }
}


function getNodeSelector(el) {
    return UTILS.cssPath(el);

    // let names = [];
    // do {
    //     let index = 0;
    //     var cursorElement = el;
    //     while (cursorElement !== null) {
    //         ++index;
    //         cursorElement = cursorElement.previousElementSibling;
    //     };
    //     if (el.tagName !== undefined)
    //         // names.unshift(el.tagName + ":nth-child(" + index + ")");
    //         names.unshift(el.tagName + ":nth-of-type(" + index + ")");
    //     el = el.parentElement;
    // } while (el !== null && el !== undefined);

    // return names.join(" > ");
}

function saveAllMarkers() {
    setTimeout(function () {
        if (markers)
            try {
                // chrome.storage.local.remove('websiteMarkers');
                chrome.storage.local.get(['websiteMarkers'], function (value) {
                    let existingMap = value['websiteMarkers'];
                    if (!existingMap) existingMap = {};

                    if (markers.length <= 0)
                        delete existingMap[window.location.href];
                    else {
                        let markerKeys = Object.keys(existingMap);
                        if (markerKeys.length == (configs.maxMarkerPagesToStore ?? 10))
                            delete existingMap[markerKeys[0]];

                        if (!existingMap[window.location.href]) existingMap[window.location.href] = {};

                        if (document.title)
                            existingMap[window.location.href]['title'] = document.title;

                        existingMap[window.location.href]['timeUpdated'] = new Date().getTime();
                        existingMap[window.location.href]['markers'] = markers;
                    }

                    chrome.storage.local.set({ 'websiteMarkers': existingMap });
                });
            } catch (e) {
                console.log(e);
            }
    }, 5);
}

function restoreMarkers() {
    if (configs.debugMode) {
        console.log('--------');
        console.log('Searching for markers on current page...');
    }

    chrome.storage.local.get(['websiteMarkers'], function (value) {

        if (configs.debugMode) {
            console.log('restored markers:');
            console.log(value);
        }

        if (value['websiteMarkers'] && value['websiteMarkers'][window.location.href]) {
            let markersForCurrentPage = value['websiteMarkers'][window.location.href]['markers'];

            if (markersForCurrentPage) {

                if (configs.debugMode) {
                    console.log('Found markers for current page:');
                    console.log(markersForCurrentPage);
                }

                const markersLength = markersForCurrentPage.length;

                if (markersLength && markersLength > 0)
                    for (let i = 0; i < markersLength; i++) {
                        const marker = markersForCurrentPage[i];

                        try {
                            markTextSelection(marker.background, marker.foreground, marker.text, marker);
                        } catch (e) { if (configs.debugMode) console.log(e); }
                    }
            }
        }
    });
}

function initMarkersRestore() {
    function init() {
        try {
            restoreMarkers();

            /// Set up receiver to scroll to marker when opened from extension popup
            chrome.runtime.onMessage.addListener(request => {
                if (request.command && request.command.includes('selecton-scroll-to-marker-message')) {
                    const selectedHintDy = parseInt(request.command.split(':')[1]);
                    if (!selectedHintDy || isNaN(selectedHintDy)) return;

                    const dyToScroll = selectedHintDy * document.body.scrollHeight / window.innerHeight;
                    window.scrollTo(0, dyToScroll - (window.innerHeight / 2));
                    // hintDy = ((selectionRect.dy + window.scrollY) * window.innerHeight) / document.body.scrollHeight
                }
            });
        } catch (e) {
            console.log(e);
        }
    }

    if (document.readyState === "complete" || document.readyState === 'interactive') {
        init();
    } else document.addEventListener('DOMContentLoaded', init);

}