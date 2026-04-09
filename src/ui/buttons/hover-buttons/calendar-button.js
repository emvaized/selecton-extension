function checkToAddCalendarButton(text) {
    let weekday, day, month, year, time;
    let mayBeDate = false, showDateInsteadOfWeekday = false;

    const todayDate = new Date();

    /// Check for "tomorrow"
    const tomorrowMatch = text.match(dateKeywordsRegex.tomorrow);
    if (tomorrowMatch) {
        const tomorrow = new Date(todayDate.getTime() + (24 * 60 * 60 * 1000));
        // Fix index mapping: JS getDay() starts Sunday=0, dateKeywords starts Monday=0
        let dayIndex = tomorrow.getDay() === 0 ? 6 : tomorrow.getDay() - 1;
        weekday = dateKeywords.weekday[dayIndex];
        mayBeDate = true;
        showDateInsteadOfWeekday = true;
        day = tomorrow.getDate();
        month = dateKeywords.month[tomorrow.getMonth()];
    }

    /// Check for month
    if (!month && !tomorrowMatch) {
        const monthMatch = text.match(dateKeywordsRegex.month);
        if (monthMatch) {
            let matchedPrefix = monthMatch[1].toLowerCase();
            let index = dateKeywords.month.findIndex(m => matchedPrefix.startsWith(m.toLowerCase()));
            if (index !== -1) month = dateKeywords.month[index % 12];
        }
    }

    /// Check for weekday
    if (!weekday && !tomorrowMatch) {
        const weekdayMatch = text.match(dateKeywordsRegex.weekday);
        if (weekdayMatch) {
            let matchedWeekday = weekdayMatch[1].toLowerCase();
            let index = dateKeywords.weekday.findIndex(w => w.toLowerCase() === matchedWeekday);
            if (index !== -1) {
                weekday = dateKeywords.weekday[index % 7];
                mayBeDate = true;
            }
        }
    }

    /// Check for time (e.g. 10:30, 2:15pm, 14:00)
    const timeRegex = /(?:^|\s)([0-2]?[0-9]:[0-5][0-9](?::[0-5][0-9])?)(?:\s?(am|pm))?(?:$|[^a-z0-9:])/i;
    const timeMatch = text.match(timeRegex);
    if (timeMatch) {
        time = timeMatch[1];
        if (timeMatch[2]) time += ' ' + timeMatch[2]; // attach am/pm
        // Standardize representation length for parsing
        if (time.split(':').length == 2 && !timeMatch[2]) time += ':00';
    }

    // Remove the matched time portion to prevent numeric hours/minutes from being confused as days/years
    let textWithoutTime = text;
    if (timeMatch) textWithoutTime = textWithoutTime.replace(timeMatch[0], ' ');

    // Check for year
    const yearRegex = /(?:^|[^\d])(19\d{2}|20\d{2})(?:$|[^\d])/;
    const yearMatch = textWithoutTime.match(yearRegex);
    if (yearMatch) {
        year = yearMatch[1];
        if (month) mayBeDate = true;
    }

    // Check for day of the month
    const dayRegex = /(?:^|[^\d])(0?[1-9]|[12][0-9]|3[01])(?:st|nd|rd|th)?(?:$|[^a-z0-9])/ig;
    let dayMatches = [...textWithoutTime.matchAll(dayRegex)];
    for (let m of dayMatches) {
        let valStr = m[1];
        // Ensure the day isn't mistakenly identical to the extracted year
        if (valStr !== year) {
            day = valStr;
            mayBeDate = true;
            break;
        }
    }

    if (!mayBeDate) {
        /// If no success, try to parse string as date
        if (text.includes('/')) {
            const parsedDate = new Date(text);
            if (isNaN(parsedDate)) return;
            addCalendarButtonFromDate(parsedDate, todayDate, showDateInsteadOfWeekday);
            return;
        } else if (text.includes('.')) {
            const parts = text.split('.');
            const partsLength = parts.length;

            if (partsLength >= 2 && partsLength <= 3) {
                let d = parts[0], m = parts[1], y = partsLength < 3 ? todayDate.getFullYear() : parts[2];
                if (d == '' || m == '') return;
                if (parseInt(d) == 0) return;
                if (y.length < 2) return;

                const parsedDate = new Date(`${y}/${m}/${d}`);
                if (isNaN(parsedDate)) return;
                addCalendarButtonFromDate(parsedDate, todayDate, showDateInsteadOfWeekday);
            }

            return;
        } else return;
    }

    /// fill non found data
    if (!year) year = todayDate.getFullYear();
    if (!month && !day && weekday) {
        let date = new Date(), daytoset = dateKeywords.weekday.indexOf(weekday);
        let currentDay = date.getDay();
        let distance = (daytoset + 7 - currentDay) % 7;
        date.setDate(date.getDate() + distance);
        month = dateKeywords.month[date.getMonth()];
        day = date.getDate() + 1;
        // showDateInsteadOfWeekday = true;
    }

    /// gather collected data
    /// format: Wed, 09 Aug 1995 00:00:00 GMT'
    let dateString = '';
    if (weekday) dateString += `${weekday}, `;
    if (day) dateString += `${day} `;
    if (month) dateString += `${month} `;
    if (year) dateString += `${year} `;
    if (time) dateString += `${time} `;


    const returnedDate = new Date(Date.parse(dateString));
    if (isNaN(returnedDate)) return;

    addCalendarButtonFromDate(returnedDate, todayDate, showDateInsteadOfWeekday, time);
}


function addCalendarButtonFromDate(date, todayDate, showDateInsteadOfWeekday, time) {
    /// get difference in days
    const diffTime = todayDate - date;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) * -1;
    let buttonLabel;

    if (showDateInsteadOfWeekday) {
        buttonLabel = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
    } else {
        if (diffDays <= -360) {
            const years = -1 * Math.ceil(diffDays / 360);
            buttonLabel = years == 1 ? chrome.i18n.getMessage('yearAgo') : chrome.i18n.getMessage('yearsAgo', `${years}`);
        } else if (diffDays < -30 && diffDays > -360) {
            const months = -1 * Math.ceil(diffDays / 30);
            buttonLabel = months == 1 ? chrome.i18n.getMessage('monthAgo') : chrome.i18n.getMessage('monthsAgo', `${months}`);
        } else if (diffDays < 0 && diffDays >= -30) {
            const days = -1 * diffDays;
            buttonLabel = days == 1 ? chrome.i18n.getMessage('dayAgo') : chrome.i18n.getMessage('daysAgo', `${days}`);
        } else if (diffDays == 0) {
            buttonLabel = chrome.i18n.getMessage('today');
        } else if (diffDays > 0 && diffDays < 30) {
            buttonLabel = diffDays == 1 ? chrome.i18n.getMessage('inDay') : chrome.i18n.getMessage('inDays', `${diffDays}`);
        } else if (diffDays >= 29 && diffDays < 360) {
            const months = Math.floor(diffDays / 30);
            buttonLabel = months == 1 ? chrome.i18n.getMessage('inMonth') : chrome.i18n.getMessage('inMonths', `${months}`);
        } else if (diffDays >= 360) {
            const years = Math.floor(diffDays / 360);
            buttonLabel = years == 1 ? chrome.i18n.getMessage('inYear') : chrome.i18n.getMessage('inYears', `${years}`);
        } else {
            buttonLabel = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
        }
    }

    /// If specific time is provided, create event – otherwise open day in calendar
    let calendarLink;
    if (time) {
        let dateString = date.toISOString().replaceAll(':', '').replaceAll('-', '');
        calendarLink = `https://calendar.google.com/calendar/u/0/r/eventedit?&dates=${dateString}/${dateString}&sf=true`;
    } else {
        calendarLink = `https://calendar.google.com/calendar/u/0/r/day/${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
    }
    const dateButton = addLinkTooltipButton(buttonLabel, calendarIcon, calendarLink);
    dateButton.title = date.toLocaleDateString();
    dateButton.classList.add('color-highlight');

    if (configs.buttonsStyle == 'onlyicon') dateButton.innerHTML += ' ' + buttonLabel;
}