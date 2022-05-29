[![Stand With Ukraine](https://raw.githubusercontent.com/vshymanskyy/StandWithUkraine/main/banner-direct-single.svg)](https://vshymanskyy.github.io/StandWithUkraine)

# <sub><img src="https://github.com/emvaized/selecton-extension/blob/master/icons/logo-48.png" height="48" width="48" alt="S"></sub>electon — text selection actions

Get customizable pop-up with action buttons on text selection
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

<img src="https://github.com/emvaized/selecton-extension/blob/master/screenshots/1.png">


Download for Chrome:
https://chrome.google.com/webstore/detail/selection-actions/pemdbnndbdpbelmfcddaihdihdfmnadi

Download for Firefox:
https://addons.mozilla.org/firefox/addon/selection-actions/

Download for Safari:
https://apps.apple.com/app/selecton-selection-actions/id1594013341

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
____

### FAQ

**How to disable word snapping?**

* Hold CTRL key while selecting text or modify selection with drag handle - in both cases text selection will not be snapped by word.
To permanently disable word snapping, add website to word-snapping blacklist or uncheck:
"Settings > Text selection > Snap text selection by word"

**How to enable tooltip for text fields?**

* "Selecton settings > Text fields > Use special panel for text fields"
This is disabled by default because with this option on extension will use a little bit more resources by analyzing every mouse click

**Disable selection handles on the right and left?**

* Settings > Text selection > Add selection drag handles

**Enable selecting text in links, like in Opera or Vivaldi?**

* You can use other extensions to get link selection, such as [Select like a Boss](https://chrome.google.com/webstore/detail/select-like-a-boss/mbnnmpmcijodolgeejegcijdamonganh) for Chrome or [Drag-Select Link Text](https://addons.mozilla.org/firefox/addon/drag-select-link-text/) for Firefox

**On Firefox, can't change colors or import settings from extension popup**

* This is common Firefox bug, progress on this can be monitored [here](https://bugzilla.mozilla.org/show_bug.cgi?id=1378527).
To change colors on Firefox, open settings in new tab by clicking button in top-right corner of the popup

**Change fetch interval for currency rates?**

* "Settings > Conversion > Rates update interval"
This is set to "18" by default, because rates tend to not change drastically so often, and it is better to reduce load on free service we're using for fetching new rates.

**Why extension doesn't work on new tab page?**
* This is basic security limitation in most modern browsers. Browser extension could not execute it's scripts on new tab page (speed dial), as well as on service pages (`chrome://`, `about:`, etc.) and in extensions store.

**Additional search buttons do not show on hovering Search button?**

* Icons for these buttons are fetched from Google. [It is possible](https://github.com/emvaized/selecton-extension/issues/5#issuecomment-830542219) that you have Ad-blocker installed, which blocks all requests to Google services. In this case you would like to use **vertical layout** for custom search panel to get at least labels shown, or visit *Settings > Custom search tooltip* and set your own icon for each option. It may also be that current website blocks all external requests at all, which prevents Selecton from loading favicons.

**How to add new search option**
* Let's use [YouTube](https://youtube.com) as an example. Go on a website and search for something, like "gold" – your URL will look something like this: [https://www.youtube.com/results?search_query=gold](https://www.youtube.com/results?search_query=gold). You have to grab this url, replace `gold` with `%s` (placeholder for the searched text), and use it as url for the new search option (Extension options > Custom search options > Add new search option).

**How to add Selecton settings as Vivaldi side panel?**

* Use this URL: *chrome-extension://*{ID OF EXTENSION}*/options/options.html*, where {ID OF EXTENSION} is a unique extension ID on your computer. You can get this from extension details page on chrome://extensions

**Highlight button cuts the text selection**

* To make this tool work reliably, please highlight only single words or sentences. Highlighter trims text selection within one HTML node – otherwise page layout may be broken when highlight gets restored after page reload.

----

### Contributing
You can make Selecton better without even knowing how to code:
- Provide translation for your language: [Base English file](https://github.com/emvaized/selecton-extension/blob/master/_locales/en/messages.json)
- Add your currency to the list of supported currencies: [Currencies list](https://github.com/emvaized/selecton-extension/blob/master/src/data/currencies.js)
- Selecton relies on looking for keywords in the selected text. Enhance them with keywords for your language: [Keywords](https://github.com/emvaized/selecton-extension/blob/master/src/data/keywords.js)

Make your changes, and then create pull request here on GitHub so I can merge it.
Also, you can always write me an [email](mailto:maximtsyba@gmail.com) to share your ideas and suggestions.

**Ideas for future releases**

- Advanced buttons editor, which allows to quickly turn on/off buttons and change their order with drag'n'drop
- Cloud sync of settings using browser account sync
- Ability to turn on/off background blur for tooltip and hover panels

---

### Links to my other browser extensions
[Circle Mouse Gestures](https://github.com/emvaized/circle-mouse-gestures) – better mouse gestures, with visual representation of all available actions
[Google Tweaks](https://github.com/emvaized/google-tiles-extension) – set of tweaks for Google search page to make it easier to use