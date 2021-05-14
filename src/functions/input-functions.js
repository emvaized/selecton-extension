function formatSelectedTextForInput(textField, selection, type) {
    /// Supported types:
    /// bold
    /// italic
    /// underline
    /// strike
    /// script
    /// monospace
    /// gothic (only latin)

    let formattedText;
    if (type == 'bold' || type == 'italic')
        formattedText = toUnicodeVariant(selection.toString(), type + ' sans');
    else if (type == 'script' || type == 'monospace' || type == 'gothic')
        formattedText = toUnicodeVariant(selection.toString(), type);
    else
        formattedText = toUnicodeVariant(selection.toString(), 'sans', type);
    textField.focus();

    let textFieldValue;

    try {
        textFieldValue = textField.value;
    } catch (e) { }

    if (textFieldValue == null || textFieldValue == undefined) {
        /// content-editable handling

        textFieldValue = textField.innerHTML;

        let offsets;
        try {
            offsets = getCaretPosition(selection, textField);
        } catch (e) { }

        let newValue;
        if (offsets !== null && offsets !== undefined && offsets !== {}) {
            newValue = replaceStringRange(textFieldValue, offsets.offsets.start, offsets.offsets.end, formattedText);
        } else {
            newValue = textFieldValue.replace(selection.toString(), formattedText);
        }

        textField.innerHTML = newValue;

    } else {
        /// Regular text-field handling
        let newValue = replaceStringRange(textFieldValue, textField.selectionStart, textField.selectionEnd, formattedText);
        textField.value = newValue;
    }
}

function replaceStringRange(s, start, end, substitute) {
    return s.substring(0, start) + substitute + s.substring(end);
}

function countUntilEndContainer(parent, endNode, offset, countingState = { count: 0 }) {
    for (let node of parent.childNodes) {
        if (countingState.done) break;
        if (node === endNode) {
            countingState.done = true;
            countingState.offsetInNode = offset;
            return countingState;
        }
        if (node.nodeType === Node.TEXT_NODE) {
            countingState.offsetInNode = offset;
            countingState.count += node.length;
        } else if (node.nodeType === Node.ELEMENT_NODE) {
            countUntilEndContainer(node, endNode, offset, countingState);
        } else {
            countingState.error = true;
        }
    }
    return countingState;
}

function countUntilOffset(parent, offset, countingState = { count: 0 }) {
    for (let node of parent.childNodes) {
        if (countingState.done) break;
        if (node.nodeType === Node.TEXT_NODE) {
            if (countingState.count <= offset && offset < countingState.count + node.length) {
                countingState.offsetInNode = offset - countingState.count;
                countingState.node = node;
                countingState.done = true;
                return countingState;
            }
            else {
                countingState.count += node.length;
            }
        } else if (node.nodeType === Node.ELEMENT_NODE) {
            countUntilOffset(node, offset, countingState);
        } else {
            countingState.error = true;
        }
    }
    return countingState;
}

function getCaretPosition(sel, editor) {
    if (sel == null || sel == undefined) {
        sel = window.getSelection();
    }
    if (sel.rangeCount === 0) { return null; }
    let range = sel.getRangeAt(0);
    let start = countUntilEndContainer(editor, range.startContainer, range.startOffset);
    let end = countUntilEndContainer(editor, range.endContainer, range.endOffset);
    let offsetsCounts = { start: start.count + start.offsetInNode, end: end.count + end.offsetInNode };
    let offsets = { start: start, end: end, offsets: offsetsCounts };
    return offsets;
}

/**
 * (c) David Konrad 2018
 * MIT License
 *
 * Javascript function to convert plain text to unicode variants
 *
 * Loosely based on the nodejs monotext CLI utility https://github.com/cpsdqs/monotext 
 * (c) cpsdqs 2016
 *
 * For more inspiration see  http://unicode.org/charts/
 *
 */

/*
 * supported unicode variants
 *
 * m: monospace
 * b: bold
 * i: italic
 * c: script
 * g: gothic / fraktur
 * d: double-struck
 * s: sans-serif
 * o: circled text 
 * p: parenthesized latin letters
 * w: fullwidth
 */

function toUnicodeVariant(str, variant, flags) {

    const offsets = {
        m: [0x1d670, 0x1d7f6],
        b: [0x1d400, 0x1d7ce],
        i: [0x1d434, 0x00030],
        bi: [0x1d468, 0x00030],
        c: [0x1d49c, 0x00030],
        bc: [0x1d4d0, 0x00030],
        g: [0x1d504, 0x00030],
        d: [0x1d538, 0x1d7d8],
        bg: [0x1d56c, 0x00030],
        s: [0x1d5a0, 0x1d7e2],
        bs: [0x1d5d4, 0x1d7ec],
        is: [0x1d608, 0x00030],
        bis: [0x1d63c, 0x00030],
        o: [0x24B6, 0x2460],
        p: [0x249C, 0x2474],
        w: [0xff21, 0xff10],
        u: [0x2090, 0xff10]
    }

    const variantOffsets = {
        'monospace': 'm',
        'bold': 'b',
        'italic': 'i',
        'bold italic': 'bi',
        'script': 'c',
        'bold script': 'bc',
        'gothic': 'g',
        'gothic bold': 'bg',
        'doublestruck': 'd',
        'sans': 's',
        'bold sans': 'bs',
        'italic sans': 'is',
        'bold italic sans': 'bis',
        'parenthesis': 'p',
        'circled': 'o',
        'fullwidth': 'w'
    }

    // special characters (absolute values)
    var special = {
        m: {
            ' ': 0x2000,
            '-': 0x2013
        },
        i: {
            'h': 0x210e
        },
        g: {
            'C': 0x212d,
            'H': 0x210c,
            'I': 0x2111,
            'R': 0x211c,
            'Z': 0x2128
        },
        o: {
            '0': 0x24EA,
            '1': 0x2460,
            '2': 0x2461,
            '3': 0x2462,
            '4': 0x2463,
            '5': 0x2464,
            '6': 0x2465,
            '7': 0x2466,
            '8': 0x2467,
            '9': 0x2468,
        },
        p: {},
        w: {}
    }
    //support for parenthesized latin letters small cases 
    for (var i = 97; i <= 122; i++) {
        special.p[String.fromCharCode(i)] = 0x249C + (i - 97)
    }
    //support for full width latin letters small cases 
    for (var i = 97; i <= 122; i++) {
        special.w[String.fromCharCode(i)] = 0xff41 + (i - 97)
    }

    var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';

    var getType = function (variant) {
        if (variantOffsets[variant]) return variantOffsets[variant]
        if (offsets[variant]) return variant;
        return 'm'; //monospace as default
    }
    var getFlag = function (flag, flags) {
        if (!flags) return false
        return flags.split(',').indexOf(flag) > -1
    }

    var type = getType(variant);
    var underline = getFlag('underline', flags);
    var strike = getFlag('strike', flags);
    var result = '';

    for (var k of str) {
        let index
        let c = k
        if (special[type] && special[type][c]) c = String.fromCodePoint(special[type][c])
        if (type && (index = chars.indexOf(c)) > -1) {
            result += String.fromCodePoint(index + offsets[type][0])
        } else if (type && (index = numbers.indexOf(c)) > -1) {
            result += String.fromCodePoint(index + offsets[type][1])
        } else {
            result += c
        }
        if (underline) result += '\u0332' // add combining underline
        if (strike) result += '\u0336' // add combining strike
    }
    return result
}