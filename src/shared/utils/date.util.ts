/**
 * Converts a date from GMT±X to UTC
 * @param date - Date object or ISO date string interpreted as GMT±X
 * @param gmtOffsetHours - timezone offset in hours (e.g. +5, -3)
 * @returns UTC Date
 */
export function gmtToUTC(date: Date | string, gmtOffsetHours: number): Date {
	console.log(date, '\n', gmtOffsetHours)
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
