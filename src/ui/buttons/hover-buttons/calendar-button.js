function checkToAddCalendarButton(text) {
    let weekday, day, month, year, time;
    let mayBeDate = false, showDateInsteadOfWeekday = false;

    const words = text.toLowerCase().split(' ');
    const todayDate = new Date();

    loop:
    for (let i = 0, n = words.length; i < n; i++) {
        const word = words[i];

        /// month
        for (j in dateKeywords.month) {
            const mon = dateKeywords.month[j];
            if (word.includes(mon)) {
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

    addCalendarButtonFromDate(returnedDate, todayDate, showDateInsteadOfWeekday);
}


function addCalendarButtonFromDate(date, todayDate, showDateInsteadOfWeekday) {
    /// get difference in days
    const diffTime = todayDate - date;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) * -1;
    let buttonLabel;

    if (showDateInsteadOfWeekday) {
        buttonLabel = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
    } else
        if (diffDays < -360) {
            buttonLabel = `${-1 * Math.ceil(diffDays / 360)} years ago`;
        } else if (diffDays < -30 && diffDays > -360) {
            buttonLabel = `${-1 * Math.ceil(diffDays / 30)} months ago`;
        } else if (diffDays < 0 && diffDays >= -30) {
            buttonLabel = `${-1 * diffDays} days ago`;
        } else if (diffDays == 0) {
            buttonLabel = 'Today';
        } else if (diffDays > 0 && diffDays < 30) {
            buttonLabel = `In ${diffDays} days`;
        } else if (diffDays >= 29 && diffDays < 360) {
            buttonLabel = `In ${Math.floor(diffDays / 30)} months`;
        } else {
            buttonLabel = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
        }

    const dateButton = addBasicTooltipButton(buttonLabel, calendarIcon, function (e) {
        onTooltipButtonClick(e, `https://calendar.google.com/calendar/u/0/r/day/${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`);
    });
    dateButton.title = date.toLocaleDateString();
    dateButton.classList.add('color-highlight');

    if (configs.buttonsStyle == 'onlyicon') dateButton.innerHTML += ' ' + buttonLabel;
}