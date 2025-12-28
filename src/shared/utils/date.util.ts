/**
 * Converts a date from GMT±X to UTC
 * @param date - Date object or ISO date string interpreted as GMT±X
 * @param gmtOffsetHours - timezone offset in hours (e.g. +5, -3)
 * @returns UTC Date
 */
export function gmtToUTC(date: Date | string, gmtOffsetHours: number): Date {
	const d: Date = date instanceof Date ? date : new Date(date)

	if (Number.isNaN(d.getTime())) {
		throw new Error('Invalid date input')
	}

	const offsetMs: number = gmtOffsetHours * 60 * 60 * 1000
	return new Date(d.getTime() - offsetMs)
}

/**
 * Converts a UTC date to GMT±X
 * @param utcDate - UTC Date object or ISO date string
 * @param gmtOffsetHours - timezone offset in hours (e.g. +5, -3)
 * @returns Date in GMT±X
 */
export function utcToGMT(utcDate: Date | string, gmtOffsetHours: number): Date {
	const d: Date = utcDate instanceof Date ? utcDate : new Date(utcDate)

	if (Number.isNaN(d.getTime())) {
		throw new Error('Invalid date input')
	}

	const offsetMs: number = gmtOffsetHours * 60 * 60 * 1000
	return new Date(d.getTime() + offsetMs)
}

/**
 * Formats reminder times into a human-readable string
 * @param reminderTimes - array of Date objects
 * @returns formatted string separated by new lines
 */
export function formatReminderTimes(reminderTimes: Date[]): string {
	return reminderTimes
		.map((time: Date) => new Date(time).toLocaleString())
		.join('\n')
}

/**
 * Gets the nearest Monday at 00:00:00 in local timezone, then converts to UTC
 * @param gmtOffsetHours - timezone offset in hours (e.g. +5, -3)
 * @returns Date of nearest Monday 00:00:00 in UTC
 */
export function getNearestMonday(gmtOffsetHours: number): Date {
	const now = new Date()

	// Get UTC components
	const utcYear = now.getUTCFullYear()
	const utcMonth = now.getUTCMonth()
	const utcDate = now.getUTCDate()
	const utcHour = now.getUTCHours()
	const utcDay = now.getUTCDay()

	// Calculate local time components (UTC + offset)
	// This tells us what time it is in the target timezone
	let localHour = utcHour + gmtOffsetHours
	let localDate = utcDate
	let localDay = utcDay

	// Adjust for day boundary crossing
	if (localHour >= 24) {
		localHour -= 24
		localDate += 1
		localDay = (localDay + 1) % 7
	} else if (localHour < 0) {
		localHour += 24
		localDate -= 1
		localDay = (localDay - 1 + 7) % 7
	}

	// Calculate days until next Monday in local timezone
	let daysUntilMonday: number
	if (localDay === 0) {
		// Sunday -> Monday is 1 day
		daysUntilMonday = 1
	} else if (localDay === 1) {
		// Monday -> next Monday is 7 days
		daysUntilMonday = 7
	} else {
		// Tuesday-Saturday: (8 - localDay) gives days until next Monday
		daysUntilMonday = 8 - localDay
	}

	// Calculate Monday 00:00:00 in local timezone, then convert to UTC
	// Monday 00:00:00 in GMT+X = Monday date at (00:00 - X) hours in UTC
	// If X is positive, this means previous day in UTC

	// First, create a date representing the current local date
	// We'll use Date.UTC to create a date, then add days to it
	const currentLocalDateUTC = new Date(
		Date.UTC(utcYear, utcMonth, localDate, 0, 0, 0, 0)
	)

	// Add days until Monday (this handles month/year boundaries automatically)
	const mondayLocalDateUTC = new Date(currentLocalDateUTC)
	mondayLocalDateUTC.setUTCDate(
		currentLocalDateUTC.getUTCDate() + daysUntilMonday
	)

	// Now we need to set it to 00:00:00 in local timezone, which is -offset in UTC
	const utcHourForMonday = -gmtOffsetHours

	// Adjust for negative hours (previous day in UTC)
	if (utcHourForMonday < 0) {
		mondayLocalDateUTC.setUTCDate(mondayLocalDateUTC.getUTCDate() - 1)
		mondayLocalDateUTC.setUTCHours(24 + utcHourForMonday, 0, 0, 0)
	} else {
		mondayLocalDateUTC.setUTCHours(utcHourForMonday, 0, 0, 0)
	}

	return mondayLocalDateUTC
}
