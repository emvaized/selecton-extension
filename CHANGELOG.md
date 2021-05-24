#3.1.7
- Changed icons to material from Google - now all icons are standartized in size and opacity
- Reduced extension size twice by removing old icons + improved performance
- Improved pop-up (it no longer has unwanted bottom padding in some browsers)

#3.1.6
- Fixes for some custom search urls not working
- Implemented new option 'Horizontal alignment of tooltip'
- Disabled tooltip recreation on selection change, as it caused issues on some websites
- Improved 'move tooltip up when website has it's own' feature

#3.1.5
- Tooltip now respects events when selection is changed from outside (for example by keyboard shortcut)
- Possible fix for search options tooltip being too low sometimes
- Improved selection handles logic
- Reduced CPU load
- 'Move up' is now default tooltip reveal effect
- Small layout and design improvements

#3.1.4
- Fix for unit conversion not working after latest update

#3.1.3
- Implemented 'Convert time' button
- Selecton is capable now of converting astrix punctuation for feet/inches (like 6'5")
- Now code to check selected text for matches will run asynchronously, which should improve overall snapiness of the tooltip
- "Live translation" button no longer breaks code to shift tooltip when colliding with side edges
- All Selecton overlays are now hidden when whole window is resized, because old dx/dy positions for them loose any sense - better solution would be to recalculate them
- Small layout fixes and improvements

#3.1.1
- Snapping selection by word now is disabled when selection changed by drag handle
- Improved stability
- Added 'bold' and 'italic' buttons for input fields, which should work for inputs on all websites (only latin alphabet supported)

#3.1.0
- Custom search buttons are now aligned to end when reverse buttons order enabled
- Added option to change translation service
- Small layout fixes and improvements
- Improved overall extension stability

#3.0.9
- Fix for search tooltip going off-screen on top when there's no enough space
- Improvements for links detection

#3.0.8
- Fix for 'Add new search button' being unaccessible for old users
- Small fixes for options and popup layout

#3.0.7
- Implemented ability to change custom search engines titles
- Implemented %w placeholder for current domain (for website search)
- Fixed bug with search queries ingoring the "&" symbol
- Fix for tooltip being hidden when CTRL key is pressed to move drag handle precisely
- Fix for drag handle not adapting to magnetic selection on release
- Fix for textfield buttons borders in 'reverse buttons order' mode
- Added fallback url to fetch custom search buttons favicons

#3.0.6
- Implemented live translation of selected text (up to 3 words)
- Implemented 'inverse order of the buttons' feature
- Improved number detection for currency and unit conversion
- Reduced load on resources
- Many bug fixes and improvements

#3.0.5
- Fix for settings crash on first install
- Implemented 'font size' setting
- Tooltip now gets hidden on url change

#3.0.4
- Added new vertical mode for custom search options
- Fix for custom search tooltip 'add new' layout bug
- Improvements for popup window design
- Refactored extension configs for better maintainability
- Custom search options settings redesigned to make it more clear that extension uses Google icons by default
- Logo became slightly sharper
- Other small fixes and improvements

#3.0.3
- Fixed bugs for custom styling
- Changed default background color to a lighter one
- Added option to change currency rates update interval

#3.0.2
- Changed keyboard listener so that it will less interfere with website listeners
- Small improvements for reveal animation

#3.0.1
- Bug fix for custom search buttons
- Changed default URL for Wikipedia search
- Bug fix for 'move up' reveal animation - now tooltip is not interactive in first half of animation duration (when 'move up' effect is selected)


#3.0.0
New:
- Implemented new "Snap selection by words" functionality (disabled while CTRL key is being held)
- Implemented 3 options for tooltip reveal animation
- Added settings toggle to override website's text selection color
- Added setting for text selection background opacity

Bug fixes and improvements:
- Middle click on any button now will open link in background tab
- Fix for Firefox "pop-up was blocked" issue on clicking Search button
- Improvements for selection handlers - single click now extends selection by one word in direction of handle

General:
- Refactored project for better readability
- New approach to horizontally center the selection tooltip between selection boundaries, instead of relying on overall selection rect
- Restructured settings page for better consistency


#2.1.9
- Improvements for secondary search tooltip when 'Icon only' style is activated
- Other small improvements for 'Icon only' style
- Added support for NOK (Norwegian krone) currency
- Added ability to turn on selection handles (experimental)

#2.1.8
- Fix for tooltip being moved up on some websites
- Added only-icon button style in settings + changed map icon
- Fixed bug with tooltip blinking when clicked on 'Copy' too fast
- Implemented collapsible headers in settings
- Added settings switch for debug mode
- Small bug fixes

#2.1.7
- Quick fix for tooltip being invisible on some websites (such as Reddit)
- Improved moving up tooltip when website has it's own
- More UTF-8 encoding fixes (happens with Chrome on Windows)

#2.1.4
- Fix moving tooltip up on some websites (Pikabu)
- Possible fix for UTF-8 encoding (Google Translate)
- Added Ukrainian translation and small translation fixes for other languages
- Various small fixes

#2.1.3
- Added scale-up animation on tooltip reveal (can be disabled in settings)
- Implemented ability to disable showing unconverted value in convert buttons
- Implemented currency selection dropdown in settings
- Improved currency recognition for some currencies
- Implemented special handling for prices where coma separates fractional digits instead of thousandths
- Added Portuguese translation (from Google Translate)

#2.1.2
- Implemented custom icon field for the custom search buttons
- Added 'Phone' button for phone numbers, which triggers default call handler in system on click
- Impovements for buttons appearance

#2.1.1
- Layout improvements on some websites
- Implemented 'Excluded domains' option in settings for blacklisting websites
- Fixed French translation file causing extension to fail during installation
- Other small bug fixes

#2.1.0
- (!) Implemented custom search buttons feature (revealed on hover over Search button)
- Added CSS color preview contextual button
- Added ability to change maps service for 'Show on map' contextual button
- Tooltip is now shifted if being open too close to the screen edge
- Fixes for 'Restore defaults' button
- Fix for 'Translate' button being added twice sometimes
- Small bug fixes and improvements

#2.0.9
- Implemented email button
- Implemented 'Custom' search engine option
- Created list of currently supported currencies in README
- Updated translations

#2.0.8
- Implemented button 'Show on map' (Google Maps)
- Improvements for 'open link' button

#2.0.7
- Added German, French and Spanish translations (via Google Translate)
- Possible fix for bug on Jira when tickets were not open on click
- Added option to hide tooltip on key press
- Small fixes and code cleanup

#2.0.6
- Fixed wrong currency rates for some currencies
- Centered arrow horizontally more precisely
- Added more search engines

#2.0.5
- Added ability to change search engine
- Fixed 'Remove selection on button click' not working

#2.0.4
- Implemented dynamic light/dark foreground
- Bug fixes

#2.0.3
- Tooltip now gets hidden on any keystrokes
- Mouse hover always brings tooltip opacity to 1.0

#2.0.1 - 2.0.2
- Bug fixes

#2.0
- New extension name and icon
- Implemented textfield-specific actions (can be disabled from settings)
- Added ability to remove text selection on tooltip's button click
- Workarounds for websites that override tooltip's styling 
- Implemented ability to drag tooltip by the arrow
- Implemented ability to shift tooltip up when website has it's own selection tooltip (supports Medium and websites with similar tooltip)
- Added ability to display icons for buttons
- Implemented pop-up menu with settings
- Bug fixes and improvements

#1.1.5
- Implemented default language, currency and metrics set according to browser locale
- Implemented settings to configure text selection color

#1.1
- Refactored currency conversion
- Added customization options in settings
- Various bug fixes and improvements

#1.0
Initial version





















