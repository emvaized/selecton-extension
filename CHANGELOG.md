### 3.9.6
- Make Translate button appear for more text selections
- Fixed collapsible panel recognizing hover event during reveal transition
- Slightly reduce size of drag handle circles
- Untrim ")" at the end of selection when snap selection by words enabled
- Added 45deg rotation to "Copy link" button icon
- Disabled by default "recreating tooltip on scroll" and "hide when cursor moves away"
- Various small improvements for the options page
- Optimized svg button icons

### 3.9.5
- Added icons to options page headers for easier navigation
- Added new button which extends text selection one level up in the elements tree
- Updated marker (highlighter) icon to look more like an actual highlighter
- Changed default border radius of the popup to 4px
- Changed extension name to "SelectON" for better visibility
- Optimized svg icons for smaller size of the files

### 3.9.4
- Fix for snapping selection by words losing few leters sometimes
- Fix for Translate and Dictionary on-hover popups not working in Firefox
- Increased default delay to reveal on-hover popups for less false detections
- Other small fixes and improvements

### 3.9.3
- Fix for drag handles not working in recent versions of Chrome
- Improved keywords for code detection
- Added missing translations for "lines" label

### 3.9.2
- Fixed secondary tooltip horizontal overflow on left side
- Fixed contenteditable detection
- Optimized code for snapping selection by words
- Removed no longer maintained option for reverse button order
- Fixed button count on «More» button not hidden on hover

### 3.9.1
- Added experimental option "Always show panel with collapsed buttons"
- Fixed bug of on-hover indicators not hidden on hover
- Show lines count on info panel when selecting code
- Move option "Hide tooltip on button click" to "Behavior"
- Improved tooltip behavior and detection for text fields
- Many under-the-hood fixes and improvements
- Updated Chinese translations by @YheonYeung

### 3.9.0
- Added the "Quote" button, shown when compatibile text area is found on page
- Most buttons now trigger on mouse-up instead of mouse-down for better compatibility
- Fixed arrow vertically misaligned with the panel
- Fixed Translate button not shown when search buttons on panel
- Fixed search button not working on click
- Performance and stability improvements

### 3.8.1
- Already shown tooltip will now be recreated on settings change
- "More" button will now show number of collapsed buttons
- Improved overall stability and performance

### 3.8.0
- Added option to not hide tooltip on button click
- Fixed wrong icon path for extension popup
- Fixed vertical layout tooltip broken layout
- Fixed drag handles not hidden on tooltip button click

### 3.7.9
- Fixed the problem of custom search buttons opening in current tab on click
- Fixed layout issues with vertical tooltip layout

### 3.7.8
- Most buttons with links are (<a>) elements now, and are recognized as links by browser and other extensions
- Most settings will apply immediately now, no need to reload the page
- Project cleanup and optimization for better performance
- Added TWD and PHP currencies
- Small bug fixes and improvements

### 3.7.7
- Use user's locale in Dictionary button url
- Improved address detection for German language

### 3.7.6
- Fixed problem with export settings button
- Small fix for background script

### 3.7.5
- Migrated to Manifest V3 to comply with new Chrome Web Store requirements
- Release codebase is now minified, which should provide much greater performance and smaller package size
- Fixed currency fetching not working because of API migration
- New extension icon with slightly more modern design
- Added IDR currency
- Small fixes for options page

### 3.7.0
- Changed API source of currency rates
- Changed minimial rate fetch days to 7, to not cause too much load on API servers
- Implemented lazy loading for currency rates, translated labels and some css rules to speed up page load

### 3.6.9
- Improve tooltip positioning over cursor
- Fix for tooltip collision detection with 'scale up' effect enabled
- Added Thai Baht currency support

### 3.6.8
- This update fixes issue with non-working tooltip, which affected many users in last update

### 3.6.7
- Add new option for drag handles style (triangle)
- Add option to shift tooltip by 'more' button's width
- More compact view for dropdowns on options page
- Fixed non working search buttons when shown in main panel
- Improve input field recognition
- Added support for RON currency

### 3.6.6
- Added Dutch and Traditional Chinese translations
- Updated the "support project" link to PayPal Sponsor
- Small fixes and improvements

### 3.6.5
- Fix for translate button text going off-screen
- Fix for Calendar button false detection (eg. '3.6.4')
- Fix for Dictionary button opening 2 tabs on click
- Fixed "what's new" button color in options to always blue

### 3.6.4
- Small fixes for 'Open link' and Calendar buttons
- Improved drag handle's height calculation
- Improved detection of tooltip’s side edge collision
- Improved vertical positioning of tooltip on bottom of text selection
- Added new keywords for dates and addresses
- Options page design improvements

### 3.6.3
- Add Calendar button for recognized dates, which opens Google Calendar on click
- Add info panel with words/symbols count, and detected language (when available)
- Add option "Hide tooltip when cursor moves away" (available when tooltip set to appear 'Over cursor')
- Add button to copy link to selected text (opens only in Chrome 90+)
- Add option for experimental vertical tooltip layout
- 'Open link' button now tries to fetch url's favicon when button icons are enabled
- Improved auto-adjusting when tooltip collapses with the screen edge
- Improved keywords recognition and overall performance
- Moved "Text fields" settings to a separate section for easier access
- Extension popup, options page and 'Test settings' page now all support browser dark mode

### 3.6.0
- Add option to disable tooltip arrow
- Add support for HUF and MYR currency
- Improved time conversion according to DST

### 3.5.9
- Fix for not showing translate button for some texts
- Add option "Left click opens link as background tab"
- Options page fixes & small design improvements

### 3.5.8
- Add option to display custom search options in main panel instead of hover panel
- Changed support/donate link to the new Ki-Fi page
- Small fixes and improvements

### 3.5.7
- Add DeepL translation option on click
- Fix for recreating tooltip when clicked on A link with active selection on page
- Fix incorrect border radius of first and last buttons
- Other small fixes

### 3.5.6
- Implemented test page to quickly check settings
- Added Clear button for non-empty text fields
- Added few more imperial measure units
Bug fixes:
- Fixed bug with wrong positioning in horizontal custom search options
- Fixed bug with middle click on custom search option
- Fixed wrong tooltip alignment when 'No effect' is selected
- Fixed issue with tooltip not showing up for links (in browsers which support link selection)
- Other bug fixes & improvements

### 3.5.5
- Implemented new 'Highlight' button, which allows to highlight specific parts of text on page
- Implemented 'Hide exceeding buttons' option, which will hide buttons more than set in settings (defaults to 3)
- Brought back text format buttons for text fields (Bold, Italic, Strikethrough)
- Add 'Show stats on Copy button hover' and 'Show button dividers' options
- 'Open link' button now recognizes Reddit, like r/somesubreddit
- Great code refactor and performance optimization
- Added permission to run extension in iframes
- Increased extension popup height a bit
- Attempt to improve behavior on triple mouse click
- Various bug fixes and improvements

### 3.5.1
- Improved URL detection for 'open link' button
- Improved snapping selection by word
- Other small fixes and improvements

### 3.5.0
- New 'Dictionary' button, which fetches definition from Wikipedia on hover
- Improvements for 'Translate' button - live translation is now getting fetched on hover, and enabled by default
- Improved snapping text selection by words
- Improved URL detection for 'Open link' button
- Fixes for import/export functionality
- Options page improvements and fixes - expanded sections are now restored on re-open

###
3.9.1
- Move option "Hide tooltip on button click" to "Behavior"
- Change button on-hover animation curve to 'ease'
- Add experimental option "Always show panel with collapsed buttons"
- Improved tooltip behavior and detection for text fields
- Many under-the-hood fixes and improvements
- Added Chinese translations by @YheonYeung

### 3.9.0
- Added the "Quote" button, shown when compatibile text area is found on page
- Most buttons now trigger on mouse-up instead of mouse-down for better compatibility
- Fixed arrow vertically misaligned with the panel
- Fixed Translate button not shown when search buttons on panel
- Fixed search button not working on click
- Performance and stability improvements

### 3.8.1
- Already shown tooltip will now be recreated on settings change
- "More" button will now show number of collapsed buttons
- Improved overall stability and performance

### 3.8.0
- Added option to not hide tooltip on button click
- Fixed wrong icon path for extension popup
- Fixed vertical layout tooltip broken layout
- Fixed drag handles not hidden on tooltip button click

### 3.7.9
- Fixed the problem of custom search buttons opening in current tab on click
- Fixed layout issues with vertical tooltip layout

### 3.7.8
- Most buttons with links are (<a>) elements now, and are recognized as links by browser and other extensions
- Most settings will apply immediately now, no need to reload the page
- Project cleanup and optimization for better performance
- Added TWD and PHP currencies
- Small bug fixes and improvements

### 3.7.7
- Use user's locale in Dictionary button url
- Improved address detection for German language

### 3.7.6
- Fixed problem with export settings button
- Small fix for background script

### 3.7.5
- Migrated to Manifest V3 to comply with new Chrome Web Store requirements
- Release codebase is now minified, which should provide much greater performance and smaller package size
- Fixed currency fetching not working because of API migration
- New extension icon with slightly more modern design
- Added IDR currency
- Small fixes for options page

### 3.7.0
- Changed API source of currency rates
- Changed minimial rate fetch days to 7, to not cause too much load on API servers
- Implemented lazy loading for currency rates, translated labels and some css rules to speed up page load

### 3.6.9
- Improve tooltip positioning over cursor
- Fix for tooltip collision detection with 'scale up' effect enabled
- Added Thai Baht currency support

### 3.6.8
- This update fixes issue with non-working tooltip, which affected many users in last update

### 3.6.7
- Add new option for drag handles style (triangle)
- Add option to shift tooltip by 'more' button's width
- More compact view for dropdowns on options page
- Fixed non working search buttons when shown in main panel
- Improve input field recognition
- Added support for RON currency

### 3.6.6
- Added Dutch and Traditional Chinese translations
- Updated the "support project" link to PayPal Sponsor
- Small fixes and improvements

### 3.6.5
- Fix for translate button text going off-screen
- Fix for Calendar button false detection (eg. '3.6.4')
- Fix for Dictionary button opening 2 tabs on click
- Fixed "what's new" button color in options to always blue

### 3.6.4
- Small fixes for 'Open link' and Calendar buttons
- Improved drag handle's height calculation
- Improved detection of tooltip’s side edge collision
- Improved vertical positioning of tooltip on bottom of text selection
- Added new keywords for dates and addresses
- Options page design improvements

### 3.6.3
- Add Calendar button for recognized dates, which opens Google Calendar on click
- Add info panel with words/symbols count, and detected language (when available)
- Add option "Hide tooltip when cursor moves away" (available when tooltip set to appear 'Over cursor')
- Add button to copy link to selected text (opens only in Chrome 90+)
- Add option for experimental vertical tooltip layout
- 'Open link' button now tries to fetch url's favicon when button icons are enabled
- Improved auto-adjusting when tooltip collapses with the screen edge
- Improved keywords recognition and overall performance
- Moved "Text fields" settings to a separate section for easier access
- Extension popup, options page and 'Test settings' page now all support browser dark mode

### 3.6.0
- Add option to disable tooltip arrow
- Add support for HUF and MYR currency
- Improved time conversion according to DST

### 3.5.9
- Fix for not showing translate button for some texts
- Add option "Left click opens link as background tab"
- Options page fixes & small design improvements

### 3.5.8
- Add option to display custom search options in main panel instead of hover panel
- Changed support/donate link to the new Ki-Fi page
- Small fixes and improvements

### 3.5.7
- Add DeepL translation option on click
- Fix for recreating tooltip when clicked on A link with active selection on page
- Fix incorrect border radius of first and last buttons
- Other small fixes

### 3.5.6
- Implemented test page to quickly check settings
- Added Clear button for non-empty text fields
- Added few more imperial measure units
Bug fixes:
- Fixed bug with wrong positioning in horizontal custom search options
- Fixed bug with middle click on custom search option
- Fixed wrong tooltip alignment when 'No effect' is selected
- Fixed issue with tooltip not showing up for links (in browsers which support link selection)
- Other bug fixes & improvements

### 3.5.5
- Implemented new 'Highlight' button, which allows to highlight specific parts of text on page
- Implemented 'Hide exceeding buttons' option, which will hide buttons more than set in settings (defaults to 3)
- Brought back text format buttons for text fields (Bold, Italic, Strikethrough)
- Add 'Show stats on Copy button hover' and 'Show button dividers' options
- 'Open link' button now recognizes Reddit, like r/somesubreddit
- Great code refactor and performance optimization
- Added permission to run extension in iframes
- Increased extension popup height a bit
- Attempt to improve behavior on triple mouse click
- Various bug fixes and improvements

### 3.5.1
- Improved URL detection for 'open link' button
- Improved snapping selection by word
- Other small fixes and improvements

### 3.5.0
- New 'Dictionary' button, which fetches definition from Wikipedia on hover
- Improvements for 'Translate' button - live translation is now getting fetched on hover, and enabled by default
- Improved snapping text selection by words
- Improved URL detection for 'Open link' button
- Fixes for import/export functionality
- Options page improvements and fixes - expanded sections are now restored on re-open

### 3.4.2
- Added option to disable Translate button completely
- Added option to display only chosen custom search buttons
- Added option for darker background in search panel
- Various small improvements and bug fixes

### 3.4.1
- Improved visual appearance of button icons
- Improved positioning of tooltip on text selection
- Added support for currency conversion in EUR and GBP
- Bug fixes and performance improvements

### 3.4.0
- Added new 'Open Link' button for recognized URLs
- Added option to display dictionary definitions from external sources
- Improved text selection snapping for better precision
- Improved overall performance and stability
- Bug fixes for known issues

### 3.3.9
- Improved tooltip appearance for better readability
- Added support for custom button actions
- Fixed issue with tooltip not showing on some websites
- Minor bug fixes and performance enhancements

### 3.3.8
- Implemented new button for quick search on selected text
- Added option to disable tooltip animations
- Improved handling of currency conversion rates
- Small fixes for improved stability

### 3.3.7
- Added new feature to convert selected text into predefined format
- Improved tooltip rendering for high-resolution screens
- Fixed issue with some buttons not responding to clicks
- Performance improvements and bug fixes

### 3.3.6
- Implemented new keyboard shortcuts for faster actions
- Improved button design for better user experience
- Bug fixes related to tooltip display issues
- Minor improvements to currency conversion

### 3.3.5
- Added option to customize tooltip background color
- Improved detection of text fields on web pages
- Fixed issue with non-functional buttons on certain sites
- Performance optimizations and bug fixes

### 3.3.4
- Added support for additional languages in translation feature
- Improved UI design for tooltip settings panel
- Bug fixes related to currency conversion rates
- Minor improvements to tooltip positioning logic

### 3.3.3
- Added new feature to highlight text on hover
- Improved detection of URLs and web addresses in selected text
- Fixed issue with tooltip overlap on certain pages
- Various bug fixes and performance improvements

### 3.3.2
- Added support for new currency formats
- Improved text selection handling for mobile devices
- Fixed issue with buttons not displaying correctly
- Minor UI improvements and bug fixes

### 3.3.1
- Implemented new 'Copy to Clipboard' button for quick copying of selected text
- Improved performance of tooltip rendering engine
- Fixed known issues with button alignment on certain websites
- Small fixes for overall stability

### 3.3.0
- Improved logic for drag handles
- Added new check "Don't snap selection in text fields" (defaults to "true")
- Selecton mouse listeners now won't be loaded in page unless user starts to actually select text
- Inactive custom search options are now dimmed out in settings
- Improved shifting tooltip when it collides with side edges
- Added more address markers
- Added Turkish translation
- Removed junk from code
- Changed some default configs
- Added 'Contributing' section in README
- Various performance optimizations and design improvements

### 3.2.7
- "Show tooltip at cursor position" now shows it on bottom of selection when multi-line + selected from top to bottom
- Selecton now can read literal multipliers for numbers on some languages (like '$5 million')
- ".00" in the end of converted price will be hidden
- Currency symbol and unit label are now colored differently than result of conversion
- Result of unit conversions is now grouped by 3 digits
- Refactored all keywords in a separate "src/data/keywords.js" file

### 3.2.6
- Fixed end selection handle getting placed in top left corner sometimes
- Fix for tooltip not visible when selection goes off-screen on top (when placing tooltip over cursor)
- Other small bug fixes

### 3.2.5
- Options page now restores previously expanded sections
- Performance & small layout improvements for options page
- Enforce background color for search options tooltip
- Changed extension name

### 3.2.4
- Fixed issue with tooltip not showing up on triple click
- Disabled accordion-like animation on custom search panel reveal
- Added config to exclude domains for 'Snap selection to words' function
- Tooltip now will not be recreated when user clicks on link or button - and there's selected text somewhere else on page

### 3.2.3
- Small layout fixes and improvements

### 3.2.2
- Fix for text field tooltip not showing up
- Text field tooltip now has 'Paste' button, when text field is empty
- Layout fixes on some websites
- Performance improvements & security optimization

### 3.2.1
- Fixed issue with tooltip being mispositioned on some websites
- Tooltip now is always hidden on scroll
- Layout fixes

### 3.2.0
- Fixed issue with custom search options not being moved down when no space on top
- Added small outline to panels for better clarity on darker background

### 3.1.9
- Fixed icons being too big on some websites
- Tooltip should now be accessible immediately after main page contents loaded
- Hovered button background no longer overlaps with button separator
- Fixed border radius for first/last custom search buttons in vertical layout

### 3.1.8
- Added missing 'Call' icon
- Custom search options with no URL added get hidden now
- Fixed too small extension pop-up height on Firefox
- Custom search options are now horizontal by default
- Improved options page and translations

### 3.1.7
- Changed icons to material from Google - now all icons are better standardized in size and opacity
- Reduced extension size twice by removing old icons + improved performance
- Improved extension pop-up (it no longer has unwanted bottom padding in some browsers)

### 3.1.6
- Fixes for some custom search URLs not working
- Implemented new option 'Horizontal alignment of tooltip'
- Disabled tooltip recreation on selection change, as it caused issues on some websites
- Improved 'move tooltip up when website has its own' feature

### 3.1.5
- Tooltip now respects events when selection is changed from outside (for example by keyboard shortcut)
- Possible fix for search options tooltip being too low sometimes
- Improved selection handles logic
- Reduced CPU load
- 'Move up' is now default tooltip reveal effect
- Small layout and design improvements

### 3.1.4
- Fix for unit conversion not working after latest update

### 3.1.3
- Implemented 'Convert time' button
- Selecton is capable now of converting asterisk punctuation for feet/inches (like 6'5")
- Now code to check selected text for matches will run asynchronously, which should improve overall snappiness of the tooltip
- "Live translation" button no longer breaks code to shift tooltip when colliding with side edges
- All Selecton overlays are now hidden when the whole window is resized, because old dx/dy positions for them lose any sense - better solution would be to recalculate them
- Small layout fixes and improvements

### 3.1.1
- Snapping selection by word now is disabled when selection changed by drag handle
- Improved stability
- Added 'bold' and 'italic' buttons for input fields, which should work for inputs on all websites (only Latin alphabet supported)

### 3.1.0
- Custom search buttons are now aligned to end when reverse buttons order enabled
- Added option to change translation service
- Small layout fixes and improvements
- Improved overall extension stability

### 3.0.9
- Fix for search tooltip going off-screen on top when there's not enough space
- Improvements for links detection

### 3.0.8
- Fix for 'Add new search button' being inaccessible for old users
- Small fixes for options and popup layout

### 3.0.7
- Implemented ability to change custom search engines titles
- Implemented %w placeholder for current domain (for website search)
- Fixed bug with search queries ignoring the "&" symbol
- Fix for tooltip being hidden when CTRL key is pressed to move drag handle precisely
- Fix for drag handle not adapting to magnetic selection on release
- Fix for text field buttons borders in 'reverse buttons order' mode
- Added fallback URL to fetch custom search buttons favicons

### 3.0.6
- Implemented live translation of selected text (up to 3 words)
- Implemented 'inverse order of the buttons' feature
- Improved number detection for currency and unit conversion
- Reduced load on resources
- Many bug fixes and improvements

### 3.0.5
- Fix for settings crash on first install
- Implemented 'font size' setting
- Tooltip now gets hidden on URL change

### 3.0.4
- Added new vertical mode for custom search options
- Fix for custom search tooltip 'add new' layout bug
- Improvements for popup window design
- Refactored extension configs for better maintainability
- Custom search options settings redesigned to make it more clear that extension uses Google icons by default
- Logo became slightly sharper
- Other small fixes and improvements

### 3.0.3
- Fixed bugs for custom styling
- Changed default background color to a lighter one
- Added option to change currency rates update interval

### 3.0.2
- Changed keyboard listener so that it will interfere less with website listeners
- Small improvements for reveal animation

### 3.0.1
- Bug fix for custom search buttons
- Changed default URL for Wikipedia search
- Bug fix for 'move up' reveal animation - now tooltip is not interactive in the first half of animation duration (when 'move up' effect is selected)


### 3.0.0
**New:**
- Implemented new "Snap selection by words" functionality (disabled while CTRL key is being held)
- Implemented 3 options for tooltip reveal animation
- Added settings toggle to override website's text selection color
- Added setting for text selection background opacity

**Bug fixes and improvements:**
- Middle click on any button now will open link in background tab
- Fix for Firefox "pop-up was blocked" issue on clicking Search button
- Improvements for selection handlers - single click now extends selection by one word in direction of handle

**General:**
- Refactored project for better readability
- New approach to horizontally center the selection tooltip between selection boundaries, instead of relying on overall selection rect
- Restructured settings page for better consistency

### 2.1.9
- Improvements for secondary search tooltip when 'Icon only' style is activated
- Other small improvements for 'Icon only' style
- Added support for NOK (Norwegian krone) currency
- Added ability to turn on selection handles (experimental)

### 2.1.8
- Fix for tooltip being moved up on some websites
- Added only-icon button style in settings + changed map icon
- Fixed bug with tooltip blinking when clicked on 'Copy' too fast
- Implemented collapsible headers in settings
- Added settings switch for debug mode
- Small bug fixes

### 2.1.7
- Quick fix for tooltip being invisible on some websites (such as Reddit)
- Improved moving up tooltip when website has its own
- More UTF-8 encoding fixes (happens with Chrome on Windows)

### 2.1.4
- Fix moving tooltip up on some websites (Pikabu)
- Possible fix for UTF-8 encoding (Google Translate)
- Added Ukrainian translation and small translation fixes for other languages
- Various small fixes

### 2.1.3
- Added scale-up animation on tooltip reveal (can be disabled in settings)
- Implemented ability to disable showing unconverted value in convert buttons
- Implemented currency selection dropdown in settings
- Improved currency recognition for some currencies
- Implemented special handling for prices where comma separates fractional digits instead of thousandths
- Added Portuguese translation (from Google Translate)

### 2.1.2
- Implemented custom icon field for the custom search buttons
- Added 'Phone' button for phone numbers, which triggers default call handler in system on click
- Improvements for buttons appearance

### 2.1.1
- Layout improvements on some websites
- Implemented 'Excluded domains' option in settings for blacklisting websites
- Fixed French translation file causing extension to fail during installation
- Other small bug fixes

### 2.1.0
- (!) Implemented custom search buttons feature (revealed on hover over Search button)
- Added CSS color preview contextual button
- Added ability to change maps service for 'Show on map' contextual button
- Tooltip is now shifted if being opened too close to the screen edge
- Fixes for 'Restore defaults' button
- Fix for 'Translate' button being added twice sometimes
- Small bug fixes and improvements

### 2.0.9
- Implemented email button
- Implemented 'Custom' search engine option
- Created list of currently supported currencies in README
- Updated translations

### 2.0.8
- Implemented button 'Show on map' (Google Maps)
- Improvements for 'open link' button

### 2.0.7
- Added German, French and Spanish translations (via Google Translate)
- Possible fix for bug on Jira when tickets were not open on click
- Added option to hide tooltip on key press
- Small fixes and code cleanup

### 2.0.6
- Fixed wrong currency rates for some currencies
- Centered arrow horizontally more precisely
- Added more search engines

### 2.0.5
- Added ability to change search engine
- Fixed 'Remove selection on button click' not working

### 2.0.4
- Implemented dynamic light/dark foreground
- Bug fixes

### 2.0.3
- Tooltip now gets hidden on any keystrokes
- Mouse hover always brings tooltip opacity to 1.0

### 2.0.1 - 2.0.2
- Bug fixes

### 2.0
- New extension name and icon
- Implemented textfield-specific actions (can be disabled from settings)
- Added ability to remove text selection on tooltip's button click
- Workarounds for websites that override tooltip's styling 
- Implemented ability to drag tooltip by the arrow
- Implemented ability to shift tooltip up when website has its own selection tooltip (supports Medium and websites with similar tooltip)
- Added ability to display icons for buttons
- Implemented pop-up menu with settings
- Bug fixes and improvements

### 1.1.5
- Implemented default language, currency and metrics set according to browser locale
- Implemented settings to configure text selection color

### 1.1
- Refactored currency conversion
- Added customization options in settings
- Various bug fixes and improvements

### 1.0
Initial version