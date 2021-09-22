/// Returns white for dark background, and black for bright
function getTextColorForBackground(color) {
    var c = hexToRgb(color);

    // var d = 0;
    var luminance =
        (0.299 * c.red + 0.587 * c.green + 0.114 * c.blue) / 255;
    if (luminance > 0.5) {
        /// bright color - black font
        isDarkTooltip = false;
        // d = 0; // bright colors - black font
    }
    else {
        /// dark color - white font
        // d = 255; 
        isDarkTooltip = true;
    }

    // return rgbToHex(d, d, d);
    //return rgbToHex(d, d, d);
}

function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        red: parseInt(result[1], 16),
        green: parseInt(result[2], 16),
        blue: parseInt(result[3], 16)
    } : null;
}

function rgbToHex(r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}