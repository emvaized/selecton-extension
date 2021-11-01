# <sub><img src="https://github.com/emvaized/selecton-extension/blob/master/icons/logo-48.png" height="48" width="48"></sub>electon - text selection actions

Get customizable pop-up with action buttons on text selection!
* Copy or search any text in one click - especially useful for laptops
* Customizable appearance for tooltip and custom text selection color
* Currency converter (supports 30+ currencies & 10+ crypto currencies)
* Basic units converter (metric/imperial) and timezones conversion
* Contextual buttons depending on selected text, such as 'Open link', 'Translate', 'Show on map', CSS color display and more 
* Enable snapping selection by words, so you'll never loose that last letter again
* Selection handles, which allow to quickly edit text selection
* Live translation of the selected text (up to 3 words)


Download for Firefox:
https://addons.mozilla.org/ru/firefox/addon/selection-actions/

Download for Chrome:
https://chrome.google.com/webstore/detail/selection-actions/pemdbnndbdpbelmfcddaihdihdfmnadi

____

### Currency converter
*Note*:
In order to make extension more autonomous, currency rates are set to be updated every 2 weeks, and at the moment of conversion data may not be 100% accurate. Currency conversion output is intended to be used only for a quick estimation. 
But you could always decrease update interval in extension's settings if needed.

Currency rates are fetched from [exchangerate.host](https://exchangerate.host/#/)

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
____

### FAQ

**On Firefox, can't change colors from extension popup**

* This is common Firefox bug, progress on this can be monitored [here](https://bugzilla.mozilla.org/show_bug.cgi?id=1676222).
To change colors on Firefox, open settings in new tab by clicking button in top-right corner of the popup

**Change fetch interval for currency rates?**

* Settings > Conversion > Rates update interval

**Disable selelction hangles on the right and left?**

* Settings > Text selection > Add selection drag handles

**How to disable word snapping?**

* Hold CTRL key while selecting text or modify selection with drag handle - in both cases text selection will not be snapped by word.
To permanently disable word snapping, add website to word-snapping blacklist or uncheck:
"Settings > Text selection > Snap text selection by word"

**Why extension doesn't work on new tab page?**
* This is basic security limitation in most modern browsers. Browser extension could not execute it's scripts on new tab page (speed dial), as well as on service pages ("chrome://", "about:*", etc.) and on extensions store.

**Additional search buttons do not show on hovering Search button?**

* Icons for these buttons are fetched from Google. [It is possible](https://github.com/emvaized/selecton-extension/issues/5#issuecomment-830542219) that you have Ad-blocker installed, which blocks all requests to Google services. In this case you would like to use **vertical layout** for custom search panel to get at least labels shown, or visit *Settings > Custom search tooltip* and set your own icon for each option. It may also be that current website blocks all external requests at all, which prevents Selecton from loading favicons.

**How to add Selecton settings as Vivaldi side panel?**

* Use this URL: *chrome-extension://*{ID OF EXTENSION}*/options/options.html*, where {ID OF EXTENSION} is a unique extension ID on your computer. You can get this from extension details page on chrome://extensions

----

### Contributing
You can make Selecton better without even knowing how to code:
- Provide translation for your language: [Base English file](https://github.com/emvaized/selecton-extension/blob/master/_locales/en/messages.json)
- Add your currency to the list of supported currencies: [Currencies list](https://github.com/emvaized/selecton-extension/blob/master/src/data/currencies.js)
- Selecton relies on looking for keywords in the selected text. Enhance them with keywords for your language: [Keywords](https://github.com/emvaized/selecton-extension/blob/master/src/data/keywords.js)

Make your changes, and then create pull request here on GitHub so I can merge it.

Also, you can always write me an [email](mailto:maximtsyba@gmail.com) to share your ideas and suggestions.





