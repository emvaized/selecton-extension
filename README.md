# <sub><img src="./icons/logo-new.png" height="48" width="48" alt="S"></sub>electon — text selection actions

![Chrome Web Store](https://img.shields.io/chrome-web-store/v/pemdbnndbdpbelmfcddaihdihdfmnadi?label=version)
[![Chrome Web Store](https://img.shields.io/chrome-web-store/users/pemdbnndbdpbelmfcddaihdihdfmnadi?label=users&logo=googlechrome&logoColor=white)](https://chrome.google.com/webstore/detail/selection-actions/pemdbnndbdpbelmfcddaihdihdfmnadi)
[![Mozilla Add-on](https://img.shields.io/amo/users/selection-actions?color=%23FF6611&label=users&logo=Firefox)](https://addons.mozilla.org/firefox/addon/selection-actions/)
[![Chrome Web Store](https://img.shields.io/chrome-web-store/rating/pemdbnndbdpbelmfcddaihdihdfmnadi)](https://chrome.google.com/webstore/detail/selecton/pemdbnndbdpbelmfcddaihdihdfmnadi/reviews)

Get customizable pop-up with action buttons on text selection!
* Copy or search any text in one click - especially useful for laptops
* Customizable appearance for tooltip and custom text selection color
* Currency converter (supports 30+ currencies & 10+ crypto currencies)
* Basic units converter (metric/imperial) and timezones conversion
* Contextual buttons depending on selected text, such as 'Open link', 'Translate', 'Show on map', CSS color preview and more 
* Smart selection - automatic snapping of text selection by words, so you'll never lose that last letter again
* Selection handles, which allow to quickly edit text selection
* Live translation of the selected text on hovering the "Translate" button
* Dictionary button, which fetches definition from Wikipedia on hover
* Highlighter button, which allows to highlight specific text on page and quickly find it later

<a href="https://addons.mozilla.org/firefox/addon/selection-actions/"><img src="https://user-images.githubusercontent.com/585534/107280546-7b9b2a00-6a26-11eb-8f9f-f95932f4bfec.png" alt="Get for Firefox"></a> &nbsp;&nbsp; <a href="https://chrome.google.com/webstore/detail/cselection-actions/pemdbnndbdpbelmfcddaihdihdfmnadi"><img src="https://user-images.githubusercontent.com/585534/107280622-91a8ea80-6a26-11eb-8d07-77c548b28665.png" alt="Get for Chrome"></a>


## Screenshot
<img src="https://github.com/emvaized/selecton-extension/blob/master/screenshots/screenshot.png">


## Building
- `npm install` to install all dependencies
- `npm run build` to generate `dist` folder with minimized code of the extension


## Currency converter
*Note*:
In order to make extension more autonomous, currency rates are set to be updated every 2 weeks, and at the moment of conversion data may not be 100% accurate. Currency conversion output is intended to be used only for a quick estimation. You can decrease update interval in extension's settings if needed, but minimal value for now is 7 days to not cause too much load on API servers.

<details>
  <summary>List of supported currencies</summary>
  
```
AUD — Australian Dollar
BGN — Bulgarian Lev
BRL — Brazilian real
CAD — Canadian Dollar
CHF — Swiss Franc
CNY — Chinese Yuan
CRC — Costa Rican Colon 
CZK — Czech Koruna
DKK — Danish Krone 
EUR — Euro
GBP — British Pound 
HKD — Hong Kong dollar
ILS — Israeli New Sheqel
INR — Indian Rupee
IRR — Iranian Rial
JPY — Japanese Yen
KPW — North Korean Won
KRW — South Korean Won
KZT — Kazakhstani Tenge
MNT — Mongolian Tugrik 
MXN — Mexican Peso
NGN — Nigerian Naira
NOK — Norwegian krone
PLN — Polish złoty
RUB — Russian Ruble
SAR — Saudi Riyal
SEK — Swedish Krona
TRY — Turkish Lira 
UAH — Ukrainian Hryvnia
USD — United States Dollar
VND — Vietnamese Dong
ZAR — Rand

Crypto:
BTC — Bitcoin
ETH — Etherium
LTC — Litecoin
ADA — Cardano
BCH — Bitcoin Cash
XRP — Ripple
ZEC — Zcash
XMR — Monero
ZCL — ZClassic
DOGE — Dogecoin
IOTA (MIOTA)
EOS
```
</details>


Currency rates are fetched from fawazahmed0's [currency-api](https://github.com/fawazahmed0/exchange-api/blob/main/README.md)


## FAQ

Moved to Wiki page – [read here](https://github.com/emvaized/selecton-extension/wiki/FAQ-(Frequently-Asked-Questions))


## Contributing
You can make Selecton better without even knowing how to code:
- Provide translation for your language: [Base English file](https://github.com/emvaized/selecton-extension/blob/master/_locales/en/messages.json)
- Add your currency to the list of supported currencies: [Currencies list](https://github.com/emvaized/selecton-extension/blob/master/src/data/currencies.js)
- Selecton relies on looking for keywords in the selected text. Enhance them with keywords for your language: [Keywords](https://github.com/emvaized/selecton-extension/blob/master/src/data/keywords.js)

Make your changes, and then create pull request here on GitHub so I can merge it.
Also, you can always write me an [email](mailto:maximtsyba@gmail.com) to share your ideas and suggestions.

**Ideas for future releases**

- Advanced buttons editor, which allows to quickly turn on/off buttons and change reorder them with drag'n'drop
- Cloud sync of settings using browser account sync
- Ability to turn on/off background blur for tooltip and hover panels
- Make separate tab for markers in extension popup, separate markers from currently open page


## Support
If you really enjoy this project, please consider supporting its further development by making a small donation using one of these services! 

<a href="https://www.paypal.com/donate/?business=2KDNGXNUVZW7N&no_recurring=0&currency_code=USD"><img src="https://www.paypalobjects.com/en_US/DK/i/btn/btn_donateCC_LG.gif" alt="PayPal" height="40" width="75"/></a> &nbsp;&nbsp; <a href="https://ko-fi.com/emvaized"><img src="https://cdn.prod.website-files.com/5c14e387dab576fe667689cf/64f1a9ddd0246590df69ea0b_kofi_long_button_red%25402x-p-800.png" alt="Support on Ko-fi" height="40"></a>  &nbsp;&nbsp; <a href="https://www.buymeacoffee.com/emvaized" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" style="height: 40px !important;width: 155px !important;" ></a>


## Links to my other browser extensions
* [Circle Mouse Gestures](https://github.com/emvaized/circle-mouse-gestures) – better mouse gestures, with visual representation of all available actions
* [Google Tweaks](https://github.com/emvaized/google-tiles-extension) – set of tweaks for Google search page to make it easier to use
* [Open in Popup Window](https://github.com/emvaized/open-in-popup-window-extension) – quickly open any links and images in a small popup window with no browser controls
