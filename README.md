# <sub><img src="https://github.com/emvaized/selecton-extension/blob/master/icons/logo-48.png" height="48" width="48"></sub>electon - text selection actions

Get customizable pop-up with action buttons on text selection!
* Copy or search any text in one click - especially useful for laptops
* Customizable appearance for tooltip and custom text selection color
* Currency converter (supports 30+ currencies)
* Basic units converter (metric/imperial) and timezones conversion
* Contextual buttons depending on selected text, such as 'Open link', 'Translate', 'Show on map' and more 
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
In order to make extension more autonomous, currency rates get updated every 2 weeks, and at the moment of conversion data may not be 100% accurate. Currency conversion output is intended to be used only for a quick estimation.
Rates are fetched from [exchangerate.host](https://exchangerate.host/#/)

```
AUD — Australian Dollar
BGN — Bulgarian Lev
BRL — Brazilian real
BTC — Bitcoin
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
```
____

### Contributing
You can make Selecton better the following ways:
- Provide translation for your language: [Base English file](https://github.com/emvaized/selecton-extension/blob/master/_locales/en/messages.json)
- Add your currency to the list of supported currencies: [Currencies list](https://github.com/emvaized/selecton-extension/blob/master/src/data/currencies.js)
- Selecton relies on looking for keywords in the selected text. Enhance them with keywords for your language: [Keywords](https://github.com/emvaized/selecton-extension/blob/master/src/data/keywords.js)

Make your changes, and then create pull request here on GitHub so I can merge it.

Also, you can always write me on [email](mailto:maximtsyba@gmail.com) to share your ideas and suggestions.





