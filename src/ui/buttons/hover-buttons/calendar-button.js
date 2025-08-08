function checkToAddCalendarButton(text) {
    let weekday, day, month, year, time;
    let mayBeDate = false, showDateInsteadOfWeekday = false;

    const words = text.toLowerCase().split(' ');
    const todayDate = new Date();

    loop:
    for (let i = 0, n = words.length; i < n; i++) {
        const word = words[i].replaceAll(',','');

        /// month
        for (j in dateKeywords.month) {
            const mon = dateKeywords.month[j];
            // if (word.includes(mon)) {
            if (word.startsWith(mon) || word.endsWith(mon)) {
                month = dateKeywords.month[j % 12];
                // mayBeDate = true;
                continue loop;
            }
        }

        /// weekday
        for (j in dateKeywords.weekday) {
            const weekd = dateKeywords.weekday[j];
            if (word.includes(weekd)) {
                weekday = dateKeywords.weekday[j % 7];
                mayBeDate = true;
                continue loop;
            }
        }

        /// check for 'tomorrow' keywords
        for (j in dateKeywords.tomorrow) {
            const tomorrowKeyword = dateKeywords.tomorrow[j];
            if (word.includes(tomorrowKeyword)) {
                const tomorrow = new Date(new Date().getTime() + (24 * 60 * 60 * 1000));
                weekday = dateKeywords.weekday[tomorrow.getDay()];
                day = tomorrow.getDate();
                month = dateKeywords.month[todayDate.getMonth()];
                mayBeDate = true;
                showDateInsteadOfWeekday = true;
                continue loop;
            }
        }

        const wordLength = word.length;
        const wordIsNumeric = isStringNumeric(word);

        /// check for day of month
        if (wordIsNumeric && wordLength >= 1 && wordLength < 3) {
            /// don't use if it's time in 12-hour format
            const nextWord = words[i + 1];
            if (nextWord && (nextWord.toLowerCase() == 'am' || nextWord.toLowerCase() == 'pm'))
                continue;

            if (day && !year) year = word;
            else {
                day = word;
                mayBeDate = true;
            }
            continue;
        }

        /// check for year
        if (wordIsNumeric && wordLength == 4) {
            year = word;
            if (month) mayBeDate = true;
            continue;
        }

        /// check for time
        if (word.includes(':')) {
            time = word;
            if (time.split(':').length == 2) time += ':00';
            continue;
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